import { useState } from 'react';

const ServerSubscriptions = () => {
  const [enabled, setEnabled] = useState(false);
  const [tiers, setTiers] = useState([{ id:'1', name:'Supporter', price:5, perks:'Badge, Exclusive chat' }]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(3);
  const [perks, setPerks] = useState('');

  const addTier = () => {
    if (!name.trim() || price<=0) return;
    setTiers(prev=>[...prev, { id: crypto.randomUUID(), name: name.trim(), price, perks }]);
    setName(''); setPrice(3); setPerks('');
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[900px] px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[19px] font-bold text-white">Server Subscriptions</h2>
          <label className="flex items-center gap-2 text-white text-sm"><input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} />Enable</label>
        </div>

        {enabled && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Tier name" className="h-11 px-4 rounded-xl border border-[#181B22] bg-transparent outline-none text-white"/>
              <label className="flex items-center gap-2 px-3 h-11 rounded-xl border border-[#181B22] text-white">
                <span>$</span>
                <input type="number" min={1} value={price} onChange={(e)=>setPrice(Number(e.target.value))} className="bg-transparent outline-none w-20"/>
                <span>/month</span>
              </label>
              <input value={perks} onChange={(e)=>setPerks(e.target.value)} placeholder="Perks (comma separated)" className="h-11 px-4 flex-1 rounded-xl border border-[#181B22] bg-transparent outline-none text-white"/>
              <button onClick={addTier} className="h-11 px-4 rounded-xl bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Add</button>
            </div>

            <div className="space-y-3">
              {tiers.map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#181B22]">
                  <div className="text-white">
                    <div className="text-[15px] font-bold">{t.name} • ${t.price}/mo</div>
                    <div className="text-xs text-[#B0B0B0]">{t.perks}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServerSubscriptions;
