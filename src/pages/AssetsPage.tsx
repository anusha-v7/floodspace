import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Download,
  Filter,
  Globe2,
  Hospital,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  Info,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { DemoBadge } from '../components/DemoBadge';
import { StatusBadge } from '../components/StatusBadge';
import { MapView } from '../components/MapView';
import { getCriticalAssets } from '../services/damageService';
import { CriticalAsset } from '../types';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { analysisResult, dataModeState, showToast } = useAnalysis();

  const [assets, setAssets] = useState<CriticalAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CriticalAsset | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function load() {
      const res = await getCriticalAssets();
      setAssets(res.data);
      if (res.data.length > 0) {
        setSelectedAsset(res.data[0]);
      }
    }
    load();
  }, []);

  const isLive = dataModeState.effectiveMode === 'live' && Boolean(analysisResult);

  const filtered = assets.filter((a) => {
    if (filter === 'critical' && a.priority !== 'critical') return false;
    if (filter === 'high' && a.priority !== 'high' && a.priority !== 'critical') return false;
    if (filter === 'facilities' && (a.category !== 'hospital' && a.category !== 'emergency_facility' && a.category !== 'school')) return false;
    if (filter !== 'all' && filter !== 'critical' && filter !== 'high' && filter !== 'facilities' && a.category !== filter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        a.name.toLowerCase().includes(q) ||
        a.locationName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExportAssetsCsv = () => {
    const headers = 'Asset,Category,Location,Status,RoadAccess,Exposure,Confidence,Priority,Diagnosis\n';
    const rows = filtered
      .map(
        (a) =>
          `"${a.name}","${a.category}","${a.locationName}","${a.status}","${a.roadAccess}","${a.floodExposure}","${a.confidence}","${a.priority}","${a.damageDescription.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floodtrace_critical_assets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported infrastructure inventory (CSV)!');
  };

  const handleExportAssetsJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floodtrace_critical_assets_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported infrastructure inventory (JSON)!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              CRITICAL INFRASTRUCTURE & LIFELINE ASSETS
            </h1>
            {isLive ? (
              <span className="px-2 py-0.5 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono text-[10px] font-bold">
                ● LIVE OSM INFRASTRUCTURE
              </span>
            ) : (
              <DemoBadge label="OPENSTREETMAP OVERLAYS" variant="cyan" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Multi-tier inventory tracking bridges, arterial highways, referral hospitals, and designated disaster response depots across the flood disaster extent.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportAssetsCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportAssetsJson}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>JSON</span>
          </button>

          <button
            onClick={() => navigate('/damage')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
          >
            <span>Damage Change View</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Map & Side Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Critical Assets Distribution</span>
            <span className="font-mono text-cyan-400">Click marker to inspect asset condition</span>
          </div>
          <MapView
            assets={assets}
            selectedAssetId={selectedAsset?.id}
            isLiveMode={isLive}
            onSelectAsset={(a) => setSelectedAsset(a)}
            heightClass="h-[420px] lg:h-[480px]"
          />
        </div>

        {/* Side Detail Inspector Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          {selectedAsset ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Asset Detail Inspector
                </span>
                <StatusBadge status={selectedAsset.status} type="impact" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase text-cyan-400">
                  {selectedAsset.category} · {selectedAsset.locationName}
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-0.5">
                  {selectedAsset.name}
                </h3>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2 text-xs">
                {selectedAsset.capacityOrLength && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Capacity / Span:</span>
                    <span className="font-mono text-slate-200">{selectedAsset.capacityOrLength}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Flood Exposure:</span>
                  <span className="font-mono uppercase font-semibold text-rose-400">
                    {selectedAsset.floodExposure.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Road Ingress Access:</span>
                  <span className="font-mono uppercase font-semibold text-rose-400">
                    {selectedAsset.roadAccess}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">OSM Snapshot Date:</span>
                  <span className="font-mono text-emerald-300">2026-08-25 (Pre-event)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Detection Confidence:</span>
                  <span className="font-mono text-slate-300">{selectedAsset.confidence.toUpperCase()}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">
                    Damage Diagnosis
                  </span>
                  <p className="text-slate-200 leading-relaxed text-xs">
                    {selectedAsset.damageDescription}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-rose-400 block font-semibold">
                    RESPONSE PRIORITY
                  </span>
                  <span className="text-rose-300 font-bold uppercase">{selectedAsset.priority}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Status: Requires Verification
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              Select an asset from the table or map to inspect details.
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
            <button
              onClick={() => navigate('/report')}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded transition-colors"
            >
              Add to Situation Report
            </button>
          </div>
        </div>
      </div>

      {/* Asset Table with Section 21 Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Lifeline Infrastructure Registry</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Filtered inventory of critical bridges, roads, hospitals, and relief compounds
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Search infrastructure by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-0.5 bg-slate-850 rounded border border-slate-750 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'critical', label: 'Critical' },
                { id: 'bridge', label: 'Bridges' },
                { id: 'road', label: 'Roads' },
                { id: 'hospital', label: 'Hospitals' },
                { id: 'facilities', label: 'Facilities' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1 rounded transition-colors ${
                    filter === tab.id ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Flood Exposure</th>
                <th className="p-3">Road Access</th>
                <th className="p-3">Impact Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`cursor-pointer transition-colors ${
                    selectedAsset?.id === asset.id
                      ? 'bg-cyan-950/30 font-medium'
                      : 'hover:bg-slate-850/60'
                  }`}
                >
                  <td className="p-3 font-semibold text-slate-200">{asset.name}</td>
                  <td className="p-3 font-mono capitalize text-slate-400">{asset.category}</td>
                  <td className="p-3 text-slate-300">{asset.locationName}</td>
                  <td className="p-3 font-mono capitalize">
                    <span
                      className={
                        asset.floodExposure === 'inundated' || asset.floodExposure === 'debris_impacted'
                          ? 'text-rose-400 font-bold'
                          : asset.floodExposure === 'threatened'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {asset.floodExposure.replace('_', ' ')}
                    </span>
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
                  <td className="p-3">
                    <StatusBadge status={asset.status} type="impact" />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={asset.priority} type="priority" />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/map?asset=${asset.id}`);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                      title="Inspect asset on tactical map"
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
