import React from 'react';
import { Radio, Database, ShieldAlert, Cpu } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

export const DataModeToggle: React.FC = () => {
  const { dataModeState, setDataMode } = useAnalysis();

  return (
    <div className="flex items-center gap-2">
      {/* Segmented Mode Selector */}
      <div className="flex items-center p-0.5 bg-slate-900 border border-slate-750 rounded text-[11px] font-mono">
        <button
          onClick={() => setDataMode('auto')}
          className={`px-2 py-0.5 rounded transition-colors ${
            dataModeState.mode === 'auto'
              ? 'bg-cyan-500 text-black font-semibold shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Auto: Use live data when available, fall back to demo dataset gracefully"
        >
          AUTO
        </button>

        <button
          onClick={() => setDataMode('live')}
          className={`px-2 py-0.5 rounded transition-colors ${
            dataModeState.mode === 'live'
              ? 'bg-emerald-500 text-black font-semibold shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Live: Ingest real orbital CDSE and ohsome OSM data; show real errors if blocked"
        >
          LIVE
        </button>

        <button
          onClick={() => setDataMode('demo')}
          className={`px-2 py-0.5 rounded transition-colors ${
            dataModeState.mode === 'demo'
              ? 'bg-amber-500 text-black font-semibold shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Demo: Use verified Trishuli case study simulated prototype dataset"
        >
          DEMO
        </button>
      </div>

      {/* Persistent Visual Status Badge */}
      <div
        className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border flex items-center gap-1.5 whitespace-nowrap ${
          dataModeState.effectiveMode === 'live'
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
            : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dataModeState.effectiveMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        />
        <span>{dataModeState.effectiveMode === 'live' ? 'LIVE SATELLITE DATA' : 'DEMO DATA'}</span>
      </div>
    </div>
  );
};
