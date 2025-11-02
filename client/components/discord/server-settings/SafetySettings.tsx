import { useState } from 'react';

const SafetySettings = () => {
  const [nsfwFilter, setNsfwFilter] = useState(true);
  const [linkGuard, setLinkGuard] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const Toggle = ({checked,onToggle}:{checked:boolean;onToggle:()=>void}) => (
    <button onClick={onToggle} className={`relative w-[38px] h-5 rounded-full p-0.5 ${checked? 'bg-gradient-to-l from-purple to-darkPurple':'bg-[#523A83]'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked? 'translate-x-[18px]':'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[720px] px-6 py-8">
        <h2 className="text-[19px] font-bold text-white mb-6">Safety Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-white">NSFW filter</div>
              <div className="text-xs text-[#B0B0B0]">Automatically blur or block sensitive media</div>
            </div>
            <Toggle checked={nsfwFilter} onToggle={()=>setNsfwFilter(v=>!v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-white">Link guard</div>
              <div className="text-xs text-[#B0B0B0]">Warn on suspicious or unknown domains</div>
            </div>
            <Toggle checked={linkGuard} onToggle={()=>setLinkGuard(v=>!v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-white">Require 2FA for mods/admins</div>
              <div className="text-xs text-[#B0B0B0]">Adds a security layer for elevated roles</div>
            </div>
            <Toggle checked={twoFactor} onToggle={()=>setTwoFactor(v=>!v)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button className="h-[34px] px-4 rounded-lg border border-[#181B22] text-[15px] text-[#B0B0B0] font-bold">Revert</button>
            <button className="h-[34px] px-4 rounded-lg bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetySettings;
