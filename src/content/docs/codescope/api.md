---
title: Programmatic API
description: Use codescope's graph store, indexer, watcher, and parser directly from TypeScript.
---

Everything codescope does is importable. The package ships ESM with type
declarations.

```bash
npm install @abdulmunimjemal/codescope
```

## Index and query a repo

```ts
import { GraphStore, Indexer } from "@abdulmunimjemal/codescope";

const store = new GraphStore("graph.db");      // or ":memory:"
const indexer = new Indexer(store, "/path/to/repo");
await indexer.indexAll();

store.searchSymbols("config");                 // fuzzy symbol search
store.getSymbol("GraphStore");                 // exact definition lookup
store.findCallers("parseSource");              // who calls it (by file)
store.findCallees("indexAll");                 // what it calls
store.impact("replaceFile", { depth: 3 });     // transitive callers
store.neighborhood("handleRequest", { depth: 2 });
store.context("auth flow", { maxSymbols: 30 });
store.stats();
store.close();
```

## Keep it fresh

```ts
import { watch } from "@abdulmunimjemal/codescope";

const handle = watch(indexer, {
  onChange: (file, action) => console.log(action, file), // "indexed" | "removed"
});
// …later
await handle.close();
```

## Affected tests

```ts
import { affected } from "@abdulmunimjemal/codescope";

const { tests } = affected(store, ["src/store.ts", "src/parser.ts"]);
// tests: string[] — the test files a change likely affects
```

## Parse a single source string

```ts
import { parseSource, languageForPath } from "@abdulmunimjemal/codescope";

const lang = languageForPath("example.ts");          // → LanguageConfig | undefined
const { symbols, refs } = await parseSource("typescript", "export function f(){}");
```

## Run the MCP server in-process

```ts
import { createServer, runStdioServer, GraphStore } from "@abdulmunimjemal/codescope";

const store = new GraphStore(":memory:");
// …index…
await runStdioServer(store);            // connect over stdio, or:
const server = createServer(store);     // an McpServer you can wire to any transport
```

## Programmatic install

```ts
import { install } from "@abdulmunimjemal/codescope";

install("/path/to/repo", { agents: ["claude", "cursor"] });
```

## Exports

`GraphStore`, `Indexer`, `watch`, `parseSource`, `languageForPath`, `LANGUAGES`,
`SUPPORTED_EXTENSIONS`, `createServer`, `runStdioServer`, `affected`,
`isTestFile`, `install`, `serverEntry`, `format` (the compact renderers),
`VERSION`, and the full set of types (`SymbolRow`, `RefRow`, `Neighborhood`,
`ContextBundle`, `IndexStats`, …).
