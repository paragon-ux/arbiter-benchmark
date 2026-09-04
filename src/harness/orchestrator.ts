import fs from 'node:fs';
import path from 'node:path';
import { BaseScenario, BenchmarkSummary, ExecutionTier, ScenarioResult } from './types.js';
import { DeterministicAdapter } from './adapters/deterministic.js';
import { AgyRunnerAdapter } from './adapters/agyRunner.js';
import { estimateMemoryUsage } from './metrics.js';

export class BenchmarkOrchestrator {
  private deterministicAdapter = new DeterministicAdapter();
  private agyAdapter = new AgyRunnerAdapter();

  loadScenarios(scenariosDir: string, scenarioId?: string): BaseScenario[] {
    const files = fs.readdirSync(scenariosDir).filter(f => f.endsWith('.json')).sort();
    const scenarios: BaseScenario[] = [];

    for (const f of files) {
      const content = fs.readFileSync(path.join(scenariosDir, f), 'utf8');
      const parsed: BaseScenario = JSON.parse(content);
      if (!scenarioId || parsed.id === scenarioId) {
        scenarios.push(parsed);
      }
    }

    return scenarios;
  }

  async runSuite(scenarios: BaseScenario[], tier: ExecutionTier = 'deterministic'): Promise<BenchmarkSummary> {
    const startTime = performance.now();
    const results: ScenarioResult[] = [];

    for (const scenario of scenarios) {
      let result: ScenarioResult;
      if (tier === 'agy') {
        result = await this.agyAdapter.execute(scenario);
      } else {
        result = await this.deterministicAdapter.execute(scenario);
      }
      results.push(result);
    }

    const totalDuration = performance.now() - startTime;
    const passedCount = results.filter(r => r.passed).length;
    const mem = estimateMemoryUsage();

    let totalSavings = 0;
    let savingsCount = 0;
    for (const r of results) {
      if (r.metrics.continuitySavingsPercent !== undefined && r.metrics.continuitySavingsPercent > 0) {
        totalSavings += r.metrics.continuitySavingsPercent;
        savingsCount++;
      }
    }
    const avgSavings = savingsCount > 0 ? Math.round(totalSavings / savingsCount) : 0;

    return {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: `${process.platform} (${process.arch})`,
      tier,
      totalScenarios: scenarios.length,
      passedScenarios: passedCount,
      failedScenarios: scenarios.length - passedCount,
      totalDurationMs: Math.round(totalDuration * 100) / 100,
      averageSavingsPercent: avgSavings,
      heapUsedMb: mem.heapUsedMb,
      results
    };
  }
}
