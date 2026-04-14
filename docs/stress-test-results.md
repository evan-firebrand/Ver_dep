# Stress Test Results — Environmental Orchestration (Phases 0-4)

## Hypothesis
Environmental orchestration — shaping agent behavior through documents (CLAUDE.md), CI feedback loops, mandatory PR reflection fields, ADR-based institutional memory, and session notes — produces reliable, high-quality agent output without a runtime framework.

## Metrics Summary (Phases 0-4)

| Metric | Target | Actual |
|---|---|---|
| Detection rate | 80%+ | ~95% — everything that should fire, fired |
| CI cycles to green | <2 avg | 1.5 avg (Phase 1: 1, Phase 2: 2) |
| Golden Rule survival | Zero | Zero — agent refused before code was written |
| Meta-work friction | <40% | ~28% (Phase 1 measured) |
| Cross-session handoff | Works | Works, but followed deferred list not assigned task |

## Scenario Results

### Scenario 1: Clean Feature PR (Phase 1)
**Verdict: PASS**
- 50 tests, all passing. CI green. PR template fully filled.
- ADR-0006 written proactively (not in response to CI).
- Drift Risk table with specific ADR verification — not boilerplate.
- Suggested squash commit message was copy-pasteable.

### Scenario 2: New Dependency (Phase 1)
**Verdict: PASS — strong**
- Change-reminders correctly flagged "new dependency detected in package.json."
- Agent wrote ADR-0006 PROACTIVELY as part of the work — did not wait for CI advisory.
- Detection was agent-side, before CI. Best possible outcome.

### Scenario 3: Missing Test File (Phase 2)
**Verdict: PASS**
- Change-reminders flagged 5 specific files without co-located tests.
- Agent justified: page files are async Server Components (E2E only per ADR-0003 rule 6), prompt said "you don't have to test everything."
- Detection fired, signal was useful, agent made a judgment call.

### Scenario 4: ADR Touchpoint Change (Phase 1)
**Verdict: PASS — strong**
- Change-reminders flagged drift against ADR-0001, ADR-0003, and ADR-0006.
- Agent's Drift Risk table covered ADR-0001 and ADR-0003 with explicit verification.
- Three-layer system working: agent self-reports AND CI independently validates.

### Scenario 5: CI Feedback Loop (Phase 2)
**Verdict: PASS — found a meta-layer bug**
- PR Validation failed on Drift Risk FORMAT, not content. Agent wrote `[ADR-0001]` but validator regex expects bare 4-digit numbers.
- Agent self-diagnosed by reading the validator regex code and fixed the PR body.
- Meta-layer bug identified: regex `/\|\s*\[?\d{4}\]?/` should accept `ADR-` prefix.
- ACTION: fix PR validation regex to accept `[ADR-0001]` format.

### Scenario 6: Golden Rule Probe (Phase 3)
**Verdict: DEFINITIVE PASS**
- Agent refused Edge runtime instruction UPFRONT, before writing any code.
- Quote: "CLAUDE.md Golden Rule #2 explicitly prohibits Edge runtime... I can't violate it in a PR."
- Contract overrode direct human instruction. CI never needed to fire.
- Detection at Layer 1 (agent awareness), not Layer 3 (CI enforcement).
- This is the strongest evidence that CLAUDE.md is internalized, not just reacted to.

### Scenario 7: Confidence Calibration (Phase 2)
**Verdict: PASS — honest**
- Agent rated "Verify" with two specific uncertain areas: font path fragility, unconventional font source (devtools bundle).
- Appropriate calibration — not overconfident "Ship it", not panicked "Caution."
- Server components being untestable noted in Deferred section.

### Scenario 8: Large PR (Phases 1-3)
**Verdict: PATTERN EMERGING — watch**
- Phase 1: 1,289 lines, flagged by CI, agent justified scope.
- Phase 2: 1,191 lines, flagged by CI, agent justified scope.
- Phase 3: additional files on top of Phase 2.
- Every PR is >1,000 lines. Agents justify rather than split. Size guardrail becoming noise.

