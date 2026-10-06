/**
 * FLOODTRACE AI - Core Type Definitions
 * Track B: Mapping Flood Damage from Space
 */

export type ImpactStatus = 'affected' | 'potentially_affected' | 'unaffected' | 'requires_verification';
export type ConnectivityStatus = 'connected' | 'partially_connected' | 'cut_off';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type AssetCategory = 'hospital' | 'bridge' | 'road' | 'school' | 'emergency_facility' | 'town' | 'shelter';

// Central Data Mode system (Prompt 2)
export type DataMode = 'live' | 'demo' | 'auto';

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CaseConfiguration {
  caseName: string;
  regionName: string;
  country: string;
  eventDate: string; // YYYY-MM-DD
  bbox: BoundingBox;
  center?: [number, number]; // [lat, lng]
  radiusKm?: number;
  beforeStart: string; // YYYY-MM-DD
  beforeEnd: string; // YYYY-MM-DD
  afterStart: string; // YYYY-MM-DD
  afterEnd: string; // YYYY-MM-DD
  osmSnapshotDate?: string; // Pre-event OSM snapshot timestamp
  geometry?: any; // GeoJSON polygon
}

export interface FloodZone {
  id: string;
  name: string;
  zoneCode: string;
  affectedAreaKm2: number;
  inundationAreaKm2: number;
  debrisAreaKm2: number;
  severity: 'extreme' | 'severe' | 'moderate';
  confidence: 'high' | 'moderate';
  coordinates: [number, number][]; // Polygon vertices [lat, lng]
  description: string;
}

export interface Settlement {
  id: string;
  name: string;
  nepaliName?: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  elevationM: number;
  populationEstimate: number; // Visibly labelled as DEMO when simulated
  connectivityStatus: ConnectivityStatus;
  floodExposure: 'direct' | 'perimeter' | 'isolated_dry';
  nearestTown: string;
  distanceToTownKm: number;
  nearestHospital: string;
  distanceToHospitalKm: number;
  roadAccessStatus: string;
  priority: PriorityLevel;
  affectedRoadSegments: string[];
  recommendedAction: string;
  notes: string;
  isLiveAnalysis?: boolean;
}

export interface CriticalAsset {
  id: string;
  name: string;
  category: AssetCategory;
  coordinates: [number, number];
  locationName: string;
  floodExposure: 'inundated' | 'debris_impacted' | 'threatened' | 'safe';
  roadAccess: 'severed' | 'restricted' | 'clear';
  status: ImpactStatus;
  priority: PriorityLevel;
  confidence: 'high' | 'moderate' | 'low';
  capacityOrLength?: string;
  damageDescription: string;
  isLiveAnalysis?: boolean;
}

export interface RoadSegment {
  id: string;
  name: string;
  type: 'highway' | 'arterial' | 'feeder' | 'access_track';
  coordinates: [number, number][]; // Polyline points [lat, lng]
  lengthKm: number;
  status: 'open' | 'blocked' | 'washed_out' | 'restricted';
  hazardType: 'flooded' | 'debris_covered' | 'bridge_failure' | 'none';
  affectedByZoneId: string;
  servesSettlementIds: string[];
  isLiveAnalysis?: boolean;
}

export interface SatelliteMetadata {
  id: string;
  mission: 'Sentinel-1' | 'Sentinel-2' | 'Copernicus DEM' | 'WorldDEM-30';
  sensorType: 'SAR (C-band Radar)' | 'Multispectral Optical' | 'Radar Interferometry DEM';
  acquisitionDate: string;
  eventPhase: 'pre_event' | 'post_event';
  orbitTrack: string;
  resolution: string;
  cloudCoverPercent?: number;
  polarizationOrBands: string;
  processingLevel: string;
  status: string;
  thumbnailPlaceholderUrl?: string;
}

export interface CaseStudyMetadata {
  id: string;
  name: string;
  region: string;
  country: string;
  eventDate: string;
  status: string;
  lastAnalysisTimestamp: string;
  centerCoordinates: [number, number];
  zoomLevel: number;
  summary: string;
}

export interface VerifiedSystemFacts {
  totalMonitoredAreaKm2: number;
  totalAffectedAreaKm2: number;
  floodInundationAreaKm2: number;
  debrisDepositAreaKm2: number;
  estimatedDamagedBuildings: number;
  affectedRoadsKm: number;
  totalRoadsKm: number;
  affectedBridgesCount: number;
  totalBridgesCount: number;
  cutOffSettlementsCount: number;
  totalSettlementsCount: number;
  cutOffPopulationEstimate: number;
  criticalHospitalsCount: number;
  compromisedHospitalsCount: number;
  topPrioritySettlements: string[];
  mostDamagedSector: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  groundedFactsUsed?: string[];
  suggestedQuestions?: string[];
}

// =======================================================================
// PROMPT 2 EXTENDED TYPES: CDSE, OHSoME, REMOTE SENSING & REAL GRAPH ANALYSIS
// =======================================================================

export interface CdseProduct {
  id: string;
  collection: string; // e.g. "SENTINEL-1" or "SENTINEL-2"
  platform: string; // "Sentinel-1A", "Sentinel-2B", etc.
  sensor: string; // "C-SAR", "MSI"
  acquisitionTime: string; // ISO 8601
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  geometry: any; // GeoJSON geometry
  cloudCover?: number; // 0 - 100 for optical
  orbit?: string;
  relativeOrbit?: number;
  orbitDirection?: 'ASCENDING' | 'DESCENDING';
  productType: string; // "GRD", "SLC", "L2A", "L1C"
  downloadUrl?: string;
  previewUrl?: string;
  source: 'CDSE_API' | 'CDSE_STAC' | 'SIMULATED_BASELINE';
}

