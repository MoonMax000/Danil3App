import { Plus, FolderOpen, ShoppingBag, Users } from 'lucide-react';

interface DiscordSidebarProps {
  className?: string;
}

const DiscordSidebar = ({ className = '' }: DiscordSidebarProps) => {
  const channels = [
    { id: 1, type: 'folder', icon: <FolderOpen className="w-6 h-6" />, label: 'All', count: 2 },
    { id: 2, type: 'folder', icon: <ShoppingBag className="w-6 h-6" />, label: 'Market', count: 2 },
  ];

  const users = [
    { id: 1, avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/2b803989fc6c57bb21ec76dd565badff6d6c2084?width=96', count: 2 },
    { id: 2, avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/73c9e6f1b8d834e9af0573faf90ea563828a292a?width=96' },
    { id: 3, type: 'group', icon: <Users className="w-6 h-6" />, count: 2, gradient: true },
    { id: 4, avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/3a3cece7d64717d37149c9c64343b4f38a182d42?width=96', count: 2 },
    { id: 5, avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/ad0720ada156dddc081276ad9496d2fd957c5f74?width=96', count: 2, online: false },
    { id: 6, avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/3a3cece7d64717d37149c9c64343b4f38a182d42?width=96', count: 2, online: true },
    { id: 7, avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/3a3cece7d64717d37149c9c64343b4f38a182d42?width=96', count: 2, online: true },
    { id: 8, avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/fff84d06d69670605b1d96b0d453d4d7688e56bf?width=96' },
  ];

  return (
    <div
      className={`flex flex-col items-center gap-4 w-20 flex-none min-h-screen py-6 ml-4 border-l border-t border-b border-[#181B22] rounded-l-3xl custom-bg-blur ${className}`}
    >
      {/* Add Channel Button */}
      <button className="w-6 h-6 flex items-center justify-center text-[#B0B0B0] hover:text-white transition-colors">
        <Plus className="w-6 h-6" />
      </button>

      {/* Channels Section */}
      <div className="flex flex-col items-center gap-4">
        {channels.map((channel) => (
          <div key={channel.id} className="flex flex-col items-center gap-2">
            <div className="relative w-12 h-12 flex items-center justify-center text-white">
              {channel.icon}
              {channel.count && (
                <div className="absolute -top-1 -left-1 flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full bg-purple text-white text-xs font-bold">
                  {channel.count}
                </div>
              )}
            </div>
            <span className="text-white text-xs font-bold">{channel.label}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-16 h-px bg-[#181B22]" />

      {/* Users/Groups Section */}
      <div className="flex flex-col items-center gap-4 flex-1">
        {users.map((user, idx) => (
          <div key={user.id} className="relative">
            {user.type === 'group' ? (
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                  user.gradient ? 'bg-gradient-to-r from-purple to-darkPurple' : ''
                }`}
              >
                {user.icon}
              </div>
            ) : (
              <img
                src={user.avatar}
                alt={`User ${user.id}`}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            
            {user.count && (
              <div
                className={`absolute -top-1 -left-1 flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full text-white text-xs font-bold ${
                  user.online === false ? 'bg-gunpowder' : 'bg-purple'
                }`}
              >
                {user.count}
              </div>
            )}
            
            {user.online !== undefined && (
              <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green border-2 border-black" />
            )}

            {/* Active indicator */}
            {idx === 5 && (
              <div className="absolute -right-6 top-0 w-1 h-12 rounded-r bg-purple" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscordSidebar;
