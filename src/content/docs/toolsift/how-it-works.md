---
title: How it works
description: Aggregate → Index → Expose → Proxy. How toolsift turns N upstream MCP servers into a two-tool surface.
---

## The pipeline

1. **Aggregate.** toolsift connects to each configured upstream MCP server as a
   client — stdio or HTTP — calls `tools/list`, and builds one in-memory registry
   of `{ server, name, description, inputSchema }` records. No file system writes,
   no external database.

2. **Index.** The registry is indexed by a pluggable **retriever**. The default
   is a self-contained **BM25** over each tool's name (weighted higher),
   description, and parameter names — zero dependencies, instant, and tuned for
   the camelCase / snake_case identifiers tools use. The corpus is tiny (dozens to
   hundreds of tools) so it lives entirely in memory; no vector DB needed.

3. **Expose.** toolsift runs as its own MCP server over stdio and advertises
   `search_tools` + `invoke_tool` (+ any pinned pass-throughs), *not* the upstream
   definitions. The agent searches first, gets a few schemas, and invokes.

4. **Proxy.** `invoke_tool` looks up the owning upstream by server name, forwards
   the call verbatim, and returns its result unchanged — including content blocks,
   errors, and the `isError` flag.

## Why the two-tool surface matters

Every tool definition sent to an agent consumes context window tokens *before the
first message*. With 5 MCP servers averaging 10 tools each, the agent is already
carrying ~1,000–4,000 tokens of tool metadata it will mostly ignore. toolsift
replaces that with:

- **`search_tools`** — one call, returns 3–5 relevant schemas (~150–400 tokens).
- **`invoke_tool`** — one call, proxies the result.

On a realistic 60-tool setup, this cuts the per-turn tool surface by ~92%
while keeping the right tool reachable (recall@5 0.83 with embeddings). See
[Benchmarks](/toolsift/benchmarks/).

## In-memory, no persistence

Tool definitions are aggregated at startup (`tools/list`). The entire index
lives in memory — there is no on-disk database, no SQLite file, nothing to
clean up. A `UpstreamManager.refresh()` hook exists to re-aggregate if an
upstream's tool list changes, but live `notifications/tools/list_changed`
subscriptions aren't wired into the proxy yet (roadmap).

## Retriever plug-in model

The retriever is the only stateful component. toolsift calls:

1. `retriever.index(tools)` — once, at startup.
2. `retriever.search(query, k)` → scored tool references.

Any object that implements those two async methods is a valid retriever. The
built-in retrievers (`bm25`, `embeddings`, `hybrid`) all conform to this shape,
and you can inject a custom one via `createRetriever("embeddings", { embed })`.
See [Retrievers](/toolsift/retrievers/) and the [Programmatic API](/toolsift/api/).

## Honest limits

- Tool definitions are aggregated **at startup**; toolsift does not yet react to
  live upstream tool-list changes.
- `pinned` matches by tool name only — if two upstreams expose the same tool name,
  review your config to avoid ambiguous pinning.
- Retrieval quality scales with the quality of the upstream tool descriptions. A
  tool with a vague or missing description will rank poorly regardless of retriever.
