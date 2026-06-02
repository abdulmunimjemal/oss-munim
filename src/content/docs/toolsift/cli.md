---
title: CLI
description: Every toolsift command — run the proxy, install into agents, and benchmark your toolset.
---

```bash
toolsift <command> [options]
```

Run via `npx toolsift <command>` or install globally with
`npm i -g toolsift` (the installed binary is `toolsift`).

## Commands

| Command | What it does |
|---------|--------------|
| `mcp` | Connect to upstreams, index tools, and serve the proxy over MCP (stdio). |
| `install` | Wire toolsift into your agents (Claude Code, Cursor). |
| `eval` | Benchmark retrieval quality and token savings on a labelled dataset. |

## `toolsift mcp`

Start the proxy server. Reads `toolsift.json` from the current directory (or
`--config`), connects to each upstream, indexes their tools, and serves
`search_tools` + `invoke_tool` over stdio.

```bash
toolsift mcp
toolsift mcp --config /path/to/toolsift.json
```

This is the command you put in your MCP client config:

```json
{ "command": "npx", "args": ["-y", "toolsift", "mcp"] }
```

## `toolsift install`

Non-destructively merge a toolsift MCP entry into your agents' config files,
then print the paths it wrote.

| Option | Meaning |
|--------|---------|
| `--agent <name>` | Target `claude` \| `cursor` \| `all` (default `all`). |
| `--global` | Write to your home directory instead of the project. |

```bash
npx toolsift install                 # Claude Code + Cursor, project-local
npx toolsift install --agent claude  # Claude Code only
npx toolsift install --global        # home-dir config
```

## `toolsift eval`

A deterministic, key-free benchmark that scores retrieval quality against a
labelled `{query → expectedServer, expectedTool}` dataset and reports recall@k,
MRR, and token reduction per retriever.

| Option | Meaning |
|--------|---------|
| `--config <file>` | `toolsift.json` to use (default: `./toolsift.json`). |
| `--dataset <file>` | JSON query dataset (array or `{ "examples": [...] }`). Omit to use the built-in 28-tool corpus. |
| `--k <n>` | Top-k cutoff for recall (default 5). |
| `--embeddings` | Also score the `embeddings` and `hybrid` retrievers (requires `@huggingface/transformers`). |

```bash
# Built-in 28-tool corpus, BM25 only (zero deps)
npx toolsift eval

# All three retrievers
npx toolsift eval --embeddings

# Your own toolset
toolsift eval --config toolsift.json --dataset my-queries.json

# Tighter cutoff
toolsift eval --embeddings --k 3
```

Dataset format:

```json
[
  { "query": "open a bug report", "expectedServer": "github", "expectedTool": "create_issue" },
  { "query": "post to the team channel", "expectedServer": "slack", "expectedTool": "send_message" }
]
```

## Global options

| Option | Meaning |
|--------|---------|
| `--config <file>` | Path to `toolsift.json` (commands that read config). |
| `-h, --help` | Print help. |
| `-v, --version` | Print version. |
