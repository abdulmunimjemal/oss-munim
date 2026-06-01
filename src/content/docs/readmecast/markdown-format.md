---
title: Markdown format
description: Exactly how readmecast extracts commands and output from your Markdown — which fenced blocks, which prompts, and where output ends.
---

readmecast is **not** a full Markdown parser. It's a small, dependency-free line
scanner that pulls ordered shell *steps* — each a `{ command, output }` pair — out
of fenced code blocks. This page documents exactly what it recognizes, so you can
write Markdown that casts the way you expect.

## Which blocks are scanned

readmecast only looks inside fenced code blocks whose info string (the language
tag after the opening fence) is one of:

| Tag | Example |
| --- | --- |
| `bash` | ` ```bash ` |
| `sh` | ` ```sh ` |
| `shell` | ` ```shell ` |
| `console` | ` ```console ` |
| `zsh` | ` ```zsh ` |
| `shell-session` | ` ```shell-session ` |

The match is case-insensitive, so ` ```Bash ` works too. Blocks with any other
tag — or no tag at all — are ignored entirely. Both backtick (`` ``` ``) and
tilde (`~~~`) fences are supported, and a block is closed by a fence of the same
character that is at least as long as the one that opened it.

## Commands vs. output

Inside a recognized block:

- A line beginning with **`$ `** (or `$` with no space) is a **command**.
- A line beginning with **`> `** (or `>` with no space) is also treated as a
  command line — useful for a second prompt. Leading whitespace before the prompt
  is allowed.
- Any other non-empty line is **output**, attached to the most recent command.
- Output lines **accumulate until the next command line** — that's how readmecast
  knows where one step's output ends and the next command begins.
- Output that appears **before any command** in a block has nothing to attach to,
  so it's ignored.
- Trailing blank lines in a command's output are trimmed; interior blank lines are
  kept.

The leading prompt marker (`$`/`>`) and the single space after it are stripped, so
the rendered command shows just the command text. A bare `$` or `>` on its own
yields an empty command, which is preserved.

## Example: input → steps

Given this block:

````markdown
```bash
$ npm install readmecast
added 1 package in 1.2s
$ readmecast README.md -o demo.svg
wrote demo.svg
```
````

readmecast extracts two steps:

```ts
[
  { command: "npm install readmecast", output: "added 1 package in 1.2s" },
  { command: "readmecast README.md -o demo.svg", output: "wrote demo.svg" },
]
```

The first command's output ends exactly where the second command (`$ readmecast …`)
begins.

## Example: multi-line output

Output can span several lines — every non-command line until the next prompt is
collected:

````markdown
```console
$ ls
README.md
demo.svg
src
$ echo done
done
```
````

becomes:

```ts
[
  { command: "ls", output: "README.md\ndemo.svg\nsrc" },
  { command: "echo done", output: "done" },
]
```

## Example: a command with no output

A command immediately followed by another command (or the end of the block) has an
empty output string, and renders as a typed line with nothing beneath it:

````markdown
```sh
$ cd my-project
$ readmecast README.md -o demo.svg
wrote demo.svg
```
````

```ts
[
  { command: "cd my-project", output: "" },
  { command: "readmecast README.md -o demo.svg", output: "wrote demo.svg" },
]
```

## Example: prose before a command is ignored

Only lines after the first command become output. A descriptive line at the top of
a block, before any prompt, is dropped because there's no command to attach it to:

````markdown
```bash
# a quick tour
$ echo hi
hi
```
````

The `# a quick tour` line is ignored; the single step is
`{ command: "echo hi", output: "hi" }`.

## Multiple blocks

If a document has several recognized shell blocks, their steps are concatenated in
document order into one continuous terminal session. That lets you intersperse
prose between blocks while still producing a single demo.

## What happens with no steps

If a Markdown source contains no recognized shell blocks — or none of them have a
`$ `/`> ` command line — readmecast produces no steps. The CLI treats that as an
error and exits non-zero (see [CLI exit codes](/readmecast/cli/#exit-codes)); the
library simply returns an empty array.
