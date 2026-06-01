---
title: How it works
description: What gitbroom treats as stale, how it finds the default branch, the safe vs force delete strategy, and the confirmation prompt.
---

`gitbroom` does one thing: it computes the set of local branches that are safe to
remove, shows them to you, and — once you confirm — deletes them. This page
explains how each of those decisions is made.

## What counts as stale

A local branch is offered for deletion when it is either:

- **merged** — it is already merged into the default branch, as reported by
  `git branch --merged <default>`, or
- **gone** — its upstream tracking branch was deleted on the remote, which git
  records as the `[origin/x: gone]` marker in `git branch -vv`.

Everything `gitbroom` knows comes from parsing those two git commands. It never
guesses: a branch with no upstream and no merge into the default branch is left
alone.

### When a branch is both merged and gone

A branch can qualify under both rules at once — it was merged *and* its remote
was pruned. In that case **merged wins**: the branch is reported as `merged` and
removed with the safe delete (see [below](#safe-delete-vs-force-delete)). This is
deliberate, so a branch that can be removed safely never gets force-deleted.

## Finding the default branch

The default branch is what "merged" is measured against, and it's one of the two
branches that is never deleted. `gitbroom` detects it best-effort, in order:

1. **`origin/HEAD`** — the remote's declared default (`refs/remotes/origin/HEAD`),
   if that symbolic ref is set. This is the most reliable signal.
2. **`main`, then `master`** — the first of these that exists locally.
3. **`main`** — a final fallback if nothing else resolves.

If detection guesses wrong — for example your repo's trunk is `develop` — pass
`--main <branch>` to override it:

```bash
gitbroom --main develop
```

## Safety guarantees

These hold on every run, with or without `-y`:

- **The current branch is never deleted.** The checked-out branch (the `*` in
  `git branch -vv`) is always excluded.
- **The default branch is never deleted.** Whether detected or set with
  `--main`, it is excluded as a candidate.
- **Detached HEAD is handled.** If you're not on a branch, `gitbroom` reports
  `detached HEAD` and still excludes the default branch.
- **`--dry-run` changes nothing.** It prints the exact list that a real run
  would act on, then exits. It's the recommended first run.

### Safe delete vs force delete

How a branch is deleted depends on why it's stale:

| Branch state | Delete command | Shown as |
| --- | --- | --- |
| Merged into the default branch | `git branch -d` (safe) | `✓ name (merged)` |
| Upstream gone, **not** merged | `git branch -D` (force) | `⚠ name (upstream gone) — force delete` |

The **safe** delete (`-d`) refuses to drop a branch that still has unmerged
commits, so merged branches can never take work down with them. A gone branch
that was never merged genuinely needs the **force** delete (`-D`) — and because
that can discard commits, `gitbroom` labels it `force delete` in the list so you
see it before you confirm.

## The confirmation prompt

After computing candidates, `gitbroom` prints a header with the default and
current branch, then groups the candidates under **Merged into default branch**
and **Upstream gone**, flagging any force deletes:

```ansi
  Default branch: main · current: feature-y

  Merged into default branch:
    ✓ feature-x (merged)

  Upstream gone:
    ⚠ old-spike (upstream gone) — force delete

  Delete 2 branch(es)? [y/N]
```

Only `y` or `yes` (case-insensitive) proceeds — anything else aborts with
`Aborted. No branches were deleted.` and nothing is touched. To skip the prompt
entirely (for scripts or CI), pass `-y` / `--yes`. To preview without ever being
asked, use `--dry-run`.

If there's nothing to sweep, you'll simply see:

```ansi
  Nothing to sweep. Your branches are tidy. ✨
```

## Why it's reliable

The part that decides *which* branches to remove is a set of pure functions
(`parseBranchVV`, `parseMerged`, `selectCandidates`) that operate on raw git
output strings and return plain data. The only code that touches `git` is a thin
wrapper over `child_process`. That separation is what the test suite exercises —
the selection logic is tested without ever shelling out to a real repository.
