import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { ChevronDown, Wifi, WifiOff } from 'lucide-react';

interface OrderBookEntry {
  price: string;
  quantity: string;
  total: number;
  orderValue: number; // Individual order value (not cumulative)
}

interface TickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

interface OrderBookProps {
  ticker?: TickerData | null;
}

export default function OrderBook({ ticker }: OrderBookProps) {
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<'up' | 'down'>('up');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [viewMode, setViewMode] = useState<'both' | 'asks' | 'bids'>('both');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<{asks: string[][], bids: string[][]} | null>(null);
  const currentSymbolRef = useRef<string>('');

  // Get the current trading symbol (default to BTCUSDT if ticker not available)
  const symbol = ticker?.symbol || 'BTCUSDT';

  // Track price changes from ticker
  useEffect(() => {
    if (ticker && ticker.lastPrice) {
      const currentPrice = parseFloat(ticker.lastPrice);
      if (lastPrice > 0) {
        if (currentPrice > lastPrice) {
          setPriceChange('up');
        } else if (currentPrice < lastPrice) {
          setPriceChange('down');
        }
      }
      setLastPrice(currentPrice);
    }
  }, [ticker, lastPrice]);

  // Throttled update function (max 100ms between updates)
  const throttledUpdate = useCallback((newAsks: OrderBookEntry[], newBids: OrderBookEntry[]) => {
    if (throttleTimeoutRef.current) return;
    
    setAsks(newAsks);
    setBids(newBids);
    setLastUpdateTime(Date.now());
    
    throttleTimeoutRef.current = setTimeout(() => {
      throttleTimeoutRef.current = null;
      
      // Process pending data if any
      if (pendingDataRef.current) {
        const { asks: pendingAsks, bids: pendingBids } = pendingDataRef.current;
        pendingDataRef.current = null;
        processOrderBookData(pendingAsks, pendingBids);
      }
    }, 100);
  }, []);

  // Process order book data with cumulative totals for display and individual values for bars
  const processOrderBookData = useCallback((asksData: string[][], bidsData: string[][]) => {
    // Process asks (sells):
    // 1. Reverse first so highest ask price is at top (closest to spread)
    // 2. Calculate both individual order value (for bar size) and cumulative total (for display)
    const asksReversed = asksData.slice(0, 10).reverse();
    let asksCumulativeValue = 0;
    const formattedAsks = asksReversed.map((ask: string[]) => {
      const price = parseFloat(ask[0]);
      const quantity = parseFloat(ask[1]);
      const orderValue = price * quantity; // Individual order value
      asksCumulativeValue += orderValue;
      
      return {
        price: price.toFixed(2),
        quantity: quantity.toFixed(4),
        total: asksCumulativeValue, // Cumulative for display
        orderValue: orderValue // Individual for bar size
      };
    });
    
    // Process bids (buys):
    // Bids come from API in descending price order (highest to lowest)
    // Calculate both individual order value (for bar size) and cumulative total (for display)
    let bidsCumulativeValue = 0;
    const formattedBids = bidsData.slice(0, 10).map((bid: string[]) => {
      const price = parseFloat(bid[0]);
      const quantity = parseFloat(bid[1]);
      const orderValue = price * quantity; // Individual order value
      bidsCumulativeValue += orderValue;
      
      return {
        price: price.toFixed(2),
        quantity: quantity.toFixed(4),
        total: bidsCumulativeValue, // Cumulative for display
        orderValue: orderValue // Individual for bar size
      };
    });
    
    throttledUpdate(formattedAsks, formattedBids);
  }, [throttledUpdate]);

  // WebSocket connection with auto-reconnect
  const connectWebSocket = useCallback((tradingSymbol: string) => {
    try {
      // Convert symbol to lowercase for WebSocket URL (e.g., BTCUSDT -> btcusdt)
      const wsSymbol = tradingSymbol.toLowerCase();
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@depth20`);
      wsRef.current = ws;
      currentSymbolRef.current = tradingSymbol;

      ws.onopen = () => {
        console.log(`OrderBook WebSocket connected for ${tradingSymbol}`);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.asks && data.bids) {
          if (throttleTimeoutRef.current) {
            // Store for later if currently throttled
            pendingDataRef.current = { asks: data.asks, bids: data.bids };
          } else {
            processOrderBookData(data.asks, data.bids);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('OrderBook WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log(`OrderBook WebSocket closed for ${tradingSymbol}`);
        setIsConnected(false);
        wsRef.current = null;

        // Only auto-reconnect if we're still on the same symbol
        if (currentSymbolRef.current === tradingSymbol) {
          const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting OrderBook WebSocket (attempt ${reconnectAttemptsRef.current})...`);
            connectWebSocket(tradingSymbol);
          }, backoffTime);
        }
      };
    } catch (error) {
      console.error('Failed to create OrderBook WebSocket:', error);
      setIsConnected(false);
    }
  }, [processOrderBookData]);

  // Effect to handle symbol changes and WebSocket reconnection
  useEffect(() => {
    // Clear old data immediately when symbol changes
    setAsks([]);
    setBids([]);
    setIsConnected(false);
    
    const fetchOrderBook = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`);
        const data = await response.json();
        processOrderBookData(data.asks, data.bids);
      } catch (error) {
        console.error(`Error fetching order book for ${symbol}:`, error);
      }
    };

    // Close existing WebSocket if symbol changed
    if (wsRef.current && currentSymbolRef.current !== symbol) {
      console.log(`Symbol changed from ${currentSymbolRef.current} to ${symbol}, closing old connection`);
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any pending reconnect attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Reset reconnect attempts for new symbol
    reconnectAttemptsRef.current = 0;

    // Fetch initial data and connect WebSocket for new symbol
    fetchOrderBook();
    connectWebSocket(symbol);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [symbol, connectWebSocket, processOrderBookData]);

  // Memoized calculations for performance - use max cumulative total for bar scaling (standard exchange behavior)
  const { maxAsksTotal, maxBidsTotal } = useMemo(() => {
    const maxAsks = asks.length > 0 ? Math.max(...asks.map(a => a.total)) : 1;
    const maxBids = bids.length > 0 ? Math.max(...bids.map(b => b.total)) : 1;
    
    return {
      maxAsksTotal: maxAsks,
      maxBidsTotal: maxBids
    };
  }, [asks, bids]);

  const { totalBidsVolume, totalAsksVolume, totalVolume, buyPercentage, sellPercentage } = useMemo(() => {
    // Since we're using cumulative totals, the last row contains the full sum
    const bidsVol = bids.length > 0 ? bids[bids.length - 1].total : 0;
    const asksVol = asks.length > 0 ? asks[asks.length - 1].total : 0;
    const total = bidsVol + asksVol;
    
    return {
      totalBidsVolume: bidsVol,
      totalAsksVolume: asksVol,
      totalVolume: total,
      buyPercentage: total > 0 ? ((bidsVol / total) * 100).toFixed(1) : '50.0',
      sellPercentage: total > 0 ? ((asksVol / total) * 100).toFixed(1) : '50.0'
    };
  }, [bids, asks]);

  // Check if data is stale (no updates for 5+ seconds)
  const isStale = useMemo(() => {
    return Date.now() - lastUpdateTime > 5000;
  }, [lastUpdateTime]);

  // Industry-standard formatter with high precision for Total column
  const formatTotal = (total: number): string => {
    const inK = total / 1000;
    
    if (inK >= 1000) {
      // >= 1M: show in millions with 2 decimals
      return (inK / 1000).toFixed(2) + 'M';
    } else {
      // Always show 2 decimal places for K values
      return inK.toFixed(2) + 'K';
    }
  };

  return (
    <aside className="w-full" style={{ 
      background: '#000000',
      backdropFilter: 'blur(40px) saturate(180%)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Fixed */}
      <div className="px-3 pt-3 pb-2" style={{ flexShrink: 0 }}>
        <div className="flex items-center gap-1.5 mb-2">
          <button 
            onClick={() => setViewMode('both')}
            className="p-1.5 rounded transition-all" 
            style={{ 
              background: viewMode === 'both' ? 'linear-gradient(135deg, #A06AFF 0%, #7C3AED 100%)' : 'transparent',
              boxShadow: viewMode === 'both' ? '0 2px 8px rgba(160, 106, 255, 0.3)' : 'none'
            }}
            title="Show both asks and bids"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="14" height="2" fill={viewMode === 'both' ? 'white' : '#9F7AEA'}/>
              <rect x="2" y="7" width="11" height="2" fill={viewMode === 'both' ? 'white' : '#9F7AEA'}/>
              <rect x="2" y="12" width="11" height="2" fill={viewMode === 'both' ? 'white' : '#9F7AEA'}/>
            </svg>
          </button>
          <button 
            onClick={() => setViewMode('asks')}
            className="p-1.5 rounded transition-all"
            style={{ 
              background: viewMode === 'asks' ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'transparent',
              boxShadow: viewMode === 'asks' ? '0 2px 8px rgba(239, 68, 68, 0.3)' : 'none'
            }}
            title="Show asks only"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="14" height="2" fill={viewMode === 'asks' ? 'white' : '#EF4444'}/>
              <rect x="2" y="7" width="11" height="2" fill={viewMode === 'asks' ? 'white' : '#EF4444'}/>
            </svg>
          </button>
          <button 
            onClick={() => setViewMode('bids')}
            className="p-1.5 rounded transition-all"
            style={{ 
              background: viewMode === 'bids' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
              boxShadow: viewMode === 'bids' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
            }}
            title="Show bids only"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="7" width="11" height="2" fill={viewMode === 'bids' ? 'white' : '#10B981'}/>
              <rect x="2" y="12" width="11" height="2" fill={viewMode === 'bids' ? 'white' : '#10B981'}/>
            </svg>
          </button>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{
            background: isConnected 
              ? 'rgba(16, 185, 129, 0.15)' 
              : 'rgba(239, 69, 74, 0.15)',
            border: isConnected
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(239, 69, 74, 0.3)'
          }} title={isConnected ? 'Connected' : 'Disconnected'}>
            {isConnected ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400" />
            )}
            {isStale && isConnected && (
              <span className="text-[9px] font-semibold text-yellow-400">Stale</span>
            )}
          </div>
          
          <div style={{ flex: 1 }}></div>
          <button className="px-2 py-0.5 rounded text-[10px] font-bold text-purple-300 flex items-center gap-1" style={{ 
            background: 'rgba(124, 58, 237, 0.15)',
            border: '1px solid rgba(160, 106, 255, 0.3)'
          }}>
            <span>0.01</span>
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
        </div>

        <div className="flex justify-between text-[10px] font-semibold text-purple-300 px-1">
          <span>Price(USDT)</span>
          <span>Amount(BTC)</span>
          <span>Total</span>
        </div>
      </div>

      {/* Content - Grows to fill space */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Sell Orders */}
        {(viewMode === 'both' || viewMode === 'asks') && (
        <div className="px-3">
          {asks.map((ask, i) => {
            const scaleX = (ask.total / maxAsksTotal);
            return (
              <div key={`ask-${i}`} className="relative flex items-center hover:bg-purple-900/5 transition-colors" style={{ height: '20px' }}>
                <div 
                  className="absolute right-0 h-full"
                  style={{ 
                    width: '100%',
                    transform: `scaleX(${scaleX})`,
                    transformOrigin: 'right',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    willChange: 'transform',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(239, 69, 74, 0.18) 50%, rgba(239, 69, 74, 0.25) 100%)',
                    boxShadow: '0 0 8px rgba(239, 69, 74, 0.15)'
                  }}
                ></div>
                <div className="relative z-10 w-full flex justify-between px-1 text-[11px] font-bold">
                  <span className="transition-colors duration-200" style={{ 
                    color: '#FF6B7A',
                    textShadow: '0 0 8px rgba(255, 107, 122, 0.3)'
                  }}>{ask.price}</span>
                  <span className="transition-colors duration-200" style={{ color: '#E5E7EB' }}>{ask.quantity}</span>
                  <span className="transition-colors duration-200" style={{ color: '#9CA3AF' }}>{formatTotal(ask.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Current Price */}
        {viewMode === 'both' && (
        <div className="px-3 py-1">
          <div className="relative overflow-hidden rounded-xl transition-all" style={{
            background: priceChange === 'up' 
              ? 'linear-gradient(135deg, rgba(46, 189, 133, 0.25) 0%, rgba(46, 189, 133, 0.12) 100%)'
              : 'linear-gradient(135deg, rgba(239, 69, 74, 0.25) 0%, rgba(239, 69, 74, 0.12) 100%)',
            border: priceChange === 'up'
              ? '1px solid rgba(46, 189, 133, 0.4)'
              : '1px solid rgba(239, 69, 74, 0.4)',
            boxShadow: priceChange === 'up' 
              ? '0 4px 16px rgba(46, 189, 133, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)' 
              : '0 4px 16px rgba(239, 69, 74, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}>
            {/* Animated background pulse */}
            <div className="absolute inset-0 opacity-20" style={{
              background: priceChange === 'up'
                ? 'radial-gradient(circle at center, rgba(46, 189, 133, 0.4) 0%, transparent 70%)'
                : 'radial-gradient(circle at center, rgba(239, 69, 74, 0.4) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite'
            }}></div>

            <div className="relative px-3 py-1.5 flex flex-col gap-0.5">
              {/* Price */}
              <div className="flex items-center justify-between">
                <span className={`text-xl font-black tracking-tight ${priceChange === 'up' ? 'text-emerald-300' : 'text-red-300'}`} style={{
                  textShadow: priceChange === 'up' 
                    ? '0 0 20px rgba(46, 189, 133, 0.6), 0 2px 4px rgba(0, 0, 0, 0.3)' 
                    : '0 0 20px rgba(239, 69, 74, 0.6), 0 2px 4px rgba(0, 0, 0, 0.3)',
                  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
                  letterSpacing: '-0.02em'
                }}>
                  {lastPrice.toFixed(2)}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  {priceChange === 'up' ? (
                    <path d="M8 3L8 13M4 7L8 3L12 7" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M8 13L8 3M12 9L8 13L4 9" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
              </div>
              
              {/* Percentage badge */}
              <div className="flex items-center gap-1.5">
                <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                  priceChange === 'up' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-red-500/30 text-red-200'
                }`} style={{
                  border: priceChange === 'up' 
                    ? '1px solid rgba(46, 189, 133, 0.5)'
                    : '1px solid rgba(239, 69, 74, 0.5)',
                  boxShadow: priceChange === 'up'
                    ? '0 0 8px rgba(46, 189, 133, 0.3)'
                    : '0 0 8px rgba(239, 69, 74, 0.3)'
                }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    {priceChange === 'up' ? (
                      <path d="M6 2L6 10M3 5L6 2L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <path d="M6 10L6 2M9 7L6 10L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    )}
                  </svg>
                  <span>{ticker ? `${parseFloat(ticker.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(ticker.priceChangePercent).toFixed(2)}%` : '0.00%'}</span>
                </div>
                <span className="text-[10px] font-medium text-gray-400">24h</span>
              </div>
            </div>
          </div>
        </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.4; }
          }
        `}</style>

        {/* Buy Orders */}
        {(viewMode === 'both' || viewMode === 'bids') && (
        <div className="px-3" style={{ flexShrink: 0 }}>
          {bids.map((bid, i) => {
            const scaleX = (bid.total / maxBidsTotal);
            return (
              <div key={`bid-${i}`} className="relative flex items-center hover:bg-purple-900/5 transition-colors" style={{ height: '20px' }}>
                <div 
                  className="absolute right-0 h-full"
                  style={{ 
                    width: '100%',
                    transform: `scaleX(${scaleX})`,
                    transformOrigin: 'right',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    willChange: 'transform',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(46, 189, 133, 0.18) 50%, rgba(46, 189, 133, 0.25) 100%)',
                    boxShadow: '0 0 8px rgba(46, 189, 133, 0.15)'
                  }}
                ></div>
                <div className="relative z-10 w-full flex justify-between px-1 text-[11px] font-bold">
                  <span className="transition-colors duration-200" style={{ 
                    color: '#34D399',
                    textShadow: '0 0 8px rgba(52, 211, 153, 0.3)'
                  }}>{bid.price}</span>
                  <span className="transition-colors duration-200" style={{ color: '#E5E7EB' }}>{bid.quantity}</span>
                  <span className="transition-colors duration-200" style={{ color: '#9CA3AF' }}>{formatTotal(bid.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Bottom Bar - Right after orders */}
        <div className="px-3 pt-2 pb-3" style={{ flexShrink: 0 }}>
          <div className="flex items-center h-6 rounded overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)', width: '100%' }}>
            <div className="flex items-center justify-center h-full transition-all duration-700 ease-out relative" style={{ 
              width: `${buyPercentage}%`,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 30%, #047857 60%, #065F46 100%)',
              boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.2), inset 0 -1px 3px rgba(0, 0, 0, 0.2), 0 0 10px rgba(16, 185, 129, 0.4)'
            }}>
              <span className="text-xs font-bold text-white relative z-10" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>{buyPercentage}%</span>
            </div>
            <div className="flex items-center justify-center h-full transition-all duration-700 ease-out relative" style={{ 
              width: `${sellPercentage}%`,
              background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 30%, #991B1B 60%, #7F1D1D 100%)',
              boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.2), inset 0 -1px 3px rgba(0, 0, 0, 0.2), 0 0 10px rgba(220, 38, 38, 0.4)'
            }}>
              <span className="text-xs font-bold text-white relative z-10" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>{sellPercentage}%</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
