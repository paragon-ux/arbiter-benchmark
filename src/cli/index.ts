import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BenchmarkOrchestrator } from '../harness/orchestrator.js';
import { formatMarkdownReport } from '../harness/reporter.js';
import { ExecutionTier } from '../harness/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let scenarioId: string | undefined;
  let tier: ExecutionTier = 'deterministic';
  let emitJson = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--scenario' && args[i + 1]) {
      scenarioId = args[++i];
    } else if (arg === '--mode' && args[i + 1]) {
      tier = args[++i] === 'agy' ? 'agy' : 'deterministic';
    } else if (arg === '--json') {
      emitJson = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: arbiter-benchmark [options]

Options:
  --all              Run all 7 benchmark scenarios
  --scenario <id>    Run a specific scenario (e.g. 004-parallel-arbiter)
  --mode <mode>      Execution tier: 'deterministic' (default) or 'agy'
  --json             Output results in raw JSON format
  --help, -h         Show help text
`);
      process.exit(0);
    }
  }

  const scenariosDir = path.join(rootDir, 'scenarios');
  const orchestrator = new BenchmarkOrchestrator();
  const scenarios = orchestrator.loadScenarios(scenariosDir, scenarioId);

  if (scenarios.length === 0) {
    console.error(`Error: No scenarios found matching: ${scenarioId || 'all'}`);
    process.exit(1);
  }

  const summary = await orchestrator.runSuite(scenarios, tier);

  // Write machine readable results
  const resultsDir = path.join(rootDir, 'results');
  fs.mkdirSync(resultsDir, { recursive: true });
  fs.writeFileSync(path.join(resultsDir, 'latest.json'), JSON.stringify(summary, null, 2) + '\n');

  if (emitJson) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    const report = formatMarkdownReport(summary);
    console.log(report);
    fs.writeFileSync(path.join(resultsDir, 'latest.md'), report + '\n');
  }

  if (summary.failedScenarios > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal benchmark execution error:', err);
  process.exit(1);
});
