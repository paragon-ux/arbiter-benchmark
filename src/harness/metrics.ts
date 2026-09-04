import { ScenarioMetrics } from './types.js';

export class MetricsCollector {
  private startTime = 0;
  private metrics: ScenarioMetrics = {
    durationMs: 0,
    tokensTotal: 0,
    conflictsDetected: 0,
    conflictsResolved: 0,
    mainBranchValid: true,
    accuracyPercent: 100,
    details: {}
  };

  start(): void {
    this.startTime = performance.now();
  }

  addTokens(count: number): void {
    this.metrics.tokensTotal += count;
  }

  addTokensFromText(text: string): void {
    const tokens = Math.ceil(text.length / 3.8);
    this.metrics.tokensTotal += tokens;
  }

  recordConflict(resolved = false): void {
    this.metrics.conflictsDetected++;
    if (resolved) this.metrics.conflictsResolved++;
  }

  setMainValidity(valid: boolean): void {
    this.metrics.mainBranchValid = valid;
  }

  setAccuracy(percent: number): void {
    this.metrics.accuracyPercent = percent;
  }

  setDetail(key: string, value: unknown): void {
    this.metrics.details[key] = value;
  }

  finish(): ScenarioMetrics {
    this.metrics.durationMs = Math.round((performance.now() - this.startTime) * 100) / 100;
    return { ...this.metrics };
  }
}

export function estimateMemoryUsage(): { heapUsedMb: number; rssMb: number } {
  const mem = process.memoryUsage();
  return {
    heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
    rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100
  };
}
