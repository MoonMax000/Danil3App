import { useState } from 'react';

const AutoMod = () => {
  const [badWords, setBadWords] = useState<string>('spam, scam');
  const [capsLimit, setCapsLimit] = useState<number>(70);
  const [linkBlock, setLinkBlock] = useState<boolean>(false);

  const Toggle = ({checked,onToggle}:{checked:boolean;onToggle:()=>void}) => (
    <button onClick={onToggle} className={`relative w-[38px] h-5 rounded-full p-0.5 ${checked? 'bg-gradient-to-l from-purple to-darkPurple':'bg-[#523A83]'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked? 'translate-x-[18px]':'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[720px] px-6 py-8">
        <h2 className="text-[19px] font-bold text-white mb-6">AutoMod</h2>

        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 px-4 h-12 rounded-xl border border-[#181B22]">
            <span className="text-[15px] text-[#B0B0B0] min-w-32">Blocked words</span>
            <input value={badWords} onChange={(e)=>setBadWords(e.target.value)} className="flex-1 bg-transparent outline-none text-white"/>
          </label>

          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-white">Max CAPITALS in a message</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#B0B0B0]">{capsLimit}%</span>
              <input type="range" min={0} max={100} value={capsLimit} onChange={(e)=>setCapsLimit(Number(e.target.value))}/>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-white">Block links</span>
            <Toggle checked={linkBlock} onToggle={()=>setLinkBlock(v=>!v)} />
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

export default AutoMod;
