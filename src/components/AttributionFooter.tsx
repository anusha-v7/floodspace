import React from 'react';
import { Database, ShieldAlert, Award } from 'lucide-react';

export const AttributionFooter: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 text-xs text-slate-400 py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-850">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 tracking-wide">FLOODTRACE AI</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] font-mono text-cyan-400">TRACK B — MAPPING FLOOD DAMAGE FROM SPACE</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] font-mono text-amber-450 text-amber-400/90">[DEMO MODE ACTIVE]</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Multimodal AI Hackathon 2026 Submission Prototype
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-slate-400/90">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Copernicus Earth Observation Data</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Contains modified Copernicus Sentinel data 2026. Processed via Sentinel-1 SAR and Sentinel-2 optical bands.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Elevation & Infrastructure Citation</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.
            </p>
            <p className="text-[10px] text-slate-500">
              Infrastructure footprints © OpenStreetMap contributors under ODbL.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Model & Operational Safeguards</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Target Training Benchmark: Kuro Siwo flood dataset (Target integration; not yet trained/evaluated on held-out scenes).
            </p>
            <p className="text-[10px] text-slate-500">
              Prototype emergency decision-support only. Not an operational replacement for certified national civil protection agencies.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
