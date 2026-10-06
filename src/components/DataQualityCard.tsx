import React from 'react';
import { AlertTriangle, CheckCircle2, Database, ShieldAlert, Sparkles } from 'lucide-react';
import { DataQualityReport } from '../types';

interface DataQualityCardProps {
  report?: DataQualityReport;
  className?: string;
}

export const DataQualityCard: React.FC<DataQualityCardProps> = ({
  report,
  className = '',
}) => {
  const defaultReport: DataQualityReport = {
    satelliteStatus: 'FOUND',
    sentinel1Status: 'BEFORE & AFTER FOUND (12d Gap · Rel. Orbit 121)',
    sentinel2Status: 'BEFORE & AFTER FOUND (16.8% Cloud · Tile 45RYU)',
    osmStatus: 'PRE-EVENT SNAPSHOT FOUND (Historical 2026-08-25)',
    roadNetworkStatus: 'READY (114.2 km corridor graph)',
    analysisStatus: 'READY',
    warnings: [
      'Optical scene has 16.8% cloud cover; radar backscatter prioritized in canyon bottom.',
      'Ground truth validation against EMSR927 planned for final evaluation.',
    ],
  };

  const q = report || defaultReport;

  return (
    <div className={`p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3 text-xs ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-slate-100 text-xs uppercase tracking-wide">
            Data Quality & Ingestion Diagnostics
          </h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
            q.satelliteStatus === 'FOUND'
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
              : q.satelliteStatus === 'PARTIAL'
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
          }`}
        >
          {q.satelliteStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-[11px]">
        <div className="p-2 bg-slate-950 rounded border border-slate-850">
          <span className="text-[10px] text-slate-400 block uppercase">Sentinel-1 Radar</span>
          <span className="text-slate-200 font-semibold">{q.sentinel1Status}</span>
        </div>

        <div className="p-2 bg-slate-950 rounded border border-slate-850">
          <span className="text-[10px] text-slate-400 block uppercase">Sentinel-2 Optical</span>
          <span className="text-slate-200 font-semibold">{q.sentinel2Status}</span>
        </div>

        <div className="p-2 bg-slate-950 rounded border border-slate-850">
          <span className="text-[10px] text-slate-400 block uppercase">Historical OSM Snapshot</span>
          <span className="text-emerald-300 font-semibold">{q.osmStatus}</span>
        </div>

        <div className="p-2 bg-slate-950 rounded border border-slate-850">
          <span className="text-[10px] text-slate-400 block uppercase">Road Network Topology</span>
          <span className="text-cyan-300 font-semibold">{q.roadNetworkStatus}</span>
        </div>

        <div className="p-2 bg-slate-950 rounded border border-slate-850 sm:col-span-2">
          <span className="text-[10px] text-slate-400 block uppercase">Analysis Readiness</span>
          <span className="text-slate-200 font-semibold">{q.analysisStatus}</span>
        </div>
      </div>

      {q.warnings.length > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-amber-400 uppercase flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3 h-3" />
            Operational Quality Warnings:
          </span>
          <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
            {q.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
