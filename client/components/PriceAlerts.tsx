import { Bell, Plus, X, TrendingUp, TrendingDown, Volume2, VolumeX, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Alert {
  id: string;
  crypto: string;
  price: number;
  condition: 'above' | 'below';
  createdAt: string;
  triggered: boolean;
  notified: boolean;
}

interface AlertSettings {
  soundEnabled: boolean;
  autoRemove: boolean;
  notificationsEnabled: boolean;
}

export default function PriceAlerts({ crypto, currentPrice }: { crypto: string; currentPrice: number }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  const [settings, setSettings] = useState<AlertSettings>({
    soundEnabled: true,
    autoRemove: false,
    notificationsEnabled: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedAlertsRef = useRef<Set<string>>(new Set());

  // Load alerts and settings from localStorage on mount
  useEffect(() => {
    try {
      const savedAlerts = localStorage.getItem('priceAlerts');
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
      
      const savedSettings = localStorage.getItem('alertSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('priceAlerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }, [alerts]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('alertSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, notificationsEnabled: true }));
      }
    }
  };

  // Play sound notification
  const playSound = () => {
    if (settings.soundEnabled) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  // Show browser notification
  const showNotification = (alert: Alert) => {
    if (settings.notificationsEnabled && notificationPermission === 'granted') {
      const notification = new Notification(`Price Alert: ${alert.crypto}`, {
        body: `${alert.crypto} is now ${alert.condition} $${alert.price.toLocaleString()}!\nCurrent price: $${currentPrice.toFixed(2)}`,
        icon: '/favicon.ico',
        tag: alert.id,
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  };

  // Check alerts whenever price changes
  useEffect(() => {
    if (!currentPrice || alerts.length === 0) return;

    const triggeredAlerts: string[] = [];

    alerts.forEach(alert => {
      // Only check alerts for the current crypto and that haven't been notified
      if (alert.crypto !== crypto || notifiedAlertsRef.current.has(alert.id)) return;

      const shouldTrigger = 
        (alert.condition === 'above' && currentPrice >= alert.price) ||
        (alert.condition === 'below' && currentPrice <= alert.price);
      
      if (shouldTrigger) {
        triggeredAlerts.push(alert.id);
        
        // Add to notified set to prevent duplicate notifications
        notifiedAlertsRef.current.add(alert.id);

        // Show notification
        try {
          if (settings.notificationsEnabled && notificationPermission === 'granted') {
            const notification = new Notification(`Price Alert: ${alert.crypto}`, {
              body: `${alert.crypto} is now ${alert.condition} $${alert.price.toLocaleString()}!\nCurrent price: $${currentPrice.toFixed(2)}`,
              icon: '/favicon.ico',
              tag: alert.id,
              requireInteraction: false
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };

            setTimeout(() => notification.close(), 10000);
          }
        } catch (error) {
          console.error('Notification error:', error);
        }

        // Play sound
        try {
          if (settings.soundEnabled) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          }
        } catch (error) {
          console.error('Sound error:', error);
        }

        console.log(`✅ Alert triggered: ${crypto} ${alert.condition} $${alert.price}`);
      }
    });

    // Update triggered alerts after the loop
    if (triggeredAlerts.length > 0) {
      setAlerts(prev => prev.map(a => 
        triggeredAlerts.includes(a.id) ? { ...a, triggered: true, notified: true } : a
      ));

      // Auto-remove if setting is enabled
      if (settings.autoRemove) {
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => !triggeredAlerts.includes(a.id)));
          triggeredAlerts.forEach(id => notifiedAlertsRef.current.delete(id));
        }, 3000);
      }
    }
  }, [currentPrice, crypto, settings.autoRemove, settings.notificationsEnabled, settings.soundEnabled, notificationPermission]);

  const addAlert = async () => {
    if (!newAlertPrice) return;
    
    // Request notification permission if not already granted
    if (notificationPermission !== 'granted') {
      await requestNotificationPermission();
    }

    const newAlert: Alert = {
      id: Date.now().toString(),
      crypto,
      price: parseFloat(newAlertPrice),
      condition: newAlertCondition,
      createdAt: new Date().toISOString(),
      triggered: false,
      notified: false
    };
    
    setAlerts([...alerts, newAlert]);
    setNewAlertPrice('');
    setShowForm(false);
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    notifiedAlertsRef.current.delete(id);
  };

  const resetAlert = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, triggered: false, notified: false } : a
    ));
    notifiedAlertsRef.current.delete(id);
  };

  // Filter alerts for current crypto
  const currentCryptoAlerts = alerts.filter(a => a.crypto === crypto);

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-white">Price Alerts</span>
            <span className="text-xs text-gray-500">({currentCryptoAlerts.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="p-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
              title="Add Alert"
            >
              <Plus className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-purple-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm text-white">Sound Alerts</span>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">Browser Notifications</span>
              </div>
              <button
                onClick={async () => {
                  if (notificationPermission !== 'granted') {
                    await requestNotificationPermission();
                  } else {
                    setSettings(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notificationsEnabled ? 'bg-purple-500' : 'bg-gray-600'
                }`}
                disabled={notificationPermission === 'denied'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {notificationPermission === 'denied' && (
              <div className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded">
                ⚠️ Notifications blocked. Please enable in browser settings.
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">Auto-remove triggered</span>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoRemove: !prev.autoRemove }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoRemove ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoRemove ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
        
        {/* Add Alert Form */}
        {showForm && (
          <div className="p-3 rounded-2xl space-y-2.5" style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(88, 28, 135, 0.1) 100%)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="flex gap-2.5">
              <input
                type="number"
                value={newAlertPrice}
                onChange={(e) => setNewAlertPrice(e.target.value)}
                placeholder="Enter price..."
                className="flex-1 px-3 py-2 rounded-xl text-white text-sm font-medium placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(124, 58, 237, 0.2)'
                }}
              />
              <select
                value={newAlertCondition}
                onChange={(e) => setNewAlertCondition(e.target.value as 'above' | 'below')}
                className="px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                style={{
                  background: 'rgba(124, 58, 237, 0.2)',
                  border: '1px solid rgba(124, 58, 237, 0.3)'
                }}
              >
                <option value="above" style={{ background: '#1a1a1a' }}>Above</option>
                <option value="below" style={{ background: '#1a1a1a' }}>Below</option>
              </select>
            </div>
            <button
              onClick={addAlert}
              className="w-full px-3 py-2 rounded-xl text-white text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              Add Alert
            </button>
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
        <div className="p-4 space-y-2">
          {currentCryptoAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No alerts set for {crypto}</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-sm text-purple-400 transition-colors"
              >
                Create your first alert
              </button>
            </div>
          ) : (
            currentCryptoAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  alert.triggered
                    ? alert.condition === 'above'
                      ? 'bg-emerald-500/5'
                      : 'bg-red-500/5'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        background: alert.condition === 'above' 
                          ? 'rgba(110, 231, 183, 0.1)' 
                          : 'rgba(239, 68, 68, 0.1)'
                      }}
                    >
                      {alert.condition === 'above' ? (
                        <TrendingUp className="w-4 h-4" style={{ color: '#6EE7B7' }} />
                      ) : (
                        <TrendingDown className="w-4 h-4" style={{ color: '#EF4444' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-white">
                          ${alert.price.toLocaleString()}
                        </div>
                        {alert.triggered && (
                          <span 
                            className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                              alert.condition === 'above'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            Triggered
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {alert.condition === 'above' ? 'Above' : 'Below'} alert • {crypto}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {alert.triggered && (
                      <button
                        onClick={() => resetAlert(alert.id)}
                        className="p-1 hover:bg-green-500/20 rounded transition-colors"
                        title="Reset alert"
                      >
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </button>
                    )}
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      title="Remove alert"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Current: ${currentPrice.toFixed(2)}</span>
                    <span>
                      {alert.condition === 'above' 
                        ? `${((currentPrice / alert.price) * 100).toFixed(1)}%`
                        : `${((alert.price / currentPrice) * 100).toFixed(1)}%`
                      }
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    <div 
                      className="h-full transition-all duration-500"
                      style={{
                        width: alert.condition === 'above'
                          ? `${Math.min((currentPrice / alert.price) * 100, 100)}%`
                          : `${Math.min((alert.price / currentPrice) * 100, 100)}%`,
                        background: alert.condition === 'above'
                          ? 'linear-gradient(90deg, #6EE7B7 0%, #34D399 100%)'
                          : 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
