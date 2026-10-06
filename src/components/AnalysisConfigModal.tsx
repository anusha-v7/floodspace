import React, { useState } from 'react';
import {
  Calendar,
  Compass,
  Globe2,
  MapPin,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import {
  CASE_PRESETS,
  centerRadiusToBbox,
  validateCaseConfiguration,
} from '../services/analysis/caseConfigService';
import { CaseConfiguration } from '../types';

interface AnalysisConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPipeline?: () => void;
}

export const AnalysisConfigModal: React.FC<AnalysisConfigModalProps> = ({
  isOpen,
  onClose,
  onStartPipeline,
}) => {
  const { caseConfig, setCaseConfig, runAnalysis, isAnalyzing } = useAnalysis();

  const [formState, setFormState] = useState<CaseConfiguration>(caseConfig);
  const [activeTab, setActiveTab] = useState<'preset' | 'bbox' | 'radius'>('preset');
  const [centerLat, setCenterLat] = useState<number>(caseConfig.center?.[0] || 28.025);
  const [centerLng, setCenterLng] = useState<number>(caseConfig.center?.[1] || 85.24);
  const [radiusKm, setRadiusKm] = useState<number>(caseConfig.radiusKm || 25);
  const [valErrors, setValErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    const p = CASE_PRESETS.find((cp) => cp.id === presetId);
    if (!p) return;

    const updated: CaseConfiguration = {
      caseName: p.name,
      regionName: p.region,
      country: p.country,
      eventDate: p.eventDate,
      bbox: p.bbox,
      center: [(p.bbox.north + p.bbox.south) / 2, (p.bbox.east + p.bbox.west) / 2],
      radiusKm: 25,
      beforeStart: p.defaultBeforeWindow.start,
      beforeEnd: p.defaultBeforeWindow.end,
      afterStart: p.defaultAfterWindow.start,
      afterEnd: p.defaultAfterWindow.end,
      osmSnapshotDate: p.defaultBeforeWindow.end,
    };

    setFormState(updated);
    setValErrors([]);
  };

  const handleApplyRadius = () => {
    const bbox = centerRadiusToBbox(centerLat, centerLng, radiusKm);
    setFormState((prev) => ({
      ...prev,
      bbox,
      center: [centerLat, centerLng],
      radiusKm,
    }));
  };

  const handleExecute = async () => {
    const check = validateCaseConfiguration(formState);
    if (!check.isValid) {
      setValErrors(check.errors);
      return;
    }

    setValErrors([]);
    setCaseConfig(formState);
    onClose();

    if (onStartPipeline) onStartPipeline();
    await runAnalysis(formState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-lg max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-slate-100 text-base">Analysis Configuration & Extent</h2>
              <p className="text-xs text-slate-400">
                Specify Area of Interest (AOI), event date, and pre/post satellite imagery windows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Errors */}
        {valErrors.length > 0 && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded text-xs space-y-1">
            <div className="font-semibold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Please resolve configuration errors:</span>
            </div>
            <ul className="list-disc list-inside text-rose-300 space-y-0.5 text-[11px]">
              {valErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Case Name & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Case Name</label>
            <input
              type="text"
              value={formState.caseName}
              onChange={(e) => setFormState({ ...formState, caseName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs"
              placeholder="e.g. Trishuli River Corridor Flood"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Disaster Event Date</label>
            <input
              type="date"
              value={formState.eventDate}
              onChange={(e) => setFormState({ ...formState, eventDate: e.target.value })}
              className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs font-mono"
            />
          </div>
        </div>

        {/* Area Specification Mode Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400">Area of Interest (AOI) Definition</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('preset')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'preset' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Named Preset
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bbox')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'bbox' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Bounding Box
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('radius')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'radius' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Center & Radius
              </button>
            </div>
          </div>

          {activeTab === 'preset' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CASE_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`p-3 rounded border text-left transition-colors flex flex-col justify-between ${
                    formState.caseName === p.name
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs leading-snug">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{p.region}</div>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-2">Event: {p.eventDate}</div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'bbox' && (
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div>
                  <label className="text-[10px] uppercase text-slate-400 block">North (Lat)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.bbox.north}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        bbox: { ...formState.bbox, north: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 block">South (Lat)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.bbox.south}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        bbox: { ...formState.bbox, south: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 block">East (Lng)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.bbox.east}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        bbox: { ...formState.bbox, east: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 block">West (Lng)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formState.bbox.west}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        bbox: { ...formState.bbox, west: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'radius' && (
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
                <div>
                  <label className="text-[10px] uppercase text-slate-400 block">Center Lat</label>
                  <input
                    type="number"
                    step="0.01"
                    value={centerLat}
                    onChange={(e) => setCenterLat(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 block">Center Lng</label>
                  <input
                    type="number"
                    step="0.01"
                    value={centerLng}
                    onChange={(e) => setCenterLng(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 block">Radius (km)</label>
                  <input
                    type="number"
                    step="1"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyRadius}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
              >
                Compute Bounding Box from Radius
              </button>
            </div>
          )}
        </div>

        {/* Temporal Windows */}
        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">Satellite Temporal Windows</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Before Window */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
              <span className="font-semibold text-cyan-300 block">Pre-Event Window (Baseline)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Start</span>
                  <input
                    type="date"
                    value={formState.beforeStart}
                    onChange={(e) => setFormState({ ...formState, beforeStart: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">End</span>
                  <input
                    type="date"
                    value={formState.beforeEnd}
                    onChange={(e) => setFormState({ ...formState, beforeEnd: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1 text-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* After Window */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
              <span className="font-semibold text-rose-300 block">Post-Event Window (Flood Surge)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Start</span>
                  <input
                    type="date"
                    value={formState.afterStart}
                    onChange={(e) => setFormState({ ...formState, afterStart: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">End</span>
                  <input
                    type="date"
                    value={formState.afterEnd}
                    onChange={(e) => setFormState({ ...formState, afterEnd: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 rounded p-1 text-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleExecute}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-semibold text-xs rounded transition-colors shadow-lg"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>{isAnalyzing ? 'Executing Pipeline...' : 'Run Satellite & OSM Analysis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
