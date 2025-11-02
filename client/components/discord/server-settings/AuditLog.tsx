const entries = [
  { id: '1', actor: 'Alex Turner', action: 'Changed role for Kim Lee to Mod', time: '2h ago' },
  { id: '2', actor: 'Genevieve Hammes', action: 'Pinned a message in #self-intro', time: '4h ago' },
  { id: '3', actor: 'Kim Lee', action: 'Created invite link', time: '1d ago' },
];

const AuditLog = () => {
  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full max-w-[900px] px-6 py-8">
        <h2 className="text-[19px] font-bold text-white mb-6">Audit Log</h2>
        <div className="rounded-xl border border-[#181B22] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-[13px] text-[#B0B0B0]">Actor</th>
                <th className="px-4 py-3 text-[13px] text-[#B0B0B0]">Action</th>
                <th className="px-4 py-3 text-[13px] text-[#B0B0B0]">Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-t border-[#181B22]">
                  <td className="px-4 py-3 text-white text-[15px]">{e.actor}</td>
                  <td className="px-4 py-3 text-white text-[15px]">{e.action}</td>
                  <td className="px-4 py-3 text-white text-[15px]">{e.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
