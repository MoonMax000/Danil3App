import { useState, useEffect, useRef } from 'react';
import { TrendingDown, TrendingUp, Activity } from 'lucide-react';

interface Liquidation {
  symbol: string;
  side: 'LONG' | 'SHORT';
  price: number;
  quantity: number;
  time: number;
  value: number;
}

interface LiquidationsPanelProps {
  symbol: string;
}

interface SymbolStats {
  totalLongs: number;
  totalShorts: number;
  liquidations: Liquidation[];
}

const AVAILABLE_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 
  'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'DOTUSDT',
  'MATICUSDT', 'AVAXUSDT', 'LINKUSDT', 'UNIUSDT'
];

export default function LiquidationsPanel({ symbol: initialSymbol }: LiquidationsPanelProps) {
  const [watchedSymbols, setWatchedSymbols] = useState<string[]>(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']);
  const [symbolStats, setSymbolStats] = useState<Record<string, SymbolStats>>({});
  const [showSymbolSelector, setShowSymbolSelector] = useState(false);
  const wsRefs = useRef<Record<string, WebSocket>>({});

  // Connect WebSockets for all watched symbols
  useEffect(() => {
    Object.values(wsRefs.current).forEach(ws => ws.close());
    wsRefs.current = {};

    const initialStats: Record<string, SymbolStats> = {};
    watchedSymbols.forEach(sym => {
      initialStats[sym] = { totalLongs: 0, totalShorts: 0, liquidations: [] };
    });
    setSymbolStats(initialStats);

    watchedSymbols.forEach(sym => {
      const streamSymbol = sym.toLowerCase();
      const ws = new WebSocket(`wss://fstream.binance.com/ws/${streamSymbol}@forceOrder`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const order = data.o;
          
          if (order) {
            const liquidation: Liquidation = {
              symbol: order.s,
              side: order.S === 'BUY' ? 'SHORT' : 'LONG',
              price: parseFloat(order.p),
              quantity: parseFloat(order.q),
              time: order.T,
              value: parseFloat(order.p) * parseFloat(order.q)
            };

            setSymbolStats(prev => {
              const symbolData = prev[sym] || { totalLongs: 0, totalShorts: 0, liquidations: [] };
              const updatedLiquidations = [liquidation, ...symbolData.liquidations].slice(0, 15);
              
              return {
                ...prev,
                [sym]: {
                  totalLongs: liquidation.side === 'LONG' ? symbolData.totalLongs + liquidation.value : symbolData.totalLongs,
                  totalShorts: liquidation.side === 'SHORT' ? symbolData.totalShorts + liquidation.value : symbolData.totalShorts,
                  liquidations: updatedLiquidations
                }
              };
            });
          }
        } catch (error) {
          console.error('Error parsing liquidation:', error);
        }
      };

      wsRefs.current[sym] = ws;
    });

    return () => {
      Object.values(wsRefs.current).forEach(ws => ws.close());
      wsRefs.current = {};
    };
  }, [watchedSymbols]);

  // Reset totals every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setSymbolStats(prev => {
        const reset: Record<string, SymbolStats> = {};
        Object.keys(prev).forEach(sym => {
          reset[sym] = { ...prev[sym], totalLongs: 0, totalShorts: 0 };
        });
        return reset;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load/save watched symbols
  useEffect(() => {
    const saved = localStorage.getItem('liquidations-watched-symbols');
    if (saved) {
      try {
        const symbols = JSON.parse(saved);
        if (Array.isArray(symbols) && symbols.length > 0) {
          setWatchedSymbols(symbols);
        }
      } catch (error) {
        console.error('Failed to load watched symbols:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('liquidations-watched-symbols', JSON.stringify(watchedSymbols));
  }, [watchedSymbols]);

  const toggleSymbol = (symbol: string) => {
    if (watchedSymbols.includes(symbol)) {
      if (watchedSymbols.length > 1) {
        setWatchedSymbols(watchedSymbols.filter(s => s !== symbol));
      }
    } else {
      setWatchedSymbols([...watchedSymbols, symbol]);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Calculate totals across all watched symbols
  const totalLongs = Object.values(symbolStats).reduce((sum, stats) => sum + stats.totalLongs, 0);
  const totalShorts = Object.values(symbolStats).reduce((sum, stats) => sum + stats.totalShorts, 0);
  const longPercentage = totalLongs + totalShorts > 0 ? (totalLongs / (totalLongs + totalShorts)) * 100 : 50;

  return (
    <div 
      className="flex flex-col h-full"
      style={{
        background: 'linear-gradient(135deg, rgba(18, 18, 24, 0.95) 0%, rgba(24, 24, 32, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 border-b flex-shrink-0"
        style={{
          borderColor: 'rgba(139, 92, 246, 0.15)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              Liquidations
            </h3>
          </div>
          <button
            onClick={() => setShowSymbolSelector(!showSymbolSelector)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200"
            style={{
              background: showSymbolSelector ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#C084FC'
            }}
          >
            Select Coins ({watchedSymbols.length})
          </button>
        </div>

        {/* Symbol Selector */}
        {showSymbolSelector && (
          <div className="mb-3 p-3 rounded-lg" style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_SYMBOLS.map(sym => (
                <label
                  key={sym}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white/5 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={watchedSymbols.includes(sym)}
                    onChange={() => toggleSymbol(sym)}
                    className="w-4 h-4 rounded accent-purple-500"
                  />
                  <span className="text-xs font-bold text-white">
                    {sym.replace('USDT', '')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-red-400 font-bold">Longs:</span>
              <span className="text-white">{formatNumber(totalLongs)}</span>
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-green-400 font-bold">Shorts:</span>
              <span className="text-white">{formatNumber(totalShorts)}</span>
            </span>
          </div>
          
          <div className="h-2 rounded-full overflow-hidden bg-gray-800">
            <div className="h-full flex">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${longPercentage}%`,
                  background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
                }}
              />
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${100 - longPercentage}%`,
                  background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                }}
              />
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-400">
            Watching: {watchedSymbols.map(s => s.replace('USDT', '')).join(', ')}
          </div>
        </div>
      </div>

      {/* Liquidations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {(() => {
            const allLiquidations: Liquidation[] = [];
            Object.values(symbolStats).forEach(stats => {
              allLiquidations.push(...stats.liquidations);
            });
            allLiquidations.sort((a, b) => b.time - a.time);
            const recentLiquidations = allLiquidations.slice(0, 50);

            if (recentLiquidations.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Waiting for liquidations...
                </div>
              );
            }

            return recentLiquidations.map((liq, index) => (
              <div
                key={`${liq.symbol}-${liq.time}-${index}`}
                className="p-3 rounded-lg transition-all duration-200 hover:bg-white/5"
                style={{
                  background: liq.side === 'LONG' 
                    ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, transparent 100%)'
                    : 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%)',
                  border: '1px solid',
                  borderColor: liq.side === 'LONG' 
                    ? 'rgba(239, 68, 68, 0.3)' 
                    : 'rgba(16, 185, 129, 0.3)',
                  animation: index === 0 ? 'slideIn 0.3s ease-out' : 'none'
                }}
              >
                {/* Header: Symbol + Side + Time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {liq.symbol.replace('USDT', '')}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded"
                      style={{
                        background: liq.side === 'LONG' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      {liq.side === 'LONG' ? (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      )}
                      <span 
                        className="text-xs font-bold"
                        style={{
                          color: liq.side === 'LONG' ? '#EF4444' : '#10B981'
                        }}
                      >
                        {liq.side}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(liq.time)}
                  </span>
                </div>

                {/* Data: Price + Value */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Price</span>
                    <span className="text-sm font-mono text-white">
                      ${liq.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400">Value</span>
                    <span className="text-sm font-bold text-white">
                      {formatNumber(liq.value)}
                    </span>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
