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
  let trials = 1;
  let emitJson = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--scenario' && args[i + 1]) {
      scenarioId = args[++i];
    } else if (arg === '--mode' && args[i + 1]) {
      const m = args[++i];
      if (m === 'agy') tier = 'agy';
      else if (m === 'subprocess_mcp' || m === 'subprocess') tier = 'subprocess_mcp';
      else tier = 'deterministic';
    } else if (arg === '--trials' && args[i + 1]) {
      trials = Math.max(1, parseInt(args[++i], 10) || 1);
    } else if (arg === '--json') {
      emitJson = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: arbiter-benchmark [options]

Options:
  --all              Run all benchmark scenarios
  --scenario <id>    Run a specific scenario (e.g. 008-agent-semantic-correctness)
  --mode <mode>      Execution tier: 'deterministic' (default), 'subprocess_mcp', or 'agy'
  --trials <N>       Number of iterations to run for statistical aggregation (default: 1)
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

  const summary = await orchestrator.runSuite(scenarios, tier, trials);

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
