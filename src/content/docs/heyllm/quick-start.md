---
title: Quick start
description: From zero to your first streamed answer — install, set OPENAI_API_KEY, ask, then pipe stdin in as context.
---

## 1. Install

```bash
npm install -g heyllm
# or: pnpm add -g heyllm
```

Requires Node.js ≥ 18 — `heyllm` uses the built-in global `fetch`, so there's no
extra HTTP dependency to pull in.

## 2. Set your API key

`heyllm` reads your key from the `OPENAI_API_KEY` environment variable. Export it
once:

```bash
export OPENAI_API_KEY="sk-..."
```

If no key is found and `--api-key` isn't passed, `heyllm` prints a clear error to
stderr and exits with code `2`. See [Configuration](/heyllm/configuration/) for
per-call overrides and other providers.

## 3. Ask your first question

```bash
heyllm "explain monads simply"
```

```console
A monad is a way to wrap a value along with a recipe for chaining
operations on it without unwrapping by hand...
```

Tokens stream to your terminal as the model produces them. That's the whole
single-shot flow — no session, no history, no config file.

## 4. Pipe stdin in as context

The real power is piping. The positional prompt becomes the *instruction*, and
whatever you pipe in becomes the *context* — combined into one user message,
prompt first:

```bash
git diff | heyllm "write a conventional commit message"
```

```console
feat(parser): handle SSE frames split across network chunks
```

Any command that writes to stdout works as context:

```bash
cat error.log | heyllm "what's the root cause here?"
curl -s https://example.com | heyllm "summarize this page in 3 bullets"
```

You can also pipe input with **no prompt at all** and let stdin stand on its own:

```bash
echo "translate to French: good morning" | heyllm
```

## Where to next

- [CLI reference](/heyllm/cli/) — every flag, streaming vs `--no-stream`,
  `--json`, and exit codes.
- [Configuration](/heyllm/configuration/) — point `--base-url` at OpenRouter, a
  local Ollama, or any OpenAI-compatible API, and pick a model.
- [Recipes](/heyllm/recipes/) — a handful of genuinely useful one-liners.
