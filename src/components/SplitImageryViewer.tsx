import React, { useState } from 'react';
import { SatelliteMetadata } from '../types';
import { DemoBadge } from './DemoBadge';
import { Radio, Eye, Layers, Sparkles } from 'lucide-react';

interface SplitImageryViewerProps {
  preMeta: SatelliteMetadata;
  postMeta: SatelliteMetadata;
  title: string;
  mission: 'Sentinel-1' | 'Sentinel-2';
}

export const SplitImageryViewer: React.FC<SplitImageryViewerProps> = ({
  preMeta,
  postMeta,
  title,
  mission,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [activeLayer, setActiveLayer] = useState<'split' | 'pre' | 'post'>('split');

  const isSAR = mission === 'Sentinel-1';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Top Header & Metadata Banner */}
      <div className="p-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 text-sm">{title}</span>
            <DemoBadge label="Synthetic Orbital Composite" variant="slate" />
          </div>
          <div className="text-xs text-slate-400">
            {isSAR
              ? 'C-Band Synthetic Aperture Radar (SAR) — Cloud-penetrating specular backscatter analysis'
              : 'Multispectral Instrument (MSI) — 10m VNIR/SWIR water absorption bands'}
          </div>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-850 rounded border border-slate-750 text-xs">
          <button
            onClick={() => { setActiveLayer('split'); setSliderPos(50); }}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeLayer === 'split' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Split Swipe (50%)
          </button>
          <button
            onClick={() => { setActiveLayer('pre'); setSliderPos(100); }}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeLayer === 'pre' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pre-Event Only
          </button>
          <button
            onClick={() => { setActiveLayer('post'); setSliderPos(0); }}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeLayer === 'post' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Post-Event Only
          </button>
        </div>
      </div>

      {/* Synthetic Imagery Canvas Stage */}
      <div className="relative h-[340px] md:h-[400px] w-full bg-slate-950 overflow-hidden select-none">
        {/* Post-Event Layer (Underneath or Right side) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Stylized Synthetic False-Color Graphic representing Post-Event */}
          <div
            className={`w-full h-full relative ${
              isSAR
                ? 'bg-gradient-to-br from-zinc-900 via-neutral-800 to-stone-900'
                : 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900'
            }`}
          >
            {/* Topographic elevation lines and river corridor */}
            <svg className="w-full h-full opacity-60" viewBox="0 0 800 500" preserveAspectRatio="none">
              {/* Contour lines */}
              <path d="M0,100 Q400,120 800,90" fill="none" stroke={isSAR ? '#52525b' : '#065f46'} strokeWidth="1" strokeDasharray="3,3" />
              <path d="M0,200 Q400,230 800,180" fill="none" stroke={isSAR ? '#52525b' : '#065f46'} strokeWidth="1" strokeDasharray="3,3" />
              <path d="M0,320 Q400,340 800,310" fill="none" stroke={isSAR ? '#52525b' : '#065f46'} strokeWidth="1" strokeDasharray="3,3" />
              
              {/* Post-Event Swollen Flood Channel (Surging Flood Inundation) */}
              <path
                d="M100,0 C150,150 250,220 380,260 C520,310 650,420 720,500"
                fill="none"
                stroke={isSAR ? '#0369a1' : '#0284c7'}
                strokeWidth={isSAR ? '68' : '76'}
                strokeLinecap="round"
                opacity="0.85"
              />
              {/* Debris / Scour Fan deposit */}
              <path
                d="M320,180 Q390,260 480,270 Q420,310 320,180"
                fill={isSAR ? '#d97706' : '#b45309'}
                opacity="0.75"
              />
              {/* Damaged Bridge Marker */}
              <circle cx="380" cy="260" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Post-Event Overlay Label */}
            <div className="absolute top-4 right-4 bg-rose-950/90 border border-rose-500/50 rounded px-2.5 py-1 text-xs font-mono text-rose-300 shadow-lg">
              POST-EVENT: {postMeta.acquisitionDate}
            </div>
            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-rose-300">
              ● Severe Surge & Inundation Detected
            </div>
          </div>
        </div>

        {/* Pre-Event Layer (Clipped to slider width) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-cyan-400 shadow-2xl transition-all"
          style={{ width: `${sliderPos}%` }}
        >
          <div
            className={`w-[800px] h-full absolute top-0 left-0 ${
              isSAR
                ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-neutral-900'
                : 'bg-gradient-to-br from-green-950 via-emerald-950 to-slate-950'
            }`}
            style={{ width: '100%', minWidth: '600px' }}
          >
            <svg className="w-full h-full opacity-60" viewBox="0 0 800 500" preserveAspectRatio="none">
              <path d="M0,100 Q400,120 800,90" fill="none" stroke={isSAR ? '#52525b' : '#065f46'} strokeWidth="1" strokeDasharray="3,3" />
              <path d="M0,200 Q400,230 800,180" fill="none" stroke={isSAR ? '#52525b' : '#065f46'} strokeWidth="1" strokeDasharray="3,3" />
              <path d="M0,320 Q400,340 800,310" fill="none" stroke={isSAR ? '#52525b' : '#065f46'} strokeWidth="1" strokeDasharray="3,3" />

              {/* Pre-Event Normal Lean Trishuli River Stream */}
              <path
                d="M100,0 C150,150 250,220 380,260 C520,310 650,420 720,500"
                fill="none"
                stroke={isSAR ? '#0284c7' : '#0369a1'}
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Intact Bridge Marker */}
              <circle cx="380" cy="260" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            </svg>

            <div className="absolute top-4 left-4 bg-slate-900/90 border border-cyan-500/50 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 shadow-lg">
              PRE-EVENT: {preMeta.acquisitionDate}
            </div>
            <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-emerald-300">
              ● Baseline Lean Flow & Intact Infrastructure
            </div>
          </div>
        </div>

        {/* Interactive Slider Thumb */}
        {activeLayer === 'split' && (
          <div
            className="absolute top-0 bottom-0 z-20 flex items-center justify-center cursor-ew-resize -ml-3"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-6 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg border border-white font-mono text-xs font-bold">
              ⟷
            </div>
          </div>
        )}

        {/* Range Input for Dragging */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => {
            setSliderPos(Number(e.target.value));
            setActiveLayer('split');
          }}
          className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
          aria-label="Swipe before and after imagery"
        />
      </div>

      {/* Technical Metadata Table */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Mission / Sensor</span>
            <span className="font-mono text-slate-200">{preMeta.mission}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Sensor Type</span>
            <span className="font-mono text-slate-200 truncate block">{preMeta.sensorType}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Orbit / Track</span>
            <span className="font-mono text-slate-200">{preMeta.orbitTrack}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Spatial Resolution</span>
            <span className="font-mono text-cyan-400">{preMeta.resolution}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Bands / Polarization</span>
            <span className="font-mono text-slate-200 truncate block">{postMeta.polarizationOrBands}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Processing Level</span>
            <span className="font-mono text-amber-400 truncate block">{postMeta.processingLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
