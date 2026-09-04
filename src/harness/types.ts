export type ExecutionTier = 'deterministic' | 'agy';

export interface BaseScenario {
  id: string;
  title: string;
  description: string;
  targetRepo: string;
  mode: string;
  expectedMetrics?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ScenarioMetrics {
  durationMs: number;
  tokensTotal: number;
  waymarkResumeTokens?: number;
  tokensSaved?: number;
  continuitySavingsPercent?: number;
  worktreesProvisioned?: number;
  worktreesIsolated?: boolean;
  conflictsDetected: number;
  conflictsResolved: number;
  mainBranchValid: boolean;
  accuracyPercent: number;
  details: Record<string, unknown>;
}

export interface ScenarioResult {
  scenarioId: string;
  title: string;
  tier: ExecutionTier;
  passed: boolean;
  metrics: ScenarioMetrics;
  error?: string;
}

export interface BenchmarkSummary {
  timestamp: string;
  nodeVersion: string;
  platform: string;
  tier: ExecutionTier;
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  totalDurationMs: number;
  averageSavingsPercent: number;
  heapUsedMb: number;
  results: ScenarioResult[];
}
