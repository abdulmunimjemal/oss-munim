---
title: Quick start
description: From install to an animated terminal-demo SVG embedded in your README, in a few steps.
---

## 1. Install

```bash
npm install -g readmecast
# or run once, no install:
npx readmecast README.md -o demo.svg
```

Requires Node ≥ 18. readmecast ships as an ES module with a single `readmecast`
binary and no native dependencies.

## 2. Write your session in Markdown

readmecast reads the shell snippets you already write in docs. Put your session
in a fenced shell block (` ```bash `, ` ```sh `, ` ```shell `, ` ```console `,
` ```zsh `, or ` ```shell-session `). Lines starting with `$ ` (or `> `) are
commands; the lines after a command, up to the next command, are its output:

````markdown
```bash
$ npm install readmecast
added 1 package in 1.2s
$ readmecast README.md -o demo.svg
wrote demo.svg
```
````

You don't need a new file — if your README already has blocks like this,
readmecast can cast the README itself. See
[Markdown format](/readmecast/markdown-format/) for the exact extraction rules.

## 3. Cast it

Point the CLI at the file and write an SVG:

```bash
readmecast README.md -o demo.svg          # write an SVG to a file
cat README.md | readmecast > demo.svg     # or pipe on stdin
```

Omit `-o` and the SVG goes to stdout, so it composes with redirects and pipes.

## 4. Embed it in your README

Drop the SVG in with a normal image reference — Markdown or HTML, either works:

```markdown
![demo](demo.svg)
```

```html
<img src="demo.svg" alt="demo" />
```

When GitHub renders that image, the SVG **animates** — the typing and the
line-by-line output reveal play with no JavaScript and no external player. See
[How animation works on GitHub](/readmecast/cli/#github-animated-svg-embedding)
for why the SVG format is the right call here.

## Optional: theme, title, and pacing

A few flags polish the result:

```bash
readmecast README.md --theme light --title "my-cli" -o demo.svg
readmecast README.md --width 100 --speed 0.04 -o demo.svg
readmecast README.md --no-loop -o demo.svg
```

- `--theme light` switches from the default dark palette to a light one.
- `--title "my-cli"` sets the window title shown in the title bar.
- `--width` sets the terminal width in columns; `--speed` sets seconds per typed
  character.
- `--no-loop` plays the animation once instead of looping forever.

See the [CLI reference](/readmecast/cli/) for every option and its default.
