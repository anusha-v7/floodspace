/**
 * FLOODTRACE AI - Damage Assessment Service
 * Aggregates change detection polygons, OpenStreetMap building overlays, and asset exposure
 */

import {
  CURRENT_CASE_STUDY,
  MOCK_CRITICAL_ASSETS,
  MOCK_FLOOD_ZONES,
  VERIFIED_SYSTEM_FACTS,
} from '../data/mockData';
import {
  CaseStudyMetadata,
  CriticalAsset,
  FloodZone,
  VerifiedSystemFacts,
} from '../types';
import { ApiResponse, simulateNetworkDelay } from './api';

export interface DamageSummary {
  caseStudy: CaseStudyMetadata;
  facts: VerifiedSystemFacts;
  zones: FloodZone[];
  criticalAssets: CriticalAsset[];
}

export async function getDamageSummary(): Promise<ApiResponse<DamageSummary>> {
  return simulateNetworkDelay({
    caseStudy: CURRENT_CASE_STUDY,
    facts: VERIFIED_SYSTEM_FACTS,
    zones: MOCK_FLOOD_ZONES,
    criticalAssets: MOCK_CRITICAL_ASSETS,
  });
}

export async function getFloodZones(): Promise<ApiResponse<FloodZone[]>> {
  return simulateNetworkDelay(MOCK_FLOOD_ZONES);
}

export async function getCriticalAssets(): Promise<ApiResponse<CriticalAsset[]>> {
  return simulateNetworkDelay(MOCK_CRITICAL_ASSETS);
}

export async function getAssetById(id: string): Promise<ApiResponse<CriticalAsset | undefined>> {
  const asset = MOCK_CRITICAL_ASSETS.find((a) => a.id === id);
  return simulateNetworkDelay(asset);
}
