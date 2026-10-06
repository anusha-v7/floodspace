import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Compass,
  Database,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  Layers,
  MapPin,
  Menu,
  Route,
  Satellite,
  ShieldAlert,
  Sparkles,
  Workflow,
  X,
} from 'lucide-react';
import { CURRENT_CASE_STUDY, VERIFIED_SYSTEM_FACTS } from '../data/mockData';
import { DemoBadge } from '../components/DemoBadge';
import { AttributionFooter } from '../components/AttributionFooter';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pipelineSteps = [
    { title: 'Satellite Data', subtitle: 'Sentinel-1 SAR & Sentinel-2 Optical' },
    { title: 'Preprocessing', subtitle: 'RTC Radiometry & Cloud Masking' },
    { title: 'Flood / Debris Detection', subtitle: 'Change Segmentation & DEM Slope' },
    { title: 'Damage Assessment', subtitle: 'OSM Building & Bridge Overlay' },
    { title: 'Road Connectivity Analysis', subtitle: 'Graph Cut-Off & Shortest Path' },
    { title: 'AI Situation Intelligence', subtitle: 'Grounded Briefing Copilot' },
    { title: 'Rescue Decision Support', subtitle: 'Operational Triage & SitRep' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50 px-4 md:px-6 py-3.5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-mono font-bold text-black text-sm shadow-md">
              FT
            </div>
            <div>
              <div className="font-bold text-slate-100 tracking-tight text-base group-hover:text-cyan-400 transition-colors">
                FLOODTRACE AI
              </div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                TRACK B — MAPPING FLOOD DAMAGE FROM SPACE
              </div>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <Link to="/dashboard" className="hover:text-slate-200 transition-colors">
            Command Center
          </Link>
          <Link to="/map" className="hover:text-slate-200 transition-colors">
            Flood Map
          </Link>
          <Link to="/cutoff" className="hover:text-slate-200 transition-colors">
            Cut-Off Analysis
          </Link>
          <Link to="/copilot" className="hover:text-slate-200 transition-colors">
            AI Copilot
          </Link>
          <Link to="/report" className="hover:text-slate-200 transition-colors">
            SitRep
          </Link>
          <Link to="/data-sources" className="hover:text-slate-200 transition-colors">
            Data Architecture
          </Link>
          <Link to="/about" className="hover:text-slate-200 transition-colors">
            Limitations
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/dashboard"
            className="px-3.5 py-1.5 md:px-4 md:py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap shadow-lg shadow-cyan-950/50"
          >
            Launch Command Center
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 space-y-3 sticky top-14 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Navigation</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              Command Center
            </Link>
            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              Flood Map
            </Link>
            <Link
              to="/damage"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              Damage Assessment
            </Link>
            <Link
              to="/cutoff"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              Cut-Off Analysis
            </Link>
            <Link
              to="/copilot"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              AI Copilot
            </Link>
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              Situation Report
            </Link>
            <Link
              to="/data-sources"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              Data Sources
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              Limitations
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono mb-6">
          <Satellite className="w-3.5 h-3.5" />
          <span>MULTIMODAL AI HACKATHON 2026 · TRACK B PROTOTYPE</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-100 max-w-4xl text-balance leading-tight">
          Map the Damage. <br className="hidden sm:inline" />
          <span className="text-cyan-400">Find the Cut-Off.</span> <br className="hidden sm:inline" />
          Guide the Response.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl text-balance leading-relaxed">
          An AI-assisted geospatial intelligence platform that maps flood- and debris-affected areas from satellite imagery, assesses damaged infrastructure, and identifies settlements isolated from critical road connections.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-lg shadow-cyan-950"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/map"
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-750 rounded-md transition-colors"
          >
            <span>Explore Case Study</span>
            <Globe2 className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Tactical Scenario Sub-Banner */}
        <div className="mt-10 p-3 bg-slate-900/60 border border-slate-800 rounded-lg max-w-xl text-left flex items-start gap-3 text-xs">
          <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <span>Case Demonstration: Trishuli River Corridor, Nepal</span>
              <DemoBadge label="SIMULATED DEMO" variant="amber" />
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Event Date: 26 August 2026 · {VERIFIED_SYSTEM_FACTS.cutOffSettlementsCount} mountain villages cut off · {VERIFIED_SYSTEM_FACTS.totalAffectedAreaKm2} km² impacted terrain
            </div>
          </div>
        </div>
      </section>

      {/* Three Core Track B Pillars */}
      <section className="px-6 py-12 max-w-7xl mx-auto w-full border-t border-slate-850">
        <div className="text-center mb-10">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
            CORE MISSION OBJECTIVES
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mt-1">
            Three Critical Questions for Rescuers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Question 1 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Satellite className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-mono uppercase text-cyan-400">Question 01</div>
              <h3 className="text-lg font-semibold text-slate-100 mt-1">Where did the flood hit?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Sentinel-1 SAR radar penetrates monsoon cloud cover to detect inundation through specular reflectance drops, paired with Sentinel-2 multispectral index change and Copernicus DEM topography.
              </p>
            </div>
            <Link
              to="/map"
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <span>Inspect flood polygons</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Question 2 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-mono uppercase text-amber-400">Question 02</div>
              <h3 className="text-lg font-semibold text-slate-100 mt-1">What was damaged?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Overlays pre-event OpenStreetMap building footprints, arterial highways, and critical bridges directly onto verified flood and debris torrent polygons to estimate compromised assets.
              </p>
            </div>
            <Link
              to="/damage"
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              <span>View damage assessments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Question 3 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                <Route className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-mono uppercase text-rose-400">Question 03</div>
              <h3 className="text-lg font-semibold text-slate-100 mt-1">Who is cut off?</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Evaluates road network graph connectivity to identify isolated mountain settlements that no longer have passable vehicular paths to the nearest district town or trauma hospital.
              </p>
            </div>
            <Link
              to="/cutoff"
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              <span>Examine isolated settlements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS Pipeline */}
      <section className="px-6 py-12 max-w-7xl mx-auto w-full border-t border-slate-850">
        <div className="text-center mb-10">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">SYSTEM PIPELINE</div>
          <h2 className="text-2xl font-bold text-slate-100 mt-1">How FloodTrace AI Operates</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-900/70 border border-slate-800 rounded flex flex-col justify-between text-left relative"
            >
              <div className="text-[10px] font-mono text-cyan-400 mb-1">
                STEP 0{idx + 1}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">{step.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{step.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clean Technology & Data Sources Callout */}
      <section className="px-6 py-10 max-w-7xl mx-auto w-full border-t border-slate-850">
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <h3 className="text-base font-semibold text-slate-100">
              Grounded in Open Satellite & Geospatial Datasets
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed explicitly around European Space Agency Copernicus Sentinel-1, Sentinel-2, Copernicus WorldDEM-30 elevation data, and OpenStreetMap. Future ML training target: Kuro Siwo global flood benchmark.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/data-sources"
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded transition-colors whitespace-nowrap"
            >
              Data Architecture
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap"
            >
              Enter Dashboard
            </Link>
          </div>
        </div>
      </section>

      <AttributionFooter />
    </div>
  );
};
