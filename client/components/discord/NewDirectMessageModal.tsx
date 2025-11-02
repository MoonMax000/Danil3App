import { useEffect, useState } from 'react';
import { Search, X, Check } from 'lucide-react';

export interface NewDirectMessageData {
  name: string;
  avatarUrl: string;
}

const AVAILABLE_USERS = [
  {
    id: 1,
    name: 'George Taylor',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/03a90d8f7d9736935ab1eb037890313f941befe2?width=64',
    status: 'last seen recently',
  },
  {
    id: 2,
    name: 'Jack Brown',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/5e9107db9f241945e82298237af1d9763c95852e?width=64',
    status: 'last seen recently',
  },
  {
    id: 3,
    name: 'Brendan Collins',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/23422e9164300093f341596cff4dc76c091c4ee6?width=64',
    status: 'last seen within a month',
  },
  {
    id: 4,
    name: 'Wing Chun',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/23422e9164300093f341596cff4dc76c091c4ee6?width=64',
    status: 'last seen a long time ago',
  },
];

export default function NewDirectMessageModal({ isOpen, onClose, onStart }: { isOpen: boolean; onClose: () => void; onStart: (data: NewDirectMessageData) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedUsers(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = AVAILABLE_USERS.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleCreate = () => {
    if (selectedUsers.size === 0) return;
    
    // For now, start chat with the first selected user
    const firstUserId = Array.from(selectedUsers)[0];
    const user = AVAILABLE_USERS.find((u) => u.id === firstUserId);
    
    if (user) {
      onStart({ name: user.name, avatarUrl: user.avatar });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="flex flex-col w-full max-w-[468px] mx-4 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.50)] backdrop-blur-[50px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6">
          <h2 className="text-2xl font-bold text-white">Start a Chat</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 text-white hover:text-purple transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 h-11 px-4 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.50)] backdrop-blur-[50px]">
            <Search className="w-6 h-6 text-[#B0B0B0] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent text-[15px] font-bold text-white placeholder:text-[#B0B0B0] outline-none"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex flex-col max-h-[280px] overflow-y-auto scrollbar">
          {filteredUsers.map((user, index) => {
            const isSelected = selectedUsers.has(user.id);
            const isHovered = index === 1; // For demo, Jack Brown has hover state in Figma
            
            return (
              <button
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  index === 3 ? 'bg-[#523A83]' : 'hover:bg-[#523A83]/50'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1 flex flex-col items-start min-w-0">
                  <div className="text-[15px] font-bold text-white">{user.name}</div>
                  <div className="text-xs font-bold text-[#B0B0B0] truncate w-full text-left">
                    {user.status}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-l from-purple to-darkPurple'
                      : 'border border-[#523A83]'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Create Button */}
        <div className="flex items-center justify-center px-6 py-4">
          <button
            onClick={handleCreate}
            disabled={selectedUsers.size === 0}
            className={`w-full h-[46px] rounded-lg text-[15px] font-bold text-white transition-opacity ${
              selectedUsers.size === 0
                ? 'bg-[#2E2744] opacity-50 cursor-not-allowed'
                : 'bg-gradient-to-l from-purple to-darkPurple hover:opacity-90'
            }`}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
