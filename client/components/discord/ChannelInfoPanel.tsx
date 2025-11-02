import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface ChannelInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'members' | 'media' | 'files' | 'links';

interface Member {
  id: number;
  name: string;
  avatar: string;
  status: string;
  role?: 'Owner' | 'Admin';
}

const members: Member[] = [
  {
    id: 1,
    name: 'John Smith (Me)',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/ecf9a5cc4967e5e1f5bb0b73d446bf8fc6b0dc6e?width=64',
    status: 'last seen recently',
    role: 'Owner',
  },
  {
    id: 2,
    name: 'George Taylor',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/03a90d8f7d9736935ab1eb037890313f941befe2?width=64',
    status: 'last seen recently',
    role: 'Admin',
  },
  {
    id: 3,
    name: 'Jack Brown',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/5e9107db9f241945e82298237af1d9763c95852e?width=64',
    status: 'last seen recently',
  },
  {
    id: 4,
    name: 'Brendan Collins',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/23422e9164300093f341596cff4dc76c091c4ee6?width=64',
    status: 'last seen within a month',
  },
  {
    id: 5,
    name: 'George Taylor',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/03a90d8f7d9736935ab1eb037890313f941befe2?width=64',
    status: 'last seen recently',
  },
  {
    id: 6,
    name: 'Brendan Collins',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/23422e9164300093f341596cff4dc76c091c4ee6?width=64',
    status: 'last seen within a month',
  },
  {
    id: 7,
    name: 'Jack Brown',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/5e9107db9f241945e82298237af1d9763c95852e?width=64',
    status: 'last seen recently',
  },
  {
    id: 8,
    name: 'George Taylor',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/03a90d8f7d9736935ab1eb037890313f941befe2?width=64',
    status: 'last seen recently',
  },
];

const mediaImages = [
  'https://api.builder.io/api/v1/image/assets/TEMP/6e6e0f768df5b86151c9aed84c448088bd82d862?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/6e6e0f768df5b86151c9aed84c448088bd82d862?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/3b66a4f0ee429a44d23c84bd5fe81e04858ae825?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/3b66a4f0ee429a44d23c84bd5fe81e04858ae825?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/adca9c8e8efa705b92f5f27f7745281eb924cf93?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/adca9c8e8efa705b92f5f27f7745281eb924cf93?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/6e6e0f768df5b86151c9aed84c448088bd82d862?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/6e6e0f768df5b86151c9aed84c448088bd82d862?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/cb46ff73bb41360d9efae8979a5d04ce7981b02b?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/cb46ff73bb41360d9efae8979a5d04ce7981b02b?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=244',
  'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=244',
];

