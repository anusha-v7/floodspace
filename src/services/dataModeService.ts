/**
 * FLOODTRACE AI - Central Data Mode Service
 * Manages AUTO, LIVE, and DEMO operational data pathways
 */

import { DataMode } from '../types';

export interface DataModeState {
  mode: DataMode; // User selected mode
  effectiveMode: 'live' | 'demo'; // What is actually being served right now
  isLiveAvailable: boolean;
  cdseConfigured: boolean;
  activeSourceLabel: string;
  lastErrorMessage?: string;
}

class DataModeManager {
  private currentMode: DataMode = 'auto';
  private effectiveMode: 'live' | 'demo' = 'demo';
  private isLiveAvailable: boolean = true;
  private cdseConfigured: boolean = false;
  private activeSourceLabel: string = 'DEMO / SIMULATED PROTOTYPE';
  private lastErrorMessage?: string;
  private listeners: ((state: DataModeState) => void)[] = [];

  constructor() {
    this.checkLiveStatus();
  }

  public async checkLiveStatus(): Promise<void> {
    try {
      const resp = await fetch('/api/cdse/status');
      if (resp.ok) {
        const data = await resp.json();
        this.cdseConfigured = Boolean(data.hasCredentials);
        this.isLiveAvailable = true; // Public discovery STAC + ohsome are available
      }
    } catch {
      // In purely browser or offline environments
      this.isLiveAvailable = true; // Still allow client-side STAC & ohsome direct queries
    }
    this.recomputeEffectiveMode();
  }

  public getMode(): DataMode {
    return this.currentMode;
  }

  public getEffectiveMode(): 'live' | 'demo' {
    return this.effectiveMode;
  }

  public getState(): DataModeState {
    return {
      mode: this.currentMode,
      effectiveMode: this.effectiveMode,
      isLiveAvailable: this.isLiveAvailable,
      cdseConfigured: this.cdseConfigured,
      activeSourceLabel: this.activeSourceLabel,
      lastErrorMessage: this.lastErrorMessage,
    };
  }

  public setMode(mode: DataMode): void {
    this.currentMode = mode;
    this.recomputeEffectiveMode();
    this.notify();
  }

  public reportLiveError(msg: string): void {
    this.lastErrorMessage = msg;
    if (this.currentMode === 'auto') {
      this.effectiveMode = 'demo';
      this.activeSourceLabel = 'DEMO FALLBACK (LIVE QUERY ISSUE)';
    } else if (this.currentMode === 'live') {
      this.activeSourceLabel = 'LIVE ERROR: ' + msg;
    }
    this.notify();
  }

  public reportLiveSuccess(sourceName: string): void {
    this.lastErrorMessage = undefined;
    this.effectiveMode = 'live';
    this.activeSourceLabel = `LIVE SATELLITE & OSM (${sourceName})`;
    this.notify();
  }

  private recomputeEffectiveMode(): void {
    if (this.currentMode === 'demo') {
      this.effectiveMode = 'demo';
      this.activeSourceLabel = 'DEMO / PROTOTYPE SIMULATION';
    } else if (this.currentMode === 'live') {
      this.effectiveMode = 'live';
      this.activeSourceLabel = 'LIVE ORBITAL SATELLITE & OSM';
    } else {
      // AUTO mode: defaults to live if pipeline is executed, otherwise ready
      this.effectiveMode = 'demo'; // Initial state is demo until live analysis runs
      this.activeSourceLabel = 'AUTO (DEMO BASELINE READY)';
    }
  }

  public subscribe(cb: (state: DataModeState) => void): () => void {
    this.listeners.push(cb);
    cb(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    const st = this.getState();
    this.listeners.forEach((l) => l(st));
  }
}

export const dataModeService = new DataModeManager();
