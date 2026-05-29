---
title: CLI
description: The promptsize command — flags, exit codes, and examples.
---

```bash
promptsize [options]
```

Run with no arguments, `promptsize` auto-detects your config, checks every
budget, prints a report, and exits non-zero if any prompt is over.

## Options

| Flag | Description |
| --- | --- |
| `-c, --config <path>` | Path to the config file. Default: auto-detect. |
| `--why` | Show the per-file token breakdown under each entry. |
| `--json` | Output machine-readable JSON instead of the report. |
| `--save` | Write current sizes to `.promptsize.json` (the baseline) and exit. |
| `--silent` | Suppress output; rely on the exit code only. |
| `-h, --help` | Show help. |
| `-v, --version` | Show the version. |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | All prompts within budget. |
| `1` | One or more prompts over budget. |
| `2` | Configuration or runtime error (e.g. no config found, no files matched). |

These make `promptsize` a drop-in CI step — a non-zero exit fails the job.

## Examples

Check everything and show what's in each bucket:

```bash
promptsize --why
```

Machine-readable output for custom tooling:

```bash
promptsize --json
```

```json
{
  "ok": false,
  "entries": [
    {
      "name": "few-shot examples",
      "patterns": ["prompts/examples/*.md"],
      "encoding": "o200k_base",
      "tokens": 9200,
      "limit": 8000,
      "passed": false,
      "overBy": 1200,
      "delta": 320,
      "files": [
        { "path": "prompts/examples/a.md", "tokens": 4600 },
        { "path": "prompts/examples/b.md", "tokens": 4600 }
      ]
    }
  ]
}
```

Use a config in a non-standard location:

```bash
promptsize --config config/promptsize.json
```

Update the committed baseline after an intentional change:

```bash
promptsize --save
git add .promptsize.json
```
