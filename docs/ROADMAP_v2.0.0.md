# Arbiter Benchmark: v2.0.0 Master Execution Roadmap & Checklist

**Target Release:** `v2.0.0` — "Competitive & Comparative Analysis"  
**Repository:** [`paragon-ux/arbiter-benchmark`](https://github.com/paragon-ux/arbiter-benchmark)  
**Governance:** Strict 0 runtime npm dependencies, pure Node 22 LTS native modules, multi-OS cloud CI parity (Ubuntu, macOS, Windows).

---

## Master Phase Checklist

### Phase 1: Baseline Locking & Automated Regression Checking
- [x] **1.1 Lock Golden Baseline Metrics** (`BASELINE_v1.1.0.json`)
  - [x] Extract verified multi-platform benchmark results from `v1.1.0` (all 14 scenarios).
  - [x] Store as immutable reference file `BASELINE_v1.1.0.json` in repository root.
- [x] **1.2 Automated Regression Comparator Script** (`scripts/compare-baseline.mjs`)
  - [x] Implement zero-dependency script evaluating current benchmark results vs. `BASELINE_v1.1.0.json`.
  - [x] Apply platform-stratified rules from `REGRESSION_TOLERANCES.json`:
    - Ubuntu: $\pm 5\%$ latency variance, $\text{CV} \le 0.10$.
    - Windows: $\pm 20\%$ latency variance, $\text{CV} \le 0.20$.
    - macOS: $\pm 25\%$ latency variance, $\text{CV} \le 0.25$.
    - Token variance: $\pm 2\%$ across all platforms.
  - [x] Exit with code 0 on tolerance compliance; non-zero with formatted delta table on regression.
- [x] **1.3 Benchmark Scenario Authoring Guide** (`BENCHMARK_AUTHORING.md`)
  - [x] Master taxonomy table of all 18 scenarios (001–018).
  - [x] JSON scenario schema reference with required fields and validation rules.
  - [x] Guidelines for adding new scenarios, configuring Mulberry32 PRNG seed, and defining execution tier handlers.

---

### Phase 2: Tier 3 Comparative Baseline Adapters
- [x] **2.1 Types Extension** (`src/harness/types.ts`)
  - [x] Expand `ExecutionTier` union type: `'deterministic' | 'subprocess_mcp' | 'agy' | 'naive_mutex' | 'process_pool' | 'docker'`.
  - [x] Add comparative metrics fields (container startup latency, mutex wait time, lock contention count).
- [x] **2.2 Naive Mutex Adapter** (`src/harness/adapters/naiveMutex.ts`)
  - [x] Negative baseline simulating uncoordinated multi-agent execution with simple file-level mutexes.
  - [x] Models lock contention, deadlocks, and file stomping in concurrent/chaos scenarios.
- [x] **2.3 Process Pool Adapter** (`src/harness/adapters/processPool.ts`)
  - [x] Alternative baseline simulating worker process pool coordination without Git worktree isolation.
  - [x] Measures dirty state propagation and lack of branch isolation under concurrent writes.
- [x] **2.4 Docker Isolated Adapter** (`src/harness/adapters/dockerIsolated.ts`)
  - [x] Containerized baseline measuring container lifecycle spin-up/tear-down overhead (~250–500ms) vs. Arbiter's sub-5ms Git worktrees.
  - [x] Zero-dependency simulation/probe model ensuring sub-second execution on CI without requiring external Docker daemon.

---

### Phase 3: Scenarios 015–018 (Comparative & Scaling)
- [x] **3.1 Scenario 015: Docker Containerization Overhead**
  - [x] File: `scenarios/015-docker-isolated-overhead.json`
  - [x] Metric: Compares agent workspace provisioning latency between Docker containers vs. ephemeral Git worktrees (>50x speedup with worktrees).
- [x] **3.2 Scenario 016: Naive Mutex Contention & Deadlock**
  - [x] File: `scenarios/016-naive-mutex-contention.json`
  - [x] Metric: Measures lock wait time and failure rate under naive file locking vs. Arbiter's lock-free worktree concurrency.
- [x] **3.3 Scenario 017: High-Scale Concurrency (50 Workers)**
  - [x] File: `scenarios/017-parallel-50-workers.json`
  - [x] Metric: Stresses SQLite WAL write serialization and worktree allocation at 50 concurrent workers.
- [x] **3.4 Scenario 018: Monorepo Workspace Cross-Package DAG**
  - [x] File: `scenarios/018-cross-repo-workspace-dag.json`
  - [x] Metric: Evaluates complex diamond dependency resolution across shared packages in a multi-project workspace.

---

### Phase 4: Observability & CLI Comparison Mode
- [x] **4.1 Execution Trace Logging (`--verbose`)**
  - [x] Add timestamped trace log streaming to `src/cli/index.ts` and `src/harness/orchestrator.ts`.
  - [x] Logs task dispatch, lease acquisition, worktree allocation, git merge steps, and rollback events.
- [x] **4.2 CLI Baseline Comparison Flag (`--compare`)**
  - [x] Support `--compare [baseline.json]` in CLI to run comparison against locked baseline.
  - [x] Render side-by-side delta tables in stdout.

---

### Phase 5: Test Suite, Documentation & Release Readiness
- [x] **5.1 Unit & Integration Test Expansion**
  - [x] `test/compare-baseline.test.ts`: Verify baseline regression detector against varying tolerances.
  - [x] `test/comparative-adapters.test.ts`: Verify comparative adapters (NaiveMutex, ProcessPool, Docker).
  - [x] Update `test/scenarios.test.ts` to assert all 18 scenarios validate against schema.
  - [x] Update `test/deterministic.test.ts` to verify deterministic simulation of scenarios 015–018.
  - [x] Update `test/orchestrator.test.ts` to assert 18 scenarios and Tier 3 execution routing.
- [x] **5.2 Version Bump & Documentation Updates**
  - [x] Bump `package.json` to `2.0.0`.
  - [x] Update `CHANGELOG.md` with full `v2.0.0` release notes.
  - [x] Update `README.md` with complete 18-scenario results and comparative baselines table.
  - [x] Update `Rationale.MD` with comparative architecture benchmarks.
  - [x] Update `AGENTS.md` with Tier 3 execution tiers and authoring workflows.
- [ ] **5.3 Verification Pipeline & Release**
  - [ ] `npm run verify` (build + test + public-check + benchmark + compare).
  - [ ] Commit, push to `origin main`.
  - [ ] Tag `v2.0.0` and push tag.
  - [ ] Create GitHub Release `v2.0.0`.
  - [ ] Verify multi-OS CI matrix passes on Ubuntu, macOS, and Windows.
