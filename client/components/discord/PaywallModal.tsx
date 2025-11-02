import { createPortal } from 'react-dom';
import { Lock, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
  gatedRooms: string[];
};

const STORAGE_KEY = 'paid_engagement_settings_v1';

const loadPaid = (): PaidSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        enabled: !!p.enabled,
        passes: Array.isArray(p.passes) ? p.passes : [],
        defaultPassId: p.defaultPassId ?? null,
        gatedRooms: Array.isArray(p.gatedRooms) ? p.gatedRooms : [],
      };
    }
  } catch {}
  return { enabled: false, passes: [], defaultPassId: null, gatedRooms: [] };
};

export default function PaywallModal({ isOpen, roomId, roomName, onClose, onUnlocked }: { isOpen: boolean; roomId: string; roomName?: string; onClose: () => void; onUnlocked?: () => void }) {
  const [paid, setPaid] = useState<PaidSettings>(() => loadPaid());
  useEffect(() => {
    const handler = () => setPaid(loadPaid());
    window.addEventListener('paid-settings-updated', handler as any);
    window.addEventListener('focus', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('paid-settings-updated', handler as any);
      window.removeEventListener('focus', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const defaultPass = useMemo(() => paid.passes.find(p => p.id === paid.defaultPassId) || null, [paid]);

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[420px] p-6 rounded-2xl border border-[#181B22] custom-bg-blur">
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-lg hover:bg-white/5" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple to-darkPurple grid place-items-center">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div className="text-white text-lg font-bold">Unlock {roomName || roomId}</div>
          {defaultPass ? (
            <>
              <div className="text-[#B0B0B0] text-sm">Get access with {defaultPass.name}{defaultPass.recurring ? ' (subscription)' : ''}.</div>
              <div className="text-2xl font-extrabold text-white mt-1">${defaultPass.priceUsd} / {defaultPass.periodDays}d</div>
            </>
          ) : (
            <div className="text-[#B0B0B0] text-sm">This room requires a pass.</div>
          )}
          <button
            className="mt-2 w-full h-11 rounded-full bg-gradient-to-r from-purple to-darkPurple text-white font-bold hover:opacity-90"
            onClick={() => {
              localStorage.setItem(`paid_access_granted_v1:${roomId}`, 'true');
              onUnlocked?.();
              onClose();
            }}
          >
            {defaultPass ? `Unlock for $${defaultPass.priceUsd}` : 'Unlock access'}
          </button>
          <button
            className="w-full h-11 rounded-full border border-[#181B22] text-[#B0B0B0] font-bold hover:bg-white/5"
            onClick={onClose}
          >
            Not now
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
