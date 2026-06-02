---
title: MCP tools
description: The agent-facing tools toolsift exposes — search_tools, invoke_tool, list_servers, and pinned pass-throughs.
---

toolsift registers these tools over MCP. Their descriptions are written *for the
agent* — they nudge it to search first and invoke second, rather than expecting
every upstream tool to be in context.

## search_tools

Retrieve the top-k upstream tool definitions most relevant to a task. Returns
each tool's server, name, description, and `inputSchema` — enough for the agent
to decide which one to call.

```text
search_tools(query: string, k?: number)
```

```ansi
  > search_tools("open a github issue")
  [github] create_issue — Create a new issue in a repository …
  [github] create_issue_comment — Add a comment to an existing issue …
  [fs]     read_file — Read the complete contents of a file …
```

`k` defaults to the `topK` value in `toolsift.json` (default 5). The agent
calls this tool *before* calling any upstream tool — it trades one meta-call
for a much smaller tool surface.

## invoke_tool

Forward a call to one upstream tool and proxy the result back unchanged.

```text
invoke_tool(server: string, name: string, arguments: object)
```

`server` must match a name from your `toolsift.json` servers list. `arguments`
is forwarded verbatim to the upstream. The response (including any content
blocks, errors, or `isError` flag) is returned as-is.

```ansi
  > invoke_tool("github", "create_issue", { "owner": "...", "repo": "...", "title": "bug: …" })
  { "content": [{ "type": "text", "text": "Issue #42 created." }] }
```

## list_servers

A lightweight orientation tool — returns the upstream servers toolsift is
connected to and their tool counts. Useful when the agent needs to know what's
available before deciding how to phrase a `search_tools` query.

```text
list_servers()
```

```ansi
  > list_servers()
  github  — 17 tools
  fs      — 11 tools
  slack   — 8 tools
```

## Pinned pass-throughs

Tools listed in `"pinned"` in `toolsift.json` are exposed directly — no search
needed, always in context. They behave like normal MCP tools from the agent's
perspective and are forwarded to their upstream the same way as `invoke_tool`.

```json
{
  "pinned": ["read_file", "list_directory"]
}
```

Use `pinned` for the handful of tools your agent reaches for on nearly every
turn — file reads, directory listings, etc. — where the search round-trip
adds latency without benefit.

## How the agent should use these

The intended flow:

1. Agent calls `search_tools(query)` to retrieve the 3–5 most relevant definitions.
2. Agent inspects the returned schemas and picks the right tool.
3. Agent calls `invoke_tool(server, name, arguments)`.

Pinned tools skip step 1 — the agent can call them directly since their
definitions are already in context. `list_servers()` is optional; it helps
orient a fresh agent session before the first search.
