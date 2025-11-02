import { useState, useMemo, useEffect, useRef } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import CommunityDiscoverModal, { CommunityItem } from './discord/CommunityDiscoverModal';
import { useMultiExchangeData } from '@/hooks/useMultiExchangeData';
import { useMultipleAssetMetrics } from '@/hooks/useAssetMetrics';
import { useCorrelations } from '@/hooks/useCorrelations';
import { usePortfolioOptimization } from '@/hooks/usePortfolioOptimization';
import { useMonteCarloSimulation } from '@/hooks/useMonteCarloSimulation';
import { AssetType } from '@/services/assetDataService';
import EfficientFrontierChart from './EfficientFrontierChart';

interface Asset {
  symbol: string;
  name: string;
  allocation: number;
  price: number;
  changePercent: number;
  volume?: number;
}

interface RiskCalculatorProps {
  onClose?: () => void;
}

// Расширенная база: крипто + акции + ETF + облигации + драгметаллы + forex
const ASSET_PROFILES: Record<string, {
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  reliability: 'very-high' | 'high' | 'medium' | 'low' | 'speculative';
  category: string;
  description: string;
  assetType: 'crypto' | 'stock' | 'etf' | 'bond' | 'commodity' | 'forex' | 'other';
}> = {
  // CRYPTOCURRENCIES (Top 100+)
  'BTC': { volatility: 'high', reliability: 'high', category: 'Cryptocurrency', description: 'Digital gold and store of value', assetType: 'crypto' },
  'ETH': { volatility: 'high', reliability: 'high', category: 'Cryptocurrency', description: 'Smart contracts platform', assetType: 'crypto' },
  'BNB': { volatility: 'high', reliability: 'medium', category: 'Exchange Token', description: 'Binance ecosystem token', assetType: 'crypto' },
  'SOL': { volatility: 'extreme', reliability: 'medium', category: 'Smart Contract', description: 'High-performance blockchain', assetType: 'crypto' },
  'XRP': { volatility: 'high', reliability: 'medium', category: 'Payment', description: 'Cross-border payments', assetType: 'crypto' },
  'ADA': { volatility: 'high', reliability: 'medium', category: 'Smart Contract', description: 'Proof-of-stake blockchain', assetType: 'crypto' },
  'AVAX': { volatility: 'extreme', reliability: 'medium', category: 'Smart Contract', description: 'Avalanche network', assetType: 'crypto' },
  'DOT': { volatility: 'extreme', reliability: 'medium', category: 'Interoperability', description: 'Multi-chain protocol', assetType: 'crypto' },
  'MATIC': { volatility: 'high', reliability: 'medium', category: 'Layer 2', description: 'Ethereum scaling solution', assetType: 'crypto' },
  'LINK': { volatility: 'high', reliability: 'medium', category: 'Oracle', description: 'Decentralized oracle network', assetType: 'crypto' },
  'UNI': { volatility: 'extreme', reliability: 'medium', category: 'DeFi', description: 'Leading DEX protocol', assetType: 'crypto' },
  'ATOM': { volatility: 'high', reliability: 'medium', category: 'Interoperability', description: 'Internet of blockchains', assetType: 'crypto' },
  'LTC': { volatility: 'high', reliability: 'medium', category: 'Payment', description: 'Silver to Bitcoin\'s gold', assetType: 'crypto' },
  'APT': { volatility: 'extreme', reliability: 'low', category: 'Smart Contract', description: 'Next-gen Layer 1', assetType: 'crypto' },
  'ARB': { volatility: 'extreme', reliability: 'medium', category: 'Layer 2', description: 'Ethereum L2 scaling', assetType: 'crypto' },
  'OP': { volatility: 'extreme', reliability: 'medium', category: 'Layer 2', description: 'Optimistic rollup', assetType: 'crypto' },
  'DOGE': { volatility: 'extreme', reliability: 'speculative', category: 'Meme Coin', description: 'Original meme coin', assetType: 'crypto' },
  'SHIB': { volatility: 'extreme', reliability: 'speculative', category: 'Meme Coin', description: 'Meme token ecosystem', assetType: 'crypto' },
  'PEPE': { volatility: 'extreme', reliability: 'speculative', category: 'Meme Coin', description: 'Meme cryptocurrency', assetType: 'crypto' },
  'USDT': { volatility: 'low', reliability: 'high', category: 'Stablecoin', description: 'USD stablecoin', assetType: 'crypto' },
  'USDC': { volatility: 'low', reliability: 'very-high', category: 'Stablecoin', description: 'USD-backed stablecoin', assetType: 'crypto' },
  'DAI': { volatility: 'low', reliability: 'high', category: 'Stablecoin', description: 'Decentralized stablecoin', assetType: 'crypto' },
  
  // US STOCKS (S&P 500)
  'AAPL': { volatility: 'low', reliability: 'very-high', category: 'Tech Stock', description: 'Apple', assetType: 'stock' },
  'MSFT': { volatility: 'low', reliability: 'very-high', category: 'Tech Stock', description: 'Microsoft', assetType: 'stock' },
  'GOOGL': { volatility: 'medium', reliability: 'very-high', category: 'Tech Stock', description: 'Google', assetType: 'stock' },
  'AMZN': { volatility: 'medium', reliability: 'high', category: 'Tech Stock', description: 'Amazon', assetType: 'stock' },
  'META': { volatility: 'medium', reliability: 'high', category: 'Tech Stock', description: 'Meta', assetType: 'stock' },
  'NFLX': { volatility: 'high', reliability: 'high', category: 'Tech Stock', description: 'Netflix', assetType: 'stock' },
  'NVDA': { volatility: 'high', reliability: 'high', category: 'Semiconductors', description: 'NVIDIA', assetType: 'stock' },
  'TSLA': { volatility: 'extreme', reliability: 'medium', category: 'EV & Tech', description: 'Tesla', assetType: 'stock' },
  'AMD': { volatility: 'high', reliability: 'medium', category: 'Semiconductors', description: 'AMD', assetType: 'stock' },
  'INTC': { volatility: 'medium', reliability: 'high', category: 'Semiconductors', description: 'Intel', assetType: 'stock' },
  'CRM': { volatility: 'medium', reliability: 'high', category: 'Software', description: 'Salesforce', assetType: 'stock' },
  'ORCL': { volatility: 'low', reliability: 'very-high', category: 'Software', description: 'Oracle', assetType: 'stock' },
  'ADBE': { volatility: 'medium', reliability: 'high', category: 'Software', description: 'Adobe', assetType: 'stock' },
  'SNOW': { volatility: 'high', reliability: 'medium', category: 'Software', description: 'Snowflake', assetType: 'stock' },
  'PLTR': { volatility: 'extreme', reliability: 'low', category: 'Software', description: 'Palantir', assetType: 'stock' },
  'JPM': { volatility: 'medium', reliability: 'very-high', category: 'Banking', description: 'JPMorgan', assetType: 'stock' },
  'BAC': { volatility: 'medium', reliability: 'high', category: 'Banking', description: 'Bank of America', assetType: 'stock' },
  'V': { volatility: 'low', reliability: 'very-high', category: 'Payments', description: 'Visa', assetType: 'stock' },
  'MA': { volatility: 'low', reliability: 'very-high', category: 'Payments', description: 'Mastercard', assetType: 'stock' },
  'WMT': { volatility: 'low', reliability: 'very-high', category: 'Retail', description: 'Walmart', assetType: 'stock' },
  'COST': { volatility: 'low', reliability: 'very-high', category: 'Retail', description: 'Costco', assetType: 'stock' },
  'SPY': { volatility: 'low', reliability: 'very-high', category: 'Index Fund', description: 'S&P 500 ETF', assetType: 'etf' },
  'QQQ': { volatility: 'medium', reliability: 'very-high', category: 'Index Fund', description: 'Nasdaq-100', assetType: 'etf' },
  'VOO': { volatility: 'low', reliability: 'very-high', category: 'Index Fund', description: 'Vanguard S&P 500', assetType: 'etf' },
  'VTI': { volatility: 'low', reliability: 'very-high', category: 'Total Market ETF', description: 'Vanguard Total Stock Market', assetType: 'etf' },
  'IWM': { volatility: 'medium', reliability: 'high', category: 'Small-Cap ETF', description: 'Russell 2000', assetType: 'etf' },
  'EEM': { volatility: 'high', reliability: 'medium', category: 'Emerging Markets', description: 'iShares MSCI EM', assetType: 'etf' },
  'VNQ': { volatility: 'medium', reliability: 'high', category: 'Real Estate ETF', description: 'Vanguard Real Estate', assetType: 'etf' },
  'GLD': { volatility: 'medium', reliability: 'high', category: 'Gold ETF', description: 'SPDR Gold Shares', assetType: 'etf' },
  'SLV': { volatility: 'high', reliability: 'medium', category: 'Silver ETF', description: 'iShares Silver Trust', assetType: 'etf' },
  'TLT': { volatility: 'medium', reliability: 'very-high', category: 'Bond ETF', description: '20+ Year Treasury Bond', assetType: 'etf' },
  'AGG': { volatility: 'low', reliability: 'very-high', category: 'Bond ETF', description: 'Core US Aggregate Bond', assetType: 'etf' },
  'HYG': { volatility: 'medium', reliability: 'medium', category: 'High-Yield Bonds', description: 'Corporate Bonds', assetType: 'etf' },

  // PRECIOUS METALS (физические и торгуемые)
  'GOLD': { volatility: 'medium', reliability: 'very-high', category: 'Precious Metal', description: 'Physical Gold - safe haven asset', assetType: 'commodity' },
  'SILVER': { volatility: 'high', reliability: 'high', category: 'Precious Metal', description: 'Physical Silver - industrial & monetary', assetType: 'commodity' },
  'PLATINUM': { volatility: 'high', reliability: 'high', category: 'Precious Metal', description: 'Platinum - industrial precious metal', assetType: 'commodity' },
  'PALLADIUM': { volatility: 'extreme', reliability: 'medium', category: 'Precious Metal', description: 'Palladium - automotive catalyst', assetType: 'commodity' },
  'COPPER': { volatility: 'high', reliability: 'medium', category: 'Industrial Metal', description: 'Copper - economic indicator', assetType: 'commodity' },

  // GOVERNMENT BONDS (разные сроки)
  'US10Y': { volatility: 'low', reliability: 'very-high', category: 'Treasury Bond', description: '10-Year US Treasury - benchmark rate', assetType: 'bond' },
  'US2Y': { volatility: 'low', reliability: 'very-high', category: 'Treasury Bond', description: '2-Year US Treasury - short-term', assetType: 'bond' },
  'US30Y': { volatility: 'medium', reliability: 'very-high', category: 'Treasury Bond', description: '30-Year US Treasury - long-term', assetType: 'bond' },
  'TIPS': { volatility: 'low', reliability: 'very-high', category: 'Inflation-Protected', description: 'Treasury Inflation-Protected Securities', assetType: 'bond' },
  'MUNIS': { volatility: 'low', reliability: 'high', category: 'Municipal Bonds', description: 'Tax-exempt municipal bonds', assetType: 'bond' },

  // FOREX (основные валютные пары)
  'EUR/USD': { volatility: 'medium', reliability: 'very-high', category: 'Major Currency Pair', description: 'Euro vs US Dollar - most traded', assetType: 'forex' },
  'GBP/USD': { volatility: 'medium', reliability: 'high', category: 'Major Currency Pair', description: 'British Pound vs USD', assetType: 'forex' },
  'USD/JPY': { volatility: 'medium', reliability: 'very-high', category: 'Major Currency Pair', description: 'US Dollar vs Japanese Yen', assetType: 'forex' },
  'USD/CHF': { volatility: 'medium', reliability: 'high', category: 'Major Currency Pair', description: 'USD vs Swiss Franc - safe haven', assetType: 'forex' },
  'AUD/USD': { volatility: 'high', reliability: 'high', category: 'Commodity Currency', description: 'Australian Dollar - commodity linked', assetType: 'forex' },
  'USD/CAD': { volatility: 'medium', reliability: 'high', category: 'Commodity Currency', description: 'USD vs Canadian Dollar', assetType: 'forex' },
  'NZD/USD': { volatility: 'high', reliability: 'medium', category: 'Commodity Currency', description: 'New Zealand Dollar', assetType: 'forex' },
  'EUR/GBP': { volatility: 'low', reliability: 'high', category: 'Cross Currency', description: 'Euro vs Pound Sterling', assetType: 'forex' },
  'EUR/JPY': { volatility: 'high', reliability: 'high', category: 'Cross Currency', description: 'Euro vs Japanese Yen', assetType: 'forex' },
};

