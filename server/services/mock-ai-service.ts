import { AIResponse, KEYWORDS, Source } from '../types/ai-types';
import { marketDataService } from './market-data-service';

/**
 * Mock AI Service - умный анализ вопросов и генерация ответов на основе реальных данных
 * Легко заменяется на OpenAI/Claude в будущем
 */
export class MockAIService {
  /**
   * Process user message and generate intelligent response
   */
  async processMessage(message: string): Promise<AIResponse> {
    const lowerMessage = message.toLowerCase();
    
    // Анализ типа вопроса
    const questionType = this.detectQuestionType(lowerMessage);
    
    let content = '';
    let sources: Source[] = [];

    switch (questionType) {
      case 'market_leaders':
        const leadersData = await this.handleMarketLeaders(lowerMessage);
        content = leadersData.content;
        sources = leadersData.sources;
        break;

      case 'market_losers':
        const losersData = await this.handleMarketLosers(lowerMessage);
        content = losersData.content;
        sources = losersData.sources;
        break;

      case 'crypto':
        const cryptoData = await this.handleCrypto(lowerMessage);
        content = cryptoData.content;
        sources = cryptoData.sources;
        break;

      case 'most_active':
        const activeData = await this.handleMostActive(lowerMessage);
        content = activeData.content;
        sources = activeData.sources;
        break;

      case 'ticker_search':
        const ticker = this.extractTicker(message);
        if (ticker) {
          const tickerData = await this.handleTickerSearch(ticker);
          content = tickerData.content;
          sources = tickerData.sources;
        } else {
          content = 'Пожалуйста, укажите тикер акции или криптовалюты для поиска.';
        }
        break;

      case 'general':
      default:
        const generalData = await this.handleGeneral(message);
        content = generalData.content;
        sources = generalData.sources;
        break;
    }

    return {
      content,
      sources,
      timestamp: new Date(),
    };
  }

  /**
   * Detect question type based on keywords
   */
  private detectQuestionType(message: string): string {
    if (this.containsKeywords(message, ['топ', 'лидеры', 'рост', 'лучшие', 'растущие'])) {
      return 'market_leaders';
    }
    
    if (this.containsKeywords(message, ['аутсайдеры', 'падение', 'худшие', 'падающие', 'losers'])) {
      return 'market_losers';
    }
    
    if (this.containsKeywords(message, KEYWORDS.crypto)) {
      return 'crypto';
    }
    
    if (this.containsKeywords(message, ['активные', 'объем', 'volume', 'active'])) {
      return 'most_active';
    }
    
    // Check if message contains a ticker symbol
    if (this.hasTicker(message)) {
      return 'ticker_search';
    }
    
    return 'general';
  }

  /**
   * Handle market leaders questions
   */
  private async handleMarketLeaders(message: string): Promise<{ content: string; sources: Source[] }> {
    const country = this.extractCountry(message);
    const marketData = await marketDataService.getMarketLeaders(country);
    
    if (!marketData.data || marketData.data.length === 0) {
      return {
        content: 'К сожалению, не удалось получить данные о лидерах рынка. Попробуйте позже.',
        sources: [],
      };
    }

    const top5 = marketData.data.slice(0, 5);
    let content = `Топ-5 лидеров роста на ${country === 'ru' ? 'российском' : 'мировом'} рынке:\n\n`;
    
    top5.forEach((stock: any, index: number) => {
      const formatted = marketDataService.formatStockData(stock);
      content += `${index + 1}. ${formatted}\n`;
    });

    content += `\nЭти компании показывают наибольший рост в текущей торговой сессии. Данные обновляются в реальном времени.`;

    return {
      content,
      sources: [{
        title: marketData.source,
        description: 'Real-time market data',
      }],
    };
  }

  /**
   * Handle market losers questions
   */
  private async handleMarketLosers(message: string): Promise<{ content: string; sources: Source[] }> {
    const country = this.extractCountry(message);
    const marketData = await marketDataService.getMarketLosers(country);
    
    if (!marketData.data || marketData.data.length === 0) {
      return {
        content: 'К сожалению, не удалось получить данные об аутсайдерах рынка.',
        sources: [],
      };
    }

    const bottom5 = marketData.data.slice(0, 5);
    let content = `Топ-5 аутсайдеров на ${country === 'ru' ? 'российском' : 'мировом'} рынке:\n\n`;
    
    bottom5.forEach((stock: any, index: number) => {
      const formatted = marketDataService.formatStockData(stock);
      content += `${index + 1}. ${formatted}\n`;
    });

    content += `\nЭти акции показывают наибольшее падение в текущей торговой сессии.`;

    return {
      content,
      sources: [{
        title: marketData.source,
        description: 'Real-time market data',
      }],
    };
  }

