import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Eye, RotateCcw, Sliders, Route, Globe2 } from 'lucide-react';
import { CriticalAsset, FloodZone, RoadSegment, Settlement } from '../types';

interface MapViewProps {
  zones?: FloodZone[];
  settlements?: Settlement[];
  assets?: CriticalAsset[];
  roads?: RoadSegment[];
  selectedZoneId?: string | null;
  selectedSettlementId?: string | null;
  selectedAssetId?: string | null;
  onSelectZone?: (zone: FloodZone) => void;
  onSelectSettlement?: (settlement: Settlement) => void;
  onSelectAsset?: (asset: CriticalAsset) => void;
  heightClass?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  // Prompt 2 Live analysis extensions
  liveFusedPolygons?: any; // GeoJSON FeatureCollection
  selectedPathGeometry?: [number, number][]; // Line coordinates [lat, lng]
  isLiveMode?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  zones = [],
  settlements = [],
  assets = [],
  roads = [],
  selectedZoneId,
  selectedSettlementId,
  selectedAssetId,
  onSelectZone,
  onSelectSettlement,
  onSelectAsset,
  heightClass = 'h-[540px] md:h-[620px]',
  initialCenter = [28.06, 85.26],
  initialZoom = 11,
  liveFusedPolygons,
  selectedPathGeometry,
  isLiveMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const pathLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer visibility state
  const [showFlood, setShowFlood] = useState(true);
  const [showDebris, setShowDebris] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showSettlements, setShowSettlements] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [showLivePolygons, setShowLivePolygons] = useState(true);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.55);
  const [baseMapType, setBaseMapType] = useState<'dark' | 'satellite'>('satellite');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    const pathGroup = L.layerGroup().addTo(map);

    layerGroupRef.current = layerGroup;
    pathLayerRef.current = pathGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Re-center map when initialCenter or initialZoom changes (e.g. user selects different case preset)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && initialCenter && initialCenter[0] && initialCenter[1]) {
      map.flyTo(initialCenter, initialZoom, { duration: 1.2 });
    }
  }, [initialCenter?.[0], initialCenter?.[1], initialZoom]);

  // Update base tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (baseMapType === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, Maxar, Earthstar Geographics',
        maxZoom: 18,
      }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        opacity: 0.8,
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'CartoDB & OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
    }
  }, [baseMapType]);

  // Render Geospatial Vectors & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Live Fused GeoJSON Polygons (if available)
    if (showLivePolygons && liveFusedPolygons?.features) {
      liveFusedPolygons.features.forEach((feat: any, idx: number) => {
        try {
          const coords = feat.geometry?.coordinates;
          if (!coords || !coords[0]) return;

          // GeoJSON is [lng, lat] -> convert to Leaflet [lat, lng]
          const latLngs = coords[0].map((c: any) => [c[1], c[0]]);

          const poly = L.polygon(latLngs, {
            color: '#38bdf8',
            weight: 2,
            opacity: 0.9,
            fillColor: '#0284c7',
            fillOpacity: layerOpacity,
          });

          poly.bindTooltip(
            `<strong>Live Hazard Evidence</strong><br/>Source: ${feat.properties?.evidenceSource || 'Sentinel-1/2'}`,
            { className: 'bg-slate-900 text-slate-100 border border-slate-700 text-xs px-2 py-1' }
          );

          group.addLayer(poly);
        } catch (e) {
          // ignore polygon format errors
        }
      });
    }

    // 2. Flood & Debris Polygons (Demo/Baseline)
    if (showFlood || showDebris) {
      zones.forEach((zone) => {
        const isSelected = zone.id === selectedZoneId;
        const color = zone.severity === 'extreme' ? '#ef4444' : '#06b6d4';
        const fillColor = zone.debrisAreaKm2 > zone.inundationAreaKm2 ? '#f59e0b' : '#0284c7';

        const polygon = L.polygon(zone.coordinates, {
          color: isSelected ? '#ffffff' : color,
          weight: isSelected ? 3 : 2,
          opacity: 0.9,
          fillColor: fillColor,
          fillOpacity: isSelected ? Math.min(1, layerOpacity + 0.25) : layerOpacity,
          dashArray: isSelected ? '4, 4' : undefined,
        });

        polygon.bindTooltip(
          `<strong>${zone.name}</strong><br/>Area: ${zone.affectedAreaKm2} km² · Conf: ${zone.confidence.toUpperCase()}`,
          { className: 'bg-slate-900 text-slate-100 border border-slate-700 text-xs px-2 py-1' }
        );

        polygon.on('click', () => {
          if (onSelectZone) onSelectZone(zone);
        });

        group.addLayer(polygon);
      });
    }

    // 3. Road Network Polylines
    if (showRoads) {
      roads.forEach((road) => {
        const isSevered = road.status === 'blocked' || road.status === 'washed_out';
        const roadColor = isSevered ? '#f43f5e' : '#10b981';
        const roadWeight = road.type === 'highway' ? 4 : 2.5;

        const polyline = L.polyline(road.coordinates, {
          color: roadColor,
          weight: roadWeight,
          opacity: 0.85,
          dashArray: isSevered ? '6, 6' : undefined,
        });

        polyline.bindTooltip(
          `<strong>${road.name}</strong><br/>Status: ${road.status.toUpperCase()} (${road.lengthKm} km)`,
          { className: 'bg-slate-900 text-slate-100 border border-slate-700 text-xs px-2 py-1' }
        );

        group.addLayer(polyline);
      });
    }

    // 4. Settlements Markers
    if (showSettlements) {
      settlements.forEach((settlement) => {
        const isSelected = settlement.id === selectedSettlementId;
        const isCutOff = settlement.connectivityStatus === 'cut_off';
        const isPartial = settlement.connectivityStatus === 'partially_connected';

        const badgeBg = isCutOff ? 'bg-rose-600' : isPartial ? 'bg-amber-500' : 'bg-emerald-500';
        const ringStyle = isCutOff ? 'ring-4 ring-rose-500/30 animate-pulse' : '';
        const scale = isSelected ? 'scale-125 ring-2 ring-white' : '';

        const customIcon = L.divIcon({
          className: 'custom-settlement-icon',
          html: `
            <div class="relative flex items-center justify-center transition-all ${scale}">
              <div class="w-6 h-6 rounded-full ${badgeBg} ${ringStyle} flex items-center justify-center text-white text-[10px] font-bold shadow-lg border border-white/40">
                ${isCutOff ? '!' : 'S'}
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(settlement.coordinates, { icon: customIcon });

        marker.bindTooltip(
          `<strong>${settlement.name}</strong> (${settlement.connectivityStatus.replace('_', ' ').toUpperCase()})<br/>Nearest Hospital: ${settlement.nearestHospital} (${settlement.distanceToHospitalKm} km)`,
          { className: 'bg-slate-900 text-slate-100 border border-slate-700 text-xs px-2 py-1' }
        );

        marker.on('click', () => {
          if (onSelectSettlement) onSelectSettlement(settlement);
        });

        group.addLayer(marker);
      });
    }

    // 5. Critical Assets (Hospitals, Bridges, Depots)
    if (showAssets) {
      assets.forEach((asset) => {
        const isSelected = asset.id === selectedAssetId;
        const isDamaged = asset.status === 'affected';
        const isHosp = asset.category === 'hospital';
        const isBridge = asset.category === 'bridge';

        const iconBg = isHosp ? 'bg-cyan-600' : isBridge ? (isDamaged ? 'bg-rose-700' : 'bg-slate-700') : 'bg-indigo-600';
        const glyph = isHosp ? '+' : isBridge ? 'B' : 'A';
        const border = isSelected ? 'border-2 border-white scale-125' : 'border border-slate-300';

        const assetIcon = L.divIcon({
          className: 'custom-asset-icon',
          html: `
            <div class="flex items-center justify-center transition-transform ${border}">
              <div class="w-5 h-5 rounded ${iconBg} text-white text-[10px] font-mono flex items-center justify-center font-bold shadow-md">
                ${glyph}
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker(asset.coordinates, { icon: assetIcon });

        marker.bindTooltip(
          `<strong>${asset.name}</strong> [${asset.category.toUpperCase()}]<br/>Status: ${asset.status.replace('_', ' ').toUpperCase()}`,
          { className: 'bg-slate-900 text-slate-100 border border-slate-700 text-xs px-2 py-1' }
        );

        marker.on('click', () => {
          if (onSelectAsset) onSelectAsset(asset);
        });

        group.addLayer(marker);
      });
    }
  }, [
    zones,
    settlements,
    assets,
    roads,
    selectedZoneId,
    selectedSettlementId,
    selectedAssetId,
    showFlood,
    showDebris,
    showRoads,
    showSettlements,
    showAssets,
    showLivePolygons,
    liveFusedPolygons,
    layerOpacity,
  ]);

  // Path Line Visualization for selected settlement route
  useEffect(() => {
    const pathGroup = pathLayerRef.current;
    if (!pathGroup) return;

    pathGroup.clearLayers();

    if (selectedPathGeometry && selectedPathGeometry.length >= 2) {
      const pathLine = L.polyline(selectedPathGeometry, {
        color: '#38bdf8',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
      });
      pathLine.bindTooltip('Passable Route to Nearest Healthcare Hub', {
        className: 'bg-slate-900 text-cyan-300 border border-cyan-500 text-xs px-2 py-1',
      });
      pathGroup.addLayer(pathLine);
    }
  }, [selectedPathGeometry]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(initialCenter, initialZoom);
    }
  };

  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950 ${heightClass}`}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-md shadow-xl text-xs">
        <button
          onClick={() => setBaseMapType(baseMapType === 'satellite' ? 'dark' : 'satellite')}
          className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-750 rounded border border-slate-700/80 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>{baseMapType === 'satellite' ? 'Satellite' : 'Vector Dark'}</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        <button
          onClick={() => setShowFlood(!showFlood)}
          className={`px-2 py-1 font-mono rounded text-[11px] transition-colors border ${
            showFlood
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-850/60 text-slate-500 border-slate-800'
          }`}
        >
          Flood Polygons
        </button>

        <button
          onClick={() => setShowDebris(!showDebris)}
          className={`px-2 py-1 font-mono rounded text-[11px] transition-colors border ${
            showDebris
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              : 'bg-slate-850/60 text-slate-500 border-slate-800'
          }`}
        >
          Debris Fan
        </button>

        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`px-2 py-1 font-mono rounded text-[11px] transition-colors border ${
            showRoads
              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
              : 'bg-slate-850/60 text-slate-500 border-slate-800'
          }`}
        >
          Roads
        </button>

        <button
          onClick={() => setShowSettlements(!showSettlements)}
          className={`px-2 py-1 font-mono rounded text-[11px] transition-colors border ${
            showSettlements
              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
              : 'bg-slate-850/60 text-slate-500 border-slate-800'
          }`}
        >
          Settlements
        </button>

        <button
          onClick={() => setShowAssets(!showAssets)}
          className={`px-2 py-1 font-mono rounded text-[11px] transition-colors border ${
            showAssets
              ? 'bg-teal-950/80 text-teal-300 border-teal-500/40'
              : 'bg-slate-850/60 text-slate-500 border-slate-800'
          }`}
        >
          Assets
        </button>

        {/* Opacity Scrubber */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-slate-400">
          <span>Opacity:</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={layerOpacity}
            onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
            className="w-14 cursor-pointer accent-cyan-400"
          />
        </div>

        <button
          onClick={handleResetView}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors ml-0.5"
          title="Reset Camera Extent"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Tactical Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] p-2.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-md shadow-xl text-[11px] space-y-1.5 max-w-[210px]">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
          <span>Map Legend</span>
          <span className="text-cyan-400">{isLiveMode ? 'LIVE' : 'DEMO'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-cyan-600/80 border border-cyan-400 rounded-xs inline-block" />
          <span className="text-slate-300">Flooded Inundation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-amber-500/80 border border-amber-400 rounded-xs inline-block" />
          <span className="text-slate-300">Debris Torrent / Scour</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-rose-500 inline-block border-t border-dashed border-rose-300" />
          <span className="text-slate-300">Severed / Blocked Road</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-emerald-500 inline-block" />
          <span className="text-slate-300">Passable Road Link</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white inline-block" />
          <span className="text-slate-300">Cut-Off Settlement (!)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-cyan-600 text-[8px] text-white flex items-center justify-center font-bold">
            +
          </span>
          <span className="text-slate-300">Referral Hospital</span>
        </div>
      </div>
    </div>
  );
};
