import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";

const METRIC_BARS = [
  { name: "Accuracy", value: 0.97 },
  { name: "Recall", value: 0.86 },
  { name: "Precision", value: 0.95 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0a0f1e] border border-white/10 px-3 py-2 text-xs text-white/80">
        {(payload[0].value * 100).toFixed(0)}%
      </div>
    );
  }
  return null;
};

export default function ModelMetrics({ metrics, history }) {
  const adimplente = history.filter((h) => h.prediction === 0).length;
  const inadimplente = history.filter((h) => h.prediction === 1).length;

  const pieData = [
    { name: "Adimplente", value: adimplente || 1 },
    { name: "Inadimplente", value: inadimplente || 0 },
  ];

  const avgProb =
    history.length > 0
      ? (history.reduce((acc, h) => acc + h.default_probability, 0) / history.length * 100).toFixed(1)
      : "—";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* info do modelo */}
      <div className="bg-white/[0.02] border border-white/8 p-6">
        <h2 className="text-xs tracking-widest uppercase text-white/60 mb-6">— Informações do Modelo</h2>

        {metrics ? (
          <div className="space-y-4">
            {[
              { label: "Tipo", value: metrics.model?.type },
              { label: "Estimadores", value: metrics.model?.n_estimators },
              { label: "Profundidade Máxima", value: metrics.model?.max_depth },
              { label: "Features", value: metrics.model?.n_features },
              { label: "Versão da API", value: metrics.api_version },
              { label: "Status", value: metrics.status?.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] text-white/30 tracking-widest uppercase">{label}</span>
                <span className="text-xs text-emerald-400 font-bold">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-xs text-red-400/60 tracking-widest uppercase">API offline — sem dados</p>
          </div>
        )}
      </div>

      {/* métricas de treino */}
      <div className="bg-white/[0.02] border border-white/8 p-6">
        <h2 className="text-xs tracking-widest uppercase text-white/60 mb-6">— Métricas de Treino</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={METRIC_BARS} barSize={28}>
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Bar dataKey="value" radius={0}>
              {METRIC_BARS.map((_, i) => (
                <Cell key={i} fill={i === 0 ? "#34d399" : i === 1 ? "#f87171" : "#60a5fa"} opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* distribuição da sessão */}
      <div className="bg-white/[0.02] border border-white/8 p-6">
        <h2 className="text-xs tracking-widest uppercase text-white/60 mb-6">— Distribuição da Sessão</h2>

        {history.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-xs text-white/20 tracking-widest uppercase">Nenhuma predição ainda</p>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill="#34d399" opacity={0.8} />
                  <Cell fill="#f87171" opacity={0.8} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-white/30 tracking-widest uppercase">Adimplentes</p>
                <p className="text-2xl font-bold text-emerald-400">{adimplente}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/30 tracking-widest uppercase">Inadimplentes</p>
                <p className="text-2xl font-bold text-red-400">{inadimplente}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* stats da sessão */}
      <div className="bg-white/[0.02] border border-white/8 p-6">
        <h2 className="text-xs tracking-widest uppercase text-white/60 mb-6">— Stats da Sessão</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total de Análises", value: history.length, color: "text-white" },
            { label: "Prob. Média", value: `${avgProb}%`, color: "text-blue-400" },
            { label: "Taxa de Inadimplência", value: history.length ? `${((inadimplente / history.length) * 100).toFixed(0)}%` : "—", color: "text-red-400" },
            { label: "Taxa de Adimplência", value: history.length ? `${((adimplente / history.length) * 100).toFixed(0)}%` : "—", color: "text-emerald-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="border border-white/5 p-4">
              <p className="text-[10px] text-white/30 tracking-widest uppercase mb-2">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}