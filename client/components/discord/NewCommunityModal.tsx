import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export interface NewCommunityData {
  name: string;
  iconUrl: string;
  description: string;
}

const DEFAULT_ICON = 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128';

export default function NewCommunityModal({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (data: NewCommunityData) => void }) {
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState(DEFAULT_ICON);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setIconUrl(DEFAULT_ICON);
      setDescription('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const create = () => {
    const trimmed = name.trim() || `Community ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const icon = (iconUrl || '').trim() || DEFAULT_ICON;
    onCreate({ name: trimmed, iconUrl: icon, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col w-[520px] max-h-[90vh] pt-12 px-4 pb-4 gap-6 rounded-3xl border border-[#181B22] custom-bg-blur overflow-y-auto scrollbar">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-l from-purple to-darkPurple flex items-center justify-center">
              <img src={iconUrl || DEFAULT_ICON} alt="Community" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 grid grid-cols-1 gap-2">
              <input
                value={iconUrl}
                onChange={(e)=>setIconUrl(e.target.value)}
                placeholder="Icon image URL"
                className="w-full text-[15px] text-white bg-transparent outline-none border border-[#181B22] rounded-lg px-3 py-2"
              />
              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); create(); } }}
                placeholder="Community name"
                className="w-full text-[15px] text-white bg-transparent outline-none border border-[#181B22] rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <textarea
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            placeholder="Description"
            rows={4}
            className="w-full text-[15px] text-white bg-transparent outline-none border border-[#181B22] rounded-lg px-3 py-2 resize-y"
          />
          <button onClick={create} className="w-full h-10 rounded-lg bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Create community</button>
        </div>
        <button onClick={onClose} className="self-center flex items-center justify-center w-11 h-11 text-white hover:bg-white/10 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
