import { Wallet, Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { useState, useEffect } from "react";

interface Holding {
  id: string;
  symbol: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
}

export default function PortfolioTracker({ livePrices }: { livePrices: {[key: string]: number} }) {
  const [holdings, setHoldings] = useState<Holding[]>([
    {
      id: '1',
      symbol: 'BTC',
      amount: 0.5,
      buyPrice: 40000,
      currentPrice: livePrices['BTCUSDT'] || 43000
    },
    {
      id: '2',
      symbol: 'ETH',
      amount: 5,
      buyPrice: 2200,
      currentPrice: livePrices['ETHUSDT'] || 2300
    },
    {
      id: '3',
      symbol: 'SOL',
      amount: 20,
      buyPrice: 95,
      currentPrice: livePrices['SOLUSDT'] || 102
    }
  ]);

  // Update current prices from live data
  useEffect(() => {
    setHoldings(prev => prev.map(holding => ({
      ...holding,
      currentPrice: livePrices[`${holding.symbol}USDT`] || holding.currentPrice
    })));
  }, [livePrices]);

  const calculatePnL = (holding: Holding) => {
    const invested = holding.amount * holding.buyPrice;
    const current = holding.amount * holding.currentPrice;
    const pnl = current - invested;
    const pnlPercent = ((pnl / invested) * 100);
    return { pnl, pnlPercent };
  };

  const totalInvested = holdings.reduce((sum, h) => sum + (h.amount * h.buyPrice), 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + (h.amount * h.currentPrice), 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPercent = (totalPnL / totalInvested) * 100;

  return (
    <div className="h-full flex flex-col">
      {/* Portfolio Summary */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-bold text-white">Portfolio</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Total Value</div>
            <div className="text-lg font-bold text-white">
              ${totalCurrent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Total P&L</div>
            <div className={`text-lg font-bold ${totalPnL >= 0 ? 'text-[#6EE7B7]' : 'text-[#EF4444]'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-semibold ${totalPnL >= 0 ? 'text-[#6EE7B7]' : 'text-[#EF4444]'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
        <div className="p-4 space-y-2">
          {holdings.map((holding) => {
            const { pnl, pnlPercent } = calculatePnL(holding);
            const isProfit = pnl >= 0;
            
            return (
              <div
                key={holding.id}
                className="p-3 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all duration-200 bg-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-400">{holding.symbol}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{holding.symbol}</div>
                      <div className="text-xs text-gray-500">{holding.amount} {holding.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      ${(holding.amount * holding.currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs font-semibold flex items-center gap-1 justify-end ${isProfit ? 'text-[#6EE7B7]' : 'text-[#EF4444]'}`}>
                      {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="text-gray-500">
                    Avg Buy: ${holding.buyPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-gray-500">
                    Current: ${holding.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">P&L</span>
                    <span className={`font-bold ${isProfit ? 'text-[#6EE7B7]' : 'text-[#EF4444]'}`}>
                      {isProfit ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          <button className="w-full p-3 rounded-lg border border-dashed border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-200 flex items-center justify-center gap-2 text-purple-400 text-sm font-semibold">
            <Plus className="w-4 h-4" />
            Add Holding
          </button>
        </div>
      </div>
    </div>
  );
}
