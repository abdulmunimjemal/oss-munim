---
title: Benchmarks
description: Measured head-to-head vs codegraph — indexing speed, footprint, tokens per answer, and answer accuracy.
---

All numbers are reproducible from the repo (`bench/run.mjs`,
`bench/vs-codegraph.mjs`, `bench/accuracy.mjs`) and were measured on an Apple
Silicon laptop against [codegraph](https://github.com/colbymchenry/codegraph)
(~35k★), the leading local codebase-graph MCP, which shares codescope's
architecture (tree-sitter → SQLite + FTS5 → MCP). Both tools ran on the same
repos.

## Speed, footprint, tokens

| axis | repo | codegraph | codescope | winner |
|------|------|----------:|----------:|:------:|
| full index (CLI wall) | mcp-ts-sdk (262 f) | 2,335 ms | **670 ms** | codescope 3.5× |
| | phoenix (3,500 f) | 20,010 ms | **2,639 ms** | codescope 7.6× |
| index size on disk | mcp-ts-sdk | 8.2 MB | **2.5 MB** | codescope 3.3× |
| | phoenix | 112.8 MB | **22.8 MB** | codescope 5.0× |
| tokens / definition answer | mcp-ts-sdk | 187 | **145** | codescope |
| | phoenix | 215 | **183** | codescope |
| tokens / callers answer | mcp-ts-sdk | 122 | **98** | codescope |
| | phoenix | 177 | **145** | codescope |

Indexing is faster because parsing is fanned across a worker-thread pool; the
index is smaller because codescope stores a leaner node set; answers are shorter
because the output is built for an agent to read, not a human to skim.

## Accuracy — "did it return the right answer?"

The axis that matters most for an agent. Ground truth comes from each language's
**own native analysis engine** — the TypeScript compiler, Jedi for Python,
`go/types` for Go — not from codescope. For each definition we compute the true
set of files containing a call to it, then score each tool's `callers` answer.

| language | oracle | repo | codescope F1 | codegraph F1 |
|----------|--------|------|:------------:|:------------:|
| TypeScript | `tsc` | MCP SDK core / client / server | **0.95 / 0.92 / 0.96** | 0.66 / 0.70 / 0.91 |
| TypeScript | `tsc` | got · zustand | **0.97 · 0.99** | 0.75 · 0.87 |
| Python | Jedi | requests | **0.869** | 0.534 |
| Go | `go/types` | gin | **0.720** | 0.646 |

**codescope wins caller accuracy on every language and repo tested.** It rarely
misses a true caller (high recall) where codegraph misses 13–48%, with matching
or better precision. Go is the hardest case — gin reuses method names across many
types (`Use`, `Next`, `Handle`), so *both* tools have ~0.6 precision there without
receiver-type resolution; codescope still wins net. Type-aware method resolution
is the roadmap item that would lift precision further.

## Honest caveats

- The codegraph comparison is single-run on one machine. The two tools count
  graph nodes differently, so index time and size are informative but not a pure
  apples-to-apples ratio.
- Token reductions elsewhere in the docs (vs reading whole files) are a *model*
  of agent behaviour, not a captured agent trace.
- codescope's precision ceiling (collisions between same-named symbols) would
  need type-aware resolution to reach 1.00 — a roadmap item. As measured today,
  codescope is the more accurate of the two.
- **What codegraph still leads on:** a few extra node kinds (constants,
  properties, routes), broader agent auto-install, and — above all — maturity and
  a real user base. codescope is the leaner, faster, more accurate newcomer.
