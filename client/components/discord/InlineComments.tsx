import { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export type InlineComment = {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  replies?: InlineComment[];
};

interface InlineCommentsProps {
  comments: InlineComment[];
  onAddComment: (text: string, parentId?: string) => void;
}

const CommentItem = ({ comment, depth, onReply }: { comment: InlineComment; depth: number; onReply: (parentId: string, text: string) => void; }) => {
  const [replying, setReplying] = useState(false);
  const [value, setValue] = useState('');

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onReply(comment.id, v);
    setValue('');
    setReplying(false);
  };

  return (
    <div className="flex gap-3">
      {/* thread line */}
      <div className="flex flex-col items-center">
        {depth > 0 && <div className="w-[2px] flex-1 ml-3 rounded-full bg-gradient-to-b from-purple to-darkPurple/70" />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-start gap-3">
          <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <div className="relative inline-flex px-3 py-2 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.55)]/90 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(160,106,255,0.08)]">
              <div className="absolute -left-2 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-purple to-darkPurple/80" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">{comment.author}</span>
                  <span className="text-[#B0B0B0] text-[11px] font-bold">{comment.time}</span>
                </div>
                <div className="mt-1 text-white text-[15px] leading-normal">{comment.text}</div>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-3 pl-2">
              <button className="text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#181B22] text-white/80 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setReplying((v) => !v)}>
                <MessageSquare className="w-3.5 h-3.5" /> Reply
              </button>
            </div>
            {replying && (
              <div className="mt-2 flex items-center gap-2 pl-2">
                <div className="flex-1 px-3 py-2 border border-[#181B22] rounded-full bg-[#0C1014]/40 ring-0 focus-within:ring-2 focus-within:ring-purple/40 transition-shadow">
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Write a reply"
                    className="w-full bg-transparent outline-none text-white text-[14px] placeholder:text-white/40"
                  />
                </div>
                <button onClick={submit} className="w-9 h-9 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(160,106,255,0.25)]">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* children */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-6 space-y-3">
            {comment.replies.map((child) => (
              <CommentItem key={child.id} comment={child} depth={depth + 1} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InlineComments = ({ comments, onAddComment }: InlineCommentsProps) => {
  const [text, setText] = useState('');

  const addRoot = () => {
    const v = text.trim();
    if (!v) return;
    onAddComment(v);
    setText('');
  };

  const handleReply = (parentId: string, value: string) => onAddComment(value, parentId);

  return (
    <div className="mt-3 space-y-4">
      {/* composer */}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-2 border border-[#181B22] rounded-full bg-[#0C1014]/40 ring-0 focus-within:ring-2 focus-within:ring-purple/40 transition-shadow">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment"
            className="w-full bg-transparent outline-none text-white text-[15px] placeholder:text-white/40"
          />
        </div>
        <button onClick={addRoot} className="w-10 h-10 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-[0_6px_20px_rgba(160,106,255,0.28)]">
          <Send className="w-5 h-5" />
        </button>
      </div>
      {/* list */}
      <div className="space-y-4">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} depth={0} onReply={handleReply} />
        ))}
      </div>
    </div>
  );
};

export default InlineComments;
