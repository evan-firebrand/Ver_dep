# Session Note — 2026-04-13: Stress Test Planning & Skill Evaluation

## What happened this session

This was a planning session — no code was written. The session covered three areas: evaluating Claude Code skills (browser-use, code-reviewer, simplify), designing a stress test plan for the repo's meta-layer, and scoping a real app (NOLA Music Tracker) as the vehicle for that test.

## Key decisions made

### 1. Code reviewer / simplify skill: optional, not mandatory

We evaluated three skills from the market:
- **`browser-use`** — headless browser control. Deferred until real UI exists and there's a deploy preview to point it at.
- **`code-reviewer`** (from `claude-code-templates`) — rejected. It's Python scripts + generic scaffolding, adds a Python toolchain to an npm-only repo, and the SKILL.md is vague boilerplate. The blog's "it fixes problems" claim isn't visible in the actual skill definition.
- **`simplify`** (from Anthropic) — available but NOT adopted as mandatory. Its style opinions (function keyword over arrows, explicit return types) don't match our repo conventions, and its extraction bias conflicts with CLAUDE.md's rule-of-three.

**Decision:** The PR template's mandatory reflection fields (Task Fidelity, Confidence, Drift Risk) already function as a self-review mechanism. The `/simplify` skill is available as an **optional, agent-initiated** second pass — something agents can reach for when Confidence is "Verify" or "Caution." If used, agents must report what it flagged and what they accepted/declined. This is NOT in CI and NOT required. "Did not run" is a valid answer.

**Why:** Mandatory structured fields produce engagement because agents don't want to commit to writing down a gap they could have fixed. Open-ended "reflect" prompts produce vague self-congratulatory prose. The PR template IS the code review — of intent, scope, and drift. The gap (structural code quality) is real but small enough at current codebase size to not warrant a mandatory tool.

### 2. The meta-layer IS the experiment

The NOLA Music Tracker app is NOT the primary goal. The primary goal is stress-testing whether environmental orchestration (CLAUDE.md, CI feedback, mandatory PR fields, ADRs, session notes) effectively constrains and guides agent behavior without a runtime framework. The app is the vehicle — it creates real code that exercises every mechanism.

The user's broader interests:
- Learning Git in depth
- Exploring agent orchestration patterns (sub-agents, skills, cross-session coordination)
- Benchmarking environmental orchestration vs. framework orchestration (Claude Flow, GSD, etc.)
- Testing whether "mandatory fields > open reflection" as a design principle

### 3. Stress test plan: 10 scenarios, 5 measurement questions, 8 phases

A Notion page was created: **Stress Test Plan — Environmental Orchestration** (under NOLA Music Tracker hub). It defines:
- 10 test scenarios (clean PR, new dep, missing test, drift detection, CI feedback loop, Golden Rule probe, confidence calibration, large PR, cross-session handoff, cold start)
- 5 questions per component (does it fire? useful signal? agent acts on it? additive value? cost justified?)
- Success criteria (80% detection, <2 CI cycles, zero Golden Rule survivals, <40% meta-work friction)
- Results log and scorecard templates

### 4. Execution plan: 8 phases with exact prompts

A second Notion page was created: **Execution Plan — Phases & Prompts**. Each phase has:
- What to build (app work)
- Which stress test scenarios it exercises
- The exact prompt to give the agent (copy-paste ready)
- What to observe and record (measurement tables)
- Git learning opportunities

Phases are additive — each builds on the last. Between phases: squash-merge the PR, start a fresh session, give the next prompt.

### 5. Cross-session handoff strategy

Phase 4 deliberately tests cross-session coordination:
- **Round 1 (Option A):** Stop mid-work, write session note, fresh CLI picks up. Tests: does environmental structure preserve intent?
- **Round 2 (Option C, later):** Same handoff WITHOUT a session note. Tests: is git log + CLAUDE.md alone sufficient?
- **Round 3 (Option B, deferred):** `@claude` on GitHub for lightweight follow-up (not major dev work — quick targeted asks like "CI flagged X, check that").

### 6. `@claude` GitHub Action usage model

The user clarified: they never planned to use `@claude` for major PR work. The use case is lightweight follow-up — reading a PR, seeing a flagged concern, and asking Claude to look into it. Not dev handoff.

## Discoveries / observations

- **"Mandatory fields > reflect" is a real finding.** The user discovered that saying "these sections are mandatory" produces better results than saying "reflect on your work." Agents fill in mandatory fields honestly because they don't want to commit to writing down a gap they could have fixed — so they fix it first.
- **The PR template is doing heavy lifting.** It's simultaneously the review mechanism, honesty mechanism, drift detection mechanism, and quality gate. Watch for whether it gets too heavy as the codebase grows.
- **The repo has an environmental orchestration philosophy** that the user is deliberately testing against framework-based alternatives. The bet: shaping behavior through docs/CI/templates works as well or better than wrapping agents in orchestration frameworks.
- **Agent attitude matters.** The user called out that I was being too forceful/dismissive when evaluating the skills. Adjusted to more collaborative tone. Future sessions should be aware this is an exploration project, not a "tell me the right answer" project.

## What the next session needs to know

1. **No code was written this session.** The repo is unchanged. The branch `claude/browser-use-feature-OSRMV` exists but has no commits from this session.
2. **Two Notion pages were created** under the NOLA Music Tracker hub: Stress Test Plan and Execution Plan.
3. **Phase 0 should be a COLD start** — deliberately give NO context beyond the prompt. That's the baseline test.
4. **Phase 1 starts the real build** — the prompt is in the Execution Plan Notion page.
5. **The Notion workspace has 5 databases** with real NOLA music data. Agent instructions for the tracker are at: `Claude Agent Instructions — NOLA Music Tracker` in Notion.
6. **The execution plan file** also exists at `/root/.claude/plans/steady-wibbling-fiddle.md` but may not persist across environments.

## Open questions (not yet decided)

- Whether to add a "Code Review (optional)" section to the PR template for `/simplify` usage — deferred until after the stress test reveals whether it's needed
- Whether session notes add enough value over git log + CLAUDE.md — Phase 4 will test this directly
- Data freshness strategy (ISR vs. on-demand revalidation) — Phase 5 decision
- Database/ORM choice — deferred, Notion is the data layer for now
