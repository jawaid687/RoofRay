/**
 * Dedicated Web Worker for Off-Thread Annual Solar Analysis (PRD FR-6.4).
 * Offloads 12-month irradiance raycasts and shading calculations so the UI never blocks.
 */

import { runAnnualAnalysisSync, AnnualAnalysisParams } from './annualAnalysis';

let activeAnalysisId: string | null = null;
let isCancelled = false;

self.onmessage = (event: MessageEvent) => {
  const { type, id, params } = event.data;

  if (type === 'CANCEL') {
    if (activeAnalysisId === id || !id) {
      isCancelled = true;
      activeAnalysisId = null;
      self.postMessage({ type: 'CANCELLED', id });
    }
    return;
  }

  if (type === 'START') {
    activeAnalysisId = id;
    isCancelled = false;

    try {
      const output = runAnnualAnalysisSync({
        ...(params as AnnualAnalysisParams),
        onProgress: (progress: number) => {
          if (!isCancelled && activeAnalysisId === id) {
            self.postMessage({ type: 'PROGRESS', id, progress });
          }
        },
        shouldCancel: () => isCancelled || activeAnalysisId !== id,
      });

      if (!isCancelled && activeAnalysisId === id) {
        self.postMessage({ type: 'COMPLETE', id, output });
      }
    } catch (err: unknown) {
      if (isCancelled || activeAnalysisId !== id) {
        self.postMessage({ type: 'CANCELLED', id });
      } else {
        self.postMessage({
          type: 'ERROR',
          id,
          error: err instanceof Error ? err.message : 'Annual analysis worker failed',
        });
      }
    } finally {
      if (activeAnalysisId === id) {
        activeAnalysisId = null;
      }
    }
  }
};
