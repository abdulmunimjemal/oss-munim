---
title: How it works
description: The graph, kind-aware resolution, parallel parsing, and watch-first incremental indexing.
---

## The pipeline

1. **Parse.** Every supported file is parsed with tree-sitter (WASM grammars)
   into definitions (functions, classes, methods, …) and references (calls,
   imports). A single config-driven walk classifies nodes per grammar, so adding
   a language is a table entry, not a new query file.

2. **Store.** Symbols and references go into a local SQLite database with a
   **trigram FTS5 index** for fast substring search at scale. References are
   stored *by name* and resolved to definitions lazily at query time — so editing
   one file never invalidates another file's stored data.

3. **Resolve.** Calls resolve **kind-aware**: a bare `foo()` resolves to a
   *function* named `foo`, while `x.foo()` resolves to a *method* named `foo`.
   This sidesteps the classic name-collision explosion (a project that defines a
   function called `push` doesn't get conflated with every `array.push()`).
   Ambiguous, library-ish names are left unexpanded rather than blowing up a
   neighbourhood.

4. **Watch.** A file watcher re-indexes each file on save — read + parse +
   replace — in roughly half a millisecond. Updates are per-file and
   content-hash gated, so the graph is always current and a re-scan skips
   everything unchanged.

## Watch-first: the graph is never stale

Refreshing the graph after you edit one file costs about **0.5 ms** on a
3,000-file repo — thousands of times cheaper than a full re-index. codescope
re-indexes on every save, so an agent always queries the code as it is *now*,
not a snapshot from when the session started.

## Parallel parsing

Profiling shows indexing is ~85% parsing and ~15% database insert. codescope
fans parsing across a **pool of worker threads** (one per core) while the main
thread owns SQLite and inserts results as they arrive. On a 3,500-file repo this
takes a full index from ~5 s to ~2.5 s. If worker threads aren't available, it
falls back to single-threaded parsing — so it stays correct everywhere.

## Why a graph beats grep

`grep` finds *text*; codescope understands *structure*. It knows `run` is a
method on `Service`, that `loadConfig` is called from three places, and that a
bare `parse()` is a different thing from `obj.parse()`. Tools return `file:line`
plus signatures — and a bounded **call neighbourhood** — so an agent gets the
relevant slice of the codebase for a change without opening a dozen files. That's
the token and tool-call saving measured in the [benchmarks](/codescope/benchmarks/).

## Honest limits

References resolve by **name + call shape**, not full type/scope analysis — it's
a fast heuristic graph, not a compiler. Cross-file import→definition resolution
(following an import to a specific definition file) and type-aware method
resolution are the roadmap items for pushing precision toward 1.0.
