/**
 * FLOODTRACE AI - Multimodal AI Hackathon 2026
 * Track B: Mapping Flood Damage from Space
 * Core Application Routing with AnalysisProvider
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnalysisProvider } from './context/AnalysisContext';
import { CommandCenterLayout } from './layouts/CommandCenterLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { DamagePage } from './pages/DamagePage';
import { CutoffPage } from './pages/CutoffPage';
import { SettlementsPage } from './pages/SettlementsPage';
import { AssetsPage } from './pages/AssetsPage';
import { ImageryPage } from './pages/ImageryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CopilotPage } from './pages/CopilotPage';
import { ReportPage } from './pages/ReportPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  return (
    <AnalysisProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page (Stand-alone public overview) */}
          <Route path="/" element={<LandingPage />} />

          {/* Command Center Workspace (Shared layout with persistent sidebar and telemetry header) */}
          <Route element={<CommandCenterLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/damage" element={<DamagePage />} />
            <Route path="/cutoff" element={<CutoffPage />} />
            <Route path="/settlements" element={<SettlementsPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/imagery" element={<ImageryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/data-sources" element={<DataSourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AnalysisProvider>
  );
}
