import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Cpu,
  FileCheck2,
  PieChart as PieIcon,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { DemoBadge } from '../components/DemoBadge';
import { MOCK_FLOOD_ZONES, VERIFIED_SYSTEM_FACTS } from '../data/mockData';

export const AnalyticsPage: React.FC = () => {
  // Chart 1: Affected Area by Zone (km²)
  const zoneData = MOCK_FLOOD_ZONES.map((z) => ({
    name: z.zoneCode,
    fullName: z.name,
    inundation: z.inundationAreaKm2,
    debris: z.debrisAreaKm2,
    total: z.affectedAreaKm2,
  }));

  // Chart 2: Settlement Connectivity Status
  const settlementStatusData = [
    { name: 'Cut Off (Isolated)', value: 7, color: '#f43f5e' },
    { name: 'Partially Connected', value: 2, color: '#f59e0b' },
    { name: 'Connected / Open', value: 3, color: '#10b981' },
  ];

  // Chart 3: Asset Category Damage Distribution
  const assetCategoryData = [
    { name: 'Roads (km)', affected: 18.4, total: 114.2 },
    { name: 'Bridges (units)', affected: 4, total: 9 },
    { name: 'Buildings (units)', affected: 142, total: 680 },
    { name: 'Hospitals (units)', affected: 0, total: 3 },
  ];

  // Chart 4: Detection Confidence Distribution
  const confidenceData = [
    { name: 'High Confidence SAR RTC', value: 68, color: '#06b6d4' },
    { name: 'Moderate (Cloud Fringe)', value: 24, color: '#3b82f6' },
    { name: 'Pending Field Verification', value: 8, color: '#94a3b8' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              GEOSPATIAL & IMPACT ANALYTICS
            </h1>
            <DemoBadge label="SIMULATED TELEMETRY AGGREGATION" variant="amber" />
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Corridor-scale quantitative analysis synthesizing flood inundation surfaces, debris volume allocations, and OpenStreetMap network severances for the Trishuli basin.
          </p>
        </div>
      </div>

      {/* Model Performance & Evaluation Safeguards (Mandatory Integrity Section) */}
      <div className="p-5 bg-slate-900 border border-amber-500/40 rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-slate-100 text-sm">
              Machine Learning Model Evaluation Framework
            </h2>
          </div>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
            [STATUS] BENCHMARK INTEGRATION PENDING
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Scientific integrity rule: Model metrics will appear after evaluation on held-out Himalayan scenes. The application does not fabricate precision or recall scores prior to training against the approved Kuro Siwo flood dataset.
        </p>

        {/* 4 Model Metric Placeholders (Explicitly: NOT YET EVALUATED) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400">Mean IoU (Water)</div>
            <div className="text-sm font-mono font-bold text-slate-400">--</div>
            <div className="text-[10px] font-mono text-amber-400 font-semibold uppercase">
              NOT YET EVALUATED
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400">Precision (Debris)</div>
            <div className="text-sm font-mono font-bold text-slate-400">--</div>
            <div className="text-[10px] font-mono text-amber-400 font-semibold uppercase">
              NOT YET EVALUATED
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400">Recall (Inundation)</div>
            <div className="text-sm font-mono font-bold text-slate-400">--</div>
            <div className="text-[10px] font-mono text-amber-400 font-semibold uppercase">
              NOT YET EVALUATED
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center space-y-1">
            <div className="text-[10px] font-mono uppercase text-slate-400">F1 Score (Infrastructure)</div>
            <div className="text-sm font-mono font-bold text-slate-400">--</div>
            <div className="text-[10px] font-mono text-amber-400 font-semibold uppercase">
              NOT YET EVALUATED
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Affected Area by Zone */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Affected Area by Corridor Zone (km²)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Segmented into active water inundation vs debris deposition
              </span>
            </div>
            <DemoBadge label="Sentinel SAR" variant="cyan" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="inundation" name="Inundation (km²)" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                <Bar dataKey="debris" name="Debris Torrent (km²)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Settlement Isolation Breakdown */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Settlement Road Connectivity Status
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Network reachability ratio across 12 monitored communities
              </span>
            </div>
            <DemoBadge label="Graph Analysis" variant="amber" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={settlementStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {settlementStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Asset Impact Distribution */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Infrastructure Exposure Ratio
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Affected vs total monitored asset inventory
              </span>
            </div>
            <DemoBadge label="OSM Overlay" variant="slate" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetCategoryData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="affected" name="Damaged / Severed" fill="#f43f5e" radius={[0, 2, 2, 0]} />
                <Bar dataKey="total" name="Total Baseline" fill="#334155" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Detection Confidence Distribution */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Geospatial Confidence Allocation (%)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Confidence categorization across 42.8 km² altered polygon area
              </span>
            </div>
            <DemoBadge label="Multi-Sensor" variant="cyan" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ? name.split(' ')[0] : ''}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  labelLine={false}
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-conf-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Processing Summary Audit */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-xs">
        <h3 className="font-semibold text-slate-200">Orbital & Network Processing Audit</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] font-mono text-slate-400">
          <div>SAR Log-Ratio Threshold: -18.2 dB</div>
          <div>DEM Max Slope Cap: 34 degrees</div>
          <div>Road Intersection Tolerance: 15 meters</div>
          <div>Graph Node Reachability: Dijkstra / Cutoff</div>
        </div>
      </div>
    </div>
  );
};
