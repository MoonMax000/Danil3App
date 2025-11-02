import { useState } from 'react';

interface Ban { id:string; user:string; reason:string; date:string }
const initial: Ban[] = [
  { id:'1', user:'Spammer Bot', reason:'Spam links', date:'2025-09-12' },
];

const Bans = () => {
  const [bans, setBans] = useState<Ban[]>(initial);
  const unban = (id:string) => setBans(prev => prev.filter(b=>b.id!==id));

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[720px] px-6 py-8">
        <h2 className="text-[19px] font-bold text-white mb-6">Bans</h2>
        <div className="space-y-3">
          {bans.map(b => (
            <div key={b.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#181B22]">
              <div>
                <div className="text-[15px] font-bold text-white">{b.user}</div>
                <div className="text-xs text-[#B0B0B0]">{b.reason} • {b.date}</div>
              </div>
              <button onClick={()=>unban(b.id)} className="h-[34px] px-4 rounded-lg border border-[#181B22] text-[#B0B0B0] hover:text-white">Unban</button>
            </div>
          ))}
          {bans.length===0 && (
            <div className="text-[#B0B0B0] text-[15px]">No banned users.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bans;