// Risk Profile Types
type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

interface RiskProfileConfig {
  name: string;
  description: string;
  color: string;
  icon: string;
  recommendations: {
    crypto: { min: number; max: number };
    stocks: { min: number; max: number };
    etf: { min: number; max: number };
    bonds: { min: number; max: number };
    commodities: { min: number; max: number };
  };
  maxVolatility: number;
  minSharpe: number;
}

const RISK_PROFILES: Record<RiskProfile, RiskProfileConfig> = {
  conservative: {
    name: 'Conservative',
    description: 'Low risk, stable returns. Focus on preservation of capital.',
    color: '#26A69A',
    icon: 'shield',
    recommendations: {
      crypto: { min: 0, max: 10 },
      stocks: { min: 20, max: 30 },
      etf: { min: 30, max: 40 },
      bonds: { min: 20, max: 30 },
      commodities: { min: 5, max: 15 },
    },
    maxVolatility: 20,
    minSharpe: 1.5,
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced risk/reward. Mix of growth and stability.',
    color: '#FFA726',
    icon: 'balance',
    recommendations: {
      crypto: { min: 10, max: 30 },
      stocks: { min: 25, max: 40 },
      etf: { min: 15, max: 30 },
      bonds: { min: 10, max: 20 },
      commodities: { min: 5, max: 15 },
    },
    maxVolatility: 40,
    minSharpe: 1.0,
  },
  aggressive: {
    name: 'Aggressive',
    description: 'High risk, high reward. Maximize growth potential.',
    color: '#EF5350',
    icon: 'rocket',
    recommendations: {
      crypto: { min: 30, max: 60 },
      stocks: { min: 20, max: 40 },
      etf: { min: 5, max: 20 },
      bonds: { min: 0, max: 10 },
      commodities: { min: 5, max: 15 },
    },
    maxVolatility: 80,
    minSharpe: 0.5,
  },
};

