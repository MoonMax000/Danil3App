import { useState, useMemo, useCallback, lazy, Suspense, useEffect, useRef } from "react";
import { UserMessage, AIMessage } from "./components/ChatMessages";
import HistoryModal from "./components/HistoryModal";
import aiAssistantService from "@/services/aiAssistantService";
import RiskCalculator from "@/components/RiskCalculator";
import {
  LazyFinanceHub,
  LazyStockList,
  LazyStockMovers,
  LazyCryptoList,
  LazySectorsList,
  LazyIndicesList,
} from "./components/LazyFinanceDashboard";
import MarketTabs, {
  type MarketCategory,
} from "@/components/FinanceDashboard/MarketTabs";
import MarketCard from "@/components/FinanceDashboard/MarketCard";
import MarketIndexCard from "@/components/FinanceDashboard/MarketIndexCard";
import { useMarketData } from "@/hooks/useMarketData";
import { useMarketIndices } from "@/hooks/useMarketIndices";
import { useMultiExchangeData } from "@/hooks/useMultiExchangeData";

// Lazy load the stock charts component
const StockChartsGrid = lazy(
  () => import("@/components/FinanceDashboard/StockChartsGrid"),
);
import { Message } from "@/lib/schemas/market";
import {
  ECONOMIC_EVENTS,
  MARKET_NEWS_ITEMS,
  RISING_SECTORS,
  DECLINING_SECTORS,
  ACTIVE_SECTORS,
  SECTOR_LEADERS,
  MAJOR_INDICES,
  GLOBAL_INDICES,
  MOCK_SOURCES,
  CHAT_HISTORY,
  TRENDING_CRYPTO,
  RISING_CRYPTO,
  DECLINING_CRYPTO,
  ACTIVE_CRYPTO,
} from "@/lib/constants/mockData";

