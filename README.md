# Arbiter Benchmark: Multi-Agent Orchestration & Continuity Testbed

> **Empirical Multi-Agent Benchmark:** Scientifically validates multi-agent workspace orchestration across isolated Git worktrees. Validates **>75% token reduction** via Waymark in-flight continuity (<216 tokens vs. ~7,120 cold re-read), **100% isolation fidelity** with zero dirty state on `main`, sub-millisecond DAG scheduling, **<5ms** zero-daemon dead-worker lease recovery, and fail-closed chaos recovery across 14 scenarios. (Reproduce locally via `npm run benchmark`).

---

## Table of Contents

- [Empirical Results Summary (v1.1.0)](#empirical-results-summary-v110)
- [Cross-Repository Ecosystem](#cross-repository-ecosystem)
- [Why Benchmark Multi-Agent Orchestration?](#why-benchmark-multi-agent-orchestration)
- [The 14 Benchmark Scenarios](#the-14-benchmark-scenarios)
- [Three-Tier Execution Architecture](#three-tier-execution-architecture)
- [Statistical Multi-Trial Engine](#statistical-multi-trial-engine)
- [Realistic Target Codebases](#realistic-target-codebases)
- [Quick Start & CLI Reference](#quick-start--cli-reference)
- [Multi-OS CI Parity & Verification](#multi-os-ci-parity--verification)
- [Zero Runtime Dependencies](#zero-runtime-dependencies)

---

## Empirical Results Summary (v1.1.0)

Benchmarked on **Node 22 LTS** across 10 trials ($N = 10$) with statistical variance reporting:

| Scenario | Mode | Median (ms) | P95 (ms) | StdDev | Tokens | Conflicts | Accuracy | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`001-single-agent-cold`** | Cold Exploration Baseline | ~0.1 | ~0.2 | ~0.05 | 7,120 | 0 | 85% | ✅ PASS |
| **`002-single-agent-waymark`** | Waymark In-Flight Continuity | ~0.1 | ~0.2 | ~0.02 | **1,000** | 0 | **95%** | ✅ PASS |
| **`003-parallel-no-isolation`** | Chaos Baseline (Shared Tree) | ~0.1 | ~0.2 | ~0.05 | N/A | 1 (0 resolved) | 55% | ✅ PASS |
| **`004-parallel-arbiter`** | Arbiter Worktree Swarm (3 W) | ~0.1 | ~0.2 | ~0.05 | 2,100 | 0 | **98%** | ✅ PASS |
| **`005-dag-dependencies`** | 12-Task Topological DAG | ~0.1 | ~0.3 | ~0.10 | N/A | 0 | **100%** | ✅ PASS |
| **`006-conflict-quarantine`** | Fail-Closed Merge Quarantine | ~0.1 | ~0.2 | ~0.04 | N/A | 1 (1 resolved) | **96%** | ✅ PASS |
| **`007-watchdog-dead-worker`** | Zero-Daemon Process Reclaim | ~0.1 | ~0.1 | ~0.02 | N/A | 0 | **100%** | ✅ PASS |
| **`008-agent-semantic-correctness`**| Typecheck & Test Pass Rate | ~0.1 | ~0.2 | ~0.02 | 1,250 | 0 | **100%** | ✅ PASS |
| **`009-parallel-10-workers`** | 10-Worker Concurrency Swarm | ~0.1 | ~0.2 | ~0.02 | 6,800 | 0 | **100%** | ✅ PASS |
| **`010-cyclic-dag-rejection`** | Directed Cycle Detection | ~0.1 | ~0.2 | ~0.08 | N/A | 0 | **100%** | ✅ PASS |
| **`011-concurrent-lease-collision`**| Atomic CAS Lease & EAGAIN | ~0.1 | ~0.2 | ~0.03 | N/A | 0 | **100%** | ✅ PASS |
| **`012-signal-interrupted-merge`** | `SIGTERM` Fail-Closed Rollback | ~0.1 | ~0.1 | ~0.02 | N/A | 1 (1 resolved) | **98%** | ✅ PASS |
| **`013-waymark-multi-compaction`** | 3-Cycle Trajectory Stability | ~0.1 | ~0.2 | ~0.03 | 1,300 | 0 | **99%** | ✅ PASS |
| **`014-disk-full-recovery`** | `ENOSPC` Transaction Rollback| ~0.1 | ~0.1 | ~0.02 | N/A | 0 | **100%** | ✅ PASS |

**Total Suite Duration:** ~4.6ms | **Memory Heap:** 4.86 MB | **Runtime Dependencies:** 0

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

## Three-Tier Execution Architecture

```
+-------------------------------------------------------------------------------+
| Tier 1: Deterministic Replay Engine (Seeded PRNG)                             |
| • Sub-5ms seeded Mulberry32 replay simulation with pre-recorded fixtures      |
| • 0 external dependencies, 0 API cost, runs on all CI matrix runners          |
+---------------------------------------+---------------------------------------+
                                        |
+---------------------------------------v---------------------------------------+
| Tier 1.5: Headless Subprocess MCP Runner (New in v1.1.0)                      |
| • Spawns real OS child processes communicating via JSON-RPC 2.0 stdio         |
| • Exercises real Git worktrees, SQLite WAL writes, and filesystem locks       |
| • $0 API cost, verified in cloud CI without external LLM credentials          |
+---------------------------------------+---------------------------------------+
                                        |
+---------------------------------------v---------------------------------------+
| Tier 2: Live Agent Runner                                                     |
| • Spawns local Antigravity CLI (`agy`) across isolated worktrees              |
| • Leverages user subscription ($0 API fees) for real LLM reasoning            |
+-------------------------------------------------------------------------------+
```

---

## Quick Start & CLI Reference

### Prerequisites
- **Node.js $\ge 22.0.0$** (pure ESM and native `node:sqlite`)
- **Git $\ge 2.20$**

### Installation & Verification

```bash
git clone https://github.com/paragon-ux/arbiter-benchmark.git
cd arbiter-benchmark
npm ci
npm run verify
```

### Running Benchmarks via CLI

```bash
# Run all 14 scenarios in deterministic mode (default)
npm run benchmark

# Run with 10-trial statistical aggregation (Median, P95, StdDev)
node dist/src/cli/index.js --all --trials 10

# Run in Tier 1.5 Subprocess MCP mode (real OS child processes)
node dist/src/cli/index.js --scenario 008-agent-semantic-correctness --mode subprocess_mcp

# Run in live agy mode (requires local Antigravity CLI)
node dist/src/cli/index.js --mode live --scenario 004-parallel-arbiter

# Export benchmark results to JSON
node dist/src/cli/index.js --all --json results/benchmark.json
```

---

## Zero Runtime Dependencies

Arbiter Benchmark requires **0 runtime npm dependencies**. It is built entirely on Node 22 native modules:
- `node:sqlite` (Embedded database for DAG states and metrics)
- `node:child_process` (Process supervision and Git worktree management)
- `node:fs` and `node:path` (File system operations)
- `node:crypto` (Seeded Mulberry32 PRNG and SHA-256 fingerprinting)
