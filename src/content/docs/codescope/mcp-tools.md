---
title: MCP tools
description: The graph tools codescope exposes to your AI agent, and when each is used.
---

codescope registers these tools over MCP. Their descriptions are written *for the
agent* — they nudge it to query the graph instead of grepping and reading whole
files.

## search_symbols

Fuzzy substring search over definitions (functions, classes, methods, interfaces,
types, enums) across the whole repo. The agent's replacement for `grep`/`glob`
when locating where something is defined.

```text
search_symbols(query: string, kind?: SymbolKind, limit?: number)
```

```ansi
  > search_symbols loadConfig
  function export loadConfig — src/config.ts:12  ·  function loadConfig(): Config
  type     ConfigShape       — src/config.ts:4   ·  type ConfigShape = { … }
```

## get_symbol

Look up a definition by its exact name — kind, `file:line`, and signature.

```text
get_symbol(name: string, limit?: number)
```

## find_callers

The distinct callers of a function/method (both bare `foo()` and `x.foo()`),
grouped by file. "Who depends on this?"

```text
find_callers(name: string, limit?: number)
```

```ansi
  > find_callers parseSource
  src/indexer.ts:97   indexFile
```

## find_callees

The functions/methods a symbol calls, resolved to their definitions — the
outgoing side of the call graph. "What does this depend on?"

```text
find_callees(name: string, limit?: number)
```

## impact

The transitive callers of a symbol — everything that could be affected if you
change it — annotated with hop distance. Run it before editing a widely-used
function.

```text
impact(name: string, depth?: number, limit?: number)
```

```ansi
  > impact replaceFile
  [1 hop] method Indexer.indexFile — src/indexer.ts:87
  [2 hop] method Indexer.indexAll  — src/indexer.ts:54
  [3 hop] function cmdIndex        — src/cli.ts:107
```

## context

Given a task or feature query, a compact ranked relevance map: the matching
symbols plus their immediate call neighbourhood, ordered by how widely each is
called. The fastest way to orient an agent before a change — graph facts instead
of file dumps.

```text
context(query: string, maxSymbols?: number)
```

## affected

Given a list of changed files, the test files likely affected — found via the
symbols those files define *and* the import graph (so it reaches tests that
import the changed module even when they never appear in the call graph). Know
what to re-run without running anything.

```text
affected(files: string[], depth?: number)
```

```ansi
  > affected src/store.ts
  3 test file(s) affected:
    test/store.test.ts
    test/mcp.test.ts
    test/indexer.test.ts
```

## find_references · file_outline · neighborhood · stats

- **find_references** — all references (calls + imports) to a name.
- **file_outline** — every symbol in a file, in source order — a compact
  alternative to reading the file.
- **neighborhood** — the call neighbourhood (callers + callees, a few hops)
  around a symbol, as a subgraph.
- **stats** — counts for the indexed graph (files, symbols, refs, by kind/language).

Every tool is also available from the [CLI](/codescope/cli/).
