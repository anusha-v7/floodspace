/**
 * FLOODTRACE AI - API Base Service
 * Abstraction layer for HTTP client and future FastAPI backend endpoints
 */

export interface ApiResponse<T> {
  data: T;
  isDemoData: boolean;
  timestamp: string;
  source: string;
}

const SIMULATED_LATENCY_MS = 120;

export async function simulateNetworkDelay<T>(data: T): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        isDemoData: true,
        timestamp: new Date().toISOString(),
        source: 'FLOODTRACE_PROTOTYPE_SIMULATED_DATA',
      });
    }, SIMULATED_LATENCY_MS);
  });
}
