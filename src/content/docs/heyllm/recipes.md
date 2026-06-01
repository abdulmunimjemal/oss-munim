---
title: Recipes
description: Genuinely useful heyllm one-liners — commit messages, command explainers, file summaries, code review, and more.
---

`heyllm` shines when you stop typing prompts by hand and start piping context
into it. The pattern is almost always the same:

```bash
<something that writes to stdout> | heyllm "<instruction>"
```

Here's a handful that earn their place in your shell history.

## Write a commit message from staged changes

```bash
git diff --staged | heyllm "write a conventional commit message"
```

Pipe it straight into the editor by capturing the output:

```bash
git commit -m "$(git diff --staged | heyllm --no-stream 'one-line conventional commit message, no backticks')"
```

`--no-stream` here gives you the complete message in one shot, which is what you
want when substituting into another command.

## Explain a scary command

```bash
heyllm "explain this command step by step: $(history | tail -1 | sed 's/^ *[0-9]* *//')"
```

Or just paste it in:

```bash
heyllm "explain: tar -xzvf archive.tar.gz -C /opt"
```

## Summarize a file

```bash
cat README.md | heyllm "summarize this in 3 bullets"
```

Works for logs, configs, transcripts — anything text:

```bash
cat meeting-notes.txt | heyllm "extract the action items as a checklist"
```

## Find the root cause in a log

```bash
tail -n 200 error.log | heyllm "what's the root cause here, and the likely fix?"
```

## Review a diff before you push

```bash
git diff main... | heyllm --system "You are a terse senior reviewer" \
    "review this diff: call out bugs and risky changes, skip nitpicks"
```

## Draft a regex (and explain it)

```bash
heyllm "give me a regex for an RFC-5322-ish email, and explain each part"
```

## Translate or rewrite piped text

```bash
echo "Please find attached the requested documents." | heyllm "make this warmer and less formal"
pbpaste | heyllm "translate to French"   # macOS clipboard
```

## Summarize a web page

```bash
curl -s https://example.com/post | heyllm "summarize this article in 5 bullets"
```

## Generate from structured data

```bash
cat package.json | heyllm "list the runtime dependencies and what each is for"
```

## Pull token usage for a call

```bash
heyllm --json "ping" | jq '.usage'
```

---

A few habits that make these smoother:

- Use `--no-stream` whenever you're capturing output into `$(...)` or a
  variable — you want the whole answer, not a progressive stream.
- Add `--system "You are terse"` (or similar) to keep answers short and
  pipe-friendly.
- Switch models per task with `-m` — a small model like the default
  `gpt-4o-mini` is plenty for commit messages and summaries.

See the [CLI reference](/heyllm/cli/) for every flag, and
[Configuration](/heyllm/configuration/) for pointing `heyllm` at other
providers.
