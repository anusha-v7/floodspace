import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  Download,
  Globe2,
  HeartPulse,
  MapPin,
  Route,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  Info,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { MapView } from '../components/MapView';
import { DemoBadge } from '../components/DemoBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  getSettlements,
  getRoadSegments,
  analyzeSettlementConnectivity,
  ConnectivityAnalysisResult,
} from '../services/connectivityService';
import { getCriticalAssets } from '../services/damageService';
import { CriticalAsset, RoadSegment, Settlement } from '../types';

export const CutoffPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { analysisResult, dataModeState, showToast } = useAnalysis();

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [assets, setAssets] = useState<CriticalAsset[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [analysisResultState, setAnalysisResultState] = useState<ConnectivityAnalysisResult | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'cut_off' | 'partially_connected'>('cut_off');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aerialBypassSimulated, setAerialBypassSimulated] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      const [setRes, roadRes, astRes] = await Promise.all([
        getSettlements(),
        getRoadSegments(),
        getCriticalAssets(),
      ]);
      setSettlements(setRes.data);
      setRoads(roadRes.data);
      setAssets(astRes.data);

      const requestedId = searchParams.get('settlement');
      let target = setRes.data.find((s) => s.id === requestedId);
      if (!target) {
        target = setRes.data.find((s) => s.connectivityStatus === 'cut_off') || setRes.data[0];
      }
      setSelectedSettlement(target);
      if (target) {
        const result = await analyzeSettlementConnectivity(target.id);
        setAnalysisResultState(result.data);
      }
    }
    loadData();
  }, [searchParams]);

  const handleSelectSettlement = async (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    const result = await analyzeSettlementConnectivity(settlement.id);
    setAnalysisResultState(result.data);
  };

  const isLive = dataModeState.effectiveMode === 'live' && Boolean(analysisResult);

  // Selected route geometry if connected
  const selectedPath = selectedSettlement
    ? analysisResult?.connectivityResults?.find((c) => c.settlementId === selectedSettlement.id)?.pathGeometry
    : undefined;

  const cutOffCount = isLive
    ? analysisResult!.cutOffSettlementsCount
    : settlements.filter((s) => s.connectivityStatus === 'cut_off').length;

  const handleExportCutoffCsv = () => {
    const headers = 'Settlement,District,NepaliName,PopEstimate,Connectivity,NearestHospital,DistanceKm,Priority,RoadStatus,Action\n';
    const rows = filteredSettlements
      .map(
        (s) =>
          `"${s.name}","${s.district}","${s.nepaliName || ''}",${s.populationEstimate},"${s.connectivityStatus}","${s.nearestHospital}",${s.distanceToHospitalKm},"${s.priority}","${s.roadAccessStatus.replace(/"/g, '""')}","${s.recommendedAction.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floodtrace_cutoff_dispatch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported cut-off settlement triage dispatch list (CSV)!');
  };

  const filteredSettlements = settlements.filter((s) => {
    if (filterMode !== 'all' && s.connectivityStatus !== filterMode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        (s.nepaliName && s.nepaliName.includes(q)) ||
        s.district.toLowerCase().includes(q) ||
        s.nearestHospital.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              WHO IS CUT OFF? — ROAD NETWORK CONNECTIVITY ANALYSIS
            </h1>
            {isLive ? (
              <span className="px-2 py-0.5 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono text-[10px] font-bold">
                ● LIVE GRAPH TRAVERSAL
              </span>
            ) : (
              <DemoBadge label="GRAPH REACHABILITY ENGINE" variant="amber" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            By overlaying OpenStreetMap vehicular road segments onto flooded river corridors and landslide deposition zones, the network analysis engine evaluates shortest accessible paths to nearest emergency hospitals and relief staging towns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportCutoffCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Download CSV triage list of cut-off settlements"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Triage CSV</span>
          </button>

          <button
            onClick={() => navigate('/copilot')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <span>Ask Copilot Brief</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Top Connectivity Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-lg space-y-1">
          <div className="text-[11px] font-mono uppercase text-rose-400 font-semibold flex items-center justify-between">
            <span>ISOLATED SETTLEMENTS</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-3xl font-bold font-mono text-rose-400">
            {cutOffCount} <span className="text-sm font-normal text-slate-400">of 12</span>
          </div>
          <div className="text-[11px] text-slate-300">
            Zero passable vehicular routes to town or hospital
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center justify-between">
            <span>ISOLATED POPULATION</span>
            <DemoBadge label="Demo Estimate" variant="slate" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">
            ~6,710
          </div>
          <div className="text-[11px] text-slate-400">
            Residents requiring aerial supply or trail rescue
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
            PRIMARY CUT-OFF REASON
          </div>
          <div className="text-lg font-bold text-slate-200">
            Mailung Bridge & Gorge Fans
          </div>
          <div className="text-[11px] text-slate-400">
            Bailey bridge collapse + 3 slope washouts
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
            RECOMMENDED PROTOCOL
          </div>
          <div className="text-lg font-bold text-cyan-400">
            Aerial Triage & Tactical Drone
          </div>
          <div className="text-[11px] text-slate-400">
            Preposition medicine at Bidur & Dhunche bases
          </div>
        </div>
      </div>

      {/* Main Map + Selected Settlement Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tactical Connectivity Map View</span>
            <span className="font-mono text-cyan-400">Select any settlement to inspect isolation graph</span>
          </div>
          <MapView
            settlements={settlements}
            roads={roads}
            assets={assets}
            selectedSettlementId={selectedSettlement?.id}
            selectedPathGeometry={selectedPath}
            isLiveMode={isLive}
            onSelectSettlement={handleSelectSettlement}
            heightClass="h-[480px] lg:h-[540px]"
          />
        </div>

        {/* Selected Settlement Connectivity Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          {selectedSettlement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-cyan-400" />
                  <span className="text-[11px] font-mono uppercase text-slate-400">
                    Connectivity Graph Node
                  </span>
                </div>
                <StatusBadge status={selectedSettlement.connectivityStatus} type="connectivity" />
              </div>

              <div>
                <div className="text-xs font-mono text-cyan-400">
                  {selectedSettlement.district} District · Elevation {selectedSettlement.elevationM}m ASL
                </div>
                <h3 className="text-2xl font-bold text-slate-100 flex items-baseline gap-2">
                  {selectedSettlement.name}
                  {selectedSettlement.nepaliName && (
                    <span className="text-slate-400 text-base font-normal font-sans">
                      ({selectedSettlement.nepaliName})
                    </span>
                  )}
                </h3>
              </div>

              {/* Status & Graph Metrics */}
              <div className="p-3.5 bg-slate-950 rounded border border-slate-850 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estimated Population:</span>
                  <span className="font-mono font-bold text-slate-200">
                    ~{selectedSettlement.populationEstimate.toLocaleString()}
                    <span className="text-[10px] text-amber-400 ml-1.5 font-normal">[DEMO ESTIMATE]</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pre-Event Connectivity:</span>
                  <span className="font-mono text-emerald-400">Connected via Feeder Link</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Road Connectivity:</span>
                  <span className="font-mono font-bold text-rose-400">
                    {selectedSettlement.connectivityStatus === 'cut_off' ? 'SEVERED (0 Routes)' : 'PARTIAL'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nearest Referral Hospital:</span>
                  <span className="font-mono text-cyan-300">
                    {selectedSettlement.nearestHospital} ({selectedSettlement.distanceToHospitalKm} km)
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 text-rose-300">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                    Severed Route Segments ({selectedSettlement.affectedRoadSegments.length})
                  </span>
                  <span className="font-mono text-xs text-rose-300">
                    {selectedSettlement.affectedRoadSegments.join(', ') || 'None blocked'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {selectedSettlement.roadAccessStatus}
                  </p>
                </div>
              </div>

              {/* Action Directive */}
              <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-rose-300">
                  <span>RESPONSE PRIORITY: {selectedSettlement.priority.toUpperCase()}</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedSettlement.recommendedAction}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select a settlement to inspect graph connectivity.
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate('/settlements')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              View All Settlements Table
            </button>
            <button
              onClick={() => navigate('/report')}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded transition-colors"
            >
              Include in Situation Report
            </button>
          </div>
        </div>
      </div>

      {/* Prioritized Cut-Off Settlements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Settlement Connectivity & Isolation Priority
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Ordered by emergency triage priority and isolation severity
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Search settlements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-850 rounded border border-slate-750 text-xs">
              <button
                onClick={() => setFilterMode('cut_off')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  filterMode === 'cut_off' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cut-Off ({cutOffCount})
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  filterMode === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All (12)
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Settlement</th>
                <th className="p-3">District</th>
                <th className="p-3">Demo Pop.</th>
                <th className="p-3">Connectivity</th>
                <th className="p-3">Nearest Hospital</th>
                <th className="p-3">Road Status Diagnosis</th>
                <th className="p-3">Priority</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredSettlements.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => handleSelectSettlement(s)}
                  className={`cursor-pointer transition-colors ${
                    selectedSettlement?.id === s.id
                      ? 'bg-cyan-950/30 font-medium'
                      : 'hover:bg-slate-850/60'
                  }`}
                >
                  <td className="p-3">
                    <div className="font-semibold text-slate-200">
                      {s.name}{' '}
                      {s.nepaliName && (
                        <span className="text-slate-400 font-normal">({s.nepaliName})</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-slate-400">{s.district}</td>
                  <td className="p-3 font-mono text-slate-200">
                    ~{s.populationEstimate.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={s.connectivityStatus} type="connectivity" />
                  </td>
                  <td className="p-3">
                    <div className="text-slate-200">{s.nearestHospital}</div>
                    <div className="text-[10px] text-slate-400">{s.distanceToHospitalKm} km away</div>
                  </td>
                  <td className="p-3 text-slate-300 max-w-sm truncate">
                    {s.roadAccessStatus}
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
