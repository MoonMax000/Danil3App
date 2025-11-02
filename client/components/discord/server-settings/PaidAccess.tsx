import { FC, useState } from 'react';

const PaidAccess: FC = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(10);
  const [currency, setCurrency] = useState<string>('USD');

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[900px] px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-bold text-white">Paid Access</h2>
          <label className="flex items-center gap-2 text-white text-sm">
            <input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} />
            Require payment to join
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className={`flex items-center gap-2 px-3 h-11 rounded-xl border border-[#181B22] text-white ${!enabled ? 'opacity-60 pointer-events-none' : ''}`}>
            <span>$</span>
            <input type="number" min={1} value={price} onChange={(e)=>setPrice(Number(e.target.value))} className="bg-transparent outline-none w-24" />
            <span>Amount</span>
          </label>
          <select value={currency} onChange={(e)=>setCurrency(e.target.value)} className={`h-11 px-4 rounded-xl border border-[#181B22] bg-transparent text-white ${!enabled ? 'opacity-60 pointer-events-none' : ''}`}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
          <button
            onClick={()=>{
              const detail = { enabled, price, currency };
              window.dispatchEvent(new CustomEvent('paid-access:save', { detail }));
            }}
            className="h-11 px-4 rounded-xl bg-gradient-to-r from-purple to-darkPurple text-white font-bold disabled:opacity-50"
            disabled={!enabled || price<=0}
          >
            Save changes
          </button>
        </div>
        <p className="text-[#B0B0B0] text-sm">Applies to this community. Members must pay the fixed amount once to unlock access.</p>
      </div>
    </div>
  );
};

export default PaidAccess;
