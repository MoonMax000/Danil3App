import fetch from 'node-fetch';
import { ChatMessage } from '../types/ai-types';

/**
 * Groq AI Service
 * Fast and FREE AI inference using Llama models
 */
export class GroqAIService {
  private apiKey: string;
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  
  // Best Groq models for financial questions
  private model = 'llama-3.3-70b-versatile'; // Latest and most capable model
  
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  GROQ_API_KEY not found in environment variables');
      console.warn('Get your free API key at: https://console.groq.com/keys');
    } else {
      console.log('✅ Groq AI Service initialized');
    }
  }

  /**
   * Generate AI response using Groq
   */
  async generateResponse(userMessage: string, chatHistory: ChatMessage[] = []): Promise<{
    content: string;
    sources: Array<{ title: string; url?: string; description?: string }>;
  }> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      // Build conversation history
      const messages = [
        {
          role: 'system',
          content: `You are a financial market expert assistant. Provide structured information about stocks, cryptocurrencies, market trends, and investment strategies.

CRITICAL FORMATTING RULES:
- Break intro into MULTIPLE SHORT PARAGRAPHS (2-3 sentences each)
- Separate each paragraph with a blank line (double newline)
- Use BULLET POINTS extensively for detailed information
- End with a "Summary:" section with 3-5 bullet points starting with •

RESPONSE STRUCTURE:
1. First paragraph (2-3 sentences with introduction)

2. Second paragraph (2-3 sentences with background/context)

3. Third paragraph (2-3 sentences with current situation)

4. Main content as BULLET POINTS (use • for each detailed point)

5. Optional closing paragraph (2-3 sentences if needed)

Summary:

• Concise key takeaway 1
• Concise key takeaway 2
• Concise key takeaway 3

Example format:
[First paragraph: 2-3 sentences introducing the topic and grabbing attention.]

[Second paragraph: 2-3 sentences providing historical context or background information.]

[Third paragraph: 2-3 sentences explaining current situation or relevance.]

• Detailed point 1 with specific data and analysis
• Detailed point 2 with metrics and context
• Detailed point 3 with implications
• Detailed point 4 with comparative analysis
• Detailed point 5 with forward-looking insights

Summary:

• Concise key takeaway 1
• Concise key takeaway 2
• Concise key takeaway 3

CRITICAL: Use blank lines (double newlines) between paragraphs for better readability!`
        },
        ...chatHistory.slice(-6).map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 1,
          stream: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid response format from Groq');
      }

      const content = data.choices[0].message.content;

      // Generate contextual sources based on the question
      const sources = this.generateSources(userMessage);

      return {
        content,
        sources
      };

    } catch (error: any) {
      console.error('Groq AI error:', error.message);
      throw error;
    }
  }

  /**
   * Generate relevant sources based on the query
   */
  private generateSources(query: string): Array<{ title: string; url?: string; description?: string }> {
    const lowerQuery = query.toLowerCase();
    const sources = [];

    // Stock-related sources
    if (lowerQuery.includes('stock') || lowerQuery.includes('share') || 
        /tesla|tsla|nvidia|nvda|apple|aapl|microsoft|msft|amazon|amzn/i.test(query)) {
      sources.push(
        { 
          title: 'Yahoo Finance', 
          url: 'https://finance.yahoo.com',
          description: 'Real-time stock market data and financial news'
        },
        { 
          title: 'Bloomberg Markets', 
          url: 'https://www.bloomberg.com/markets',
          description: 'Global financial markets and business news'
        }
      );
    }

    // Crypto-related sources
    if (lowerQuery.includes('crypto') || lowerQuery.includes('bitcoin') || 
        lowerQuery.includes('ethereum') || lowerQuery.includes('altcoin')) {
      sources.push(
        { 
          title: 'CoinMarketCap', 
          url: 'https://coinmarketcap.com',
          description: 'Cryptocurrency prices and market data'
        },
        { 
          title: 'CoinGecko', 
          url: 'https://www.coingecko.com',
          description: 'Crypto market analysis and tracking'
        }
      );
    }

    // Investment/market sources
    if (lowerQuery.includes('invest') || lowerQuery.includes('market') || 
        lowerQuery.includes('portfolio') || lowerQuery.includes('trend')) {
      sources.push(
        { 
          title: 'Investopedia', 
          url: 'https://www.investopedia.com',
          description: 'Financial education and investment guides'
        },
        { 
          title: 'MarketWatch', 
          url: 'https://www.marketwatch.com',
          description: 'Stock market news and financial analysis'
        }
      );
    }

    // Default sources if none matched
    if (sources.length === 0) {
      sources.push(
        { 
          title: 'Financial Times', 
          url: 'https://www.ft.com',
          description: 'Global business and financial news'
        },
        { 
          title: 'CNBC Markets', 
          url: 'https://www.cnbc.com/markets',
          description: 'Business news and market updates'
        }
      );
    }

    return sources.slice(0, 3); // Return max 3 sources
  }
}

export const groqAIService = new GroqAIService();
