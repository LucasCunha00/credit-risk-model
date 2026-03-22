export default function HistoryTable({ history }) {
  if (history.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/8 p-12 flex flex-col items-center justify-center">
        <p className="text-xs text-white/20 tracking-widest uppercase">Nenhuma predição ainda</p>
        <p className="text-[10px] text-white/10 mt-2">
          As predições aparecem aqui após serem realizadas
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs tracking-widest uppercase text-white/60">
          — Histórico da Sessão
        </h2>
        <span className="text-[10px] text-white/30 tracking-widest">
          {history.length} registro{history.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              {["Horário", "Resultado", "Probabilidade", "FICO", "Empréstimo", "Renda", "DTI", "Taxa"].map((h) => (
                <th key={h} className="text-left pb-3 text-[10px] text-white/30 tracking-widest uppercase pr-4 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row) => {
              const isDefault = row.prediction === 1;
              const pct = Math.round(row.default_probability * 100);
              return (
                <tr key={row.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4 text-white/30">{row.ts}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] tracking-widest border ${
                        isDefault
                          ? "text-red-400 border-red-500/30 bg-red-500/10"
                          : "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                      }`}
                    >
                      {row.label}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-white/5">
                        <div
                          className={`h-full ${isDefault ? "bg-red-400" : "bg-emerald-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={isDefault ? "text-red-400" : "text-emerald-400"}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white/50">{row.fico_range_low}</td>
                  <td className="py-3 pr-4 text-white/50">R$ {row.loan_amnt?.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-white/50">R$ {row.annual_inc?.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-white/50">{row.dti}%</td>
                  <td className="py-3 pr-4 text-white/50">{row.int_rate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}