export default function RiskCalculator({ onClose }: RiskCalculatorProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile>('moderate');
  
  const [newAsset, setNewAsset] = useState({ symbol: '', allocation: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  // Получаем ЖИВЫЕ данные из Binance через тот же хук что и AIAssistant
  // Передаем пустой массив - хук загрузит ВСЕ USDT пары
  const multiExchangeData = useMultiExchangeData([]);
  
  // 🔥 НОВОЕ: Загружаем РЕАЛЬНЫЕ метрики для всех активов в портфеле
  const assetsForMetrics = useMemo(() => {
    return assets.map(asset => ({
      symbol: asset.symbol,
      assetType: (ASSET_PROFILES[asset.symbol]?.assetType || 'other') as AssetType
    }));
  }, [assets.map(a => a.symbol).join(',')]);

  const { metricsMap, isLoading: isLoadingMetrics } = useMultipleAssetMetrics(
    assetsForMetrics,
    assets.length > 0
  );

  // 🔥 НОВОЕ: Корреляционный анализ и диверсификация
  const assetsForCorrelations = useMemo(() => {
    return assets.map(asset => ({
      symbol: asset.symbol,
      assetType: (ASSET_PROFILES[asset.symbol]?.assetType || 'other') as AssetType,
      allocation: asset.allocation
    }));
  }, [assets.map(a => `${a.symbol}:${a.allocation}`).join(',')]);

  const { diversification, isLoading: isLoadingCorrelations } = useCorrelations(
    assetsForCorrelations,
    assets.length >= 2
  );

  // 🔥 НОВОЕ: Portfolio Optimization (MPT)
  const riskTolerance: 'low' | 'medium' | 'high' = 
    selectedProfile === 'conservative' ? 'low'
    : selectedProfile === 'aggressive' ? 'high'
    : 'medium';

  const {
    efficientFrontier,
    minVariancePortfolio,
    maxSharpePortfolio,
    suggestedAllocation,
    isLoading: isLoadingOptimization
  } = usePortfolioOptimization(assetsForCorrelations, riskTolerance, assets.length >= 2);

  // 🔥 НОВОЕ: Monte Carlo симуляции и Stress Testing
  const assetsWithMetrics = useMemo(() => {
    return assets.map(asset => ({
      symbol: asset.symbol,
      allocation: asset.allocation,
      price: asset.price,
      assetType: (ASSET_PROFILES[asset.symbol]?.assetType || 'other') as AssetType
    }));
  }, [assets.map(a => `${a.symbol}:${a.allocation}:${a.price}`).join(',')]);

  const correlationMatrixForMC = useMemo(() => {
    // Создаём матрицу корреляций из diversification или генерируем identity matrix
    if (!diversification || assets.length < 2) return null;
    
    // Генерируем базовую корреляционную матрицу (для простоты используем identity matrix)
    const n = assets.length;
    const matrix: number[][] = Array(n).fill(0).map((_, i) => 
      Array(n).fill(0).map((_, j) => i === j ? 1 : 0.3) // Диагональ = 1, остальное = 0.3 (средняя корреляция)
    );
    
    return matrix;
  }, [diversification, assets.length]);

  const {
    formattedResults: monteCarloResults,
    stressTestResults,
    isLoading: isLoadingMonteCarlo
  } = useMonteCarloSimulation(
    assetsWithMetrics,
    metricsMap,
    correlationMatrixForMC,
    assets.length >= 2 && !isLoadingMetrics && !isLoadingCorrelations
  );
  
  // ОПТИМИЗИРОВАНО: Кешируем данные и не пересчитываем каждую секунду
  const allCryptoCoins = useMemo(() => {
    if (!multiExchangeData.data.binance) {
      return [];
    }
    
    const binanceDataLength = Object.keys(multiExchangeData.data.binance).length;
    if (binanceDataLength === 0) {
      return [];
    }
    
    // Преобразуем все USDT пары из Binance
    const coins = Object.entries(multiExchangeData.data.binance)
      .filter(([symbol]) => {
        return symbol.endsWith('USDT') && 
               !symbol.includes('UP') && 
               !symbol.includes('DOWN') &&
               !symbol.includes('BEAR') &&
               !symbol.includes('BULL');
      })
      .map(([symbol, data]: [string, any]) => {
        const baseSymbol = symbol.replace('USDT', '');
        return {
          symbol: baseSymbol,
          name: baseSymbol,
          price: parseFloat(data.lastPrice || 0),
          changePercent: parseFloat(data.priceChangePercent || 0),
          volume: parseFloat(data.quoteVolume || 0)
        };
      })
      .filter(coin => coin.price > 0);
    
    return coins;
  }, [multiExchangeData.data.binance]);

  // Загружаем портфель по умолчанию ОДИН РАЗ
  const hasLoadedPortfolio = useRef(false);
  
  useEffect(() => {
    if (allCryptoCoins.length > 0 && !hasLoadedPortfolio.current) {
      console.log('🚀 Loading default portfolio with live prices...');
      loadDefaultPortfolio();
      hasLoadedPortfolio.current = true;
    }
  }, [allCryptoCoins.length > 0]); // Проще зависимость

  // УБРАНО АВТООБНОВЛЕНИЕ ЦЕН - это вызывало лаги!
  // Цены обновляются только при добавлении новых активов

  // Загружаем портфель по умолчанию с живыми ценами
  const loadDefaultPortfolio = () => {
    if (allCryptoCoins.length === 0) {
      console.log('⏳ Waiting for coins to load...');
      return;
    }
    
    if (assets.length > 0) {
      console.log('✅ Portfolio already loaded, skipping');
      return;
    }
    
    setIsLoadingPrices(true);
    console.log('💰 Loading default portfolio with live prices...');
    
    try {
      // Находим BTC и ETH в загруженных монетах
      const btc = allCryptoCoins.find(c => c.symbol === 'BTC');
      const eth = allCryptoCoins.find(c => c.symbol === 'ETH');
      
      const defaultAssets: Asset[] = [];
      
      if (btc) {
        defaultAssets.push({
          symbol: 'BTC',
          name: 'Bitcoin',
          allocation: 30,
          price: btc.price,
          changePercent: btc.changePercent,
          volume: btc.volume
        });
      }
      
      if (eth) {
        defaultAssets.push({
          symbol: 'ETH',
          name: 'Ethereum',
          allocation: 20,
          price: eth.price,
          changePercent: eth.changePercent,
          volume: eth.volume
        });
      }
      
      // Добавляем AAPL и SPY с примерными ценами (в идеале нужен stocks API)
      defaultAssets.push({
        symbol: 'AAPL',
        name: 'Apple',
        allocation: 25,
        price: 178,
        changePercent: 0.45,
        volume: 50000000
      });
      
      defaultAssets.push({
        symbol: 'SPY',
        name: 'S&P 500 ETF',
        allocation: 25,
        price: 580,
        changePercent: 0.32,
        volume: 80000000
      });
      
      setAssets(defaultAssets);
      console.log('✅ Default portfolio loaded with LIVE prices:', defaultAssets.map(a => `${a.symbol}: $${a.price}`));
    } catch (error) {
      console.error('❌ Error loading default portfolio:', error);
    } finally {
      setIsLoadingPrices(false);
    }
  };


  // Получаем иконки для активов
  const getCoinIcon = (symbol: string): string => {
    const coinIcons: {[key: string]: string} = {
      'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      'SOL': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      'ADA': 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      'DOGE': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
      'XRP': 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
      'DOT': 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
      'MATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
      'AVAX': 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
      'LINK': 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
      'UNI': 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
      'LTC': 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
      'ATOM': 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
      'SHIB': 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
      'PEPE': 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
      'APT': 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png',
      'ARB': 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
      'OP': 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
      'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      'USDC': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      'DAI': 'https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png',
      'AAPL': 'https://logo.clearbit.com/apple.com',
      'MSFT': 'https://logo.clearbit.com/microsoft.com',
      'GOOGL': 'https://logo.clearbit.com/google.com',
      'AMZN': 'https://logo.clearbit.com/amazon.com',
      'META': 'https://logo.clearbit.com/meta.com',
      'NFLX': 'https://logo.clearbit.com/netflix.com',
      'NVDA': 'https://logo.clearbit.com/nvidia.com',
      'TSLA': 'https://logo.clearbit.com/tesla.com',
      'AMD': 'https://logo.clearbit.com/amd.com',
      'INTC': 'https://logo.clearbit.com/intel.com',
      'CRM': 'https://logo.clearbit.com/salesforce.com',
      'ORCL': 'https://logo.clearbit.com/oracle.com',
      'ADBE': 'https://logo.clearbit.com/adobe.com',
      'SNOW': 'https://logo.clearbit.com/snowflake.com',
      'PLTR': 'https://logo.clearbit.com/palantir.com',
      'JPM': 'https://logo.clearbit.com/jpmorganchase.com',
      'BAC': 'https://logo.clearbit.com/bankofamerica.com',
      'V': 'https://logo.clearbit.com/visa.com',
      'MA': 'https://logo.clearbit.com/mastercard.com',
      'WMT': 'https://logo.clearbit.com/walmart.com',
      'COST': 'https://logo.clearbit.com/costco.com',
      'SPY': 'https://logo.clearbit.com/spdr.com',
      'QQQ': 'https://logo.clearbit.com/invesco.com',
      'VOO': 'https://logo.clearbit.com/vanguard.com',
    };
    return coinIcons[symbol] || `https://ui-avatars.com/api/?name=${symbol}&background=7C3AED&color=fff&size=128`;
  };

  // ОПТИМИЗИРОВАНО: Кешируем список и обновляем только при изменении assets
  const availableAssetsList = useMemo(() => {
    // Используем только длину массива для определения изменений
    const coinsCount = allCryptoCoins.length;
    
    if (coinsCount === 0) {
      console.log('⏳ Waiting for crypto data...');
      return [];
    }
    
    console.log(`📊 Building assets list from ${coinsCount} coins`);
    const items: CommunityItem[] = [];
    
    // Создаем Set для быстрой проверки
    const portfolioSymbols = new Set(assets.map(a => a.symbol));
    
    // Добавляем ВСЕ криптовалюты с Binance (НО обновляем только при изменении assets)
    allCryptoCoins.forEach(crypto => {
      // Пропускаем уже добавленные в портфель
      if (portfolioSymbols.has(crypto.symbol)) {
        return;
      }
      
      const profile = ASSET_PROFILES[crypto.symbol];
      
        items.push({
          id: crypto.symbol.toLowerCase(),
          symbol: crypto.symbol,
          name: crypto.symbol,
          iconUrl: getCoinIcon(crypto.symbol),
          description: profile?.description || `${crypto.symbol} cryptocurrency`,
          tags: profile ? [profile.category.toLowerCase()] : ['cryptocurrency'],
          price: crypto.price,
          priceChange24h: crypto.changePercent,
          volume24h: crypto.volume,
          marketCap: crypto.price * crypto.volume / 100,
          createdAt: Date.now()
        });
    });
    
    // Если API не работает, добавляем fallback активы с примерными ценами
    if (items.length === 0 && allCryptoCoins.length === 0) {
      console.log('⚠️ API не загрузил данные, используем fallback ASSET_PROFILES');
      Object.entries(ASSET_PROFILES).forEach(([symbol, profile]) => {
        // Пропускаем уже добавленные в портфель
        if (assets.find(a => a.symbol === symbol)) {
          return;
        }
        
        // Генерируем реалистичные цены для демонстрации
        const price = profile.assetType === 'crypto' 
          ? Math.random() * 50000 + 100  // Крипто: $100-$50,100
          : profile.assetType === 'stock'
          ? Math.random() * 500 + 50     // Акции: $50-$550
          : profile.assetType === 'etf'
          ? Math.random() * 400 + 100    // ETF: $100-$500
          : Math.random() * 1000 + 100;  // Другое
        
        const change = (Math.random() - 0.5) * 10; // ±5%
        const volume = Math.random() * 1000000000; // До $1B
        
        items.push({
          id: symbol.toLowerCase(),
          symbol,
          name: symbol,
          iconUrl: getCoinIcon(symbol),
          description: profile.description,
          tags: [profile.category.toLowerCase()],
          price,
          priceChange24h: change,
          volume24h: volume,
          marketCap: price * volume / 100,
          createdAt: Date.now()
        });
      });
      console.log(`📊 Fallback: добавлено ${items.length} активов с примерными ценами`);
    }
    
    console.log(`✅ Assets list ready: ${items.length} items`);
    return items;
  }, [allCryptoCoins.length, assets.length]); // Обновляем ТОЛЬКО при изменении количества!

  const handleAssetSelect = (item: CommunityItem) => {
    // Ищем ЖИВУЮ цену из текущих данных allCryptoCoins
    const liveCoin = allCryptoCoins.find(c => c.symbol === item.symbol);
    
    // Используем живую цену если найдена, иначе из item (но это будет fallback)
    const livePrice = liveCoin?.price || item.price || 0;
    const liveChange = liveCoin?.changePercent || item.priceChange24h || 0;
    const liveVolume = liveCoin?.volume || item.volume24h || 0;
    
    console.log(`➕ Adding ${item.symbol}: $${livePrice.toFixed(2)} (${liveChange >= 0 ? '+' : ''}${liveChange.toFixed(2)}%) - LIVE from API`);
    
    setAssets([...assets, {
      symbol: item.symbol,
      name: item.name || item.symbol,
      allocation: 10,
      price: livePrice,
      changePercent: liveChange,
      volume: liveVolume
    }]);
    setShowAssetPicker(false);
  };

  // ОПТИМИЗАЦИЯ: кешируем расчеты и пересчитываем только при изменении allocation
  const portfolioRisk = useMemo(() => {
    if (assets.length === 0) {
      return {
        score: 0,
        level: 'low' as const,
        color: '#26A69A',
        label: 'No Assets',
        avgVolatility: 0,
        avgReliability: 0,
        realVolatility: 0,
        expectedReturn: 0,
        sharpeRatio: 0,
        valueAtRisk95: 0,
        maxDrawdown: 0,
      };
    }

    let totalVolatilityScore = 0;
    let totalReliabilityScore = 0;
    let weightedReturn = 0;
    let weightedVolatility = 0;
    const totalAllocation = assets.reduce((sum, a) => sum + a.allocation, 0);

    // Константы для расчетов
    const RISK_FREE_RATE = 4.5; // 4.5% годовых (текущая ставка ФРС)
    const TRADING_DAYS_CRYPTO = 365; // Крипто торгуется 365 дней
    const TRADING_DAYS_STOCKS = 252; // Акции торгуются ~252 дня

    assets.forEach(asset => {
      const profile = ASSET_PROFILES[asset.symbol] || {
        volatility: 'medium',
        reliability: 'medium',
        category: 'Unknown',
        description: 'Data unavailable',
        assetType: 'other'
      };

      // 🔥 НОВОЕ: Получаем РЕАЛЬНЫЕ метрики из API
      const realMetrics = metricsMap.get(asset.symbol);

      // Старые скоры для базового расчета
      const volScore = profile.volatility === 'extreme' ? 4
                     : profile.volatility === 'high' ? 3
                     : profile.volatility === 'medium' ? 2 : 1;
      
      const relScore = profile.reliability === 'very-high' ? 5
                     : profile.reliability === 'high' ? 4
                     : profile.reliability === 'medium' ? 3
                     : profile.reliability === 'low' ? 2 : 1;

      const weight = totalAllocation > 0 ? asset.allocation / 100 : 0;
      
      // 🔥 ИСПОЛЬЗУЕМ РЕАЛЬНЫЕ ДАННЫЕ если доступны, иначе fallback
      let annualizedVolatility: number;
      let expectedAnnualReturn: number;
      
      if (realMetrics && !isLoadingMetrics) {
        // ✅ РЕАЛЬНЫЕ метрики из API!
        annualizedVolatility = realMetrics.annualizedVolatility;
        expectedAnnualReturn = realMetrics.annualizedReturn;
        
        console.log(`💰 Using REAL metrics for ${asset.symbol}:`, {
          volatility: annualizedVolatility.toFixed(1) + '%',
          return: expectedAnnualReturn.toFixed(1) + '%',
          sharpe: realMetrics.sharpeRatio.toFixed(2)
        });
      } else {
        // Fallback на исторические средние если данные еще загружаются
        const historicalVolatility = {
          'crypto': 80,
          'stock': 20,
          'etf': 15,
          'bond': 5,
          'commodity': 25,
          'forex': 10,
          'other': 20
        }[profile.assetType] || 20;
        
        const volMultiplier = profile.volatility === 'extreme' ? 1.5
                            : profile.volatility === 'high' ? 1.2
                            : profile.volatility === 'medium' ? 1.0
                            : 0.7;
        
        annualizedVolatility = historicalVolatility * volMultiplier;
        
        const historicalReturn = {
          'crypto': 30,
          'stock': 10,
          'etf': 8,
          'bond': 4,
          'commodity': 5,
          'forex': 2,
          'other': 8
        }[profile.assetType] || 8;
        
        const dailyReturn = asset.changePercent || 0;
        const currentTrendAdjustment = Math.max(-50, Math.min(50, dailyReturn * 20));
        
        expectedAnnualReturn = historicalReturn + currentTrendAdjustment;
      }

      totalVolatilityScore += volScore * weight;
      totalReliabilityScore += relScore * weight;
      weightedReturn += expectedAnnualReturn * weight;
      weightedVolatility += annualizedVolatility * weight;
    });

    const avgVolatility = totalVolatilityScore;
    const avgReliability = totalReliabilityScore;
    
    // УЛУЧШЕННЫЙ РАСЧЕТ РИСКА с реальными данными
    // 40% - волатильность профиля, 30% - надежность, 30% - реальная волатильность
    const profileRisk = (avgVolatility * 25) + ((5 - avgReliability) * 20);
    const realVolRisk = Math.min(weightedVolatility / 2, 50); // Нормализуем к 0-50
    const riskScore = (profileRisk * 0.7) + (realVolRisk * 0.3);
    
    // Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Portfolio Volatility
    // Чем выше, тем лучше (> 1 хорошо, > 2 отлично, > 3 превосходно)
    const excessReturn = weightedReturn - RISK_FREE_RATE;
    const sharpeRatio = weightedVolatility > 0 ? excessReturn / weightedVolatility : 0;
    
    // Value at Risk (95% confidence) - максимальные потери с 95% вероятностью
    // VaR_95% = μ - 1.645 * σ (для нормального распределения)
    const valueAtRisk95 = weightedReturn - (1.645 * weightedVolatility);
    
    // Maximum Drawdown (грубая оценка на основе волатильности)
    // Обычно MaxDD ≈ 2-3 * σ для крипто, 1.5-2 * σ для акций
    const maxDrawdown = weightedVolatility * 2.5;
    
    let riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
    let riskColor: string;
    let riskLabel: string;
    
    if (riskScore < 35) {
      riskLevel = 'low';
      riskColor = '#26A69A';
      riskLabel = 'Low Risk';
    } else if (riskScore < 55) {
      riskLevel = 'moderate';
      riskColor = '#FFA726';
      riskLabel = 'Moderate Risk';
    } else if (riskScore < 75) {
      riskLevel = 'high';
      riskColor = '#EF5350';
      riskLabel = 'High Risk';
    } else {
      riskLevel = 'very-high';
      riskColor = '#D32F2F';
      riskLabel = 'Very High Risk';
    }

    return {
      score: riskScore,
      level: riskLevel,
      color: riskColor,
      label: riskLabel,
      avgVolatility,
      avgReliability,
      realVolatility: weightedVolatility,
      expectedReturn: weightedReturn,
      sharpeRatio,
      valueAtRisk95,
      maxDrawdown,
    };
  }, [assets.map(a => `${a.symbol}:${a.allocation}`).join(','), metricsMap, isLoadingMetrics]); // 🔥 Добавили metricsMap для реакции на реальные данные

  const addAsset = () => {
    if (newAsset.symbol && newAsset.allocation > 0) {
      setAssets([...assets, {
        symbol: newAsset.symbol.toUpperCase(),
        name: newAsset.symbol.toUpperCase(),
        allocation: newAsset.allocation,
        price: 0,
        changePercent: 0
      }]);
      setNewAsset({ symbol: '', allocation: 0 });
      setShowAddForm(false);
    }
  };

  const removeAsset = (symbol: string) => {
    setAssets(assets.filter(a => a.symbol !== symbol));
  };

  const updateAllocation = (symbol: string, allocation: number) => {
    setAssets(assets.map(a => a.symbol === symbol ? { ...a, allocation } : a));
  };

  const totalAllocation = assets.reduce((sum, a) => sum + a.allocation, 0);

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'low': return '#26A69A';
      case 'medium': return '#FFA726';
      case 'high': return '#EF5350';
      case 'extreme': return '#D32F2F';
      default: return '#888';
    }
  };

  const getReliabilityStars = (reliability: string) => {
    switch (reliability) {
      case 'very-high': return 5;
      case 'high': return 4;
      case 'medium': return 3;
      case 'low': return 2;
      case 'speculative': return 1;
      default: return 3;
    }
  };

  // ДИНАМИЧЕСКАЯ система оценки активов на основе ЖИВЫХ данных
  const getAssetGrade = (symbol: string) => {
    const asset = assets.find(a => a.symbol === symbol);
    const profile = ASSET_PROFILES[symbol];
    
    // Получаем живые данные о монете из allCryptoCoins
    const liveData = allCryptoCoins.find(c => c.symbol === symbol);
    
    let totalScore = 5; // Базовый скор
    let volatilityLevel: 'low' | 'medium' | 'high' | 'extreme' = 'medium';
    let reliabilityLevel: 'very-high' | 'high' | 'medium' | 'low' | 'speculative' = 'medium';
    
    // ЖИВАЯ ОЦЕНКА на основе реальных данных
    if (liveData) {
      // 1. MARKET CAP оценка (через volume * price как прокси)
      const estimatedMarketCap = liveData.price * liveData.volume;
      let marketCapScore = 0;
      
      if (estimatedMarketCap > 10000000000) { // > $10B
        marketCapScore = 4; // Очень надежно (BTC, ETH, BNB)
        reliabilityLevel = 'very-high';
      } else if (estimatedMarketCap > 1000000000) { // > $1B
        marketCapScore = 3.5; // Надежно (SOL, XRP, ADA)
        reliabilityLevel = 'high';
      } else if (estimatedMarketCap > 100000000) { // > $100M
        marketCapScore = 3; // Средняя надежность
        reliabilityLevel = 'medium';
      } else if (estimatedMarketCap > 10000000) { // > $10M
        marketCapScore = 2; // Низкая надежность
        reliabilityLevel = 'low';
      } else {
        marketCapScore = 1; // Спекулятивно
        reliabilityLevel = 'speculative';
      }
      
      // 2. ВОЛАТИЛЬНОСТЬ на основе 24h изменения
      const priceChange = Math.abs(liveData.changePercent);
      let volatilityScore = 0;
      
      if (priceChange < 2) {
        volatilityScore = 2; // Низкая волатильность
        volatilityLevel = 'low';
      } else if (priceChange < 5) {
        volatilityScore = 1.5; // Средняя волатильность
        volatilityLevel = 'medium';
      } else if (priceChange < 10) {
        volatilityScore = 1; // Высокая волатильность
        volatilityLevel = 'high';
      } else {
        volatilityScore = 0.5; // Экстремальная волатильность
        volatilityLevel = 'extreme';
      }
      
      // 3. ОБЪЕМ ТОРГОВ (ликвидность)
      let volumeScore = 0;
      if (liveData.volume > 1000000000) { // > $1B volume
        volumeScore = 2;
      } else if (liveData.volume > 100000000) { // > $100M
        volumeScore = 1.5;
      } else if (liveData.volume > 10000000) { // > $10M
        volumeScore = 1;
      } else {
        volumeScore = 0.5;
      }
      
      // ИТОГОВЫЙ РАСЧЕТ (0-10 scale)
      totalScore = Math.min(10, Math.max(1, 
        marketCapScore * 1.5 +  // 60% веса на надежность
        volatilityScore * 1.5 +  // 30% на волатильность
        volumeScore * 0.7        // 10% на ликвидность
      ));
    } else if (profile) {
      // Fallback на статичные данные только если нет живых данных
      const reliabilityScore = profile.reliability === 'very-high' ? 9
                             : profile.reliability === 'high' ? 7.5
                             : profile.reliability === 'medium' ? 6
                             : profile.reliability === 'low' ? 4.5
                             : 3;

      const volatilityPenalty = profile.volatility === 'extreme' ? 3
                              : profile.volatility === 'high' ? 2
                              : profile.volatility === 'medium' ? 1
                              : 0;

      totalScore = Math.max(1, Math.min(10, reliabilityScore - volatilityPenalty));
      volatilityLevel = profile.volatility;
      reliabilityLevel = profile.reliability;
    }

    // Определяем оценку
    let grade: string;
    let label: string;
    let color: string;
    let bgColor: string;
    let description: string;
    let recommendation: string;

    if (totalScore >= 9) {
      grade = 'A+';
      label = 'Excellent';
      color = '#22C55E';
      bgColor = 'rgba(34, 197, 94, 0.15)';
      description = 'Высоконадежный актив с низкой волатильностью';
      recommendation = 'Отлично подходит для консервативных инвесторов и долгосрочных вложений';
    } else if (totalScore >= 8) {
      grade = 'A';
      label = 'Very Good';
      color = '#10B981';
      bgColor = 'rgba(16, 185, 129, 0.15)';
      description = 'Надежный актив с умеренной волатильностью';
      recommendation = 'Хороший выбор для основы портфеля';
    } else if (totalScore >= 7) {
      grade = 'B';
      label = 'Good';
      color = '#3B82F6';
      bgColor = 'rgba(59, 130, 246, 0.15)';
      description = 'Качественный актив с приемлемым уровнем риска';
      recommendation = 'Подходит для сбалансированных портфелей';
    } else if (totalScore >= 6) {
      grade = 'C';
      label = 'Average';
      color = '#FFA726';
      bgColor = 'rgba(255, 167, 38, 0.15)';
      description = 'Актив со средними показателями';
      recommendation = 'Требует внимательного мониторинга, подходит для диверсификации';
    } else if (totalScore >= 4) {
      grade = 'D';
      label = 'Below Average';
      color = '#F97316';
      bgColor = 'rgba(249, 115, 22, 0.15)';
      description = 'Повышенный риск, средняя надежность';
      recommendation = 'Только для опытных инвесторов, готовых к высокой волатильности';
    } else {
      grade = 'F';
      label = 'High Risk';
      color = '#EF4444';
      bgColor = 'rgba(239, 68, 68, 0.15)';
      description = 'Высокорискованный или спекулятивный актив';
      recommendation = 'Подходит только для агрессивных инвесторов с высокой толерантностью к риску';
    }

    return {
      grade,
      score: totalScore,
      color,
      bgColor,
      label,
      description,
      recommendation,
    };
  };

  // ОПТИМИЗАЦИЯ: кешируем и пересчитываем только при изменении allocation или профиля
  const portfolioAlignment = useMemo(() => {
    if (assets.length === 0) {
      return {
        score: 0,
        issues: [],
        isAligned: false,
      };
    }

    const profile = RISK_PROFILES[selectedProfile];
    const issues: string[] = [];
    
    // Подсчитываем распределение по типам активов
    const distribution = {
      crypto: 0,
      stocks: 0,
      etf: 0,
      stablecoins: 0,
    };

    assets.forEach(asset => {
      const assetProfile = ASSET_PROFILES[asset.symbol];
      if (assetProfile) {
        if (assetProfile.category === 'Stablecoin') {
          distribution.stablecoins += asset.allocation;
        } else if (assetProfile.assetType === 'crypto') {
          distribution.crypto += asset.allocation;
        } else if (assetProfile.assetType === 'stock') {
          distribution.stocks += asset.allocation;
        } else if (assetProfile.assetType === 'etf') {
          distribution.etf += asset.allocation;
        }
      }
    });

    // Проверяем соответствие рекомендациям профиля
    let alignmentScore = 100;

    // Crypto allocation
    if (distribution.crypto < profile.recommendations.crypto.min) {
      issues.push(`Crypto allocation (${distribution.crypto.toFixed(0)}%) is below recommended minimum (${profile.recommendations.crypto.min}%)`);
      alignmentScore -= Math.abs(distribution.crypto - profile.recommendations.crypto.min) / 2;
    } else if (distribution.crypto > profile.recommendations.crypto.max) {
      issues.push(`Crypto allocation (${distribution.crypto.toFixed(0)}%) exceeds recommended maximum (${profile.recommendations.crypto.max}%)`);
      alignmentScore -= Math.abs(distribution.crypto - profile.recommendations.crypto.max) / 2;
    }

    // Stocks allocation  
    if (distribution.stocks < profile.recommendations.stocks.min) {
      issues.push(`Stocks allocation (${distribution.stocks.toFixed(0)}%) is below recommended minimum (${profile.recommendations.stocks.min}%)`);
      alignmentScore -= Math.abs(distribution.stocks - profile.recommendations.stocks.min) / 2;
    } else if (distribution.stocks > profile.recommendations.stocks.max) {
      issues.push(`Stocks allocation (${distribution.stocks.toFixed(0)}%) exceeds recommended maximum (${profile.recommendations.stocks.max}%)`);
      alignmentScore -= Math.abs(distribution.stocks - profile.recommendations.stocks.max) / 2;
    }

    // ETF allocation
    if (distribution.etf < profile.recommendations.etf.min) {
      issues.push(`ETF allocation (${distribution.etf.toFixed(0)}%) is below recommended minimum (${profile.recommendations.etf.min}%)`);
      alignmentScore -= Math.abs(distribution.etf - profile.recommendations.etf.min) / 2;
    } else if (distribution.etf > profile.recommendations.etf.max) {
      issues.push(`ETF allocation (${distribution.etf.toFixed(0)}%) exceeds recommended maximum (${profile.recommendations.etf.max}%)`);
      alignmentScore -= Math.abs(distribution.etf - profile.recommendations.etf.max) / 2;
    }

    // Volatility check
    if (portfolioRisk.realVolatility > profile.maxVolatility) {
      issues.push(`Portfolio volatility (${portfolioRisk.realVolatility.toFixed(1)}%) exceeds ${profile.name} profile limit (${profile.maxVolatility}%)`);
      alignmentScore -= 15;
    }

    // Sharpe Ratio check
    if (portfolioRisk.sharpeRatio < profile.minSharpe) {
      issues.push(`Sharpe Ratio (${portfolioRisk.sharpeRatio.toFixed(2)}) is below ${profile.name} profile minimum (${profile.minSharpe})`);
      alignmentScore -= 10;
    }

    alignmentScore = Math.max(0, Math.min(100, alignmentScore));

    return {
      score: alignmentScore,
      issues,
      isAligned: alignmentScore >= 70,
      distribution,
    };
  }, [assets.map(a => `${a.symbol}:${a.allocation}`).join(','), selectedProfile, portfolioRisk.score]); // Оптимизация

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Professional Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Risk Analysis</h1>
            <p className="text-sm text-gray-400">Advanced risk metrics and optimization tools</p>
          </div>
          <div className="px-4 py-2 bg-blue-500/10 rounded-lg">
            <div className="text-xs text-gray-400 mb-0.5">Analysis Date</div>
            <div className="text-sm font-semibold text-white">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 🎓 НОВОЕ: Вводный блок для новичков */}
        <div className="p-8 rounded-3xl relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.95) 100%)',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, rgba(180, 140, 80, 0.6), rgba(120, 90, 50, 0.6)) 1',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, rgba(180, 140, 80, 0.3), rgba(120, 90, 50, 0.3))'
            }}>
              <svg className="w-10 h-10 text-yellow-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Добро пожаловать в Анализ Рисков Портфеля!</h2>
              <p className="text-base text-gray-300 leading-relaxed">
                Этот инструмент поможет вам оценить риски вашего инвестиционного портфеля и найти оптимальное распределение активов. 
                Мы используем профессиональные методы анализа, но объясняем всё простым языком.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Что вы увидите */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Что вы увидите:</h3>
              <ul className="text-xs text-gray-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Уровень риска вашего портфеля</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Ожидаемую доходность</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Оптимальное распределение активов</span>
                </li>
              </ul>
            </div>

            {/* Как это работает */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Как это работает:</h3>
              <ul className="text-xs text-gray-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">1.</span>
                  <span>Выберите риск-профиль (консервативный, умеренный, агрессивный)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">2.</span>
                  <span>Добавьте активы и распределите доли</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">3.</span>
                  <span>Получите детальный анализ и рекомендации</span>
                </li>
              </ul>
            </div>

            {/* Что вам поможет */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Что вам поможет:</h3>
              <ul className="text-xs text-gray-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  <span>Снизить риски через диверсификацию</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  <span>Найти баланс между риском и доходностью</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">✓</span>
                  <span>Принимать обоснованные решения</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Важное предупреждение */}
          <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-yellow-400 mb-1">Важно понимать:</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Это образовательный инструмент для анализа. Все расчёты основаны на исторических данных и математических моделях. 
                  Прошлые результаты не гарантируют будущую доходность. Всегда консультируйтесь с финансовыми специалистами перед принятием инвестиционных решений.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Profile Selector - Professional */}
        <div className="rounded-3xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.95) 100%)',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, rgba(180, 140, 80, 0.4), rgba(120, 90, 50, 0.4)) 1',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(50px)'
        }}>
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(180, 140, 80, 0.2), rgba(120, 90, 50, 0.2))'
              }}>
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill="currentColor" opacity="0.3"/>
                  <path d="M10 13l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Шаг 1: Выберите ваш риск-профиль</h3>
                <p className="text-sm text-gray-400 mt-0.5">Это определит рекомендуемое распределение активов в вашем портфеле</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-2">
            {(Object.entries(RISK_PROFILES) as [RiskProfile, RiskProfileConfig][]).map(([key, profile]) => (
              <button
                key={key}
                onClick={() => setSelectedProfile(key)}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                  selectedProfile === key
                    ? 'border-opacity-100 shadow-2xl transform scale-105'
                    : 'border-opacity-20 hover:border-opacity-80 hover:scale-103 hover:shadow-xl'
                }`}
                style={{
                  borderColor: profile.color,
                  background: selectedProfile === key
                    ? `linear-gradient(135deg, ${profile.color}30 0%, ${profile.color}15 100%)`
                    : 'linear-gradient(135deg, rgba(46, 39, 68, 0.20) 0%, rgba(30, 30, 45, 0.20) 100%)',
                  boxShadow: selectedProfile === key 
                    ? `0 20px 60px ${profile.color}40, 0 0 0 1px ${profile.color}60`
                    : 'none',
                }}
              >
                {/* Animated glow effect on hover */}
                <div 
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    selectedProfile === key ? 'opacity-100' : ''
                  }`}
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${profile.color}20 0%, transparent 70%)`,
                    pointerEvents: 'none'
                  }}
                />
                
                {/* Selected indicator */}
                {selectedProfile === key && (
                  <div 
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center animate-pulse"
                    style={{
                      background: profile.color,
                      boxShadow: `0 0 20px ${profile.color}80`
                    }}
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    background: `${profile.color}20`
                  }}>
                    {profile.icon === 'shield' && (
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill={profile.color}/>
                        <path d="M10 13l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {profile.icon === 'balance' && (
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3v18M7 8H3l2-3 2 3zm10 0h4l-2-3-2 3z" stroke={profile.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="5" cy="8" r="3" fill={profile.color} opacity="0.3"/>
                        <circle cx="19" cy="8" r="3" fill={profile.color} opacity="0.3"/>
                        <rect x="10" y="20" width="4" height="2" fill={profile.color}/>
                      </svg>
                    )}
                    {profile.icon === 'rocket' && (
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2c0 0 7 2 7 12l-3 3-4-4-4 4-3-3c0-10 7-12 7-12z" fill={profile.color}/>
                        <path d="M9 15l-4 4h4v4l4-4" stroke={profile.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="9" r="2" fill="white"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{profile.name}</h4>
                    <p className="text-xs text-gray-400">{profile.description}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-[10px] text-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#EAB308"/>
                        <path d="M12 6v2m0 8v2m1-10h-1.5a2 2 0 000 4h1a2 2 0 010 4H11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="text-yellow-400">Crypto:</span>
                    </span>
                    <span className="font-bold">{profile.recommendations.crypto.min}-{profile.recommendations.crypto.max}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <path d="M3 17l6-6 4 4 8-8M21 7v8h-8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-blue-400">Stocks:</span>
                    </span>
                    <span className="font-bold">{profile.recommendations.stocks.min}-{profile.recommendations.stocks.max}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#A855F7" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="6" stroke="#A855F7" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="2" fill="#A855F7"/>
                      </svg>
                      <span className="text-purple-400">ETF:</span>
                    </span>
                    <span className="font-bold">{profile.recommendations.etf.min}-{profile.recommendations.etf.max}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="8" width="18" height="12" rx="1" stroke="#6B7280" strokeWidth="2"/>
                        <path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2M12 12v4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="text-gray-400">Bonds:</span>
                    </span>
                    <span className="font-bold">{profile.recommendations.bonds.min}-{profile.recommendations.bonds.max}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="6" fill="#F59E0B"/>
                        <path d="M12 14l-3 8h6l-3-8z" fill="#F59E0B"/>
                        <circle cx="12" cy="8" r="3" fill="#FCD34D"/>
                      </svg>
                      <span className="text-amber-400">Commodities:</span>
                    </span>
                    <span className="font-bold">{profile.recommendations.commodities.min}-{profile.recommendations.commodities.max}%</span>
                  </div>
                  <div className="h-px bg-white/10 my-1"></div>
                  <div className="flex justify-between items-center text-purple-300">
                    <span className="font-semibold">Max Volatility:</span>
                    <span className="font-bold">{profile.maxVolatility}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Alignment Score */}
        {assets.length > 0 && (
          <div className="p-6 rounded-3xl border" style={{
            background: portfolioAlignment.isAligned
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.10) 0%, rgba(22, 163, 74, 0.10) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.10) 0%, rgba(220, 38, 38, 0.10) 100%)',
            borderColor: portfolioAlignment.isAligned ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            backdropFilter: 'blur(50px)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                {RISK_PROFILES[selectedProfile].icon} {RISK_PROFILES[selectedProfile].name} Profile Alignment
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${portfolioAlignment.isAligned ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioAlignment.score.toFixed(0)}%
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  portfolioAlignment.isAligned 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}>
                  {portfolioAlignment.isAligned ? 'Aligned' : 'Needs Adjustment'}
                </span>
              </div>
            </div>

            {portfolioAlignment.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 mb-2">Issues:</h4>
                <ul className="space-y-1">
                  {portfolioAlignment.issues.map((issue, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {portfolioAlignment.isAligned && (
              <p className="text-xs text-green-400 mt-3">
                ✓ Your portfolio aligns well with the {RISK_PROFILES[selectedProfile].name} risk profile
              </p>
            )}
          </div>
        )}

        {/* 🔥 НОВОЕ: Portfolio Optimization (MPT) */}
        {assets.length >= 2 && !isLoadingOptimization && (efficientFrontier || minVariancePortfolio || maxSharpePortfolio) && (
          <div className="space-y-4">
            {/* Объяснение для новичков */}
            <div className="p-6 rounded-3xl relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.95) 100%)',
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, rgba(180, 140, 80, 0.6), rgba(120, 90, 50, 0.6)) 1',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(180, 140, 80, 0.2), rgba(120, 90, 50, 0.2))'
                }}>
                  <svg className="w-7 h-7 text-blue-400" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">Оптимизация Портфеля (Modern Portfolio Theory)</h3>
                    <span className="text-xs text-gray-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                      Нобелевская премия 1990
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Мы используем <span className="text-yellow-400 font-semibold">теорию Гарри Марковица</span>, за которую он получил Нобелевскую премию. 
                    Эта математическая модель помогает найти <span className="text-blue-400 font-semibold">идеальный баланс</span> между риском и доходностью.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Minimum Variance */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-white">Минимальный Риск</h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Портфель с <span className="text-green-400 font-semibold">наименьшей волатильностью</span>. 
                    Идеален для тех, кто хочет спать спокойно и не переживать о колебаниях рынка.
                  </p>
                </div>

                {/* Maximum Sharpe */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-white">Лучшее Соотношение</h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Портфель с <span className="text-yellow-400 font-semibold">максимальным Sharpe Ratio</span> — 
                    лучший баланс между прибылью и риском. Золотая середина инвестирования.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-blue-300 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span><span className="font-bold">Как использовать:</span> Сравните эти оптимальные портфели с вашим текущим распределением. 
                  Если различия большие — возможно, стоит пересмотреть распределение активов.</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Minimum Variance Portfolio */}
              {minVariancePortfolio && (
                <div className="p-8 rounded-3xl relative overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.95) 100%)',
                  border: '2px solid',
                  borderImage: 'linear-gradient(135deg, rgba(180, 140, 80, 0.4), rgba(120, 90, 50, 0.4)) 1',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                        background: 'linear-gradient(135deg, rgba(180, 140, 80, 0.2), rgba(120, 90, 50, 0.2))'
                      }}>
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Minimum Variance</h4>
                        <p className="text-sm text-gray-400">Lowest risk portfolio</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{minVariancePortfolio.volatility.toFixed(1)}%</div>
                      <div className="text-sm text-gray-400">Volatility</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {minVariancePortfolio.expectedReturn.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Return</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {minVariancePortfolio.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">Sharpe</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {minVariancePortfolio.volatility.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Risk</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-bold text-white mb-3">Allocation:</div>
                    {Object.entries(minVariancePortfolio.weights)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 4)
                      .map(([symbol, weight]) => (
                        <div key={symbol} className="flex items-center justify-between">
                          <span className="text-xs text-gray-300 font-medium">{symbol}</span>
                          <div className="flex items-center gap-2 flex-1 ml-3">
                            <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                                style={{ width: `${weight * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-green-400 w-12 text-right">
                              {(weight * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Maximum Sharpe Portfolio */}
              {maxSharpePortfolio && (
                <div className="p-8 rounded-3xl relative overflow-hidden" style={{
                  background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.95) 100%)',
                  border: '2px solid',
                  borderImage: 'linear-gradient(135deg, rgba(180, 140, 80, 0.4), rgba(120, 90, 50, 0.4)) 1',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                        background: 'linear-gradient(135deg, rgba(180, 140, 80, 0.2), rgba(120, 90, 50, 0.2))'
                      }}>
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Maximum Sharpe</h4>
                        <p className="text-sm text-gray-400">Best risk/reward</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-yellow-400">{maxSharpePortfolio.sharpeRatio.toFixed(2)}</div>
                      <div className="text-sm text-gray-400">Sharpe Ratio</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {maxSharpePortfolio.expectedReturn.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Return</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {maxSharpePortfolio.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">Sharpe</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {maxSharpePortfolio.volatility.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Risk</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-bold text-white mb-3">Allocation:</div>
                    {Object.entries(maxSharpePortfolio.weights)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 4)
                      .map(([symbol, weight]) => (
                        <div key={symbol} className="flex items-center justify-between">
                          <span className="text-xs text-gray-300 font-medium">{symbol}</span>
                          <div className="flex items-center gap-2 flex-1 ml-3">
                            <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                style={{ width: `${weight * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-blue-400 w-12 text-right">
                              {(weight * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* 🎨 НОВОЕ: Efficient Frontier Visualization */}
            {efficientFrontier && Array.isArray(efficientFrontier) && efficientFrontier.length > 0 && (
              <div className="p-6 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-purple-400 mb-2 flex items-center gap-2">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17l6-6 4 4 8-8M21 7v8h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Efficient Frontier Visualization
                  </h4>
                  <p className="text-sm text-gray-400">
                    Interactive chart showing optimal portfolio combinations. Hover over points to see detailed allocation.
                  </p>
                </div>
                
                <div className="h-[500px] w-full">
                  <EfficientFrontierChart
                    efficientFrontier={efficientFrontier}
                    minVariancePortfolio={minVariancePortfolio}
                    maxSharpePortfolio={maxSharpePortfolio}
                    currentPortfolio={{
                      expectedReturn: portfolioRisk.expectedReturn,
                      volatility: portfolioRisk.realVolatility,
                      sharpeRatio: portfolioRisk.sharpeRatio,
                    }}
                    suggestedAllocation={suggestedAllocation ? {
                      expectedReturn: 0,
                      volatility: 0,
                      sharpeRatio: 0,
                      weights: suggestedAllocation.suggested
                    } : undefined}
                  />
                </div>
              </div>
            )}

            {/* Suggested Allocation Card */}
            {suggestedAllocation && (
              <div className="p-6 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-purple-400 mb-1">
                      Recommended for {RISK_PROFILES[selectedProfile].name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {suggestedAllocation.reasoning[0]}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Improvement</div>
                    <div className="flex items-center gap-2">
                      {suggestedAllocation.improvement.sharpeImprovement > 0 && (
                        <span className="text-sm font-bold text-green-400">
                          +{suggestedAllocation.improvement.sharpeImprovement.toFixed(2)} Sharpe
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <div className={`text-xl font-bold ${suggestedAllocation.improvement.returnIncrease >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {suggestedAllocation.improvement.returnIncrease >= 0 ? '+' : ''}{suggestedAllocation.improvement.returnIncrease.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Return Change</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <div className={`text-xl font-bold ${suggestedAllocation.improvement.volatilityReduction >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {suggestedAllocation.improvement.volatilityReduction >= 0 ? '-' : '+'}{Math.abs(suggestedAllocation.improvement.volatilityReduction).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Risk Change</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <div className={`text-xl font-bold ${suggestedAllocation.improvement.sharpeImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {suggestedAllocation.improvement.sharpeImprovement >= 0 ? '+' : ''}{suggestedAllocation.improvement.sharpeImprovement.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Sharpe Change</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-xs font-bold text-gray-400">Suggested Allocation:</div>
                  {Object.entries(suggestedAllocation.suggested)
                    .sort(([, a], [, b]) => b - a)
                    .map(([symbol, weight]) => (
                      <div key={symbol} className="flex items-center justify-between">
                        <span className="text-xs text-gray-300 font-medium">{symbol}</span>
                        <div className="flex items-center gap-2 flex-1 ml-3">
                          <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                              style={{ width: `${weight}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-purple-400 w-12 text-right">
                            {weight.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => {
                    // Apply suggested allocation
                    const newAssets = assets.map(asset => ({
                      ...asset,
                      allocation: suggestedAllocation.suggested[asset.symbol] || 0
                    }));
                    setAssets(newAssets);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-purple-500/30"
                >
                  Apply Recommended Allocation
                </button>
              </div>
            )}
          </div>
        )}

        {/* 🔥 НОВОЕ: Monte Carlo Simulation Results */}
        {assets.length >= 2 && monteCarloResults && !isLoadingMonteCarlo && (
          <div className="space-y-4">
            {/* Объяснение для новичков */}
            <div className="p-6 rounded-3xl relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.95) 100%)',
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, rgba(180, 140, 80, 0.6), rgba(120, 90, 50, 0.6)) 1',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(180, 140, 80, 0.2), rgba(120, 90, 50, 0.2))'
                }}>
                  <svg className="w-7 h-7 text-cyan-400" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.3"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">Симуляция Монте-Карло (прогноз на 1 год)</h3>
                    <span className="text-xs text-gray-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                      1000 сценариев
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Представьте, что мы <span className="text-cyan-400 font-semibold">1000 раз прокручиваем будущее</span> вашего портфеля. 
                    Это помогает понять <span className="text-blue-400 font-semibold">возможные исходы</span> — от худших до лучших сценариев.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Value at Risk */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Value at Risk (VaR)</h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Показывает <span className="text-red-400 font-semibold">максимальные потери</span>, которые могут произойти с определённой вероятностью. 
                    VaR 95% означает: "в 95 из 100 случаев потери не превысят эту сумму".
                  </p>
                </div>

                {/* Probabilities */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none">
                        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-white">Вероятности прибыли</h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Какова <span className="text-green-400 font-semibold">вероятность роста</span> вашего портфеля на 10%, 20% или 50%? 
                    Это помогает понять реалистичность ожиданий.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-xs text-cyan-300 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span><span className="font-bold">Простыми словами:</span> Мы проиграли 1000 разных вариантов развития событий на рынке. 
                  Теперь вы знаете, что может случиться с вашими инвестициями в лучшем и худшем случае.</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Value at Risk Card */}
              <div className="p-6 rounded-2xl border border-white/10 bg-black hover:border-white/20 transition-all">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" fill="currentColor"/>
                  </svg>
                  Value at Risk
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">VaR 95%:</span>
                    <span className="text-lg font-bold text-white">
                      ${monteCarloResults.risk.var95.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">VaR 99%:</span>
                    <span className="text-sm font-bold text-white">
                      ${monteCarloResults.risk.var99.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">CVaR 95%:</span>
                    <span className="text-sm font-bold text-white">
                      ${monteCarloResults.risk.cvar95.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">CVaR 99%:</span>
                    <span className="text-sm font-bold text-white">
                      ${monteCarloResults.risk.cvar99.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Probabilities Card */}
              <div className="p-6 rounded-2xl border border-white/10 bg-black hover:border-white/20 transition-all">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Probabilities
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Loss:</span>
                    <span className="text-lg font-bold text-white">
                      {monteCarloResults.probabilities.loss.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">+10% gain:</span>
                    <span className="text-sm font-bold text-white">
                      {monteCarloResults.probabilities.gain10.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">+20% gain:</span>
                    <span className="text-sm font-bold text-white">
                      {monteCarloResults.probabilities.gain20.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">+50% gain:</span>
                    <span className="text-sm font-bold text-yellow-400">
                      {monteCarloResults.probabilities.gain50.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 НОВОЕ: Stress Test Scenarios */}
        {assets.length >= 2 && stressTestResults.length > 0 && !isLoadingMonteCarlo && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor"/>
                </svg>
                Stress Test Scenarios
              </h3>
              <span className="text-xs text-gray-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
                {stressTestResults.length} scenarios
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stressTestResults.map((scenario, idx) => {
                const impactColor = scenario.portfolioImpact >= 0 ? 'green' : 
                                   scenario.portfolioImpact > -10 ? 'yellow' :
                                   scenario.portfolioImpact > -25 ? 'orange' : 'red';
                
                const likelihoodConfig = {
                  'rare': { color: '#6B7280', label: 'Rare', icon: '⭐' },
                  'unlikely': { color: '#3B82F6', label: 'Unlikely', icon: '🔹' },
                  'possible': { color: '#EAB308', label: 'Possible', icon: '⚠️' },
                  'likely': { color: '#EF4444', label: 'Likely', icon: '🔥' }
                };
                
                const likelihood = likelihoodConfig[scenario.likelihood];
                
                return (
                  <div 
                    key={idx}
                    className="p-5 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-xl"
                    style={{
                      borderColor: `${likelihood.color}40`,
                      background: `linear-gradient(135deg, ${likelihood.color}10 0%, ${likelihood.color}05 100%)`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{likelihood.icon}</span>
                        {scenario.name}
                      </h4>
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{
                          background: `${likelihood.color}20`,
                          color: likelihood.color,
                        }}
                      >
                        {likelihood.label}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                      {scenario.description}
                    </p>
                    
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/30">
                      <span className="text-xs text-gray-400">Portfolio Impact</span>
                      <span className={`text-2xl font-bold ${
                        impactColor === 'green' ? 'text-green-400' :
                        impactColor === 'yellow' ? 'text-yellow-400' :
                        impactColor === 'orange' ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {scenario.portfolioImpact >= 0 ? '+' : ''}{scenario.portfolioImpact.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🔥 НОВОЕ: Diversification Score Card */}
        {assets.length >= 2 && diversification && !isLoadingCorrelations && (
          <div className="p-6 rounded-3xl border" style={{
            background: diversification.level === 'excellent' || diversification.level === 'good'
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.10) 0%, rgba(22, 163, 74, 0.10) 100%)'
              : diversification.level === 'moderate'
              ? 'linear-gradient(135deg, rgba(255, 167, 38, 0.10) 0%, rgba(251, 146, 60, 0.10) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.10) 0%, rgba(220, 38, 38, 0.10) 100%)',
            borderColor: diversification.level === 'excellent' || diversification.level === 'good'
              ? 'rgba(34, 197, 94, 0.3)'
              : diversification.level === 'moderate'
              ? 'rgba(255, 167, 38, 0.3)'
              : 'rgba(239, 68, 68, 0.3)',
            backdropFilter: 'blur(50px)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="5" cy="7" r="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="19" cy="7" r="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="5" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="19" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10.5 10.5L6.5 8.5M13.5 10.5L17.5 8.5M10.5 13.5L6.5 15.5M13.5 13.5L17.5 15.5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Portfolio Diversification
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${
                  diversification.level === 'excellent' ? 'text-green-400'
                  : diversification.level === 'good' ? 'text-blue-400'
                  : diversification.level === 'moderate' ? 'text-yellow-400'
                  : 'text-red-400'
                }`}>
                  {diversification.score}/100
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  diversification.level === 'excellent' ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : diversification.level === 'good' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : diversification.level === 'moderate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}>
                  {diversification.level.charAt(0).toUpperCase() + diversification.level.slice(1)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Average Correlation</span>
                <span className="text-sm font-bold text-white">
                  {(diversification.avgCorrelation * 100).toFixed(0)}%
                </span>
              </div>
              <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${diversification.avgCorrelation * 100}%`,
                    background: diversification.avgCorrelation < 0.4 ? 'linear-gradient(90deg, #22C55E80, #22C55E)'
                              : diversification.avgCorrelation < 0.6 ? 'linear-gradient(90deg, #3B82F680, #3B82F6)'
                              : diversification.avgCorrelation < 0.8 ? 'linear-gradient(90deg, #EAB30880, #EAB308)'
                              : 'linear-gradient(90deg, #EF444480, #EF4444)'
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Lower correlation = better diversification
              </p>
            </div>

            {diversification.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 mb-2">Recommendations:</h4>
                <ul className="space-y-2">
                  {diversification.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 p-2 rounded-lg bg-white/5">
                      {diversification.level === 'excellent' || diversification.level === 'good' ? (
                        <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Risk Score Card */}
        <div
          className="p-6 rounded-3xl relative overflow-hidden border"
          style={{
            background: 'linear-gradient(135deg, rgba(46, 39, 68, 0.50) 0%, rgba(30, 30, 45, 0.50) 100%)',
            borderColor: `${portfolioRisk.color}60`,
            boxShadow: `0 8px 32px ${portfolioRisk.color}15`,
            backdropFilter: 'blur(50px)'
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-400">Portfolio Risk Overview</h3>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: portfolioRisk.color }} />
                <span className="text-sm font-bold" style={{ color: portfolioRisk.color }}>
                  {portfolioRisk.label}
                </span>
              </div>
            </div>
            
            <div className="relative h-3 bg-black/30 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${portfolioRisk.score}%`,
                  background: `linear-gradient(90deg, ${portfolioRisk.color}80, ${portfolioRisk.color})`
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: portfolioRisk.color }}>
                  {portfolioRisk.score.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Risk Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {portfolioRisk.realVolatility.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Annual Volatility</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${portfolioRisk.expectedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioRisk.expectedReturn >= 0 ? '+' : ''}{portfolioRisk.expectedReturn.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Expected Return</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  portfolioRisk.sharpeRatio > 2 ? 'text-green-400' 
                  : portfolioRisk.sharpeRatio > 1 ? 'text-yellow-400'
                  : portfolioRisk.sharpeRatio > 0 ? 'text-orange-400'
                  : 'text-red-400'
                }`}>
                  {portfolioRisk.sharpeRatio.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Sharpe Ratio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Analysis Insights - Educational Only */}
        {assets.length > 0 && (
          <div className="p-6 rounded-3xl relative overflow-hidden" style={{
            background: portfolioAlignment.isAligned && portfolioRisk.sharpeRatio > 0.8
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.08) 100%)'
              : portfolioRisk.level === 'very-high'
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(255, 167, 38, 0.12) 0%, rgba(251, 146, 60, 0.08) 100%)',
            backdropFilter: 'blur(50px)'
          }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  {portfolioAlignment.isAligned && portfolioRisk.sharpeRatio > 0.8 ? (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="#22C55E"/>
                        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Well-Balanced Allocation</span>
                    </>
                  ) : portfolioRisk.level === 'very-high' ? (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                        <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" fill="#EF4444"/>
                      </svg>
                      <span>High Risk Detected</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#EAB308"/>
                        <path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Analysis Insights</span>
                    </>
                  )}
                </h3>
                <p className="text-sm text-gray-400">
                  {portfolioAlignment.isAligned && portfolioRisk.sharpeRatio > 0.8
                    ? 'This allocation shows balanced characteristics aligned with the selected profile'
                    : portfolioRisk.level === 'very-high'
                    ? 'This allocation exhibits elevated risk characteristics'
                    : 'Analysis shows areas where allocation differs from typical profile patterns'}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-xs font-bold ${
                portfolioAlignment.isAligned && portfolioRisk.sharpeRatio > 0.8
                  ? 'bg-green-500/20 text-green-400'
                  : portfolioRisk.level === 'very-high'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {portfolioAlignment.score.toFixed(0)}% Match
              </div>
            </div>

            {/* Educational Observations */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                Portfolio Observations
              </h4>
              
              {/* Sharpe Ratio Observation */}
              {portfolioRisk.sharpeRatio < 0.5 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/5 to-red-500/10 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600"></div>
                  <div className="flex items-start gap-3 pl-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z" fill="#EF4444"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-400">Risk-Adjusted Return Analysis</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Current Sharpe Ratio: {portfolioRisk.sharpeRatio.toFixed(2)}. Portfolios with higher stable asset allocation (ETFs, bonds) typically show improved risk-adjusted returns.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Volatility Observation */}
              {portfolioRisk.realVolatility > RISK_PROFILES[selectedProfile].maxVolatility && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/5 to-orange-500/10 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-orange-600"></div>
                  <div className="flex items-start gap-3 pl-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <path d="M3 17l6-6 4 4 8-8M21 7v8h-8" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-orange-400">Volatility Profile</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Current volatility: {portfolioRisk.realVolatility.toFixed(1)}% vs {RISK_PROFILES[selectedProfile].name} profile typical range: {RISK_PROFILES[selectedProfile].maxVolatility}%. 
                        Higher ETF/bond allocation often associated with lower volatility.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Allocation Observations */}
              {portfolioAlignment.distribution && (
                <>
                  {portfolioAlignment.distribution.crypto > RISK_PROFILES[selectedProfile].recommendations.crypto.max && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/5 to-yellow-500/10 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-yellow-600"></div>
                      <div className="flex items-start gap-3 pl-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#EAB308"/>
                            <path d="M12 6v2m0 8v2m1-10h-1.5a2 2 0 000 4h1a2 2 0 010 4H11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-yellow-400">Crypto Allocation Pattern</p>
                          <p className="text-xs text-gray-300 mt-1">
                            Crypto: {portfolioAlignment.distribution.crypto.toFixed(0)}% (typical {RISK_PROFILES[selectedProfile].name} range: {RISK_PROFILES[selectedProfile].recommendations.crypto.min}-{RISK_PROFILES[selectedProfile].recommendations.crypto.max}%). 
                            Allocations closer to profile ranges often exhibit different risk characteristics.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {portfolioAlignment.distribution.stocks < RISK_PROFILES[selectedProfile].recommendations.stocks.min && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/5 to-blue-500/10 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600"></div>
                      <div className="flex items-start gap-3 pl-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <rect x="3" y="13" width="2" height="7" fill="#3B82F6"/>
                            <rect x="7" y="7" width="2" height="13" fill="#3B82F6"/>
                            <rect x="11" y="5" width="2" height="15" fill="#3B82F6"/>
                            <rect x="15" y="9" width="2" height="11" fill="#3B82F6"/>
                            <rect x="19" y="3" width="2" height="17" fill="#3B82F6"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-blue-400">Stocks Allocation Pattern</p>
                          <p className="text-xs text-gray-300 mt-1">
                            Stocks: {portfolioAlignment.distribution.stocks.toFixed(0)}% (typical {RISK_PROFILES[selectedProfile].name} range: {RISK_PROFILES[selectedProfile].recommendations.stocks.min}-{RISK_PROFILES[selectedProfile].recommendations.stocks.max}%). 
                            Examples of stable stocks include AAPL, MSFT, GOOGL, or index ETF like SPY.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {portfolioAlignment.distribution.etf < RISK_PROFILES[selectedProfile].recommendations.etf.min && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 to-purple-500/10 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-purple-600"></div>
                      <div className="flex items-start gap-3 pl-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="4" height="18" fill="#A855F7"/>
                            <rect x="10" y="3" width="4" height="18" fill="#A855F7"/>
                            <rect x="17" y="3" width="4" height="18" fill="#A855F7"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-purple-400">ETF Allocation Pattern</p>
                          <p className="text-xs text-gray-300 mt-1">
                            ETFs: {portfolioAlignment.distribution.etf.toFixed(0)}% (typical {RISK_PROFILES[selectedProfile].name} range: {RISK_PROFILES[selectedProfile].recommendations.etf.min}-{RISK_PROFILES[selectedProfile].recommendations.etf.max}%). 
                            Popular diversified ETFs include SPY, QQQ, and VOO.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* All Good! */}
              {portfolioAlignment.isAligned && portfolioRisk.sharpeRatio > 0.8 && portfolioRisk.realVolatility <= RISK_PROFILES[selectedProfile].maxVolatility && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/5 to-green-500/10 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-green-600"></div>
                  <div className="flex items-start gap-3 pl-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="#22C55E"/>
                        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-400">Balanced Characteristics</p>
                      <p className="text-xs text-gray-300 mt-1">
                        This allocation demonstrates characteristics typical of the {RISK_PROFILES[selectedProfile].name} risk profile, with favorable risk/reward metrics and appropriate volatility levels.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] text-gray-500 italic flex items-start gap-2">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>Educational analysis only. Not financial advice. Portfolio characteristics shown for informational purposes. Users should conduct their own research and consult qualified financial advisors.</span>
              </p>
            </div>
          </div>
        )}

        {/* Advanced Risk Metrics Card */}
        {assets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border" style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.10) 0%, rgba(220, 38, 38, 0.10) 100%)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(50px)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h4 className="text-xs font-bold text-red-400">Value at Risk (95%)</h4>
              </div>
              <div className="text-2xl font-bold text-red-400 mb-1">
                {portfolioRisk.valueAtRisk95.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-400">
                Maximum expected loss with 95% confidence over one year
              </p>
            </div>

            <div className="p-5 rounded-2xl border" style={{
              background: 'linear-gradient(135deg, rgba(255, 167, 38, 0.10) 0%, rgba(251, 146, 60, 0.10) 100%)',
              borderColor: 'rgba(255, 167, 38, 0.3)',
              backdropFilter: 'blur(50px)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <h4 className="text-xs font-bold text-orange-400">Maximum Drawdown</h4>
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-1">
                -{portfolioRisk.maxDrawdown.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-400">
                Estimated worst peak-to-trough decline
              </p>
            </div>

            <div className="p-5 rounded-2xl border" style={{
              background: portfolioRisk.sharpeRatio > 1 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.10) 0%, rgba(22, 163, 74, 0.10) 100%)'
                : 'linear-gradient(135deg, rgba(156, 163, 175, 0.10) 0%, rgba(107, 114, 128, 0.10) 100%)',
              borderColor: portfolioRisk.sharpeRatio > 1 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(156, 163, 175, 0.3)',
              backdropFilter: 'blur(50px)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <svg className={`w-4 h-4 ${portfolioRisk.sharpeRatio > 1 ? 'text-green-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h4 className={`text-xs font-bold ${portfolioRisk.sharpeRatio > 1 ? 'text-green-400' : 'text-gray-400'}`}>Risk-Adjusted Return</h4>
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                portfolioRisk.sharpeRatio > 2 ? 'text-green-400' 
                : portfolioRisk.sharpeRatio > 1 ? 'text-yellow-400'
                : 'text-gray-400'
              }`}>
                {portfolioRisk.sharpeRatio > 0 ? 'Good' : 'Poor'}
              </div>
              <p className="text-xs text-gray-400">
                {portfolioRisk.sharpeRatio > 2 ? 'Excellent risk/reward ratio' 
                 : portfolioRisk.sharpeRatio > 1 ? 'Good risk/reward balance'
                 : portfolioRisk.sharpeRatio > 0 ? 'Acceptable returns for risk'
                 : 'Returns don\'t justify the risk'}
              </p>
            </div>
          </div>
        )}

        {totalAllocation !== 100 && (
          <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3 backdrop-blur-xl">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">
                Total Allocation: {totalAllocation}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Recommended 100% for accurate risk calculation
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Portfolio Assets</h3>
            <button
              onClick={() => setShowAssetPicker(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 rounded-xl text-sm font-bold text-purple-300 transition-all flex items-center gap-2 border border-purple-500/30"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Asset</span>
            </button>
          </div>

          {showAddForm && (
            <div className="p-5 rounded-2xl border space-y-4" style={{
              background: 'linear-gradient(135deg, rgba(46, 39, 68, 0.30) 0%, rgba(30, 30, 45, 0.30) 100%)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(50px)'
            }}>
              <input
                type="text"
                placeholder="Symbol (BTC, ETH, AAPL...)"
                value={newAsset.symbol}
                onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-sm font-semibold text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <input
                type="number"
                placeholder="Allocation %"
                value={newAsset.allocation || ''}
                onChange={(e) => setNewAsset({ ...newAsset, allocation: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-sm font-semibold text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <div className="flex gap-3">
                <button
                  onClick={addAsset}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-500/30"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {assets.map(asset => {
            const profile = ASSET_PROFILES[asset.symbol] || {
              volatility: 'medium',
              reliability: 'medium',
              category: 'Unknown',
              description: 'Data unavailable',
              assetType: 'other'
            };
            
            const assetGrade = getAssetGrade(asset.symbol);
            
            // Определяем тип актива для отображения с SVG иконками
            const getAssetTypeIcon = (type: string) => {
              switch (type) {
                case 'crypto':
                  return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#EAB308"/>
                      <path d="M12 6v2m0 8v2m1-10h-1.5a2 2 0 000 4h1a2 2 0 010 4H11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  );
                case 'stock':
                  return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <path d="M3 17l6-6 4 4 8-8M21 7v8h-8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  );
                case 'etf':
                  return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#A855F7" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="6" stroke="#A855F7" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="2" fill="#A855F7"/>
                    </svg>
                  );
                case 'bond':
                  return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="8" width="18" height="12" rx="1" stroke="#6B7280" strokeWidth="2"/>
                      <path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2M12 12v4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  );
                case 'commodity':
                  return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="6" fill="#F59E0B"/>
                      <path d="M12 14l-3 8h6l-3-8z" fill="#F59E0B"/>
                      <circle cx="12" cy="8" r="3" fill="#FCD34D"/>
                    </svg>
                  );
                case 'forex':
                  return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  );
                default:
                  return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#9CA3AF" strokeWidth="2"/>
                      <path d="M8 12h8M12 8v8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  );
              }
            };
            
            const assetTypeLabel = profile.assetType === 'crypto' ? 'Crypto'
                                 : profile.assetType === 'stock' ? 'Stocks'
                                 : profile.assetType === 'etf' ? 'ETF'
                                 : profile.assetType === 'bond' ? 'Bonds'
                                 : profile.assetType === 'commodity' ? 'Commodities'
                                 : profile.assetType === 'forex' ? 'Forex'
                                 : 'Asset';
            
            return (
              <div
                key={asset.symbol}
                className="p-6 rounded-2xl border-2 transition-all duration-300 ease-in-out group hover:shadow-2xl hover:scale-[1.01] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(46, 39, 68, 0.40) 0%, rgba(30, 30, 45, 0.40) 100%)',
                  borderColor: `${assetGrade.color}50`,
                  backdropFilter: 'blur(50px)',
                  boxShadow: `0 8px 32px ${assetGrade.color}15`
                }}
              >
                {/* Animated grade indicator */}
                <div 
                  className="absolute top-0 left-0 w-2 h-full transition-all duration-500 ease-out group-hover:w-3"
                  style={{ 
                    background: `linear-gradient(180deg, ${assetGrade.color}, ${assetGrade.color}60)`,
                    boxShadow: `0 0 20px ${assetGrade.color}40`
                  }}
                />

                {/* Header with Icon, Name, Price */}
                <div className="flex items-start justify-between mb-4 pl-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Asset Icon */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{
                      borderColor: `${assetGrade.color}40`,
                      background: `${assetGrade.color}10`
                    }}>
                      <img 
                        src={getCoinIcon(asset.symbol)} 
                        alt={asset.symbol}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-lg font-bold" style="color: ${assetGrade.color}">${asset.symbol[0]}</div>`;
                        }}
                      />
                    </div>

                    {/* Asset Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">{asset.symbol}</h3>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10">
                          {getAssetTypeIcon(profile.assetType)}
                          <span className="text-xs text-gray-300 font-medium">
                            {assetTypeLabel}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{asset.name}</p>
                      
                      {/* Price & Change */}
                      {asset.price > 0 && (
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-lg font-bold text-white">
                            ${asset.price.toLocaleString('en-US', { 
                              minimumFractionDigits: asset.price < 1 ? 4 : 2,
                              maximumFractionDigits: asset.price < 1 ? 4 : 2
                            })}
                          </span>
                          {asset.changePercent !== undefined && (
                            <span className={`text-xs font-bold ${asset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Grade Badge - Right Side */}
                    <div 
                      className="px-4 py-2 rounded-xl font-bold border-2 flex items-center gap-3 flex-shrink-0"
                      style={{
                        background: assetGrade.bgColor,
                        borderColor: `${assetGrade.color}60`,
                        boxShadow: `0 4px 16px ${assetGrade.color}20`
                      }}
                    >
                      <span className="text-3xl leading-none" style={{ color: assetGrade.color }}>
                        {assetGrade.grade}
                      </span>
                      <div className="text-left">
                        <div className="text-base font-bold" style={{ color: assetGrade.color }}>
                          {assetGrade.score}/10
                        </div>
                        <div className="text-[10px] font-semibold opacity-75" style={{ color: assetGrade.color }}>
                          {assetGrade.label}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => removeAsset(asset.symbol)}
                    className="ml-3 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:scale-110 rounded-xl transition-all duration-300"
                  >
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Risk Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 pl-3">
                  {/* Volatility Card */}
                  <div 
                    className="p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105"
                    style={{
                      background: `${getVolatilityColor(profile.volatility)}10`,
                      borderColor: `${getVolatilityColor(profile.volatility)}40`
                    }}
                  >
                    <div className="text-xs text-gray-500 font-semibold mb-1.5">Волатильность</div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ 
                          background: getVolatilityColor(profile.volatility),
                          boxShadow: `0 0 10px ${getVolatilityColor(profile.volatility)}60`
                        }}
                      />
                      <span 
                        className="text-sm font-bold"
                        style={{ color: getVolatilityColor(profile.volatility) }}
                      >
                        {profile.volatility === 'extreme' ? 'Экстремальная'
                         : profile.volatility === 'high' ? 'Высокая'
                         : profile.volatility === 'medium' ? 'Средняя'
                         : 'Низкая'}
                      </span>
                    </div>
                  </div>

                  {/* Reliability Card */}
                  <div className="p-3 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 transition-all duration-300 hover:scale-105">
                    <div className="text-xs text-gray-500 font-semibold mb-1.5">Надежность</div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 transition-all duration-200"
                          fill={i < getReliabilityStars(profile.reliability) ? '#FFA726' : '#2a2a2a'}
                          viewBox="0 0 20 20"
                          style={{
                            filter: i < getReliabilityStars(profile.reliability) ? 'drop-shadow(0 0 2px #FFA726)' : 'none'
                          }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description & Recommendation */}
                <div className="mb-4 pl-3">
                  <div 
                    className="p-4 rounded-xl border-2 relative overflow-hidden"
                    style={{
                      background: `${assetGrade.color}08`,
                      borderColor: `${assetGrade.color}30`
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{
                        background: `${assetGrade.color}20`
                      }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke={assetGrade.color} strokeWidth="2"/>
                          <path d="M12 8v4m0 4h.01" stroke={assetGrade.color} strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold mb-1" style={{ color: assetGrade.color }}>
                          {assetGrade.description}
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          💡 {assetGrade.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Allocation Slider */}
                <div className="pl-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">Доля в портфеле</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold" style={{ color: assetGrade.color }}>
                        {asset.allocation}%
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={asset.allocation}
                    onChange={(e) => updateAllocation(asset.symbol, parseFloat(e.target.value))}
                    className="w-full h-3 bg-black/30 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(90deg, ${assetGrade.color} 0%, ${assetGrade.color} ${asset.allocation}%, #1a1a1a ${asset.allocation}%, #1a1a1a 100%)`,
                      boxShadow: `0 0 10px ${assetGrade.color}20`
                    }}
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-medium">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CommunityDiscoverModal для выбора активов */}
        <CommunityDiscoverModal
          isOpen={showAssetPicker}
          initialTab="volume"
          initialQuery=""
          onClose={() => setShowAssetPicker(false)}
          onJoin={handleAssetSelect}
          items={availableAssetsList}
        />
      </div>
    </div>
  );
}
