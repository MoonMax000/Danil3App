import { useState, useEffect } from 'react';
import { Search, Hash, Volume2, Settings, UserPlus, X, ChevronRight, ChevronDown, Plus, ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaywallModal from './PaywallModal';
import { cn } from '@/lib/utils';
import ServerSettingsModal from './ServerSettingsModal';
import CreateRoomModal from './CreateRoomModal';

import { loadRooms, ChannelCategory } from './channels';

const DiscordChannelsPanel = ({ onBack, backLabel, className = '', selectedId, onSelect }: { onBack?: () => void; backLabel?: string; className?: string; selectedId?: string | null; onSelect?: (id: string, name?: string) => void }) => {
  const navigate = useNavigate();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(['important'])
  );
  const PAID_STORAGE_KEY = 'paid_engagement_settings_v1';
  const [paidInfo, setPaidInfo] = useState<{ enabled: boolean; gated: Set<string> }>(() => ({ enabled: false, gated: new Set() }));
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(PAID_STORAGE_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          setPaidInfo({ enabled: !!p.enabled, gated: new Set(Array.isArray(p.gatedRooms) ? p.gatedRooms : []) });
        } else {
          setPaidInfo({ enabled: false, gated: new Set() });
        }
      } catch {}
    };
    load();
    const handler = () => load();
    window.addEventListener('paid-settings-updated', handler as any);
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('paid-settings-updated', handler as any);
      window.removeEventListener('storage', handler);
      window.removeEventListener('focus', handler);
    };
  }, []);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [payTarget, setPayTarget] = useState<{ id: string; name: string } | null>(null);
  const isUnlocked = (id: string) => localStorage.getItem(`paid_access_granted_v1:${id}`) === 'true';
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [categories, setCategories] = useState<ChannelCategory[]>(() => loadRooms());
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [createCategoryId, setCreateCategoryId] = useState<string | null>(null);

  // listen to updates dispatched by settings UI
  useEffect(() => {
    const handler = () => setCategories(loadRooms());
    window.addEventListener('rooms-updated', handler as any);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('rooms-updated', handler as any);
      window.removeEventListener('focus', handler);
    };
  }, []);

  useEffect(() => {
    const open = (e: any) => {
      setCreateCategoryId(e?.detail?.categoryId || null);
      setShowCreateRoom(true);
    };
    window.addEventListener('open-create-room', open as any);
    return () => window.removeEventListener('open-create-room', open as any);
  }, []);

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // categories imported from shared registry

  return (
    <div className={`flex flex-col w-[283px] flex-none min-h-screen py-6 px-4 gap-6 border-t border-b border-[#181B22] custom-bg-blur ${className}`}>

      {/* Back to all chats - always show */}
      <button onClick={() => navigate('/private-messages')} className="flex items-center gap-2.5 text-white hover:text-purple hover:bg-white/5 rounded-full px-3 py-1.5 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-[15px] font-bold">Back to all chats</span>
      </button>
      <div className="h-px bg-[#181B22]" />

      {/* Channel Search */}
      <button className="flex items-center gap-2.5 text-white hover:text-purple hover:bg-white/5 rounded-full px-3 py-1.5 transition-colors">
        <Search className="w-5 h-5" />
        <span className="text-[15px] font-bold">Channel Search</span>
      </button>

      {/* Manage Rooms */}
      <button onClick={() => setShowServerSettings(true)} className="flex items-center gap-2.5 text-white hover:text-purple hover:bg-white/5 rounded-full px-3 py-1.5 transition-colors">
        <Settings className="w-5 h-5" />
        <span className="text-[15px] font-bold">Manage Rooms</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-[#181B22]" />

      {/* Channels */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto scrollbar">
        {/* Recommendations Section */}
        {showRecommendations && (
          <div className="flex flex-col gap-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple">Recommendations</span>
              </div>
              <button
                onClick={() => setShowRecommendations(false)}
                className="text-white hover:text-purple hover:bg-white/10 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Welcome Channel */}
            <div className="relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect?.('welcome', 'Welcome')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onSelect?.('welcome', 'Welcome'); } }}
                className={`flex items-center justify-between w-full py-1.5 rounded-full px-3 transition-colors group ${selectedId === 'welcome' ? 'bg-white/10 text-white' : 'text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5" />
                  <span className="text-[15px] font-bold">Welcome</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowServerSettings(true); }}
                    className="hover:text-purple transition-colors"
                    type="button"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <UserPlus className="w-5 h-5" />
                </div>
              </div>
              {/* Pointer indicator */}
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/1eeb045fad2165cf95cfd04e4c3c25f7fd24b680?width=35"
                alt=""
                className="absolute -right-12 top-3 w-[18px] h-6"
              />
            </div>

            {/* Divider after recommendations */}
            <div className="h-px bg-[#181B22]" />
          </div>
        )}

        {/* Rules Channel (standalone) */}
        <button onClick={() => onSelect?.('rules', 'Rules')} className={`flex items-center gap-3 py-1.5 rounded-full px-3 transition-colors ${selectedId === 'rules' ? 'bg-white/10 text-white' : 'text-white hover:bg-white/5'}`}>
          <Hash className="w-5 h-5" />
          <span className="text-[15px] font-bold">Rules</span>
        </button>

        {/* Important Section (empty, collapsible) */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleCategory('important')}
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/5 transition-colors group"
          >
            <span className="text-xs font-bold text-purple">Important</span>
            <ChevronRight className="w-3 h-3 text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setShowServerSettings(true); }} className="text-[#B0B0B0] hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors" type="button">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Other Categories */}
        {categories.map((category) => {
          const isCollapsed = collapsedCategories.has(category.id);
          const hasChannels = category.channels.length > 0;

          return (
            <div key={category.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => hasChannels && toggleCategory(category.id)}
                  className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/5 transition-colors group"
                >
                  <span className={cn('text-xs font-bold', category.color || 'text-white')}>
                    {category.name}
                  </span>
                  {hasChannels && (
                    <ChevronDown
                      className={cn(
                        'w-3 h-3 text-white transition-transform',
                        isCollapsed && '-rotate-90'
                      )}
                    />
                  )}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowServerSettings(true); }} className="text-[#B0B0B0] hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors" type="button">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Channels List */}
              {!isCollapsed && hasChannels && (
                <div className="flex flex-col">
                  {category.channels.map((channel) => {
                    const isPaid = paidInfo.enabled && paidInfo.gated.has(channel.id);
                    return (
                      <button
                        key={channel.id}
                        onClick={() => {
                          if (isPaid && !isUnlocked(channel.id)) {
                            setPayTarget({ id: channel.id, name: channel.name });
                            setShowPay(true);
                            return;
                          }
                          onSelect?.(channel.id, channel.name);
                        }}
                        className={`flex items-center justify-between py-1.5 rounded-full px-3 transition-colors group ${selectedId === channel.id ? 'bg-white/10 text-white' : 'text-white hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3">
                          {channel.type === 'voice' ? (
                            <Volume2 className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <Hash className="w-5 h-5 flex-shrink-0" />
                          )}
                          <div className="flex items-center gap-1">
                            {channel.icon && <span className="text-[15px]">{channel.icon}</span>}
                            <span className="text-[15px] font-bold">{channel.name}</span>
                          </div>
                        </div>
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple">
                            <Lock className="w-3 h-3" /> Paid
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>


      {/* Server Settings Modal */}
      <ServerSettingsModal
        isOpen={showServerSettings}
        onClose={() => setShowServerSettings(false)}
        initialSection="rooms"
      />

      <CreateRoomModal isOpen={showCreateRoom} categoryId={createCategoryId} onClose={() => setShowCreateRoom(false)} />

      <PaywallModal
        isOpen={showPay}
        roomId={payTarget?.id || ''}
        roomName={payTarget?.name}
        onUnlocked={() => {
          if (payTarget) {
            onSelect?.(payTarget.id, payTarget.name);
          }
        }}
        onClose={() => { setShowPay(false); setPayTarget(null); }}
      />

    </div>
  );
};

export default DiscordChannelsPanel;
