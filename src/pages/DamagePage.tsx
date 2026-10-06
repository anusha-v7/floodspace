import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowRight,
  Building2,
  CheckCircle2,
  Download,
  Filter,
  Globe2,
  Layers,
  Radio,
  Satellite,
  Search,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { SplitImageryViewer } from '../components/SplitImageryViewer';
import { DemoBadge } from '../components/DemoBadge';
import { StatusBadge } from '../components/StatusBadge';
import { getDamageSummary } from '../services/damageService';
import { getBeforeAfterPairs, BeforeAfterPair } from '../services/imageryService';
import { CriticalAsset, ImpactStatus } from '../types';

export const DamagePage: React.FC = () => {
  const navigate = useNavigate();
  const { analysisResult, dataModeState, caseConfig, showToast } = useAnalysis();

  const [pairs, setPairs] = useState<BeforeAfterPair[]>([]);
  const [activePairIdx, setActivePairIdx] = useState<number>(0);
  const [assets, setAssets] = useState<CriticalAsset[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function init() {
      const [imgRes, dmgRes] = await Promise.all([
        getBeforeAfterPairs(),
        getDamageSummary(),
      ]);
      setPairs(imgRes.data);
      setAssets(dmgRes.data.criticalAssets);
    }
    init();
  }, []);

  const isLive = dataModeState.effectiveMode === 'live' && Boolean(analysisResult);

  // Dynamic counts derived from current analysis object (Section 20 requirement)
  const buildingCount = isLive ? analysisResult!.affectedBuildingsCount : 142;
  const roadsKm = isLive ? analysisResult!.severedRoadsKm : 18.4;
  const bridgesCount = isLive ? analysisResult!.compromisedBridgesCount : 4;
  const fusedAreaKm2 = isLive ? analysisResult!.fusedEvidence.statistics.totalFusedAreaKm2 : 42.8;

  const handleExportDamageCsv = () => {
    const headers = 'Asset,Category,Location,Status,RoadAccess,Exposure,Confidence,DamageDescription\n';
    const rows = filteredAssets
      .map(
        (a) =>
          `"${a.name}","${a.category}","${a.locationName}","${a.status}","${a.roadAccess}","${a.floodExposure}","${a.confidence}","${a.damageDescription.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floodtrace_damaged_assets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported damaged infrastructure log (CSV)!');
  };

  const handleExportDamageJson = () => {
    const blob = new Blob([JSON.stringify(filteredAssets, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floodtrace_damaged_assets_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported damaged infrastructure log (JSON)!');
  };

  const filteredAssets = assets.filter((a) => {
    if (filterType !== 'all' && a.category !== filterType) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        a.name.toLowerCase().includes(q) ||
        a.locationName.toLowerCase().includes(q) ||
        a.damageDescription.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const activePair = pairs[activePairIdx];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              DAMAGE ASSESSMENT & CHANGE DETECTION
            </h1>
            {isLive ? (
              <span className="px-2 py-0.5 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono text-[10px] font-bold">
                ● LIVE ANALYSIS ACTIVE
              </span>
            ) : (
              <DemoBadge label="SIMULATED RADAR / OPTICAL" variant="amber" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Multi-temporal change analysis comparing pre-event radar/optical baselines against post-flood acquisitions. Infrastructure exposure is calculated by intersecting building footprints and road graphs with detected debris and inundation extents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportDamageCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Download CSV table of exposed infrastructure"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/cutoff')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors shadow-md"
          >
            <span>Proceed to Cut-Off Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analysis Caveat Panel (Section 20 Requirement) */}
      <div className="p-3.5 bg-slate-900/80 border border-amber-500/40 rounded-lg flex items-start gap-3 text-xs text-amber-200">
        <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-amber-300">Analysis Caveat:</span>{' '}
          Spatial overlap indicates potential impact. It is not equivalent to confirmed structural destruction. Ground truthing and high-resolution drone inspections are required before heavy plant clearance.
        </div>
      </div>

      {/* 4-Step Visual Workflow Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-cyan-400 font-bold">
            01
          </div>
          <div>
            <div className="font-semibold text-slate-200">REMOTE-SENSING EVIDENCE</div>
            <div className="text-[11px] text-slate-400">Baseline S1 & S2 Ingestion</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-cyan-400 font-bold">
            02
          </div>
          <div>
            <div className="font-semibold text-slate-200">CHANGE DETECTION</div>
            <div className="text-[11px] text-slate-400">Log-ratio SAR & NDWI thresholding</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-cyan-400 font-bold">
            03
          </div>
          <div>
            <div className="font-semibold text-slate-200">HISTORICAL OSM OVERLAY</div>
            <div className="text-[11px] text-slate-400">Pre-event footprints & road graph</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded flex items-center gap-3 bg-cyan-950/20">
          <div className="w-7 h-7 rounded bg-cyan-500 text-black flex items-center justify-center font-mono font-bold">
            04
          </div>
          <div>
            <div className="font-semibold text-cyan-200">IMPACT ASSESSMENT</div>
            <div className="text-[11px] text-cyan-400">{buildingCount} structures & {bridgesCount} bridges exposed</div>
          </div>
        </div>
      </div>

      {/* Split-Screen Imagery Viewer */}
      {activePair && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                Interactive Before / After Sensor Comparison
              </h2>
            </div>

            {/* Mission Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded border border-slate-800 text-xs">
              {pairs.map((p, idx) => (
                <button
                  key={p.mission}
                  onClick={() => setActivePairIdx(idx)}
                  className={`px-3 py-1 rounded transition-colors font-mono ${
                    activePairIdx === idx
                      ? 'bg-cyan-500 text-black font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.mission} ({p.mission === 'Sentinel-1' ? 'Radar' : 'Optical'})
                </button>
              ))}
            </div>
          </div>

          <SplitImageryViewer
            preMeta={activePair.preEvent}
            postMeta={activePair.postEvent}
            title={`${activePair.mission} — ${activePair.sensorLabel}`}
            mission={activePair.mission}
          />
        </div>
      )}

      {/* Dynamic Damage Breakdown Categories (Derived from analysis object) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>BUILDINGS</span>
            <span className="text-cyan-400 text-[10px]">OSM + Sentinel</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{buildingCount} Affected</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Derived from intersection of pre-event building footprints with flood/debris mask.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>ROAD NETWORK</span>
            <span className="text-rose-400 text-[10px]">Graph Cuts</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{roadsKm} km Severed</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Road segments intersecting detected inundation or slope scour buffer.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>BRIDGES</span>
            <span className="text-rose-400 text-[10px]">OSM Crossings</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{bridgesCount} Compromised</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Spans intersecting active river surge channel or boulder deposition fans.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TOTAL HAZARD AREA</span>
            <span className="text-cyan-400 text-[10px]">Multi-Sensor</span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{fusedAreaKm2} km²</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Fused Sentinel-1 radar backscatter and Sentinel-2 spectral water change.
          </p>
        </div>
      </div>

      {/* Damage Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Infrastructure Damage & Exposure Log
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Evaluated against pre-event OpenStreetMap baseline and Sentinel change mask
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 p-0.5 bg-slate-850 rounded border border-slate-750">
              <span className="text-[10px] text-slate-400 px-1 font-mono uppercase">Category:</span>
              {['all', 'bridge', 'road', 'hospital', 'school'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterType(cat)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    filterType === cat ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-850 rounded border border-slate-750">
              <span className="text-[10px] text-slate-400 px-1 font-mono uppercase">Status:</span>
              {['all', 'affected', 'potentially_affected', 'unaffected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    filterStatus === st ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleExportDamageJson}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded border border-slate-700 font-mono text-[11px]"
                title="Download JSON structure"
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Asset</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Road Access</th>
                <th className="p-3">Estimated Impact Diagnosis</th>
                <th className="p-3">Confidence</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-slate-200">{asset.name}</div>
                    <div className="text-[11px] text-slate-400">{asset.locationName}</div>
                  </td>
                  <td className="p-3 font-mono capitalize text-slate-400">
                    {asset.category}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={asset.status} type="impact" />
                  </td>
                  <td className="p-3 font-mono uppercase text-[11px]">
                    <span
                      className={
                        asset.roadAccess === 'severed'
                          ? 'text-rose-400 font-bold'
                          : asset.roadAccess === 'restricted'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {asset.roadAccess}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 max-w-md">
                    {asset.damageDescription}
                  </td>
                  <td className="p-3 font-mono">
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-300">
                      {asset.confidence.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/map?asset=${asset.id}`)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                      title="Inspect geometry on tactical map"
                    >
                      <Globe2 className="w-3 h-3 text-cyan-400" />
                      <span>Map</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
