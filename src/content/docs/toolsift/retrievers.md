---
title: Retrievers
description: The three toolsift retrievers — BM25 (default), local embeddings, and hybrid RRF — and how to plug in your own embedding backend.
---

toolsift ships three retrievers. All three operate entirely in-memory on the
aggregated tool registry (dozens to hundreds of entries) — no vector DB, no
external service.

## BM25 — the zero-dependency default

Self-contained lexical retrieval tuned for the camelCase / snake_case identifiers
that tool names and parameter names use. Zero extra dependencies, instant cold
start, and accurate on keyword/identifier queries.

```json
{ "retriever": "bm25" }
```

**When to use it:** always, if you haven't opted into the embeddings peer. It's
the right default for most toolsets — cheap, deterministic, and fast.

**When it falls short:** queries that share no vocabulary with the target tool —
"make a new folder" → `create_directory`, "land this PR" → `merge_pull_request`.
These are exactly the cases where semantic retrieval wins.

## embeddings — local, no API key

Semantic retrieval via `all-MiniLM-L6-v2` (23 MB, 384-dim) run locally using
`@huggingface/transformers`. The model is fetched once and cached; subsequent
starts are instant. No API key, no network.

```bash
npm i @huggingface/transformers     # opt in
```

```json
{ "retriever": "embeddings" }
```

On the realistic 60-tool benchmark, embeddings raises recall@5 to **0.83** (vs
0.62 for BM25) and generalizes across every domain — mean recall@5 **0.963**
across six unrelated corpora. It's the headline result. See
[Benchmarks](/toolsift/benchmarks/).

**When to use it:** when recall matters more than cold-start time, especially
on large multi-server setups where queries are paraphrase-heavy.

## hybrid — RRF fusion of BM25 + embeddings

Fuses BM25 and embeddings rankings with Reciprocal Rank Fusion (RRF). Same
dependency requirement as `embeddings`.

```bash
npm i @huggingface/transformers     # required
```

```json
{ "retriever": "hybrid" }
```

**Honest note:** on the aggregate 60-tool benchmark, hybrid (0.80 recall@5)
lands *between* BM25 and pure embeddings (0.83) — fusing the weaker lexical
ranker drags recall down on paraphrase-heavy sets. It does edge out embeddings
on the two corpora with distinctive identifiers (postgres, gsuite). We report
this rather than claim hybrid is universally best. Use the
[eval harness](/toolsift/cli/) to pick per toolset.

## Retriever comparison

| retriever | needs | recall@5 (60-tool) | cold start |
|-----------|-------|:-----------------:|-----------|
| `bm25` | nothing (default) | 0.62 | instant |
| `embeddings` | `@huggingface/transformers` | **0.83** | ~1 s (cached after first run) |
| `hybrid` | `@huggingface/transformers` | 0.80 | ~1 s (cached after first run) |

## Pluggable EmbedFn

The `embeddings` and `hybrid` retrievers accept any async embedding function —
inject a hosted API, a different local model, or a quantised variant:

```ts
import { createRetriever } from "toolsift";

const retriever = createRetriever("embeddings", {
  embed: async (texts: string[]) => myHostedEmbedApi(texts),
});
```

`embed` receives a string array and must return a `number[][]` (one vector per
input). This keeps the core package lean (BM25 ships with no extra deps) while
letting you bring any embedding backend for production workloads.
