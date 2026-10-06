import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Download,
  Filter,
  Globe2,
  MapPin,
  Printer,
  Route,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { DemoBadge } from '../components/DemoBadge';
import { StatusBadge } from '../components/StatusBadge';
import { getSettlements } from '../services/connectivityService';
import { Settlement } from '../types';

export const SettlementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { analysisResult, dataModeState, showToast } = useAnalysis();

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [filter, setFilter] = useState<'all' | 'cut_off' | 'partially_connected' | 'connected'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function load() {
      const res = await getSettlements();
      setSettlements(res.data);
    }
    load();
  }, []);

  const isLive = dataModeState.effectiveMode === 'live' && Boolean(analysisResult);

  const filtered = settlements.filter((s) => {
    if (filter !== 'all' && s.connectivityStatus !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        (s.nepaliName && s.nepaliName.includes(q)) ||
        s.district.toLowerCase().includes(q) ||
        s.nearestHospital.toLowerCase().includes(q) ||
        s.nearestTown.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = 'Settlement,District,Elevation(m),PopEstimate,Connectivity,NearestTown,DistTown(km),NearestHospital,DistHospital(km),Priority,RoadStatus\n';
    const rows = filtered
      .map(
        (s) =>
          `"${s.name}","${s.district}",${s.elevationM},${s.populationEstimate},"${s.connectivityStatus}","${s.nearestTown}",${s.distanceToTownKm},"${s.nearestHospital}",${s.distanceToHospitalKm},"${s.priority}","${s.roadAccessStatus.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floodtrace_settlements_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported settlements directory (CSV)!');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floodtrace_settlements_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported settlements directory (JSON)!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              MONITORED SETTLEMENTS & POPULATION ISOLATION
            </h1>
            {isLive ? (
              <span className="px-2 py-0.5 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono text-[10px] font-bold">
                ● LIVE OSM SETTLEMENTS
              </span>
            ) : (
              <DemoBadge label="POPULATION & ACCESS ESTIMATES" variant="amber" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Corridor-wide directory of human settlements across Nuwakot and Rasuwa districts within the Trishuli River basin. Evaluates exposure to active flash flood inundation and road network cut-offs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>JSON</span>
          </button>

          <button
            onClick={() => navigate('/cutoff')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
          >
            <span>Open Cut-Off Graph</span>
            <Route className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mandatory Callout */}
      <div className="p-3.5 bg-slate-900/60 border border-cyan-500/30 rounded-lg text-xs text-slate-300 flex items-start gap-3">
        <Compass className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-cyan-300">Data Integrity Notice:</span>{' '}
          Connectivity results are derived from the application&apos;s geospatial analysis pipeline. {isLive ? 'Currently running on live historical OSM graph analysis.' : 'Demo results shown until live road-network processing is executed.'}
        </div>
      </div>

      {/* Settlements Table & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Monitored Settlements in Active Extent ({filtered.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Click any settlement to inspect detailed isolation diagnostics
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Search village, hospital, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-850 rounded border border-slate-750 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  filter === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                All (12)
              </button>
              <button
                onClick={() => setFilter('cut_off')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  filter === 'cut_off' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cut Off (7)
              </button>
              <button
                onClick={() => setFilter('partially_connected')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  filter === 'partially_connected' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Partial (2)
              </button>
              <button
                onClick={() => setFilter('connected')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  filter === 'connected' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Connected (3)
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Settlement</th>
                <th className="p-3">Flood Exposure</th>
                <th className="p-3">Road Connectivity</th>
                <th className="p-3">Nearest Hospital</th>
                <th className="p-3">Nearest Town</th>
                <th className="p-3">Est. Pop. [DEMO]</th>
                <th className="p-3">Triage Priority</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => navigate(`/cutoff?settlement=${s.id}`)}
                  className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                >
                  <td className="p-3">
                    <div className="font-semibold text-slate-200">
                      {s.name}{' '}
                      {s.nepaliName && (
                        <span className="text-slate-400 font-normal">({s.nepaliName})</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {s.district} · {s.elevationM}m elevation
                    </div>
                  </td>
                  <td className="p-3 font-mono capitalize">
                    <span
                      className={
                        s.floodExposure === 'direct'
                          ? 'text-rose-400 font-bold'
                          : s.floodExposure === 'perimeter'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }
                    >
                      {s.floodExposure.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={s.connectivityStatus} type="connectivity" />
                  </td>
                  <td className="p-3">
                    <div className="text-slate-200">{s.nearestHospital}</div>
                    <div className="text-[10px] text-slate-400">{s.distanceToHospitalKm} km</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-200">{s.nearestTown}</div>
                    <div className="text-[10px] text-slate-400">{s.distanceToTownKm} km</div>
                  </td>
                  <td className="p-3 font-mono text-slate-200">
                    ~{s.populationEstimate.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={s.priority} type="priority" />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/map?settlement=${s.id}`);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                      title="Inspect node on full tactical map"
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
