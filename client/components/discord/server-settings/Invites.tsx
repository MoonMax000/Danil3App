import { useState } from 'react';

const Invites = () => {
  const [slug, setSlug] = useState('server-name');
  const link = `https://tyriantrade.com/join/${slug}`;
  const [expiry, setExpiry] = useState('never');
  const copy = async () => { try { await navigator.clipboard.writeText(link); } catch {}
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[720px] px-6 py-8">
        <h2 className="text-[19px] font-bold text-white mb-6">Invites</h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 px-4 h-12 rounded-xl border border-[#181B22]">
            <span className="text-[15px] text-[#B0B0B0] min-w-28">Custom slug</span>
            <input value={slug} onChange={(e)=>setSlug(e.target.value)} className="flex-1 bg-transparent outline-none text-white"/>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-[15px] text-white">Expiry</span>
            <select value={expiry} onChange={(e)=>setExpiry(e.target.value)} className="h-11 px-3 rounded-xl border border-[#181B22] bg-transparent text-white">
              <option value="never">Never</option>
              <option value="1d">1 day</option>
              <option value="7d">7 days</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-12 px-4 rounded-xl border border-[#181B22] flex items-center text-white overflow-hidden">{link}</div>
            <button onClick={copy} className="h-12 px-4 rounded-xl bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Copy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invites;
