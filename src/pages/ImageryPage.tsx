import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CloudFog,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileCode,
  Layers,
  Radio,
  Satellite,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { DemoBadge } from '../components/DemoBadge';
import { SplitImageryViewer } from '../components/SplitImageryViewer';
import { getBeforeAfterPairs, getSatelliteCatalog, BeforeAfterPair } from '../services/imageryService';
import { SatelliteMetadata } from '../types';

export const ImageryPage: React.FC = () => {
  const { analysisResult, dataModeState, caseConfig, showToast } = useAnalysis();

  const [catalog, setCatalog] = useState<SatelliteMetadata[]>([]);
  const [pairs, setPairs] = useState<BeforeAfterPair[]>([]);
  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const [selectedSceneForStac, setSelectedSceneForStac] = useState<SatelliteMetadata | null>(null);

  useEffect(() => {
    async function load() {
      const [catRes, pairsRes] = await Promise.all([
        getSatelliteCatalog(),
        getBeforeAfterPairs(),
      ]);
      setCatalog(catRes.data);
      setPairs(pairsRes.data);
    }
    load();
  }, []);

  const isLive = dataModeState.effectiveMode === 'live' && Boolean(analysisResult);

  // If live analysis result has Sentinel-1 pair, display live product details
  const liveS1 = analysisResult?.sentinel1Pair;
  const liveS2 = analysisResult?.sentinel2Pair;

  const currentPair = pairs[selectedPairIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              SATELLITE REMOTE SENSING PIPELINE
            </h1>
            {isLive ? (
              <span className="px-2 py-0.5 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono text-[10px] font-bold">
                ● LIVE CDSE SATELLITE DISCOVERY ACTIVE
              </span>
            ) : (
              <DemoBadge label="DEMO CONNECTION — READY FOR API INTEGRATION" variant="cyan" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Multi-sensor orbital acquisition catalog for the Trishuli flood extent. Demonstrates the complementary trade-offs between cloud-penetrating synthetic aperture radar (SAR) and multispectral optical imaging.
          </p>
        </div>
      </div>

      {/* Selected Live Product Highlights (Section 18) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Sentinel-1 Highlight */}
        <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-100">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Sentinel-1 Radar Acquisition</span>
            </div>
            <span className="text-[10px] text-cyan-400 px-2 py-0.5 bg-cyan-950 rounded border border-cyan-500/30">
              {liveS1 ? 'LIVE CDSE PRODUCT' : 'SYNTHETIC IW GRD'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Post-Event Date</span>
              <span className="text-slate-200">
                {liveS1 ? liveS1.after.acquisitionTime.slice(0, 16) : '2026-08-26 18:22 UTC'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Orbit / Direction</span>
              <span className="text-slate-200">
                {liveS1 ? `${liveS1.after.orbit} (${liveS1.after.orbitDirection})` : 'Rel. Orbit 121 (DESC)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Product Type</span>
              <span className="text-slate-200">{liveS1 ? liveS1.after.productType : 'Level-1 GRD (IW Mode)'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Processing Status</span>
              <span className="text-emerald-400">Backscatter RTC Calibrated</span>
            </div>
          </div>
          {liveS1 && (
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Pairing note: {liveS1.pairingReason}
            </div>
          )}
        </div>

        {/* Sentinel-2 Highlight */}
        <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-100">
              <Satellite className="w-4 h-4 text-emerald-400" />
              <span>Sentinel-2 Optical Acquisition</span>
            </div>
            <span className="text-[10px] text-emerald-400 px-2 py-0.5 bg-emerald-950 rounded border border-emerald-500/30">
              {liveS2 ? 'LIVE CDSE PRODUCT' : 'SYNTHETIC MSI L2A'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Post-Event Date</span>
              <span className="text-slate-200">
                {liveS2 ? liveS2.after.acquisitionTime.slice(0, 16) : '2026-08-27 05:14 UTC'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Cloud Cover</span>
              <span className="text-amber-400 font-bold">
                {liveS2 ? `${liveS2.after.cloudCover?.toFixed(1)}%` : '16.8% (Masked)'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Product Type</span>
              <span className="text-slate-200">{liveS2 ? liveS2.after.productType : 'Level-2A BOA Surface'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Spectral Index</span>
              <span className="text-cyan-400">MNDWI Water Extraction</span>
            </div>
          </div>
          {liveS2 && (
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Quality: {liveS2.qualityNotes}
            </div>
          )}
        </div>
      </div>

      {/* Sensor Capabilities Comparison Callout */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
        <h3 className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider mb-2">
          Comparative Sensor Analysis: Sentinel-1 vs Sentinel-2
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-1">
            <span className="font-semibold text-cyan-300 block">Why Radar (Sentinel-1) is Essential:</span>
            <p className="leading-relaxed">
              Himalayan monsoon floods occur precisely under thick cloud cover. Optical satellites are blinded by 80–100% cloud cover for days during catastrophic events. Sentinel-1 microwave signals pass directly through storms, capturing first-responder water polygons within 24 hours of orbit.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-1">
            <span className="font-semibold text-emerald-300 block">Why Optical (Sentinel-2) is Complementary:</span>
            <p className="leading-relaxed">
              Radar backscatter can suffer from layover and radar shadow in steep valleys, or specular reflection from smooth tarmac. Sentinel-2 multispectral reflectance validates muddy sediment plumes vs clean riverbeds and directly discriminates collapsed masonry from saturated clay.
            </p>
          </div>
        </div>
      </div>

      {/* Before / After Pair Interactive Viewer */}
      {currentPair && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
              Multi-Temporal Change Comparison Tool
            </h2>
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded border border-slate-800 text-xs">
              {pairs.map((p, idx) => (
                <button
                  key={p.mission}
                  onClick={() => setSelectedPairIndex(idx)}
                  className={`px-3 py-1 rounded font-mono transition-colors ${
                    selectedPairIndex === idx
                      ? 'bg-cyan-500 text-black font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.mission} Pair
                </button>
              ))}
            </div>
          </div>

          <SplitImageryViewer
            preMeta={currentPair.preEvent}
            postMeta={currentPair.postEvent}
            title={`${currentPair.mission} Pre/Post Calibration Corridor`}
            mission={currentPair.mission}
          />
        </div>
      )}

      {/* Copernicus STAC Search Endpoint Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Copernicus Data Space Ecosystem (CDSE) STAC API</h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            STAC v1.0.0
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Direct geospatial discovery query for multi-temporal radar and optical granules within the active bounding box.
        </p>
        <div className="p-3 bg-slate-950 rounded border border-slate-850 font-mono text-[11px] text-slate-300 flex items-center justify-between gap-3 overflow-x-auto">
          <span className="text-cyan-300 truncate">
            GET https://catalogue.dataspace.copernicus.eu/stac/search?bbox=[{caseConfig.bbox.west},{caseConfig.bbox.south},{caseConfig.bbox.east},{caseConfig.bbox.north}]&datetime={caseConfig.beforeStart}/{caseConfig.afterEnd}&collections=SENTINEL-1,SENTINEL-2
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `https://catalogue.dataspace.copernicus.eu/stac/search?bbox=[${caseConfig.bbox.west},${caseConfig.bbox.south},${caseConfig.bbox.east},${caseConfig.bbox.north}]&datetime=${caseConfig.beforeStart}/${caseConfig.afterEnd}&collections=SENTINEL-1,SENTINEL-2`
              );
              showToast('Copied CDSE STAC search query URL!');
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 shrink-0"
            title="Copy STAC Search Endpoint"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Satellite Ingestion Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Orbital Scene Ingestion Catalog</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Copernicus Open Access Hub & Sentinel API endpoints configured for batch fetching
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any row to inspect raw STAC JSON metadata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Mission</th>
                <th className="p-3">Sensor Type</th>
                <th className="p-3">Phase</th>
                <th className="p-3">Acquisition Date</th>
                <th className="p-3">Orbit / Tile</th>
                <th className="p-3">Resolution</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">STAC Item</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {catalog.map((scene) => (
                <tr
                  key={scene.id}
                  onClick={() => setSelectedSceneForStac(scene)}
                  className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-semibold text-slate-200">{scene.mission}</td>
                  <td className="p-3 text-slate-400">{scene.sensorType}</td>
                  <td className="p-3 font-mono text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        scene.eventPhase === 'post_event'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 font-semibold'
                          : 'bg-slate-800 text-cyan-300 border-slate-700'
                      }`}
                    >
                      {scene.eventPhase === 'post_event' ? 'POST-EVENT' : 'PRE-EVENT'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{scene.acquisitionDate}</td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">{scene.orbitTrack}</td>
                  <td className="p-3 font-mono text-cyan-400">{scene.resolution}</td>
                  <td className="p-3">
                    <span className="text-slate-400 text-[11px] font-mono">{scene.status}</span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSceneForStac(scene);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 rounded text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                    >
                      <FileCode className="w-3 h-3 text-cyan-400" />
                      <span>Inspect JSON</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STAC Metadata Inspector Modal */}
      {selectedSceneForStac && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-750 rounded-lg max-w-2xl w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">STAC Item Metadata — {selectedSceneForStac.mission}</h3>
                  <span className="text-[11px] font-mono text-slate-400">ID: {selectedSceneForStac.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSceneForStac(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs text-cyan-300 space-y-1">
              <pre className="whitespace-pre-wrap leading-relaxed text-[11px]">
                {JSON.stringify(
                  {
                    type: 'Feature',
                    stac_version: '1.0.0',
                    id: selectedSceneForStac.id,
                    collection: selectedSceneForStac.mission === 'Sentinel-1' ? 'SENTINEL-1' : 'SENTINEL-2',
                    geometry: {
                      type: 'Polygon',
                      coordinates: [
                        [
                          [caseConfig.bbox.west, caseConfig.bbox.south],
                          [caseConfig.bbox.east, caseConfig.bbox.south],
                          [caseConfig.bbox.east, caseConfig.bbox.north],
                          [caseConfig.bbox.west, caseConfig.bbox.north],
                          [caseConfig.bbox.west, caseConfig.bbox.south],
                        ],
                      ],
                    },
                    properties: {
                      datetime: `${selectedSceneForStac.acquisitionDate}T00:00:00Z`,
                      mission: selectedSceneForStac.mission,
                      sensor: selectedSceneForStac.sensorType,
                      orbit_track: selectedSceneForStac.orbitTrack,
                      resolution: selectedSceneForStac.resolution,
                      event_phase: selectedSceneForStac.eventPhase,
                      cloud_cover: selectedSceneForStac.cloudCoverPercent ?? 0,
                      processing_level: selectedSceneForStac.mission === 'Sentinel-1' ? 'L1C_GRD' : 'L2A_BOA',
                      provider: 'Copernicus Data Space Ecosystem (CDSE)',
                    },
                    assets: {
                      thumbnail: {
                        href: selectedSceneForStac.thumbnailPlaceholderUrl || '#',
                        type: 'image/png',
                        title: 'Quicklook Composite',
                      },
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedSceneForStac, null, 2));
                  showToast('Copied STAC metadata JSON to clipboard!');
                }}
                className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy STAC JSON</span>
              </button>

              <button
                onClick={() => setSelectedSceneForStac(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
