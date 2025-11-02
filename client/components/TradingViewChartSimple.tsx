import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';

interface TradingViewChartProps {
  timeframe: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '12h' | '1d' | '1w' | '1M';
}

export default function TradingViewChart({ timeframe }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const [volumes, setVolumes] = useState<Array<{time: Time, value: number, color: string}>>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const earliestTimeRef = useRef<number | null>(null);
  const hasReachedBeginning = useRef(false);

  // Function to load more historical data
  const loadMoreHistoricalData = async () => {
    if (isLoadingMore || !earliestTimeRef.current) return;
    
    setIsLoadingMore(true);
    try {
      const endTime = earliestTimeRef.current - 1000; // 1 second before earliest
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${timeframe}&limit=300&endTime=${endTime}`
      );
      const data = await response.json();
      
      if (data.length === 0) {
        hasReachedBeginning.current = true;
        setIsLoadingMore(false);
        console.log('Reached the beginning of available data');
        return;
      }

      const formattedCandles: CandlestickData[] = data.map((candle: any) => ({
        time: (candle[0] / 1000) as Time,
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
      }));

      const formattedVolumes = data.map((candle: any) => {
        const open = parseFloat(candle[1]);
        const close = parseFloat(candle[4]);
        return {
          time: (candle[0] / 1000) as Time,
          value: parseFloat(candle[5]),
          color: close >= open ? 'rgba(46, 189, 133, 0.5)' : 'rgba(239, 69, 74, 0.5)',
        };
      });

      // Update earliest time
      if (formattedCandles.length > 0) {
        earliestTimeRef.current = formattedCandles[0].time as number * 1000;
      }

      // Prepend to existing data
      const newCandles = [...formattedCandles, ...candles];
      const newVolumes = [...formattedVolumes, ...volumes];
      
      setCandles(newCandles);
      setVolumes(newVolumes);
      
      if (candlestickSeriesRef.current && volumeSeriesRef.current) {
        candlestickSeriesRef.current.setData(newCandles);
        volumeSeriesRef.current.setData(newVolumes);
      }
      
      console.log(`Loaded ${formattedCandles.length} more historical candles`);
    } catch (error) {
      console.error('Error loading more historical data:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('Initializing chart...');

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#E0E0E0',
      },
      watermark: {
        visible: false,
        text: '',
        color: 'rgba(0, 0, 0, 0)',
        fontSize: 0,
      },
      grid: {
        vertLines: { color: 'rgba(82, 58, 131, 0.15)' },
        horzLines: { color: 'rgba(82, 58, 131, 0.15)' },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: 'rgba(160, 106, 255, 0.5)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#7C3AED',
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: 'rgba(160, 106, 255, 0.5)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#7C3AED',
          visible: true,
          labelVisible: true,
        },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: '#FFFFFF',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(82, 58, 131, 0.5)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 120,
        barSpacing: 6,
        minBarSpacing: 0.5,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: false,
        visible: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#2EBD85',
      downColor: '#EF454A',
      borderUpColor: '#2EBD85',
      borderDownColor: '#EF454A',
      wickUpColor: '#2EBD85',
      wickDownColor: '#EF454A',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Add ResizeObserver to watch container size changes (for panel resizing)
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for timeframe:', timeframe);
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${timeframe}&limit=500`
        );
        const data = await response.json();

        const formattedCandles: CandlestickData[] = data.map((candle: any) => ({
          time: (candle[0] / 1000) as Time,
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
        }));

        const formattedVolumes = data.map((candle: any) => {
          const open = parseFloat(candle[1]);
          const close = parseFloat(candle[4]);
          return {
            time: (candle[0] / 1000) as Time,
            value: parseFloat(candle[5]),
            color: close >= open ? 'rgba(46, 189, 133, 0.5)' : 'rgba(239, 69, 74, 0.5)',
          };
        });

        setCandles(formattedCandles);
        setVolumes(formattedVolumes);
        
        // Set earliest time for lazy loading
        if (formattedCandles.length > 0) {
          earliestTimeRef.current = formattedCandles[0].time as number * 1000;
        }
        
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(formattedCandles);
        }
        
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.setData(formattedVolumes);
        }

        // Set initial visible range to show last ~100 bars with generous right padding
        if (chartRef.current && formattedCandles.length > 0) {
          const barsToShow = Math.min(100, formattedCandles.length);
          chartRef.current.timeScale().setVisibleLogicalRange({
            from: Math.max(0, formattedCandles.length - barsToShow - 120),
            to: formattedCandles.length - 1
          });
        }

        console.log('Data loaded successfully');
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${timeframe}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const kline = data.k;

      if (kline && candlestickSeriesRef.current && volumeSeriesRef.current) {
        const newCandle: CandlestickData = {
          time: (kline.t / 1000) as Time,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        };

        const newVolume = {
          time: (kline.t / 1000) as Time,
          value: parseFloat(kline.v),
          color: parseFloat(kline.c) >= parseFloat(kline.o) 
            ? 'rgba(46, 189, 133, 0.5)' 
            : 'rgba(239, 69, 74, 0.5)',
        };

        candlestickSeriesRef.current.update(newCandle);
        volumeSeriesRef.current.update(newVolume);
      }
    };

    return () => wsRef.current?.close();
  }, [timeframe]);

  // Detect scroll to left edge and load more data
  useEffect(() => {
    if (!chartRef.current) return;

    const timeScale = chartRef.current.timeScale();
    const handleVisibleRangeChange = () => {
      const logicalRange = timeScale.getVisibleLogicalRange();
      
      // Prevent scrolling beyond the beginning
      if (logicalRange && logicalRange.from < 0) {
        timeScale.setVisibleLogicalRange({
          from: 0,
          to: logicalRange.to
        });
        return;
      }
      
      // Load more data if close to left edge and haven't reached beginning
      if (logicalRange && logicalRange.from < 50 && !hasReachedBeginning.current) {
        loadMoreHistoricalData();
      }
    };

    timeScale.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    };
  }, [candles, volumes, isLoadingMore]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-full"
      style={{ position: 'relative', minHeight: '400px' }}
    >
      {/* Custom Price Label Overlay */}
      <style>{`
        .tv-lightweight-charts .tv-lightweight-charts-price-scale-pane {
          background: transparent !important;
        }
        .tv-lightweight-charts .price-label {
          border-radius: 8px !important;
          padding: 6px 10px !important;
          background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%) !important;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4) !important;
          font-weight: 600 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
