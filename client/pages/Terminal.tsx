import { Search, Bell, ChevronDown, TrendingUp, TrendingDown, BarChart3, Users, Settings, HelpCircle, MessageSquare, Plus, Camera, Menu, TrendingUpIcon, Sigma, ShoppingBag, X, Layout, Link2, Newspaper, Wallet } from "lucide-react";
import TradingViewChart from "../components/TradingViewChartSimple";
import AdvancedTradingChart from "../components/AdvancedTradingChart";
import LiquidationsPanel from "../components/LiquidationsPanel";
import AggregatedOrderBook from "../components/AggregatedOrderBook";
import DepthChart from "../components/DepthChart";
import PriceHeatmap from "../components/PriceHeatmap";
import SRStatsDashboard from "../components/SRStatsDashboard";
import SupportResistanceOverlay from "../components/SupportResistanceOverlay";
import Watchlist from "../components/Watchlist";
import OrderBook from "../components/OrderBook";
import NewsFeed from "../components/NewsFeed";
import PriceAlerts from "../components/PriceAlerts";
import PortfolioTracker from "../components/PortfolioTracker";
import MarketOverview from "../components/MarketOverview";
import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useBinanceTicker } from "../hooks/useBinanceTicker";
import { useMultiExchangeData } from "../hooks/useMultiExchangeData";
import CommunityDiscoverModal, { DiscoverTab, CommunityItem } from "../components/discord/CommunityDiscoverModal";
import { DndContext, useDraggable, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Resizable } from "re-resizable";

type PanelType = 'chart' | 'advanced-chart' | 'liquidations' | 'aggregated-orderbook' | 'depth-chart' | 'heatmap' | 'watchlist' | 'orderbook' | 'news' | 'alerts' | 'portfolio' | 'market';

type Exchange = 'binance' | 'coinbase' | 'kraken' | 'bybit';

interface Panel {
  id: string;
  type: PanelType;
  crypto: CommunityItem;
  timeframe: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '12h' | '1d' | '1w' | '1M';
  x: number;
  y: number;
  width: number;
  height: number;
  linkGroup?: string | null;
  exchange: Exchange;
}

