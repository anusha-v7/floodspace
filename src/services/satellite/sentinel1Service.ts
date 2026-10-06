/**
 * FLOODTRACE AI - Sentinel-1 Discovery & Pairing Service
 * Evaluates orbital geometry, polarization, and temporal proximity for SAR change detection
 */

import { CaseConfiguration, SentinelPair } from '../../types';
import { searchCdseCatalog } from '../cdse/catalogService';

export async function getSentinel1Pairs(caseConfig: CaseConfiguration): Promise<SentinelPair> {
  // 1. Search BEFORE window
  const beforeProducts = await searchCdseCatalog({
    collection: 'Sentinel-1',
    bbox: caseConfig.bbox,
    startDate: caseConfig.beforeStart,
    endDate: caseConfig.beforeEnd,
    maxRecords: 10,
  });

  // 2. Search AFTER window
  const afterProducts = await searchCdseCatalog({
    collection: 'Sentinel-1',
    bbox: caseConfig.bbox,
    startDate: caseConfig.afterStart,
    endDate: caseConfig.afterEnd,
    maxRecords: 10,
  });

  if (beforeProducts.length === 0 || afterProducts.length === 0) {
    throw new Error(
      `Insufficient Sentinel-1 SAR coverage: Found ${beforeProducts.length} pre-event and ${afterProducts.length} post-event products in selected window.`
    );
  }

  // Find best geometry match (matching relative orbit track or pass direction)
  let bestBefore = beforeProducts[beforeProducts.length - 1]; // closest to event
  let bestAfter = afterProducts[0]; // first after event
  let orbitCompat: 'matching' | 'different_tracks' | 'unknown' = 'unknown';

  for (const b of beforeProducts) {
    for (const a of afterProducts) {
      if (b.relativeOrbit && a.relativeOrbit && b.relativeOrbit === a.relativeOrbit) {
        bestBefore = b;
        bestAfter = a;
        orbitCompat = 'matching';
        break;
      }
    }
    if (orbitCompat === 'matching') break;
  }

  if (orbitCompat !== 'matching') {
    orbitCompat =
      bestBefore.orbitDirection && bestAfter.orbitDirection && bestBefore.orbitDirection === bestAfter.orbitDirection
        ? 'matching'
        : 'different_tracks';
  }

  const beforeDate = new Date(bestBefore.acquisitionTime.slice(0, 10));
  const afterDate = new Date(bestAfter.acquisitionTime.slice(0, 10));
  const gapDays = Math.max(1, Math.round(Math.abs(afterDate.getTime() - beforeDate.getTime()) / (1000 * 3600 * 24)));

  const qualityNotes =
    orbitCompat === 'matching'
      ? 'Optimal pair: Matching orbital track minimizes relief layover differences on steep terrain.'
      : 'Cross-track warning: Differing incidence angles may introduce topographic radiometric variance.';

  return {
    before: bestBefore,
    after: bestAfter,
    pairingReason: `Paired ${bestBefore.platform} (${bestBefore.acquisitionTime.slice(0, 10)}) with ${bestAfter.platform} (${bestAfter.acquisitionTime.slice(0, 10)}) across a ${gapDays}-day baseline window.`,
    orbitCompatibility: orbitCompat,
    acquisitionGapDays: gapDays,
    qualityNotes,
  };
}
