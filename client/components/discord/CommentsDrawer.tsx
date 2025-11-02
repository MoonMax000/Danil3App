import { createPortal } from 'react-dom';
import { X, Smile, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialComments?: CommentItem[];
}

const defaultComments: CommentItem[] = [
  {
    id: 'c1',
    author: 'Alice',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/122409f97796a81aa691d57febbc22fc5da8c970?width=48',
    text: 'Love this update! The idea is brilliant.',
    time: '12:58',
  },
  {
    id: 'c2',
    author: 'Bob',
    avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/898dca4b250140da2778a69f55231f3783831032?width=48',
    text: 'Agreed! Would be great to add examples.',
    time: '12:59',
  },
];

const CommentsDrawer = ({ isOpen, onClose, title = 'Comments', initialComments = defaultComments }: CommentsDrawerProps) => {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const send = () => {
    const value = text.trim();
    if (!value) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: 'You',
        avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/6a9ff670ed336d7a414768e0bcb4b9c003cad14c?width=48',
        text: value,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setText('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="ml-auto h-full w-full max-w-[460px] bg-[rgba(12,16,20,0.50)] backdrop-blur-[50px] border-l border-[#181B22] flex flex-col rounded-l-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-[68px] border-b border-[#181B22]">
          <div className="text-white font-bold text-[15px]">{title}</div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white/5 text-white flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <img src={c.avatar} alt={c.author} className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)]">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold">{c.author}</span>
                      <span className="text-[#B0B0B0] text-[11px] font-bold">{c.time}</span>
                    </div>
                    <div className="mt-1 text-white text-[15px] leading-normal">{c.text}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-3 pb-4 pt-2 border-t border-[#181B22]">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full text-[#B0B0B0] hover:text-white flex items-center justify-center">
              <Smile className="w-6 h-6" />
            </button>
            <div className="flex-1 px-4 py-2 border border-[#181B22] rounded-full bg-[#0C1014]/40">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-transparent outline-none text-white text-[15px] min-h-[44px] max-h-[160px] resize-y"
              />
            </div>
            <button onClick={send} className="w-11 h-11 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommentsDrawer;
