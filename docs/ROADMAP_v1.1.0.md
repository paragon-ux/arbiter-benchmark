# Arbiter Benchmark: v1.1.0 Master Execution Roadmap & Checklist

**Target Release:** `v1.1.0` — "Resilience & Scientific Rigor"  
**Repository:** [`paragon-ux/arbiter-benchmark`](https://github.com/paragon-ux/arbiter-benchmark)  
**Governance:** Strict 0 runtime npm dependencies, pure Node 22 LTS native modules, multi-OS cloud CI parity (Ubuntu, macOS, Windows).

---

## Master Phase Checklist

### Phase 1: Core Foundation & Deterministic Infrastructure
- [x] **1.1 Seeded PRNG Engine** (`src/harness/adapters/deterministic.ts`)
  - [x] Implement zero-dependency Mulberry32 32-bit seeded PRNG (`seed: 0x6D2B79F5`).
  - [x] Replace any unseeded non-deterministic random calls.
  - [x] Acceptance: 10 consecutive executions of any scenario produce 100% byte-identical scenario output JSON.
- [x] **1.2 Platform-Stratified Regression Tolerances** (`REGRESSION_TOLERANCES.json`)
  - [x] Define platform-specific latency variance thresholds:
    - Ubuntu 24.04 LTS: $\pm 5\%$ latency tolerance, $\text{CV} \le 0.10$.
    - macOS 14/15 Sonoma: $\pm 25\%$ latency tolerance, $\text{CV} \le 0.25$ (accounting for VM CPU throttling).
    - Windows Server 2022: $\pm 20\%$ latency tolerance, $\text{CV} \le 0.20$ (accounting for filesystem Defender hooks).
    - Token count tolerance: $\pm 2\%$ across all platforms.
  - [x] Acceptance: CI runner parses and applies platform-specific thresholds rather than a flat $\pm 5\%$.
- [x] **1.3 Fortified AST Zero-Dependency Linter** (`scripts/public-check.mjs`)
  - [x] Add regex/AST scanner across all compiled `.js` files in `dist/`.
  - [x] Assert zero `import` or `require` statements outside `node:*` and relative local paths (`./` or `../`).
  - [x] Fail CI if any external runtime npm dependency is introduced.
  - [x] Acceptance: Adding `import 'lodash'` instantly fails `npm run public-check`.

---

### Phase 2: Statistical Multi-Trial Distribution Engine
- [x] **2.1 Types & Schema Extensions** (`src/harness/types.ts`)
  - [x] Add `StatisticalMetrics` interface: `median_duration_ms`, `mean_duration_ms`, `stddev_duration_ms`, `p95_duration_ms`, `p99_duration_ms`, `cv_duration`.
  - [x] Update `ScenarioResult` and `BenchmarkSummary` to hold multi-trial samples.
- [x] **2.2 Multi-Trial Metric Aggregator** (`src/harness/metrics.ts`)
  - [x] Implement sample collector for $N$ iterations.
  - [x] Calculate Mean ($\mu$), Variance ($\sigma^2$), Standard Deviation ($\sigma$), Median (P50), P95, and P99.
  - [x] Compute Coefficient of Variation ($\text{CV} = \sigma / \mu$).
- [x] **2.3 CLI Multi-Trial Support** (`src/cli/index.ts`)
  - [x] Support `--trials <N>` (default $N=1$ for fast check, $N=10$ for CI verification, $N=30$ for golden baseline).
  - [x] Acceptance: `arbiter-benchmark run --trials 10` executes 10 passes per scenario and aggregates stats.
- [x] **2.4 Statistical Markdown & JSON Reporter** (`src/harness/reporter.ts`)
  - [x] Format summary table to display: `Scenario`, `Mode`, `Median (ms)`, `P95 (ms)`, `StdDev (ms)`, `Tokens (P50)`, `Status`.
  - [x] Export full trial distributions to `results/benchmark-trials-summary.json`.

---

### Phase 3: Tier 1.5 Headless Subprocess MCP Harness
- [x] **3.1 Subprocess MCP Client/Server Protocol Contract**
  - [x] Formalize MCP JSON-RPC 2.0 stdio communication.
  - [x] Server: Arbiter task supervisor listening on `stdio`.
  - [x] Client: Mock agent child process spawned via `node:child_process.spawn()`.
  - [x] Methods: `tools/call` for `arbiter_claim_task`, `arbiter_checkpoint`, `arbiter_complete_task`.
- [x] **3.2 Subprocess MCP Adapter Implementation** (`src/harness/adapters/subprocessMcp.ts`)
  - [x] Spawns real OS child processes.
  - [x] Exercises real Git worktree creation (`git worktree add`), isolated branch commits, and SQLite task lease states.
  - [x] Zero external API cost ($0), runs seamlessly in cloud CI without credentials.
- [x] **3.3 Unit Test Suite for Subprocess MCP** (`test/subprocess-mcp.test.ts`)
  - [x] Test client/server lifecycle, stdio communication, task claim, heartbeat lease refresh, and completion.
  - [x] Test graceful error handling when child process exits unexpectedly.

---

### Phase 4: Scenarios 008–014 Implementation & Chaos Engineering
- [x] **4.1 Scenario 008: Semantic Correctness & Typecheck**
  - [x] File: `scenarios/008-agent-semantic-correctness.json`
  - [x] Condition: Agent performs multi-step refactoring in `targets/microservice-auth`.
  - [x] Assertions: `npm run build` (`tsc --noEmit`) passes with 0 errors; `npm test` passes 100%; zero regression.
- [x] **4.2 Scenario 009: 10-Worker Concurrency Stress**
  - [x] File: `scenarios/009-parallel-10-workers.json`
  - [x] Condition: 10 concurrent agent workers modifying disjoint files in parallel.
  - [x] Assertions: Tests SQLite WAL busy-timeout handling; zero file collisions; 100% sequential merge success.
- [x] **4.3 Scenario 010: Cyclic DAG Rejection**
  - [x] File: `scenarios/010-cyclic-dag-rejection.json`
  - [x] Condition: Submits an invalid cyclic dependency graph ($A \to B \to C \to A$).
  - [x] Assertions: Deterministic cycle rejection in <2ms with zero partial task execution (rollback).
- [x] **4.4 Scenario 011: Concurrent Lease Collision**
  - [x] File: `scenarios/011-concurrent-lease-collision.json`
  - [x] Condition: Two workers race to claim the same task lease simultaneously.
  - [x] Assertions: Exactly one worker acquires the lease; the second worker receives `EAGAIN` and backs off.
- [x] **4.5 Scenario 012: Signal-Interrupted Merge (`SIGTERM`)**
  - [x] File: `scenarios/012-signal-interrupted-merge.json`
  - [x] Condition: Sends `SIGTERM` mid-way through a Git merge operation.
  - [x] Assertions: Fail-closed rollback triggered cleanly; `main` branch left 100% pristine; worktree isolated.
- [x] **4.6 Scenario 013: Multi-Compaction Trajectory Stability**
  - [x] File: `scenarios/013-waymark-multi-compaction.json`
  - [x] Condition: Simulates 3 sequential context compactions during a long-running investigation.
  - [x] Assertions: Waymark trajectory SHA-256 hash stability verified; >75% token reduction across all cycles.
- [x] **4.7 Scenario 014: Disk-Full / ENOSPC Rollback**
  - [x] File: `scenarios/014-disk-full-recovery.json`
  - [x] Condition: Simulates `ENOSPC` during SQLite write or worktree checkout.
  - [x] Assertions: Error caught; transaction rolled back; lease released cleanly without orphan locks.
- [x] **4.8 Adapter Integration & Scenario Verification**
  - [x] Add execution handlers in `src/harness/adapters/deterministic.ts` and `src/harness/adapters/subprocessMcp.ts`.
  - [x] Add unit tests in `test/scenarios.test.ts` validating schemas and execution of all 14 scenarios.

---

### Phase 5: Documentation, Verification & Release Gating
- [x] **5.1 Version Bump**: Bump `package.json` version to `1.1.0`.
- [x] **5.2 Documentation Updates**:
  - [x] `CHANGELOG.md`: Document `v1.1.0 — Resilience & Scientific Rigor`.
  - [x] `README.md`: Update results table with all 14 scenarios and statistical metrics.
  - [x] `Rationale.MD`: Update experimental methodology for Tier 1.5 and chaos scenarios.
  - [x] `AGENTS.md`: Add instructions for running multi-trial benchmarks and Tier 1.5 tests.
- [x] **5.3 Local Verification Pipeline**:
  - [x] `npm run build`
  - [x] `npm test` (27 unit tests across 6 suites passing)
  - [x] `npm run test:coverage` (88.9% coverage)
  - [x] `npm run public-check` (zero leaks and zero non-native imports)
  - [x] `npm run benchmark` (executing 14 scenarios with multi-trial stats)
  - [x] `npm run verify`
- [ ] **5.4 Remote Multi-OS CI Matrix Verification**:
  - [ ] Push commit to `paragon-ux/arbiter-benchmark` `main`.
  - [ ] Monitor GitHub Actions workflow across Ubuntu 24.04, macOS 14/15, and Windows Server 2022.
  - [ ] Confirm all 3 matrix jobs pass 100% green.
- [ ] **5.5 Tagging & Completion**:
  - [ ] Create git tag `v1.1.0`.
  - [ ] Update walkthrough artifact with empirical results.
