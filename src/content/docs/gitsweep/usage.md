---
title: Usage
description: Install gitsweep, then run it — flags, what it detects, the confirmation prompt, safety guarantees, exit codes, and examples.
---

## Install

```bash
# one-off, no install
npx gitsweep

# or install globally
npm i -g gitsweep
# or: pnpm add -g gitsweep
```

Requires Node.js ≥ 18 and `git` on your `PATH`.

## Usage

```bash
gitsweep [options]
```

Run with no arguments, `gitsweep` finds the stale branches in the current
repository, groups and prints them, asks you to confirm, and then deletes them.

```bash
gitsweep                 # find candidates, show them, confirm, delete
gitsweep --dry-run       # show what would be deleted, change nothing
gitsweep -y              # delete without the confirmation prompt
gitsweep --merged        # only branches merged into the default branch
gitsweep --gone          # only branches whose upstream is gone
gitsweep --main develop  # override default-branch detection
```

## Flags

| Flag | Description |
| --- | --- |
| `--dry-run` | List what would be deleted, then exit. Never deletes. |
| `-y`, `--yes` | Delete without prompting for confirmation. |
| `--merged` | Only consider branches merged into the default branch. |
| `--gone` | Only consider branches whose upstream is gone. |
| `--main <branch>` | Override default-branch detection (e.g. `--main develop`). |
| `-h`, `--help` | Show help and exit. |
| `-v`, `--version` | Show the version and exit. |

`--merged` and `--gone` are mutually exclusive — passing both is an error.

## What it detects

A local branch is offered for deletion when it is either:

- **merged** into the default branch (`main` / `master`), or
- **gone** — its upstream tracking branch was deleted on the remote (the
  `[origin/x: gone]` marker in `git branch -vv`).

When a branch is both merged *and* gone, **merged wins** so it can be removed
with the safe delete.

> **Tip:** gone-branch detection reflects what your local repo knows. Run
> `git fetch --prune` first so deleted remote branches are actually marked gone.

## The confirmation prompt

`gitsweep` groups the candidates under **Merged into default branch** and
**Upstream gone**, flags any force deletes, and asks before removing anything:

```ansi
  Default branch: main · current: feature-y

  Merged into default branch:
    ✓ feature-x (merged)

  Upstream gone:
    ⚠ old-spike (upstream gone) — force delete

  Delete 2 branch(es)? [y/N]
```

Only `y` / `yes` (case-insensitive) proceeds. Anything else aborts without
deleting. Pass `-y` / `--yes` to skip the prompt entirely, or `--dry-run` to
preview the list and exit.

## Safety guarantees

- **The current branch is never deleted.**
- **The default branch is never deleted.**
- Merged branches are removed with `git branch -d` (the *safe* delete that
  refuses to drop unmerged work).
- A branch whose upstream is gone but which is **not** merged needs the force
  delete `git branch -D`. `gitsweep` flags these clearly (`force delete`) so you
  know what you're agreeing to before confirming.
- `--dry-run` changes nothing and is the recommended first run.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success — nothing to do, a dry run, or branches were deleted. |
| `2` | Not a git repository, a git command failed, or conflicting flags. |

## Examples

Preview what would be swept without changing anything:

```bash
gitsweep --dry-run
```

Sweep only branches whose remote is gone, after pruning stale remotes:

```bash
git fetch --prune
gitsweep --gone
```

Clean up merged branches non-interactively (handy in scripts):

```bash
gitsweep --merged -y
```

Work against a repo whose default branch is `develop`:

```bash
gitsweep --main develop --dry-run
```