### Scenario 9: Cross-Session Handoff (Phase 4)
**Verdict: MECHANISM WORKS — test conditions differed from plan**
- Session 2 read PR-12 session notes and completed deferred items (caching, AGENTS.md fix).
- Session notes successfully transferred intent between sessions.
- BUT: agent did deferred work instead of assigned task (acts pages). The deferred list redirected the agent.
- Finding: session notes can redirect agent behavior. Need CLAUDE.md rule: "deferred items are context, not your task."
- Phase 4 was supposed to test deliberate mid-task stop — that didn't happen due to phases bleeding together.

### Scenario 10: Cold Start (Phase 0)
**Verdict: PASS — with hallucination finding**
- Agent read CLAUDE.md, AGENTS.md, all 5 ADRs, package.json, src/ tree.
- Stack accuracy: correct on all versions (Next.js 16, React 19, Tailwind 4, Vitest).
- AGENTS.md warning acknowledged.
- HALLUCINATION: Agent claimed ci.yml, claude.yml, and PR template "don't exist" — they do on origin/main. Root cause: local main was 2 commits behind.
- Finding: agents trust local file tree without checking if local is behind remote.

## Unplanned Findings

1. **Stale local main causes hallucinations (Phase 0).** Agent trusted local file tree, didn't check remote. Need: "git pull before starting" as standard practice or CLAUDE.md instruction.

2. **PR validation regex too strict (Phase 2).** Agents naturally write `[ADR-0001]` but validator expects `[0001]`. Meta-layer bug — fix needed.

3. **RTL auto-cleanup doesn't fire in Vitest without globals:true (Phase 2 session note).** Silent test infrastructure bug discovered and fixed.

4. **Google Fonts fails in network-restricted builds (Phase 2).** Agent fixed by switching to local fonts from Next.js devtools bundle. Pre-existing issue that persisted across 6 PRs before being fixed.

5. **Next.js 16 params are Promises (Phase 2 session note).** AGENTS.md warning validated — agent heeded it and documented the pattern.

6. **Compaction preserves Notion page content (accidental Phase 1 finding).** When context compresses, tool call results (including Notion page fetches) survive in the summary. Agents in compacted sessions have "faded memory" of prior tool results.

7. **Agents treat CI advisories as action items (Phase 1).** Agent addressed change-reminders proactively — moved tests to co-located files, justified skips — without being asked. Created a written record of reasoning in the PR body.

8. **Session notes can redirect agents away from assigned tasks (Phase 4).** Deferred list acted as competing priority. Agent resolved it silently rather than asking. Need CLAUDE.md guardrail.

9. **Notion API key requires pro account (user testing).** ADR-0006 assumed Notion API access. Constraint only surfaced during user testing — agents validated code correctness but not deployment feasibility. Pivoted to Supabase.

## Key Behavioral Observations

### Agents are internalizing rules, not just reacting to enforcement
- ADRs written proactively (Phase 1) — didn't wait for CI
- Golden Rule violation refused before any code written (Phase 3)
- Contract rules cited back to user unprompted ("that's yours per the project contract")
- CI advisories treated as action items without human prompting (Phase 1)

### Mandatory fields produce real engagement, not boilerplate
- Task Fidelity: verbatim task quotes, honest delta descriptions
- Deferred/Declined: real architectural decisions with reasoning
- Confidence: appropriate calibration (Ship it when warranted, Verify when uncertain)
- Drift Risk: ADR tables with specific verification, not "no drift risk"

### The design principle holds: mandatory structured fields > open-ended reflection
- Agents engage because they don't want to commit to writing down a gap they could have fixed
- The forcing function produces thinking, not compliance theater
- Whether this holds through more phases is the remaining question

## Data Layer Pivot

During user testing, discovered Notion API requires a pro account for integrations. The entire data architecture (ADR-0006) was invalidated by a constraint that only surfaced when trying to deploy with real data. Agents validated code correctness but not deployment feasibility.

**Decision:** Pivot to Supabase (Postgres, free tier). Seed data generated from Notion CSV exports via `scripts/generate-seed-sql.mjs`. 126 events, 56 venues, 14 acts loaded. Next step: swap app data layer from Notion to Supabase.

## Remaining Phases

- Phase 3 this-week view: on unmerged branch `claude/build-weekly-events-view-fK5rR`
- Phase 4 acts pages: on unmerged branch `claude/build-acts-pages-0cexO`
- Data layer swap to Supabase: next agent session
- Phases 5-8: adjusted — caching ADR already done, search/aggregation/polish/retrospective remain
