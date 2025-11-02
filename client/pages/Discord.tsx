import { useState } from 'react';
import DiscordSidebar from '@/components/discord/DiscordSidebar';
import DiscordChannelsPanel from '@/components/discord/DiscordChannelsPanel';
import DiscordChatWindow from '@/components/discord/DiscordChatWindow';

export default function Discord() {
  const [selectedChannel, setSelectedChannel] = useState<{ id: string; name: string } | null>(null);
  const [showChatList, setShowChatList] = useState(true);

  return (
    <div className="flex gap-0 min-h-screen min-w-0 overflow-hidden">
      {showChatList && <DiscordSidebar />}
      {showChatList && (
        <DiscordChannelsPanel 
          selectedId={selectedChannel?.id || null}
          onSelect={(id, name) => setSelectedChannel({ id, name: name || id })}
        />
      )}
      <DiscordChatWindow 
        selectedRoomId={selectedChannel?.id || 'self-intro'}
        selectedRoomName={selectedChannel?.name}
        initialShowInfo={false}
        showChatListButton={true}
        onToggleChatList={() => setShowChatList(!showChatList)}
      />
    </div>
  );
}
