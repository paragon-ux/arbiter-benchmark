# Changelog

All notable changes to **arbiter-benchmark** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-09-04 ("Resilience & Scientific Rigor")

### Added
- **Tier 1.5 Subprocess MCP Runner (`SubprocessMcpAdapter`)**:
  - Spawns real OS child processes communicating via Model Context Protocol JSON-RPC 2.0 `stdio`.
  - Exercises real Git worktree checkouts, isolated branch commits, and SQLite WAL task leases in CI without external LLM API fees ($0 cost).
- **Statistical Multi-Trial Engine**:
  - Added `--trials <N>` CLI flag to `arbiter-benchmark`.
  - Calculates Median (P50), Mean, Standard Deviation ($\sigma$), P95, P99, and Coefficient of Variation (CV).
  - Formats multi-trial comparison tables in Markdown and JSON export (`results/benchmark-trials-summary.json`).
- **Platform-Stratified Regression Matrix (`REGRESSION_TOLERANCES.json`)**:
  - Stratifies latency tolerance by platform to eliminate cloud CI VM noise (Ubuntu 5%, Windows 20%, macOS 25%).
- **Pure Zero-Dependency Seeded PRNG (`Mulberry32`)**:
  - Replaces OS entropy with a deterministic 32-bit seeded generator (`seed: 0x6D2B79F5`), guaranteeing 100% byte-identical scenario outputs across consecutive runs.
- **Seven New Resilience & Chaos Scenarios (008–014)**:
  - `008-agent-semantic-correctness`: Agent performs multi-step refactoring, verifying TypeScript strict compilation and 100% test pass rate.
  - `009-parallel-10-workers`: 10 concurrent agent workers stressing SQLite WAL write serialization and worktree provisioning.
  - `010-cyclic-dag-rejection`: Directed cyclic graph ($A \to B \to C \to A$) cycle rejection in <2ms with zero partial execution.
  - `011-concurrent-lease-collision`: Two workers racing for same task lease; verifies atomic acquisition and deterministic `EAGAIN` backoff.
  - `012-signal-interrupted-merge`: `SIGTERM` sent mid-merge, verifying clean fail-closed rollback and quarantine.
  - `013-waymark-multi-compaction`: 3 sequential context compactions, verifying Waymark trajectory SHA-256 hash stability and >75% savings.
  - `014-disk-full-recovery`: `ENOSPC` disk-full error simulation, verifying transaction rollback and clean lease release.
- **Fortified AST Zero-Dependency Linter**:
  - Extended `scripts/public-check.mjs` to scan all source code for unauthorized non-`node:*` runtime imports.

---

## [1.0.0] — 2026-09-04 ("Foundation")

### Added
- **Zero Runtime Dependencies Architecture**: Built exclusively on native Node.js 22 LTS modules (`node:sqlite`, `node:child_process`, `node:fs`, `node:crypto`) with strict TypeScript and <6 MB heap footprint.
- **Dual-Tier Execution Engine**: Tier 1 (Deterministic Replay) and Tier 2 (Live Agy Runner).
- **Two Realistic Target Codebases**: `targets/microservice-auth` (12 files) and `targets/data-pipeline` (8 files).
- **Seven Core Benchmark Scenarios (001–007)**:
  - `001-single-agent-cold`: Baseline cold exploration after context compaction (~7,120 tokens).
  - `002-single-agent-waymark`: In-flight continuity resume (<216 tokens, >75% token reduction).
  - `003-parallel-no-isolation`: Chaos baseline simulating 2 uncoordinated agents editing the same working tree.
  - `004-parallel-arbiter`: 3 parallel agents executing in isolated Git worktrees with clean sequential merge.
  - `005-dag-dependencies`: 12-task DAG with Kahn topological sort and child task unblocking in sub-millisecond execution.
  - `006-conflict-quarantine`: Two workers submitting conflicting changes, verifying immediate `git merge --abort` and quarantine in `CONFLICT`.
  - `007-watchdog-dead-worker`: Dead worker PID detection via non-destructive `process.kill(pid, 0)` and lease recovery in <5ms.
- **Operator CLI**: `arbiter-benchmark` command supporting `--all`, `--scenario <id>`, `--mode <deterministic|live>`, and `--json <path>`.
- **Automated Public Hygiene Scanner**: `scripts/public-check.mjs` scanning for private keys, provider secrets, and local machine paths.
- **Multi-OS GitHub Actions CI Matrix**: Deterministic CI verification passing across Ubuntu 24.04 LTS, macOS 14/15 Sonoma, and Windows Server 2022.
