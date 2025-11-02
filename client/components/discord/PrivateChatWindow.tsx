import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Search, MoreVertical, Smile, Send, Reply, CornerDownRight, Copy, Trash2, Star } from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: number;
  author: string;
  text: string;
  time: string;
  isMine: boolean;
  isForwarded?: boolean;
  forwardedFrom?: string;
  forwardedTime?: string;
  forwardedText?: string;
  file?: {
    name: string;
    size: string;
    thumbnail: string;
  };
  attachments?: Array<{ type: 'image' | 'video'; url: string; name: string; size: string }>;
  reply?: { author: string; text: string } | null;
  reactions?: Record<string, number>;
  myReactions?: Set<string>;
  pinned?: boolean;
  read?: boolean;
  date?: string;
}

interface PrivateChatWindowProps {
  className?: string;
  userName?: string;
  userAvatar?: string;
  lastSeen?: string;
  onBack?: () => void;
  onToggleChatList?: () => void;
  showChatListButton?: boolean;
}

const PrivateChatWindow = ({ className = '', userName = 'George Taylor', userAvatar = 'https://api.builder.io/api/v1/image/assets/TEMP/58f786ecd31eb490aea1257c73f8f210fec7fdbe?width=88', lastSeen = 'last seen recently', onBack, onToggleChatList, showChatListButton = false }: PrivateChatWindowProps) => {
  const [composerText, setComposerText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [composerFiles, setComposerFiles] = useState<{ url: string; name: string; size: string; type: 'image' | 'video' }[]>([]);
  const isInitialMount = useRef(true);
  const prevMessageCount = useRef(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageMenuPos, setMessageMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewingMedia, setViewingMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [showChatMenu, setShowChatMenu] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      author: userName,
      text: 'Hey! Check out these amazing photos I took today! 📸',
      time: '09:15',
      isMine: false,
      date: 'Yesterday',
    },
    {
      id: 2,
      author: 'Some Name (Me)',
      text: 'Wow, those look great! Send them over!',
      time: '09:16',
      isMine: true,
      read: true,
    },
    {
      id: 3,
      author: userName,
      text: 'Here\'s a high-quality JPG photo',
      time: '09:17',
      isMine: false,
      file: {
        name: 'landscape.jpg',
        size: '2.4MB',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      },
    },
    {
      id: 4,
      author: userName,
      text: 'And here\'s a PNG with transparency',
      time: '09:18',
      isMine: false,
      file: {
        name: 'abstract-art.png',
        size: '1.8MB',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
      },
    },
    {
      id: 5,
      author: 'Some Name (Me)',
      text: 'These are stunning! The quality is perfect 😍',
      time: '09:19',
      isMine: true,
      read: true,
      date: 'Today',
    },
    {
      id: 6,
      author: userName,
      text: 'Multiple photos from my collection',
      time: '09:20',
      isMine: false,
      attachments: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop', name: 'mountain.jpg', size: '1.2MB' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1682687221080-5cb261c645cb?w=800&h=600&fit=crop', name: 'sunset.jpg', size: '1.5MB' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1682687220063-4742bd7f7889?w=800&h=600&fit=crop', name: 'beach.jpg', size: '1.1MB' },
      ],
    },
    {
      id: 7,
      author: 'Some Name (Me)',
      text: 'Here\'s my camera setup photo',
      time: '09:21',
      isMine: true,
      read: true,
      file: {
        name: 'camera-setup.jpg',
        size: '3.2MB',
        thumbnail: 'https://images.unsplash.com/photo-1606244864456-8bee63fce472?w=800&h=600&fit=crop',
      },
    },
    {
      id: 8,
      author: userName,
      text: 'Nice setup! What lens are you using?',
      time: '09:22',
      isMine: false,
    },
    {
      id: 9,
      author: 'Some Name (Me)',
      text: '50mm f/1.8 - it\'s perfect for portraits',
      time: '09:23',
      isMine: true,
      read: true,
    },
    {
      id: 10,
      author: userName,
      text: 'Here are some portrait shots I took',
      time: '09:24',
      isMine: false,
      attachments: [
        { type: 'image', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop', name: 'portrait1.jpg', size: '2.1MB' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop', name: 'portrait2.jpg', size: '2.3MB' },
      ],
    },
    {
      id: 11,
      author: 'Some Name (Me)',
      text: 'Beautiful work! The bokeh is amazing',
      time: '09:25',
      isMine: true,
      read: true,
    },
    {
      id: 12,
      author: userName,
      text: 'Thanks! Let me share some cityscape shots too',
      time: '09:26',
      isMine: false,
      file: {
        name: 'city-night.jpg',
        size: '4.5MB',
        thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
      },
    },
    {
      id: 13,
      author: userName,
      text: 'This one is my favorite from the series',
      time: '09:27',
      isMine: false,
    },
    {
      id: 14,
      author: userName,
      text: 'Shot at golden hour, perfect lighting',
      time: '09:27',
      isMine: false,
    },
    {
      id: 15,
      author: userName,
      text: 'What do you think?',
      time: '09:28',
      isMine: false,
    },
    {
      id: 16,
      author: 'Some Name (Me)',
      text: 'Absolutely stunning! 😍',
      time: '09:28',
      isMine: true,
      read: true,
    },
    {
      id: 17,
      author: 'Some Name (Me)',
      text: 'The colors are incredible',
      time: '09:29',
      isMine: true,
      read: true,
    },
    {
      id: 18,
      author: 'Some Name (Me)',
      text: 'You really captured the mood perfectly',
      time: '09:29',
      isMine: true,
      read: true,
    },
    {
      id: 19,
      author: userName,
      text: 'Thank you so much! 🙏',
      time: '09:30',
      isMine: false,
    },
    {
      id: 20,
      author: userName,
      text: 'I\'ve been working on my composition skills',
      time: '09:30',
      isMine: false,
    },
    {
      id: 21,
      author: 'Some Name (Me)',
      text: 'It shows! Keep it up 👏',
      time: '09:31',
      isMine: true,
      read: true,
    },
    {
      id: 22,
      author: userName,
      text: 'Will do!',
      time: '09:32',
      isMine: false,
    },
    {
      id: 23,
      author: userName,
      text: 'By the way, are you free next weekend?',
      time: '09:32',
      isMine: false,
    },
    {
      id: 24,
      author: userName,
      text: 'Planning a photoshoot downtown',
      time: '09:33',
      isMine: false,
    },
    {
      id: 25,
      author: 'Some Name (Me)',
      text: 'Yes! Count me in',
      time: '09:33',
      isMine: true,
      read: true,
    },
    {
      id: 26,
      author: 'Some Name (Me)',
      text: 'What time were you thinking?',
      time: '09:34',
      isMine: true,
      read: true,
    },
    {
      id: 27,
      author: userName,
      text: 'Around 6 AM for sunrise',
      time: '09:34',
      isMine: false,
    },
    {
      id: 28,
      author: userName,
      text: 'Best light of the day',
      time: '09:35',
      isMine: false,
    },
    {
      id: 29,
      author: 'Some Name (Me)',
      text: 'Perfect! I\'ll set my alarm',
      time: '09:35',
      isMine: true,
      read: true,
    },
    {
      id: 30,
      author: 'Some Name (Me)',
      text: 'See you then! 📸',
      time: '09:36',
      isMine: true,
      read: false,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Don't auto-scroll on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevMessageCount.current = messages.length;
      return;
    }
    
    // Don't auto-scroll when messages are added
    prevMessageCount.current = messages.length;
  }, [messages]);

  // Back on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && onBack) onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  const onListScroll = () => {
    const el = listRef.current; if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    setShowScrollToBottom(!nearBottom);
  };

  const sendMessage = () => {
    const value = composerText.trim();
    if (!value && composerFiles.length === 0) return;
    const newMsg: Message = {
      id: Date.now(),
      author: 'Me',
      text: value,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      reply: replyTo ? { author: replyTo.author, text: replyTo.text } : null,
      reactions: {},
      myReactions: new Set(),
      attachments: composerFiles.map(f => ({ type: f.type, url: f.url, name: f.name, size: f.size })),
      read: false,
    } as Message;
    setMessages((prev) => [...prev, newMsg]);
    setComposerText('');
    setReplyTo(null);
    setComposerFiles([]);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? { ...m, read: true } : m)));
    }, 1200);
  };

  return (
    <div className={`relative flex flex-col flex-1 min-w-0 border-t border-b border-[#181B22] custom-bg-blur max-h-screen overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-[76px] px-6 backdrop-blur-[50px] bg-gradient-to-r from-purple/5 to-transparent">
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
          {onBack && (
            <button onClick={onBack} className="text-[#B0B0B0] hover:text-purple hover:bg-purple/10 p-2 rounded-lg transition-all hover:scale-110">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="relative p-0.5 rounded-full bg-gradient-to-br from-purple/50 to-darkPurple/50">
              <img src={userAvatar} alt={userName} className="w-12 h-12 rounded-full ring-2 ring-white/10" />
              <span className="absolute bottom-0.5 right-0.5 block w-3 h-3 rounded-full bg-green border-2 border-black shadow-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-extrabold text-white">{userName}</span>
              <span className="text-xs font-bold text-purple">{lastSeen}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!showSearch ? (
            <>
              <button 
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => document.getElementById('message-search')?.focus(), 100);
                }}
                className="flex items-center justify-center w-11 h-11 text-white hover:bg-purple/10 hover:text-purple rounded-xl transition-all hover:scale-110"
              >
                <Search className="w-5 h-5" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowChatMenu(!showChatMenu)}
                  className="flex items-center justify-center w-11 h-11 text-white hover:bg-purple/10 hover:text-purple rounded-xl transition-all hover:scale-110"
                >
                  <MoreVertical className="w-5 h-5 rotate-90" />
                </button>
                {showChatMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowChatMenu(false)} />
                    <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl bg-[#1E1F22] border border-[#3A3B3F] backdrop-blur-md shadow-2xl overflow-hidden z-50">
                      <button
                        onClick={() => {
                          toast({
                            title: 'Chat deleted',
                            description: `Conversation with ${userName} has been deleted.`,
                          });
                          setShowChatMenu(false);
                          setTimeout(() => onBack?.(), 500);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-white/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">Delete Chat</span>
                          <span className="text-xs text-[#B0B0B0]">Remove this conversation</span>
                        </div>
                      </button>
                      <div className="h-px bg-[#3A3B3F] mx-2" />
                      <button
                        onClick={() => {
                          toast({
                            title: 'Report submitted',
                            description: `Your report about ${userName} has been sent to administrators.`,
                          });
                          setShowChatMenu(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-white/5 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-400">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">Report to Admin</span>
                          <span className="text-xs text-[#B0B0B0]">Report inappropriate content</span>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple/40 bg-[#0C1014]/50">
                <Search className="w-4 h-4 text-[#B0B0B0]" />
                <input
                  id="message-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    if (query.trim()) {
                      const results = messages.filter(m => 
                        m.text.toLowerCase().includes(query.toLowerCase()) ||
                        m.author.toLowerCase().includes(query.toLowerCase())
                      );
                      setSearchResults(results);
                      setCurrentSearchIndex(0);
                      if (results.length > 0) {
                        setTimeout(() => {
                          const element = document.getElementById(`message-${results[0].id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }
                    } else {
                      setSearchResults([]);
                      setCurrentSearchIndex(0);
                    }
                  }}
                  placeholder="Search messages..."
                  className="bg-transparent text-sm text-white placeholder:text-[#B0B0B0] outline-none w-48"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setCurrentSearchIndex(0);
                    } else if (e.key === 'Enter' && searchResults.length > 0) {
                      e.preventDefault();
                      const nextIndex = (currentSearchIndex + 1) % searchResults.length;
                      setCurrentSearchIndex(nextIndex);
                      const element = document.getElementById(`message-${searchResults[nextIndex].id}`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                />
                {searchResults.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <span>{currentSearchIndex + 1}/{searchResults.length}</span>
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => {
                          if (searchResults.length > 0) {
                            const prevIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
                            setCurrentSearchIndex(prevIndex);
                            const element = document.getElementById(`message-${searchResults[prevIndex].id}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (searchResults.length > 0) {
                            const nextIndex = (currentSearchIndex + 1) % searchResults.length;
                            setCurrentSearchIndex(nextIndex);
                            const element = document.getElementById(`message-${searchResults[nextIndex].id}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  setCurrentSearchIndex(0);
                }}
                className="flex items-center justify-center w-9 h-9 text-white hover:bg-purple/10 hover:text-purple rounded-xl transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={onListScroll}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files || []);
          files.slice(0, 8).forEach((f) => {
            const url = URL.createObjectURL(f);
            const type = f.type.startsWith('video') ? 'video' : 'image';
            setComposerFiles((prev) => [...prev, { url, name: f.name, size: `${Math.round(f.size / 1024)}KB`, type }]);
          });
        }}
        onPaste={(e) => {
          const items = e.clipboardData?.items;
          if (!items) return;
          Array.from(items).forEach((it) => {
            if (it.type.startsWith('image/')) {
              const file = it.getAsFile();
              if (file) {
                const url = URL.createObjectURL(file);
                setComposerFiles((prev) => [...prev, { url, name: file.name || 'pasted.png', size: `${Math.round(file.size / 1024)}KB`, type: 'image' }]);
              }
            }
          });
        }}
        className="relative flex-1 overflow-y-auto px-6 py-4 scrollbar min-h-0"
      >
        <div className="flex flex-col gap-2 max-w-4xl mx-auto w-full">
          {messages.map((message, idx) => {
            const prev = messages[idx - 1];
            const groupedWithPrev = !!prev && prev.isMine === message.isMine;
            const showAuthor = !message.isMine && !groupedWithPrev;
            return (
            <div key={message.id} className={groupedWithPrev ? 'mt-0.5' : 'mt-4'}>
              {/* Date separator */}
              {message.date && (
                <div className="sticky top-2 z-10 flex justify-center my-2">
                  <div className="inline-flex px-3 py-1 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.65)] backdrop-blur-sm">
                    <span className="text-[13px] font-bold text-white">{message.date}</span>
                  </div>
                </div>
              )}

              {/* Unread Messages separator */}
              {idx === 3 && (
                <div className="flex justify-center my-4">
                  <button 
                    onClick={() => {
                      const element = document.getElementById(`message-${message.id}`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="inline-flex px-3 py-1 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.65)] backdrop-blur-sm hover:bg-[rgba(18,22,26,0.8)] hover:border-[#2A2D35] transition-all"
                  >
                    <span className="text-[15px] font-bold text-[#B0B0B0]">Unread Messages</span>
                  </button>
                </div>
              )}

              {/* Message bubble */}
              <div className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  id={`message-${message.id}`}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMessageMenuPos({ x: rect.left + rect.width / 2, y: rect.top });
                    setSelectedMessage(message);
                  }}
                  className={`group relative flex flex-col max-w-[90%] sm:max-w-[480px] px-3 py-2 gap-1 cursor-pointer transition-all duration-300 
                    ${searchResults.length > 0 && searchResults[currentSearchIndex]?.id === message.id ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black scale-105 shadow-2xl shadow-yellow-400/50' : ''} 
                    ${message.isMine 
                      ? `rounded-tl-3xl ${groupedWithPrev ? 'rounded-tr-lg' : 'rounded-tr-3xl'} rounded-bl-3xl rounded-br-lg bg-gradient-to-br from-[#6B4BAB] via-[#5A3D8A] to-[#4A2F6F] hover:from-[#7555B8] hover:via-[#6444A0] hover:to-[#543888] text-white shadow-lg shadow-purple/20 hover:shadow-xl hover:shadow-purple/30 hover:scale-[1.02] transform` 
                      : `${groupedWithPrev ? 'rounded-tl-lg' : 'rounded-tl-3xl'} rounded-tr-3xl rounded-bl-lg rounded-br-3xl bg-gradient-to-br from-[#16181E] via-[#12141A] to-[#0E1015] hover:from-[#1C1E24] hover:via-[#18191F] hover:to-[#13151A] text-white shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:scale-[1.02] transform border border-[#2A2D35]/30 hover:border-[#3A3D45]/50`
                    }`}
                >
                  {/* Author (only for non-grouped messages) */}
                  {showAuthor && (
                    <div className="text-[13px] font-semibold text-purple mb-0.5">{message.author}</div>
                  )}

                  {copiedId === message.id && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-black/60 border border-[#181B22] rounded-full px-2 py-0.5">Copied</span>
                  )}

                  {/* Reply preview */}
                  {message.reply && (
                    <div 
                      className={`flex gap-2 p-2 rounded-lg cursor-pointer hover:bg-white/15 transition-colors ${message.isMine ? 'bg-white/10' : 'bg-white/5'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const replyToMsg = messages.find(m => m.text === message.reply?.text && m.author === message.reply?.author);
                        if (replyToMsg) {
                          const element = document.getElementById(`message-${replyToMsg.id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          // Add highlight effect
                          element?.classList.add('ring-2', 'ring-purple', 'ring-offset-2', 'ring-offset-black');
                          setTimeout(() => {
                            element?.classList.remove('ring-2', 'ring-purple', 'ring-offset-2', 'ring-offset-black');
                          }, 2000);
                        }
                      }}
                    >
                      <div className="w-0.5 bg-purple rounded-full" />
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <span className="text-[13px] font-bold text-purple">{message.reply.author}</span>
                        <span className="text-[13px] text-[#B0B0B0] line-clamp-2 break-words">{message.reply.text}</span>
                      </div>
                      <svg className="w-4 h-4 text-purple flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}

                  {/* Forwarded message */}
                  {message.isForwarded && (
                    <>
                      <span className="text-[15px] text-[#B0B0B0]">Forwarded messages</span>
                      <div className="flex gap-2">
                        <div className="w-0.5 rounded-full bg-purple" />
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold text-purple">{message.forwardedFrom}</span>
                            <span className="text-xs font-bold text-[#B0B0B0]">{message.forwardedTime}</span>
                          </div>
                          <p className="text-[15px] text-white">{message.forwardedText}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Message text */}
                  {message.text && (
                    <div className="flex items-end gap-1.5">
                      <p className="text-[15px] leading-[1.4] text-white break-words break-all flex-1 overflow-wrap-anywhere">{message.text}</p>
                      <div className="flex items-center gap-1 text-[11px] text-white/60 whitespace-nowrap">
                        <span>{message.time}</span>
                        {message.read && message.isMine && (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M11.8286 3.62312C12.0367 3.80458 12.0583 4.12043 11.8769 4.32857L7.62689 9.20357C7.44542 9.41172 7.12958 9.43336 6.92143 9.25189C6.71328 9.07043 6.69165 8.75459 6.87311 8.54644L11.1231 3.67144C11.3046 3.46329 11.6204 3.44166 11.8286 3.62312ZM14.8293 3.62372C15.0371 3.80556 15.0581 4.12144 14.8763 4.32926L7.87629 12.3293C7.78516 12.4334 7.65495 12.4951 7.51664 12.4997C7.37833 12.5043 7.2443 12.4514 7.14645 12.3536L4.14645 9.35356C3.95118 9.1583 3.95118 8.84172 4.14645 8.64645C4.34171 8.45119 4.65829 8.45119 4.85355 8.64645L7.47565 11.2685L14.1237 3.67075C14.3056 3.46294 14.6214 3.44188 14.8293 3.62372ZM1.14645 8.64645C1.34171 8.45119 1.65829 8.45119 1.85355 8.64645L4.85355 11.6465C5.04882 11.8417 5.04882 12.1583 4.85355 12.3536C4.65829 12.5488 4.34171 12.5488 4.14645 12.3536L1.14645 9.35356C0.951184 9.1583 0.951184 8.84172 1.14645 8.64645Z" fill="currentColor" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* File attachment */}
                  {message.file && (
                    <div 
                      className="flex items-center gap-3 mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingMedia({ url: message.file!.thumbnail, type: 'image' });
                      }}
                    >
                      <img src={message.file.thumbnail} alt="" className="w-20 h-20 rounded object-cover" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-bold text-white">{message.file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{message.file.size}</span>
                          <span className="text-[15px] text-white">•</span>
                          <span className="text-[15px] font-bold text-purple opacity-80">Click to view</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {message.attachments.map((att, i) => (
                        <div 
                          key={i} 
                          className="relative cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingMedia({ url: att.url, type: att.type });
                          }}
                        >
                          {att.type === 'image' ? (
                            <img src={att.url} alt={att.name || ''} className="w-full h-40 rounded object-cover" />
                          ) : (
                            <video src={att.url} className="w-full h-40 rounded object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show reactions if any */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {Object.entries(message.reactions).map(([emoji, count]) => (
                        <div key={emoji} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/10 text-xs">
                          <span>{emoji}</span>
                          <span className="text-white/60">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 backdrop-blur-xl z-10">
        <label className="flex items-center justify-center w-9 h-9 rounded-lg text-[#B0B0B0] hover:text-purple hover:bg-purple/10 transition-all hover:scale-110 cursor-pointer">
          <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e)=>{
            const files = Array.from(e.target.files || []);
            files.slice(0,8).forEach(f=>{
              const url = URL.createObjectURL(f);
              const type = f.type.startsWith('video') ? 'video' : 'image';
              setComposerFiles(prev=>[...prev,{url,name:f.name,size:`${Math.round(f.size/1024)}KB`,type}]);
            });
            e.currentTarget.value = '';
          }} />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V16M16 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </label>
        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-[#181B22] hover:border-[#2A2D35] bg-gradient-to-br from-[#0C1014] to-[#181B22] relative transition-all focus-within:border-[#2A2D35]">
          {/* Reply chip */}
          {replyTo && (
            <div className="absolute -top-8 left-0 right-0 mx-4 mb-1 flex items-center gap-2 px-3 h-7 rounded-full bg-black/40 border border-[#181B22] text-xs">
              <span className="text-purple font-bold">Replying to {replyTo.author}:</span>
              <span className="truncate text-[#B0B0B0] flex-1">{replyTo.text}</span>
              <button onClick={() => setReplyTo(null)} className="text-[#B0B0B0] hover:text-white">×</button>
            </div>
          )}

          {/* Attachments preview */}
          {composerFiles.length > 0 && (
            <div className="absolute -top-28 left-0 right-0 mx-4 grid grid-cols-4 gap-2">
              {composerFiles.map((f, i) => (
                <div key={i} className="relative">
                  {f.type === 'image' ? (
                    <img src={f.url} alt="" className="w-16 h-16 rounded object-cover" />
                  ) : (
                    <video src={f.url} className="w-16 h-16 rounded object-cover" muted loop />
                  )}
                  <button onClick={() => setComposerFiles(prev => prev.filter((_,idx)=>idx!==i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs">×</button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={composerText}
            onChange={(e) => {
              setComposerText(e.target.value);
              const el = textareaRef.current; if (el) { el.style.height = '0px'; el.style.height = Math.min(140, el.scrollHeight) + 'px'; }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message"
            className="flex-1 bg-transparent text-[15px] text-white placeholder:text-[#B0B0B0] outline-none resize-none leading-6"
            aria-label="Message"
          />
        </div>
        <div className="relative">
          <button className="flex items-center justify-center w-9 h-9 rounded-lg text-[#B0B0B0] hover:text-purple hover:bg-purple/10 transition-all hover:scale-110" onClick={() => setShowEmojiPicker(v=>!v)}>
            <Smile className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowEmojiPicker(false)} />
              <div className="absolute bottom-12 right-0 z-[70] grid grid-cols-6 gap-2 p-3 rounded-2xl border-2 border-purple/30 bg-gradient-to-br from-[#0C1014] to-[#181B22] backdrop-blur-md shadow-2xl shadow-purple/30">
                {['😀','😅','😂','😊','😍','😎','🤔','🙌','👍','🔥','🎉','👏','❤️','🤝','💡','💬'].map(e => (
                  <button key={e} className="w-10 h-10 text-xl hover:bg-purple/20 hover:scale-110 rounded-lg transition-all" onClick={() => { setComposerText(t => t + e); setShowEmojiPicker(false); }}>{e}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <button
          onClick={sendMessage}
          disabled={!composerText.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple to-darkPurple text-white hover:opacity-90 hover:scale-110 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-purple/30"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {showScrollToBottom && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (listRef.current) {
              listRef.current.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: 'smooth'
              });
            }
            setShowScrollToBottom(false);
          }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-2 px-3 h-9 rounded-full bg-black/80 backdrop-blur-sm text-white border border-[#181B22] hover:bg-black/90 hover:scale-105 transition-all shadow-lg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-xs font-bold">New messages</span>
        </button>
      )}
      {messages.length > 0 && messages[messages.length-1].isMine && messages[messages.length-1].read && (
        <div className="px-6 pb-2 text-right text-xs text-[#B0B0B0]">Seen</div>
      )}

      {/* Message Action Menu */}
      {selectedMessage && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedMessage(null)} />
          <div 
            className="fixed z-50 flex flex-col"
            style={{
              left: `${messageMenuPos.x}px`,
              top: `${messageMenuPos.y - 120}px`,
              transform: 'translateX(-50%)'
            }}
          >
            {/* Quick Emoji Reactions */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#1E1F22] border border-[#3A3B3F] backdrop-blur-md shadow-2xl mb-1">
              {['🔥','👍','🤝','😂','😎','❤️','🎉'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessages(prev => prev.map(m => {
                      if (m.id !== selectedMessage.id) return m;
                      const reactions = { ...(m.reactions || {}) };
                      reactions[emoji] = (reactions[emoji] || 0) + 1;
                      return { ...m, reactions };
                    }));
                    setSelectedMessage(null);
                  }}
                  className="text-base hover:scale-110 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Action Menu */}
            <div className="flex flex-col min-w-[140px] rounded-2xl bg-[#1E1F22] border border-[#3A3B3F] backdrop-blur-md shadow-2xl overflow-hidden">
              <button
                onClick={() => {
                  setReplyTo(selectedMessage);
                  setSelectedMessage(null);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-white hover:bg-white/5 transition-colors"
              >
                <Reply className="w-3.5 h-3.5 text-[#B0B0B0]" />
                <span className="text-xs font-medium">Reply</span>
              </button>
              
              {selectedMessage.text && (
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selectedMessage.text || '');
                      toast({ title: 'Copied to clipboard' });
                    } catch {}
                    setSelectedMessage(null);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-white hover:bg-white/5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#B0B0B0]" />
                  <span className="text-xs font-medium">Copy Text</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMessages(prev => prev.map(m => 
                    m.id === selectedMessage.id ? { ...m, pinned: !m.pinned } : m
                  ));
                  setSelectedMessage(null);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-white hover:bg-white/5 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-[#B0B0B0]" />
                <span className="text-xs font-medium">Pin</span>
              </button>

              <button
                onClick={() => {
                  setSelectedMessage(null);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-white hover:bg-white/5 transition-colors"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-[#B0B0B0]" />
                <span className="text-xs font-medium">Forward</span>
              </button>

              <button
                onClick={() => {
                  setSelectedMessage(null);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-white hover:bg-white/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#B0B0B0]">
                  <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="5" r="1" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="19" r="1" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="text-xs font-medium">Select</span>
              </button>

              <div className="h-px bg-[#3A3B3F] mx-2" />

              <button
                onClick={() => {
                  const removed = selectedMessage;
                  setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
                  toast({
                    title: 'Message deleted',
                    action: (
                      <ToastAction
                        altText="Undo"
                        onClick={() => setMessages(prev => [...prev, removed].sort((a,b) => a.id - b.id))}
                      >
                        Undo
                      </ToastAction>
                    )
                  });
                  setSelectedMessage(null);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Delete</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Media Viewer Modal */}
      {viewingMedia && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => setViewingMedia(null)}
        >
          {/* Header with controls */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple animate-pulse" />
              <span className="text-sm font-medium text-white">
                {viewingMedia.type === 'image' ? 'Image Preview' : 'Video Preview'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement('a');
                  link.href = viewingMedia.url;
                  link.download = 'media';
                  link.click();
                }}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Download"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3v13m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => setViewingMedia(null)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Close (ESC)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Media container - full screen */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ padding: '80px 40px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {viewingMedia.type === 'image' ? (
              <img 
                src={viewingMedia.url} 
                alt="Full size" 
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  minWidth: '600px',
                  minHeight: '400px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <video 
                src={viewingMedia.url} 
                controls 
                autoPlay
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  minWidth: '600px',
                  minHeight: '400px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>

          {/* Hint text */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <span className="text-sm text-white">Press ESC or click outside to close</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateChatWindow;
