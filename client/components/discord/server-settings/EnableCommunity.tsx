import { useState } from 'react';

const EnableCommunity = () => {
  const [rulesChannel, setRulesChannel] = useState('#rules');
  const [welcomeChannel, setWelcomeChannel] = useState('#welcome');
  const [features, setFeatures] = useState({ insights:true, discovery:true, membershipScreening:true });

  const toggle = (k:keyof typeof features) => setFeatures(prev => ({...prev, [k]: !prev[k]}));

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[720px] px-6 py-8">
        <h2 className="text-[19px] font-bold text-white mb-6">Enable Community</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 px-4 h-12 rounded-xl border border-[#181B22]">
            <span className="text-[15px] text-[#B0B0B0] min-w-40">Rules channel</span>
            <input value={rulesChannel} onChange={(e)=>setRulesChannel(e.target.value)} className="flex-1 bg-transparent outline-none text-white"/>
          </label>
          <label className="flex items-center gap-3 px-4 h-12 rounded-xl border border-[#181B22]">
            <span className="text-[15px] text-[#B0B0B0] min-w-40">Welcome channel</span>
            <input value={welcomeChannel} onChange={(e)=>setWelcomeChannel(e.target.value)} className="flex-1 bg-transparent outline-none text-white"/>
          </label>

          <div className="space-y-2">
            <label className="flex items-center gap-3 text-white"><input type="checkbox" checked={features.insights} onChange={()=>toggle('insights')}/>Server insights</label>
            <label className="flex items-center gap-3 text-white"><input type="checkbox" checked={features.discovery} onChange={()=>toggle('discovery')}/>Server discovery</label>
            <label className="flex items-center gap-3 text-white"><input type="checkbox" checked={features.membershipScreening} onChange={()=>toggle('membershipScreening')}/>Membership screening</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="h-[34px] px-4 rounded-lg border border-[#181B22] text-[15px] text-[#B0B0B0] font-bold">Cancel</button>
            <button className="h-[34px] px-4 rounded-lg bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Enable</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnableCommunity;
