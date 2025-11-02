import { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface DepthData {
  price: number;
  cumulativeVolume: number;
  type: 'bid' | 'ask';
}

interface DepthChartProps {
  symbol: string;
}

export default function DepthChart({ symbol }: DepthChartProps) {
  const [bidDepth, setBidDepth] = useState<DepthData[]>([]);
  const [askDepth, setAskDepth] = useState<DepthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [spread, setSpread] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchDepthData = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=100`);
        const data = await response.json();

        // Process bids (buy orders)
        let cumulativeVolume = 0;
        const bids: DepthData[] = data.bids
          .map(([price, quantity]: [string, string]) => {
            cumulativeVolume += parseFloat(quantity);
            return {
              price: parseFloat(price),
              cumulativeVolume: cumulativeVolume,
              type: 'bid' as const
            };
          })
          .reverse();

        // Process asks (sell orders)
        cumulativeVolume = 0;
        const asks: DepthData[] = data.asks.map(([price, quantity]: [string, string]) => {
          cumulativeVolume += parseFloat(quantity);
          return {
            price: parseFloat(price),
            cumulativeVolume: cumulativeVolume,
            type: 'ask' as const
          };
        });

        setBidDepth(bids);
        setAskDepth(asks);

        // Calculate spread
        if (bids.length > 0 && asks.length > 0) {
          setSpread(asks[0].price - bids[0].price);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching depth data:', error);
        setLoading(false);
      }
    };

    fetchDepthData();
    const interval = setInterval(fetchDepthData, 2000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    if (!canvasRef.current || bidDepth.length === 0 || askDepth.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate scales
    const allData = [...bidDepth, ...askDepth];
    const minPrice = Math.min(...allData.map(d => d.price));
    const maxPrice = Math.max(...allData.map(d => d.price));
    const maxVolume = Math.max(...allData.map(d => d.cumulativeVolume));

    const xScale = (price: number) => {
      return padding + ((price - minPrice) / (maxPrice - minPrice)) * (width - padding * 2);
    };

    const yScale = (volume: number) => {
      return height - padding - ((volume / maxVolume) * (height - padding * 2));
    };

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * (height - padding * 2);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw bid area (green)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xScale(bidDepth[0].price), height - padding);
    bidDepth.forEach((point, i) => {
      const x = xScale(point.price);
      const y = yScale(point.cumulativeVolume);
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(xScale(bidDepth[bidDepth.length - 1].price), height - padding);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw ask area (red)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xScale(askDepth[0].price), height - padding);
    askDepth.forEach((point, i) => {
      const x = xScale(point.price);
      const y = yScale(point.cumulativeVolume);
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(xScale(askDepth[askDepth.length - 1].price), height - padding);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw mid price line
    const midPrice = (bidDepth[0].price + askDepth[0].price) / 2;
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(xScale(midPrice), padding);
    ctx.lineTo(xScale(midPrice), height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    // Price labels
    [bidDepth[0].price, midPrice, askDepth[askDepth.length - 1].price].forEach(price => {
      const x = xScale(price);
      ctx.fillText(`$${price.toFixed(2)}`, x, height - padding + 15);
    });

    // Volume labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 2; i++) {
      const volume = (maxVolume * i) / 2;
      const y = yScale(volume);
      ctx.fillText(volume.toFixed(2), padding - 5, y + 4);
    }

  }, [bidDepth, askDepth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="text-sm text-gray-400">Loading depth chart...</span>
        </div>
      </div>
    );
  }

  const totalBidVolume = bidDepth[bidDepth.length - 1]?.cumulativeVolume || 0;
  const totalAskVolume = askDepth[askDepth.length - 1]?.cumulativeVolume || 0;
  const bidAskRatio = totalBidVolume / (totalAskVolume || 1);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Depth Chart</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Spread:</span>
              <span className="text-yellow-400 font-mono">${spread.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-3">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Statistics */}
      <div className="px-3 py-2 border-t border-white/10">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
            <div className="flex items-center gap-1 text-[10px] text-green-400 uppercase mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Total Bids</span>
            </div>
            <div className="text-sm font-bold text-green-400 font-mono">
              {totalBidVolume.toFixed(2)}
            </div>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-2 border border-purple-500/20">
            <div className="text-[10px] text-purple-400 uppercase mb-1">Bid/Ask Ratio</div>
            <div className={`text-sm font-bold font-mono ${
              bidAskRatio > 1 ? 'text-green-400' : bidAskRatio < 1 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {bidAskRatio.toFixed(3)}
            </div>
          </div>

          <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20">
            <div className="flex items-center gap-1 text-[10px] text-red-400 uppercase mb-1">
              <TrendingDown className="w-3 h-3" />
              <span>Total Asks</span>
            </div>
            <div className="text-sm font-bold text-red-400 font-mono">
              {totalAskVolume.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Market pressure indicator */}
        <div className="mt-2 bg-white/5 rounded-lg p-2">
          <div className="text-[10px] text-gray-400 uppercase mb-1">Market Pressure</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.min((bidAskRatio / 2) * 100, 100)}%`,
                  background: bidAskRatio > 1.2 
                    ? 'linear-gradient(90deg, #22C55E, #16A34A)' 
                    : bidAskRatio < 0.8 
                    ? 'linear-gradient(90deg, #DC2626, #EF4444)'
                    : 'linear-gradient(90deg, #8B5CF6, #A78BFA)'
                }}
              />
            </div>
            <span className={`text-xs font-semibold ${
              bidAskRatio > 1.2 ? 'text-green-400' : bidAskRatio < 0.8 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {bidAskRatio > 1.2 ? 'Bullish' : bidAskRatio < 0.8 ? 'Bearish' : 'Neutral'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
