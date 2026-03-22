import { useEffect, useState } from "react";
import axios from "axios";

const FEATURE_LABELS = {
  int_rate: "Taxa de Juros",
  loan_amnt: "Valor do Empréstimo",
  annual_inc: "Renda Anual",
  dti: "DTI",
  delinq_2yrs: "Inadimplências (2 anos)",
  fico_range_low: "Score FICO Mínimo",
  open_acc: "Contas Abertas",
  pub_rec: "Registros Negativos",
  revol_bal: "Saldo Rotativo",
  revol_util: "Utilização Rotativo",
  total_acc: "Total de Contas",
  mort_acc: "Hipotecas",
  pub_rec_bankruptcies: "Falências",
  last_fico_range_low: "Último FICO Mínimo",
  last_fico_range_high: "Último FICO Máximo",
  recoveries: "Recuperações",
  collection_recovery_fee: "Taxa de Recuperação",
  last_pymnt_amnt: "Último Pagamento",
  total_pymnt: "Total Pago",
  total_rec_prncp: "Principal Recebido",
  out_prncp: "Principal Pendente",
  funded_amnt: "Valor Financiado",
  installment: "Parcela",
  settlement_status_unknown: "Status de Acordo Desconhecido",
  settlement_status_ACTIVE: "Acordo Ativo",
  settlement_status_COMPLETE: "Acordo Concluído",
  hardship_flag_Y: "Flag de Dificuldade",
  disbursement_method_DirectPay: "Pagamento Direto",
  initial_list_status_w: "Status Inicial W",
  application_type_Joint: "Aplicação Conjunta",
  application_type_INDIVIDUAL: "Aplicação Individual",
  verification_status_Source_Verified: "Renda Verificada pela Fonte",
  verification_status_Verified: "Renda Verificada",
  pymnt_plan_y: "Plano de Pagamento",
};

