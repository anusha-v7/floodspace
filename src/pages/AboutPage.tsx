import React from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  Flame,
  Info,
  Radio,
  Satellite,
  ShieldAlert,
} from 'lucide-react';
import { DemoBadge } from '../components/DemoBadge';

export const AboutPage: React.FC = () => {
  const limitations = [
    {
      title: 'Satellite Revisit Frequency Latency',
      description:
        'Sentinel-1 and Sentinel-2 constellations pass over specific Himalayan river basins on 6-to-12 day nominal orbital cycles (shortened to 1-3 days when combining ascending and descending passes or tasking international constellations). Near-real-time minutes-scale monitoring is impossible with polar-orbiting satellites.',
    },
    {
      title: 'Monsoon Cloud Obscuration for Optical Sensors',
      description:
        'Optical satellites (Sentinel-2, Landsat) cannot see through dense rain clouds. While multispectral indices (MNDWI, NDWI) are superior for water quality and debris validation, during peak storms only microwave SAR (Sentinel-1) yields actionable signals.',
    },
    {
      title: 'Radar Layover & Canyon Shadow in Extreme Himalayan Relief',
      description:
        'Side-looking Synthetic Aperture Radar suffers from geometric distortion in steep mountain gorges. Foreshortening, layover on mountain slopes facing the radar, and radar shadows on back slopes can obscure narrow riverbed bottoms.',
    },
    {
      title: 'Probabilistic Infrastructure Damage Estimates',
      description:
        'Damage figures (e.g., 142 affected structures) are derived from spatial intersection between 10m-resolution change detection masks and vector footprints. They do not constitute structural engineering inspections and must be ground-truthed before heavy rescue deployment.',
    },
    {
      title: 'OpenStreetMap Completeness & Road Graph Granularity',
      description:
        'OSM data completeness varies widely across rural Himalayan districts. Unmapped mule tracks, seasonal footpaths, or informal vehicular cuts may exist on the ground that are not recorded in digital road graphs.',
    },
    {
      title: 'Decision Support Only — Not an Operational Replacement',
      description:
        'FloodTrace AI is developed as an educational prototype for the Multimodal AI Hackathon 2026 (Track B). It is intended strictly to assist humanitarian planning and does not replace certified national disaster risk management directives.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              ABOUT FLOODTRACE AI & SYSTEM LIMITATIONS
            </h1>
            <DemoBadge label="EDUCATIONAL PROTOTYPE" variant="slate" />
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Multimodal AI Hackathon 2026 — Track B: Mapping Flood Damage from Space.
          </p>
        </div>
      </div>

      {/* Purpose & Track B Mission */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
        <h2 className="text-base font-bold text-slate-100">
          The Problem: When Roads & Phone Lines are Gone
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          In mountainous disaster zones such as the Himalayas, catastrophic monsoons cause simultaneous river surges, debris torrents, and co-seismic landslides. Fiber optic lines snap, cellular towers lose power, and bridges wash away. Emergency coordinators in capital command centers have no situational awareness of which remote villages have been cut off or where injured residents are trapped.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          FloodTrace AI demonstrates that by combining cloud-penetrating European Space Agency Sentinel-1 radar, Copernicus DEM topography, and pre-event OpenStreetMap road graphs, an autonomous pipeline can detect the physical inundation, calculate compromised bridges, and map isolated mountain settlements without requiring ground connectivity.
        </p>
      </div>

      {/* Mandatory Limitations Section */}
      <div className="p-6 bg-slate-900 border border-rose-500/40 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-100">
            Critical Scientific & Operational Limitations
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          As a responsible humanitarian intelligence platform, FloodTrace AI does not overstate its capabilities. Operational personnel must acknowledge the following technical boundaries:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {limitations.map((lim, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-950 rounded border border-slate-850 space-y-1 text-xs"
            >
              <div className="flex items-start gap-2 font-semibold text-rose-300">
                <span className="text-rose-500 font-mono text-[10px] mt-0.5">0{idx + 1}.</span>
                <span>{lim.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-4">
                {lim.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Attributions & Intellectual Property */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg space-y-3 text-xs">
        <h3 className="font-semibold text-slate-200 text-sm">Official Data Attributions</h3>
        <ul className="space-y-2 text-slate-400 text-[11px]">
          <li className="p-2 bg-slate-950 rounded border border-slate-850">
            <strong>Copernicus Sentinel Data:</strong> &ldquo;Contains modified Copernicus Sentinel data 2026.&rdquo;
          </li>
          <li className="p-2 bg-slate-950 rounded border border-slate-850">
            <strong>Copernicus WorldDEM-30:</strong> &ldquo;Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.&rdquo;
          </li>
          <li className="p-2 bg-slate-950 rounded border border-slate-850">
            <strong>OpenStreetMap:</strong> &ldquo;© OpenStreetMap contributors under Open Database License (ODbL).&rdquo;
          </li>
          <li className="p-2 bg-slate-950 rounded border border-slate-850">
            <strong>Training Target:</strong> Kuro Siwo multimodal flood benchmark integration target.
          </li>
        </ul>
      </div>
    </div>
  );
};
