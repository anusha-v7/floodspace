/**
 * FLOODTRACE AI - Satellite Imagery Service
 * Interface for Sentinel-1 (SAR), Sentinel-2 (Optical) and DEM data access
 */

import { MOCK_SATELLITE_CATALOG } from '../data/mockData';
import { SatelliteMetadata } from '../types';
import { ApiResponse, simulateNetworkDelay } from './api';

export async function getSatelliteCatalog(): Promise<ApiResponse<SatelliteMetadata[]>> {
  return simulateNetworkDelay(MOCK_SATELLITE_CATALOG);
}

export async function getImageryByMission(mission: string): Promise<ApiResponse<SatelliteMetadata[]>> {
  const filtered = MOCK_SATELLITE_CATALOG.filter((item) => item.mission === mission);
  return simulateNetworkDelay(filtered);
}

export interface BeforeAfterPair {
  mission: 'Sentinel-1' | 'Sentinel-2';
  sensorLabel: string;
  preEvent: SatelliteMetadata;
  postEvent: SatelliteMetadata;
  notes: string;
}

export async function getBeforeAfterPairs(): Promise<ApiResponse<BeforeAfterPair[]>> {
  const s1Pre = MOCK_SATELLITE_CATALOG.find((s) => s.id === 'sat-s1-pre')!;
  const s1Post = MOCK_SATELLITE_CATALOG.find((s) => s.id === 'sat-s1-post')!;
  const s2Pre = MOCK_SATELLITE_CATALOG.find((s) => s.id === 'sat-s2-pre')!;
  const s2Post = MOCK_SATELLITE_CATALOG.find((s) => s.id === 'sat-s2-post')!;

  const pairs: BeforeAfterPair[] = [
    {
      mission: 'Sentinel-1',
      sensorLabel: 'C-band SAR (Cloud-Penetrating Radar)',
      preEvent: s1Pre,
      postEvent: s1Post,
      notes: 'Active radar penetrates monsoon cloud cover. Detects smooth water bodies via specular microwave reflectance and rough debris flows via backscatter texture change.',
    },
    {
      mission: 'Sentinel-2',
      sensorLabel: 'Multispectral Optical (10m Resolution)',
      preEvent: s2Pre,
      postEvent: s2Post,
      notes: 'High spatial resolution optical bands provide direct color and spectral index confirmation (MNDWI / NDWI) through cloud gaps.',
    },
  ];

  return simulateNetworkDelay(pairs);
}
