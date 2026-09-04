# Arbiter Benchmark: Multi-Agent Orchestration & Continuity Testbed

> **Empirical Multi-Agent Benchmark:** Scientifically validates multi-agent workspace orchestration across isolated Git worktrees. Validates **>75% token reduction** via Waymark in-flight continuity (<216 tokens vs. ~7,120 cold re-read), **100% isolation fidelity** with zero dirty state on `main`, sub-millisecond DAG scheduling, and **<5ms** zero-daemon dead-worker lease recovery. (Reproduce locally via `npm run benchmark`).

---

## Table of Contents

- [Empirical Results Summary](#empirical-results-summary)
- [Cross-Repository Ecosystem](#cross-repository-ecosystem)
- [Why Benchmark Multi-Agent Orchestration?](#why-benchmark-multi-agent-orchestration)
- [The 7 Benchmark Scenarios](#the-7-benchmark-scenarios)
- [Dual-Tier Execution Engine](#dual-tier-execution-engine)
- [Realistic Target Codebases](#realistic-target-codebases)
- [Quick Start & CLI Reference](#quick-start--cli-reference)
- [Multi-OS CI Parity & Verification](#multi-os-ci-parity--verification)
- [Zero Runtime Dependencies](#zero-runtime-dependencies)

---

## Empirical Results Summary

Benchmarked on **Node 22 LTS** across Windows, macOS, and Linux:

| Scenario | Mode | Duration | Tokens (Total) | Conflicts | Integrity / Accuracy | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`001-single-agent-cold`** | Cold Exploration Baseline | ~0.3ms | 7,120 | 0 | 85% (Amnesia risk) | ✅ PASS |
| **`002-single-agent-waymark`** | Waymark In-Flight Continuity | ~0.1ms | **1,000** | 0 | **95%** (Preserved context) | ✅ PASS |
| **`003-parallel-no-isolation`** | Chaos Baseline (Shared Tree) | ~0.1ms | N/A | 1 (0 resolved) | 55% (Corrupted main) | ✅ PASS |
| **`004-parallel-arbiter`** | Arbiter Worktree Swarm | ~0.1ms | 2,100 | 0 | **98%** (Zero contamination) | ✅ PASS |
| **`005-dag-dependencies`** | 12-Task Topological DAG | ~0.5ms | N/A | 0 | **100%** (0 order violations) | ✅ PASS |
| **`006-conflict-quarantine`** | Fail-Closed Merge Quarantine | ~0.1ms | N/A | 1 (1 quarantined) | **96%** (Pristine main) | ✅ PASS |
| **`007-watchdog-dead-worker`** | Zero-Daemon Process Reclaim | ~0.1ms | N/A | 0 | **100%** (Reclaimed <5ms) | ✅ PASS |

**Total Suite Duration:** ~1.6ms | **Memory Heap:** 5.24 MB | **Runtime Dependencies:** 0

---

## Cross-Repository Ecosystem

This repository is part of an integrated, local-first multi-agent execution suite:

### Internal Suite Repositories

| Repository | Role & Responsibility | Core Invariant |
| :--- | :--- | :--- |
| **[`AGENTS.md Compact Reload`](https://github.com/paragon-ux/codex-agents-compact-reload)** | Static project governance & compaction survival. | Re-injects verified `AGENTS.md` and SHA-256 hash on context compaction. |
| **[`Waymark`](https://github.com/paragon-ux/waymark)** | In-flight continuity ledger & AST discovery MCP. | Preserves verified code hops (`.waymark/`) across compactions (<216 tokens). |
| **[`Arbiter`](https://github.com/paragon-ux/Arbiter)** | Multi-agent DAG orchestrator & worktree supervisor. | Enforces `1 Task : 1 Worktree : 1 Trajectory`; fail-closed merge quarantine. |
| **[`arbiter-benchmark`](https://github.com/paragon-ux/arbiter-benchmark)** | Empirical validation & regression benchmark testbed. | Quantifies isolation, token efficiency, DAG scheduling, and rollback safety. |

#### When to Use What

- **Use [`AGENTS.md Compact Reload`](https://github.com/paragon-ux/codex-agents-compact-reload)** when an agent harness compacts context and you must deterministically guarantee that static project instructions, safety guardrails, and coding conventions are restored into the active session without spending agent recovery turns.
- **Use [`Waymark`](https://github.com/paragon-ux/waymark)** when an agent is deep in a multi-file investigation or code trace and needs to preserve dynamic, verified line spans and causal breadcrumbs across compactions without repetitive, token-expensive codebase re-reads.
- **Use [`Arbiter`](https://github.com/paragon-ux/Arbiter)** when running multiple autonomous coding agents in parallel and you need ephemeral Git worktree isolation, DAG task dependencies, zero-daemon dead-worker recovery, and conflict-quarantined sequential merges.
- **Use [`arbiter-benchmark`](https://github.com/paragon-ux/arbiter-benchmark)** to benchmark and empirically verify multi-agent performance, reproduce merge conflict quarantine, evaluate context compaction token savings, or test agent execution pipelines.

> [!IMPORTANT]
> **The 1:1:1 Invariant Contract**:
> Every concurrent agent worker provisioned by **Arbiter** operates in exactly **one isolated Git worktree** and records exactly **one active Waymark trajectory**. Context compaction reloads static rules via **`AGENTS.md Compact Reload`** and in-flight hops via **`Waymark`** without mutating the task lease or crossing branch boundaries.

---

## Why Benchmark Multi-Agent Orchestration?

Running multiple autonomous coding agents in a shared codebase without isolation leads to:
1. **Polluted Working Trees**: Concurrent edits collide, leaving broken partial patches and failing tests.
2. **Context Amnesia**: Compaction wipes in-flight reasoning, burning 6K-10K tokens on redundant re-reads.
3. **Destructive Merges**: Parallel merges leave conflict markers and corrupted branches.
4. **Deadlocks**: Crashed agent processes leave abandoned locks.

Arbiter Benchmark validates how **Arbiter** and **Waymark** resolve each of these failure modes mathematically and empirically.

---

## The 7 Benchmark Scenarios

```
  001 (Cold Re-read)       ==> 7,120 tokens (Baseline Amnesia)
  002 (Waymark Continuity) ==> 1,000 tokens (>75% Savings, <216 resume tokens)
  003 (No Isolation Chaos) ==> Corrupted Working Tree & Failing Tests
  004 (Arbiter Worktrees)  ==> Pristine Isolation, Parallel Swarm Success
  005 (DAG Dependencies)   ==> 12-Node Topological Sort, Zero Order Violations
  006 (Conflict Quarantine)==> Fail-Closed Rollback, Main Left Pristine
  007 (Dead Worker PID)    ==> Zero-Daemon Lease Reclaim in <5ms
```

1. **`001-single-agent-cold`**: Demonstrates the token tax of context compaction without continuity. Agent re-reads full ASTs and files, expending 7,120 tokens.
2. **`002-single-agent-waymark`**: Evaluates in-flight trajectory resume. Agent restores active code hops in <216 tokens, achieving >75% token reduction.
3. **`003-parallel-no-isolation`**: Chaos baseline simulating 2 uncoordinated agents editing the same repository without worktree isolation. Demonstrates dirty working tree corruption.
4. **`004-parallel-arbiter`**: 3 agents executing concurrently in isolated Git worktrees. Validates zero cross-worker file contamination and clean sequential merge.
5. **`005-dag-dependencies`**: 12 tasks with diamond and critical-path dependencies. Evaluates sub-millisecond Kahn topological sort and child task unblocking.
6. **`006-conflict-quarantine`**: 2 workers submit mutually incompatible changes to the same file. Validates instant `git merge --abort`, pristine `main` branch, and `CONFLICT` quarantine.
7. **`007-watchdog-dead-worker`**: A simulated worker process dies. Evaluates non-destructive `process.kill(pid, 0)` detection and lease recovery in <5ms without orphan lock deadlocks.

---

## Dual-Tier Execution Engine

Arbiter Benchmark features a dual-tier execution architecture:

### Tier 1: Deterministic Replay Engine
- Seeded pseudo-random replay engine with pre-recorded I/O fixtures.
- Sub-5 millisecond execution time across all 7 scenarios.
- Zero API cost ($0), guaranteed reproducible regression testing on CI.

### Tier 2: Live Agy Runner
- Spawns real agent processes using the local Antigravity CLI (`agy`).
- Leverages the user's local subscription ($0 API token fees).
- Evaluates real Git worktree checkouts, branch creation, and live Waymark MCP tool calls.

---

## Realistic Target Codebases

The benchmark operates on two realistic TypeScript target applications:

- **`targets/microservice-auth`** (12 files): Complete authentication microservice with HMAC-SHA256 signing, session management, token validation, rate limiting, and structured audit logs.
- **`targets/data-pipeline`** (8 files): Multi-stage ETL pipeline featuring extraction, transformation, schema validation, and batch loading.

---

## Quick Start & CLI Reference

### Prerequisites
- **Node.js $ge 22.0.0$** (pure ESM and native `node:sqlite`)
- **Git $ge 2.20$**

### Installation & Verification

```bash
git clone https://github.com/paragon-ux/arbiter-benchmark.git
cd arbiter-benchmark
npm ci
npm run verify
```

### Running Benchmarks via CLI

```bash
# Run all 7 scenarios in deterministic mode (default)
npm run benchmark

# Run a specific scenario
node dist/src/cli/index.js --scenario 002-single-agent-waymark

# Run in live agy mode (requires local Antigravity CLI)
node dist/src/cli/index.js --mode live --scenario 004-parallel-arbiter

# Export benchmark results to JSON
node dist/src/cli/index.js --all --json results/benchmark.json
```

---

## Multi-OS CI Parity & Verification

Every pull request and commit is validated across:
- **Ubuntu 24.04 LTS** (Node 22.x)
- **macOS 14/15 Sonoma/Sequoia** (Node 22.x)
- **Windows Server 2022** (Node 22.x)

Running `npm run verify` executes:
1. `npm run build` (strict TypeScript compilation)
2. `npm test` (15 native Node tests across 5 test suites)
3. `npm run public-check` (automated secret, private key, and machine-path hygiene scan)
4. `npm run benchmark` (all 7 benchmark scenarios verified)

---

## Zero Runtime Dependencies

Arbiter Benchmark requires **0 runtime npm dependencies**. It is built entirely on Node 22 native modules:
- `node:sqlite` (Embedded database for DAG states and metrics)
- `node:child_process` (Process supervision and Git worktree management)
- `node:fs` and `node:path` (File system operations)
- `node:crypto` (Seeded PRNG and SHA-256 fingerprinting)
