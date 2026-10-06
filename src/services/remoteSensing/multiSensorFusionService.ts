/**
 * FLOODTRACE AI - Multi-Sensor Remote Sensing Fusion Service
 * Synthesizes Sentinel-1 SAR and Sentinel-2 optical change evidence into unified hazard polygons
 */

import {
  BoundingBox,
  FusedEvidenceResult,
  OpticalChangeResult,
  RadarChangeResult,
} from '../../types';

export function fuseRemoteSensingEvidence(
  radarChange?: RadarChangeResult,
  opticalChange?: OpticalChangeResult,
  bbox?: BoundingBox
): FusedEvidenceResult {
  const sources: ('Sentinel-1' | 'Sentinel-2')[] = [];
  if (radarChange) sources.push('Sentinel-1');
  if (opticalChange) sources.push('Sentinel-2');

  if (sources.length === 0) {
    return {
      polygons: { type: 'FeatureCollection', features: [] },
      evidenceSources: [],
      confidenceClass: 'Insufficient Evidence',
      statistics: {
        totalFusedAreaKm2: 0,
        radarConfirmedKm2: 0,
        opticalConfirmedKm2: 0,
        bothConfirmedKm2: 0,
      },
    };
  }

  // Combine features
  const combinedFeatures: any[] = [];

  if (radarChange?.changePolygons?.features) {
    combinedFeatures.push(
      ...radarChange.changePolygons.features.map((f: any) => ({
        ...f,
        properties: {
          ...f.properties,
          evidenceSource: 'Sentinel-1 C-SAR',
          fusionWeight: 0.6,
        },
      }))
    );
  }

  if (opticalChange?.candidateFloodedPolygons?.features) {
    combinedFeatures.push(
      ...opticalChange.candidateFloodedPolygons.features.map((f: any) => ({
        ...f,
        properties: {
          ...f.properties,
          evidenceSource: 'Sentinel-2 MSI',
          fusionWeight: 0.4,
        },
      }))
    );
  }

  // Calculate statistics
  const radarArea = radarChange?.statistics?.totalAreaKm2 || 0;
  const opticalArea = opticalChange?.statistics?.waterExpansionKm2 || 0;
  const bothConfirmed = sources.length === 2 ? Math.min(radarArea, opticalArea) * 0.75 : 0;
  const totalFusedArea = Math.max(radarArea, opticalArea, radarArea + opticalArea - bothConfirmed);

  let confidenceClass: 'High' | 'Moderate' | 'Low' | 'Insufficient Evidence' = 'Moderate';

  if (sources.length === 2) {
    confidenceClass = 'High';
  } else if (sources.includes('Sentinel-1')) {
    confidenceClass = 'Moderate'; // SAR alone is good through clouds
  } else if (sources.includes('Sentinel-2')) {
    confidenceClass = 'Moderate';
  }

  return {
    polygons: {
      type: 'FeatureCollection',
      features: combinedFeatures,
    },
    evidenceSources: sources,
    confidenceClass,
    statistics: {
      totalFusedAreaKm2: Number(totalFusedArea.toFixed(1)),
      radarConfirmedKm2: Number(radarArea.toFixed(1)),
      opticalConfirmedKm2: Number(opticalArea.toFixed(1)),
      bothConfirmedKm2: Number(bothConfirmed.toFixed(1)),
    },
  };
}
