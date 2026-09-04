# Arbiter Benchmark: v1.1.0 Master Execution Roadmap & Checklist

**Target Release:** `v1.1.0` — "Resilience & Scientific Rigor"  
**Repository:** [`paragon-ux/arbiter-benchmark`](https://github.com/paragon-ux/arbiter-benchmark)  
**Governance:** Strict 0 runtime npm dependencies, pure Node 22 LTS native modules, multi-OS cloud CI parity (Ubuntu, macOS, Windows).

---

## Master Phase Checklist

### Phase 1: Core Foundation & Deterministic Infrastructure
- [ ] **1.1 Seeded PRNG Engine** (`src/harness/adapters/deterministic.ts`)
  - [ ] Implement zero-dependency Mulberry32 32-bit seeded PRNG (`seed: 0x6D2B79F5`).
  - [ ] Replace any unseeded non-deterministic random calls.
  - [ ] Acceptance: 10 consecutive executions of any scenario produce 100% byte-identical scenario output JSON.
- [ ] **1.2 Platform-Stratified Regression Tolerances** (`REGRESSION_TOLERANCES.json`)
  - [ ] Define platform-specific latency variance thresholds:
    - Ubuntu 24.04 LTS: $\pm 5\%$ latency tolerance, $\text{CV} \le 0.10$.
    - macOS 14/15 Sonoma: $\pm 25\%$ latency tolerance, $\text{CV} \le 0.25$ (accounting for VM CPU throttling).
    - Windows Server 2022: $\pm 20\%$ latency tolerance, $\text{CV} \le 0.20$ (accounting for filesystem Defender hooks).
    - Token count tolerance: $\pm 2\%$ across all platforms.
  - [ ] Acceptance: CI runner parses and applies platform-specific thresholds rather than a flat $\pm 5\%$.
- [ ] **1.3 Fortified AST Zero-Dependency Linter** (`scripts/public-check.mjs`)
  - [ ] Add regex/AST scanner across all compiled `.js` files in `dist/`.
  - [ ] Assert zero `import` or `require` statements outside `node:*` and relative local paths (`./` or `../`).
  - [ ] Fail CI if any external runtime npm dependency is introduced.
  - [ ] Acceptance: Adding `import 'lodash'` instantly fails `npm run public-check`.

---

### Phase 2: Statistical Multi-Trial Distribution Engine
- [ ] **2.1 Types & Schema Extensions** (`src/harness/types.ts`)
  - [ ] Add `StatisticalMetrics` interface: `median_duration_ms`, `mean_duration_ms`, `stddev_duration_ms`, `p95_duration_ms`, `p99_duration_ms`, `cv_duration`.
  - [ ] Update `ScenarioResult` and `BenchmarkSummary` to hold multi-trial samples.
- [ ] **2.2 Multi-Trial Metric Aggregator** (`src/harness/metrics.ts`)
  - [ ] Implement sample collector for $N$ iterations.
  - [ ] Calculate Mean ($\mu$), Variance ($\sigma^2$), Standard Deviation ($\sigma$), Median (P50), P95, and P99.
  - [ ] Compute Coefficient of Variation ($\text{CV} = \sigma / \mu$).
- [ ] **2.3 CLI Multi-Trial Support** (`src/cli/index.ts`)
  - [ ] Support `--trials <N>` (default $N=1$ for fast check, $N=10$ for CI verification, $N=30$ for golden baseline).
  - [ ] Acceptance: `arbiter-benchmark run --trials 10` executes 10 passes per scenario and aggregates stats.
- [ ] **2.4 Statistical Markdown & JSON Reporter** (`src/harness/reporter.ts`)
  - [ ] Format summary table to display: `Scenario`, `Mode`, `Median (ms)`, `P95 (ms)`, `StdDev (ms)`, `Tokens (P50)`, `Status`.
  - [ ] Export full trial distributions to `results/benchmark-trials-summary.json`.

---

### Phase 3: Tier 1.5 Headless Subprocess MCP Harness
- [ ] **3.1 Subprocess MCP Client/Server Protocol Contract**
  - [ ] Formalize MCP JSON-RPC 2.0 stdio communication.
  - [ ] Server: Arbiter task supervisor listening on `stdio`.
  - [ ] Client: Mock agent child process spawned via `node:child_process.fork()` or `spawn()`.
  - [ ] Methods: `tools/call` for `arbiter_claim_task`, `arbiter_checkpoint`, `arbiter_complete_task`.
- [ ] **3.2 Subprocess MCP Adapter Implementation** (`src/harness/adapters/subprocessMcp.ts`)
  - [ ] Spawns real OS child processes.
  - [ ] Exercises real Git worktree creation (`git worktree add`), isolated branch commits, and SQLite task lease states.
  - [ ] Zero external API cost ($0), runs seamlessly in cloud CI without credentials.
- [ ] **3.3 Unit Test Suite for Subprocess MCP** (`test/subprocess-mcp.test.ts`)
  - [ ] Test client/server lifecycle, stdio communication, task claim, heartbeat lease refresh, and completion.
  - [ ] Test graceful error handling when child process exits unexpectedly.

---

### Phase 4: Scenarios 008–014 Implementation & Chaos Engineering
- [ ] **4.1 Scenario 008: Semantic Correctness & Typecheck**
  - [ ] File: `scenarios/008-agent-semantic-correctness.json`
  - [ ] Condition: Agent performs multi-step refactoring in `targets/microservice-auth`.
  - [ ] Assertions: `npm run build` (`tsc --noEmit`) passes with 0 errors; `npm test` passes 100%; zero regression.
- [ ] **4.2 Scenario 009: 10-Worker Concurrency Stress**
  - [ ] File: `scenarios/009-parallel-10-workers.json`
  - [ ] Condition: 10 concurrent agent workers modifying disjoint files in parallel.
  - [ ] Assertions: Tests SQLite WAL busy-timeout handling; zero file collisions; 100% sequential merge success.
- [ ] **4.3 Scenario 010: Cyclic DAG Rejection**
  - [ ] File: `scenarios/010-cyclic-dag-rejection.json`
  - [ ] Condition: Submits an invalid cyclic dependency graph ($A \to B \to C \to A$).
  - [ ] Assertions: Deterministic cycle rejection in <2ms with zero partial task execution (rollback).
- [ ] **4.4 Scenario 011: Concurrent Lease Collision**
  - [ ] File: `scenarios/011-concurrent-lease-collision.json`
  - [ ] Condition: Two workers race to claim the same task lease simultaneously.
  - [ ] Assertions: Exactly one worker acquires the lease; the second worker receives `EAGAIN` and backs off.
- [ ] **4.5 Scenario 012: Signal-Interrupted Merge (`SIGTERM`)**
  - [ ] File: `scenarios/012-signal-interrupted-merge.json`
  - [ ] Condition: Sends `SIGTERM` mid-way through a Git merge operation.
  - [ ] Assertions: Fail-closed rollback triggered cleanly; `main` branch left 100% pristine; worktree isolated.
- [ ] **4.6 Scenario 013: Multi-Compaction Trajectory Stability**
  - [ ] File: `scenarios/013-waymark-multi-compaction.json`
  - [ ] Condition: Simulates 3 sequential context compactions during a long-running investigation.
  - [ ] Assertions: Waymark trajectory SHA-256 hash stability verified; >75% token reduction across all cycles.
- [ ] **4.7 Scenario 014: Disk-Full / ENOSPC Rollback**
  - [ ] File: `scenarios/014-disk-full-recovery.json`
  - [ ] Condition: Simulates `ENOSPC` during SQLite write or worktree checkout.
  - [ ] Assertions: Error caught; transaction rolled back; lease released cleanly without orphan locks.
- [ ] **4.8 Adapter Integration & Scenario Verification**
  - [ ] Add execution handlers in `src/harness/adapters/deterministic.ts` and `src/harness/adapters/subprocessMcp.ts`.
  - [ ] Add unit tests in `test/scenarios.test.ts` validating schemas and execution of all 14 scenarios.

---

### Phase 5: Documentation, Verification & Release Gating
- [ ] **5.1 Version Bump**: Bump `package.json` version to `1.1.0`.
- [ ] **5.2 Documentation Updates**:
  - [ ] `CHANGELOG.md`: Document `v1.1.0 — Resilience & Scientific Rigor`.
  - [ ] `README.md`: Update results table with all 14 scenarios and statistical metrics.
  - [ ] `Rationale.MD`: Update experimental methodology for Tier 1.5 and chaos scenarios.
  - [ ] `AGENTS.md`: Add instructions for running multi-trial benchmarks and Tier 1.5 tests.
- [ ] **5.3 Local Verification Pipeline**:
  - [ ] `npm run build`
  - [ ] `npm test` (all unit test suites passing)
  - [ ] `npm run test:coverage` (maintaining >85% coverage)
  - [ ] `npm run public-check` (zero leaks and zero non-native imports)
  - [ ] `npm run benchmark` (executing 14 scenarios with multi-trial stats)
  - [ ] `npm run verify`
- [ ] **5.4 Remote Multi-OS CI Matrix Verification**:
  - [ ] Push commit to `paragon-ux/arbiter-benchmark` `main`.
  - [ ] Monitor GitHub Actions workflow across Ubuntu 24.04, macOS 14/15, and Windows Server 2022.
  - [ ] Confirm all 3 matrix jobs pass 100% green.
- [ ] **5.5 Tagging & Completion**:
  - [ ] Create git tag `v1.1.0`.
  - [ ] Update walkthrough artifact with empirical results.

---

## Master Scenario Registry (001–018)

| ID | Title | Tier | Target | Release | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **001** | Cold Exploration Baseline | Tier 1 (Deterministic) | `microservice-auth` | v1.0.0 | ✅ Locked |
| **002** | Waymark In-Flight Continuity | Tier 1 (Deterministic) | `microservice-auth` | v1.0.0 | ✅ Locked |
| **003** | Parallel Chaos (No Isolation) | Tier 1 (Deterministic) | `microservice-auth` | v1.0.0 | ✅ Locked |
| **004** | Arbiter Worktree Swarm (3 Workers) | Tier 1 (Deterministic) | `microservice-auth` | v1.0.0 | ✅ Locked |
| **005** | DAG Task Scheduling (12 Nodes) | Tier 1 (Deterministic) | `data-pipeline` | v1.0.0 | ✅ Locked |
| **006** | Fail-Closed Conflict Quarantine | Tier 1 (Deterministic) | `microservice-auth` | v1.0.0 | ✅ Locked |
| **007** | Dead Worker Watchdog Recovery | Tier 1 (Deterministic) | `microservice-auth` | v1.0.0 | ✅ Locked |
| **008** | Semantic Correctness & Typecheck | Tier 1.5 (Subprocess MCP) | `microservice-auth` | v1.1.0 | 📋 In Progress |
| **009** | High Concurrency (10 Workers) | Tier 1.5 (Subprocess MCP) | `microservice-auth` | v1.1.0 | 📋 In Progress |
| **010** | Cyclic DAG Rejection | Tier 1.5 (Subprocess MCP) | `data-pipeline` | v1.1.0 | 📋 In Progress |
| **011** | Concurrent Lease Collision | Tier 1.5 (Subprocess MCP) | `microservice-auth` | v1.1.0 | 📋 In Progress |
| **012** | Signal-Interrupted Merge (`SIGTERM`) | Tier 1.5 (Subprocess MCP) | `microservice-auth` | v1.1.0 | 📋 In Progress |
| **013** | Multi-Compaction Trajectory Stability| Tier 1.5 (Subprocess MCP) | `microservice-auth` | v1.1.0 | 📋 In Progress |
| **014** | Disk-Full / ENOSPC Rollback | Tier 1.5 (Subprocess MCP) | `data-pipeline` | v1.1.0 | 📋 In Progress |
| **015** | High Concurrency Saturation (50 Workers)| Tier 1.5 (Subprocess MCP) | `microservice-auth` | v2.0.0 | ⏳ Deferred |
| **016** | Comparative: Arbiter vs. Docker | Tier 3 (Docker Isolated) | `microservice-auth` | v2.0.0 | ⏳ Deferred |
| **017** | Comparative: Arbiter vs. Naive Mutex | Tier 3 (Naive Mutex) | `microservice-auth` | v2.0.0 | ⏳ Deferred |
| **018** | Comparative: Arbiter vs. Process Pool | Tier 3 (Process Pool) | `microservice-auth` | v2.0.0 | ⏳ Deferred |
