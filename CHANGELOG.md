# Changelog

All notable changes to **arbiter-benchmark** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-09-04 ("Foundation")

### Added
- **Zero Runtime Dependencies Architecture**: Built exclusively on native Node.js 22 LTS modules (`node:sqlite`, `node:child_process`, `node:fs`, `node:crypto`) with strict TypeScript and <6 MB heap footprint.
- **Dual-Tier Execution Engine**:
  - **Tier 1 (Deterministic Replay Engine)**: Seeded replay simulation with pre-recorded I/O fixtures executing sub-5ms in multi-OS cloud CI ($0 cost).
  - **Tier 2 (Live Agy Runner)**: Spawns real agent processes via the local Antigravity CLI (`agy`) across isolated worktrees using local subscription ($0 API cost).
- **Two Realistic Target Codebases**:
  - `targets/microservice-auth` (12 files): Complete authentication microservice with HMAC-SHA256 signing, session lifecycle, in-memory rate limiting, and structured audit logs. Includes full unit test suite.
  - `targets/data-pipeline` (8 files): Multi-stage ETL data pipeline featuring extraction, transformation with type coercion, schema validation, and batch loading. Includes full unit test suite.
- **Seven Core Benchmark Scenarios (001–007)**:
  - `001-single-agent-cold`: Baseline cold exploration after context compaction (~7,120 tokens).
  - `002-single-agent-waymark`: In-flight continuity resume (<216 tokens, >75% token reduction).
  - `003-parallel-no-isolation`: Chaos baseline simulating 2 uncoordinated agents editing the same working tree (demonstrates file corruption and broken builds).
  - `004-parallel-arbiter`: 3 parallel agents executing in isolated Git worktrees with clean sequential merge.
  - `005-dag-dependencies`: 12-task DAG with Kahn topological sort and child task unblocking in sub-millisecond execution.
  - `006-conflict-quarantine`: Two workers submitting conflicting changes, verifying immediate `git merge --abort` and quarantine in `CONFLICT`.
  - `007-watchdog-dead-worker`: Dead worker PID detection via non-destructive `process.kill(pid, 0)` and lease recovery in <5ms without orphan lock deadlocks.
- **Operator CLI**: `arbiter-benchmark` command supporting `--all`, `--scenario <id>`, `--mode <deterministic|live>`, and `--json <path>`.
- **Automated Public Hygiene Scanner**: `scripts/public-check.mjs` scanning for private keys, provider secrets, and local machine paths.
- **Multi-OS GitHub Actions CI Matrix**: Deterministic CI verification passing across Ubuntu 24.04 LTS, macOS 14/15 Sonoma, and Windows Server 2022.
