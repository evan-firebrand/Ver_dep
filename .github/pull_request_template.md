## Summary

<!-- What changed, and why? Link the issue or triggering context. -->

## Changes

<!-- Bulleted list of specific changes. One bullet per logical change. -->

-

## Test Plan

<!-- How should a reviewer verify this works? -->

- [ ]

## ADR Impact

<!-- Did this PR trigger an ADR? If yes, link it. If unsure, check CLAUDE.md → "ADR Triggers". -->

None / [ADR-NNNN](docs/adr/NNNN-title.md)

---

## Agent Instructions

<!--
  This section is for HUMANS to give directives to agents who may take over this PR.
  Leave it empty if no special constraints apply. Agents: read this FIRST.
-->

**Constraints:** None

**Off-limits paths:**

<!-- e.g., Do not touch src/lib/auth/** -->

**Goal if assigned:** Continue as described in Summary above.

---

<!-- AGENT REFLECTION — Fill this section if you are a Claude Code agent. -->
<!-- If you are a human author, delete everything below this line.       -->

<!--
## Task Fidelity

### Task as Given
> Paste or summarize the original instruction you received (from issue, comment,
> CLAUDE.md directive, or human message). Quote it — do not paraphrase.

### Task as Delivered
> Describe what you actually built. Be specific about functionality, not files.

### Delta
> Compare the two sections above. Call out:
> - Anything you were asked to do that you did NOT do (and why)
> - Anything you did that you were NOT asked to do (and why)
> - If the two match exactly, write "Exact match" and move on

## Deferred / Declined

> List anything you considered doing but intentionally chose not to. For each item:
> - What it was
> - Why you deferred it (out of scope, risky, insufficient context, time)
> - What a future agent or human would need to pick it up
>
> If nothing was deferred, write "Nothing deferred."

## Confidence & Review Guidance

> Rate your confidence in this PR. Pick ONE:
>
> 🟢 **Ship it** — I am confident this is correct, complete, and safe. Skim review is fine.
> 🟡 **Verify** — I believe this is correct but there are areas I want a human to double-check. See "Uncertain areas" below.
> 🔴 **Caution** — I am unsure about significant aspects of this PR. Careful review required.
>
> **Rating:**
>
> **Uncertain areas (if 🟡 or 🔴):**
> - Describe the specific area and what you're unsure about
> - Point to the exact file and line range if possible

## Open Questions

> Anything you want to flag for the reviewer that doesn't fit above.
> Genuine unknowns, trade-offs you chose one side of, or things you'd do
> differently with more context.
>
> If none, write "No open questions."

## Drift Risk

> Files you changed may be listed as touchpoints in existing ADRs (`docs/adr/`).
> For each affected ADR, confirm its invariants still hold or update them.
> CI will flag file-level overlaps, but only you can detect _semantic_ drift
> (e.g., you changed how tests work but an ADR still describes the old behavior).
>
> | ADR | Touchpoint Changed | Status |
> |-----|--------------------|--------|
> | [0001](docs/adr/0001-initial-stack-and-agentic-workflow.md) | `example.ts` | ✅ Verified — invariants still hold |
>
> If no ADRs have touchpoints matching your changed files, write
> "No drift risk — no ADR touchpoints affected."

## Session Hygiene

> - [ ] I ran `npm run lint` and it passed
> - [ ] I ran `npm run typecheck` and it passed
> - [ ] I ran `npm run format:check` and it passed
> - [ ] I ran `npm run test` and it passed
> - [ ] I ran `npm run build` and it passed
> - [ ] I subscribed to PR activity after creating this PR
> - [ ] I checked CLAUDE.md → "ADR Triggers" and either wrote an ADR or confirmed none is needed

## Suggested Squash Commit Message

> Write a commit message the repo owner can copy-paste when squash-merging.
> Format: title line (under 72 chars) with PR number, blank line, bulleted body.
>
> ```
> Short title here (#NN)
>
> - First change
> - Second change
> ```
-->