export const ChannelInfoPanel = ({ isOpen, onClose }: ChannelInfoPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col gap-6 overflow-y-auto rounded-l-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-6 pt-12 backdrop-blur-[50px] scrollbar">
        {/* Channel Header */}
        <div className="flex flex-col items-center gap-8">
          {/* Channel Info */}
          <div className="flex flex-col items-center gap-3">
            {/* Icon */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-l from-purple to-darkPurple">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M29.8526 8.82206L16.547 15.209C15.523 15.7006 14.4289 15.8237 13.3135 15.5739C12.5835 15.4103 12.2185 15.3286 11.9246 15.295C8.27486 14.8782 6 17.7668 6 21.0886V22.9114C6 26.2332 8.27486 29.1218 11.9246 28.705C12.2185 28.6714 12.5836 28.5896 13.3135 28.4262C14.4289 28.1762 15.523 28.2994 16.547 28.791L29.8526 35.178C32.9068 36.6442 34.434 37.3772 36.1368 36.8058C37.8394 36.2344 38.4238 35.0082 39.5928 32.556C42.8024 25.8224 42.8024 18.1777 39.5928 11.4439C38.4238 8.99172 37.8394 7.76562 36.1368 7.1942C34.434 6.6228 32.9068 7.35588 29.8526 8.82206Z" stroke="white" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M26 34V35C26 37.5682 26 38.8522 25.552 39.5772C24.9546 40.5438 23.8624 41.09 22.7306 40.9878C21.8818 40.9114 20.8546 40.1408 18.8 38.6L16.4 36.8C14.4451 35.3338 14 34.4436 14 32V29" stroke="white" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 28V16" stroke="white" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Title and Stats */}
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-white">JetJet Channel</h2>
              <p className="text-xs font-bold text-[#B0B0B0]">19,123 members, 2190 online</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[#181B22] w-full">
            <Info className="w-6 h-6 text-[#B0B0B0] flex-shrink-0" />
            <div className="text-[#B0B0B0]">
              <div className="text-white font-bold text-[15px] mb-2">Welcome to the Future!</div>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                Join our Telegram group to explore the world of nanotechnology — breakthroughs, research, innovations, and discussions. Whether you're a scientist, student, or tech enthusiast, let's dive into the tiny tech shaping our tomorrow!
              </p>
              <div className="mt-3 text-[15px]">#Nanotech #Science #Innovation</div>
            </div>
          </div>

          {/* Notification Toggle */}
          <div className="flex w-full items-center justify-between rounded-xl border border-[#181B22] px-6 py-4">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.10819 12.3083C1.93098 13.47 2.72325 14.2763 3.69329 14.6782C7.41226 16.2188 12.5876 16.2188 16.3065 14.6782C17.2766 14.2763 18.0688 13.47 17.8917 12.3083C17.7828 11.5944 17.2443 10.9999 16.8453 10.4194C16.3227 9.64974 16.2708 8.81016 16.2707 7.91699C16.2707 4.46521 13.4632 1.66699 9.99992 1.66699C6.53669 1.66699 3.72919 4.46521 3.72919 7.91699C3.72911 8.81016 3.67719 9.64974 3.15459 10.4194C2.75562 10.9999 2.21709 11.5944 2.10819 12.3083Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66675 15.833C7.04882 17.2707 8.39633 18.333 10.0001 18.333C11.6038 18.333 12.9513 17.2707 13.3334 15.833" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Notification</span>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={cn(
                'relative flex h-5 w-[38px] items-center rounded-full p-0.5 transition-colors',
                notificationsEnabled
                  ? 'bg-gradient-to-l from-purple to-darkPurple'
                  : 'bg-[#2E2744]'
              )}
            >
              <div
                className={cn(
                  'h-4 w-4 rounded-full bg-white transition-transform',
                  notificationsEnabled ? 'translate-x-[18px]' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col items-center rounded-xl border border-[#181B22] pt-2">
          {/* Tabs */}
          <div className="flex gap-2 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-1 backdrop-blur-[50px]">
            <button
              onClick={() => setActiveTab('members')}
              className={cn(
                'h-8 rounded-full px-3 text-xs font-bold transition-all',
                activeTab === 'members'
                  ? 'bg-gradient-to-l from-purple to-darkPurple text-white'
                  : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white'
              )}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={cn(
                'h-8 rounded-full px-3 text-xs font-bold transition-all',
                activeTab === 'media'
                  ? 'bg-gradient-to-l from-purple to-darkPurple text-white'
                  : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white'
              )}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={cn(
                'h-8 rounded-full px-3 text-xs font-bold transition-all',
                activeTab === 'files'
                  ? 'bg-gradient-to-l from-purple to-darkPurple text-white'
                  : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white'
              )}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={cn(
                'h-8 rounded-full px-3 text-xs font-bold transition-all',
                activeTab === 'links'
                  ? 'bg-gradient-to-l from-purple to-darkPurple text-white'
                  : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white'
              )}
            >
              Links
            </button>
          </div>

          {/* Tab Content */}
          <div className="w-full py-3">
            {activeTab === 'members' && (
              <div className="flex flex-col">
                {members.map((member, index) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member.id)}
                    className={cn(
                      'flex items-center gap-3 px-6 py-3 transition-colors',
                      selectedMember === member.id ? 'bg-[#523A83]' : 'hover:bg-white/5'
                    )}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="flex flex-1 flex-col items-start">
                      <span className="text-[15px] font-bold text-white">{member.name}</span>
                      <span className="text-xs font-bold text-[#B0B0B0] opacity-80">{member.status}</span>
                    </div>
                    {member.role && (
                      <span className="text-xs font-bold text-[#B0B0B0]">{member.role}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="grid grid-cols-2 gap-1 p-6">
                {mediaImages.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded"
                  >
                    <img
                      src={image}
                      alt={`Media ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="p-6 text-center text-[#B0B0B0]">Files list coming soon</div>
            )}

            {activeTab === 'links' && (
              <div className="p-6 text-center text-[#B0B0B0]">Links list coming soon</div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};
