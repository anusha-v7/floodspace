/**
 * FLOODTRACE AI - Case & AOI Configuration Service
 * Normalizes and validates user-specified analysis extents for live satellite and OSM queries
 */

import { BoundingBox, CaseConfiguration } from '../../types';

export interface CasePreset {
  id: string;
  name: string;
  region: string;
  country: string;
  eventDate: string;
  bbox: BoundingBox;
  description: string;
  defaultBeforeWindow: { start: string; end: string };
  defaultAfterWindow: { start: string; end: string };
}

export const CASE_PRESETS: CasePreset[] = [
  {
    id: 'trishuli-2026',
    name: 'Trishuli River Corridor Surge',
    region: 'Nuwakot & Rasuwa Districts',
    country: 'Nepal',
    eventDate: '2026-08-26',
    bbox: {
      north: 28.25,
      south: 27.90,
      east: 85.40,
      west: 85.15,
    },
    description: 'Catastrophic monsoon flood and debris flow severing Pasang Lhamu Highway (NH09) and isolating 7 mountain settlements.',
    defaultBeforeWindow: { start: '2026-08-10', end: '2026-08-25' },
    defaultAfterWindow: { start: '2026-08-26', end: '2026-08-31' },
  },
  {
    id: 'melamchi-2021',
    name: 'Melamchi Valley GLOF & Debris Torrent',
    region: 'Sindhupalchok District',
    country: 'Nepal',
    eventDate: '2021-06-15',
    bbox: {
      north: 28.05,
      south: 27.80,
      east: 85.65,
      west: 85.45,
    },
    description: 'Historical benchmark flash flood: Upper glacial outburst flood and sediment cascade destroyed Melamchi Bazaar bridges.',
    defaultBeforeWindow: { start: '2021-06-01', end: '2021-06-14' },
    defaultAfterWindow: { start: '2021-06-15', end: '2021-06-25' },
  },
  {
    id: 'karnali-2022',
    name: 'Lower Karnali River Basin Inundation',
    region: 'Bardiya & Kailali Districts',
    country: 'Nepal',
    eventDate: '2022-10-08',
    bbox: {
      north: 28.65,
      south: 28.30,
      east: 81.35,
      west: 81.00,
    },
    description: 'Late monsoon extreme precipitation causing wide-area floodplain inundation over agricultural plains.',
    defaultBeforeWindow: { start: '2022-09-20', end: '2022-10-07' },
    defaultAfterWindow: { start: '2022-10-08', end: '2022-10-18' },
  },
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateCaseConfiguration(config: Partial<CaseConfiguration>): ValidationResult {
  const errors: string[] = [];

  if (!config.caseName || config.caseName.trim().length === 0) {
    errors.push('Case Name is required.');
  }

  if (!config.eventDate) {
    errors.push('Event Date is required.');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(config.eventDate)) {
    errors.push('Event Date must be in YYYY-MM-DD format.');
  }

  if (!config.bbox) {
    errors.push('Bounding box (north, south, east, west) is required.');
  } else {
    const { north, south, east, west } = config.bbox;
    if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
      errors.push('All bounding box coordinates must be valid numbers.');
    } else {
      if (north <= south) {
        errors.push('Bounding box North latitude must be strictly greater than South latitude.');
      }
      if (east <= west) {
        errors.push('Bounding box East longitude must be strictly greater than West longitude.');
      }
      if (north > 90 || north < -90 || south > 90 || south < -90) {
        errors.push('Latitudes must be between -90 and 90 degrees.');
      }
      if (east > 180 || east < -180 || west > 180 || west < -180) {
        errors.push('Longitudes must be between -180 and 180 degrees.');
      }
    }
  }

  if (!config.beforeStart || !config.beforeEnd) {
    errors.push('Before imagery window (start and end dates) is required.');
  } else if (config.beforeStart > config.beforeEnd) {
    errors.push('Before window Start date must be on or before Before window End date.');
  } else if (config.eventDate && config.beforeEnd >= config.eventDate) {
    errors.push('Before imagery window must strictly precede the event date.');
  }

  if (!config.afterStart || !config.afterEnd) {
    errors.push('After imagery window (start and end dates) is required.');
  } else if (config.afterStart > config.afterEnd) {
    errors.push('After window Start date must be on or before After window End date.');
  } else if (config.eventDate && config.afterStart < config.eventDate) {
    errors.push('After imagery window must begin on or after the event date.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function bboxToPolygon(bbox: BoundingBox) {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [bbox.west, bbox.north],
        [bbox.east, bbox.north],
        [bbox.east, bbox.south],
        [bbox.west, bbox.south],
        [bbox.west, bbox.north],
      ],
    ],
  };
}

export function centerRadiusToBbox(lat: number, lng: number, radiusKm: number): BoundingBox {
  const latDelta = radiusKm / 111.0;
  const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180.0));
  return {
    north: Number((lat + latDelta).toFixed(4)),
    south: Number((lat - latDelta).toFixed(4)),
    east: Number((lng + lngDelta).toFixed(4)),
    west: Number((lng - lngDelta).toFixed(4)),
  };
}

export function createDefaultCaseConfig(): CaseConfiguration {
  const preset = CASE_PRESETS[0];
  return {
    caseName: preset.name,
    regionName: preset.region,
    country: preset.country,
    eventDate: preset.eventDate,
    bbox: preset.bbox,
    center: [28.025, 85.24],
    radiusKm: 25,
    beforeStart: preset.defaultBeforeWindow.start,
    beforeEnd: preset.defaultBeforeWindow.end,
    afterStart: preset.defaultAfterWindow.start,
    afterEnd: preset.defaultAfterWindow.end,
    osmSnapshotDate: preset.defaultBeforeWindow.end,
    geometry: bboxToPolygon(preset.bbox),
  };
}
