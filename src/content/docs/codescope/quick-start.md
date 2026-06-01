---
title: Quick start
description: Index a repo and wire codescope into your AI agent in two minutes.
---

## 1. Wire it into your agent (the easy way)

From your project root:

```bash
npx @abdulmunimjemal/codescope install
```

```ansi
  ✓ added codescope for claude → .mcp.json
  ✓ added codescope for cursor → .cursor/mcp.json

  Restart your agent to pick up the change.
```

This merges a codescope MCP server entry into your agents' configs without
touching anything else already there. Target one agent with `--agent claude` or
`--agent cursor`, or write to your home directory with `--global`.

Requires Node ≥ 18. Nothing to install globally — `npx` runs it on demand.

## 2. Or wire it by hand

codescope speaks MCP over stdio. The server command is:

```bash
codescope mcp /path/to/your/repo
```

**Claude Code** — add to `.mcp.json`:

```json
{
  "mcpServers": {
    "codescope": { "command": "npx", "args": ["-y", "@abdulmunimjemal/codescope", "mcp", "."] }
  }
}
```

**Cursor / Codex / any MCP client** — same command:
`npx -y @abdulmunimjemal/codescope mcp .`

When it starts, codescope indexes the repo, begins watching for changes, and
serves the graph. Your agent now has tools like `search_symbols`, `find_callers`,
`neighborhood`, and `context`.

## 3. Try it from the terminal

You don't need an agent to use codescope — the CLI exposes every tool:

```bash
codescope index .                       # build the graph, print stats
codescope search useState               # fuzzy symbol search
codescope get GraphStore                # jump to a definition
codescope callers parseSource           # who calls this
codescope impact GraphStore             # blast radius before a change
codescope context "auth flow"           # ranked relevance map for a task
codescope affected src/store.ts         # which tests a change affects
```

```ansi
  $ codescope callers parseSource
  src/indexer.ts:97   indexFile
```

The index lives in `.codescope/graph.db` — add `.codescope/` to your
`.gitignore`. codescope already respects your repo's `.gitignore` when indexing.

## Next steps

- [MCP tools](/codescope/mcp-tools/) — every tool your agent gets.
- [How it works](/codescope/how-it-works/) — the graph, incremental indexing, and resolution.
- [Benchmarks](/codescope/benchmarks/) — how it compares to codegraph.
