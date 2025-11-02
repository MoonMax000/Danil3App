import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  exchange: string;
}

interface AggregatedOrderBookProps {
  symbol: string;
  exchanges: string[];
}

export default function AggregatedOrderBook({ symbol, exchanges }: AggregatedOrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [spread, setSpread] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderBooks = async () => {
      try {
        const allBids: OrderBookEntry[] = [];
        const allAsks: OrderBookEntry[] = [];

        // Fetch from Binance
        if (exchanges.includes('binance')) {
          try {
            const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`);
            const data = await response.json();
            
            data.bids.forEach(([price, quantity]: [string, string]) => {
              allBids.push({
                price: parseFloat(price),
                quantity: parseFloat(quantity),
                total: parseFloat(price) * parseFloat(quantity),
                exchange: 'binance'
              });
            });
            
            data.asks.forEach(([price, quantity]: [string, string]) => {
              allAsks.push({
                price: parseFloat(price),
                quantity: parseFloat(quantity),
                total: parseFloat(price) * parseFloat(quantity),
                exchange: 'binance'
              });
            });
          } catch (error) {
            console.error('Error fetching Binance orderbook:', error);
          }
        }

        // Fetch from Bybit
        if (exchanges.includes('bybit')) {
          try {
            const response = await fetch(`https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${symbol}&limit=20`);
            const data = await response.json();
            
            if (data.result) {
              data.result.b.forEach(([price, quantity]: [string, string]) => {
                allBids.push({
                  price: parseFloat(price),
                  quantity: parseFloat(quantity),
                  total: parseFloat(price) * parseFloat(quantity),
                  exchange: 'bybit'
                });
              });
              
              data.result.a.forEach(([price, quantity]: [string, string]) => {
                allAsks.push({
                  price: parseFloat(price),
                  quantity: parseFloat(quantity),
                  total: parseFloat(price) * parseFloat(quantity),
                  exchange: 'bybit'
                });
              });
            }
          } catch (error) {
            console.error('Error fetching Bybit orderbook:', error);
          }
        }

        // Fetch from OKX
        if (exchanges.includes('okx')) {
          try {
            const okxSymbol = symbol.replace('USDT', '-USDT');
            const response = await fetch(`https://www.okx.com/api/v5/market/books?instId=${okxSymbol}&sz=20`);
            const data = await response.json();
            
            if (data.data && data.data[0]) {
              data.data[0].bids.forEach(([price, quantity]: [string, string]) => {
                allBids.push({
                  price: parseFloat(price),
                  quantity: parseFloat(quantity),
                  total: parseFloat(price) * parseFloat(quantity),
                  exchange: 'okx'
                });
              });
              
              data.data[0].asks.forEach(([price, quantity]: [string, string]) => {
                allAsks.push({
                  price: parseFloat(price),
                  quantity: parseFloat(quantity),
                  total: parseFloat(price) * parseFloat(quantity),
                  exchange: 'okx'
                });
              });
            }
          } catch (error) {
            console.error('Error fetching OKX orderbook:', error);
          }
        }

        // Sort and aggregate
        const sortedBids = allBids.sort((a, b) => b.price - a.price).slice(0, 15);
        const sortedAsks = allAsks.sort((a, b) => a.price - b.price).slice(0, 15);

        setBids(sortedBids);
        setAsks(sortedAsks);

        // Calculate spread
        if (sortedBids.length > 0 && sortedAsks.length > 0) {
          const spreadValue = sortedAsks[0].price - sortedBids[0].price;
          setSpread(spreadValue);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching aggregated orderbooks:', error);
        setLoading(false);
      }
    };

    fetchOrderBooks();
    const interval = setInterval(fetchOrderBooks, 2000);
    
    return () => clearInterval(interval);
  }, [symbol, exchanges.join(',')]);

  const maxBidTotal = Math.max(...bids.map(b => b.total), 1);
  const maxAskTotal = Math.max(...asks.map(a => a.total), 1);

  const getExchangeColor = (exchange: string) => {
    const colors: { [key: string]: string } = {
      binance: '#F3BA2F',
      bybit: '#FFA800',
      okx: '#0052FF',
      huobi: '#2EABD2',
      coinbase: '#1877F2',
      kraken: '#653FFF'
    };
    return colors[exchange] || '#888';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Aggregated Order Book</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Spread:</span>
            <span className="text-yellow-400 font-mono">${spread.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          {exchanges.map(ex => (
            <div key={ex} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ background: getExchangeColor(ex) }}
              />
              <span className="text-xs text-gray-400 capitalize">{ex}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 border-b border-white/10 text-xs font-semibold text-gray-400">
        <div className="text-left">Price (USDT)</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total (USDT)</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Asks (Sell orders) */}
        <div className="flex flex-col-reverse">
          {asks.map((ask, index) => (
            <div
              key={`ask-${index}`}
              className="relative grid grid-cols-3 gap-2 px-3 py-1 text-xs font-mono hover:bg-red-500/10 transition-colors"
            >
              <div
                className="absolute inset-0 bg-red-500/10"
                style={{
                  width: `${(ask.total / maxAskTotal) * 100}%`,
                  marginLeft: 'auto'
                }}
              />
              <div className="relative flex items-center gap-1 text-red-400">
                {ask.price.toFixed(2)}
                <div 
                  className="w-1 h-1 rounded-full" 
                  style={{ background: getExchangeColor(ask.exchange) }}
                  title={ask.exchange}
                />
              </div>
              <div className="relative text-right text-gray-300">{ask.quantity.toFixed(6)}</div>
              <div className="relative text-right text-gray-400">{ask.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Spread indicator */}
        <div className="px-3 py-2 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 border-y border-white/10">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-gray-400">Best Bid:</span>
              <span className="text-green-400 font-mono">${bids[0]?.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Best Ask:</span>
              <span className="text-red-400 font-mono">${asks[0]?.price.toFixed(2)}</span>
              <TrendingDown className="w-3 h-3 text-red-400" />
            </div>
          </div>
        </div>

        {/* Bids (Buy orders) */}
        <div>
          {bids.map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="relative grid grid-cols-3 gap-2 px-3 py-1 text-xs font-mono hover:bg-green-500/10 transition-colors"
            >
              <div
                className="absolute inset-0 bg-green-500/10"
                style={{
                  width: `${(bid.total / maxBidTotal) * 100}%`
                }}
              />
              <div className="relative flex items-center gap-1 text-green-400">
                {bid.price.toFixed(2)}
                <div 
                  className="w-1 h-1 rounded-full" 
                  style={{ background: getExchangeColor(bid.exchange) }}
                  title={bid.exchange}
                />
              </div>
              <div className="relative text-right text-gray-300">{bid.quantity.toFixed(6)}</div>
              <div className="relative text-right text-gray-400">{bid.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
