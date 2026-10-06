import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowRight,
  Compass,
  Download,
  Eye,
  Globe2,
  Layers,
  MapPin,
  Route,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  Sliders,
  Workflow,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { MapView } from '../components/MapView';
import { DemoBadge } from '../components/DemoBadge';
import { StatusBadge } from '../components/StatusBadge';
import { getDamageSummary } from '../services/damageService';
import { getRoadSegments, getSettlements } from '../services/connectivityService';
import { CASE_PRESETS } from '../services/analysis/caseConfigService';
import { CriticalAsset, FloodZone, RoadSegment, Settlement } from '../types';

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { caseConfig, setCaseConfig, dataModeState, analysisResult, isAnalyzing, showToast } = useAnalysis();

  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<FloodZone[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [assets, setAssets] = useState<CriticalAsset[]>([]);
  const [roads, setRoads] = useState<RoadSegment[]>([]);

  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CriticalAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [damageRes, setRes, roadRes] = await Promise.all([
          getDamageSummary(),
          getSettlements(),
          getRoadSegments(),
        ]);
        setZones(damageRes.data.zones);
        setAssets(damageRes.data.criticalAssets);
        setSettlements(setRes.data);
        setRoads(roadRes.data);

        const paramSettlement = searchParams.get('settlement');
        const paramAsset = searchParams.get('asset');
        const paramZone = searchParams.get('zone');

        if (paramSettlement) {
          const found = setRes.data.find((s) => s.id === paramSettlement);
          if (found) {
            setSelectedSettlement(found);
            setSelectedZone(null);
            setSelectedAsset(null);
            return;
          }
        }
        if (paramAsset) {
          const found = damageRes.data.criticalAssets.find((a) => a.id === paramAsset);
          if (found) {
            setSelectedAsset(found);
            setSelectedZone(null);
            setSelectedSettlement(null);
            return;
          }
        }
        if (paramZone) {
          const found = damageRes.data.zones.find((z) => z.id === paramZone);
          if (found) {
            setSelectedZone(found);
            return;
          }
        }
        if (damageRes.data.zones.length > 0) {
          setSelectedZone(damageRes.data.zones[0]);
        }
      } catch (err) {
        console.error('Error loading map data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [searchParams]);

  const handleExportGeoJSON = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      properties: {
        application: 'FLOODTRACE AI',
        case: caseConfig.caseName,
        region: caseConfig.regionName,
        eventDate: caseConfig.eventDate,
        exportedAt: new Date().toISOString(),
      },
      features: [
        ...zones.map((z) => ({
          type: 'Feature',
          properties: {
            id: z.id,
            name: z.name,
            zoneCode: z.zoneCode,
            category: 'flood_debris_zone',
            severity: z.severity,
            affectedAreaKm2: z.affectedAreaKm2,
            inundationAreaKm2: z.inundationAreaKm2,
            debrisAreaKm2: z.debrisAreaKm2,
            confidence: z.confidence,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [z.coordinates.map((c) => [c[1], c[0]])],
          },
        })),
        ...roads.map((r) => ({
          type: 'Feature',
          properties: {
            id: r.id,
            name: r.name,
            category: 'road_segment',
            status: r.status,
            lengthKm: r.lengthKm,
            type: r.type,
          },
          geometry: {
            type: 'LineString',
            coordinates: r.coordinates.map((c) => [c[1], c[0]]),
          },
        })),
        ...settlements.map((s) => ({
          type: 'Feature',
          properties: {
            id: s.id,
            name: s.name,
            nepaliName: s.nepaliName,
            category: 'settlement',
            connectivityStatus: s.connectivityStatus,
            populationEstimate: s.populationEstimate,
            nearestHospital: s.nearestHospital,
            distanceToHospitalKm: s.distanceToHospitalKm,
            priority: s.priority,
          },
          geometry: {
            type: 'Point',
            coordinates: [s.coordinates[1], s.coordinates[0]],
          },
        })),
        ...assets.map((a) => ({
          type: 'Feature',
          properties: {
            id: a.id,
            name: a.name,
            category: a.category,
            status: a.status,
            priority: a.priority,
            roadAccess: a.roadAccess,
          },
          geometry: {
            type: 'Point',
            coordinates: [a.coordinates[1], a.coordinates[0]],
          },
        })),
      ],
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], {
      type: 'application/geo+json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floodtrace_${caseConfig.regionName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_layers.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported tactical GeoJSON layers to file!');
  };

  const handleSelectPreset = (presetId: string) => {
    const p = CASE_PRESETS.find((cp) => cp.id === presetId);
    if (!p) return;
    setCaseConfig({
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
    });
    showToast(`Switched active AOI to ${p.name}`);
  };

  const isLive = dataModeState.effectiveMode === 'live' && Boolean(analysisResult);

  // Selected route geometry if any
  const selectedPathGeometry = selectedSettlement
    ? analysisResult?.connectivityResults?.find((c) => c.settlementId === selectedSettlement.id)?.pathGeometry
    : undefined;

  const handleSelectZone = (zone: FloodZone) => {
    setSelectedZone(zone);
    setSelectedSettlement(null);
    setSelectedAsset(null);
  };

  const handleSelectSettlement = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setSelectedZone(null);
    setSelectedAsset(null);
  };

  const handleSelectAsset = (asset: CriticalAsset) => {
    setSelectedAsset(asset);
    setSelectedZone(null);
    setSelectedSettlement(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Tactical Control Bar (Section 19) */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400 uppercase">CASE:</span>
            <span className="text-slate-200 font-bold">{caseConfig.caseName}</span>
          </div>

          <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400 uppercase">SOURCE:</span>
            <span className={isLive ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
              {isLive ? 'LIVE SATELLITE & OSM' : 'DEMO CASE OVERLAY'}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400 uppercase">LAYER:</span>
            <span className="text-amber-300">
              {isLive ? 'Fused SAR + MNDWI Mask' : 'Pre-calibrated Inundation Polygons'}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-400 uppercase">DATE:</span>
            <span className="text-slate-300">{caseConfig.eventDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGeoJSON}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Download GeoJSON FeatureCollection of all layers"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export GeoJSON</span>
          </button>

          {isLive ? (
            <span className="px-2 py-0.5 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono text-[10px] font-bold">
              ● LIVE MODE ACTIVE
            </span>
          ) : (
            <DemoBadge label="DEMO PROTOCOL" variant="amber" />
          )}
        </div>
      </div>

      {/* AOI Quick Preset Bar & Search Ribbon */}
      <div className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase px-1">AOI Extent Presets:</span>
          {CASE_PRESETS.map((p) => {
            const isCurrent = caseConfig.caseName === p.name;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {p.name.split(' ')[0]} ({p.region.split('&')[0].trim()})
              </button>
            );
          })}
        </div>

        {/* Tactical Search Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search settlement, bridge, zone..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim()) {
                  const matchSet = settlements.find((s) => s.name.toLowerCase().includes(val.toLowerCase()));
                  if (matchSet) {
                    setSelectedSettlement(matchSet);
                    setSelectedZone(null);
                    setSelectedAsset(null);
                    return;
                  }
                  const matchAst = assets.find((a) => a.name.toLowerCase().includes(val.toLowerCase()));
                  if (matchAst) {
                    setSelectedAsset(matchAst);
                    setSelectedZone(null);
                    setSelectedSettlement(null);
                    return;
                  }
                  const matchZ = zones.find((z) => z.name.toLowerCase().includes(val.toLowerCase()) || z.zoneCode.toLowerCase().includes(val.toLowerCase()));
                  if (matchZ) {
                    setSelectedZone(matchZ);
                    setSelectedSettlement(null);
                    setSelectedAsset(null);
                  }
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Main Map + Inspector Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Viewport (8 Cols) */}
        <div className="lg:col-span-8">
          <MapView
            zones={zones}
            settlements={settlements}
            assets={assets}
            roads={roads}
            liveFusedPolygons={analysisResult?.fusedEvidence?.polygons}
            selectedPathGeometry={selectedPathGeometry}
            isLiveMode={isLive}
            selectedZoneId={selectedZone?.id}
            selectedSettlementId={selectedSettlement?.id}
            selectedAssetId={selectedAsset?.id}
            initialCenter={caseConfig.center || [28.06, 85.26]}
            onSelectZone={handleSelectZone}
            onSelectSettlement={handleSelectSettlement}
            onSelectAsset={handleSelectAsset}
            heightClass="h-[600px] lg:h-[720px]"
          />
        </div>

        {/* Side Geospatial Analysis Inspector (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4 overflow-y-auto max-h-[720px]">
          {selectedZone ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded bg-cyan-400" />
                  <span className="text-[11px] font-mono uppercase text-slate-400">
                    Selected Change Zone
                  </span>
                </div>
                <DemoBadge label={isLive ? 'Live Fused Geometry' : 'Polygon Inundation'} variant="cyan" />
              </div>

              <div>
                <div className="text-xs font-mono text-cyan-400">{selectedZone.zoneCode}</div>
                <h3 className="text-lg font-bold text-slate-100">{selectedZone.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <StatusBadge status={selectedZone.severity} type="priority" />
                  <span className="text-slate-400">
                    Confidence: <strong className="text-slate-200">{selectedZone.confidence.toUpperCase()}</strong>
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total Changed Area</span>
                    <span className="text-base font-bold text-cyan-400">{selectedZone.affectedAreaKm2} km²</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Water Inundation</span>
                    <span className="text-sm font-semibold text-blue-400">{selectedZone.inundationAreaKm2} km²</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Debris Deposition</span>
                    <span className="text-sm font-semibold text-amber-400">{selectedZone.debrisAreaKm2} km²</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Sensor Source</span>
                    <span className="text-xs text-slate-300">
                      {isLive ? 'Sentinel-1 + S-2 Fused' : 'S1-SAR / S2 Baseline'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-slate-300 leading-relaxed text-xs">
                  {selectedZone.description}
                </div>
              </div>

              {/* Linked Infrastructure within this zone */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Compromised Infrastructure in Zone
                </span>
                <div className="space-y-1.5 text-xs">
                  {assets
                    .filter(
                      (a) =>
                        (selectedZone.id === 'zone-1' && a.id.includes('brg-2')) ||
                        (selectedZone.id === 'zone-2' && a.id.includes('brg-1')) ||
                        (selectedZone.id === 'zone-3' && a.id.includes('brg-3')) ||
                        (selectedZone.id === 'zone-4' && a.id.includes('brg-4'))
                    )
                    .map((a) => (
                      <div key={a.id} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-200">{a.name}</div>
                          <div className="text-[10px] text-rose-400">{a.damageDescription}</div>
                        </div>
                        <StatusBadge status={a.status} type="impact" />
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => navigate('/damage')}
                  className="w-full py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded transition-colors"
                >
                  Inspect Before / After Imagery for Zone
                </button>
              </div>
            </div>
          ) : selectedSettlement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Selected Settlement Inspector
                </span>
                <StatusBadge status={selectedSettlement.connectivityStatus} type="connectivity" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {selectedSettlement.name}{' '}
                  {selectedSettlement.nepaliName && (
                    <span className="text-slate-400 text-sm font-normal">
                      ({selectedSettlement.nepaliName})
                    </span>
                  )}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  District: {selectedSettlement.district} · Elevation: {selectedSettlement.elevationM}m ASL
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estimated Population:</span>
                  <span className="font-mono font-bold text-slate-100">
                    ~{selectedSettlement.populationEstimate.toLocaleString()} (Demo)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nearest Town:</span>
                  <span className="font-mono text-slate-200">
                    {selectedSettlement.nearestTown} ({selectedSettlement.distanceToTownKm} km)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nearest Hospital:</span>
                  <span className="font-mono text-cyan-300">
                    {selectedSettlement.nearestHospital} ({selectedSettlement.distanceToHospitalKm} km)
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-rose-300">
                  <strong>Access Issue:</strong> {selectedSettlement.roadAccessStatus}
                </div>
              </div>

              <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded text-xs">
                <span className="text-[10px] font-mono text-rose-400 uppercase block font-semibold">
                  Recommended Response Priority: {selectedSettlement.priority.toUpperCase()}
                </span>
                <p className="text-[11px] text-slate-300 mt-1">
                  {selectedSettlement.recommendedAction}
                </p>
              </div>

              <button
                onClick={() => navigate(`/cutoff?settlement=${selectedSettlement.id}`)}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded transition-colors"
              >
                Perform Graph Cut-Off Analysis
              </button>
            </div>
          ) : selectedAsset ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Critical Asset Inspector
                </span>
                <StatusBadge status={selectedAsset.status} type="impact" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">{selectedAsset.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5 font-mono uppercase">
                  Category: {selectedAsset.category} · {selectedAsset.locationName}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Damage Diagnosis</span>
                  <p className="text-slate-200 mt-0.5 leading-relaxed">{selectedAsset.damageDescription}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Road Ingress:</span>
                  <span className="font-mono uppercase font-bold text-rose-400">{selectedAsset.roadAccess}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/assets')}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded transition-colors border border-slate-700"
              >
                View Full Assets Table
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs space-y-2">
              <Compass className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Click on any polygon, settlement marker, or bridge on the map to inspect telemetry details.</p>
            </div>
          )}

          {/* Quick Zone Selector List */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">
              Corridor Hazard Polygons ({zones.length})
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {zones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => handleSelectZone(z)}
                  className={`p-2 rounded text-left text-xs transition-colors border flex items-center justify-between ${
                    selectedZone?.id === z.id
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <span className="truncate">{z.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">{z.affectedAreaKm2} km²</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
