import { useEffect, useRef, useMemo } from 'react';
import { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { SupportResistanceLevel } from '../utils/technicalAnalysis';

export interface SupportResistanceOverlayProps {
  chart: IChartApi | null;
  series: ISeriesApi<"Candlestick"> | null;
  levels: SupportResistanceLevel[];
  showLabels?: boolean;
  showSupport?: boolean;
  showResistance?: boolean;
  minStrength?: number;
  isProMode?: boolean;
}

interface PriceLine {
  id: string;
  line: any; // ISeriesApi price line
}

/**
 * Component that renders support/resistance levels as horizontal lines on a chart
 * Uses lightweight-charts price line API
 */
export default function SupportResistanceOverlay({
  chart,
  series,
  levels,
  showLabels = true,
  showSupport = true,
  showResistance = true,
  minStrength = 0,
  isProMode = false
}: SupportResistanceOverlayProps) {
  const priceLines = useRef<PriceLine[]>([]);
  
  // Create a stable key for levels to prevent unnecessary re-renders
  const levelsKey = useMemo(() => {
    return levels.map(l => `${l.type}-${l.price.toFixed(4)}-${l.strength.toFixed(2)}`).join('|');
  }, [levels]);

  useEffect(() => {
    if (!chart || !series) {
      return;
    }

    if (levels.length === 0) {
      // Clear existing lines if no data
      priceLines.current.forEach(({ line }) => {
        try {
          series.removePriceLine(line);
        } catch (e) {
          // Line may already be removed
        }
      });
      priceLines.current = [];
      return;
    }

    // Remove all existing price lines
    priceLines.current.forEach(({ line }) => {
      try {
        series.removePriceLine(line);
      } catch (e) {
        // Line may already be removed
      }
    });
    priceLines.current = [];

    // Filter levels based on settings
    const filteredLevels = levels.filter(level => {
      if (level.strength < minStrength) return false;
      if (level.type === 'support' && !showSupport) return false;
      if (level.type === 'resistance' && !showResistance) return false;
      return true;
    });

    // Add price lines for each level
    filteredLevels.forEach(level => {
      const isSupport = level.type === 'support';
      
      // Use darker purple colors based on strength (more subtle)
      let baseColor: string;
      if (level.strength > 0.7) {
        baseColor = '#6B21B6'; // Dark purple for strong levels
      } else if (level.strength > 0.4) {
        baseColor = '#5B21B6'; // Darker purple for medium
      } else {
        baseColor = '#4C1D95'; // Darkest purple for weak levels
      }
      
      // Thinner lines (1-2px for subtlety)
      const lineWidth = (level.strength > 0.5 ? 2 : 1) as 1 | 2 | 3 | 4;
      
      // Create label text - simple for beginners, detailed for pros
      let labelText = '';
      if (showLabels) {
        const priceStr = level.price.toFixed(level.price > 1000 ? 2 : 4);
        
        if (isProMode) {
          // Pro Mode: Technical labels with indicators
          const strengthLabel = level.strength > 0.7 ? 'Strong' : level.strength > 0.4 ? 'Medium' : 'Weak';
          const typeLabel = isSupport ? 'Support' : 'Resistance';
          
          let typeIndicator = '';
          if (level.isFibonacci) {
            const fibPercent = (level.fibLevel! * 100).toFixed(1);
            typeIndicator = ` 🌟Fib ${fibPercent}%`;
          } else if (level.isPsychological) {
            typeIndicator = ' 🎯';
          } else if (level.isVolumeWeighted) {
            typeIndicator = ' 📊';
          }
          
          labelText = `${typeLabel} $${priceStr}${typeIndicator} (${strengthLabel})`;
        } else {
          // Beginner Mode: Plain English
          if (isSupport) {
            if (level.strength > 0.7) {
              labelText = `💪 Price bounces here: $${priceStr}`;
            } else {
              labelText = `Price may bounce: $${priceStr}`;
            }
          } else {
            if (level.strength > 0.7) {
              labelText = `⚠️ Strong ceiling: $${priceStr}`;
            } else {
              labelText = `May face resistance: $${priceStr}`;
            }
          }
        }
      }

      try {
        const priceLine = series.createPriceLine({
          price: level.price,
          color: baseColor,
          lineWidth: lineWidth,
          lineStyle: 0, // Solid line (0 = solid, 2 = dashed)
          axisLabelVisible: true,
          title: labelText,
          lineVisible: true,
        });

        priceLines.current.push({
          id: `${level.type}-${level.price}-${level.firstTouch}`,
          line: priceLine
        });
      } catch (error) {
        console.error('Error creating price line:', error);
      }
    });

    // Cleanup function
    return () => {
      priceLines.current.forEach(({ line }) => {
        try {
          series?.removePriceLine(line);
        } catch (e) {
          // Line may already be removed
        }
      });
      priceLines.current = [];
    };
  }, [chart, series, levelsKey, showLabels, showSupport, showResistance, minStrength, isProMode]);

  // This component doesn't render anything to the DOM
  // It only manages price lines on the chart
  return null;
}

/**
 * Utility function to format level info for tooltips
 */
export function formatLevelInfo(level: SupportResistanceLevel): string {
  const type = level.type === 'support' ? 'Support' : 'Resistance';
  const strength = (level.strength * 100).toFixed(0);
  const price = level.price.toFixed(level.price > 1000 ? 2 : 4);
  
  return `${type} at ${price}\nStrength: ${strength}%\nTouches: ${level.touches}`;
}

/**
 * Get color for a level based on its strength
 */
export function getLevelColor(level: SupportResistanceLevel, includeAlpha: boolean = true): string {
  const baseColor = level.type === 'support' ? '46, 189, 133' : '239, 69, 74';
  
  if (!includeAlpha) {
    return `rgb(${baseColor})`;
  }
  
  // Calculate opacity based on strength (0.4 to 1.0)
  const alpha = 0.4 + (level.strength * 0.6);
  return `rgba(${baseColor}, ${alpha})`;
}

/**
 * Get line style based on strength
 */
export function getLevelLineStyle(level: SupportResistanceLevel): 'solid' | 'dashed' | 'dotted' {
  if (level.strength > 0.7) return 'solid';
  if (level.strength > 0.4) return 'dashed';
  return 'dotted';
}
