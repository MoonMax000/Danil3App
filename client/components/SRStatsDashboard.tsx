import { useState, useMemo } from 'react';
import { SupportResistanceLevel } from '../utils/technicalAnalysis';
import { TrendingUp, TrendingDown, Target, Activity, BarChart3, X } from 'lucide-react';

interface SRStatsDashboardProps {
  levels: SupportResistanceLevel[];
  currentPrice: number;
  onClose: () => void;
}

export default function SRStatsDashboard({ levels, currentPrice, onClose }: SRStatsDashboardProps) {
  const [selectedLevel, setSelectedLevel] = useState<SupportResistanceLevel | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const supports = levels.filter(l => l.type === 'support');
    const resistances = levels.filter(l => l.type === 'resistance');
    const psychological = levels.filter(l => l.isPsychological);
    const volumeWeighted = levels.filter(l => l.isVolumeWeighted);
    const fibonacci = levels.filter(l => l.isFibonacci);
    
    const avgStrength = levels.reduce((sum, l) => sum + l.strength, 0) / levels.length || 0;
    const strongLevels = levels.filter(l => l.strength > 0.7);
    
    // Nearest levels
    const nearestSupport = supports
      .filter(l => l.price < currentPrice)
      .sort((a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice))[0];
    
    const nearestResistance = resistances
      .filter(l => l.price > currentPrice)
      .sort((a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice))[0];
    
    // Distance calculations
    const supportDistance = nearestSupport 
      ? ((currentPrice - nearestSupport.price) / currentPrice * 100).toFixed(2)
      : null;
    
    const resistanceDistance = nearestResistance
      ? ((nearestResistance.price - currentPrice) / currentPrice * 100).toFixed(2)
      : null;
    
    return {
      totalLevels: levels.length,
      supports: supports.length,
      resistances: resistances.length,
      psychological: psychological.length,
      volumeWeighted: volumeWeighted.length,
      fibonacci: fibonacci.length,
      avgStrength: (avgStrength * 100).toFixed(0),
      strongLevels: strongLevels.length,
      nearestSupport,
      nearestResistance,
      supportDistance,
      resistanceDistance
    };
  }, [levels, currentPrice]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.98) 0%, rgba(25, 25, 35, 0.98) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          boxShadow: '0 20px 60px rgba(124, 58, 237, 0.4)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">S/R Analytics Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Overview Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<BarChart3 className="w-5 h-5" />}
              label="Total Levels"
              value={stats.totalLevels}
              color="purple"
            />
            <StatCard
              icon={<TrendingDown className="w-5 h-5" />}
              label="Support"
              value={stats.supports}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Resistance"
              value={stats.resistances}
              color="orange"
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="Strong Levels"
              value={stats.strongLevels}
              color="green"
            />
          </div>

          {/* Level Types */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <TypeCard
              label="Psychological"
              value={stats.psychological}
              total={stats.totalLevels}
              icon="🎯"
            />
            <TypeCard
              label="Volume"
              value={stats.volumeWeighted}
              total={stats.totalLevels}
              icon="📊"
            />
            <TypeCard
              label="Fibonacci"
              value={stats.fibonacci}
              total={stats.totalLevels}
              icon="🌟"
            />
            <TypeCard
              label="Avg Strength"
              value={`${stats.avgStrength}%`}
              subtitle="Quality"
              icon="💪"
            />
          </div>

          {/* Nearest Levels */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {stats.nearestSupport && (
              <NearestLevelCard
                level={stats.nearestSupport}
                distance={stats.supportDistance}
                currentPrice={currentPrice}
                type="support"
              />
            )}
            {stats.nearestResistance && (
              <NearestLevelCard
                level={stats.nearestResistance}
                distance={stats.resistanceDistance}
                currentPrice={currentPrice}
                type="resistance"
              />
            )}
          </div>

          {/* All Levels Table */}
          <div className="rounded-xl overflow-hidden border border-purple-500/20">
            <div className="px-4 py-3 bg-purple-900/20 border-b border-purple-500/20">
              <h3 className="text-sm font-bold text-white">All Detected Levels</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {levels.map((level, index) => (
                <div
                  key={index}
                  className="px-4 py-3 border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedLevel(level === selectedLevel ? null : level)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${level.type === 'support' ? 'bg-blue-400' : 'bg-orange-400'}`} />
                      <span className="text-sm font-medium text-white">
                        ${level.price.toFixed(2)}
                      </span>
                      {level.isPsychological && <span className="text-xs">🎯</span>}
                      {level.isVolumeWeighted && <span className="text-xs">📊</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-400">
                        Touches: {level.touches || 0}
                      </div>
                      <div className="text-xs font-bold" style={{
                        color: level.strength > 0.7 ? '#6EE7B7' : level.strength > 0.4 ? '#A78BFA' : '#9CA3AF'
                      }}>
                        {(level.strength * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  {selectedLevel === level && (
                    <div className="mt-2 pt-2 border-t border-purple-500/10 text-xs text-gray-400 space-y-1">
                      <div>Type: {level.type}</div>
                      <div>Distance: {((Math.abs(level.price - currentPrice) / currentPrice) * 100).toFixed(2)}%</div>
                      {level.volumeProfile && (
                        <div>Volume Profile: {level.volumeProfile.toFixed(0)}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors = {
    purple: 'from-purple-600/20 to-purple-700/10 border-purple-500/30',
    blue: 'from-blue-600/20 to-blue-700/10 border-blue-500/30',
    orange: 'from-orange-600/20 to-orange-700/10 border-orange-500/30',
    green: 'from-green-600/20 to-green-700/10 border-green-500/30'
  };

  return (
    <div className={`rounded-xl p-4 bg-gradient-to-br ${colors[color as keyof typeof colors]} border backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function TypeCard({ label, value, total, subtitle, icon }: { label: string; value: number | string; total?: number; subtitle?: string; icon: string }) {
  const percentage = typeof value === 'number' && total ? Math.round((value / total) * 100) : null;
  
  return (
    <div className="rounded-xl p-4 bg-gradient-to-br from-purple-900/10 to-purple-800/5 border border-purple-500/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {percentage !== null && (
        <div className="text-xs text-purple-400 mt-1">{percentage}% of total</div>
      )}
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

function NearestLevelCard({ level, distance, currentPrice, type }: { 
  level: SupportResistanceLevel; 
  distance: string | null; 
  currentPrice: number;
  type: 'support' | 'resistance';
}) {
  const isSupport = type === 'support';
  
  return (
    <div 
      className="rounded-xl p-4 border backdrop-blur-sm"
      style={{
        background: isSupport 
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
        borderColor: isSupport ? 'rgba(59, 130, 246, 0.3)' : 'rgba(251, 146, 60, 0.3)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isSupport ? (
            <TrendingDown className="w-5 h-5 text-blue-400" />
          ) : (
            <TrendingUp className="w-5 h-5 text-orange-400" />
          )}
          <span className="text-sm font-bold text-white">
            Nearest {isSupport ? 'Support' : 'Resistance'}
          </span>
        </div>
        <div className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">
          {distance}% away
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-gray-400">Price</span>
          <span className="text-lg font-bold text-white">${level.price.toFixed(2)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-gray-400">Strength</span>
          <span className="text-sm font-bold" style={{
            color: level.strength > 0.7 ? '#6EE7B7' : '#A78BFA'
          }}>
            {(level.strength * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-gray-400">Touches</span>
          <span className="text-sm text-white">{level.touches || 0}</span>
        </div>
      </div>
    </div>
  );
}
