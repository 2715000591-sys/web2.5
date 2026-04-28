# Colorful Toilet / web2.5 Agent Rules

This file is the first thing future Codex sessions should read. The user does not have a computer-science background, so do not make them manage routine engineering steps manually.

## Default Behavior

- Default to doing the full maintenance loop yourself: inspect, edit, test, commit, push, deploy, update the local Safari app, and verify the installed result.
- Do not only explain what should happen when the user clearly wants the project updated.
- Keep user-facing explanations simple and concrete. Avoid developer jargon unless it is explained in plain language.
- If a change affects the extension filtering behavior, update both local extension code and Cloudflare Worker code in the same pass.
- If a change affects the stable product state, update the relevant docs before finishing.

## Data Safety

- Treat the Cloudflare D1 database as important production data.
- Before schema changes, data cleanup, migrations, or risky writes, create a D1 backup first.
- Never delete production/user history unless the user explicitly asks for that exact cleanup and the target rows are verified.
- Developer/account-global data and per-user data must stay layered:
  - Global/shared rules and samples may be used by every account.
  - Each user's personal hidden count, restored count, preferences, and history must remain account-specific.
  - Do not make every new account inherit the developer's personal hidden-count total.

## Filtering Rules

- The current X / Safari filtering experience is a stable asset. Do not casually rewrite thresholds, UI flow, or the main hide/restore behavior.
- Name-based filtering matters. Risky display names such as free-sex bait, local hookup bait, numeric-handle bait, and low-information lure names must continue to be considered.
- Keep these code paths aligned:
  - `extension/content/rules.js`
  - `extension/content/content.js`
  - `cloudflare/src/index.js`
  - `cloudflare/schema.sql` when database structure changes
- When adding a new reusable moderation pattern key, emit it locally and teach the Worker the same key.

## Required Verification

Before saying a change is done, run the smallest useful verification set for the touched area. For filter or deployment changes, usually verify:

- `node --check cloudflare/src/index.js`
- `node --check extension/content/rules.js`
- `node --check extension/content/content.js`
- `npm run cloud:check`
- Build/deploy when the change is intended to reach users.
- Confirm `/Applications/web2.5.app` contains the latest `BUILD_ID` after local Safari app updates.
- Confirm `codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app` passes after replacing the app.
- After replacing the Safari app, run `npm run safari:verify-live` to reload existing `x.com` / `twitter.com` Safari tabs. Already-open tabs may keep running without the content script until they are refreshed.
- Verify the real page, not just the app bundle: check `document.documentElement.dataset.web25Build`, visible `冲走` buttons on detail pages, and visible sidebar close buttons when a sidebar is present.

## Current Stable References

Read these before touching core behavior:

- `docs/next-thread-handoff.md`
- `docs/current-stable-filter-state.md`
- `docs/current-stable-ui-state.md`
- `docs/moderation-database-training-plan.md`

## Cross-Thread Handoff

- Keep `docs/next-thread-handoff.md` concise, current, and operational.
- Do not let it become a chat transcript or a pile of historical counts.
- When a deployment, local Safari app build, database migration, or stable behavior changes, update the handoff and the relevant stable-state doc in the same change.
- Prefer dated version anchors, exact paths, and verification commands over vague reminders.

## High-Risk Actions

Pause and explain the risk before doing any of these:

- Deleting or overwriting Cloudflare D1 data
- Changing authentication or account identity logic
- Rotating secrets or changing `.dev.vars`
- Introducing paid AI/API usage
- Replacing the stable filter strategy with a new architecture
