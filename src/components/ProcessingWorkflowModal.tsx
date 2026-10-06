import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Loader2,
  X,
  Workflow,
  Sparkles,
  ArrowRight,
  Globe2,
  Route,
  FileText,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

interface ProcessingWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProcessingWorkflowModal: React.FC<ProcessingWorkflowModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { stages, isAnalyzing, analysisResult } = useAnalysis();

  if (!isOpen) return null;

  const completedCount = stages.filter((s) => s.status === 'complete' || s.status === 'warning').length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-lg max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-bold text-slate-100 text-base">Satellite & Geospatial Processing Pipeline</h2>
              <p className="text-xs text-slate-400 font-mono">
                11-Stage Automated Ingestion, Radar Log-Ratio, Optical MNDWI & Network Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">
              {isAnalyzing ? 'Pipeline Processing Active...' : analysisResult ? 'Pipeline Complete' : 'Ready to Run'}
            </span>
            <span className="text-cyan-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isAnalyzing ? 'bg-cyan-400' : analysisResult ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 11 Pipeline Stages List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {stages.map((stage) => {
            const isComplete = stage.status === 'complete';
            const isRunning = stage.status === 'running';
            const isWarning = stage.status === 'warning';
            const isFailed = stage.status === 'failed';

            return (
              <div
                key={stage.id}
                className={`p-3 rounded border text-xs transition-colors flex items-start gap-3 ${
                  isRunning
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                    : isComplete
                    ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                    : isWarning
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : isFailed
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : 'bg-slate-950/30 border-slate-850 text-slate-400'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isRunning && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                  {isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {isFailed && <XCircle className="w-4 h-4 text-rose-400" />}
                  {stage.status === 'pending' && (
                    <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-400">
                      {stage.id}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{stage.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {stage.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{stage.description}</div>
                  {stage.detail && (
                    <div
                      className={`text-[11px] font-mono mt-1 pt-1 border-t border-slate-800/80 ${
                        isWarning ? 'text-amber-300' : isFailed ? 'text-rose-300' : 'text-cyan-300'
                      }`}
                    >
                      {stage.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer & Next-Step Actions */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          {analysisResult && !isAnalyzing && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="text-xs">
                <span className="font-semibold text-emerald-300 block">Pipeline Execution Complete</span>
                <span className="text-[11px] text-slate-300">
                  {analysisResult.fusedEvidence.statistics.totalFusedAreaKm2} km² hazard mask · {analysisResult.cutOffSettlementsCount} cut-off settlements
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/map');
                  }}
                  className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-xs rounded flex items-center gap-1.5 transition-colors shadow"
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>Inspect Flood Map</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/cutoff');
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded flex items-center gap-1.5 transition-colors shadow"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>Cut-Off Analysis</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/report');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs rounded flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View SitRep</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-slate-400">
              {analysisResult ? `Active Run: ${analysisResult.runId}` : 'CDSE + ohsome API Engine'}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded transition-colors"
            >
              {analysisResult && !isAnalyzing ? 'Close & Review Results' : 'Close Progress'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
