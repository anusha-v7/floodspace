import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Database,
  FileText,
  Globe2,
  HelpCircle,
  Layers,
  MapPin,
  Menu,
  Play,
  Radio,
  Route,
  Satellite,
  Settings,
  Shield,
  Sliders,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { DataModeToggle } from '../components/DataModeToggle';
import { AnalysisConfigModal } from '../components/AnalysisConfigModal';
import { ProcessingWorkflowModal } from '../components/ProcessingWorkflowModal';
import { AttributionFooter } from '../components/AttributionFooter';

export const CommandCenterLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);

  const { caseConfig, dataModeState, isAnalyzing, analysisResult, toast } = useAnalysis();

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: Activity },
    { label: 'Flood Map', to: '/map', icon: Globe2 },
    { label: 'Damage Assessment', to: '/damage', icon: AlertOctagon },
    { label: 'Cut-Off Analysis', to: '/cutoff', icon: Route },
    { label: 'Settlements', to: '/settlements', icon: Users },
    { label: 'Critical Assets', to: '/assets', icon: Building2 },
    { label: 'Satellite Imagery', to: '/imagery', icon: Satellite },
    { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    { label: 'AI Copilot', to: '/copilot', icon: Bot },
    { label: 'Situation Report', to: '/report', icon: FileText },
    { label: 'Data Sources', to: '/data-sources', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Global Command Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 px-4 flex items-center justify-between gap-2">
        {/* Left: Mobile Toggle & Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-mono font-bold text-black text-xs shadow-md">
              FT
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-slate-100 text-sm group-hover:text-cyan-400 transition-colors">
                FLOODTRACE AI
              </span>
              <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase -mt-0.5">
                TRACK B — SPACE DAMAGE
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center: Case Study & Area Selector */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setConfigModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-750 hover:border-cyan-500/50 rounded text-xs transition-colors group"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-left">
              <span className="text-[10px] font-mono text-slate-400 block leading-tight">ACTIVE AOI EXTENT</span>
              <span className="font-medium text-slate-200 group-hover:text-white truncate max-w-[200px] block">
                {caseConfig.caseName}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono px-2 py-1 bg-slate-900/50 rounded border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>EVENT: {caseConfig.eventDate}</span>
          </div>

          {/* Central AUTO / LIVE / DEMO Mode Toggle */}
          <DataModeToggle />
        </div>

        {/* Right: Operational Status & Pipeline Trigger */}
        <div className="flex items-center gap-2">
          {/* Workflow Trigger Button */}
          <button
            onClick={() => {
              if (isAnalyzing || analysisResult) {
                setWorkflowModalOpen(true);
              } else {
                setConfigModalOpen(true);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
              isAnalyzing
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 animate-pulse'
                : analysisResult
                ? 'bg-slate-900 border-emerald-500/50 text-emerald-300 hover:bg-slate-850'
                : 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">
              {isAnalyzing ? 'PIPELINE ACTIVE' : analysisResult ? 'RESULTS READY' : 'CONFIGURE AOI'}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono text-cyan-300">
              GIS
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200 leading-tight">Tactical Remote Sensing</span>
              <span className="text-[10px] font-mono text-slate-400">Copernicus / OSM Engine</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Command Center Layout Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sticky Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 pt-16 md:pt-0 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 max-md:-translate-x-full'
          }`}
        >
          {/* Incident Quick Header in Sidebar */}
          <div className="p-3 border-b border-slate-850 bg-slate-900/40">
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-1">
              Active Mission Extent
            </div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {caseConfig.caseName}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
              <span className="truncate">{caseConfig.regionName}</span>
              <span className="text-cyan-400 font-mono text-[10px] shrink-0">{caseConfig.eventDate.slice(0, 7)}</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Tactical Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Utility Sidebar Area */}
          <div className="p-2 border-t border-slate-850 bg-slate-900/30 space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setConfigModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Configure Area / Date</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setWorkflowModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left"
            >
              <Workflow className="w-3.5 h-3.5 text-emerald-400" />
              <span>Processing Status (11)</span>
            </button>

            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                  isActive ? 'text-cyan-300 bg-slate-850' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>About & Limitations</span>
            </NavLink>

            <div className="pt-2 px-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>{dataModeState.effectiveMode.toUpperCase()} MODE</span>
              <span className="text-emerald-400">READY</span>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
            aria-hidden="true"
          />
        )}

        {/* Center Main Viewport */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-slate-950">
          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1540px] w-full mx-auto">
            <Outlet />
          </div>

          <AttributionFooter />
        </main>
      </div>

      {/* Floating System Notification Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-cyan-500/50 text-slate-100 rounded-lg shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono">{toast.message}</span>
        </div>
      )}

      {/* Analysis Configuration Modal */}
      <AnalysisConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onStartPipeline={() => setWorkflowModalOpen(true)}
      />

      {/* 11-Stage Workflow Execution Modal */}
      <ProcessingWorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
      />
    </div>
  );
};
