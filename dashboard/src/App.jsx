import { useState, useEffect } from "react";
import PredictionForm from "./components/PredictionForm";
import ResultCard from "./components/ResultCard";
import HistoryTable from "./components/HistoryTable";
import ModelMetrics from "./components/ModelMetrics";

export default function App() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState("predict");

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then((r) => r.json())
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, []);

  const handleResult = (data, inputData) => {
    setResult(data);
    setHistory((prev) => [
      { ...data, ...inputData, id: Date.now(), ts: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  const tabs = [
    { id: "predict", label: "Predição" },
    { id: "history", label: `Histórico (${history.length})` },
    { id: "metrics", label: "Modelo" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-mono">
      {/* grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,180,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,180,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* header */}
      <header className="relative border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center">
            <span className="text-emerald-400 text-xs">₿</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-white uppercase">
              Credit Risk
            </h1>
            <p className="text-[10px] text-white/30 tracking-widest">PREDICTION SYSTEM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${metrics ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-[11px] text-white/40 tracking-wider">
            {metrics ? "API ONLINE" : "API OFFLINE"}
          </span>
        </div>
      </header>

      {/* tabs */}
      <div className="relative px-8 pt-6 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 text-xs tracking-widest uppercase transition-all ${
              activeTab === t.id
                ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                : "text-white/30 hover:text-white/60 border border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* content */}
      <main className="relative px-8 py-6">
        {activeTab === "predict" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PredictionForm onResult={handleResult} />
            <ResultCard result={result} inputData={history[0]} />
          </div>
        )}
        {activeTab === "history" && <HistoryTable history={history} />}
        {activeTab === "metrics" && <ModelMetrics metrics={metrics} history={history} />}
      </main>
    </div>
  );
}