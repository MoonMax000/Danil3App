import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Star, Search, X, Trash2, Edit2, FolderPlus, TrendingUp, TrendingDown } from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  icon: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  isFavorite?: boolean;
}

interface WatchlistGroup {
  id: string;
  name: string;
  assets: Asset[];
  isExpanded: boolean;
  isEditable: boolean;
}

interface WatchlistProps {
  onAssetClick?: (symbol: string) => void;
}

type SortColumn = 'symbol' | 'price' | 'change' | 'changePercent' | 'volume';
type SortDirection = 'asc' | 'desc';

export default function Watchlist({ onAssetClick }: WatchlistProps) {
  const [lists, setLists] = useState<WatchlistGroup[]>([]);
  const [currentListIndex, setCurrentListIndex] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveData, setLiveData] = useState<{[key: string]: any}>({});
  const [sortColumn, setSortColumn] = useState<SortColumn>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

  // Available crypto assets for adding
  const availableAssets = useMemo(() => [
    { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'BNBUSDT', name: 'BNB', icon: '◆' },
    { symbol: 'SOLUSDT', name: 'Solana', icon: 'S' },
    { symbol: 'ADAUSDT', name: 'Cardano', icon: 'A' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
    { symbol: 'XRPUSDT', name: 'XRP', icon: 'X' },
    { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●' },
    { symbol: 'MATICUSDT', name: 'Polygon', icon: 'M' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', icon: 'A' },
    { symbol: 'LINKUSDT', name: 'Chainlink', icon: 'L' },
    { symbol: 'UNIUSDT', name: 'Uniswap', icon: 'U' },
  ], []);

  // Initialize default list
  useEffect(() => {
    const savedLists = localStorage.getItem('watchlists');
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    } else {
      setLists([{
        id: 'default',
        name: 'My Watchlist',
        isExpanded: true,
        isEditable: true,
        assets: availableAssets.slice(0, 5).map(a => ({
          ...a,
          lastPrice: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          isFavorite: false
        }))
      }]);
    }
  }, [availableAssets]);

  // Save lists to localStorage
  useEffect(() => {
    if (lists.length > 0) {
      localStorage.setItem('watchlists', JSON.stringify(lists));
    }
  }, [lists]);

  // Fetch live data from Binance
  useEffect(() => {
    const symbols = Array.from(new Set(
      lists.flatMap(list => list.assets.map(a => a.symbol))
    ));
    
    if (symbols.length === 0) return;

    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${symbols.map(s => `${s.toLowerCase()}@ticker`).join('/')}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.data) {
        const ticker = data.data;
        setLiveData(prev => ({
          ...prev,
          [ticker.s]: {
            lastPrice: parseFloat(ticker.c),
            change: parseFloat(ticker.p),
            changePercent: parseFloat(ticker.P),
            volume: parseFloat(ticker.v)
          }
        }));
      }
    };

    return () => ws.close();
  }, [lists]);

  // Update assets with live data
  useEffect(() => {
    setLists(prev => prev.map(list => ({
      ...list,
      assets: list.assets.map(asset => ({
        ...asset,
        lastPrice: liveData[asset.symbol]?.lastPrice || asset.lastPrice,
        change: liveData[asset.symbol]?.change || asset.change,
        changePercent: liveData[asset.symbol]?.changePercent || asset.changePercent,
        volume: liveData[asset.symbol]?.volume || asset.volume
      }))
    })));
  }, [liveData]);

  const currentList = lists[currentListIndex];

  const sortedAssets = useMemo(() => {
    if (!currentList) return [];
    
    const sorted = [...currentList.assets];
    sorted.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortColumn) {
        case 'symbol':
          aVal = a.symbol;
          bVal = b.symbol;
          break;
        case 'price':
          aVal = a.lastPrice;
          bVal = b.lastPrice;
          break;
        case 'change':
          aVal = a.change;
          bVal = b.change;
          break;
        case 'changePercent':
          aVal = a.changePercent;
          bVal = b.changePercent;
          break;
        case 'volume':
          aVal = a.volume;
          bVal = b.volume;
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [currentList, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    onAssetClick?.(asset.symbol);
  };

  const addAssetToList = (assetData: typeof availableAssets[0]) => {
    const newAsset: Asset = {
      ...assetData,
      lastPrice: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      isFavorite: false
    };
    
    setLists(prev => prev.map((list, idx) => 
      idx === currentListIndex 
        ? { ...list, assets: [...list.assets, newAsset] }
        : list
    ));
    setShowAddAsset(false);
    setSearchQuery('');
  };

  const removeAsset = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLists(prev => prev.map((list, idx) =>
      idx === currentListIndex
        ? { ...list, assets: list.assets.filter(a => a.symbol !== symbol) }
        : list
    ));
  };

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLists(prev => prev.map((list, idx) =>
      idx === currentListIndex
        ? { 
            ...list, 
            assets: list.assets.map(a => 
              a.symbol === symbol ? { ...a, isFavorite: !a.isFavorite } : a
            )
          }
        : list
    ));
  };

  const createNewList = () => {
    if (!newListName.trim()) return;
    
    setLists(prev => [...prev, {
      id: `list-${Date.now()}`,
      name: newListName,
      isExpanded: true,
      isEditable: true,
      assets: []
    }]);
    setCurrentListIndex(lists.length);
    setNewListName('');
    setShowNewListDialog(false);
    setShowListMenu(false);
  };

  const deleteList = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (lists.length === 1) return;
    
    setLists(prev => prev.filter((_, idx) => idx !== index));
    if (currentListIndex >= index && currentListIndex > 0) {
      setCurrentListIndex(currentListIndex - 1);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '—';
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change: number) => {
    if (change === 0) return '—';
    const sign = change > 0 ? '+' : '';
    return sign + change.toFixed(2);
  };

  const formatChangePercent = (percent: number) => {
    if (percent === 0) return '—';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const formatVolume = (volume: number) => {
    if (volume === 0) return '—';
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  const getAssetColor = (symbol: string) => {
    return symbol.includes('BTC') ? '#F7931A'
         : symbol.includes('ETH') ? '#627EEA'
         : symbol.includes('BNB') ? '#F3BA2F'
         : symbol.includes('SOL') ? '#9945FF'
         : symbol.includes('ADA') ? '#0033AD'
         : symbol.includes('DOGE') ? '#C2A633'
         : symbol.includes('XRP') ? '#23292F'
         : symbol.includes('DOT') ? '#E6007A'
         : symbol.includes('MATIC') ? '#8247E5'
         : symbol.includes('AVAX') ? '#E84142'
         : symbol.includes('LINK') ? '#2A5ADA'
         : '#26A69A';
  };

  if (!currentList) return <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0E0E0E] to-[#131722] text-white">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2.5 border-b backdrop-blur-xl relative overflow-hidden"
        style={{
          borderColor: 'rgba(139, 92, 246, 0.2)',
          background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.9) 0%, rgba(20, 20, 30, 0.95) 100%)',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
          }}/>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setShowListMenu(!showListMenu)}
            className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-lg transition-all group"
          >
            <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              {currentList.name}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
          </button>
          
          {showListMenu && (
            <div 
              className="absolute top-full left-0 mt-2 min-w-[200px] rounded-xl overflow-hidden z-50"
              style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.98) 0%, rgba(15, 15, 25, 0.98) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="p-2">
                {lists.map((list, idx) => (
                  <div key={list.id} className="group flex items-center justify-between">
                    <button
                      onClick={() => {
                        setCurrentListIndex(idx);
                        setShowListMenu(false);
                      }}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg text-left transition-all ${
                        idx === currentListIndex
                          ? 'bg-purple-500/20 text-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {list.name}
                    </button>
                    {list.isEditable && lists.length > 1 && (
                      <button
                        onClick={(e) => deleteList(idx, e)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    setShowNewListDialog(true);
                    setShowListMenu(false);
                  }}
                  className="w-full px-3 py-2 text-sm font-medium text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all flex items-center gap-2 mt-1"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Create new list</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={() => setShowAddAsset(!showAddAsset)}
            className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-all group"
            title="Add symbol"
          >
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
          </button>
          <button 
            className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-all group"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Add Asset Dialog */}
      {showAddAsset && (
        <div className="px-3 py-2 border-b border-white/10 bg-[#131722]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              autoFocus
            />
          </div>
          <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
            {availableAssets
              .filter(a => 
                !currentList.assets.find(ca => ca.symbol === a.symbol) &&
                (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 a.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map(asset => (
                <button
                  key={asset.symbol}
                  onClick={() => addAssetToList(asset)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded transition-all"
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: getAssetColor(asset.symbol) }}
                  >
                    {asset.icon}
                  </div>
                  <span className="text-sm text-white">{asset.symbol.replace('USDT', '')}</span>
                  <span className="text-xs text-gray-500">{asset.name}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Column Headers */}
      <div 
        className="grid grid-cols-[auto_1fr_0.7fr_0.6fr_0.7fr] gap-2 px-3 py-2 border-b border-white/5 text-xs font-semibold backdrop-blur-sm"
        style={{ background: 'rgba(20, 20, 30, 0.5)' }}
      >
        <div className="w-6" />
        <button 
          onClick={() => handleSort('symbol')}
          className="flex items-center gap-1 text-left text-gray-400 hover:text-white transition-colors group"
        >
          <span>Symbol</span>
          {sortColumn === 'symbol' && (
            sortDirection === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
          )}
        </button>
        <button 
          onClick={() => handleSort('price')}
          className="flex items-center gap-1 text-right justify-end text-gray-400 hover:text-white transition-colors"
        >
          <span>Last</span>
          {sortColumn === 'price' && (
            sortDirection === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
          )}
        </button>
        <button 
          onClick={() => handleSort('change')}
          className="flex items-center gap-1 text-right justify-end text-gray-400 hover:text-white transition-colors"
        >
          <span>Chg</span>
          {sortColumn === 'change' && (
            sortDirection === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
          )}
        </button>
        <button 
          onClick={() => handleSort('changePercent')}
          className="flex items-center gap-1 text-right justify-end text-gray-400 hover:text-white transition-colors"
        >
          <span>Chg%</span>
          {sortColumn === 'changePercent' && (
            sortDirection === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Assets List */}
      <div className="flex-1 overflow-y-auto">
        {sortedAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
            <div className="text-gray-500 text-sm text-center">
              No symbols added yet
            </div>
            <button
              onClick={() => setShowAddAsset(true)}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Symbol</span>
            </button>
          </div>
        ) : (
          sortedAssets.map(asset => (
            <button
              key={asset.symbol}
              onClick={() => handleAssetClick(asset)}
              onMouseEnter={() => setHoveredAsset(asset.symbol)}
              onMouseLeave={() => setHoveredAsset(null)}
              className={`w-full grid grid-cols-[auto_1fr_0.7fr_0.6fr_0.7fr] gap-2 px-3 py-2.5 transition-all relative group ${
                selectedAsset?.symbol === asset.symbol 
                  ? 'bg-purple-500/10 border-l-2 border-purple-500' 
                  : 'hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              {/* Favorite Star */}
              <button
                onClick={(e) => toggleFavorite(asset.symbol, e)}
                className={`w-6 flex items-center justify-center transition-all ${
                  asset.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
                }`}
              >
                <Star className={`w-4 h-4 ${asset.isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Symbol with Icon */}
              <div className="flex items-center gap-2 text-left">
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-transform group-hover:scale-110"
                  style={{ 
                    background: getAssetColor(asset.symbol),
                    boxShadow: `0 0 12px ${getAssetColor(asset.symbol)}40`
                  }}
                >
                  {asset.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">
                    {asset.symbol.replace('USDT', '')}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {asset.name}
                  </span>
                </div>
              </div>

              {/* Last Price */}
              <div className="text-right text-sm font-semibold text-white flex items-center justify-end">
                {formatPrice(asset.lastPrice)}
              </div>

              {/* Change */}
              <div 
                className={`text-right text-sm font-medium flex items-center justify-end ${
                  asset.change > 0 ? 'text-[#26A69A]' : asset.change < 0 ? 'text-[#EF5350]' : 'text-gray-400'
                }`}
              >
                {formatChange(asset.change)}
              </div>

              {/* Change % */}
              <div className="text-right flex items-center justify-end gap-1">
                <span 
                  className={`text-sm font-bold px-2 py-1 rounded ${
                    asset.changePercent > 0 
                      ? 'bg-[#26A69A]/20 text-[#26A69A]' 
                      : asset.changePercent < 0 
                      ? 'bg-[#EF5350]/20 text-[#EF5350]' 
                      : 'text-gray-400'
                  }`}
                >
                  {formatChangePercent(asset.changePercent)}
                </span>
              </div>

              {/* Delete button on hover */}
              {hoveredAsset === asset.symbol && (
                <button
                  onClick={(e) => removeAsset(asset.symbol, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-red-500/20 hover:bg-red-500/30 rounded transition-all"
                >
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </button>
          ))
        )}
      </div>

      {/* New List Dialog */}
      {showNewListDialog && (
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowNewListDialog(false)}
        >
          <div 
            className="bg-[#131722] rounded-xl p-6 max-w-sm w-full mx-4 border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-4">Create New Watchlist</h3>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createNewList()}
              placeholder="Enter list name..."
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewListDialog(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createNewList}
                disabled={!newListName.trim()}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
