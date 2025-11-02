import { Info, Bell, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type Tab = 'members' | 'media' | 'files' | 'links';

interface DiscordChannelInfoProps {
  className?: string;
}

interface DiscordChannelInfoPanelProps {
  className?: string;
}

const DiscordChannelInfoPanel = ({ className }: DiscordChannelInfoPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('media');
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const mediaItems = useMemo(
    () =>
      Array(18)
        .fill(null)
        .map((_, i) => ({
          id: i,
          url:
            i % 3 === 0
              ? 'https://api.builder.io/api/v1/image/assets/TEMP/6e6e0f768df5b86151c9aed84c448088bd82d862?width=244'
              : i % 3 === 1
              ? 'https://api.builder.io/api/v1/image/assets/TEMP/1f69d0aed31ac7516d4ed56b56b156e44bdb5cf1?width=244'
              : 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=244',
        })),
    [],
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col items-center gap-8 shrink-0">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-l from-purple to-darkPurple flex items-center justify-center">
            <Users className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-white font-bold text-2xl">NanoTech</h2>
            <p className="text-[#B0B0B0] text-[15px]">19,123 members, 2190 online</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#181B22]">
          <Info className="w-6 h-6 text-[#B0B0B0] flex-shrink-0" />
          <p className="text-[#B0B0B0] text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            Welcome to the Future! Join our Telegram group to explore the world of nanotechnology — breakthroughs, research, innovations, and discussions. Whether you're a scientist, student, or tech enthusiast, let's dive into the tiny tech shaping our tomorrow! #Nanotech #Science #Innovation
          </p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-[#181B22] w-full">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-[15px]">Notification</span>
          </div>
          <button
            onClick={() => setNotificationEnabled(!notificationEnabled)}
            className={`w-[38px] h-5 rounded-full p-0.5 flex items-center transition-all ${
              notificationEnabled
                ? 'bg-gradient-to-l from-purple to-darkPurple justify-end'
                : 'bg-[#523A83] justify-start'
            }`}
          >
            <div className="w-4 h-4 bg-white rounded-full" />
          </button>
        </div>
      </div>

      <div className="flex flex-col pt-2 rounded-xl border border-[#181B22] flex-1 min-h-0 overflow-hidden">
        <div
          className="flex items-center justify-center gap-2 p-1 mx-auto rounded-full border border-[#181B22] shrink-0"
          style={{
            background: 'rgba(12, 16, 20, 0.50)',
            backdropFilter: 'blur(50px)',
          }}
        >
          {(['members', 'media', 'files', 'links'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-8 px-3 rounded-full text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-l from-purple to-darkPurple text-white'
                  : 'border border-[#181B22] text-white'
              }`}
              style={
                activeTab !== tab
                  ? {
                      background: 'rgba(12, 16, 20, 0.50)',
                      backdropFilter: 'blur(58.33px)',
                    }
                  : {}
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto min-h-0">
          {activeTab === 'media' && (
            <div className="grid grid-cols-2 gap-1">
              {mediaItems.map((item) => (
                <img
                  key={item.id}
                  src={item.url}
                  alt=""
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded block"
                />
              ))}
            </div>
          )}
          {activeTab === 'members' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-2 transition-colors">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/ecf9a5cc4967e5e1f5bb0b73d446bf8fc6b0dc6e?width=64"
                  alt="User avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col flex-1">
                  <span className="text-[15px] font-bold text-white">Genevieve Hammes</span>
                  <span className="text-xs text-[#B0B0B0]">last seen recently</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'files' && (
            <div className="text-[#B0B0B0] text-sm text-center py-8">No files shared yet</div>
          )}
          {activeTab === 'links' && (
            <div className="text-[#B0B0B0] text-sm text-center py-8">No links shared yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

const DiscordChannelInfo = ({ className }: DiscordChannelInfoProps) => (
  <div
    className={cn(
      'flex flex-col w-[420px] flex-none min-h-screen pt-12 px-6 gap-6 border-t border-b border-[#181B22] rounded-r-3xl overflow-hidden',
      className,
    )}
    style={{
      background: 'rgba(12, 16, 20, 0.50)',
      backdropFilter: 'blur(50px)',
    }}
  >
    <DiscordChannelInfoPanel className="flex-1 min-h-0" />
  </div>
);

export { DiscordChannelInfoPanel };
export default DiscordChannelInfo;
