/**
 * FLOODTRACE AI - Global Analysis & Data Mode Context
 * Synchronizes user-selected cases, live analysis results, and active data mode across all screens.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CaseConfiguration,
  DataMode,
  FullAnalysisRunResult,
  ProcessingStage,
} from '../types';
import { createDefaultCaseConfig } from '../services/analysis/caseConfigService';
import { INITIAL_STAGES, runFullAnalysisPipeline } from '../services/analysis/processingWorkflowService';
import { dataModeService, DataModeState } from '../services/dataModeService';

interface AnalysisContextType {
  caseConfig: CaseConfiguration;
  setCaseConfig: (config: CaseConfiguration) => void;
  dataModeState: DataModeState;
  setDataMode: (mode: DataMode) => void;
  isAnalyzing: boolean;
  stages: ProcessingStage[];
  analysisResult: FullAnalysisRunResult | null;
  runAnalysis: (overrideConfig?: CaseConfiguration) => Promise<FullAnalysisRunResult>;
  resetToDemo: () => void;
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [caseConfig, setCaseConfig] = useState<CaseConfiguration>(createDefaultCaseConfig);
  const [dataModeState, setDataModeState] = useState<DataModeState>(dataModeService.getState());
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [stages, setStages] = useState<ProcessingStage[]>(INITIAL_STAGES);
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisRunResult | null>(null);

  useEffect(() => {
    const unsub = dataModeService.subscribe((state) => {
      setDataModeState(state);
    });
    return unsub;
  }, []);

  const handleSetDataMode = (mode: DataMode) => {
    dataModeService.setMode(mode);
  };

  const runAnalysis = async (overrideConfig?: CaseConfiguration): Promise<FullAnalysisRunResult> => {
    const targetConfig = overrideConfig || caseConfig;
    setIsAnalyzing(true);
    setStages(JSON.parse(JSON.stringify(INITIAL_STAGES)));

    try {
      const result = await runFullAnalysisPipeline(targetConfig, (updatedStages) => {
        setStages(updatedStages);
      });
      setAnalysisResult(result);
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetToDemo = () => {
    setAnalysisResult(null);
    setStages(INITIAL_STAGES);
    dataModeService.setMode('demo');
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  return (
    <AnalysisContext.Provider
      value={{
        caseConfig,
        setCaseConfig,
        dataModeState,
        setDataMode: handleSetDataMode,
        isAnalyzing,
        stages,
        analysisResult,
        runAnalysis,
        resetToDemo,
        toast,
        showToast,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
