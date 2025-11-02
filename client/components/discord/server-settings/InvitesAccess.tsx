import { useState } from 'react';

const InvitesAccess = () => {
  // Invites state
  const [slug, setSlug] = useState('server-name');
  const link = `https://tyriantrade.com/join/${slug}`;
  const [expiry, setExpiry] = useState('never');
  const copy = async () => { try { await navigator.clipboard.writeText(link); } catch {} };

  // Access state
  const [visibility, setVisibility] = useState<'public'|'private'>('public');

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[820px] px-6 py-8 flex flex-col gap-6">
        <h2 className="text-[19px] font-bold text-white">Invites & Access</h2>

        {/* Invites card */}
        <div className="p-4 rounded-2xl border border-[#181B22] bg-[#0C1014]/40 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-white">Invites</span>
            <span className="text-xs font-bold text-[#B0B0B0]">Shareable link</span>
          </div>
          <label className="flex items-center gap-3 px-4 h-12 rounded-full border border-[#181B22] bg-[#0C1014]/40">
            <span className="text-[13px] text-[#B0B0B0] min-w-28">Custom slug</span>
            <input value={slug} onChange={(e)=>setSlug(e.target.value)} className="flex-1 bg-transparent no-input-bg outline-none text-white"/>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#B0B0B0]">Expiry</span>
            <select value={expiry} onChange={(e)=>setExpiry(e.target.value)} className="h-11 px-3 rounded-full border border-[#181B22] bg-transparent text-white">
              <option value="never">Never</option>
              <option value="1d">1 day</option>
              <option value="7d">7 days</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-12 px-4 rounded-full border border-[#181B22] bg-[#0C1014]/40 flex items-center text-white overflow-hidden">{link}</div>
            <button onClick={copy} className="h-12 px-4 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Copy</button>
          </div>
        </div>

        {/* Access card */}
        <div className="p-4 rounded-2xl border border-[#181B22] bg-[#0C1014]/40 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-white">Access</span>
            <span className="text-xs font-bold text-[#B0B0B0]">Visibility & pricing</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setVisibility('public')} className={`h-[34px] px-4 rounded-full font-bold ${visibility==='public' ? 'bg-gradient-to-l from-purple to-darkPurple text-white':'border border-[#181B22] text-[#B0B0B0]'}`}>Public</button>
            <button onClick={()=>setVisibility('private')} className={`h-[34px] px-4 rounded-full font-bold ${visibility==='private' ? 'bg-gradient-to-l from-purple to-darkPurple text-white':'border border-[#181B22] text-[#B0B0B0]'}`}>Private</button>
          </div>
          <div className="flex gap-3">
            <button className="h-[34px] px-4 rounded-full border border-[#181B22] text-[15px] text-[#B0B0B0] font-bold">Revert</button>
            <button className="h-[34px] px-4 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitesAccess;
