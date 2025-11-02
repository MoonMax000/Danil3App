import axios from 'axios';
import { AIResponse, Source } from '../types/ai-types';
import { marketDataService } from './market-data-service';
import { quoteSearchService } from './quote-search-service';

/**
 * Perplexity AI Service - Real AI with market data integration
 */
export class PerplexityAIService {
  private apiKey: string;
  private apiUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  PERPLEXITY_API_KEY not found in environment variables');
      console.warn('Get your API key at: https://www.perplexity.ai/settings/api');
    } else {
      console.log('✅ Perplexity AI Service initialized');
    }
  }

  /**
   * Generate AI response using Perplexity (compatible with Groq interface)
   */
  async generateResponse(userMessage: string, chatHistory: any[] = []): Promise<{
    content: string;
    sources: Array<{ title: string; url?: string; description?: string }>;
  }> {
    const response = await this.processMessage(userMessage, chatHistory);
    return {
      content: response.content,
      sources: response.sources || []
    };
  }

  /**
   * Process user message with Perplexity AI
   */
  async processMessage(message: string, chatHistory: any[] = []): Promise<AIResponse> {
    // If no API key, use fallback immediately
    if (!this.apiKey) {
      return this.getFallbackResponse(message);
    }

    try {
      // Enrich message with market data context if relevant
      const enrichedMessage = await this.enrichWithMarketData(message);

      // Simple message format - NO history, NO system message
      const messages: any[] = [
        {
          role: 'user',
          content: `You are a financial market expert. Provide a helpful response.

Question: ${enrichedMessage}`
        }
      ];

      // Call Perplexity API
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'sonar',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const aiContent = response.data.choices[0]?.message?.content || 'No response from AI';
      const citations = response.data.citations || [];

      // Extract sources from citations
      const sources: Source[] = citations.slice(0, 3).map((url: string, index: number) => ({
        title: `Source ${index + 1}`,
        url: url,
        description: 'Online source',
      }));

      return {
        content: aiContent,
        sources: sources.length > 0 ? sources : undefined,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error('Perplexity AI error:', error.response?.data || error.message);
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Get fallback response with market data
   */
  private async getFallbackResponse(message: string): Promise<AIResponse> {
    let fallbackContent = 'Отвечу на основе текущих рыночных данных:\n\n';
    
    try {
      const lowerMessage = message.toLowerCase();
      
      if (this.isAboutMarketLeaders(lowerMessage)) {
        const marketData = await marketDataService.getMarketLeaders('ru');
        if (marketData.data && marketData.data.length > 0) {
          const top5 = marketData.data.slice(0, 5);
          fallbackContent += `📈 **Топ-5 растущих акций:**\n\n${top5.map((s: any, i: number) => 
            `${i + 1}. **${s.name}** (${s.symbol})\n   💰 Цена: $${s.price.toFixed(2)}\n   📊 Изменение: ${s.changePercent > 0 ? '+' : ''}${s.changePercent.toFixed(2)}%`
          ).join('\n\n')}\n\n⏰ Обновлено: ${new Date().toLocaleTimeString()}`;
        }
      } else if (this.isAboutMarketLosers(lowerMessage)) {
        const marketData = await marketDataService.getMarketLosers('ru');
        if (marketData.data && marketData.data.length > 0) {
          const bottom5 = marketData.data.slice(0, 5);
          fallbackContent += `📉 **Топ-5 падающих акций:**\n\n${bottom5.map((s: any, i: number) => 
            `${i + 1}. **${s.name}** (${s.symbol})\n   💰 Цена: $${s.price.toFixed(2)}\n   📊 Изменение: ${s.changePercent.toFixed(2)}%`
          ).join('\n\n')}\n\n⏰ Обновлено: ${new Date().toLocaleTimeString()}`;
        }
      } else if (this.isAboutCrypto(lowerMessage)) {
        const cryptoData = await marketDataService.getCryptoData();
        if (cryptoData.data && cryptoData.data.length > 0) {
          const top5 = cryptoData.data.slice(0, 5);
          fallbackContent += `🪙 **Топ-5 криптовалют:**\n\n${top5.map((c: any, i: number) => 
            `${i + 1}. **${c.name}** (${c.symbol})\n   💰 Цена: $${c.price.toFixed(2)}\n   📊 Изменение за 24ч: ${c.changePercent > 0 ? '+' : ''}${c.changePercent.toFixed(2)}%`
          ).join('\n\n')}\n\n⏰ Обновлено: ${new Date().toLocaleTimeString()}`;
        }
      } else {
        // Default helpful response
        fallbackContent = `Привет! Я финансовый ассистент. 📊\n\n**Я могу помочь с:**\n\n📈 **Рыночными данными**\n• Топ растущих и падающих акций\n• Анализ конкретных тикеров\n• Рыночные индексы\n\n🪙 **Криптовалютами**\n• Текущие цены криптовалют\n• Изменения за 24 часа\n• Популярные монеты\n\n💡 **Советы**\n• Спрашивайте о конкретных акциях (например: "AAPL")\n• Запрашивайте топ акций ("лидеры рынка")\n• Интересуйтесь крипто ("покажи биткоин")\n\n🔍 **Попробуйте спросить:**\n• "Покажи топ растущих акций"\n• "Какие криптовалюты растут?"\n• "Что происходит с AAPL?"\n• "Лидеры рынка"`;
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      fallbackContent = 'Извините, возникла ошибка при получении данных. Попробуйте переформулировать вопрос.';
    }
    
    return {
      content: fallbackContent,
      sources: [],
      timestamp: new Date(),
    };
  }

  /**
   * Search for quotes with enhanced autocomplete
   */
  async searchQuotes(query: string): Promise<{
    stocks: any[];
    crypto: any[];
    matches: number;
  }> {
    return await quoteSearchService.searchQuotes(query, 10);
  }

  /**
   * Get detailed quote information
   */
  async getQuoteDetails(symbol: string): Promise<any | null> {
    return await quoteSearchService.getQuoteDetails(symbol);
  }

  /**
   * Enrich message with relevant market data
   */
  private async enrichWithMarketData(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Check if it's a search query (e.g., "найди BTC", "search for AAPL")
    if (this.isSearchQuery(lowerMessage)) {
      const searchTerm = this.extractSearchTerm(message);
      if (searchTerm) {
        const searchResults = await quoteSearchService.searchQuotes(searchTerm, 5);
        if (searchResults.matches > 0) {
          let resultsContext = '';
          
          if (searchResults.stocks.length > 0) {
            resultsContext += 'Stocks found: ' + searchResults.stocks.map((s: any) => 
              `${s.name} (${s.symbol}): $${s.price}, ${s.changePercent > 0 ? '+' : ''}${s.changePercent}%`
            ).join('; ') + '. ';
          }
          
          if (searchResults.crypto.length > 0) {
            resultsContext += 'Crypto found: ' + searchResults.crypto.map((c: any) => 
              `${c.name} (${c.symbol}): $${c.price}, ${c.changePercent > 0 ? '+' : ''}${c.changePercent}%`
            ).join('; ') + '. ';
          }
          
          return `${message}\n\n[Search results for "${searchTerm}": ${resultsContext}]`;
        }
      }
    }
    
    // Check if question is about market leaders
    if (this.isAboutMarketLeaders(lowerMessage)) {
      const marketData = await marketDataService.getMarketLeaders('ru');
      if (marketData.data && marketData.data.length > 0) {
        const top5 = marketData.data.slice(0, 5);
        const dataContext = top5.map((stock: any) => 
          `${stock.name} (${stock.symbol}): $${stock.price}, ${stock.changePercent > 0 ? '+' : ''}${stock.changePercent}%`
        ).join(', ');
        
        return `${message}\n\n[Current market data: ${dataContext}]`;
      }
    }

    // Check if question is about market losers
    if (this.isAboutMarketLosers(lowerMessage)) {
      const marketData = await marketDataService.getMarketLosers('ru');
      if (marketData.data && marketData.data.length > 0) {
        const bottom5 = marketData.data.slice(0, 5);
        const dataContext = bottom5.map((stock: any) => 
          `${stock.name} (${stock.symbol}): $${stock.price}, ${stock.changePercent}%`
        ).join(', ');
        
        return `${message}\n\n[Current market data: ${dataContext}]`;
      }
    }

    // Check if question is about crypto
    if (this.isAboutCrypto(lowerMessage)) {
      const cryptoData = await marketDataService.getCryptoData();
      if (cryptoData.data && cryptoData.data.length > 0) {
        const top5 = cryptoData.data.slice(0, 5);
        const dataContext = top5.map((crypto: any) => 
          `${crypto.name} (${crypto.symbol}): $${crypto.price}, ${crypto.changePercent > 0 ? '+' : ''}${crypto.changePercent}%`
        ).join(', ');
        
        return `${message}\n\n[Current crypto data: ${dataContext}]`;
      }
    }

    // Check for specific ticker
    const ticker = this.extractTicker(message);
    if (ticker) {
      const result = await marketDataService.searchTicker(ticker);
      if (result) {
        const data = result.data;
        const dataContext = `${data.name} (${data.symbol}): $${data.price}, ${data.changePercent > 0 ? '+' : ''}${data.changePercent}%`;
        return `${message}\n\n[Current data for ${ticker}: ${dataContext}]`;
      }
    }

    return message;
  }

  // Helper methods
  private isAboutMarketLeaders(message: string): boolean {
    const keywords = ['топ', 'лидеры', 'рост', 'лучшие', 'растущие', 'top', 'leaders', 'growth', 'gainers'];
    return keywords.some(kw => message.includes(kw));
  }

  private isAboutMarketLosers(message: string): boolean {
    const keywords = ['аутсайдеры', 'падение', 'худшие', 'падающие', 'losers', 'declining'];
    return keywords.some(kw => message.includes(kw));
  }

  private isAboutCrypto(message: string): boolean {
    const keywords = ['крипто', 'биткоин', 'эфир', 'btc', 'eth', 'crypto', 'bitcoin', 'ethereum'];
    return keywords.some(kw => message.includes(kw));
  }

  private extractTicker(message: string): string | null {
    const tickerPattern = /\b([A-Z]{2,5})\b/;
    const match = message.match(tickerPattern);
    return match ? match[1] : null;
  }

  private isSearchQuery(message: string): boolean {
    const searchKeywords = ['найди', 'найти', 'поиск', 'search', 'find', 'lookup', 'quote'];
    return searchKeywords.some(kw => message.includes(kw));
  }

  private extractSearchTerm(message: string): string | null {
    // Try to extract ticker or search term
    // First try ticker pattern
    const ticker = this.extractTicker(message);
    if (ticker) return ticker;

    // Try to extract search term after keywords
    const searchPatterns = [
      /(?:найди|найти|поиск|search|find|lookup|quote)\s+([a-zA-Z0-9]+)/i,
      /([a-zA-Z]{2,10})\s+(?:цена|price|котировка|quote)/i
    ];

    for (const pattern of searchPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }

    return null;
  }
}

export const perplexityAIService = new PerplexityAIService();
