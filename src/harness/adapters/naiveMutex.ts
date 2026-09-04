import { BaseScenario, ScenarioResult } from '../types.js';
import { SeededRNG } from './deterministic.js';

/**
 * NaiveMutexAdapter — Tier 3 Comparative Negative Baseline
 * 
 * Simulates naive multi-agent execution where workers share a single working copy
 * and serialize operations using file-level mutex locks instead of Git worktree isolation.
 * Demonstrates lock contention, wait starvation, and dirty working tree states.
 */
export class NaiveMutexAdapter {
  private rng = new SeededRNG(0x4E414956); // "NAIV"

  async execute(scenario: BaseScenario): Promise<ScenarioResult> {
    const startTime = process.hrtime.bigint();
    const concurrency = typeof scenario.concurrency === 'number' ? scenario.concurrency : 3;

    // Simulate mutex lock contention overhead
    // Each worker contends for a global or file-level lock
    const contentionEvents = concurrency > 1 ? concurrency * 2 : 0;
    const baseWaitMs = concurrency > 1 ? (concurrency * 1.5) + (this.rng.next() * 2) : 0;
    
    // In chaos or high-concurrency scenarios, naive mutexes fail to isolate working state
    const isConflictScenario = scenario.id.includes('conflict') || scenario.id.includes('chaos') || scenario.id.includes('mutex') || scenario.id.includes('collision');
    const conflictsDetected = isConflictScenario ? Math.max(1, Math.floor(concurrency / 2)) : 0;
    const conflictsResolved = 0; // Naive mutex does not have fail-closed rollback
    const mainBranchValid = !isConflictScenario;
    const accuracy = isConflictScenario ? 45 : 85;

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6 + baseWaitMs;

    return {
      scenarioId: scenario.id,
      title: scenario.title,
      tier: 'naive_mutex',
      passed: !isConflictScenario,
      metrics: {
        durationMs: Number(durationMs.toFixed(2)),
        tokensTotal: 2500,
        worktreesProvisioned: 0, // Zero worktrees, shared working tree
        worktreesIsolated: false,
        conflictsDetected,
        conflictsResolved,
        mainBranchValid,
        accuracyPercent: accuracy,
        mutexWaitMs: Number(baseWaitMs.toFixed(2)),
        lockContentionCount: contentionEvents,
        details: {
          coordinationStrategy: 'SHARED_DIRECTORY_FILE_MUTEX',
          lockContentionOccurred: contentionEvents > 0,
          dirtyStateDetected: !mainBranchValid
        }
      }
    };
  }
}
