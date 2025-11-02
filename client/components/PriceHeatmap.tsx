import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

interface PriceLevel {
  price: number;
  volume: number;
  intensity: number;
}

interface PriceHeatmapProps {
  symbol: string;
  timeframe?: string;
}

export default function PriceHeatmap({ symbol, timeframe = '1h' }: PriceHeatmapProps) {
  const [priceLevels, setPriceLevels] = useState<PriceLevel[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        // Fetch recent trades to calculate volume at price levels
        const tradesResponse = await fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=1000`);
        const trades = await tradesResponse.json();

        // Get current price
        const tickerResponse = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        const ticker = await tickerResponse.json();
        const price = parseFloat(ticker.lastPrice);
        setCurrentPrice(price);

        // Calculate price range (±2% from current price)
        const rangePercent = 0.02;
        const minPrice = price * (1 - rangePercent);
        const maxPrice = price * (1 + rangePercent);
        setPriceRange({ min: minPrice, max: maxPrice });

        // Group trades into price levels
        const priceStep = (maxPrice - minPrice) / 50; // 50 levels
        const volumeMap = new Map<number, number>();

        trades.forEach((trade: any) => {
          const tradePrice = parseFloat(trade.price);
          if (tradePrice >= minPrice && tradePrice <= maxPrice) {
            const level = Math.floor((tradePrice - minPrice) / priceStep);
            const levelPrice = minPrice + level * priceStep;
            const currentVolume = volumeMap.get(levelPrice) || 0;
            volumeMap.set(levelPrice, currentVolume + parseFloat(trade.qty));
          }
        });

        // Convert to array and calculate intensity
        const levels: PriceLevel[] = [];
        const maxVolume = Math.max(...Array.from(volumeMap.values()));

        for (let i = 0; i < 50; i++) {
          const levelPrice = minPrice + i * priceStep;
          const volume = volumeMap.get(levelPrice) || 0;
          levels.push({
            price: levelPrice,
            volume: volume,
            intensity: volume / maxVolume
          });
        }

        setPriceLevels(levels.reverse()); // Highest price at top
        setLoading(false);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
        setLoading(false);
      }
    };

    fetchHeatmapData();
    const interval = setInterval(fetchHeatmapData, 5000);
    
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  const getHeatColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(50, 50, 60, 0.3)';
    if (intensity < 0.2) return 'rgba(59, 130, 246, 0.3)';
    if (intensity < 0.4) return 'rgba(34, 197, 94, 0.4)';
    if (intensity < 0.6) return 'rgba(234, 179, 8, 0.5)';
    if (intensity < 0.8) return 'rgba(249, 115, 22, 0.6)';
    return 'rgba(239, 68, 68, 0.7)';
  };

  const getTextColor = (intensity: number) => {
    if (intensity === 0) return '#6B7280';
    if (intensity < 0.2) return '#60A5FA';
    if (intensity < 0.4) return '#4ADE80';
    if (intensity < 0.6) return '#FACC15';
    if (intensity < 0.8) return '#FB923C';
    return '#EF4444';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="text-sm text-gray-400">Loading heatmap...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Price Heatmap</h3>
          </div>
          <div className="text-xs text-gray-400">
            Range: ±2%
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Volume:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: 'rgba(59, 130, 246, 0.3)' }} />
            <span className="text-gray-500">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: 'rgba(234, 179, 8, 0.5)' }} />
            <span className="text-gray-500">Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: 'rgba(239, 68, 68, 0.7)' }} />
            <span className="text-gray-500">High</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-px">
          {priceLevels.map((level, index) => {
            const isCurrentPrice = Math.abs(level.price - currentPrice) < (priceRange.max - priceRange.min) / 100;
            
            return (
              <div
                key={index}
                className={`relative flex items-center justify-between px-2 py-1.5 rounded transition-all ${
                  isCurrentPrice ? 'ring-2 ring-yellow-400 z-10' : ''
                }`}
                style={{
                  background: getHeatColor(level.intensity)
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-semibold"
                    style={{ color: getTextColor(level.intensity) }}
                  >
                    ${level.price.toFixed(2)}
                  </span>
                  {isCurrentPrice && (
                    <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/20 px-1.5 py-0.5 rounded">
                      CURRENT
                    </span>
                  )}
                </div>
                
                {level.volume > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400">
                      {level.volume.toFixed(4)}
                    </div>
                    <div 
                      className="h-2 rounded-full"
                      style={{
                        width: `${level.intensity * 60}px`,
                        background: `linear-gradient(90deg, ${getTextColor(level.intensity)}40, ${getTextColor(level.intensity)})`
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="px-3 py-2 border-t border-white/10 grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-[10px] text-gray-400 uppercase">High Activity</div>
          <div className="text-sm font-bold text-red-400 font-mono">
            ${priceRange.max.toFixed(2)}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-[10px] text-gray-400 uppercase">Low Activity</div>
          <div className="text-sm font-bold text-blue-400 font-mono">
            ${priceRange.min.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