// Helper function to get logo URL
function getLogoUrl(symbol: string): string {
  // Map of coin symbols to their logo URLs
  const logoMap: Record<string, string> = {
    'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    'SOL': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    'XRP': 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    'ADA': 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    'DOGE': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    'DOT': 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    'AVAX': 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  };
  
  // Return logo URL or use CryptoCompare API for other coins
  return logoMap[symbol] || `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
}

export default function AIAssistant() {
  const [inputValue, setInputValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMarket, setActiveMarket] = useState<MarketCategory>("stocks");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use live market data (map category to valid types)
  const marketCategory = activeMarket === 'bonds' ? 'stocks' : activeMarket;
  const { 
    trendingStocks, 
    risingStocks, 
    decliningStocks, 
    activeStocks,
    marketCards,
    news,
    loading,
    error 
  } = useMarketData(marketCategory as 'stocks' | 'crypto' | 'commodities' | 'forex');

  // Get ALL crypto data from Binance API
  const multiExchangeData = useMultiExchangeData([]);
  
  // Convert Binance data to Stock format for display
  const cryptoStocks = useMemo(() => {
    if (!multiExchangeData.data.binance) {
      console.log('⚠️ No Binance data available');
      return [];
    }
    
    console.log('📊 Binance data keys:', Object.keys(multiExchangeData.data.binance).length);
    
    // Get ALL USDT pairs from Binance, filter out leverage tokens
    const filtered = Object.entries(multiExchangeData.data.binance)
      .filter(([symbol]) => {
        // Filter out leverage tokens (UP, DOWN, BEAR, BULL) and other junk
        return symbol.endsWith('USDT') && 
               !symbol.includes('UP') && 
               !symbol.includes('DOWN') &&
               !symbol.includes('BEAR') &&
               !symbol.includes('BULL');
      })
      .map(([symbol, data]) => {
        const baseSymbol = symbol.replace('USDT', '');
        const changePercent = parseFloat(data.priceChangePercent);
        
        return {
          symbol: baseSymbol,
          name: baseSymbol,
          price: parseFloat(data.lastPrice),
          change: parseFloat(data.priceChange),
          changePercent: changePercent,
          logo: getLogoUrl(baseSymbol),
          sparklineData: []
        };
      })
      .filter(stock => stock.price > 0); // Only filter by price
    
    console.log('✅ Filtered crypto stocks:', filtered.length);
    console.log('📈 Sample stocks:', filtered.slice(0, 5).map(s => `${s.symbol}: ${s.changePercent.toFixed(2)}%`));
    
    return filtered;
  }, [multiExchangeData.data]);
  
  // Sort crypto stocks
  // Trending: ONLY top 5 most popular (BTC, ETH, SOL, XRP, DOGE)
  const cryptoTrending = useMemo(() => {
    const top5Symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'];
    return [...cryptoStocks]
      .filter(s => top5Symbols.includes(s.symbol))
      .sort((a, b) => top5Symbols.indexOf(a.symbol) - top5Symbols.indexOf(b.symbol));
  }, [cryptoStocks]);
  
  // Gainers: top 10 with highest positive %
  const cryptoGainers = useMemo(() => 
    [...cryptoStocks]
      .filter(s => s.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10),
    [cryptoStocks]
  );
  
  // Losers: top 10 with lowest negative %
  const cryptoLosers = useMemo(() => 
    [...cryptoStocks]
      .filter(s => s.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10),
    [cryptoStocks]
  );

  // Use live market indices data
  const { indices, loading: indicesLoading, error: indicesError, lastUpdate } = useMarketIndices();

  const handleSendMessage = useCallback(
    async (messageText?: string) => {
      const text = messageText || inputValue.trim();
      if (!text || isTyping) return;

      const userMessage: Message = {
        id: Date.now(),
        type: "user",
        content: text,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      // Call real AI backend with Perplexity
      try {
        const response = await aiAssistantService.sendMessage(text);
        
        const aiResponse: Message = {
          id: Date.now() + 1,
          type: "ai",
          content: response.message.content,
          sources: response.message.sources || MOCK_SOURCES,
        };
        
        // Smooth typing effect
        requestAnimationFrame(() => {
          setMessages((prev) => [...prev, aiResponse]);
          setIsTyping(false);
        });
      } catch (error) {
        console.error('AI Error:', error);
        const errorResponse: Message = {
          id: Date.now() + 1,
          type: "ai",
          content: "I'm having trouble connecting to the AI service. Please try again.",
          sources: [],
        };
        setMessages((prev) => [...prev, errorResponse]);
        setIsTyping(false);
      }
    },
    [inputValue, isTyping],
  );

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInputValue("");
  }, []);

  const handleNewsClick = useCallback((newsItem: typeof MARKET_NEWS_ITEMS[0]) => {
    // Generate contextual question based on news
    const question = `Tell me more about: ${newsItem.title}. ${newsItem.description ? `Context: ${newsItem.description}` : ''} What are the implications for ${newsItem.symbol || 'the market'}?`;
    
    // Automatically send the message
    handleSendMessage(question);
    
    // Scroll to top only if user is far down the page
    if (window.scrollY > 300) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [handleSendMessage]);

  const marketCategoryLabel = useMemo(
    () =>
      `Trending ${activeMarket.charAt(0).toUpperCase() + activeMarket.slice(1)}`,
    [activeMarket],
  );

  const handleCloseHistory = useCallback(() => setShowHistory(false), []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcut: Ctrl/Cmd + K to focus input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <HistoryModal
        isOpen={showHistory}
        onClose={handleCloseHistory}
        chatHistory={CHAT_HISTORY}
      />

      <div className="flex min-h-[calc(100vh-64px)] flex-col gap-6">
        {/* Header with History and New Chat Buttons */}
        <div className="flex gap-2 px-4 pt-4">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.50)] px-4 py-2 text-[15px] font-bold text-[#B0B0B0] backdrop-blur-[50px] transition-all hover:bg-[rgba(12,16,20,0.70)]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.66667 9.16671C1.66667 6.41685 1.66667 5.04192 2.52094 4.18765C3.37521 3.33337 4.75014 3.33337 7.5 3.33337H8.33333C11.0832 3.33337 12.4581 3.33337 13.3124 4.18765C14.1667 5.04192 14.1667 6.41685 14.1667 9.16671V10.8334C14.1667 13.5832 14.1667 14.9581 13.3124 15.8125C12.4581 16.6667 11.0832 16.6667 8.33333 16.6667H7.5C4.75014 16.6667 3.37521 16.6667 2.52094 15.8125C1.66667 14.9581 1.66667 13.5832 1.66667 10.8334V9.16671Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M14.1667 7.4215L14.2716 7.33493C16.0347 5.88015 16.9163 5.15276 17.6248 5.50398C18.3333 5.85519 18.3333 7.01959 18.3333 9.34838V10.6515C18.3333 12.9804 18.3333 14.1447 17.6248 14.496C16.9163 14.8471 16.0347 14.1198 14.2716 12.665L14.1667 12.5784"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M9.58333 9.16663C10.2737 9.16663 10.8333 8.60698 10.8333 7.91663C10.8333 7.22627 10.2737 6.66663 9.58333 6.66663C8.89298 6.66663 8.33333 7.22627 8.33333 7.91663C8.33333 8.60698 8.89298 9.16663 9.58333 9.16663Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            History
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.50)] px-4 py-2 text-[15px] font-bold text-[#B0B0B0] backdrop-blur-[50px] transition-all hover:bg-[rgba(12,16,20,0.70)]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.6874 3.83757L14.5124 3.01258C15.1959 2.32914 16.304 2.32914 16.9874 3.01258C17.6708 3.69603 17.6708 4.80411 16.9874 5.48756L16.1624 6.31255M13.6874 3.83757L8.13798 9.387C7.71506 9.81 7.41503 10.3398 7.26998 10.9201L6.66667 13.3333L9.07992 12.73C9.66017 12.585 10.19 12.2849 10.613 11.862L16.1624 6.31255M13.6874 3.83757L16.1624 6.31255"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M15.8333 11.2501C15.8333 13.9897 15.8332 15.3594 15.0767 16.2814C14.9382 16.4502 14.7834 16.6049 14.6146 16.7434C13.6927 17.5001 12.3228 17.5001 9.58325 17.5001H9.16667C6.02397 17.5001 4.45263 17.5001 3.47632 16.5237C2.50002 15.5475 2.5 13.9761 2.5 10.8334V10.4167C2.5 7.67718 2.5 6.30741 3.25662 5.38545C3.39514 5.21666 3.54992 5.06189 3.7187 4.92336C4.64066 4.16675 6.01043 4.16675 8.75 4.16675"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            New Chat
          </button>
        </div>

        {/* Market Indices Section */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-6 px-4 py-2">
            {lastUpdate && (
              <div className="text-xs text-[#8A8A9E] flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {indicesLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-32 bg-[rgba(46,39,68,0.30)] rounded-3xl animate-pulse" />
                ))
              ) : (
                indices.map((index, idx) => (
                  <MarketIndexCard
                    key={idx}
                    name={index.name}
                    symbol={index.symbol}
                    value={typeof index.value === 'string' ? parseFloat(index.value) : index.value}
                    change={typeof index.change === 'string' ? parseFloat(index.change) : index.change}
                    changePercent={typeof index.changePercent === 'string' ? parseFloat(index.changePercent) : index.changePercent}
                    chartData={index.chartData}
                  />
                ))
              )}
            </div>
            {indicesError && (
              <div className="text-yellow-500 text-sm mt-2">
                {indicesError} - Using fallback data
              </div>
            )}
          </div>
        )}

        {/* Main Content with Right Sidebar */}
        <main className="flex flex-1 gap-6 px-4 pb-0 pt-2">
          <div className="flex flex-1 flex-col min-w-0">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-8 pb-40">
                {/* Stock Charts with AI Prediction - TOP SECTION */}
                <div className="flex w-full max-w-full flex-col gap-6 px-0">
                  <Suspense
                    fallback={
                      <div className="text-[#8A8A9E] text-center py-8">
                        Loading charts...
                      </div>
                    }
                  >
                    <StockChartsGrid />
                  </Suspense>
                </div>

                {/* Risk Calculator - SECOND SECTION */}
                <div className="flex w-full max-w-full flex-col gap-6 px-0">
                  <RiskCalculator />
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-1 flex-col gap-8 overflow-y-auto pb-40">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className="animate-fadeIn"
                    style={{
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  >
                    {message.type === "user" ? (
                      <UserMessage content={message.content} />
                    ) : (
                      <AIMessage
                        content={message.content}
                        sources={message.sources}
                      />
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-start gap-3 animate-fadeIn">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#A06AFF] to-[#6AA5FF]">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 rounded-2xl bg-gradient-to-br from-[rgba(46,39,68,0.50)] to-[rgba(30,30,45,0.50)] p-6 backdrop-blur-xl border border-[#A06AFF]/20">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-[#A06AFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#6AA5FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Right Sidebar - Trending Stocks and Additional Blocks */}
          <div className="flex flex-col gap-6">
            <LazyStockList
              stocks={trendingStocks}
              title="Stocks"
            />
            <LazyCryptoList
              cryptos={cryptoTrending}
              title="Crypto"
            />
            <LazyIndicesList
              sectorLeaders={SECTOR_LEADERS}
              indices={MAJOR_INDICES}
              global={GLOBAL_INDICES}
            />
          </div>
        </main>

        {/* Sticky Input Box - Always Accessible */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 py-6 flex justify-center w-full max-w-2xl px-4">
          <div className="flex w-full flex-col items-center justify-center gap-3">
            {/* AI Assistant Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#A06AFF]/20 to-[#6AA5FF]/20 border border-[#A06AFF]/40 backdrop-blur-xl shadow-lg shadow-[#A06AFF]/20">
              <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                ✨ AI Assistant Ready
              </span>
            </div>

            <div className="group relative w-full">
              {/* Animated gradient border - Always visible, more intense */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#A06AFF]/40 via-[#6AA5FF]/60 to-[#A06AFF]/40 opacity-80 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500 blur-lg animate-pulse"></div>
              
              {/* Secondary glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#A06AFF] to-[#6AA5FF] opacity-20 blur-2xl animate-pulse"></div>

              {/* Main input container - Enhanced */}
              <div className="relative flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-[#A06AFF]/60 bg-gradient-to-br from-[rgba(30,30,45,0.95)] to-[rgba(20,20,30,0.95)] px-5 py-4 backdrop-blur-xl shadow-2xl shadow-[#A06AFF]/30 transition-all duration-300 group-hover:border-[#A06AFF] group-focus-within:border-[#6AA5FF] group-hover:shadow-[#A06AFF]/50 group-focus-within:shadow-[#6AA5FF]/50">
                {/* Search Icon - Enhanced */}
                <svg
                  className="h-5 w-5 text-[#A06AFF] flex-shrink-0 transition-all duration-300 group-hover:text-[#6AA5FF] group-focus-within:text-[#6AA5FF] group-hover:scale-110"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
                  <path d="M14 14L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="9" cy="9" r="2" fill="currentColor" opacity="0.5" />
                </svg>

                {/* Input field - Enhanced */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask me anything about markets, stocks, crypto... (Ctrl + K)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  disabled={isTyping}
                  className="flex-1 bg-transparent py-1 text-[15px] font-semibold text-white placeholder:text-[#9A9AAE] placeholder:font-medium focus:outline-none transition-colors duration-300 disabled:opacity-50"
                  autoFocus
                />

                {/* Send Button - Enhanced */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#A06AFF] to-[#6AA5FF] text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#A06AFF]/50 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95 flex-shrink-0 disabled:from-[#5A5A6E] disabled:to-[#5A5A6E]"
                  aria-label="Send message"
                >
                  {isTyping ? (
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Disclaimer - Enhanced */}
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[#6A6A7E] flex items-center gap-2">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              Powered by AI • Not Financial Advice
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
