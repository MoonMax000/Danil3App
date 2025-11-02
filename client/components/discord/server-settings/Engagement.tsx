import { useEffect, useMemo, useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';

type AccessPass = {
  id: string;
  name: string;
  priceUsd: number;
  periodDays: number;
  recurring: boolean;
  trialDays: number;
  description: string;
};

type PaidSettings = {
  enabled: boolean;
  passes: AccessPass[];
  defaultPassId: string | null;
  gatedRooms: string[]; // channel ids that require paid access
};

const STORAGE_KEY = 'paid_engagement_settings_v1';

const loadSettings = (): PaidSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : false,
        passes: Array.isArray(parsed.passes)
          ? parsed.passes.map((p: any) => ({
              id: String(p.id ?? `pass-${Math.random().toString(36).slice(2)}`),
              name: typeof p.name === 'string' ? p.name : 'Access',
              priceUsd: typeof p.priceUsd === 'number' ? p.priceUsd : Number(p.priceUsd) || 0,
              periodDays: typeof p.periodDays === 'number' ? p.periodDays : Number(p.periodDays) || 30,
              recurring: Boolean(p.recurring),
              trialDays: typeof p.trialDays === 'number' ? p.trialDays : Number(p.trialDays) || 0,
              description: typeof p.description === 'string' ? p.description : '',
            })
          )
          : [],
        defaultPassId: parsed.defaultPassId ?? null,
        gatedRooms: Array.isArray(parsed.gatedRooms) ? parsed.gatedRooms : [],
      };
    }
  } catch (err) {
    // ignore
    console.warn('Failed to parse paid settings', err);
  }
  return { enabled: false, passes: [], defaultPassId: null, gatedRooms: [] };
};

const saveSettings = (s: PaidSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event('paid-settings-updated'));
};

import { getAllChannels } from '@/components/discord/channels';

