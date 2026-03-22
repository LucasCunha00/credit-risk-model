import { useState } from "react";
import axios from "axios";

const FIELDS = [
  { key: "loan_amnt", label: "Valor do Empréstimo", placeholder: "15000", suffix: "R$" },
  { key: "int_rate", label: "Taxa de Juros", placeholder: "13.5", suffix: "%" },
  { key: "annual_inc", label: "Renda Anual", placeholder: "65000", suffix: "R$" },
  { key: "dti", label: "DTI (Debt-to-Income)", placeholder: "18.4", suffix: "%" },
  { key: "delinq_2yrs", label: "Inadimplências (2 anos)", placeholder: "0", suffix: "#" },
  { key: "fico_range_low", label: "Score FICO", placeholder: "680", suffix: "pts" },
  { key: "open_acc", label: "Contas Abertas", placeholder: "10", suffix: "#" },
  { key: "pub_rec", label: "Registros Negativos", placeholder: "0", suffix: "#" },
  { key: "revol_bal", label: "Saldo Rotativo", placeholder: "12000", suffix: "R$" },
  { key: "revol_util", label: "Utilização Rotativo", placeholder: "45.0", suffix: "%" },
  { key: "total_acc", label: "Total de Contas", placeholder: "22", suffix: "#" },
  { key: "mort_acc", label: "Contas de Hipoteca", placeholder: "1", suffix: "#" },
  { key: "pub_rec_bankruptcies", label: "Falências", placeholder: "0", suffix: "#" },
];

const DEFAULTS = {
  loan_amnt: 15000, int_rate: 13.5, annual_inc: 65000, dti: 18.4,
  delinq_2yrs: 0, fico_range_low: 680, open_acc: 10, pub_rec: 0,
  revol_bal: 12000, revol_util: 45.0, total_acc: 22, mort_acc: 1,
  pub_rec_bankruptcies: 0,
};

export default function PredictionForm({ onResult }) {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value === "" ? "" : Number(value) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("http://localhost:8000/predict", form);
      onResult(data, form);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Erro ao conectar com a API.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULTS);
    setError(null);
  };

  return (
    <div className="bg-white/[0.02] border border-white/8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs tracking-widest uppercase text-white/60">
          — Dados do Cliente
        </h2>
        <button
          onClick={handleReset}
          className="text-[10px] text-white/30 hover:text-white/60 tracking-widest uppercase transition-colors"
        >
          Resetar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label, placeholder, suffix }) => (
          <div key={key} className="group">
            <label className="block text-[10px] text-white/30 tracking-widest uppercase mb-1">
              {label}
            </label>
            <div className="flex items-center border border-white/10 bg-white/[0.02] group-focus-within:border-emerald-400/40 transition-colors">
              <input
                type="number"
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent px-3 py-2 text-xs text-white outline-none placeholder-white/15"
              />
              <span className="px-2 text-[10px] text-white/20 border-l border-white/10">
                {suffix}
              </span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-3 border border-red-500/30 bg-red-500/5 text-red-400 text-xs">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-full py-3 bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs tracking-widest uppercase hover:bg-emerald-400/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Analisando..." : "Analisar Risco"}
      </button>
    </div>
  );
}