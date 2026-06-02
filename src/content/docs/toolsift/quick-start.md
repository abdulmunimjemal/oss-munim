---
title: Quick start
description: Write toolsift.json, wire toolsift into your agent, and cut tool-definition tokens in two minutes.
---

## 1. Tell toolsift about your upstream servers

Create `toolsift.json` in your project root:

```json
{
  "servers": [
    {
      "name": "github",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_…" }
    },
    {
      "name": "fs",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  ],
  "pinned": ["read_file"],
  "retriever": "bm25",
  "topK": 5
}
```

- **`servers`** — the upstream MCP servers toolsift connects to as a client (stdio or HTTP). HTTP upstreams work too: `{ "name": "remote", "url": "https://…/mcp" }`.
- **`pinned`** — tool names to expose directly as pass-throughs (always in context, no search needed). Match by tool name across servers.
- **`retriever`** — `"bm25"` (default, zero dependencies), `"embeddings"`, or `"hybrid"`. See [Retrievers](/toolsift/retrievers/).
- **`topK`** — how many tool definitions `search_tools` returns per query (default 5).

## 2. Wire toolsift into your agents — the easy way

```bash
npx toolsift install
```

```ansi
  ✓ added toolsift for claude → .mcp.json
  ✓ added toolsift for cursor → .cursor/mcp.json

  Restart your agent to pick up the change.
```

This merges a toolsift MCP server entry into your agents' configs without
touching anything already there. Target one agent with `--agent claude` or
`--agent cursor`, or write to your home directory with `--global`.

Requires Node ≥ 18. Nothing to install globally — `npx` runs it on demand.

## 3. Or wire it by hand

toolsift speaks MCP over stdio. The server command is `npx -y toolsift mcp`.

**Claude Code** — add to `.mcp.json`:

```json
{
  "mcpServers": {
    "toolsift": { "command": "npx", "args": ["-y", "toolsift", "mcp"] }
  }
}
```

**Cursor / Codex / any MCP client:** use the same command —
`npx -y toolsift mcp` over stdio.

When it starts, toolsift connects to each configured upstream, aggregates their
tools into the in-memory index, and begins serving `search_tools` + `invoke_tool`
(plus any pinned pass-throughs). Your agent now retrieves only what it needs.

## 4. Check the savings with the built-in eval

```bash
npx toolsift eval --embeddings
```

```ansi
  tools: 28 · queries: 28 · k: 5 · baseline surface: 1342 tokens

  retriever   recall@5  mrr   tokens  saved
  ----------  --------  ----  ------  -----
  all-tools   1.00      1.00  1342    0%
  bm25        0.89      0.67  223     83%
  embeddings  1.00      0.90  242     82%
  hybrid      0.96      0.80  236     82%
```

Or point it at your actual toolset and a labelled query file:

```bash
toolsift eval --config toolsift.json --dataset my-queries.json
```

See the [CLI reference](/toolsift/cli/) and [Benchmarks](/toolsift/benchmarks/) for details.

## Next steps

- [MCP tools](/toolsift/mcp-tools/) — what the agent sees after wiring.
- [Retrievers](/toolsift/retrievers/) — BM25 vs embeddings vs hybrid, and how to swap in your own model.
- [Benchmarks](/toolsift/benchmarks/) — token savings and recall across 60 tools.
