/**
 * FLOODTRACE AI - Situation Report Generator Service
 * Compiles structured emergency briefs for rapid operational dissemination
 */

import {
  CURRENT_CASE_STUDY,
  MOCK_CRITICAL_ASSETS,
  MOCK_FLOOD_ZONES,
  MOCK_SETTLEMENTS,
  VERIFIED_SYSTEM_FACTS,
} from '../data/mockData';
import { ApiResponse, simulateNetworkDelay } from './api';

export interface SituationReportData {
  reportId: string;
  generationTimestamp: string;
  classification: string;
  caseStudy: typeof CURRENT_CASE_STUDY;
  facts: typeof VERIFIED_SYSTEM_FACTS;
  executiveSummary: string;
  affectedZonesSummary: {
    zoneName: string;
    areaKm2: number;
    severity: string;
    impactSummary: string;
  }[];
  damagedInfrastructure: {
    bridgesImpacted: string[];
    criticalRoadsBlocked: string[];
    damagedBuildingsCount: number;
  };
  cutOffSettlementsList: {
    name: string;
    nepaliName?: string;
    district: string;
    populationEstimate: number;
    nearestHospital: string;
    accessProblem: string;
    priority: string;
  }[];
  criticalAssetsStatus: {
    name: string;
    category: string;
    status: string;
    functionalState: string;
  }[];
  priorityActions: string[];
  dataSources: string[];
  limitations: string[];
}

export async function generateSituationReport(): Promise<ApiResponse<SituationReportData>> {
  const cutOffSettlements = MOCK_SETTLEMENTS.filter((s) => s.connectivityStatus === 'cut_off');

  const report: SituationReportData = {
    reportId: `SITREP-TRISHULI-${Date.now().toString().slice(-6)}`,
    generationTimestamp: new Date().toISOString(),
    classification: 'EMERGENCY RESPONSE PROTOCOL — DEMO RECONNAISSANCE',
    caseStudy: CURRENT_CASE_STUDY,
    facts: VERIFIED_SYSTEM_FACTS,
    executiveSummary: `A severe monsoon storm triggered massive flash flooding and debris deposition along the Trishuli River basin on 26 August 2026. Automated satellite SAR change detection from Sentinel-1 and multispectral indices from Sentinel-2 reveal 42.8 km² of altered terrain. Graph analysis of the OpenStreetMap road network demonstrates that 7 settlements (estimated population ~6,710) have lost all vehicular ingress/egress due to 4 destroyed/compromised bridges and 18.4 km of severed roads. Both district hospitals are physically intact, but ground ambulance access from northern gorge communities is completely blocked.`,
    affectedZonesSummary: MOCK_FLOOD_ZONES.map((z) => ({
      zoneName: z.name,
      areaKm2: z.affectedAreaKm2,
      severity: z.severity.toUpperCase(),
      impactSummary: z.description,
    })),
    damagedInfrastructure: {
      bridgesImpacted: [
        'Mailung Khola Bailey Bridge (Washed Away / Destroyed)',
        'Betrawati Suspended Arch Bridge (Abutment Compromised - Closed to heavy traffic)',
        'Trishuli Upper Feeder Crossing (Buried in 1.8m debris)',
        'Syabrubesi Northern Access Span (Foundation undercut)',
      ],
      criticalRoadsBlocked: [
        'Pasang Lhamu Highway (NH09 - Mailung Sector): 6.4 km flooded / scoured',
        'Haku Mountain Feeder Road: 4.8 km severed by 3 slope scarps',
        'Kalikasthan to Ramche Spur: 5.2 km blocked by rockfall',
        'Syabrubesi to Bridhim Feeder: 4.2 km washed out',
      ],
      damagedBuildingsCount: VERIFIED_SYSTEM_FACTS.estimatedDamagedBuildings,
    },
    cutOffSettlementsList: cutOffSettlements.map((s) => ({
      name: s.name,
      nepaliName: s.nepaliName,
      district: s.district,
      populationEstimate: s.populationEstimate,
      nearestHospital: s.nearestHospital,
      accessProblem: s.roadAccessStatus,
      priority: s.priority.toUpperCase(),
    })),
    criticalAssetsStatus: MOCK_CRITICAL_ASSETS.map((a) => ({
      name: a.name,
      category: a.category.toUpperCase(),
      status: a.status.replace('_', ' ').toUpperCase(),
      functionalState: a.damageDescription,
    })),
    priorityActions: [
      '1. Tactical Aerial Resupply: Immediate helicopter payload dispatch of medical trauma supplies and water purification kits to Haku and Ramche.',
      '2. Engineering Earthmoving: Dispatch heavy front loaders from Bidur base to stabilize northern approach to Betrawati Suspended Arch Bridge.',
      '3. Forward Staging Depot: Activate Syabrubesi as northern response hub using remaining southern highway corridor from Dhunche.',
      '4. Pedestrian Access Restoration: Coordinate local teams to establish temporary footbridge across Mailung Khola tributary.',
      '5. Satellite Re-tasking: Queue next ascending Sentinel-1 pass and high-resolution optical tasking for updated landslide dam assessment.',
    ],
    dataSources: [
      'Sentinel-1 C-band SAR (Level-1 GRD, Copernicus Open Access)',
      'Sentinel-2 MSI (Level-2A BOA, Copernicus)',
      'Copernicus WorldDEM-30 Global Baseline Elevation Model',
      'OpenStreetMap Highway & Building Footprints (Pre-event snapshot)',
      'Target Model Benchmark: Kuro Siwo flood dataset integration target',
    ],
    limitations: [
      'All population and building damage numbers are prototype/demo estimates for hackathon evaluation.',
      'Satellite revisit intervals impose a minimum 12-to-24 hour latency between physical ground changes and orbital acquisition.',
      'Optical Sentinel-2 imagery remains subject to cloud obscuration during active monsoon rain bands.',
      'SAR coherence and radar shadow effects can obscure narrow, steep Himalayan canyon floors.',
      'Ground truthing and drone reconnaissance required before conducting high-risk vehicle crossings.',
    ],
  };

  return simulateNetworkDelay(report);
}
