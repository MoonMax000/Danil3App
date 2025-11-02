import { ChevronLeft, Users, MoreVertical, Plus, Send, Smile, Eye, ChevronRight, ChevronDown, Settings, Lock, Reply, Copy, Pin, Star, Share2, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import ServerSettingsModal from './ServerSettingsModal';
import MessageContextMenu from './MessageContextMenu';
import ShareModal from './ShareModal';
import InlineComments, { InlineComment } from './InlineComments';
import { ChangeGroupModal } from './ChangeGroupModal';
import { ChannelInfoPanel } from './ChannelInfoPanel';

const PAID_STORAGE_KEY = 'paid_engagement_settings_v1';

type PaidSettings = { enabled: boolean; passes: { id: string; name: string; priceUsd: number; periodDays: number }[]; defaultPassId: string | null; gatedRooms: string[] };

type MediaItem = { type: 'image' | 'video'; url: string };
interface Message {
  id: number;
  authorId: number;
  title?: string;
  image?: string;
  media?: MediaItem[];
  text: string;
  hashtags?: string[];
  views: number;
  time: string;
  commentAvatars: string[];
  commentCount: number;
}

const USERS = [
  { id: 0, name: 'You', avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/6a9ff670ed336d7a414768e0bcb4b9c003cad14c?width=48' },
  { id: 1, name: 'Alice', avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48' },
  { id: 2, name: 'Bob', avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/898dca4b250140da2778a69f55231f3783831032?width=48' },
  { id: 3, name: 'Carol', avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/73c9e6f1b8d834e9af0573faf90ea563828a292a?width=48' },
];

const urlRegex = /(https?:\/\/[^\s]+)/g;
const hashtagOrUrl = /(https?:\/\/[^\s]+)|(#\w+)/g;
const MessageBody = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const hasLink = urlRegex.test(text);
  const tooLong = text.length > 300;
  const visible = expanded || !tooLong ? text : text.slice(0, 300) + '…';
  const renderParts = (t: string) => {
    const parts = t.split(hashtagOrUrl);
    return parts.map((part, i) => {
      if (!part) return null;
      if (urlRegex.test(part)) {
        return (
          <a key={i} href={part} target="_blank" rel="noreferrer" className="text-purple hover:underline inline-flex items-center gap-1">
            <LinkIcon className="w-4 h-4" />{part}
          </a>
        );
      }
      if (part.startsWith('#')) {
        const tag = part.slice(1);
        return (
          <button key={i} className="mx-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#181B22] text-xs font-bold text-white hover:bg-white/5" onClick={() => window.dispatchEvent(new CustomEvent('chat:hashtag-click', { detail: tag }))}>
            #{tag}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };
  return (
    <div className="text-[15px] text-white leading-normal">
      {renderParts(visible)}
      {tooLong && (
        <button onClick={() => setExpanded((v)=>!v)} className="ml-2 text-xs font-bold text-purple hover:underline">
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
      {hasLink && (
        <div className="mt-2 p-3 rounded-lg border border-[#181B22] bg-[rgba(11,14,17,0.5)]">
          <div className="text-xs text-[#B0B0B0]">Link preview</div>
          <div className="text-[15px] font-bold break-all">{(text.match(urlRegex)||[])[0]}</div>
        </div>
      )}
    </div>
  );
};

const DiscordChatWindow = ({ className = '', selectedRoomId = 'self-intro', selectedRoomName, initialShowInfo = false, onBack, showSidebarButton = false, onToggleSidebar, showChatListButton = false, onToggleChatList }: { className?: string; selectedRoomId?: string; selectedRoomName?: string; initialShowInfo?: boolean; onBack?: () => void; showSidebarButton?: boolean; onToggleSidebar?: () => void; showChatListButton?: boolean; onToggleChatList?: () => void }) => {
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [settingsSection, setSettingsSection] = useState<'engagement' | undefined>(undefined);
  const [showChangeGroup, setShowChangeGroup] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState<boolean>(initialShowInfo);
  const [composerText, setComposerText] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: number } | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
  const [pinnedMessages, setPinnedMessages] = useState<Set<number>>(new Set());
  const [starredMessages, setStarredMessages] = useState<Set<number>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessageId, setShareMessageId] = useState<number | null>(null);

  type RolePerms = { pinMessages: boolean; deleteMessages: boolean; manageMembers: boolean };
  const ROLES_STORAGE_KEY = 'community:roles:v1';
  const defaultPerms: RolePerms = { pinMessages: true, deleteMessages: false, manageMembers: false };
  const [perms, setPerms] = useState<RolePerms>(defaultPerms);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(ROLES_STORAGE_KEY);
        if (!raw) return setPerms(defaultPerms);
        const roles = JSON.parse(raw) as any[];
        const def = roles.find(r => r.isDefault) || roles[roles.length - 1];
        if (def?.permissions) {
          setPerms({
            pinMessages: !!def.permissions.pinMessages,
            deleteMessages: !!def.permissions.deleteMessages,
            manageMembers: !!def.permissions.manageMembers,
          });
        }
      } catch {}
    };
    load();
    const onSave = () => load();
    window.addEventListener('roles:save', onSave as any);
    return () => window.removeEventListener('roles:save', onSave as any);
  }, []);
  const availableReactions = ['👍','❤️','😂','🎉','🔥','👏'] as const;
  const [reactionsByMessage, setReactionsByMessage] = useState<Record<number, Record<string, number>>>({
    1: { '👍': 3, '❤️': 1, '🎉': 2 },
  });
  const [myReactions, setMyReactions] = useState<Record<number, Set<string>>>({});

  const makeMessages = (room: string): Message[] => {
    switch (room) {
      case 'rules':
        return [{ id: 1, authorId: 1, title: 'Server rules', text: 'Be kind. No spam. Follow the guidelines.', views: 10, time: '12:00', commentAvatars: [], commentCount: 0 }];
      case 'welcome':
        return [{ id: 2, authorId: 2, title: 'Welcome!', text: 'Introduce yourself and explore pinned posts.', views: 20, time: '12:05', commentAvatars: [], commentCount: 3 }];
      case 'tradingchat':
        return [{ id: 3, authorId: 3, text: 'Live market talk — what are you watching today?', views: 45, time: '12:12', commentAvatars: [], commentCount: 5 }];
      case 'suggestion':
        return [{ id: 4, authorId: 1, text: 'Feature requests and ideas go here.', views: 12, time: '12:20', commentAvatars: [], commentCount: 1 }];
      case 'dank-memer':
        return [{ id: 5, authorId: 2, text: 'Meme bot integration thread.', views: 33, time: '12:27', commentAvatars: [], commentCount: 2 }];
      default:
        return [
          {
            id: 100,
            authorId: 1,
            title: 'Q3 Roadmap',
            text:
              'Roadmap update — detailed breakdown of the next quarter. We will focus on performance (bundle size, code splitting, image optimization), collaboration (inline replies, mentions, presence), and moderation (reporting, audit logs, roles). Below are references, mocks, and examples. Your comments are welcome — especially on the media viewer and moderation flows. #Roadmap #Performance #Moderation Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            hashtags: ['Roadmap','Performance','Moderation'],
            media: [
              { type: 'image', url: 'https://api.builder.io/api/v1/image/assets/TEMP/6e6e0f768df5b86151c9aed84c448088bd82d862?width=960' },
              { type: 'image', url: 'https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=960' },
              { type: 'video', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
              { type: 'image', url: 'https://api.builder.io/api/v1/image/assets/TEMP/3b66a4f0ee429a44d23c84bd5fe81e04858ae825?width=960' },
            ],
            views: 203,
            time: '11:45',
            commentAvatars: [
              'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
              'https://api.builder.io/api/v1/image/assets/TEMP/898dca4b250140da2778a69f55231f3783831032?width=48',
            ],
            commentCount: 23,
          },
          {
            id: 1,
            authorId: 1,
            title: 'Changelog 1.2.0',
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/6a9ff670ed336d7a414768e0bcb4b9c003cad14c?width=960',
            text: 'Major update: we just shipped the new composer with inline replies and reactions. Tell us what you think! https://example.com/changelog #Release #UX',
            hashtags: ['Release','UX'],
            views: 122,
            time: '12:00',
            commentAvatars: [
              'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
              'https://api.builder.io/api/v1/image/assets/TEMP/898dca4b250140da2778a69f55231f3783831032?width=48',
              'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
            ],
            commentCount: 116,
          },
          {
            id: 2,
            authorId: 2,
            image: '',
            text: 'Quick question: is anyone seeing latency on mobile? I can help debug.',
            views: 45,
            time: '12:05',
            commentAvatars: [
              'https://api.builder.io/api/v1/image/assets/TEMP/898dca4b250140da2778a69f55231f3783831032?width=48',
              'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
            ],
            commentCount: 4,
          },
          {
            id: 3,
            authorId: 3,
            title: 'Landing sneak peek',
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/6a9ff670ed336d7a414768e0bcb4b9c003cad14c?width=960',
            text: 'Sneak peek of the new landing visuals. #Design',
            hashtags: ['Design'],
            views: 89,
            time: '12:12',
            commentAvatars: [
              'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
              'https://api.builder.io/api/v1/image/assets/TEMP/898dca4b250140da2778a69f55231f3783831032?width=48',
            ],
            commentCount: 12,
          },
          {
            id: 4,
            authorId: 1,
            image: '',
            text: 'Daily stand‑up notes: 1) audit logging, 2) access passes, 3) chat layout polish. Blockers: none.',
            views: 33,
            time: '12:20',
            commentAvatars: [
              'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
            ],
            commentCount: 2,
          },
          {
            id: 5,
            authorId: 2,
            image: '',
            text: 'Long read: Performance checklist for the next release — memoization, bundle analysis, image optimization, network waterfalls, prefetch strategies, and INP reduction. If you spot gaps add comments below.',
            views: 71,
            time: '12:27',
            commentAvatars: [
              'https://api.builder.io/api/v1/image/assets/TEMP/898dca4b250140da2778a69f55231f3783831032?width=48',
            ],
            commentCount: 9,
          },
          {
            id: 6,
            authorId: 3,
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/6a9ff670ed336d7a414768e0bcb4b9c003cad14c?width=960',
            text: 'Design inspiration of the day — gradients and glass.',
            views: 54,
            time: '12:35',
            commentAvatars: [
              'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
            ],
            commentCount: 3,
          },
          {
            id: 7,
            authorId: 2,
            image: '',
            text: 'Tip: Use CMD/CTRL + K to jump between rooms fast.',
            views: 18,
            time: '12:41',
            commentAvatars: [],
            commentCount: 0,
          },
          {
            id: 8,
            authorId: 1,
            image: '',
            text: 'Reminder: security review tomorrow 10:00.',
            views: 22,
            time: '12:50',
            commentAvatars: [],
            commentCount: 1,
          },
          {
            id: 9,
            authorId: 3,
            image: 'https://api.builder.io/api/v1/image/assets/TEMP/6a9ff670ed336d7a414768e0bcb4b9c003cad14c?width=960',
            text: 'Prototype video frame — feedback welcome.',
            views: 64,
            time: '13:00',
            commentAvatars: [
              'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
            ],
            commentCount: 7,
          },
          {
            id: 10,
            authorId: 2,
            image: '',
            text: 'RFC: rename “self-intro” to “introductions”. Reactions decide.',
            views: 40,
            time: '13:05',
            commentAvatars: [],
            commentCount: 5,
          },
        ];
    }
  };

  const [messages, setMessages] = useState<Message[]>(makeMessages(selectedRoomId));

  const [paidSettings, setPaidSettings] = useState<PaidSettings>({ enabled: false, passes: [], defaultPassId: null, gatedRooms: [] as string[] });
  const [openThreads, setOpenThreads] = useState<Set<number>>(new Set());
  const [commentsByMessage, setCommentsByMessage] = useState<Record<number, InlineComment[]>>({
    1: [
      {
        id: 'c1',
        author: 'Alice',
        avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
        text: 'Love this update! The idea is brilliant.',
        time: '12:58',
        replies: [
          {
            id: 'c1-1',
            author: 'Bob',
            avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/898dca4b250140da2778a69f55231f3783831032?width=48',
            text: 'Agreed, adding examples would be great.',
            time: '13:01',
          },
        ],
      },
    ],
  });
  const [hasAccess, setHasAccess] = useState<boolean>(() => localStorage.getItem(`paid_access_granted_v1:${selectedRoomId}`) === 'true');
  const isRoomGated = paidSettings.enabled && (paidSettings.gatedRooms ?? []).includes(selectedRoomId) && !hasAccess;

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(PAID_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const normalized: PaidSettings = {
            enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : false,
            passes: Array.isArray(parsed.passes) ? parsed.passes : [],
            defaultPassId: parsed.defaultPassId ?? null,
            gatedRooms: Array.isArray(parsed.gatedRooms) ? parsed.gatedRooms : [],
          };
          setPaidSettings(normalized);
        } else {
          setPaidSettings({ enabled: false, passes: [], defaultPassId: null, gatedRooms: [] });
        }
      } catch {
        // ignore
      }
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

  useEffect(() => {
    setHasAccess(localStorage.getItem(`paid_access_granted_v1:${selectedRoomId}`) === 'true');
  }, [paidSettings, selectedRoomId]);

  const defaultPass = useMemo(() => paidSettings.passes.find(p => p.id === paidSettings.defaultPassId) || null, [paidSettings]);

  useEffect(() => {
    setMessages(makeMessages(selectedRoomId));
    if (initialShowInfo) setShowChannelInfo(true);
  }, [selectedRoomId, initialShowInfo]);

  useEffect(() => {
    setMessages(makeMessages(selectedRoomId));
  }, [selectedRoomId]);

  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const onListScroll = () => {
    const el = listRef.current; if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    setShowScrollToBottom(!nearBottom);
  };
  const scrollToBottom = () => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; };

  const handlePurchase = () => {
    // Demo purchase success
    localStorage.setItem(`paid_access_granted_v1:${selectedRoomId}`, 'true');
    setHasAccess(true);
  };

  const sendMessage = () => {
    if (isRoomGated) return; // gated for this room
    const value = composerText.trim();
    if (!value) return;
    const newMsg: Message = {
      id: Date.now(),
      authorId: 0,
      image: '',
      text: value,
      views: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commentAvatars: [],
      commentCount: 0,
    };
    setMessages((prev) => [...prev, newMsg]);
    setComposerText('');
    requestAnimationFrame(scrollToBottom);
  };

  const handleContextMenu = (e: React.MouseEvent, messageId: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageId });
  };

  const handleShare = () => {
    if (!contextMenu) return;
    setShareMessageId(contextMenu.messageId);
    setShowShareModal(true);
    setContextMenu(null);
  };

  const handleSelect = () => {
    if (!contextMenu) return;
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(contextMenu.messageId)) {
        next.delete(contextMenu.messageId);
      } else {
        next.add(contextMenu.messageId);
      }
      return next;
    });
  };

  const handlePin = () => {
    if (!contextMenu) return;
    setPinnedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(contextMenu.messageId)) {
        next.delete(contextMenu.messageId);
      } else {
        next.add(contextMenu.messageId);
      }
      return next;
    });
  };

  const handleStar = () => {
    if (!contextMenu) return;
    setStarredMessages((prev) => {
      const next = new Set(prev);
      if (next.has(contextMenu.messageId)) {
        next.delete(contextMenu.messageId);
      } else {
        next.add(contextMenu.messageId);
      }
      return next;
    });
  };

  const handleDelete = () => {
    if (!contextMenu) return;
    setMessages((prev) => prev.filter((msg) => msg.id !== contextMenu.messageId));
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      next.delete(contextMenu.messageId);
      return next;
    });
    setPinnedMessages((prev) => {
      const next = new Set(prev);
      next.delete(contextMenu.messageId);
      return next;
    });
    setStarredMessages((prev) => {
      const next = new Set(prev);
      next.delete(contextMenu.messageId);
      return next;
    });
  };

  const toggleReaction = (messageId: number, emoji: string) => {
    setReactionsByMessage((prev) => {
      const current = { ...(prev[messageId] || {}) } as Record<string, number>;
      const mine = new Set(myReactions[messageId] || []);
      if (mine.has(emoji)) {
        current[emoji] = Math.max(0, (current[emoji] || 1) - 1);
      } else {
        current[emoji] = (current[emoji] || 0) + 1;
      }
      // cleanup zeros
      Object.keys(current).forEach((k) => { if (current[k] === 0) delete current[k]; });
      return { ...prev, [messageId]: current };
    });
    setMyReactions((prev) => {
      const mine = new Set(prev[messageId] || []);
      if (mine.has(emoji)) mine.delete(emoji); else mine.add(emoji);
      return { ...prev, [messageId]: mine };
    });
  };

  return (
    <div className={`flex flex-col flex-1 min-w-0 border-b border-[#181B22] custom-bg-blur min-h-screen overflow-x-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-[76px] px-4 py-4 border-b border-[#181B22] bg-transparent">
        <div className="flex items-center gap-4">
          {showChatListButton && onToggleChatList && (
            <button 
              onClick={onToggleChatList} 
              className="group relative text-[#B0B0B0] hover:text-purple hover:bg-purple/10 p-2 rounded-lg transition-all hover:scale-110" 
              title="Show all chats"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="4" rx="1" fill="currentColor" opacity="0.3"/>
                <rect x="2" y="10" width="20" height="4" rx="1" fill="currentColor" opacity="0.5"/>
                <rect x="2" y="16" width="20" height="4" rx="1" fill="currentColor" opacity="0.7"/>
                <circle cx="19" cy="6" r="2" fill="currentColor" className="text-purple"/>
                <circle cx="19" cy="12" r="2" fill="currentColor" className="text-purple"/>
                <circle cx="19" cy="18" r="2" fill="currentColor" className="text-purple"/>
              </svg>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/90 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                All Chats
              </span>
            </button>
          )}
          {showSidebarButton && onToggleSidebar && (
            <button 
              onClick={onToggleSidebar} 
              className="group relative text-[#B0B0B0] hover:text-purple hover:bg-purple/10 p-2 rounded-lg transition-all hover:scale-110" 
              title="Toggle sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="4" rx="1" fill="currentColor" opacity="0.3"/>
                <rect x="2" y="10" width="20" height="4" rx="1" fill="currentColor" opacity="0.5"/>
                <rect x="2" y="16" width="20" height="4" rx="1" fill="currentColor" opacity="0.7"/>
                <circle cx="19" cy="6" r="2" fill="currentColor" className="text-purple"/>
                <circle cx="19" cy="12" r="2" fill="currentColor" className="text-purple"/>
                <circle cx="19" cy="18" r="2" fill="currentColor" className="text-purple"/>
              </svg>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/90 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Toggle Sidebar
              </span>
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[15px] font-bold text-white">Back to all chats</span>
            </button>
          )}
          <button
            onClick={() => setShowChannelInfo(true)}
            className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-l from-purple to-darkPurple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 9V15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 9H6C5.06812 9 4.60218 9 4.23463 9.15224C3.74458 9.35523 3.35523 9.74458 3.15224 10.2346C3 10.6022 3 11.0681 3 12C3 12.9319 3 13.3978 3.15224 13.7654C3.35523 14.2554 3.74458 14.6448 4.23463 14.8478C4.60218 15 5.06812 15 6 15H7L15.0796 17.4239C16.0291 17.7087 16.5039 17.8512 16.9257 18.1014L16.9459 18.1135C17.3663 18.3663 17.7167 18.7167 18.4177 19.4177L18.5858 19.5858C18.7051 19.7051 18.7647 19.7647 18.831 19.8123C18.9561 19.9021 19.1003 19.9619 19.2523 19.9868C19.3327 20 19.4171 20 19.5858 20C19.9713 20 20.1641 20 20.3196 19.9475C20.6155 19.8477 20.8477 19.6155 20.9475 19.3196C21 19.1641 21 18.9713 21 18.5858V5.41421C21 5.02866 21 4.83589 20.9475 4.68039C20.8477 4.38452 20.6155 4.15225 20.3196 4.05245C20.1641 4 19.9713 4 19.5858 4C19.4171 4 19.3327 4 19.2523 4.0132C19.1003 4.03815 18.9561 4.09787 18.831 4.18771C18.7647 4.23526 18.7051 4.29491 18.5858 4.41421L18.4177 4.5823C17.7167 5.28326 17.3663 5.63374 16.9459 5.88649L16.9257 5.89856C16.5039 6.14884 16.0291 6.29126 15.0796 6.57611L7 9Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 15.5V18.0458C8 19.1251 8.87491 20 9.95416 20C10.6075 20 11.2177 19.6735 11.5801 19.1298L13 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-bold text-white">{selectedRoomName || selectedRoomId}</span>
              {(paidSettings.enabled && (paidSettings.gatedRooms ?? []).includes(selectedRoomId)) && (
                <span className="text-[11px] font-bold text-purple inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Paid
                </span>
              )}
              <span className="text-xs font-bold text-[#B0B0B0]">4 members, 2 online</span>
            </div>
          </button>
        </div>

        <div className="flex items-center">
          <button className="flex items-center justify-center w-11 h-11 text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setShowServerSettings(true)}>
            <Settings className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center w-11 h-11 text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setShowChangeGroup(true)}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} onScroll={onListScroll} className="flex-1 flex flex-col px-4 pt-4 pb-6 gap-3 overflow-y-auto overflow-x-hidden scrollbar">
        {/* Optional Paywall Banner */}
        {isRoomGated && (
          <div className="flex justify-center">
            <div className="w-full max-w-[536px] p-4 rounded-2xl border border-[#181B22] bg-[#0C1014]/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-l from-purple to-darkPurple flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-[15px] mb-1">This chat requires access</div>
                  <div className="text-[#B0B0B0] text-sm">Purchase an access pass to post and view members-only content.</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={handlePurchase} className="h-10 px-4 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold">
                  {defaultPass ? `Get access — $${defaultPass.priceUsd}/${defaultPass.periodDays}d` : 'Get access'}
                </button>
                <button onClick={() => { setSettingsSection('engagement'); setShowServerSettings(true); }} className="h-10 px-4 rounded-full border border-[#181B22] text-[#B0B0B0] font-bold">Learn more</button>
              </div>
            </div>
          </div>
        )}

        {/* Date Divider */}
        <div className="sticky top-0 z-10 flex justify-center">
          <div className="flex items-center justify-center px-3 py-1 rounded-full border border-[#181B22] custom-bg-blur">
            <span className="text-[15px] font-bold text-white">Today</span>
          </div>
        </div>

        {/* Message Cards */}
        {messages.map((message, idx) => { const author = USERS.find(u => u.id === message.authorId) || USERS[1];
          const isSelected = selectedMessages.has(message.id);
          const isPinned = pinnedMessages.has(message.id);
          const isStarred = starredMessages.has(message.id);

          return (
            <div key={message.id} className="relative flex w-full max-w-full flex-col">
              <div
                onContextMenu={(e) => handleContextMenu(e, message.id)}
                className={cn(
                  'group relative flex w-full flex-col gap-3 px-4 py-3 rounded-3xl border transition-all cursor-pointer',
                  isSelected
                    ? 'border-purple bg-gradient-to-br from-regaliaPurple/40 via-purple/20 to-regaliaPurple/30 shadow-lg shadow-purple/20'
                    : 'border-[#181B22]/50 bg-gradient-to-br from-[#0E1015] via-[#0A0C10] to-[#06080B] hover:from-[#14161C] hover:via-[#0F1115] hover:to-[#0A0C10] hover:border-[#2A2D35] hover:shadow-lg hover:shadow-black/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-[15px] font-bold text-white">{author.name}</span>
                    <span className="text-xs font-bold text-[#B0B0B0]">{message.time}</span>
                  </div>
                </div>
                {message.title && (
                  <h3 className="mt-1 text-white font-bold text-[17px] leading-tight">{message.title}</h3>
                )}
                {/* Indicators */}
                {(isPinned || isStarred) && (
                  <div className="flex items-center gap-2 mb-1">
                    {isPinned && (
                      <div className="flex items-center gap-1 text-purple">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 21L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13.2585 18.8714C9.51516 18.0215 5.97844 14.4848 5.12853 10.7415C4.99399 10.1489 4.92672 9.85266 5.12161 9.37197C5.3165 8.89129 5.55457 8.74255 6.03071 8.44509C7.10705 7.77265 8.27254 7.55888 9.48209 7.66586C11.1793 7.81598 12.0279 7.89104 12.4512 7.67048C12.8746 7.44991 13.1622 6.93417 13.7376 5.90269L14.4664 4.59604C14.9465 3.73528 15.1866 3.3049 15.7513 3.10202C16.316 2.89913 16.6558 3.02199 17.3355 3.26771C18.9249 3.84236 20.1576 5.07505 20.7323 6.66449C20.978 7.34417 21.1009 7.68401 20.898 8.2487C20.6951 8.8134 20.2647 9.05346 19.4039 9.53358L18.0672 10.2792C17.0376 10.8534 16.5229 11.1406 16.3024 11.568C16.0819 11.9955 16.162 12.8256 16.3221 14.4859C16.4399 15.7068 16.2369 16.88 15.5555 17.9697C15.2577 18.4458 15.1088 18.6839 14.6283 18.8786C14.1477 19.0733 13.8513 19.006 13.2585 18.8714Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-xs font-bold">Pinned</span>
                      </div>
                    )}
                    {isStarred && (
                      <div className="flex items-center gap-1 text-orange">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" fill="currentColor"/>
                        </svg>
                        <span className="text-xs font-bold">Starred</span>
                      </div>
                    )}
                  </div>
                )}
              <MessageBody text={message.text} />

              {(() => { const mediaItems = (message.media && message.media.length ? message.media : (message.image ? [{ type: 'image', url: message.image }] as MediaItem[] : []));
                if (mediaItems.length === 0) return null;
                if (mediaItems.length === 1) {
                  const m = mediaItems[0];
                  return m.type === 'video' ? (
                    <video src={m.url} controls className="w-full aspect-video rounded-lg object-cover" />
                  ) : (
                    <img src={m.url} alt="" className="w-full aspect-video rounded-lg object-cover" />
                  );
                }
                const extra = mediaItems.length - 4;
                return (
                  <div className="grid grid-cols-2 gap-1">
                    {mediaItems.slice(0,4).map((m, i) => {
                      const tile = m.type === 'video' ? (
                        <video src={m.url} controls className="w-full aspect-video object-cover" />
                      ) : (
                        <img src={m.url} alt="" className="w-full aspect-video object-cover" />
                      );
                      return (
                        <div key={i} className="relative overflow-hidden rounded-lg">
                          {tile}
                          {extra > 0 && i === 3 && (
                            <div className="absolute inset-0 bg-black/50 text-white text-lg font-bold grid place-items-center">+{extra}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {(message.hashtags && message.hashtags.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from(new Set(message.hashtags)).map((tag) => (
                    <button key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#181B22] text-xs font-bold text-white hover:bg-white/5" onClick={() => window.dispatchEvent(new CustomEvent('chat:hashtag-click', { detail: tag }))}>
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-8 h-8 grid place-items-center text-[#B0B0B0] hover:text-white" onClick={() => setOpenThreads((prev) => { const n=new Set(prev); n.add(message.id); return n; })} title="Reply"><Reply className="w-4 h-4"/></button>
                <button className="w-8 h-8 grid place-items-center text-[#B0B0B0] hover:text-white" onClick={() => navigator.clipboard.writeText(message.text)} title="Copy"><Copy className="w-4 h-4"/></button>
                <button 
                  className="w-8 h-8 grid place-items-center text-purple" 
                  onClick={() => {
                    setPinnedMessages((prev) => {
                      const next = new Set(prev);
                      if (next.has(message.id)) {
                        next.delete(message.id);
                      } else {
                        next.add(message.id);
                      }
                      return next;
                    });
                  }} 
                  title="Pin"
                >
                  <Pin className="w-4 h-4"/>
                </button>
                <button 
                  className="w-8 h-8 grid place-items-center text-orange" 
                  onClick={() => {
                    setStarredMessages((prev) => {
                      const next = new Set(prev);
                      if (next.has(message.id)) {
                        next.delete(message.id);
                      } else {
                        next.add(message.id);
                      }
                      return next;
                    });
                  }} 
                  title="Star"
                >
                  <Star className="w-4 h-4"/>
                </button>
                <button className="w-8 h-8 grid place-items-center text-[#B0B0B0] hover:text-white" onClick={() => { setShareMessageId(message.id); setShowShareModal(true); }} title="Share"><Share2 className="w-4 h-4"/></button>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-end gap-2">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-[#B0B0B0]" />
                    <span className="text-xs font-bold text-[#B0B0B0]">{message.views}</span>
                  </div>
                  <span className="text-xs font-bold text-[#B0B0B0]">{message.time}</span>
                </div>

                <div className="h-px bg-[#181B22]" />

                {/* Reactions */}
                <div className="flex items-center flex-wrap gap-2 pt-2">
                  {availableReactions.map((emoji) => {
                    const count = (reactionsByMessage[message.id] || {})[emoji] || 0;
                    const active = (myReactions[message.id]?.has(emoji)) || false;
                    return (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(message.id, emoji)}
                        aria-pressed={active}
                        className={cn(
                          'h-7 px-2 inline-flex items-center gap-1 rounded-full border text-xs font-bold transition-colors',
                          active
                            ? 'bg-gradient-to-l from-purple to-darkPurple text-white border-transparent'
                            : 'border-[#181B22] text-white/80 hover:bg-white/5'
                        )}
                      >
                        <span className="text-base leading-none">{emoji}</span>
                        <span>{count}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  className="flex items-center justify-between group px-2 py-2 rounded-xl hover:bg-white/5 transition-colors"
                  onClick={() => setOpenThreads((prev) => { const next = new Set(prev); next.has(message.id) ? next.delete(message.id) : next.add(message.id); return next; })}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-start -space-x-0.5">
                      {message.commentAvatars.map((avatar, idx) => (
                        <img
                          key={idx}
                          src={avatar}
                          alt=""
                          className="w-6 h-6 rounded-full border-2 border-[rgba(11,14,17,0.5)]"
                        />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#181B22] bg-gradient-to-r from-[#523A83]/25 to-transparent text-white text-xs font-bold">
                      {message.commentCount} comments
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-l from-purple to-darkPurple grid place-items-center text-white group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
                {openThreads.has(message.id) && (
                  <InlineComments
                    comments={commentsByMessage[message.id] || []}
                    onAddComment={(text, parentId) => {
                      setCommentsByMessage((prev) => {
                        const list = prev[message.id] ? [...prev[message.id]] : [];
                        const newComment: InlineComment = {
                          id: `c-${Date.now()}`,
                          author: 'You',
                          avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/6a9ff670ed336d7a414768e0bcb4b9c003cad14c?width=48',
                          text,
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        };
                        if (!parentId) {
                          list.push(newComment);
                        } else {
                          const addReply = (items: InlineComment[]): boolean => {
                            for (const it of items) {
                              if (it.id === parentId) {
                                it.replies = it.replies ? [...it.replies, newComment] : [newComment];
                                return true;
                              }
                              if (it.replies && addReply(it.replies)) return true;
                            }
                            return false;
                          };
                          addReply(list);
                        }
                        return { ...prev, [message.id]: list };
                      });
                    }}
                  />
                )}
              </div>
              </div>
            </div>
          );
        })}
        {showScrollToBottom && (
          <button onClick={scrollToBottom} className="fixed bottom-24 right-6 z-10 h-10 w-10 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white grid place-items-center shadow-lg">
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Input Footer */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 backdrop-blur-xl z-10">
        <button className="flex items-center justify-center w-9 h-9 rounded-lg text-[#B0B0B0] hover:text-purple hover:bg-purple/10 transition-all hover:scale-110" disabled={isRoomGated}>
          <Plus className="w-5 h-5" />
        </button>
        <div className={cn("flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-[#181B22] hover:border-[#2A2D35] bg-gradient-to-br from-[#0C1014] to-[#181B22] relative transition-all focus-within:border-[#2A2D35]", (isRoomGated) && "opacity-60")}>
          <textarea
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder={isRoomGated ? "Buy access to message" : "Message #self-intro"}
            disabled={isRoomGated}
            className="flex-1 bg-transparent text-[15px] text-white placeholder:text-[#B0B0B0] outline-none resize-none leading-6 disabled:cursor-not-allowed"
            rows={1}
          />
        </div>
        <button className="flex items-center justify-center w-9 h-9 rounded-lg text-[#B0B0B0] hover:text-purple hover:bg-purple/10 transition-all hover:scale-110" disabled={isRoomGated}>
          <Smile className="w-5 h-5" />
        </button>
        <button onClick={sendMessage} disabled={isRoomGated} className={cn("flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple to-darkPurple text-white hover:opacity-90 hover:scale-110 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-purple/30", (isRoomGated) && "cursor-not-allowed")}>
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Server Settings Modal */}
      <ServerSettingsModal isOpen={showServerSettings} onClose={() => { setShowServerSettings(false); setSettingsSection(undefined); }} initialSection={settingsSection} />
      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onShare={handleShare}
          onSelect={handleSelect}
          onPin={perms.pinMessages ? handlePin : undefined}
          onStar={handleStar}
          onDelete={perms.deleteMessages ? handleDelete : undefined}
          canPin={perms.pinMessages}
          canDelete={perms.deleteMessages}
          isSelected={selectedMessages.has(contextMenu.messageId)}
        />
      )}
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setShareMessageId(null);
        }}
        messageId={shareMessageId || undefined}
      />
      {/* Change Group Modal */}
      <ChangeGroupModal
        isOpen={showChangeGroup}
        onClose={() => setShowChangeGroup(false)}
      />
      <ChannelInfoPanel
        isOpen={showChannelInfo}
        onClose={() => setShowChannelInfo(false)}
      />
    </div>
  );
};

export default DiscordChatWindow;