export interface SentinelPair {
  before: CdseProduct;
  after: CdseProduct;
  pairingReason: string;
  orbitCompatibility: 'matching' | 'different_tracks' | 'unknown';
  acquisitionGapDays: number;
  qualityNotes: string;
}

export interface RadarChangeResult {
  changePolygons: any; // GeoJSON FeatureCollection
  statistics: {
    totalAreaKm2: number;
    highBackscatterChangeKm2: number;
    meanLogRatioDb: number;
  };
  confidence: 'high' | 'moderate' | 'low';
  method: string;
  sourceScenes: { before: string; after: string };
}

export interface OpticalChangeResult {
  candidateFloodedPolygons: any; // GeoJSON FeatureCollection
  statistics: {
    waterExpansionKm2: number;
    meanNdwiDelta: number;
  };
  qualityNotes: string;
  method: string;
  sourceScenes: { before: string; after: string };
}

export interface FusedEvidenceResult {
  polygons: any; // GeoJSON FeatureCollection
  evidenceSources: ('Sentinel-1' | 'Sentinel-2')[];
  confidenceClass: 'High' | 'Moderate' | 'Low' | 'Insufficient Evidence';
  statistics: {
    totalFusedAreaKm2: number;
    radarConfirmedKm2: number;
    opticalConfirmedKm2: number;
    bothConfirmedKm2: number;
  };
}

export interface NormalizedOsmBuilding {
  id: string;
  geometry: any; // Polygon
  properties: {
    name?: string;
    buildingType?: string;
    levels?: number;
  };
  source: string;
}

export interface NormalizedOsmRoad {
  id: string;
  geometry: any; // LineString
  highwayType: string;
  properties: {
    name?: string;
    surface?: string;
    bridge?: boolean;
    ref?: string;
    lanes?: number;
  };
  source: string;
}

export interface NormalizedOsmBridge {
  id: string;
  geometry: any; // Point or LineString
  roadId?: string;
  properties: {
    name?: string;
    structure?: string;
    lengthM?: number;
  };
  source: string;
}

export interface NormalizedOsmSettlement {
  id: string;
  geometry: any; // Point
  name: string;
  properties: {
    place?: string; // village, hamlet, town
    district?: string;
    population?: number;
    nepaliName?: string;
  };
  source: string;
}

export interface NormalizedOsmFacility {
  id: string;
  geometry: any; // Point or Polygon
  name: string;
  category: 'hospital' | 'school' | 'emergency' | 'town_hall';
  properties: Record<string, any>;
  source: string;
}

export interface HistoricalOsmBundle {
  snapshotDate: string;
  buildings: NormalizedOsmBuilding[];
  roads: NormalizedOsmRoad[];
  bridges: NormalizedOsmBridge[];
  settlements: NormalizedOsmSettlement[];
  facilities: NormalizedOsmFacility[];
  queryBbox: BoundingBox;
  sourceProvider: string;
}

export interface AssetImpactRecord {
  assetId: string;
  name: string;
  category: AssetCategory;
  coordinates: [number, number];
  impactClass: 'Potentially Affected' | 'Likely Affected' | 'Outside Detected Area' | 'Insufficient Evidence';
  distanceToAffectedMeters: number;
  overlapPercent?: number;
  evidenceSource: string;
  damageDescription: string;
  isLive: boolean;
}

export interface GraphConnectivityResult {
  settlementId: string;
  settlementName: string;
  nepaliName?: string;
  coordinates: [number, number];
  nearestTown: string;
  distanceToTownKm: number;
  nearestHospital: string;
  distanceToHospitalKm: number;
  previousConnectivity: 'connected';
  currentConnectivity: 'CONNECTED' | 'PARTIALLY CONNECTED' | 'CUT OFF' | 'UNKNOWN';
  affectedRoadSegments: string[];
  status: string;
  priority: 'Critical' | 'High' | 'Moderate' | 'Low' | 'Unknown';
  priorityReason: string;
  pathGeometry?: [number, number][]; // Route line coordinates for map visualization
}

export interface ProcessingStage {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'warning' | 'failed';
  detail?: string;
  timestamp?: string;
}

export interface DataQualityReport {
  satelliteStatus: 'FOUND' | 'PARTIAL' | 'NOT FOUND';
  sentinel1Status: string;
  sentinel2Status: string;
  osmStatus: string;
  roadNetworkStatus: string;
  analysisStatus: string;
  warnings: string[];
}

export interface FullAnalysisRunResult {
  runId: string;
  timestamp: string;
  config: CaseConfiguration;
  mode: DataMode;
  dataQuality: DataQualityReport;
  sentinel1Pair?: SentinelPair;
  sentinel2Pair?: SentinelPair;
  radarChange?: RadarChangeResult;
  opticalChange?: OpticalChangeResult;
  fusedEvidence: FusedEvidenceResult;
  osmBundle: HistoricalOsmBundle;
  impactedAssets: AssetImpactRecord[];
  connectivityResults: GraphConnectivityResult[];
  cutOffSettlementsCount: number;
  severedRoadsKm: number;
  compromisedBridgesCount: number;
  affectedBuildingsCount: number;
}
