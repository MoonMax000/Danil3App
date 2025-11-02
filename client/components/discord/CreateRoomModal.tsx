import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ChannelCategory, defaultCategories, loadRooms, saveRooms } from './channels';

interface Props {
  isOpen: boolean;
  categoryId: string | null; // target category; if missing, will create if needed
  onClose: () => void;
}

const slugify = (s: string) => s
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60) || 'room';

const CreateRoomModal = ({ isOpen, categoryId, onClose }: Props) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💬');
  const [type, setType] = useState<'text' | 'voice'>('text');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setIcon('💬');
      setType('text');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = () => {
    const id = slugify(name || 'room');
    const cats: ChannelCategory[] = loadRooms();
    let target = cats.find(c => c.id === (categoryId || ''));
    if (!target) {
      // create missing category (e.g., "important") with default color
      const newCat: ChannelCategory = { id: categoryId || 'general', name: (categoryId || 'General').replace(/(^|-)\w/g, m => m.toUpperCase()), color: 'text-purple', channels: [] as any };
      cats.push(newCat);
      target = newCat;
    }
    if (!Array.isArray(target.channels)) target.channels = [] as any;
    if (target.channels.some((ch: any) => ch.id === id)) {
      // ensure unique id
      let idx = 2; let newId = `${id}-${idx}`;
      while (target.channels.some((ch: any) => ch.id === newId)) { idx += 1; newId = `${id}-${idx}`; }
      target.channels.push({ id: newId, name: name || newId, icon, type });
    } else {
      target.channels.push({ id, name: name || id, icon, type });
    }
    saveRooms(cats);
    window.dispatchEvent(new Event('rooms-updated'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col w-[440px] max-h-[90vh] pt-12 px-4 pb-4 gap-6 rounded-r-3xl border border-[#181B22] custom-bg-blur overflow-y-auto scrollbar">
        <div className="flex flex-col gap-3 items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-l from-purple to-darkPurple grid place-items-center text-2xl">{icon}</div>
          <div className="flex items-center gap-2 w-full">
            <input value={icon} onChange={(e)=>setIcon(e.target.value)} className="w-16 text-center text-[24px] bg-transparent text-white border border-[#181B22] rounded-lg py-2" />
            <input placeholder="Room name" value={name} onChange={(e)=>setName(e.target.value)} className="flex-1 text-[15px] font-normal text-white bg-transparent outline-none border border-[#181B22] rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2 w-full">
            <button onClick={()=>setType('text')} className={`flex-1 h-9 rounded-lg ${type==='text' ? 'bg-gradient-to-l from-purple to-darkPurple text-white' : 'border border-[#181B22] text-[#B0B0B0]'}`}>Text</button>
            <button onClick={()=>setType('voice')} className={`flex-1 h-9 rounded-lg ${type==='voice' ? 'bg-gradient-to-l from-purple to-darkPurple text-white' : 'border border-[#181B22] text-[#B0B0B0]'}`}>Voice</button>
          </div>
          <div className="w-full text-xs font-bold text-[#B0B0B0]">ID: {slugify(name || 'room')}</div>
          <button onClick={handleCreate} className="w-full h-10 rounded-lg bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Create room</button>
        </div>
        <button onClick={onClose} className="flex items-center justify-center w-11 h-11 text-white hover:bg-white/10 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CreateRoomModal;
