export interface Channel { id: string; name: string; icon?: string; type?: 'text' | 'voice' }
export interface ChannelCategory { id: string; name: string; color?: string; channels: Channel[] }

const STORAGE_KEY = 'server_rooms_v1';

export const defaultCategories: ChannelCategory[] = [
  {
    id: 'general',
    name: 'General',
    color: 'text-purple',
    channels: [
      { id: 'self-intro', name: 'self-intro', icon: '👋', type: 'text' },
      { id: 'tradingchat', name: 'tradingchat', icon: '✍️', type: 'text' },
      { id: 'suggestion', name: 'suggestion', icon: '💭', type: 'text' },
    ],
  },
  {
    id: 'promote',
    name: 'Promote/Partner',
    color: 'text-purple',
    channels: [
      { id: 'partnership-proposal', name: 'partnership-proposal', icon: '🤙', type: 'text' },
      { id: 'partner-collab', name: 'partner-collab', icon: '🤝', type: 'text' },
    ],
  },
  {
    id: 'bots',
    name: 'Bots',
    color: 'text-purple',
    channels: [
      { id: 'dank-memer', name: 'dank-memer', icon: '😃', type: 'text' },
      { id: 'bimo', name: 'bimo', icon: '🎧', type: 'text' },
    ],
  },
  {
    id: 'voice',
    name: 'Voice chat',
    color: 'text-purple',
    channels: [
      { id: 'music-comand', name: 'music-comand', icon: '🎵', type: 'text' },
      { id: 'hangouts', name: 'hangouts', icon: '☕', type: 'voice' },
    ],
  },
  {
    id: 'support',
    name: 'Support',
    color: 'text-purple',
    channels: [
      { id: 'ticket-tool', name: 'ticket-tool', icon: '🤖', type: 'text' },
      { id: 'help-desk', name: 'help-desk', icon: '🆘', type: 'text' },
    ],
  },
];

export const loadRooms = (): ChannelCategory[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChannelCategory[];
  } catch {}
  return defaultCategories;
};

export const saveRooms = (cats: ChannelCategory[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
};

export const getAllChannels = (): Channel[] => loadRooms().flatMap((c) => c.channels);
export const getAllChannelIds = (): string[] => getAllChannels().map((c) => c.id);
export const getChannelNameById = (): Record<string, string> => Object.fromEntries(getAllChannels().map((c) => [c.id, c.name]));
