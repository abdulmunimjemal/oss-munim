---
title: CLI
description: The readmecast command — every option, exit codes, stdin, and notes on embedding animated SVGs on GitHub.
---

```bash
readmecast [options] [file.md]
cat file.md | readmecast [options]
```

readmecast reads a Markdown file (or piped stdin), extracts the shell steps from
its fenced code blocks, and renders a standalone animated terminal-demo SVG.
By default the SVG is written to stdout; pass `-o` to write a file. Commands are
**never executed** — the SVG shows exactly the output documented in your Markdown.

## Input

readmecast takes its Markdown from one of two places:

```bash
readmecast README.md          # a single positional file argument
cat README.md | readmecast    # piped stdin (when no file is given)
```

Passing more than one file is an error. When no file is given and stdin is a TTY
(nothing piped), readmecast prints an error telling you to pass a file or pipe one.

## Options

| Option | Description | Default |
| --- | --- | --- |
| `-o, --out <file>` | Write the SVG to this file. Omit to write to stdout. | stdout |
| `--theme <name>` | Color theme: `dark` or `light`. | `dark` |
| `--width <cols>` | Terminal width in columns (minimum 20). | `80` |
| `--speed <secs>` | Typing speed in seconds per character. | `0.06` |
| `--title <text>` | Window title shown in the title bar. | none |
| `--no-loop` | Play the animation once instead of looping forever. | loops |
| `-h, --help` | Show help and exit. | |
| `-v, --version` | Show the version and exit. | |

Notes on the value-bearing flags:

- **`--theme`** accepts only `dark` or `light`; anything else is an error. The dark
  theme uses a soft "Catppuccin"-style palette; the light theme its companion.
- **`--width`** is clamped to a minimum of 20 columns and floored to an integer.
- **`--speed`** must be a positive number — it's the seconds spent typing each
  character, so smaller is faster. A 20-character command at the default `0.06`
  takes about 1.2 s to type.
- **`--title`** sets the centered window title; with no title, the title bar still
  shows the three traffic-light dots.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success — the SVG was rendered (to the file or stdout). |
| `2` | Error — bad input, an unreadable file, an invalid flag value, or no shell steps found in the Markdown. |

A non-zero exit makes readmecast safe to use in a script or CI step: if your README
no longer contains any castable shell block, the command fails loudly instead of
emitting an empty demo.

## Examples

Render a README to a file:

```bash
readmecast README.md -o demo.svg
```

Render to stdout and redirect (works the same as `-o`):

```bash
readmecast README.md > demo.svg
```

Pipe Markdown in on stdin — handy for casting a fragment:

```bash
cat snippet.md | readmecast -o snippet.svg
```

A light theme with a window title, wider terminal, and faster typing:

```bash
readmecast README.md \
  --theme light \
  --title "my-cli" \
  --width 100 \
  --speed 0.04 \
  -o demo.svg
```

Play once instead of looping (useful for a one-shot hero image):

```bash
readmecast README.md --no-loop -o demo.svg
```

Check the version or see all options:

```bash
readmecast --version
readmecast --help
```

## GitHub animated-SVG embedding

The whole point of readmecast's output format: **animated SVGs animate on GitHub,
even as plain images.** GitHub strips `<script>` from embedded SVGs but keeps CSS
animations, so readmecast encodes the entire demo as staggered `@keyframes` with
`animation-delay`. A single image reference plays the typing and the output reveal
with no JavaScript and no external assets:

```markdown
![demo](demo.svg)
```

```html
<img src="demo.svg" alt="terminal demo" />
```

That's why an SVG is the right format here rather than a GIF (larger and lower
quality) or an asciinema cast (needs a JS player a README can't run). The output is
one self-contained file you commit alongside your README.
