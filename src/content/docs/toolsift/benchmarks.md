---
title: Benchmarks
description: Recall@k, MRR, and token savings across six domains and 60 tools — methodology, honest findings, and caveats.
---

How well does retrieving tools on demand work — does the *right* tool stay
reachable while the token surface shrinks? Every number here is reproducible
from the repo with no API key:

```bash
pnpm build
node bench/run.mjs                       # built-in 28-tool corpus (bm25)
node bench/generalize.mjs                # all 6 corpora + merged (needs embeddings dep)
node bench/generalize.mjs --bm25-only    # skip the model download
toolsift eval --embeddings               # default corpus, all retrievers
```

## Methodology

- **Corpora.** Six tool-sets modelled on real public MCP servers — `filesystem`,
  `github`, `slack`, `postgres`, `puppeteer`, and a mixed `gsuite` (Gmail /
  Calendar / Drive). 60 tools total. Plus a 28-tool built-in corpus for the
  zero-config `toolsift eval`.
- **Queries.** 129 labelled `{query → expectedServer, expectedTool}` examples
  written as natural user phrasings. **To guard against benchmark-maxing, many
  queries deliberately share no vocabulary with the target tool** — "make a new
  folder" → `create_directory`, "land PR #112 with a squash merge" →
  `merge_pull_request`, "is this join doing a sequential scan?" → `explain_query`.
  Lexical retrieval is *expected* to miss those; semantic retrieval should not.
- **Ground truth** is the labelled tool, not anything toolsift produces.
- **Metrics.** `recall@k` (is the right tool in the top-k?), `MRR` (how high
  it ranks on average), and `token reduction` — tokens of the all-tools surface
  (what an agent pays today) vs the surface toolsift exposes, via `gpt-tokenizer`.

## The realistic scenario — one agent, all 6 servers (60 tools)

This is what toolsift actually does: proxy several MCP servers at once. The
agent would otherwise carry all 60 tool definitions (4,305 tokens) every turn.

| retriever | recall@5 | MRR | exposed tokens | **saved** |
|-----------|:--------:|:---:|:--------------:|:---------:|
| all-tools (today's baseline) | 1.00 | 1.00 | 4,305 | 0% |
| bm25 (default, zero-dep) | 0.62 | 0.49 | 322 | **93%** |
| **embeddings** | **0.83** | 0.64 | 371 | 91% |
| hybrid | 0.80 | 0.62 | 355 | 92% |

**Retrieval cuts the tool surface ~92% while keeping the right tool reachable.**
Semantic retrieval keeps recall@5 highest as the corpus grows and queries
cross domains; BM25 is the leanest but loses the most recall when many tools
compete.

## Generalization — does it hold across domains, or just one?

Per-corpus `recall@5`, scored independently (anti-cherry-pick: every domain,
not an average that hides a weak one):

| corpus | tools | queries | bm25 | **embeddings** | hybrid |
|--------|:-----:|:-------:|:----:|:--------------:|:------:|
| filesystem | 11 | 23 | 0.78 | **1.00** | 0.87 |
| github | 17 | 27 | 0.67 | **0.93** | 0.81 |
| slack | 8 | 18 | 0.78 | **1.00** | 0.89 |
| postgres | 6 | 17 | 0.82 | 0.94 | **1.00** |
| puppeteer | 9 | 21 | 0.81 | **0.95** | 0.90 |
| gsuite | 9 | 23 | 0.83 | 0.96 | **1.00** |
| **mean** | | | 0.781 | **0.963** | 0.913 |

**Embeddings improves recall on every single corpus** (mean 0.78 → 0.96, +18
points) — the gain is not tuned to one toolset. It leads on 4 of 6; hybrid
edges it on 2 (postgres, gsuite). No retriever dominates every domain, which
is precisely why toolsift ships the eval so you can pick per toolset.

## Zero-config corpus (`toolsift eval`)

The 28-tool built-in set (GitHub / Slack / filesystem / Postgres / calendar):

| retriever | recall@5 | MRR | saved |
|-----------|:--------:|:---:|:-----:|
| all-tools | 1.00 | 1.00 | 0% |
| bm25 | 0.89 | 0.67 | 83% |
| **embeddings** | **1.00** | **0.90** | 82% |
| hybrid | 0.96 | 0.80 | 82% |

## Honest findings

1. **Semantic retrieval wins recall and generalizes.** Embeddings (a 23 MB
   `all-MiniLM-L6-v2` run locally, no API key) lifts mean recall@5 from 0.78
   to 0.96 across six unrelated domains. This is the headline result.
2. **Naive hybrid does not beat pure embeddings here.** Reciprocal Rank Fusion
   of BM25 + embeddings lands *between* the two on aggregate (0.913) — fusing
   the weaker lexical ranker drags recall down on these paraphrase-heavy sets.
   It does win on the two corpora with distinctive identifiers (postgres, gsuite).
   We report this rather than claim hybrid is universally best.
3. **Token savings scale with toolset size.** On a realistic 60-tool proxy,
   retrieval saves ~92%. The more servers you wire up, the bigger the win —
   which is exactly when bloat hurts most.
4. **BM25 is still the right default** for zero-install, instant, dependency-free
   use; switch to `embeddings`/`hybrid` (one `npm i`) when recall matters more
   than cold-start.

## Versus the field

The lazy-tool-loading niche has several entrants (lazy-mcp, lazy-tool,
tool-gating-mcp, meta-mcp-proxy, …). toolsift's retrieval is competitive —
`embeddings` uses the same `all-MiniLM-L6-v2` model as the strongest community
peers, and `hybrid` mirrors lazy-tool's lexical+vector fusion. The difference is
**measurement**: toolsift is the only one that ships an external, key-free,
`--dataset`-driven eval harness you can run against *your own* toolset in one
command to see recall@k and token savings before committing. A head-to-head
against lazy-tool's Go binary wasn't run here (different toolchain, and its
benchmark is an internal fixture, not a reusable harness); toolsift's
contribution is making this number portable.

## Caveats

- The default embedding model is small (384-dim, CPU). On the hard 60-tool set
  it tops out at 0.83 recall@5; a larger model or a hosted embedder (inject any
  `EmbedFn`) would push higher. Recall is reported, not tuned.
- `recall@k` measures whether the right tool is *reachable* in the top-k — the
  necessary condition for correct selection. End-to-end "did the model then pick
  it" is the planned `--llm` eval mode.
- Single machine, single run; embeddings timing depends on model load (cached
  after first use). The point is the retrieval quality and token axes, which
  are deterministic.
- The framing follows [RAG-MCP](https://arxiv.org/abs/2505.03275): retrieving
  tools on demand raises tool-selection accuracy (~14% all-tools → ~43% with
  retrieval) and cuts prompt tokens ~50%. toolsift measures the retrieval and
  token sides of that directly.
