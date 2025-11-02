import { useState } from 'react';

const initial = ['😀','🎉','🔥','👍','❤️','🚀'];

const Emojis = () => {
  const [emojis, setEmojis] = useState<string[]>(initial);
  const [newEmoji, setNewEmoji] = useState('');

  const addEmoji = () => {
    if (!newEmoji.trim()) return;
    setEmojis((arr)=>[...arr, newEmoji.trim()]);
    setNewEmoji('');
  };

  const removeEmoji = (i:number) => setEmojis((arr)=>arr.filter((_,idx)=>idx!==i));

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[720px] px-6 py-8">
        <h2 className="text-[19px] font-bold text-white mb-6">Emojis & Reactions</h2>

        <div className="flex flex-wrap gap-3 mb-6">
          {emojis.map((e,i)=> (
            <button key={i} onClick={()=>removeEmoji(i)} className="px-3 py-2 rounded-lg border border-[#181B22] text-[18px] hover:bg-white/5 transition">
              {e}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input value={newEmoji} onChange={(e)=>setNewEmoji(e.target.value)} placeholder="Type an emoji (e.g. 😄)" className="flex-1 h-11 px-4 rounded-xl border border-[#181B22] bg-transparent outline-none text-white"/>
          <button onClick={addEmoji} className="h-11 px-4 rounded-xl bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Add</button>
        </div>
      </div>
    </div>
  );
};

export default Emojis;
