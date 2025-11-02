import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId?: number;
}

interface User {
  id: number;
  name: string;
  avatar: string;
  lastSeen: string;
}

const users: User[] = [
  {
    id: 1,
    name: 'George Taylor',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/03a90d8f7d9736935ab1eb037890313f941befe2?width=64',
    lastSeen: 'last seen recently',
  },
  {
    id: 2,
    name: 'Jack Brown',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/5e9107db9f241945e82298237af1d9763c95852e?width=64',
    lastSeen: 'last seen recently',
  },
  {
    id: 3,
    name: 'Brendan Collins',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/23422e9164300093f341596cff4dc76c091c4ee6?width=64',
    lastSeen: 'last seen within a month',
  },
  {
    id: 4,
    name: 'Wing Chun',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/23422e9164300093f341596cff4dc76c091c4ee6?width=64',
    lastSeen: 'last seen a long time ago',
  },
];

const ShareModal = ({ isOpen, onClose, messageId }: ShareModalProps) => {
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const toggleUser = (userId: number) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleShare = () => {
    console.log('Sharing message', messageId, 'with users:', Array.from(selectedUsers));
    onClose();
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="flex flex-col w-[468px] items-center rounded-3xl overflow-hidden border border-[#181B22] custom-bg-blur"
      >
        {/* Header */}
        <div className="flex justify-between items-center w-full px-7 pt-7 pb-4">
          <h2 className="text-white text-2xl font-bold">Share With</h2>
          <button onClick={onClose} className="text-white hover:opacity-80 transition-opacity">
            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5909 12.5L18.0441 8.04687C18.2554 7.8359 18.3743 7.54962 18.3745 7.25099C18.3748 6.95237 18.2564 6.66587 18.0455 6.45453C17.8345 6.24319 17.5482 6.12431 17.2496 6.12404C16.951 6.12378 16.6645 6.24215 16.4531 6.45312L12 10.9062L7.54687 6.45312C7.33553 6.24178 7.04888 6.12305 6.75 6.12305C6.45111 6.12305 6.16447 6.24178 5.95312 6.45312C5.74178 6.66447 5.62305 6.95111 5.62305 7.25C5.62305 7.54888 5.74178 7.83553 5.95312 8.04687L10.4062 12.5L5.95312 16.9531C5.74178 17.1645 5.62305 17.4511 5.62305 17.75C5.62305 18.0489 5.74178 18.3355 5.95312 18.5469C6.16447 18.7582 6.45111 18.8769 6.75 18.8769C7.04888 18.8769 7.33553 18.7582 7.54687 18.5469L12 14.0937L16.4531 18.5469C16.6645 18.7582 16.9511 18.8769 17.25 18.8769C17.5489 18.8769 17.8355 18.7582 18.0469 18.5469C18.2582 18.3355 18.3769 18.0489 18.3769 17.75C18.3769 17.4511 18.2582 17.1645 18.0469 16.9531L13.5909 12.5Z" fill="white"/>
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full px-7 py-4">
          <div className="flex items-center gap-2 w-full h-11 px-4 py-2.5 rounded-2xl border border-[#181B22] bg-[#0C1014]/80 backdrop-blur-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 22L20 20" stroke="#B0B0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white text-[15px] font-bold placeholder:text-[#B0B0B0] placeholder:font-bold"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex flex-col w-full py-3 divide-y divide-[#181B22]/60">
          {filteredUsers.map((user) => {
            const isSelected = selectedUsers.has(user.id);
            const isHovered = hoveredUserId === user.id;

            return (
              <button
                key={user.id}
                onClick={() => toggleUser(user.id)}
                onMouseEnter={() => setHoveredUserId(user.id)}
                onMouseLeave={() => setHoveredUserId(null)}
                className={cn(
                  'flex items-center gap-3 px-7 py-3 transition-colors',
                  isHovered && 'bg-regaliaPurple/20'
                )}
              >
                <div className="flex items-center gap-2 flex-1">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-white text-[15px] font-bold">{user.name}</span>
                    <span className="text-[#B0B0B0] text-xs font-bold line-clamp-1">
                      {user.lastSeen}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center transition-all ring-1 ring-inset ring-regaliaPurple/60',
                    isSelected
                      ? 'bg-gradient-to-l from-purple to-darkPurple'
                      : 'border border-regaliaPurple'
                  )}
                >
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3327 4L5.99935 11.3333L2.66602 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Share Button */}
        <div className="w-full px-7 py-6 rounded-b-3xl">
          <button
            onClick={handleShare}
            disabled={selectedUsers.size === 0}
            className={cn(
              'w-full h-[46px] flex items-center justify-center rounded-full transition-opacity shadow-md',
              selectedUsers.size === 0
                ? 'opacity-50 cursor-not-allowed bg-gradient-to-l from-purple to-darkPurple'
                : 'hover:opacity-90 bg-gradient-to-l from-purple to-darkPurple'
            )}
          >
            <span className="text-white text-[15px] font-bold">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
