import { useMemo, useState } from 'react';

interface Member { id: string; name: string; role: 'owner'|'admin'|'mod'|'member'; online: boolean }
const seed: Member[] = [
  { id:'1', name:'Genevieve Hammes', role:'owner', online:true },
  { id:'2', name:'Alex Turner', role:'admin', online:false },
  { id:'3', name:'Kim Lee', role:'member', online:true },
  { id:'4', name:'Patricia Doe', role:'mod', online:true },
];

const Members = () => {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState<Member[]>(seed);

  const filtered = useMemo(()=> members.filter(m=> m.name.toLowerCase().includes(query.toLowerCase())), [members, query]);

  const updateRole = (id:string, role: Member['role']) => setMembers(prev => prev.map(m => m.id===id? { ...m, role } : m));
  const kick = (id:string) => setMembers(prev => prev.filter(m=>m.id!==id));

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[900px] px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[19px] font-bold text-white">Members</h2>
          <div className="flex items-center gap-3">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search members" className="h-10 w-[240px] px-4 rounded-xl border border-[#181B22] bg-transparent outline-none text-white"/>
            <button className="h-10 px-3 rounded-xl border border-[#181B22] text-[#B0B0B0] font-bold">Invite</button>
          </div>
        </div>

        <div className="divide-y divide-[#181B22]">
          {filtered.map((m)=> (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${m.online ? 'bg-[#2EBD85]' : 'bg-[#B0B0B0]'}`}/>
                <span className="text-[15px] font-bold text-white">{m.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <select value={m.role} onChange={(e)=>updateRole(m.id, e.target.value as Member['role'])} className="h-9 px-3 rounded-lg border border-[#181B22] bg-transparent text-white">
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="mod">Mod</option>
                  <option value="member">Member</option>
                </select>
                <button onClick={()=>kick(m.id)} className="h-9 px-3 rounded-lg border border-[#181B22] text-[#B0B0B0] hover:text-white">Kick</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Members;