const Engagement = () => {
  // Paid monetization only
  const [paid, setPaid] = useState<PaidSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(paid);
  }, [paid]);

  const defaultPass = useMemo(() => paid.passes.find(p => p.id === paid.defaultPassId) || null, [paid]);

  const addPass = () => {
    const id = `pass-${Date.now()}`;
    const newPass: AccessPass = { id, name: 'Standard Access', priceUsd: 5, periodDays: 30, recurring: true, trialDays: 0, description: '' };
    setPaid(prev => ({ ...prev, passes: [...prev.passes, newPass], defaultPassId: prev.defaultPassId || id }));
  };

  const addTemplate = (name: string, priceUsd: number, periodDays: number) => {
    const id = `pass-${Date.now()}`;
    setPaid(prev => ({
      ...prev,
      passes: [...prev.passes, { id, name, priceUsd, periodDays, recurring: true, trialDays: 0, description: '' }],
      defaultPassId: prev.defaultPassId || id,
    }));
  };

  const updatePass = (id: string, patch: Partial<AccessPass>) => {
    setPaid(prev => ({ ...prev, passes: prev.passes.map(p => (p.id === id ? { ...p, ...patch } : p)) }));
  };

  const deletePass = (id: string) => {
    setPaid(prev => {
      const passes = prev.passes.filter(p => p.id !== id);
      const defaultPassId = prev.defaultPassId === id ? (passes[0]?.id ?? null) : prev.defaultPassId;
      return { ...prev, passes, defaultPassId };
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[720px] px-6 py-8">
        <h2 className="text-[19px] font-bold text-white mb-1">Paid Content</h2>
        <p className="text-xs font-bold text-[#B0B0B0] mb-6">Monetize chat access with passes and subscriptions.</p>

        <div className="flex flex-col gap-6 min-w-0">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white">Enable paid access</span>
              <span className="text-xs font-bold text-[#B0B0B0]">Gate chat behind an access pass</span>
            </div>
            <button
              onClick={() => setPaid(p => ({ ...p, enabled: !p.enabled }))}
              className={`relative w-[46px] h-6 rounded-full p-0.5 ${paid.enabled ? 'bg-gradient-to-l from-purple to-darkPurple' : 'bg-[#523A83]'} flex items-center ${paid.enabled ? 'justify-end' : 'justify-start'}`}
            >
              <div className="w-5 h-5 bg-white rounded-full" />
            </button>
          </div>

          {/* Passes configuration */}
          {paid.enabled && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-white">Default pass</span>
                <span className="text-xs font-bold text-[#B0B0B0]">Shown at checkout</span>
              </div>

              <div className="flex flex-col gap-3 min-w-0">
                <div className="flex gap-3 flex-wrap">
                  <button onClick={addPass} className="h-11 px-4 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold whitespace-nowrap">Add access pass</button>
                  <button onClick={() => addTemplate('Monthly', 5, 30)} className="h-11 px-4 rounded-full border border-[#181B22] text-[#B0B0B0] font-bold whitespace-nowrap">Add Monthly</button>
                  <button onClick={() => addTemplate('Annual', 50, 365)} className="h-11 px-4 rounded-full border border-[#181B22] text-[#B0B0B0] font-bold whitespace-nowrap">Add Annual</button>
                </div>
                {defaultPass && (
                  <div className="w-full p-4 rounded-2xl border border-[#181B22] bg-[#0C1014]/40 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-l from-purple to-darkPurple flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-[15px] font-bold">Checkout preview</span>
                        <span className="text-[11px] text-purple font-bold px-2 py-0.5 rounded-full border border-purple/40">{paid.gatedRooms.length} rooms</span>
                        {defaultPass.periodDays===365 && (
                          <span className="text-[11px] text-white font-bold px-2 py-0.5 rounded-full bg-purple/30 border border-purple/40">Annual</span>
                        )}
                        {defaultPass.trialDays>0 && (
                          <span className="text-[11px] text-white font-bold px-2 py-0.5 rounded-full bg-purple/30 border border-purple/40">{defaultPass.trialDays}d trial</span>
                        )}
                        {defaultPass.recurring ? (
                          <span className="text-[11px] text-[#B0B0B0] font-bold px-2 py-0.5 rounded-full border border-[#181B22]">Recurring</span>
                        ) : (
                          <span className="text-[11px] text-[#B0B0B0] font-bold px-2 py-0.5 rounded-full border border-[#181B22]">One-time</span>
                        )}
                      </div>
                      <div className="text-[#B0B0B0] text-sm mt-1">{defaultPass.name} — ${defaultPass.priceUsd} / {defaultPass.periodDays}d</div>
                      {defaultPass.description && <div className="text-[#B0B0B0] text-xs mt-1">{defaultPass.description}</div>}
                      <div className="mt-3 flex gap-2">
                        <button className="h-10 px-4 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold">Get access</button>
                        <button className="h-10 px-4 rounded-full border border-[#181B22] text-[#B0B0B0] font-bold">Learn more</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 min-w-0">
                {paid.passes.map(pass => (
                  <div key={pass.id} className={`flex flex-col gap-4 p-4 rounded-2xl border overflow-hidden ${paid.defaultPassId === pass.id ? 'border-purple/60' : 'border-[#181B22]'}`}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setPaid(prev => ({ ...prev, defaultPassId: pass.id }))}
                        className={`px-3 h-8 rounded-full text-sm font-semibold ${paid.defaultPassId === pass.id ? 'bg-gradient-to-l from-purple to-darkPurple text-white' : 'border border-[#181B22] text-[#B0B0B0]'}`}
                      >
                        {paid.defaultPassId === pass.id ? 'Default' : 'Make default'}
                      </button>
                      <button onClick={() => deletePass(pass.id)} className="px-3 h-8 rounded-full border border-[#181B22] text-[#B0B0B0] text-sm font-semibold">Remove</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-3 px-4 h-12 rounded-full border border-[#181B22] bg-[#0C1014]/40 focus-within:ring-1 focus-within:ring-purple/40">
                        <span className="text-[13px] text-[#B0B0B0] min-w-16">Name</span>
                        <input value={pass.name} onChange={(e)=>updatePass(pass.id, { name: e.target.value })} className="flex-1 bg-transparent no-input-bg outline-none text-white" />
                      </label>
                      <label className="flex items-center gap-3 px-4 h-12 rounded-full border border-[#181B22] bg-[#0C1014]/40 focus-within:ring-1 focus-within:ring-purple/40 min-w-0">
                        <span className="text-[13px] text-[#B0B0B0]">Price</span>
                        <div className="flex items-center gap-2 ml-auto">
                          <input type="number" min={0} step={0.5} value={pass.priceUsd} onChange={(e)=>updatePass(pass.id, { priceUsd: Number(e.target.value) })} className="w-16 sm:w-24 bg-transparent no-input-bg outline-none text-white text-right" />
                          <span className="text-[13px] text-[#B0B0B0]">USD</span>
                        </div>
                      </label>
                      <div className="flex items-center gap-2 px-2 h-12 rounded-full border border-[#181B22] bg-[#0C1014]/40 min-w-0">
                        <button onClick={()=>updatePass(pass.id,{ periodDays: 30 })} className={`px-3 h-9 rounded-full focus:outline-none ${pass.periodDays===30?'bg-purple/20 text-white border border-purple/60':'text-[#B0B0B0] border border-transparent'}`}>Monthly</button>
                        <button onClick={()=>updatePass(pass.id,{ periodDays: 365 })} className={`px-3 h-9 rounded-full focus:outline-none ${pass.periodDays===365?'bg-purple/20 text-white border border-purple/60':'text-[#B0B0B0] border border-transparent'}`}>Annual</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center justify-between px-4 h-12 rounded-full border border-[#181B22] text-white">
                        <span className="text-[13px] text-[#B0B0B0]">Recurring</span>
                        <button onClick={()=>updatePass(pass.id,{ recurring: !pass.recurring })} className={`w-[46px] h-6 rounded-full p-0.5 flex items-center ${pass.recurring ? 'bg-gradient-to-l from-purple to-darkPurple justify-end' : 'bg-[#523A83] justify-start'}`}>
                          <div className="w-5 h-5 bg-white rounded-full" />
                        </button>
                      </div>
                      <label className="flex items-center gap-3 px-4 h-12 rounded-full border border-[#181B22] bg-[#0C1014]/40 focus-within:ring-1 focus-within:ring-purple/40">
                        <span className="text-[13px] text-[#B0B0B0] min-w-16">Trial</span>
                        <input type="number" min={0} step={1} value={pass.trialDays} onChange={(e)=>updatePass(pass.id, { trialDays: Number(e.target.value) })} className="w-16 bg-transparent no-input-bg outline-none text-white" />
                        <span className="text-[13px] text-[#B0B0B0]">days</span>
                      </label>
                      <label className="flex items-center gap-3 px-4 h-12 rounded-full border border-[#181B22] bg-[#0C1014]/40 md:col-span-1">
                        <span className="text-[13px] text-[#B0B0B0] min-w-16">Info</span>
                        <input value={pass.description} onChange={(e)=>updatePass(pass.id,{ description: e.target.value })} placeholder="Short description" className="flex-1 bg-transparent no-input-bg outline-none text-white" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-[#B0B0B0]">
                Demo only. Connect payments (e.g., Netlify/Vercel functions + Stripe) to charge and verify access server-side.
              </div>

              {/* Paid rooms */}
              <div className="h-px bg-[#181B22]" />
              <div className="flex flex-col gap-3 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-white">Paid rooms</span>
                  <span className="text-xs font-bold text-[#B0B0B0]">Select rooms that require a pass</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {getAllChannels().map((ch) => {
                    const active = (paid?.gatedRooms ?? []).includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        onClick={() =>
                          setPaid((prev) => ({
                            ...prev,
                            gatedRooms: active
                              ? prev.gatedRooms.filter((id) => id !== ch.id)
                              : [...prev.gatedRooms, ch.id],
                          }))
                        }
                        className={`flex items-center justify-between h-11 rounded-full px-4 border min-w-0 ${active ? 'border-purple/70 bg-purple/10 text-white' : 'border-[#181B22] text-[#B0B0B0]'}`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          {ch.icon && <span className="text-[15px]">{ch.icon}</span>}
                          <span className="text-sm font-semibold truncate">{ch.name}</span>
                        </div>
                        <span className={`text-[11px] font-bold ${active ? 'text-purple' : 'text-[#666B73]'}`}>{active ? 'Paid' : 'Free'}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs text-[#B0B0B0]">
                  Tip: channel ids match the left panel (e.g., self-intro, tradingchat). Only selected rooms will be paywalled.
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button className="h-11 px-4 rounded-full border border-[#181B22] text-[15px] text-[#B0B0B0] font-bold" onClick={() => setPaid(loadSettings())}>Revert</button>
            <button className="h-11 px-4 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold whitespace-nowrap" onClick={() => saveSettings(paid)}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Engagement;
