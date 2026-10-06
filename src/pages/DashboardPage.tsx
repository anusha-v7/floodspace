import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  Compass,
  ExternalLink,
  Flame,
  Globe2,
  Hospital,
  MapPin,
  RefreshCw,
  Route,
  ShieldAlert,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { CURRENT_CASE_STUDY, VERIFIED_SYSTEM_FACTS } from '../data/mockData';
import { KpiCard } from '../components/KpiCard';
import { DemoBadge } from '../components/DemoBadge';
import { StatusBadge } from '../components/StatusBadge';
import { MapView } from '../components/MapView';
import { DataQualityCard } from '../components/DataQualityCard';
import { getDamageSummary } from '../services/damageService';
import { getSettlements, getRoadSegments } from '../services/connectivityService';
import { FloodZone, RoadSegment, Settlement } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { caseConfig, dataModeState, analysisResult, isAnalyzing, runAnalysis } = useAnalysis();

  const [loading, setLoading] = useState<boolean>(true);
  const [zones, setZones] = useState<FloodZone[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [damageRes, setRes, roadRes] = await Promise.all([
          getDamageSummary(),
          getSettlements(),
          getRoadSegments(),
        ]);
        setZones(damageRes.data.zones);
        setSettlements(setRes.data);
        setRoads(roadRes.data);
        if (damageRes.data.zones.length > 0) {
          setSelectedZone(damageRes.data.zones[0]);
        }
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isLive = dataModeState.effectiveMode === 'live' && Boolean(analysisResult);

  // Active facts: either from live analysis result or baseline verified facts
  const activeAffectedArea = isLive
    ? analysisResult!.fusedEvidence.statistics.totalFusedAreaKm2
    : VERIFIED_SYSTEM_FACTS.totalAffectedAreaKm2;

  const activeBuildings = isLive
    ? analysisResult!.affectedBuildingsCount
    : VERIFIED_SYSTEM_FACTS.estimatedDamagedBuildings;

  const activeSeveredRoads = isLive
    ? analysisResult!.severedRoadsKm
    : VERIFIED_SYSTEM_FACTS.affectedRoadsKm;

  const activeBridges = isLive
    ? `${analysisResult!.compromisedBridgesCount}/9`
    : `${VERIFIED_SYSTEM_FACTS.affectedBridgesCount}/${VERIFIED_SYSTEM_FACTS.totalBridgesCount}`;

  const activeCutOffCount = isLive
    ? analysisResult!.cutOffSettlementsCount
    : VERIFIED_SYSTEM_FACTS.cutOffSettlementsCount;

  const cutOffSettlements = settlements.filter((s) => s.connectivityStatus === 'cut_off');

  return (
    <div className="space-y-6">
      {/* Incident Case Banner */}
      <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
              ACTIVE CASE STUDY
            </span>
            <span className="text-slate-600">·</span>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase border bg-emerald-950/60 border-emerald-500/50 text-emerald-300 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE SATELLITE & OSM PIPELINE ACTIVE
              </span>
            ) : (
              <DemoBadge label="ANALYSIS READY — DEMO DATA" variant="amber" />
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
            {caseConfig.caseName.toUpperCase()}
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Multi-temporal flood and debris monitoring across the {caseConfig.regionName} ({caseConfig.country}). Combines Sentinel-1 radar change detection, Sentinel-2 spectral indices, and pre-event OpenStreetMap topology.
          </p>
        </div>

        {/* Location, Date & Pipeline Action Box */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono shrink-0">
          <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">EXTENT</span>
              <span className="text-slate-200 font-semibold">{caseConfig.regionName}</span>
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">EVENT DATE</span>
              <span className="text-slate-200 font-semibold">{caseConfig.eventDate}</span>
            </div>
          </div>

          <button
            onClick={() => runAnalysis()}
            disabled={isAnalyzing}
            className="px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-semibold rounded flex items-center gap-2 transition-colors shadow-lg"
            title="Execute 11-stage satellite change & OSM connectivity pipeline"
          >
            <Workflow className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Processing...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* 3-Question Tactical Rapid Triage Bar */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
          TRACK B RAPID TRIAGE:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/map')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded border border-slate-700/80 flex items-center gap-1.5 transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>1. Where Hit (Map)</span>
          </button>
          <button
            onClick={() => navigate('/damage')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded border border-slate-700/80 flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Damaged Assets</span>
          </button>
          <button
            onClick={() => navigate('/cutoff')}
            className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 hover:text-white rounded border border-rose-500/40 flex items-center gap-1.5 transition-colors"
          >
            <Route className="w-3.5 h-3.5 text-rose-400" />
            <span>3. Cut-Off Villages</span>
          </button>
          <button
            onClick={() => navigate('/report')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded border border-slate-700/80 flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official SitRep</span>
          </button>
        </div>
      </div>

      {/* 6 Key Performance Indicator Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          title="Flood & Debris Area"
          value={activeAffectedArea}
          unit="km²"
          subtext={isLive ? 'Fused SAR & Optical mask' : '27.3 km² water · 15.5 km² debris'}
          badgeText={isLive ? 'Live Analysis' : 'Demo S-1 SAR'}
          variant="info"
          onClick={() => navigate('/map')}
        />

        <KpiCard
          title="Damaged Buildings"
          value={activeBuildings}
          unit="structures"
          subtext="OSM footprint overlap"
          badgeText={isLive ? 'Live Intersection' : 'Demo Estimate'}
          variant="warning"
          onClick={() => navigate('/damage')}
        />

        <KpiCard
          title="Roads Severed"
          value={activeSeveredRoads}
          unit="km"
          subtext="Blocked graph segments"
          badgeText={isLive ? 'Live Graph Cut' : 'Graph Analysis'}
          variant="danger"
          onClick={() => navigate('/cutoff')}
        />

        <KpiCard
          title="Bridges Affected"
          value={activeBridges}
          unit="spans"
          subtext="Within flood hazard buffer"
          badgeText={isLive ? 'Live OSM Bridges' : 'Field / SAR'}
          variant="danger"
          onClick={() => navigate('/assets')}
        />

        <KpiCard
          title="Cut-Off Settlements"
          value={activeCutOffCount}
          unit="villages"
          subtext="No road connection to hospital"
          badgeText={isLive ? 'Live Triage' : 'Top Priority'}
          variant="danger"
          onClick={() => navigate('/cutoff')}
        />

        <KpiCard
          title="Referral Hospitals"
          value="3/3"
          unit="intact"
          subtext="Physical structures clear; ingress severed"
          badgeText="Healthcare Status"
          variant="neutral"
          onClick={() => navigate('/assets')}
        />
      </div>

      {/* Main Tactical Map Preview + Situation Snapshot Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Central Map Stage (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                Tactical Geospatial View ({isLive ? 'LIVE SATELLITE LAYERS' : 'DEMO CASE OVERLAY'})
              </h2>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
            >
              <span>Full Interactive Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <MapView
            zones={zones}
            settlements={settlements}
            roads={roads}
            liveFusedPolygons={analysisResult?.fusedEvidence?.polygons}
            isLiveMode={isLive}
            selectedZoneId={selectedZone?.id}
            onSelectZone={(z) => setSelectedZone(z)}
            onSelectSettlement={(s) => navigate(`/cutoff?settlement=${s.id}`)}
            heightClass="h-[460px] md:h-[520px]"
          />
        </div>

        {/* Right Situation Snapshot Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="font-semibold text-slate-100 text-sm">Situation Snapshot</h3>
              </div>
              <StatusBadge status="CRITICAL ESCALATION" type="priority" />
            </div>

            {/* Risk Summary */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Executive Risk Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-850">
                Flash floods have cleaved access routes between Bidur command base and Rasuwa high valleys. Debris torrent over Mailung Khola destroyed the Bailey bridge, isolating upstream populations.
              </p>
            </div>

            {/* Most Affected Area */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Primary Impact Corridor
              </span>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-850 text-xs">
                <div className="font-semibold text-rose-300">
                  {VERIFIED_SYSTEM_FACTS.mostDamagedSector}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  14.6 km² debris torrent · NH09 highway washed out across 6.4 km
                </div>
              </div>
            </div>

            {/* Highest Priority Isolated Settlements */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
                <span>Top Isolated Settlements ({cutOffSettlements.length})</span>
                <span className="text-rose-400">Road Severed</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {cutOffSettlements.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/cutoff?settlement=${s.id}`)}
                    className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {s.name} {s.nepaliName && <span className="text-slate-400 font-normal">({s.nepaliName})</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Pop. ~{s.populationEstimate} · Nearest: {s.nearestHospital}
                      </div>
                    </div>
                    <StatusBadge status={s.priority} type="priority" />
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Damaged Asset Callout */}
            <div className="p-2.5 bg-rose-950/30 border border-rose-500/30 rounded text-xs space-y-1">
              <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Mailung Khola Bailey Bridge (Destroyed)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Key bottleneck: 45m span washed away, preventing vehicle transit to northern valley villages.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() => navigate('/report')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded transition-colors shadow-lg"
            >
              <span>VIEW FULL ANALYSIS & SITUATION REPORT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/copilot')}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded transition-colors border border-slate-700"
            >
              <span>Ask AI Situation Copilot</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics Card (Section 16) */}
      <DataQualityCard report={analysisResult?.dataQuality} />
    </div>
  );
};
