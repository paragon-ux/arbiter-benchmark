import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MetricsCollector, estimateMemoryUsage } from '../src/harness/metrics.js';

describe('MetricsCollector Suite', () => {
  it('accumulates tokens and computes duration accurately', async () => {
    const collector = new MetricsCollector();
    collector.start();

    collector.addTokens(500);
    collector.addTokensFromText('A short phrase for token estimation'); // ~36 chars -> 10 tokens
    collector.recordConflict(true);
    collector.setAccuracy(95);

    // Artificial delay
    await new Promise(r => setTimeout(r, 10));

    const metrics = collector.finish();
    assert.ok(metrics.durationMs >= 8);
    assert.equal(metrics.tokensTotal, 510);
    assert.equal(metrics.conflictsDetected, 1);
    assert.equal(metrics.conflictsResolved, 1);
    assert.equal(metrics.accuracyPercent, 95);
  });

  it('estimates process memory usage within reasonable bounds', () => {
    const mem = estimateMemoryUsage();
    assert.ok(mem.heapUsedMb > 0);
    assert.ok(mem.rssMb > 0);
    assert.ok(mem.rssMb >= mem.heapUsedMb);
  });
});
