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

The axis that matters most for an agent. Ground truth comes from the
**TypeScript compiler** (`LanguageService.findReferences` — the engine behind
go-to-definition). For each definition we compute the true set of files
containing a call to it, then score each tool's `callers` answer.

| package | codescope (P / R / **F1**) | codegraph (P / R / **F1**) | winner |
|---------|---------------------------|----------------------------|:------:|
| core (88 defs)   | 0.93 / 1.00 / **0.952** | 0.71 / 0.67 / 0.664 | codescope |
| client (39 defs) | 0.89 / 1.00 / **0.916** | 0.80 / 0.65 / 0.701 | codescope |
| server (36 defs) | 0.94 / 1.00 / **0.956** | 0.94 / 0.90 / 0.906 | codescope |

codescope returns the right callers more often on every package. It never misses
a true caller (recall 1.00) where codegraph misses 10–35%; its precision matches
or beats codegraph's.

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