// Draggable Panel Component with @dnd-kit
function DraggablePanel({ 
  panel, 
  onRemove, 
  onResize,
  isTop,
  onBringToFront,
  onTimeframeChange,
  ticker,
  onOpenSearch,
  liveCryptoData,
  onToggleLink,
  linkedPanelsCount,
  onExchangeChange,
  onCoinClick
}: { 
  panel: Panel; 
  onRemove: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  isTop: boolean;
  onBringToFront: (id: string) => void;
  onTimeframeChange: (id: string, timeframe: Panel['timeframe']) => void;
  ticker: any;
  onOpenSearch: () => void;
  liveCryptoData: {[key: string]: any};
  onToggleLink: (panelId: string) => void;
  linkedPanelsCount: number;
  onExchangeChange: (panelId: string, exchange: Exchange) => void;
  onCoinClick?: (panelId: string, symbol: string) => void;
}) {
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);
  const [showExchangeMenu, setShowExchangeMenu] = useState(false);
  
  const popularTimeframes: Panel['timeframe'][] = ['15m', '1h', '4h', '1d'];
  const allTimeframes: Panel['timeframe'][] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '12h', '1d', '1w', '1M'];
  const moreTimeframes = allTimeframes.filter(tf => !popularTimeframes.includes(tf));
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: panel.id,
  });

  const style = {
    position: 'absolute' as const,
    left: `${panel.x}px`,
    top: `${panel.y}px`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging ? 20 : (isTop ? 15 : 10),
    opacity: isDragging ? 0.5 : 1,
    transition: isDragging ? 'none' : 'opacity 0.2s, z-index 0.2s',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onBringToFront(panel.id);
      }}
    >
      <Resizable
        size={{ width: panel.width, height: panel.height }}
        onResize={(e, direction, ref, d) => {
          const newWidth = ref.offsetWidth;
          const newHeight = ref.offsetHeight;
          onResize(panel.id, newWidth, newHeight);
        }}
        onResizeStop={(e, direction, ref, d) => {
          const newWidth = ref.offsetWidth;
          const newHeight = ref.offsetHeight;
          onResize(panel.id, newWidth, newHeight);
        }}
        minWidth={150}
        minHeight={150}
        enable={{
          top: false,
          right: true,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: true,
          bottomLeft: false,
          topLeft: false
        }}
        handleStyles={{
          right: {
            width: '8px',
            right: '-4px',
            background: 'transparent',
            borderRadius: '4px',
            transition: 'background 0.2s ease',
          },
          bottom: {
            height: '8px',
            bottom: '-4px',
            background: 'transparent',
            borderRadius: '4px',
            transition: 'background 0.2s ease',
          },
          bottomRight: {
            width: '12px',
            height: '12px',
            right: '-6px',
            bottom: '-6px',
            background: 'transparent',
            borderRadius: '50%',
            border: '1px solid transparent',
            transition: 'all 0.2s ease',
          }
        }}
        handleClasses={{
          right: 'resize-handle-right',
          bottom: 'resize-handle-bottom',
          bottomRight: 'resize-handle-corner'
        }}
      >
        <div 
          className="relative flex flex-col overflow-hidden h-full w-full"
          style={{
            background: '#000000',
            backdropFilter: 'blur(50px)',
            borderRadius: '12px',
            border: isDragging ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
            <div 
              {...listeners} 
              {...attributes}
              className="flex items-center gap-2 flex-1 cursor-move select-none"
            >
              <img 
                src={panel.crypto.iconUrl} 
                alt={panel.crypto.name}
                className="w-5 h-5 object-contain cursor-pointer hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSearch();
                }}
                title="Change cryptocurrency"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSearch();
                }}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Search cryptocurrency"
              >
                <Search className="w-3.5 h-3.5 text-gray-400 hover:text-white transition-colors" />
              </button>
              <span 
                className="text-sm font-bold text-white cursor-pointer hover:text-purple-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSearch();
                }}
                title="Change cryptocurrency"
              >
                {panel.crypto.symbol}USDT
              </span>

              {/* Exchange selector - only for non-chart panels */}
              {panel.type !== 'chart' && (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExchangeMenu(!showExchangeMenu);
                    }}
                    className="px-2 py-0.5 text-xs font-bold rounded transition-all duration-200"
                    style={{
                      background: panel.exchange === 'binance' ? 'rgba(243, 186, 47, 0.2)' 
                                : panel.exchange === 'coinbase' ? 'rgba(24, 119, 242, 0.2)'
                                : panel.exchange === 'kraken' ? 'rgba(101, 63, 255, 0.2)'
                                : 'rgba(255, 168, 0, 0.2)',
                      color: panel.exchange === 'binance' ? '#F3BA2F'
                           : panel.exchange === 'coinbase' ? '#1877F2'
                           : panel.exchange === 'kraken' ? '#653FFF'
                           : '#FFA800',
                      border: `1px solid ${
                        panel.exchange === 'binance' ? 'rgba(243, 186, 47, 0.4)'
                        : panel.exchange === 'coinbase' ? 'rgba(24, 119, 242, 0.4)'
                        : panel.exchange === 'kraken' ? 'rgba(101, 63, 255, 0.4)'
                        : 'rgba(255, 168, 0, 0.4)'
                      }`
                    }}
                  >
                    {panel.exchange.toUpperCase()}
                  </button>
                  
                  {showExchangeMenu && (
                    <div
                      className="absolute top-0 left-full ml-2 min-w-[140px] rounded-xl overflow-hidden"
                      style={{
                        background: '#000000',
                        border: '2px solid rgba(124, 58, 237, 0.6)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 1), 0 0 20px rgba(124, 58, 237, 0.3)',
                        zIndex: 999999,
                        padding: '8px'
                      }}
                    >
                      {(['binance', 'coinbase', 'kraken', 'bybit'] as Exchange[]).map((exchange) => (
                        <button
                          key={exchange}
                          onClick={(e) => {
                            e.stopPropagation();
                            onExchangeChange(panel.id, exchange);
                            setShowExchangeMenu(false);
                          }}
                          className={`w-full px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                            panel.exchange === exchange
                              ? 'bg-white/20 text-white'
                              : 'bg-transparent text-gray-400 hover:bg-white/15 hover:text-white'
                          }`}
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: exchange === 'binance' ? '#F3BA2F'
                                        : exchange === 'coinbase' ? '#1877F2'
                                        : exchange === 'kraken' ? '#653FFF'
                                        : '#FFA800'
                            }}
                          />
                          <span>{exchange.charAt(0).toUpperCase() + exchange.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Link button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLink(panel.id);
                }}
                className={`p-1 rounded transition-all duration-200 ${
                  panel.linkGroup 
                    ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                }`}
                title={panel.linkGroup ? `Linked with ${linkedPanelsCount - 1} other panel${linkedPanelsCount - 1 !== 1 ? 's' : ''}` : 'Link panel (sync crypto changes)'}
              >
                <Link2 className={`w-3.5 h-3.5 ${panel.linkGroup ? 'animate-pulse' : ''}`} />
              </button>
              
              {/* Timeframe buttons for chart panels */}
              {panel.type === 'chart' && (
                <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  {popularTimeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTimeframeChange(panel.id, tf);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition-all duration-200 ${
                        panel.timeframe === tf
                          ? 'bg-white/20 text-white'
                          : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                      }`}
                      style={{
                        border: panel.timeframe === tf ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {tf}
                    </button>
                  ))}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTimeframeMenu(!showTimeframeMenu);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition-all duration-200 flex items-center gap-1 ${
                        moreTimeframes.includes(panel.timeframe)
                          ? 'bg-white/20 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                      style={{
                        border: moreTimeframes.includes(panel.timeframe) ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {moreTimeframes.includes(panel.timeframe) && (
                        <span>{panel.timeframe}</span>
                      )}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showTimeframeMenu && (
                      <div 
                        className="absolute top-full mt-1 right-0 min-w-[70px] rounded-xl overflow-hidden"
                        style={{
                          background: 'rgba(0, 0, 0, 0.95)',
                          backdropFilter: 'blur(40px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                          zIndex: 99999,
                          padding: '6px'
                        }}
                      >
                        {moreTimeframes.map((tf) => (
                          <button
                            key={tf}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTimeframeChange(panel.id, tf);
                              setShowTimeframeMenu(false);
                            }}
                            className={`w-full px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                              panel.timeframe === tf
                                ? 'bg-white/20 text-white'
                                : 'bg-transparent text-gray-400 hover:bg-white/15 hover:text-white hover:scale-[1.02]'
                            }`}
                            style={{
                              textAlign: 'center',
                              marginBottom: '2px'
                            }}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Close button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(panel.id);
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              className="p-1 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>

          {/* Content */}
          <div 
            className="flex-1 min-h-0 overflow-hidden"
            style={{
              pointerEvents: (showTimeframeMenu || showExchangeMenu) ? 'none' : 'auto'
            }}
          >
            {panel.type === 'chart' && <TradingViewChart symbol={`${panel.crypto.symbol}USDT`} timeframe={panel.timeframe} />}
            {panel.type === 'advanced-chart' && <AdvancedTradingChart symbol={`${panel.crypto.symbol}USDT`} timeframe={panel.timeframe} />}
            {panel.type === 'liquidations' && <LiquidationsPanel symbol={`${panel.crypto.symbol}USDT`} />}
            {panel.type === 'aggregated-orderbook' && <AggregatedOrderBook symbol={`${panel.crypto.symbol}USDT`} exchanges={['binance', 'bybit', 'okx']} />}
            {panel.type === 'depth-chart' && <DepthChart symbol={`${panel.crypto.symbol}USDT`} />}
            {panel.type === 'heatmap' && <PriceHeatmap symbol={`${panel.crypto.symbol}USDT`} />}
            {panel.type === 'watchlist' && <Watchlist onAssetClick={(symbol) => onCoinClick?.(panel.id, symbol)} />}
            {panel.type === 'orderbook' && <OrderBook ticker={{
              symbol: `${panel.crypto.symbol}USDT`,
              priceChange: liveCryptoData[`${panel.crypto.symbol}USDT`]?.priceChange || '0',
              priceChangePercent: liveCryptoData[`${panel.crypto.symbol}USDT`]?.priceChangePercent || '0',
              lastPrice: liveCryptoData[`${panel.crypto.symbol}USDT`]?.lastPrice || '0',
              highPrice: liveCryptoData[`${panel.crypto.symbol}USDT`]?.highPrice || '0',
              lowPrice: liveCryptoData[`${panel.crypto.symbol}USDT`]?.lowPrice || '0',
              volume: liveCryptoData[`${panel.crypto.symbol}USDT`]?.volume || '0',
              quoteVolume: liveCryptoData[`${panel.crypto.symbol}USDT`]?.quoteVolume || '0'
            }} />}
            {panel.type === 'news' && <NewsFeed crypto={panel.crypto.symbol} />}
            {panel.type === 'alerts' && <PriceAlerts crypto={panel.crypto.symbol} currentPrice={parseFloat(ticker?.lastPrice || '0')} />}
            {panel.type === 'portfolio' && <PortfolioTracker livePrices={Object.fromEntries(Object.entries(liveCryptoData).map(([k, v]: [string, any]) => [k, parseFloat(v.lastPrice)]))} />}
            {panel.type === 'market' && <MarketOverview liveCryptoData={liveCryptoData} onCoinClick={(symbol) => onCoinClick?.(panel.id, symbol)} />}
          </div>
        </div>
      </Resizable>
    </div>
  );
}

export default function Terminal() {
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '12h' | '1d' | '1w' | '1M'>('15m');
  const [showDiscover, setShowDiscover] = useState(false);
  const [discoverTab, setDiscoverTab] = useState<DiscoverTab>('volume');
  const [discoverQuery, setDiscoverQuery] = useState<string>('');
  const [selectedCrypto, setSelectedCrypto] = useState<CommunityItem | null>(null);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [syncTimeframes, setSyncTimeframes] = useState(false);
  const [showAddPanelMenu, setShowAddPanelMenu] = useState(false);
  const [topPanelId, setTopPanelId] = useState<string | null>(null);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(true);
  const [isStatsBarCollapsed, setIsStatsBarCollapsed] = useState(false);
  const [searchOriginPanelId, setSearchOriginPanelId] = useState<string | null>(null);
  const addPanelButtonRef = useRef<HTMLButtonElement>(null);
  const ticker = useBinanceTicker(selectedCrypto ? `${selectedCrypto.symbol}USDT` : 'BTCUSDT');
  const multiExchangeData = useMultiExchangeData(['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT', 'XRPUSDT', 'DOTUSDT']);
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down'>('up');
  const [liveCryptoData, setLiveCryptoData] = useState<{[key: string]: any}>({});

  // Track price changes
  useEffect(() => {
    if (ticker && ticker.lastPrice) {
      const currentPrice = parseFloat(ticker.lastPrice);
      if (lastPrice > 0) {
        if (currentPrice > lastPrice) {
          setPriceDirection('up');
        } else if (currentPrice < lastPrice) {
          setPriceDirection('down');
        }
      }
      setLastPrice(currentPrice);
    }
  }, [ticker, lastPrice]);

  // Merge multi-exchange data into liveCryptoData
  useEffect(() => {
    if (!multiExchangeData.loading && multiExchangeData.data) {
      // Use Binance as the primary source for the crypto list
      const merged: {[key: string]: any} = {};
      
      // Start with Binance data as base
      if (multiExchangeData.data.binance) {
        Object.entries(multiExchangeData.data.binance).forEach(([symbol, data]) => {
          merged[symbol] = data;
        });
      }
      
      setLiveCryptoData(merged);
    }
  }, [multiExchangeData.data, multiExchangeData.loading]);

  // Open discovery modal from events
  useEffect(() => {
    const open = (e: any) => {
      const q = e?.detail?.query || '';
      setDiscoverQuery(q);
      setDiscoverTab('volume');
      setShowDiscover(true);
    };
    window.addEventListener('open-community-discover', open as any);
    return () => window.removeEventListener('open-community-discover', open as any);
  }, []);

  // Format cryptocurrency data
  const cryptoCommunities: CommunityItem[] = useMemo(() => {
    const coinMetadata: {[key: string]: {name: string, icon: string, description: string, tags: string[]}} = {
      'BTC': { name: 'Bitcoin', icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', description: 'Digital gold and store of value', tags: ['layer-1', 'pow'] },
      'ETH': { name: 'Ethereum', icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', description: 'Smart contracts and DeFi platform', tags: ['layer-1', 'defi'] },
      'BNB': { name: 'BNB', icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', description: 'Binance ecosystem token', tags: ['exchange', 'defi'] },
      'SOL': { name: 'Solana', icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', description: 'High-performance blockchain', tags: ['layer-1', 'fast'] },
      'ADA': { name: 'Cardano', icon: 'https://assets.coingecko.com/coins/images/975/small/cardano.png', description: 'Proof-of-stake blockchain platform', tags: ['layer-1', 'pos'] },
      'DOGE': { name: 'Dogecoin', icon: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', description: 'Original meme cryptocurrency', tags: ['meme', 'payments'] },
      'XRP': { name: 'XRP', icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', description: 'Digital payment protocol', tags: ['payments', 'layer-1'] },
      'DOT': { name: 'Polkadot', icon: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png', description: 'Multi-chain protocol', tags: ['layer-0', 'interoperability'] },
      'MATIC': { name: 'Polygon', icon: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png', description: 'Ethereum scaling solution', tags: ['layer-2', 'scaling'] },
      'AVAX': { name: 'Avalanche', icon: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', description: 'Fast smart contracts platform', tags: ['layer-1', 'defi'] },
      'LINK': { name: 'Chainlink', icon: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', description: 'Decentralized oracle network', tags: ['oracle', 'infrastructure'] },
      'UNI': { name: 'Uniswap', icon: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png', description: 'Leading DEX protocol', tags: ['defi', 'dex'] },
      'LTC': { name: 'Litecoin', icon: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png', description: 'Silver to Bitcoin\'s gold', tags: ['payments', 'pow'] },
      'ATOM': { name: 'Cosmos', icon: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png', description: 'Internet of blockchains', tags: ['layer-0', 'interoperability'] },
      'SHIB': { name: 'Shiba Inu', icon: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png', description: 'Meme token ecosystem', tags: ['meme', 'defi'] },
      'TRX': { name: 'TRON', icon: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png', description: 'Decentralized entertainment', tags: ['layer-1', 'entertainment'] },
      'BCH': { name: 'Bitcoin Cash', icon: 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png', description: 'Bitcoin fork for payments', tags: ['payments', 'pow'] },
      'NEAR': { name: 'NEAR Protocol', icon: 'https://assets.coingecko.com/coins/images/10365/small/near_icon.png', description: 'Scalable blockchain platform', tags: ['layer-1', 'sharding'] },
      'APT': { name: 'Aptos', icon: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png', description: 'Next-gen Layer 1 blockchain', tags: ['layer-1', 'move'] },
      'ARB': { name: 'Arbitrum', icon: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg', description: 'Ethereum L2 scaling', tags: ['layer-2', 'rollup'] },
      'OP': { name: 'Optimism', icon: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png', description: 'Ethereum L2 solution', tags: ['layer-2', 'rollup'] },
      'FIL': { name: 'Filecoin', icon: 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png', description: 'Decentralized storage network', tags: ['storage', 'web3'] },
      'AAVE': { name: 'Aave', icon: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png', description: 'DeFi lending protocol', tags: ['defi', 'lending'] },
      'MKR': { name: 'Maker', icon: 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png', description: 'Decentralized stablecoin', tags: ['defi', 'stablecoin'] },
      'GRT': { name: 'The Graph', icon: 'https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png', description: 'Indexing protocol', tags: ['infrastructure', 'web3'] },
      'ALGO': { name: 'Algorand', icon: 'https://assets.coingecko.com/coins/images/4380/small/download.png', description: 'Pure proof-of-stake blockchain', tags: ['layer-1', 'pos'] },
      'VET': { name: 'VeChain', icon: 'https://assets.coingecko.com/coins/images/1167/small/VET_Token_Icon.png', description: 'Supply chain blockchain', tags: ['layer-1', 'enterprise'] },
      'ICP': { name: 'Internet Computer', icon: 'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png', description: 'Decentralized cloud', tags: ['layer-1', 'cloud'] },
      'XLM': { name: 'Stellar', icon: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png', description: 'Cross-border payments', tags: ['payments', 'layer-1'] },
      'ETC': { name: 'Ethereum Classic', icon: 'https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png', description: 'Original Ethereum chain', tags: ['layer-1', 'pow'] },
      'THETA': { name: 'Theta Network', icon: 'https://assets.coingecko.com/coins/images/2538/small/theta-token-logo.png', description: 'Decentralized video streaming', tags: ['media', 'infrastructure'] },
      'XMR': { name: 'Monero', icon: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png', description: 'Privacy-focused cryptocurrency', tags: ['privacy', 'pow'] },
      'FTM': { name: 'Fantom', icon: 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png', description: 'Fast DeFi platform', tags: ['layer-1', 'defi'] },
      'SAND': { name: 'The Sandbox', icon: 'https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg', description: 'Metaverse gaming platform', tags: ['gaming', 'metaverse'] },
      'MANA': { name: 'Decentraland', icon: 'https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png', description: 'Virtual reality platform', tags: ['metaverse', 'gaming'] },
      'AXS': { name: 'Axie Infinity', icon: 'https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png', description: 'Play-to-earn game', tags: ['gaming', 'nft'] },
      'USDT': { name: 'Tether', icon: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', description: 'USD stablecoin', tags: ['stablecoin'] },
      'USDC': { name: 'USD Coin', icon: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png', description: 'USD stablecoin', tags: ['stablecoin'] },
      'BUSD': { name: 'Binance USD', icon: 'https://assets.coingecko.com/coins/images/9576/small/BUSD.png', description: 'Binance stablecoin', tags: ['stablecoin'] },
      'DAI': { name: 'Dai', icon: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png', description: 'Decentralized stablecoin', tags: ['stablecoin', 'defi'] }
    };

    const items: CommunityItem[] = [];
    Object.entries(liveCryptoData).forEach(([symbol, data]) => {
      const baseSymbol = symbol.replace('USDT', '');
      const metadata = coinMetadata[baseSymbol];
      
      items.push({
        id: baseSymbol.toLowerCase(),
        symbol: baseSymbol,
        name: metadata?.name || baseSymbol,
        iconUrl: metadata?.icon || `https://ui-avatars.com/api/?name=${baseSymbol}&background=7C3AED&color=fff&size=128`,
        description: metadata?.description || `${baseSymbol}/USDT trading pair`,
        tags: metadata?.tags || ['crypto'],
        price: parseFloat(data.lastPrice),
        priceChange24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.quoteVolume),
        marketCap: parseFloat(data.quoteVolume) * 10,
        createdAt: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365
      });
    });
    
    return items;
  }, [liveCryptoData]);

  // Initialize with Bitcoin
  useEffect(() => {
    if (!selectedCrypto && cryptoCommunities.length > 0) {
      setSelectedCrypto(cryptoCommunities[0]);
    }
  }, [cryptoCommunities, selectedCrypto]);

  // Load/save panels - only after cryptoCommunities is populated
  useEffect(() => {
    // Don't load panels until we have crypto data
    if (cryptoCommunities.length === 0) return;
    
    try {
      const saved = localStorage.getItem('terminal-panels');
      if (saved) {
        const savedPanels = JSON.parse(saved);
        // Validate that saved panels have valid crypto objects
        const validPanels = savedPanels.filter((p: Panel) => p.crypto && p.crypto.symbol);
        
        if (validPanels.length > 0) {
          setPanels(validPanels);
          return;
        }
      }
      
      // Create default panels if no valid saved panels
      const defaultPanels: Panel[] = [
        {
          id: `panel-${Date.now()}-1`,
          type: 'chart',
          crypto: cryptoCommunities[0],
          timeframe: '15m',
          x: 20,
          y: 0,
          width: 600,
          height: 400,
          exchange: 'binance'
        },
        {
          id: `panel-${Date.now()}-2`,
          type: 'orderbook',
          crypto: cryptoCommunities[0],
          timeframe: '15m',
          x: 640,
          y: 0,
          width: 300,
          height: 400,
          exchange: 'binance'
        }
      ];
      setPanels(defaultPanels);
    } catch (error) {
      console.error('Failed to load panels:', error);
    }
  }, [cryptoCommunities]);

  useEffect(() => {
    try {
      localStorage.setItem('terminal-panels', JSON.stringify(panels));
    } catch (error) {
      console.error('Failed to save panels:', error);
    }
  }, [panels]);

  const addPanel = (type: PanelType) => {
    const offset = panels.length * 30;
    const defaultWidth = type === 'chart' ? 600 
                       : type === 'orderbook' ? 380
                       : type === 'watchlist' ? 350
                       : type === 'news' ? 350
                       : type === 'alerts' ? 350
                       : type === 'portfolio' ? 400
                       : 400;
    
    const defaultHeight = type === 'orderbook' ? 800 
                        : type === 'watchlist' ? 600
                        : 400;
    
    const newPanel: Panel = {
      id: `panel-${Date.now()}`,
      type,
      crypto: currentCrypto,
      timeframe: timeframe,
      x: 20 + offset,
      y: 0 + offset,
      width: defaultWidth,
      height: defaultHeight,
      exchange: 'binance'
    };
    setPanels([...panels, newPanel]);
    setShowAddPanelMenu(false);
  };

  const removePanel = (id: string) => {
    setPanels(panels.filter(p => p.id !== id));
  };

  const updatePanelTimeframe = (id: string, newTimeframe: Panel['timeframe']) => {
    setPanels(panels.map(p => p.id === id ? { ...p, timeframe: newTimeframe } : p));
  };

  const togglePanelLink = (panelId: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    if (panel.linkGroup) {
      // Unlink this panel
      setPanels(panels.map(p => 
        p.id === panelId ? { ...p, linkGroup: null } : p
      ));
    } else {
      // Link this panel to the main group
      setPanels(panels.map(p => 
        p.id === panelId ? { ...p, linkGroup: 'main' } : p
      ));
    }
  };

  const getLinkedPanelsCount = (panelId: string): number => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel?.linkGroup) return 0;
    return panels.filter(p => p.linkGroup === panel.linkGroup).length;
  };

  const updatePanelExchange = (panelId: string, exchange: Exchange) => {
    setPanels(panels.map(p => p.id === panelId ? { ...p, exchange } : p));
  };

  const handleJoinCrypto = (item: CommunityItem) => {
    setSelectedCrypto(item);
    
    if (searchOriginPanelId) {
      const originPanel = panels.find(p => p.id === searchOriginPanelId);
      
      if (originPanel?.linkGroup) {
        // Update all panels in the same link group
        setPanels(panels.map(panel => 
          panel.linkGroup === originPanel.linkGroup
            ? { ...panel, crypto: item }
            : panel
        ));
      } else {
        // Update only the specific panel that opened the search
        setPanels(panels.map(panel => 
          panel.id === searchOriginPanelId 
            ? { ...panel, crypto: item }
            : panel
        ));
      }
    } else {
      // Add a new chart panel (opened from top bar)
      const offset = panels.length * 30;
      const newPanel: Panel = {
        id: `panel-${Date.now()}`,
        type: 'chart',
        crypto: item,
        timeframe: timeframe,
        x: 20 + offset,
        y: 0 + offset,
        width: 600,
        height: 400,
        exchange: 'binance'
      };
      setPanels([...panels, newPanel]);
    }
    
    setShowDiscover(false);
    setSearchOriginPanelId(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const snapToGrid = (value: number) => {
    const gridSize = 20;
    return Math.round(value / gridSize) * gridSize;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const panelId = active.id as string;
    
    setPanels(panels.map(p => {
      if (p.id === panelId) {
        return {
          ...p,
          x: snapToGridEnabled ? snapToGrid(p.x + delta.x) : p.x + delta.x,
          y: snapToGridEnabled ? snapToGrid(p.y + delta.y) : p.y + delta.y
        };
      }
      return p;
    }));
  };

  const autoOrganizePanels = () => {
    const containerWidth = 1200;
    const containerHeight = 600;
    const gap = 20;
    
    let cols = Math.ceil(Math.sqrt(panels.length));
    let rows = Math.ceil(panels.length / cols);
    
    const panelWidth = (containerWidth - (cols + 1) * gap) / cols;
    const panelHeight = (containerHeight - (rows + 1) * gap) / rows;
    
    const organized = panels.map((panel, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      return {
        ...panel,
        x: gap + col * (panelWidth + gap),
        y: gap + row * (panelHeight + gap),
        width: Math.max(300, panelWidth),
        height: Math.max(250, panelHeight)
      };
    });
    
    setPanels(organized);
  };

  const bringToFront = (panelId: string) => {
    setTopPanelId(panelId);
  };

  const canvasSize = useMemo(() => {
    if (panels.length === 0) {
      return { width: 3000, height: 2000 };
    }
    
    let maxX = 0;
    let maxY = 0;
    
    panels.forEach(panel => {
      const rightEdge = panel.x + panel.width;
      const bottomEdge = panel.y + panel.height;
      
      if (rightEdge > maxX) maxX = rightEdge;
      if (bottomEdge > maxY) maxY = bottomEdge;
    });
    
    return {
      width: Math.max(2000, maxX + 800),
      height: Math.max(1500, maxY + 800)
    };
  }, [panels]);

  const currentCrypto = selectedCrypto || cryptoCommunities[0];

  const formatVolume = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000000) return (num / 1000000000).toFixed(3) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(3) + 'M';
    return num.toFixed(2);
  };

  const formatPrice = (value: string) => {
    const num = parseFloat(value);
    if (num < 1) return num.toFixed(4);
    return num.toFixed(2);
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white" style={{ fontFamily: "'Nunito Sans', sans-serif", minHeight: '100vh' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .resize-handle-right:hover { background: rgba(255, 255, 255, 0.1) !important; }
        .resize-handle-bottom:hover { background: rgba(255, 255, 255, 0.1) !important; }
        .resize-handle-corner:hover { background: rgba(255, 255, 255, 0.15) !important; border: 1px solid rgba(255, 255, 255, 0.3) !important; }
        .resize-handle-right:active { background: rgba(255, 255, 255, 0.15) !important; }
        .resize-handle-bottom:active { background: rgba(255, 255, 255, 0.15) !important; }
        .resize-handle-corner:active { background: rgba(255, 255, 255, 0.2) !important; border: 1px solid rgba(255, 255, 255, 0.4) !important; }
      `}</style>
      
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="inline-flex items-center px-4 py-2.5 gap-4 relative overflow-hidden mt-2 ml-16 transition-all duration-300" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.85) 0%, rgba(15, 10, 20, 0.9) 50%, rgba(20, 15, 25, 0.95) 100%)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 24px rgba(124, 58, 237, 0.08), 0 2px 8px rgba(0, 0, 0, 0.2)',
            borderRadius: '14px',
            zIndex: 1000,
            width: 'auto',
            maxHeight: isStatsBarCollapsed ? '60px' : '80px',
            opacity: isStatsBarCollapsed ? 0.7 : 1
          }}>
            <div className="absolute inset-0 opacity-20" style={{
              background: 'radial-gradient(circle at 30% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 60%)',
              animation: 'pulse 4s ease-in-out infinite'
            }}></div>

            <div className="flex items-center gap-3 relative z-10">
              <button 
                onClick={() => {
                  setSearchOriginPanelId(null);
                  setShowDiscover(true);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-110 p-1.5" style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)',
                  border: '1.5px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.2), inset 0 0 15px rgba(139, 92, 246, 0.1)'
                }}>
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(139, 92, 246, 0.4) 50%, transparent 100%)',
                    animation: 'spin 3s linear infinite'
                  }}></div>
                  <img 
                    src={currentCrypto?.iconUrl || 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'} 
                    alt={currentCrypto?.name || 'Bitcoin'} 
                    className="w-full h-full object-contain relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="text-base font-bold leading-tight transition-all duration-300" style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E9D5FF 50%, #C084FC 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 20px rgba(192, 132, 252, 0.3)'
                  }}>
                    {currentCrypto?.symbol || 'BTC'}USDT
                  </div>
                  <span className="text-[11px] font-semibold text-purple-400">Perpetual</span>
                </div>
              </button>
              <button
                className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-white ring-1 ring-purple-400/30 transition-all duration-300 hover:scale-110 active:scale-95"
                onClick={() => {
                  setSearchOriginPanelId(null);
                  setShowDiscover(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.15) 100%)',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <Search className="w-4 h-4" />
              </button>
              
              <div className="relative">
                <button 
                  ref={addPanelButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddPanelMenu(!showAddPanelMenu);
                  }}
                  className="p-1.5 text-white hover:bg-[#2E2744] rounded-full border border-[#7C3AED] transition-all"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
                >
                  <Plus className="w-4 h-4" />
                </button>
                
                {showAddPanelMenu && addPanelButtonRef.current && createPortal(
                  <div 
                    className="fixed min-w-[200px] rounded-xl overflow-hidden" 
                    style={{
                      background: 'rgba(15, 15, 20, 0.98)',
                      backdropFilter: 'blur(40px)',
                      border: '1px solid rgba(124, 58, 237, 0.4)',
                      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
                      zIndex: 9999,
                      top: `${addPanelButtonRef.current.getBoundingClientRect().bottom + 8}px`,
                      right: `${window.innerWidth - addPanelButtonRef.current.getBoundingClientRect().right}px`
                    }}
                  >
                    <div className="p-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('chart');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Simple Chart</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('advanced-chart');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Advanced Chart (Drawing)</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('liquidations');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <TrendingDown className="w-4 h-4" />
                        <span>Liquidations</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('aggregated-orderbook');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <Layout className="w-4 h-4" />
                        <span>Aggregated Order Book</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('depth-chart');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Depth Chart</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('heatmap');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Price Heatmap</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('watchlist');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Watchlist</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('orderbook');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <Layout className="w-4 h-4" />
                        <span>Order Book</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('news');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <Newspaper className="w-4 h-4" />
                        <span>News Feed</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('alerts');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <Bell className="w-4 h-4" />
                        <span>Price Alerts</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('portfolio');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>Portfolio</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addPanel('market');
                        }} 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-left text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all flex items-center gap-3"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Market Overview</span>
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  autoOrganizePanels();
                }} 
                className="p-1.5 rounded-full border text-[#B0B0B0] border-[#2E2744] hover:bg-[#2E2744] transition-all"
                title="Auto-organize panels"
              >
                <Layout className="w-4 h-4" />
              </button>
            </div>

            <CommunityDiscoverModal
              isOpen={showDiscover}
              initialTab={discoverTab}
              initialQuery={discoverQuery}
              onClose={() => setShowDiscover(false)}
              onJoin={handleJoinCrypto}
              items={cryptoCommunities}
            />

            {!isStatsBarCollapsed && (
              <>
                <div className="w-px h-10 relative z-10" style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(160, 106, 255, 0.5), transparent)'
                }}></div>

                <div className="flex items-center gap-3 relative z-10">
              <div className="flex flex-col gap-0.5 relative">
                <div className="relative leading-none transition-all duration-300" style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  letterSpacing: '-0.03em',
                  color: priceDirection === 'up' ? '#6EE7B7' : '#EF4444',
                  textShadow: priceDirection === 'up' ? '0 0 16px rgba(110, 231, 183, 0.4)' : '0 0 16px rgba(239, 68, 68, 0.4)'
                }}>
                  {ticker ? formatPrice(ticker.lastPrice) : '0.0000'}
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block self-start transition-all duration-300 flex items-center gap-1 ${
                  ticker && parseFloat(ticker.priceChangePercent) >= 0 ? 'border border-emerald-400/60' : 'border border-red-400/60'
                }`} style={{
                  background: ticker && parseFloat(ticker.priceChangePercent) >= 0 ? 'linear-gradient(135deg, rgba(46, 189, 133, 0.3) 0%, rgba(16, 185, 129, 0.2) 100%)' : 'linear-gradient(135deg, rgba(239, 69, 74, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)',
                  backdropFilter: 'blur(12px)',
                  color: ticker && parseFloat(ticker.priceChangePercent) >= 0 ? '#6EE7B7' : '#FCA5A5',
                  boxShadow: ticker && parseFloat(ticker.priceChangePercent) >= 0 ? '0 0 16px rgba(46, 189, 133, 0.5)' : '0 0 16px rgba(239, 69, 74, 0.5)'
                }}>
                  <span className="text-[10px]">{ticker && parseFloat(ticker.priceChangePercent) >= 0 ? '▲' : '▼'}</span>
                  <span>{ticker ? `${Math.abs(parseFloat(ticker.priceChangePercent)).toFixed(2)}%` : '0.00%'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-6">
                {[
                  { label: '24H HIGH', value: ticker ? formatPrice(ticker.highPrice) : '0.0000', color: '#6EE7B7' },
                  { label: '24H LOW', value: ticker ? formatPrice(ticker.lowPrice) : '0.0000', color: '#FCA5A5' },
                  { label: 'VOL (BTC)', value: ticker ? formatVolume(ticker.volume) : '0', color: '#FFFFFF' },
                  { label: 'VOL (USDT)', value: ticker ? formatVolume(ticker.quoteVolume) : '0', color: '#FFFFFF' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1 px-3 py-2 rounded-2xl transition-all duration-300 hover:scale-105 cursor-default">
                    <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">{stat.label}</div>
                    <div className="text-base font-black" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
            </>
            )}

            {/* Hide/Show Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsStatsBarCollapsed(!isStatsBarCollapsed);
              }}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-white ring-1 ring-purple-400/30 transition-all duration-300 hover:scale-110 active:scale-95 ml-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.15) 100%)',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
              title={isStatsBarCollapsed ? "Show stats" : "Hide stats"}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isStatsBarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div 
              className="flex-1 relative overflow-auto" 
              onClick={() => {
                setTopPanelId(null);
                setShowAddPanelMenu(false);
              }}
            >
              <div className="relative" style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px`, minWidth: '100%', minHeight: '100%' }}>
                {panels.map((panel) => (
                  <DraggablePanel
                    key={panel.id}
                    panel={panel}
                    onRemove={removePanel}
                    onResize={(id, width, height) => {
                      setPanels(panels.map(p => p.id === id ? { ...p, width, height } : p));
                    }}
                    isTop={topPanelId === panel.id}
                    onBringToFront={bringToFront}
                    onTimeframeChange={updatePanelTimeframe}
                    ticker={ticker}
                    onOpenSearch={() => {
                      setSearchOriginPanelId(panel.id);
                      setShowDiscover(true);
                    }}
                    liveCryptoData={liveCryptoData}
                    onToggleLink={togglePanelLink}
                    linkedPanelsCount={getLinkedPanelsCount(panel.id)}
                    onExchangeChange={updatePanelExchange}
                    onCoinClick={(panelId, symbol) => {
                      const cryptoItem = cryptoCommunities.find(c => c.symbol === symbol.replace('USDT', ''));
                      if (cryptoItem) {
                        setPanels(panels.map(p => p.id === panelId ? { ...p, crypto: cryptoItem } : p));
                        setSelectedCrypto(cryptoItem);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </DndContext>
        </main>
      </div>
    </div>
  );
}
