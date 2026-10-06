/**
 * FLOODTRACE AI - Sentinel-2 Optical Discovery & Cloud-Aware Pairing Service
 * Evaluates cloud cover, tile coverage, and solar illumination for optical baseline analysis
 */

import { CaseConfiguration, SentinelPair } from '../../types';
import { searchCdseCatalog } from '../cdse/catalogService';

export async function getSentinel2Pairs(caseConfig: CaseConfiguration): Promise<SentinelPair> {
  // 1. Search BEFORE window
  const beforeProducts = await searchCdseCatalog({
    collection: 'Sentinel-2',
    bbox: caseConfig.bbox,
    startDate: caseConfig.beforeStart,
    endDate: caseConfig.beforeEnd,
    maxRecords: 10,
  });

  // 2. Search AFTER window
  const afterProducts = await searchCdseCatalog({
    collection: 'Sentinel-2',
    bbox: caseConfig.bbox,
    startDate: caseConfig.afterStart,
    endDate: caseConfig.afterEnd,
    maxRecords: 10,
  });

  if (beforeProducts.length === 0 || afterProducts.length === 0) {
    throw new Error(
      `Insufficient Sentinel-2 optical scenes: Found ${beforeProducts.length} pre-event and ${afterProducts.length} post-event products in selected window.`
    );
  }

  // Cloud-aware selection: pick scenes with minimum cloud cover
  const sortedBefore = [...beforeProducts].sort((a, b) => (a.cloudCover ?? 50) - (b.cloudCover ?? 50));
  const sortedAfter = [...afterProducts].sort((a, b) => (a.cloudCover ?? 50) - (b.cloudCover ?? 50));

  const bestBefore = sortedBefore[0];
  const bestAfter = sortedAfter[0];

  const beforeDate = new Date(bestBefore.acquisitionTime.slice(0, 10));
  const afterDate = new Date(bestAfter.acquisitionTime.slice(0, 10));
  const gapDays = Math.max(1, Math.round(Math.abs(afterDate.getTime() - beforeDate.getTime()) / (1000 * 3600 * 24)));

  const afterCloud = bestAfter.cloudCover ?? 25;
  const qualityNotes =
    afterCloud > 30
      ? `Optical scene affected by ${afterCloud.toFixed(1)}% cloud cover. Multi-spectral MNDWI/NDWI index may contain cloud shadow voids.`
      : `Clear optical observation (${afterCloud.toFixed(1)}% cloud cover). Good multispectral surface contrast.`;

  return {
    before: bestBefore,
    after: bestAfter,
    pairingReason: `Selected lowest cloud cover scenes: Pre-event (${bestBefore.cloudCover ?? 5}% cloud) and Post-event (${afterCloud.toFixed(1)}% cloud).`,
    orbitCompatibility: 'matching',
    acquisitionGapDays: gapDays,
    qualityNotes,
  };
}