export default function ResultCard({ result, inputData }) {
  const [explanation, setExplanation] = useState(null);
  const [loadingExp, setLoadingExp] = useState(false);

  useEffect(() => {
    if (!result || !inputData) return;

    setLoadingExp(true);
    setExplanation(null);

    const payload = {
      loan_amnt: inputData.loan_amnt,
      int_rate: inputData.int_rate,
      annual_inc: inputData.annual_inc,
      dti: inputData.dti,
      delinq_2yrs: inputData.delinq_2yrs,
      fico_range_low: inputData.fico_range_low,
      open_acc: inputData.open_acc,
      pub_rec: inputData.pub_rec,
      revol_bal: inputData.revol_bal,
      revol_util: inputData.revol_util,
      total_acc: inputData.total_acc,
      mort_acc: inputData.mort_acc,
      pub_rec_bankruptcies: inputData.pub_rec_bankruptcies,
    };

    axios
      .post("http://localhost:8000/explain", payload)
      .then((r) => setExplanation(r.data.top_features))
      .catch(() => setExplanation(null))
      .finally(() => setLoadingExp(false));
  }, [result, inputData]);

  if (!result) {
    return (
      <div className="bg-white/[0.02] border border-white/8 p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border border-white/10 flex items-center justify-center mb-4">
          <span className="text-2xl text-white/10">?</span>
        </div>
        <p className="text-xs text-white/20 tracking-widest uppercase">Aguardando análise</p>
        <p className="text-[10px] text-white/10 mt-2 text-center">
          Preencha os dados e clique em Analisar Risco
        </p>
      </div>
    );
  }

  const isDefault = result.prediction === 1;
  const pct = Math.round(result.default_probability * 100);

  const color = isDefault
    ? { text: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10", bar: "bg-red-400" }
    : { text: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/10", bar: "bg-emerald-400" };

  const riskLevel = pct >= 70 ? "ALTO" : pct >= 40 ? "MÉDIO" : "BAIXO";

  const maxAbs = explanation
    ? Math.max(...explanation.map((f) => Math.abs(f.importance)))
    : 1;

  return (
    <div className={`border p-6 flex flex-col gap-6 ${color.border} ${color.bg}`}>
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs tracking-widest uppercase text-white/60">— Resultado</h2>
        <span className={`text-[10px] tracking-widest uppercase px-2 py-1 border ${color.border} ${color.text}`}>
          RISCO {riskLevel}
        </span>
      </div>

      {/* label grande */}
      <div className="text-center py-4">
        <p className="text-[10px] text-white/30 tracking-widest uppercase mb-2">Classificação</p>
        <p className={`text-4xl font-bold tracking-tight ${color.text}`}>{result.label}</p>
        <p className="text-[10px] text-white/20 mt-2 tracking-widest">prediction = {result.prediction}</p>
      </div>

      {/* barra de probabilidade */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-[10px] text-white/40 tracking-widest uppercase">
            Probabilidade de Inadimplência
          </span>
          <span className={`text-sm font-bold ${color.text}`}>{pct}%</span>
        </div>
        <div className="h-2 bg-white/5 w-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${color.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* zonas de risco */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Baixo", range: "0–39%", active: pct < 40 },
          { label: "Médio", range: "40–69%", active: pct >= 40 && pct < 70 },
          { label: "Alto", range: "70–100%", active: pct >= 70 },
        ].map((zone) => (
          <div
            key={zone.label}
            className={`p-3 border transition-all ${
              zone.active
                ? `${color.border} ${color.bg} ${color.text}`
                : "border-white/5 text-white/20"
            }`}
          >
            <p className="text-xs font-bold">{zone.label}</p>
            <p className="text-[10px] mt-1 opacity-60">{zone.range}</p>
          </div>
        ))}
      </div>

      {/* explicabilidade SHAP */}
      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] text-white/40 tracking-widest uppercase">
            — Por que este resultado?
          </p>
          <span className="text-[9px] text-white/20 tracking-widest">via SHAP</span>
        </div>

        {loadingExp && (
          <p className="text-[10px] text-white/20 tracking-widest animate-pulse">
            Calculando valores SHAP...
          </p>
        )}

        {!loadingExp && explanation && (
          <div className="space-y-4">
            {explanation.map((f, i) => {
              const isPositive = f.direction === "aumenta";
              const barPct = Math.round((Math.abs(f.importance) / maxAbs) * 100);
              const barColor = isPositive ? "bg-red-400" : "bg-emerald-400";
              const dirColor = isPositive ? "text-red-400" : "text-emerald-400";
              const dirLabel = isPositive ? "↑ aumenta risco" : "↓ reduz risco";

              return (
                <div key={f.feature}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-white/60">
                     {i + 1}.{" "}
                     {FEATURE_LABELS[f.feature] ??
                         f.feature.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] tracking-widest ${dirColor}`}>
                        {dirLabel}
                      </span>
                      <span className="text-[10px] text-white/30">
                        val: <span className="text-white/50">{f.value}</span>
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 w-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${barColor} opacity-80`}
                      style={{ width: `${barPct}%`, transitionDelay: `${i * 80}ms` }}
                    />
                  </div>
                  <p className="text-[9px] text-white/20 mt-0.5">
                    SHAP: {f.importance > 0 ? "+" : ""}{f.importance}
                  </p>
                </div>
              );
            })}

            <p className="text-[9px] text-white/15 pt-2 border-t border-white/5">
              Barras vermelhas aumentam o risco · Barras verdes reduzem o risco
            </p>
          </div>
        )}

        {!loadingExp && !explanation && (
          <p className="text-[10px] text-red-400/50 tracking-widest">
            Não foi possível carregar a explicação
          </p>
        )}
      </div>

      {/* raw */}
      <div className="border-t border-white/5 pt-3">
        <p className="text-[10px] text-white/20 tracking-widest text-center">
          default_probability = {result.default_probability}
        </p>
      </div>
    </div>
  );
}