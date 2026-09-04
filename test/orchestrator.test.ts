import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BenchmarkOrchestrator } from '../src/harness/orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenariosDir = path.resolve(__dirname, '../../scenarios');

describe('BenchmarkOrchestrator Suite', () => {
  it('loads all 7 scenario files from scenarios directory', () => {
    const orchestrator = new BenchmarkOrchestrator();
    const scenarios = orchestrator.loadScenarios(scenariosDir);
    assert.equal(scenarios.length, 7);
    const ids = scenarios.map(s => s.id);
    assert.ok(ids.includes('001-single-agent-cold'));
    assert.ok(ids.includes('004-parallel-arbiter'));
    assert.ok(ids.includes('007-watchdog-dead-worker'));
  });

  it('filters scenarios by scenarioId when specified', () => {
    const orchestrator = new BenchmarkOrchestrator();
    const scenarios = orchestrator.loadScenarios(scenariosDir, '004-parallel-arbiter');
    assert.equal(scenarios.length, 1);
    assert.equal(scenarios[0].id, '004-parallel-arbiter');
  });

  it('executes full suite and aggregates summary metrics', async () => {
    const orchestrator = new BenchmarkOrchestrator();
    const scenarios = orchestrator.loadScenarios(scenariosDir);
    const summary = await orchestrator.runSuite(scenarios, 'deterministic');

    assert.equal(summary.totalScenarios, 7);
    assert.equal(summary.passedScenarios, 7);
    assert.equal(summary.failedScenarios, 0);
    assert.ok(summary.totalDurationMs >= 0);
    assert.ok(summary.heapUsedMb > 0);
    assert.equal(summary.tier, 'deterministic');
  });
});
