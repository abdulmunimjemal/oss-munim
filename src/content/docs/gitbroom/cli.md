---
title: CLI
description: The gitbroom command — every flag, exit codes, and copy-paste examples.
---

```bash
gitbroom [options]
```

Run with no arguments, `gitbroom` finds the stale branches in the current
repository, groups and prints them, asks you to confirm, and then deletes them.
The current branch and the default branch are never candidates — see
[How it works](/gitbroom/how-it-works/).

## Install

```bash
# one-off, no install
npx gitbroom

# or install globally
npm i -g gitbroom
# or: pnpm add -g gitbroom
```

Requires Node.js ≥ 18 and `git` on your `PATH`.

## Options

| Flag | Description |
| --- | --- |
| `--dry-run` | List what would be deleted, then exit. Never deletes. |
| `-y`, `--yes` | Delete without prompting for confirmation. |
| `--merged` | Only consider branches merged into the default branch. |
| `--gone` | Only consider branches whose upstream is gone. |
| `--main <branch>` | Override default-branch detection (e.g. `--main develop`). |
| `-h`, `--help` | Show help and exit. |
| `-v`, `--version` | Show the version and exit. |

`--merged` and `--gone` are **mutually exclusive** — passing both prints an error
and exits with code `2`.

### `--dry-run`

Prints the exact list a real run would delete, ends with
`Dry run: N branch(es) would be deleted.`, and exits `0` without touching any
branch. The recommended first run.

### `-y`, `--yes`

Skips the `[y/N]` confirmation and deletes the candidates immediately. Useful in
scripts and CI. All [safety guarantees](/gitbroom/how-it-works/#safety-guarantees)
still apply — the current and default branches are never deleted, and merged
branches still use the safe `-d`.

### `--merged` / `--gone`

Restrict candidates to a single category. `--merged` keeps only branches merged
into the default branch; `--gone` keeps only branches whose upstream is gone. The
filter is applied to the raw facts, so `--gone` still catches a branch that
happens to also be merged.

### `--main <branch>`

Override the [default-branch detection](/gitbroom/how-it-works/#finding-the-default-branch)
when your trunk isn't `main`/`master` or detection guesses wrong. The named
branch becomes both the merge target and an excluded candidate.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success — nothing to do, a dry run, or branches were deleted. |
| `2` | Not a git repository, a git command failed, or conflicting flags. |

A clean run, an empty "nothing to sweep" result, and a dry run all exit `0`. A
run where one or more `git branch` deletes fail exits `2` after reporting which
branches could not be removed.

## Examples

Preview what would be swept without changing anything:

```bash
gitbroom --dry-run
```

Sweep only branches whose remote is gone, after pruning stale remotes:

```bash
git fetch --prune
gitbroom --gone
```

Clean up merged branches non-interactively (handy in scripts):

```bash
gitbroom --merged -y
```

Work against a repo whose default branch is `develop`, previewing first:

```bash
gitbroom --main develop --dry-run
```

Check the installed version:

```bash
gitbroom --version
```
