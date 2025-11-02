import { useState } from 'react';

interface Role {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
  priority: number; // higher shows above
  description?: string;
  permissions: {
    manageMembers: boolean;
    deleteMessages: boolean;
    pinMessages: boolean;
    manageRoles: boolean;
    manageChannels: boolean;
    banUsers: boolean;
    muteUsers: boolean;
    postAnnouncements: boolean;
    manageEmojis: boolean;
    viewAnalytics: boolean;
  };
}

const defaultRoles: Role[] = [
  { id: '1', name: 'Admin', color: '#A06AFF', priority: 100, permissions: { manageMembers: true, deleteMessages: true, pinMessages: true, manageRoles: true, manageChannels: true, banUsers: true, muteUsers: true, postAnnouncements: true, manageEmojis: true, viewAnalytics: true } },
  { id: '2', name: 'Mod', color: '#2EBD85', priority: 50, permissions: { manageMembers: true, deleteMessages: true, pinMessages: true, manageRoles: false, manageChannels: true, banUsers: true, muteUsers: true, postAnnouncements: true, manageEmojis: true, viewAnalytics: true } },
  { id: '3', name: 'Member', color: '#B0B0B0', priority: 0, isDefault: true, permissions: { manageMembers: false, deleteMessages: false, pinMessages: true, manageRoles: false, manageChannels: false, banUsers: false, muteUsers: false, postAnnouncements: false, manageEmojis: false, viewAnalytics: false } },
];

const STORAGE_KEY = 'community:roles:v1';

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultRoles;
  });
  const [name, setName] = useState('');
  const [color, setColor] = useState('#A06AFF');

  const persist = (next: Role[]) => {
    setRoles(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const add = () => {
    if (!name.trim()) return;
    const role: Role = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      priority: (roles[0]?.priority ?? 0) - 1,
      permissions: { ...defaultRoles[2].permissions },
    };
    persist([role, ...roles]);
    setName('');
  };

  const update = (id: string, patch: Partial<Role>) => persist(roles.map(r => r.id === id ? { ...r, ...patch } : r));
  const toggle = (id: string, key: keyof Role['permissions']) => update(id, { permissions: { ...roles.find(r=>r.id===id)!.permissions, [key]: !roles.find(r=>r.id===id)!.permissions[key] } as any });
  const remove = (id: string) => persist(roles.filter(r => r.id !== id));
  const move = (id: string, dir: 'up' | 'down') => {
    const idx = roles.findIndex(r => r.id === id);
    if (idx < 0) return;
    const arr = [...roles];
    const swapWith = dir === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= arr.length) return;
    [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
    // recompute priorities
    arr.forEach((r, i) => (r.priority = arr.length - i));
    persist(arr);
  };
  const setDefault = (id: string) => persist(roles.map(r => ({ ...r, isDefault: r.id === id })));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(roles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'roles.json'; a.click(); URL.revokeObjectURL(url);
  };

  const importJson = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    try { const parsed = JSON.parse(text); if (Array.isArray(parsed)) persist(parsed as Role[]); } catch {}
  };

  const saveToCommunity = () => {
    window.dispatchEvent(new CustomEvent('roles:save', { detail: { roles } }));
  };

  const allPerms: { key: keyof Role['permissions']; label: string }[] = [
    { key: 'manageMembers', label: 'Manage members' },
    { key: 'deleteMessages', label: 'Delete messages' },
    { key: 'pinMessages', label: 'Pin messages' },
    { key: 'manageRoles', label: 'Manage roles' },
    { key: 'manageChannels', label: 'Manage channels' },
    { key: 'banUsers', label: 'Ban users' },
    { key: 'muteUsers', label: 'Mute users' },
    { key: 'postAnnouncements', label: 'Post announcements' },
    { key: 'manageEmojis', label: 'Manage emoji & stickers' },
    { key: 'viewAnalytics', label: 'View analytics' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[1024px] px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[19px] font-bold text-white">Roles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-6">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Role name" className="h-11 px-4 rounded-xl border border-[#181B22] bg-transparent outline-none text-white"/>
          <div className="flex items-center gap-3">
            <input title="Color" type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="h-11 w-11 rounded"/>
            <button onClick={add} className="h-11 px-4 rounded-xl bg-gradient-to-r from-purple to-darkPurple text-white font-bold">Add Role</button>
          </div>
        </div>

        <div className="space-y-3">
          {roles.map((r, idx) => (
            <div key={r.id} className="px-4 py-4 rounded-2xl border border-[#181B22] custom-bg-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background:r.color }} />
                  <input value={r.name} onChange={(e)=>update(r.id,{ name:e.target.value })} className="bg-transparent text-[15px] font-bold text-white outline-none"/>
                  {r.isDefault && <span className="text-xs text-white/60">(default)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>move(r.id,'up')} className="h-8 w-8 rounded-lg hover:bg-white/5 text-white/70" aria-label="Move up">▲</button>
                  <button onClick={()=>move(r.id,'down')} className="h-8 w-8 rounded-lg hover:bg-white/5 text-white/70" aria-label="Move down">▼</button>
                  {!r.isDefault && <button onClick={()=>setDefault(r.id)} className="h-8 px-3 rounded-lg border border-[#181B22] text-white/80 hover:bg-white/5">Set default</button>}
                  {!r.isDefault && <button onClick={()=>remove(r.id)} className="h-8 px-3 rounded-lg text-red border border-[#181B22] hover:bg-white/5">Delete</button>}
                </div>
              </div>
              {r.description !== undefined ? (
                <input value={r.description||''} onChange={(e)=>update(r.id,{ description:e.target.value })} placeholder="Description" className="mt-2 w-full h-10 px-3 rounded-lg border border-[#181B22] bg-transparent text-white outline-none"/>
              ) : null}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-white text-sm">
                {allPerms.map(p => (
                  <label key={p.key as string} className="group flex items-center gap-3 px-3 py-2 rounded-xl border border-[#181B22] bg-[rgba(12,16,20,0.4)] hover:bg-white/5 transition-colors cursor-pointer">
                    <input type="checkbox" className="peer sr-only" checked={r.permissions[p.key]} onChange={()=>toggle(r.id, p.key)} />
                    <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-md border border-[#2E2744] bg-[rgba(12,16,20,0.6)] peer-checked:border-transparent before:content-[''] before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-purple before:to-darkPurple before:opacity-0 peer-checked:before:opacity-100 transition-opacity">
                      <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 5L8.12504 15L3.33337 10.625" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roles;
