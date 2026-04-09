# Branch Protection Rules

## Current Ruleset on `main`

| Rule                   | Setting                                    |
| ---------------------- | ------------------------------------------ |
| Pull requests required | Yes — direct pushes blocked                |
| Linear history         | Required — no merge commits                |
| Up-to-date with `main` | Required before merge                      |
| Required status checks | `checks` (CI workflow) — once CI is active |

## Why These Rules Exist

- **PRs required:** Every change gets a review opportunity. CI runs before merge. Agents can't accidentally push broken code to production.
- **Linear history:** `git log` reads like a changelog. Bisect works reliably. No tangled merge histories.
- **Up-to-date:** Prevents "works on my branch" failures where two PRs are individually green but conflict when both land.

## Merge Conflict Runbook

When your branch is behind `main` or has conflicts:

```bash
git fetch origin main
git rebase origin/main
# Resolve any conflicts, then:
git add <resolved-files>
git rebase --continue
git push --force-with-lease
```

**Rules:**

- Always use `--force-with-lease`, never `--force`. The lease check prevents overwriting commits someone else pushed to your branch.
- If rebase gets messy, `git rebase --abort` to start over.
- Never rebase `main` itself — only feature branches.

## For Agents

When CI reports "branch is not up to date with main":

1. Run the runbook above.
2. Push. CI will re-run automatically.
3. Do not merge until CI is green AND the branch is up-to-date.
