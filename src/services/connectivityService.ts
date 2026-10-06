/**
 * FLOODTRACE AI - Road Network & Settlement Connectivity Service
 * Evaluates graph connectivity from OpenStreetMap road networks intersected with flood/debris zones.
 */

import { MOCK_ROAD_SEGMENTS, MOCK_SETTLEMENTS, VERIFIED_SYSTEM_FACTS } from '../data/mockData';
import { RoadSegment, Settlement } from '../types';
import { ApiResponse, simulateNetworkDelay } from './api';

export interface ConnectivityAnalysisResult {
  settlementId: string;
  settlementName: string;
  connectivityStatus: 'connected' | 'partially_connected' | 'cut_off';
  shortestPathLengthKm: number | null;
  blockedSegmentCount: number;
  nearestTown: string;
  nearestHospital: string;
  isolationRiskScore: number; // 0-100
  traversableRoutes: string[];
  severedRoutes: string[];
  lastGraphRecompute: string;
}

export async function getSettlements(): Promise<ApiResponse<Settlement[]>> {
  return simulateNetworkDelay(MOCK_SETTLEMENTS);
}

export async function getRoadSegments(): Promise<ApiResponse<RoadSegment[]>> {
  return simulateNetworkDelay(MOCK_ROAD_SEGMENTS);
}

export async function getSettlementById(id: string): Promise<ApiResponse<Settlement | undefined>> {
  const settlement = MOCK_SETTLEMENTS.find((s) => s.id === id);
  return simulateNetworkDelay(settlement);
}

/**
 * Core connectivity algorithm abstraction.
 * Currently uses deterministic graph-state mock logic for the Trishuli corridor.
 * Future prompts will replace this with real NetworkX / Dijkstra shortest-path calculations.
 */
export async function analyzeSettlementConnectivity(
  settlementId: string
): Promise<ApiResponse<ConnectivityAnalysisResult>> {
  const settlement = MOCK_SETTLEMENTS.find((s) => s.id === settlementId);
  if (!settlement) {
    throw new Error(`Settlement with ID ${settlementId} not found in corridor graph`);
  }

  const isCutOff = settlement.connectivityStatus === 'cut_off';
  const isPartial = settlement.connectivityStatus === 'partially_connected';

  const riskScore = isCutOff ? (settlement.priority === 'critical' ? 95 : 75) : isPartial ? 45 : 10;

  const result: ConnectivityAnalysisResult = {
    settlementId: settlement.id,
    settlementName: settlement.name,
    connectivityStatus: settlement.connectivityStatus,
    shortestPathLengthKm: isCutOff ? null : settlement.distanceToHospitalKm,
    blockedSegmentCount: settlement.affectedRoadSegments.length,
    nearestTown: settlement.nearestTown,
    nearestHospital: settlement.nearestHospital,
    isolationRiskScore: riskScore,
    traversableRoutes: isCutOff ? [] : ['NH09-South-Intact'],
    severedRoutes: settlement.affectedRoadSegments,
    lastGraphRecompute: '2026-08-27 06:40 UTC',
  };

  return simulateNetworkDelay(result);
}

export async function getCutoffPriorityList(): Promise<ApiResponse<Settlement[]>> {
  const cutoffList = MOCK_SETTLEMENTS
    .filter((s) => s.connectivityStatus === 'cut_off')
    .sort((a, b) => {
      const pMap = { critical: 3, high: 2, medium: 1, low: 0 };
      return pMap[b.priority] - pMap[a.priority];
    });

  return simulateNetworkDelay(cutoffList);
}

export async function getConnectivityOverview() {
  return simulateNetworkDelay({
    totalSettlements: VERIFIED_SYSTEM_FACTS.totalSettlementsCount,
    cutOffCount: VERIFIED_SYSTEM_FACTS.cutOffSettlementsCount,
    cutOffPopulation: VERIFIED_SYSTEM_FACTS.cutOffPopulationEstimate,
    totalRoadsKm: VERIFIED_SYSTEM_FACTS.totalRoadsKm,
    affectedRoadsKm: VERIFIED_SYSTEM_FACTS.affectedRoadsKm,
  });
}
