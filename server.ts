import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// CDSE Credentials from Server Environment
const CDSE_CLIENT_ID = process.env.CDSE_CLIENT_ID || '';
const CDSE_CLIENT_SECRET = process.env.CDSE_CLIENT_SECRET || '';
const CDSE_USERNAME = process.env.CDSE_USERNAME || '';
const CDSE_PASSWORD = process.env.CDSE_PASSWORD || '';

// In-memory token cache for CDSE Keycloak
let cdseTokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Obtain or refresh Keycloak OAuth2 token for Copernicus Data Space Ecosystem
 */
async function getCdseToken(): Promise<string | null> {
  if (cdseTokenCache && cdseTokenCache.expiresAt > Date.now() + 60000) {
    return cdseTokenCache.token;
  }

  if (!CDSE_CLIENT_ID && !CDSE_USERNAME) {
    return null;
  }

  try {
    const tokenUrl = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
    const params = new URLSearchParams();

    if (CDSE_CLIENT_ID && CDSE_CLIENT_SECRET) {
      params.append('grant_type', 'client_credentials');
      params.append('client_id', CDSE_CLIENT_ID);
      params.append('client_secret', CDSE_CLIENT_SECRET);
    } else if (CDSE_USERNAME && CDSE_PASSWORD) {
      params.append('grant_type', 'password');
      params.append('username', CDSE_USERNAME);
      params.append('password', CDSE_PASSWORD);
      params.append('client_id', 'cdse-public');
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      console.warn('CDSE token retrieval response not ok:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.access_token) {
      cdseTokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      };
      return data.access_token;
    }
    return null;
  } catch (err) {
    console.warn('Failed to obtain CDSE token:', err);
    return null;
  }
}

// -------------------------------------------------------------
// 1. CDSE Status & Discovery API Endpoints
// -------------------------------------------------------------

app.get('/api/cdse/status', async (req: Request, res: Response) => {
  const hasEnvCredentials = Boolean((CDSE_CLIENT_ID && CDSE_CLIENT_SECRET) || (CDSE_USERNAME && CDSE_PASSWORD));
  res.json({
    hasCredentials: hasEnvCredentials,
    publicDiscoveryAvailable: true,
    stacEndpoint: 'https://catalogue.dataspace.copernicus.eu/stac',
    odataEndpoint: 'https://catalogue.dataspace.copernicus.eu/odata/v1',
  });
});

/**
 * Query STAC or OData catalogue for Sentinel-1 / Sentinel-2 products
 * Can query the public CDSE STAC endpoint without auth for metadata discovery!
 */
app.post('/api/cdse/search', async (req: Request, res: Response) => {
  try {
    const { collection, bbox, startDate, endDate, maxRecords = 20 } = req.body;

    // CDSE STAC API search endpoint (public)
    const stacUrl = 'https://catalogue.dataspace.copernicus.eu/stac/search';
    
    // Map collection names
    // CDSE uses 'SENTINEL-1' and 'SENTINEL-2'
    const stacCollection = collection === 'Sentinel-1' ? 'SENTINEL-1' : 'SENTINEL-2';

    const searchPayload: Record<string, any> = {
      collections: [stacCollection],
      datetime: `${startDate}T00:00:00Z/${endDate}T23:59:59Z`,
      limit: maxRecords,
    };

    if (bbox && Array.isArray(bbox) && bbox.length === 4) {
      searchPayload.bbox = bbox; // [minLon, minLat, maxLon, maxLat]
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/geo+json, application/json',
    };

    // If authenticated token exists, attach Bearer header
    const token = await getCdseToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const stacResp = await fetch(stacUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(searchPayload),
    });

    if (!stacResp.ok) {
      const errText = await stacResp.text();
      return res.status(stacResp.status).json({
        success: false,
        status: stacResp.status,
        message: 'CDSE STAC query returned error',
        details: errText.slice(0, 500),
      });
    }

    const stacData = await stacResp.json();
    return res.json({
      success: true,
      features: stacData.features || [],
      matchedCount: stacData.context?.matched || (stacData.features ? stacData.features.length : 0),
    });
  } catch (error: any) {
    console.error('CDSE STAC search error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal error querying CDSE catalog',
    });
  }
});

// -------------------------------------------------------------
// 2. Ohsome Historical OpenStreetMap API Proxy
// -------------------------------------------------------------

/**
 * Query historical OSM geometries from HeiGIT ohsome API
 * Base: https://api.ohsome.org/v1/data/elements/geometry
 */
app.post('/api/osm/historical', async (req: Request, res: Response) => {
  try {
    const { bbox, time, filter } = req.body;

    if (!bbox || !time || !filter) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: bbox, time (ISO8601), filter',
      });
    }

    // Format bbox as west,south,east,north
    const bboxesStr = `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;
    const params = new URLSearchParams();
    params.append('bboxes', bboxesStr);
    params.append('time', time);
    params.append('filter', filter);

    const ohsomeUrl = 'https://api.ohsome.org/v1/data/elements/geometry';

    const resp = await fetch(ohsomeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({
        success: false,
        status: resp.status,
        message: 'ohsome API returned error',
        details: errText.slice(0, 500),
      });
    }

    const geojsonData = await resp.json();
    return res.json({
      success: true,
      data: geojsonData,
      timestamp: time,
      attribution: '© OpenStreetMap contributors under ODbL via HeiGIT ohsome API',
    });
  } catch (error: any) {
    console.error('ohsome historical OSM query error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal error querying ohsome API',
    });
  }
});

// -------------------------------------------------------------
// 3. Vite Middleware Setup (Development) or Static (Production)
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`FLOODTRACE AI Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
