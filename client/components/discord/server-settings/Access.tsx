import { useState } from 'react';

const Access = () => {
  const [visibility, setVisibility] = useState<'public'|'private'>('public');
  const [monetization, setMonetization] = useState<'free'|'paid'>('free');
  const [price, setPrice] = useState(10);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[720px] px-6 py-8">
        <h2 className="text-[19px] font-bold text-white mb-6">Access</h2>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button onClick={()=>setVisibility('public')} className={`h-[34px] px-4 rounded-lg font-bold ${visibility==='public' ? 'bg-gradient-to-l from-purple to-darkPurple text-white':'border border-[#181B22] text-[#B0B0B0]'}`}>Public</button>
            <button onClick={()=>setVisibility('private')} className={`h-[34px] px-4 rounded-lg font-bold ${visibility==='private' ? 'bg-gradient-to-l from-purple to-darkPurple text-white':'border border-[#181B22] text-[#B0B0B0]'}`}>Private</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={()=>setMonetization('free')} className={`h-[34px] px-4 rounded-lg font-bold ${monetization==='free' ? 'bg-gradient-to-l from-purple to-darkPurple text-white':'border border-[#181B22] text-[#B0B0B0]'}`}>Free</button>
            <button onClick={()=>setMonetization('paid')} className={`h-[34px] px-4 rounded-lg font-bold ${monetization==='paid' ? 'bg-gradient-to-l from-purple to-darkPurple text-white':'border border-[#181B22] text-[#B0B0B0]'}`}>Paid</button>
            {monetization==='paid' && (
              <label className="flex items-center gap-2 px-3 h-11 rounded-xl border border-[#181B22] text-white">
                <span>$</span>
                <input type="number" min={1} value={price} onChange={(e)=>setPrice(Number(e.target.value))} className="bg-transparent outline-none w-20"/>
                <span>/month</span>
              </label>
            )}
          </div>

          <div className="flex gap-3">
            <button className="h-[34px] px-4 rounded-lg border border-[#181B22] text-[15px] text-[#B0B0B0] font-bold">Revert</button>
            <button className="h-[34px] px-4 rounded-lg bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Access;
