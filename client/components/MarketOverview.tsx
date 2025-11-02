import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, AlertTriangle, BarChart3 } from 'lucide-react';
import {
  ProcessedTickerData,
  MarketStatistics,
  processTickerData,
  calculateMarketStats,
  formatLargeNumber
} from '../utils/dataProcessing';

interface MarketOverviewProps {
  liveCryptoData: { [key: string]: any };
  onCoinClick?: (symbol: string) => void;
}

export default function MarketOverview({ liveCryptoData, onCoinClick }: MarketOverviewProps) {
  const [processedData, setProcessedData] = useState<ProcessedTickerData[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStatistics | null>(null);

  // Coin metadata with logos
  const getCoinIcon = (symbol: string): string => {
    const baseSymbol = symbol.replace('USDT', '');
    const coinIcons: {[key: string]: string} = {
      'BTC': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      'BNB': 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
      'SOL': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      'ADA': 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
      'DOGE': 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
      'XRP': 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
      'DOT': 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
      'MATIC': 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
      'AVAX': 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
      'LINK': 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
      'UNI': 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
      'LTC': 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
      'ATOM': 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
      'SHIB': 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
      'TRX': 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
      'BCH': 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png',
      'NEAR': 'https://assets.coingecko.com/coins/images/10365/small/near_icon.png',
      'APT': 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
      'ARB': 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
      'OP': 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
      'FIL': 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png',
      'AAVE': 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
      'MKR': 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png',
      'GRT': 'https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png',
      'ALGO': 'https://assets.coingecko.com/coins/images/4380/small/download.png',
      'VET': 'https://assets.coingecko.com/coins/images/1167/small/VET_Token_Icon.png',
      'ICP': 'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png',
      'XLM': 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
      'ETC': 'https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png',
      'THETA': 'https://assets.coingecko.com/coins/images/2538/small/theta-token-logo.png',
      'XMR': 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png',
      'FTM': 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png',
      'SAND': 'https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg',
      'MANA': 'https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png',
      'AXS': 'https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png'
    };
    return coinIcons[baseSymbol] || `https://ui-avatars.com/api/?name=${baseSymbol}&background=7C3AED&color=fff&size=64`;
  };

  useEffect(() => {
    if (Object.keys(liveCryptoData).length > 0) {
      const processed = Object.entries(liveCryptoData).map(([_, data]) =>
        processTickerData(data)
      );
      setProcessedData(processed);
      setMarketStats(calculateMarketStats(processed));
    }
  }, [liveCryptoData]);

  if (!marketStats) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading market data...
      </div>
    );
  }

  const marketSentiment = marketStats.bullishCount > marketStats.bearishCount ? 'bullish' : 
                         marketStats.bearishCount > marketStats.bullishCount ? 'bearish' : 'neutral';

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-auto">
      {/* Market Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div 
          className="p-4 rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400 font-semibold">Total Volume</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">
            ${formatLargeNumber(marketStats.totalVolume)}
          </div>
        </div>

        <div 
          className="p-4 rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400 font-semibold">Avg Change</span>
          </div>
          <div 
            className="text-xl font-bold"
            style={{
              color: marketStats.averageChange >= 0 ? '#6EE7B7' : '#FCA5A5'
            }}
          >
            {marketStats.averageChange >= 0 ? '+' : ''}{marketStats.averageChange.toFixed(2)}%
          </div>
        </div>

        <div 
          className="p-4 rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: marketSentiment === 'bullish' 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
              : marketSentiment === 'bearish'
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)',
            border: `1px solid ${
              marketSentiment === 'bullish' ? 'rgba(16, 185, 129, 0.2)' :
              marketSentiment === 'bearish' ? 'rgba(239, 68, 68, 0.2)' :
              'rgba(107, 114, 128, 0.2)'
            }`
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            {marketSentiment === 'bullish' ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : marketSentiment === 'bearish' ? (
              <TrendingDown className="w-4 h-4 text-red-400" />
            ) : (
              <Activity className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-xs text-gray-400 font-semibold">Sentiment</span>
          </div>
          <div 
            className="text-xl font-bold capitalize"
            style={{
              color: marketSentiment === 'bullish' ? '#6EE7B7' :
                     marketSentiment === 'bearish' ? '#FCA5A5' :
                     '#9CA3AF'
            }}
          >
            {marketSentiment}
          </div>
        </div>

        <div 
          className="p-4 rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400 font-semibold">Assets</span>
          </div>
          <div className="text-xl font-bold text-blue-400">
            {processedData.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            🟢 {marketStats.bullishCount} 🔴 {marketStats.bearishCount}
          </div>
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Top Gainers */}
        <div 
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.1)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">Top Gainers</span>
          </div>
          <div className="space-y-2">
            {marketStats.topGainers.slice(0, 3).map((item, i) => (
              <div 
                key={i} 
                onClick={() => onCoinClick?.(item.symbol)}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-emerald-500/20 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 border border-transparent hover:border-emerald-500/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)'
                }}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={getCoinIcon(item.symbol)} 
                    alt={item.symbol}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-400/30 group-hover:ring-2 group-hover:ring-emerald-400/60 transition-all"
                  />
                  <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{item.symbol.replace('USDT', '')}</span>
                </div>
                <span className="text-sm font-black text-emerald-400 group-hover:scale-110 transition-transform">
                  +{item.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div 
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-bold text-red-400">Top Losers</span>
          </div>
          <div className="space-y-2">
            {marketStats.topLosers.slice(0, 3).map((item, i) => (
              <div 
                key={i}
                onClick={() => onCoinClick?.(item.symbol)}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-red-500/20 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 border border-transparent hover:border-red-500/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%)'
                }}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={getCoinIcon(item.symbol)} 
                    alt={item.symbol}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-red-400/30 group-hover:ring-2 group-hover:ring-red-400/60 transition-all"
                  />
                  <span className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">{item.symbol.replace('USDT', '')}</span>
                </div>
                <span className="text-sm font-black text-red-400 group-hover:scale-110 transition-transform">
                  {item.change.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highest Volume & Most Volatile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Highest Volume */}
        <div 
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.1)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">Highest Volume</span>
          </div>
          <div className="space-y-2">
            {marketStats.highestVolume.slice(0, 3).map((item, i) => (
              <div 
                key={i}
                onClick={() => onCoinClick?.(item.symbol)}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-purple-500/20 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 border border-transparent hover:border-purple-500/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.02) 100%)'
                }}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={getCoinIcon(item.symbol)} 
                    alt={item.symbol}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-purple-400/30 group-hover:ring-2 group-hover:ring-purple-400/60 transition-all"
                  />
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{item.symbol.replace('USDT', '')}</span>
                </div>
                <span className="text-sm font-black text-purple-400 group-hover:scale-110 transition-transform">
                  ${formatLargeNumber(item.volume)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Volatile */}
        <div 
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.1)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">Most Volatile</span>
          </div>
          <div className="space-y-2">
            {marketStats.mostVolatile.slice(0, 3).map((item, i) => (
              <div 
                key={i}
                onClick={() => onCoinClick?.(item.symbol)}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-amber-500/20 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 border border-transparent hover:border-amber-500/40"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.02) 100%)'
                }}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={getCoinIcon(item.symbol)} 
                    alt={item.symbol}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400/30 group-hover:ring-2 group-hover:ring-amber-400/60 transition-all"
                  />
                  <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{item.symbol.replace('USDT', '')}</span>
                </div>
                <span className="text-sm font-black text-amber-400 group-hover:scale-110 transition-transform">
                  {item.volatility.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Breakdown */}
      <div 
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold text-blue-400">Market Breakdown</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-emerald-500/10">
            <div className="text-2xl font-bold text-emerald-400">{marketStats.bullishCount}</div>
            <div className="text-xs text-gray-400 mt-1">Bullish</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10">
            <div className="text-2xl font-bold text-red-400">{marketStats.bearishCount}</div>
            <div className="text-xs text-gray-400 mt-1">Bearish</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-500/10">
            <div className="text-2xl font-bold text-gray-400">{marketStats.neutralCount}</div>
            <div className="text-xs text-gray-400 mt-1">Neutral</div>
          </div>
        </div>
      </div>
    </div>
  );
}
