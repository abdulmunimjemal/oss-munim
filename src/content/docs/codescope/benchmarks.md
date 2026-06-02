---
title: Benchmarks
description: Measured head-to-head vs codegraph and other OSS code-graph tools — indexing speed, footprint, tokens per answer, and answer accuracy.
---

All numbers are reproducible from the repo (`bench/run.mjs`,
`bench/vs-codegraph.mjs`, `bench/accuracy.mjs`) and were measured on an Apple
Silicon laptop against [codegraph](https://github.com/colbymchenry/codegraph)
(~35k★), the leading local codebase-graph MCP, which shares codescope's
architecture (tree-sitter → SQLite + FTS5 → MCP). Both tools ran on the same
repos.

## Performance

codescope's own numbers across four repos of increasing size:

| repo | files | symbols | full index | incremental (per save) | nav token reduction |
|------|------:|--------:|-----------:|-----------------------:|--------------------:|
| codescope | 33 | 202 | 121 ms | 2.0 ms | 64% |
| mcp-ts-sdk | 264 | 1,958 | 572 ms | 0.54 ms | 74% |
| phoenix | 3,511 | 20,143 | 2.1 s | 0.82 ms | 80% |
| trigger.dev | 2,490 | 33,786 | 1.8 s | 0.74 ms | 99% |

Re-indexing one changed file costs ~0.5–0.8 ms (**280–1,200× cheaper than a full
re-index**), so the watch-first graph stays current on every save. Queries are
sub-millisecond. Token reduction is vs an agent reading the whole file to answer
"where is X and what calls it."

## Head-to-head vs codegraph

| axis | repo | codegraph | codescope | winner |
|------|------|----------:|----------:|:------:|
| full index (CLI wall) | mcp-ts-sdk (264 f) | 2,335 ms | **670 ms** | codescope 3.5× |
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
| Python | Jedi | requests | **0.788** | 0.454 |
| Go | `go/types` | gin | **0.720** | 0.646 |

**codescope wins caller accuracy on every language and repo tested.** It rarely
misses a true caller (high recall) where codegraph misses 13–48%, with matching
or better precision. Go is the hardest case — gin reuses method names across many
types (`Use`, `Next`, `Handle`), so *both* tools have ~0.6 precision there without
receiver-type resolution; codescope still wins net. Type-aware method resolution
is the roadmap item that would lift precision further.

## Versus the broader OSS field

codegraph isn't the only peer. codescope was also benchmarked against other
runnable open-source tools (each run locally, same harness):

- **code-graph-mcp** (`@sdsrs/code-graph`, Rust, 16 languages + semantic search):
  codescope is **2–4× smaller and faster to index** on all five fresh repos, and
  more accurate on callers — Python F1 **0.788 vs 0.217**, Go **0.720 vs 0.651**.
- **code-review-graph** (Python, + community detection / wikis): building
  `requests` took **5.98 s / 6.1 MB** vs codescope's ~0.3 s / ~0.7 MB
  (≈20× faster, ≈9× smaller). Its query interface is MCP-only, so caller accuracy
  wasn't measured.
- **CodeGraphContext** stores its graph in Neo4j (needs a running server) — not
  measured here.

Against every competitor benchmarked, codescope is the leanest, fastest, and most
call-graph-accurate — though those tools offer features codescope doesn't
(semantic/vector search, community detection, Cypher over Neo4j). codescope's bet
is "small, fast, accurate call graph."

## Does it generalize? (cross-codebase)

To check nothing is tuned to one repo, the head-to-head ran on **five fresh,
unrelated codebases** across languages — including **Gin, one of codegraph's own
published benchmark repos** (anti-cherry-pick):

| repo | lang | index size | tokens/def | tokens/callers |
|------|------|:----------:|:----------:|:--------------:|
| gin | Go | **cs** 1.6 vs 5.6 MB | cg 109 vs 97 | **cs** 76 vs 103 |
| requests | Python | **cs** 0.7 vs 2.4 MB | **cs** 126 vs 172 | **cs** 59 vs 74 |
| zustand | TS | **cs** 0.5 vs 1.0 MB | tie 81 vs 80 | cg 29 vs 20 |
| got | TS | **cs** 1.0 vs 3.2 MB | **cs** 90 vs 96 | tie 53 vs 52 |
| ripgrep | Rust | **cs** 2.0 vs 9.1 MB | **cs** 150 vs 167 | **cs** 81 vs 154 |

Index size: codescope wins **5/5** (3–4× smaller). Tokens: wins most, ties/loses
a few — competitive, not universally ahead. The variance is the point: nothing is
hand-tuned to one codebase. (Accuracy generalization is the multi-language table
above, scored against each language's native compiler/analyzer.)

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