  /**
   * Handle crypto questions
   */
  private async handleCrypto(message: string): Promise<{ content: string; sources: Source[] }> {
    const cryptoData = await marketDataService.getCryptoData();
    
    if (!cryptoData.data || cryptoData.data.length === 0) {
      return {
        content: 'К сожалению, не удалось получить данные о криптовалютах.',
        sources: [],
      };
    }

    const top5 = cryptoData.data.slice(0, 5);
    let content = 'Топ-5 криптовалют по капитализации:\n\n';
    
    top5.forEach((crypto: any, index: number) => {
      const formatted = marketDataService.formatCryptoData(crypto);
      content += `${index + 1}. ${formatted}\n`;
    });

    content += `\nДанные о криптовалютах обновляются в реальном времени.`;

    return {
      content,
      sources: [{
        title: cryptoData.source,
        description: 'Live cryptocurrency market data',
      }],
    };
  }

  /**
   * Handle most active stocks
   */
  private async handleMostActive(message: string): Promise<{ content: string; sources: Source[] }> {
    const country = this.extractCountry(message);
    const marketData = await marketDataService.getMostActive(country);
    
    if (!marketData.data || marketData.data.length === 0) {
      return {
        content: 'Не удалось получить данные о наиболее активных акциях.',
        sources: [],
      };
    }

    const top5 = marketData.data.slice(0, 5);
    let content = `Топ-5 наиболее активных акций по объему торгов:\n\n`;
    
    top5.forEach((stock: any, index: number) => {
      const formatted = marketDataService.formatStockData(stock);
      content += `${index + 1}. ${formatted}\n`;
    });

    content += `\nЭти акции имеют наибольший объем торгов в текущей сессии.`;

    return {
      content,
      sources: [{
        title: marketData.source,
        description: 'Trading volume data',
      }],
    };
  }

  /**
   * Handle ticker search
   */
  private async handleTickerSearch(ticker: string): Promise<{ content: string; sources: Source[] }> {
    const result = await marketDataService.searchTicker(ticker);
    
    if (!result) {
      return {
        content: `Не удалось найти информацию о ${ticker.toUpperCase()}. Убедитесь, что тикер указан правильно.`,
        sources: [],
      };
    }

    const data = result.data;
    const formatted = result.type === 'crypto' 
      ? marketDataService.formatCryptoData(data)
      : marketDataService.formatStockData(data);

    const content = `Информация о ${ticker.toUpperCase()}:\n\n${formatted}\n\n${
      result.type === 'crypto' 
        ? 'Это криптовалюта, торгуемая на основных биржах.'
        : 'Это публичная компания, торгуемая на фондовом рынке.'
    }`;

    return {
      content,
      sources: [{
        title: result.source,
        description: `Data for ${ticker.toUpperCase()}`,
      }],
    };
  }

  /**
   * Handle general questions
   */
  private async handleGeneral(message: string): Promise<{ content: string; sources: Source[] }> {
    // Try to get market overview for general context
    const overview = await marketDataService.getMarketOverview();
    
    let content = `Я финансовый AI-ассистент, специализирующийся на рынках акций, криптовалют и ETF.\n\n`;
    content += `Я могу помочь вам с:\n`;
    content += `• Актуальными ценами акций и криптовалют\n`;
    content += `• Лидерами и аутсайдерами рынка\n`;
    content += `• Анализом рыночных трендов\n`;
    content += `• Информацией о конкретных компаниях\n\n`;
    content += `Задайте мне вопрос о финансовых рынках, и я предоставлю актуальную информацию!`;

    return {
      content,
      sources: [{
        title: 'AI Financial Assistant',
        description: 'Powered by real-time market data',
      }],
    };
  }

  /**
   * Helper: Check if message contains keywords
   */
  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Helper: Extract country from message
   */
  private extractCountry(message: string): string {
    if (message.includes('росси') || message.includes('ru')) return 'ru';
    if (message.includes('сша') || message.includes('us') || message.includes('америк')) return 'us';
    return 'ru'; // default
  }

  /**
   * Helper: Check if message has ticker
   */
  private hasTicker(message: string): boolean {
    // Check for patterns like AAPL, BTC, TSLA, etc.
    const tickerPattern = /\b[A-Z]{2,5}\b/;
    return tickerPattern.test(message);
  }

  /**
   * Helper: Extract ticker from message
   */
  private extractTicker(message: string): string | null {
    const tickerPattern = /\b([A-Z]{2,5})\b/;
    const match = message.match(tickerPattern);
    return match ? match[1] : null;
  }
}

export const mockAIService = new MockAIService();
