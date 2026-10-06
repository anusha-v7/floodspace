import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Printer,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { DemoBadge } from '../components/DemoBadge';
import { StatusBadge } from '../components/StatusBadge';
import { generateSituationReport, SituationReportData } from '../services/reportService';

export const ReportPage: React.FC = () => {
  const { analysisResult, dataModeState, caseConfig } = useAnalysis();

  const [report, setReport] = useState<SituationReportData | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  const loadReport = async () => {
    setGenerating(true);
    try {
      const res = await generateSituationReport();
      const baseReport = res.data;

      // If active analysis result exists, overlay live metrics into the report
      if (analysisResult) {
        baseReport.caseStudy.name = caseConfig.caseName;
        baseReport.caseStudy.region = caseConfig.regionName;
        baseReport.caseStudy.eventDate = caseConfig.eventDate;
        baseReport.facts.totalAffectedAreaKm2 = analysisResult.fusedEvidence.statistics.totalFusedAreaKm2;
        baseReport.facts.estimatedDamagedBuildings = analysisResult.affectedBuildingsCount;
        baseReport.facts.affectedRoadsKm = analysisResult.severedRoadsKm;
        baseReport.facts.affectedBridgesCount = analysisResult.compromisedBridgesCount;
        baseReport.facts.cutOffSettlementsCount = analysisResult.cutOffSettlementsCount;
      }

      setReport(baseReport);
    } catch (err) {
      console.error('Error generating report', err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [analysisResult, caseConfig]);

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        Compiling Situation Report from corridor telemetry...
      </div>
    );
  }

  const isLive = dataModeState.effectiveMode === 'live' && Boolean(analysisResult);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Action Ribbon */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              SITUATION REPORT DISPATCH
            </h1>
            {isLive ? (
              <span className="px-2 py-0.5 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono text-[10px] font-bold">
                ● LIVE ANALYSIS SITREP
              </span>
            ) : (
              <DemoBadge label="STRUCTURED EMERGENCY BRIEF" variant="cyan" />
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {report.reportId} · Generated: {report.generationTimestamp}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadReport}
            disabled={generating}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>Regenerate Report</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download / Print Report</span>
          </button>
        </div>
      </div>

      {/* Official Emergency Situation Report Printable Document Container */}
      <article className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 md:p-10 space-y-8 print:bg-white print:text-black print:border-none print:p-0">
        {/* Document Header */}
        <header className="border-b-2 border-slate-800 pb-6 print:border-black flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest print:text-blue-700">
              FLOODTRACE AI · RAPID EMERGENCY BRIEFING
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 print:text-black mt-1">
              Flood Damage Situation Report
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 print:text-gray-600 mt-2 font-mono">
              <span>Case: {report.caseStudy.name}</span>
              <span>·</span>
              <span>Date: {report.caseStudy.eventDate}</span>
              <span>·</span>
              <span>Region: {report.caseStudy.region}</span>
            </div>
          </div>

          <div className="text-right sm:self-start">
            <span className="px-2.5 py-1 bg-rose-950/60 border border-rose-500/40 text-rose-300 print:border-red-600 print:text-red-700 rounded text-[11px] font-mono font-semibold uppercase block">
              {report.classification}
            </span>
            <span className="text-[10px] text-slate-400 print:text-gray-500 font-mono block mt-1">
              Doc ID: {report.reportId}
            </span>
          </div>
        </header>

        {/* Section 1: Executive Summary */}
        <section className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 print:text-blue-800 tracking-wider">
            1. Executive Summary
          </h3>
          <p className="text-xs md:text-sm text-slate-200 print:text-black leading-relaxed bg-slate-950/60 print:bg-gray-50 p-4 rounded border border-slate-800 print:border-gray-200">
            {report.executiveSummary}
          </p>
        </section>

        {/* Section 2: Flood / Debris-Affected Area */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 print:text-blue-800 tracking-wider">
              2. Flood / Debris-Affected Area
            </h3>
            <span className="text-xs font-mono text-slate-400 print:text-gray-700">
              Total Changed Area: <strong className="text-slate-100 print:text-black">{report.facts.totalAffectedAreaKm2} km²</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.affectedZonesSummary.map((zone, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/40 print:bg-gray-50 rounded border border-slate-800 print:border-gray-300 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-slate-200 print:text-black">
                  <span>{zone.zoneName}</span>
                  <span className="font-mono text-cyan-400 print:text-blue-700">{zone.areaKm2} km²</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-gray-600 leading-relaxed">
                  {zone.impactSummary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Damaged Infrastructure */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 print:text-blue-800 tracking-wider">
            3. Damaged Infrastructure
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-950/40 print:bg-gray-50 rounded border border-slate-800 print:border-gray-300 space-y-2">
              <span className="font-semibold text-slate-200 print:text-black block">
                Bridges Compromised ({report.facts.affectedBridgesCount})
              </span>
              <ul className="space-y-1 text-slate-300 print:text-gray-800 text-[11px]">
                {report.damagedInfrastructure.bridgesImpacted.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 print:text-red-600 font-bold">✖</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-950/40 print:bg-gray-50 rounded border border-slate-800 print:border-gray-300 space-y-2">
              <span className="font-semibold text-slate-200 print:text-black block">
                Critical Road Arteries Blocked ({report.facts.affectedRoadsKm} km total)
              </span>
              <ul className="space-y-1 text-slate-300 print:text-gray-800 text-[11px]">
                {report.damagedInfrastructure.criticalRoadsBlocked.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 print:text-amber-700 font-bold">▲</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Cut-Off Settlements */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 print:text-blue-800 tracking-wider">
              4. Cut-Off Settlements (Isolation Registry)
            </h3>
            <span className="text-xs font-mono text-rose-400 print:text-red-700 font-semibold">
              {report.facts.cutOffSettlementsCount} Settlements Isolated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
              <thead className="bg-slate-950 print:bg-gray-200 text-slate-400 print:text-black font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-2 border-b border-slate-800 print:border-gray-300">Settlement</th>
                  <th className="p-2 border-b border-slate-800 print:border-gray-300">District</th>
                  <th className="p-2 border-b border-slate-800 print:border-gray-300">Demo Pop.</th>
                  <th className="p-2 border-b border-slate-800 print:border-gray-300">Nearest Hospital</th>
                  <th className="p-2 border-b border-slate-800 print:border-gray-300">Access Severance Description</th>
                  <th className="p-2 border-b border-slate-800 print:border-gray-300 text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {report.cutOffSettlementsList.map((s, idx) => (
                  <tr key={idx} className="print:text-black">
                    <td className="p-2 font-semibold">
                      {s.name} {s.nepaliName && `(${s.nepaliName})`}
                    </td>
                    <td className="p-2 text-slate-400 print:text-gray-600">{s.district}</td>
                    <td className="p-2 font-mono">~{s.populationEstimate.toLocaleString()}</td>
                    <td className="p-2 text-slate-300 print:text-gray-700">{s.nearestHospital}</td>
                    <td className="p-2 text-slate-400 print:text-gray-600 text-[11px]">{s.accessProblem}</td>
                    <td className="p-2 text-right font-mono font-bold text-rose-400 print:text-red-700 text-[10px]">
                      {s.priority}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Critical Assets */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 print:text-blue-800 tracking-wider">
            5. Critical Assets Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {report.criticalAssetsStatus.slice(0, 6).map((ast, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950/40 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded space-y-1">
                <div className="font-semibold text-slate-200 print:text-black">{ast.name}</div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 print:text-gray-600">{ast.category}</span>
                  <span className="text-cyan-400 print:text-blue-700">{ast.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Priority Actions */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 print:text-blue-800 tracking-wider">
            6. Priority Operational Actions
          </h3>
          <ol className="space-y-2 text-xs text-slate-200 print:text-black">
            {report.priorityActions.map((action, idx) => (
              <li
                key={idx}
                className="p-2.5 bg-slate-950/60 print:bg-gray-100 rounded border border-slate-800 print:border-gray-300 font-sans"
              >
                {action}
              </li>
            ))}
          </ol>
        </section>

        {/* Section 7: Data Sources */}
        <section className="space-y-2 pt-2 border-t border-slate-800 print:border-gray-300">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-400 print:text-gray-700 tracking-wider">
            7. Data Provenance & Ingestion Sources
          </h3>
          <ul className="list-disc list-inside text-[11px] text-slate-400 print:text-gray-600 font-mono space-y-0.5">
            {report.dataSources.map((ds, idx) => (
              <li key={idx}>{ds}</li>
            ))}
          </ul>
        </section>

        {/* Section 8: Limitations */}
        <section className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase text-amber-400 print:text-amber-800 tracking-wider">
            8. Scientific & Operational Limitations
          </h3>
          <ul className="list-disc list-inside text-[11px] text-slate-400 print:text-gray-600 space-y-0.5">
            {report.limitations.map((lim, idx) => (
              <li key={lim}>{lim}</li>
            ))}
          </ul>
        </section>

        {/* Document Footer */}
        <footer className="pt-4 border-t border-slate-800 print:border-black text-[10px] font-mono text-slate-500 print:text-gray-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>FLOODTRACE AI · Track B Submission Prototype · Multimodal AI Hackathon 2026</span>
          <span>Authentication Hash: SHA-256-TRISHULI-DEMO-2026</span>
        </footer>
      </article>
    </div>
  );
};
