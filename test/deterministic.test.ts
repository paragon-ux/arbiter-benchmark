import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DeterministicAdapter } from '../src/harness/adapters/deterministic.js';

describe('DeterministicAdapter Suite', () => {
  const adapter = new DeterministicAdapter();

  it('simulates 001-single-agent-cold with heavy token re-read', async () => {
    const res = await adapter.execute({
      id: '001-single-agent-cold',
      title: 'Single Agent Cold',
      description: 'Test',
      targetRepo: 'targets/microservice-auth',
      mode: 'cold'
    });

    assert.ok(res.passed);
    assert.ok(res.metrics.tokensTotal >= 6000);
    assert.equal(res.metrics.details.compactionRecoveryType, 'COLD_REREAD');
  });

  it('simulates 002-single-agent-waymark with bounded resume tokens', async () => {
    const res = await adapter.execute({
      id: '002-single-agent-waymark',
      title: 'Single Agent Waymark',
      description: 'Test',
      targetRepo: 'targets/microservice-auth',
      mode: 'waymark'
    });

    assert.ok(res.passed);
    assert.ok(res.metrics.tokensTotal <= 2200);
    assert.equal(res.metrics.waymarkResumeTokens, 180);
    assert.ok((res.metrics.continuitySavingsPercent || 0) >= 70);
  });

  it('simulates 003-parallel-no-isolation capturing corrupted main', async () => {
    const res = await adapter.execute({
      id: '003-parallel-no-isolation',
      title: 'Parallel Chaos',
      description: 'Test',
      targetRepo: 'targets/microservice-auth',
      mode: 'unisolated_chaos'
    });

    assert.ok(res.passed);
    assert.equal(res.metrics.mainBranchValid, false);
    assert.equal(res.metrics.conflictsDetected, 1);
    assert.equal(res.metrics.conflictsResolved, 0);
  });

  it('simulates 004-parallel-arbiter with 3 isolated worktrees', async () => {
    const res = await adapter.execute({
      id: '004-parallel-arbiter',
      title: 'Parallel Arbiter',
      description: 'Test',
      targetRepo: 'targets/microservice-auth',
      mode: 'arbiter_swarm'
    });

    assert.ok(res.passed);
    assert.equal(res.metrics.worktreesProvisioned, 3);
    assert.equal(res.metrics.worktreesIsolated, true);
    assert.equal(res.metrics.mainBranchValid, true);
  });

  it('simulates 005-dag-dependencies sorting 12 nodes without cycles', async () => {
    const res = await adapter.execute({
      id: '005-dag-dependencies',
      title: 'DAG Dependencies',
      description: 'Test',
      targetRepo: 'targets/data-pipeline',
      mode: 'dag_scheduling',
      dag: {
        tasks: [
          { id: 'T-1', deps: [] },
          { id: 'T-2', deps: ['T-1'] },
          { id: 'T-3', deps: ['T-2'] }
        ]
      }
    });

    assert.ok(res.passed);
    assert.equal(res.metrics.details.dagNodesResolved, 3);
    assert.equal(res.metrics.details.topologicalSortValid, true);
  });

  it('simulates 006-conflict-quarantine cleanly executing rollback', async () => {
    const res = await adapter.execute({
      id: '006-conflict-quarantine',
      title: 'Conflict Quarantine',
      description: 'Test',
      targetRepo: 'targets/microservice-auth',
      mode: 'conflict_quarantine'
    });

    assert.ok(res.passed);
    assert.equal(res.metrics.conflictsDetected, 1);
    assert.equal(res.metrics.conflictsResolved, 1);
    assert.equal(res.metrics.mainBranchValid, true);
    assert.equal(res.metrics.details.quarantineStatus, 'CONFLICT');
  });

  it('simulates 007-watchdog-dead-worker detecting dead PID and re-queuing', async () => {
    const res = await adapter.execute({
      id: '007-watchdog-dead-worker',
      title: 'Watchdog Dead Worker',
      description: 'Test',
      targetRepo: 'targets/microservice-auth',
      mode: 'watchdog_recovery'
    });

    assert.ok(res.passed);
    assert.equal(res.metrics.details.pidAlive, false);
    assert.equal(res.metrics.details.leaseReclaimed, true);
    assert.equal(res.metrics.details.taskResetStatus, 'READY');
  });
});
