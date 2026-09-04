import { BaseScenario, ScenarioResult } from '../types.js';
import { SeededRNG } from './deterministic.js';

/**
 * ProcessPoolAdapter — Tier 3 Comparative Process Pool Baseline
 * 
 * Simulates worker process-pool execution without filesystem worktree isolation.
 * Workers run in parallel processes but operate against a shared Git checkout,
 * resulting in .git/index.lock contention and cross-worker dirty file writes.
 */
export class ProcessPoolAdapter {
  private rng = new SeededRNG(0x504F4F4C); // "POOL"

  async execute(scenario: BaseScenario): Promise<ScenarioResult> {
    const startTime = process.hrtime.bigint();
    const concurrency = typeof scenario.concurrency === 'number' ? scenario.concurrency : 3;

    // Simulate process pool dispatch and index lock contention
    const poolOverheadMs = (concurrency * 0.8) + (this.rng.next() * 1.2);
    const hasIndexContention = concurrency > 2;
    const lockContentionCount = hasIndexContention ? concurrency - 1 : 0;

    const isConflict = scenario.id.includes('conflict') || scenario.id.includes('chaos') || scenario.id.includes('no-isolation');
    const mainBranchValid = !isConflict && concurrency <= 3;
    const accuracy = mainBranchValid ? 80 : 50;

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6 + poolOverheadMs;

    return {
      scenarioId: scenario.id,
      title: scenario.title,
      tier: 'process_pool',
      passed: mainBranchValid,
      metrics: {
        durationMs: Number(durationMs.toFixed(2)),
        tokensTotal: 2200,
        worktreesProvisioned: 0,
        worktreesIsolated: false,
        conflictsDetected: isConflict ? 1 : 0,
        conflictsResolved: 0,
        mainBranchValid,
        accuracyPercent: accuracy,
        lockContentionCount,
        details: {
          coordinationStrategy: 'PROCESS_POOL_SHARED_WORKTREE',
          gitIndexLockCollisions: lockContentionCount,
          dirtyWorkingTree: !mainBranchValid
        }
      }
    };
  }
}
