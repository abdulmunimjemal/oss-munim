---
title: Why promptsize
description: How promptsize differs from a plain token counter, and when to reach for it.
---

## The problem

Prompts don't stay small. Someone adds three more few-shot examples, the system
prompt picks up another paragraph, a RAG template grows a section. Each change
looks harmless on its own. Then one day you're paying double per call, or you
trip the context window in production — and nobody noticed *when* it happened,
because no pull request ever said "this prompt grew 40%."

`promptsize` makes that visible the same way
[`size-limit`](https://github.com/ai/size-limit) made JavaScript bundle creep
visible: a number in the PR, and a red ✘ when a prompt crosses a line you set.

## Why not just a token counter?

There are plenty of token *counters* and usage *trackers*. `promptsize` is the
piece that's usually missing: a **budget gate** that

- runs in CI and **exits non-zero** on a breach,
- tracks **regressions** against a committed baseline,
- and reports the diff right where reviewers see it.

It's the difference between "I can measure this if I remember to" and "this is
enforced on every change."

## Design choices

### Offline and deterministic

Token counts come from [`gpt-tokenizer`](https://github.com/niieani/gpt-tokenizer) —
pure JavaScript, no network calls, no API keys. The same input always produces
the same count, which is exactly what a CI gate needs. No flaky checks, no rate
limits, no secrets in your pipeline.

### Honest about approximation

OpenAI ships public tokenizers; Anthropic and Google don't ship JavaScript ones.
For `claude-*` and `gemini-*` model names, `promptsize` approximates with
OpenAI's `o200k_base` encoding — and it **always prints the encoding it used**,
so the number is never a black box. For budgeting and catching regressions, the
approximation is more than close enough.

### Files as the unit

Prompts live as files — `.md`, `.txt`, templates. `promptsize` budgets files and
globs, so "all my few-shot examples" can be a single number you watch over time.

## When to use it

- You ship LLM features where prompts live as files and **cost or latency matter**.
- You want **review-time visibility** into prompt growth, not a dashboard you
  check after the fact.
- You're assembling context from many pieces and want a **ceiling** enforced.

If you're just experimenting in a notebook, you probably don't need it yet —
reach for it when prompt size becomes something you'd regret not watching.
