---
title: CLI
description: Every codescope command — index, serve over MCP, watch, and query the graph from your terminal.
---

```bash
codescope <command> [path] [options]
```

Run via `npx codescope-mcp <command>` or install globally with
`npm i -g codescope-mcp` (the installed binary is `codescope`).

## Commands

| Command | What it does |
|---------|--------------|
| `install [path]` | Wire codescope into your agents (Claude Code, Cursor). |
| `mcp [path]` | Index, watch for changes, and serve the graph over MCP (stdio). |
| `index [path]` | Build (or refresh) the on-disk graph and print stats. |
| `watch [path]` | Index, then keep the graph fresh as files change. |
| `stats [path]` | Show counts for the indexed graph. |
| `search <query> [path]` | Fuzzy-search symbol names. |
| `get <name> [path]` | Look up a definition by exact name. |
| `callers <name> [path]` | Distinct callers of a function/method. |
| `callees <name> [path]` | What a function/method calls. |
| `impact <name> [path]` | Transitive callers (blast radius) of a symbol. |
| `context <query> [path]` | Ranked relevance map for a task. |
| `affected <files...>` | Test files affected by a set of changed files. |
| `neighborhood <name>` | The call neighbourhood around a symbol. |

## Options

| Option | Meaning |
|--------|---------|
| `--path <dir>` | Repository root (default: cwd or the positional path). |
| `--db <file>` | SQLite graph location (default: `<root>/.codescope/graph.db`). |
| `--memory` | Use an in-memory graph (not persisted). |
| `--kind <kind>` | Restrict search to `function`/`method`/`class`/`interface`/`type`/`enum`/`variable`. |
| `--limit <n>` | Max results (default 50). |
| `--depth <n>` | `neighborhood`/`impact` hops (default 2–3). |
| `--agent <name>` | `install` target: `claude` \| `cursor` \| `all` (default all). |
| `--global` | `install` writes to your home dir instead of the project. |
| `-h, --help` · `-v, --version` | Help / version. |

## Examples

```bash
# index once, then query without re-indexing (the graph is cached on disk)
codescope index .
codescope search useState
codescope neighborhood handleRequest --depth 3

# point an agent at it
codescope mcp .            # add this command to your MCP config

# CI: which tests does this PR's diff affect?
codescope affected $(git diff --name-only origin/main)
```

A query command (`search`, `get`, `callers`, …) auto-indexes the repo on first
run if no graph exists yet, so you can jump straight to querying.
