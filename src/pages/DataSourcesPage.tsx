import React from 'react';
import {
  ArrowDown,
  Award,
  CheckCircle2,
  Database,
  ExternalLink,
  Layers,
  Radio,
  Satellite,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { DemoBadge } from '../components/DemoBadge';

export const DataSourcesPage: React.FC = () => {
  const sources = [
    {
      name: 'Sentinel-1 C-Band SAR',
      provider: 'European Space Agency / Copernicus Programme',
      purpose: 'All-weather, cloud-penetrating synthetic aperture radar backscatter change detection for flood inundation.',
      status: 'DEMO INGESTION PIPELINE READY',
      statusVariant: 'cyan' as const,
      attribution: 'Contains modified Copernicus Sentinel data 2026.',
      futureIntegration: 'Direct STAC API query to CDSE (Copernicus Data Space Ecosystem) in Prompt 2.',
    },
    {
      name: 'Sentinel-2 Multispectral Optical (MSI)',
      provider: 'European Space Agency / Copernicus Programme',
      purpose: 'High-resolution (10m) VNIR/SWIR multispectral surface reflectance for water spectral index (MNDWI/NDWI) and debris discrimination.',
      status: 'DEMO INGESTION PIPELINE READY',
      statusVariant: 'cyan' as const,
      attribution: 'Contains modified Copernicus Sentinel data 2026.',
      futureIntegration: 'S2 BOA L2A cloud-filtered granule fetching via Planetary Computer / CDSE.',
    },
    {
      name: 'Copernicus WorldDEM-30',
      provider: 'DLR e.V. & Airbus Defence and Space GmbH / ESA',
      purpose: 'Global 30m hydro-enforced digital elevation model. Provides slope gradient masks and valley bottom terrain cross-sections.',
      status: 'CACHED BASELINE TILES READY',
      statusVariant: 'slate' as const,
      attribution:
        'Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.',
      futureIntegration: 'DEM slope raster masking using Rasterio / GDAL backend service.',
    },
    {
      name: 'OpenStreetMap (OSM)',
      provider: 'OpenStreetMap Foundation & Contributors',
      purpose: 'Vector road network graph (NH09, feeder roads, tracks), building footprints, and critical bridge/hospital nodes.',
      status: 'PRE-EVENT SNAPSHOT CACHED',
      statusVariant: 'slate' as const,
      attribution: '© OpenStreetMap contributors under Open Database License (ODbL).',
      futureIntegration: 'Overpass API live regional extracts and OSMnx graph ingestion.',
    },
    {
      name: 'Kuro Siwo Benchmark Dataset',
      provider: 'European Space Agency / Research Consortium',
      purpose: 'Approved multi-modal flood benchmark dataset paired with Sentinel SAR/Optical pairs across global flood events.',
      status: 'TARGET INTEGRATION TARGET (NOT YET TRAINED)',
      statusVariant: 'amber' as const,
      attribution: 'Kuro Siwo benchmark dataset citation for multimodal disaster mapping.',
      futureIntegration: 'Model weights fine-tuning for Himalayan river valley topography in Prompt 2/3.',
    },
  ];

  const pipeline = [
    { title: 'Sentinel-1 & Sentinel-2', role: 'Orbital raw Level-1 / Level-2 acquisitions' },
    { title: 'Copernicus WorldDEM-30', role: 'Topographic slope & valley confinement' },
    { title: 'OpenStreetMap Snapshot', role: 'Pre-event road network and building footprints' },
    { title: 'Kuro Siwo Model Target', role: 'Multimodal flood segmentation benchmark' },
    { title: 'SAR & Optical Preprocessing', role: 'Radiometric terrain correction & cloud masking' },
    { title: 'Change Detection & Classification', role: 'Log-ratio SAR & MNDWI flood/debris segmentation' },
    { title: 'Infrastructure Impact Overlay', role: 'Intersection with OSM buildings & bridge nodes' },
    { title: 'Road Connectivity Graph Analysis', role: 'Dijkstra shortest path & cut-off reachability' },
    { title: 'AI Situation Briefing & Copilot', role: 'Strictly grounded operational disaster intelligence' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              DATA SOURCES, PIPELINE & PROVENANCE
            </h1>
            <DemoBadge label="OPEN SATELLITE & VECTOR STACK" variant="cyan" />
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Transparent catalog of all remote sensing inputs, geospatial elevation baselines, open vector infrastructure layers, and AI benchmark targets utilized by FloodTrace AI.
          </p>
        </div>
      </div>

      {/* Complete Step-by-Step Processing Pipeline */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
              End-to-End Processing Architecture
            </h2>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">9 Core Stages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {pipeline.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950 rounded border border-slate-850 flex flex-col justify-between text-xs space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">STAGE 0{idx + 1}</span>
              </div>
              <div>
                <div className="font-semibold text-slate-200 text-xs leading-snug">{item.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 leading-tight">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Data Source Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Input Dataset Specifications & Attributions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-100 text-sm leading-snug">{src.name}</h3>
                  <DemoBadge label={src.status} variant={src.statusVariant} />
                </div>
                <div className="text-[11px] font-mono text-slate-400">{src.provider}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{src.purpose}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                    Mandatory Attribution
                  </span>
                  <p className="text-[11px] text-slate-400 italic bg-slate-950 p-2 rounded border border-slate-850">
                    &ldquo;{src.attribution}&rdquo;
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-0.5">
                    Future Integration Point (Prompt 2/3)
                  </span>
                  <p className="text-[11px] text-slate-300 font-mono">{src.futureIntegration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Data Integrity & Non-Copernicus EMS Ban Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
        <div className="font-semibold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Track B Rule Compliance Verification</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          In strict compliance with Track B challenge rules: Published disaster maps such as Copernicus Emergency Management Service (EMS) activations or UNOSAT maps are <strong>NOT</strong> used as input data. The system extracts raw change polygons independently from primary radar/optical orbital data. Published maps will only serve as independent comparison ground-truth during final evaluation.
        </p>
      </div>
    </div>
  );
};
