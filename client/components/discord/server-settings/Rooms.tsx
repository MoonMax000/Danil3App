import { useEffect, useMemo, useState } from 'react';
import { Channel, ChannelCategory, defaultCategories, loadRooms, saveRooms } from '@/components/discord/channels';
import { Hash, Volume2, Plus, Trash2 } from 'lucide-react';

const newId = () => `id_${Math.random().toString(36).slice(2, 9)}`;

const Rooms = () => {
  const [cats, setCats] = useState<ChannelCategory[]>(() => loadRooms());

  const addCategory = () => {
    setCats((prev) => [...prev, { id: newId(), name: 'New Category', color: 'text-purple', channels: [] }]);
  };

  const removeCategory = (id: string) => {
    setCats((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCategory = (id: string, patch: Partial<ChannelCategory>) => {
    setCats((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addChannel = (catId: string) => {
    const ch: Channel = { id: newId(), name: 'new-room', icon: '💬', type: 'text' };
    setCats((prev) => prev.map((c) => (c.id === catId ? { ...c, channels: [...c.channels, ch] } : c)));
  };

  const updateChannel = (catId: string, chId: string, patch: Partial<Channel>) => {
    setCats((prev) => prev.map((c) => (c.id === catId ? { ...c, channels: c.channels.map((ch) => (ch.id === chId ? { ...ch, ...patch } : ch)) } : c)));
  };

  const removeChannel = (catId: string, chId: string) => {
    setCats((prev) => prev.map((c) => (c.id === catId ? { ...c, channels: c.channels.filter((ch) => ch.id !== chId) } : c)));
  };

  const resetToDefaults = () => setCats(defaultCategories);

  const save = () => {
    saveRooms(cats);
    window.dispatchEvent(new Event('rooms-updated'));
  };

  const roomCount = useMemo(() => cats.reduce((acc, c) => acc + c.channels.length, 0), [cats]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[720px] px-6 py-8">
        <h2 className="text-[24px] font-bold text-white mb-2">Rooms</h2>
        <p className="text-[15px] font-bold text-[#B0B0B0] mb-6">Create categories and rooms for your server. Total rooms: {roomCount}</p>
        <div className="flex justify-end mb-4">
          <button onClick={addCategory} className="h-11 px-6 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold hover:opacity-90 transition-opacity shadow-md">
            <Plus className="w-4 h-4 inline mr-2"/>Add category
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {cats.map((cat) => (
            <div key={cat.id} className="rounded-2xl border border-[#181B22] p-5 bg-[rgba(11,14,17,0.5)] backdrop-blur-xl flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 flex items-center gap-3 px-4 h-11 rounded-full border border-[#181B22] bg-[#0C1014]/60 backdrop-blur-sm">
                  <span className="text-[13px] font-bold text-[#B0B0B0] uppercase">Category</span>
                  <input value={cat.name} onChange={(e)=>updateCategory(cat.id,{ name:e.target.value })} className="flex-1 bg-transparent outline-none text-white font-bold text-[15px]" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>addChannel(cat.id)} className="h-11 px-5 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold hover:opacity-90 transition-opacity shadow-md">
                    <Plus className="w-4 h-4 inline mr-2"/>Add room
                  </button>
                  <button onClick={()=>removeCategory(cat.id)} className="h-11 px-4 rounded-full border border-[#181B22] text-[#B0B0B0] font-bold hover:bg-white/5 hover:text-white transition-colors">
                    <Trash2 className="w-4 h-4 inline mr-2"/>Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.channels.map((ch) => (
                  <div key={ch.id} className="flex items-center justify-between h-12 rounded-xl border border-[#181B22] bg-[#0C1014]/60 backdrop-blur-sm px-4 gap-3 hover:border-purple/30 transition-colors">
                    <div className="flex-1 flex items-center gap-3 min-w-0 overflow-hidden">
                      {ch.type === 'voice' ? <Volume2 className="w-5 h-5 text-purple flex-shrink-0"/> : <Hash className="w-5 h-5 text-purple flex-shrink-0"/>}
                      <input value={ch.icon || ''} onChange={(e)=>updateChannel(cat.id, ch.id, { icon: e.target.value })} className="w-10 bg-transparent outline-none text-white text-center" placeholder="💬" />
                      <input value={ch.name} onChange={(e)=>updateChannel(cat.id, ch.id, { name: e.target.value })} className="flex-1 bg-transparent outline-none text-white font-bold text-[15px] truncate" />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={()=>removeChannel(cat.id, ch.id)} className="h-8 px-3 rounded-full border border-[#181B22] text-[#B0B0B0] text-xs font-bold hover:bg-white/5 hover:text-white transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 flex-wrap mt-4">
            <button onClick={resetToDefaults} className="h-11 px-5 rounded-full border border-[#181B22] text-[#B0B0B0] font-bold hover:bg-white/5 hover:text-white transition-colors">
              Reset to defaults
            </button>
            <div className="flex-1" />
            <button onClick={()=>setCats(loadRooms())} className="h-11 px-5 rounded-full border border-[#181B22] text-[#B0B0B0] font-bold hover:bg-white/5 hover:text-white transition-colors">
              Revert
            </button>
            <button onClick={save} className="h-11 px-5 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold hover:opacity-90 transition-opacity shadow-md">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
