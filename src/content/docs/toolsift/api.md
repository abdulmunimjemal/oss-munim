---
title: Programmatic API
description: Use toolsift's UpstreamManager, retrievers, proxy server, and eval harness directly from TypeScript.
---

Everything toolsift does is importable. The package ships ESM with type
declarations.

```bash
npm install toolsift
```

## Connect to upstreams and search

```ts
import { UpstreamManager, createRetriever } from "toolsift";

const manager = new UpstreamManager(config.servers);
await manager.connect();                           // connects to each upstream, calls tools/list

const retriever = createRetriever("bm25");         // or "embeddings" | "hybrid"
await retriever.index(manager.tools());            // index the aggregated registry
const results = await retriever.search("open a github issue", 5);
// → scored tool refs: [{ server, name, description, inputSchema, score }, …]
```

## Use a custom embedding backend

```ts
import { createRetriever } from "toolsift";

const retriever = createRetriever("embeddings", {
  embed: async (texts: string[]) => myHostedEmbedApi(texts),
  // embed receives string[] and must return number[][] (one vector per text)
});
await retriever.index(manager.tools());
```

`embed` is the only required option for a custom backend. The retriever handles
scoring and ranking; you supply the vectors.

## Build the proxy server

```ts
import { UpstreamManager, createServer } from "toolsift";

const manager = new UpstreamManager(config.servers);
await manager.connect();

const server = createServer({ manager, config });
// server is an McpServer — wire to any transport:
await server.connect(transport);
```

## Run the eval harness

```ts
import { UpstreamManager, runEval } from "toolsift";

const manager = new UpstreamManager(config.servers);
await manager.connect();

const report = await runEval(manager.tools(), dataset, {
  k: 5,
  retrievers: ["all-tools", "bm25", "embeddings", "hybrid"],
});
// report: per-retriever { recall, mrr, tokensSaved, tokenSurface }
```

`runEval` is deterministic — no model calls, no API key. `dataset` is an array
of `{ query, expectedServer, expectedTool }`.

## Refresh upstream tools

```ts
await manager.refresh();
// Re-calls tools/list on all upstreams and rebuilds the in-memory registry.
// Re-index the retriever afterwards if tool lists changed.
await retriever.index(manager.tools());
```

## Exports

`UpstreamManager`, `createRetriever`, `createServer`, `runEval`,
`runStdioServer`, `install`, `VERSION`, and the full type set
(`ToolRef`, `ScoredToolRef`, `UpstreamConfig`, `ToolsiftConfig`,
`EvalDataset`, `EvalReport`, `EmbedFn`, `Retriever`, …).
