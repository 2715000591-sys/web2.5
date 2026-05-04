# Colorful Toilet / web2.5 Agent Rules

This file is the first thing future Codex sessions should read. The user does not have a computer-science background, so do not make them manage routine engineering steps manually.

## Default Behavior

- Default to doing the full maintenance loop yourself: inspect, edit, test, commit, push, deploy, update the local Safari app, and verify the installed result.
- Do not only explain what should happen when the user clearly wants the project updated.
- For official website / console frontend changes, deploy to the public Cloudflare site immediately after verification and confirm the public URL works. Local preview alone does not count as done because the user checks from other devices.
- Continue until there is no reasonable next engineering step left. If blocked by account login, CAPTCHA, payment, or another action only the user can complete, record the exact blocker and the last successful verification.
- If a public Cloudflare deploy fails because the Cloudflare login/token is expired or invalid, stop immediately and ask the user to log in. Do not keep retrying, probing, or making the user wait while speculating whether deployment can work; one clear failure is enough to pause for user login.
- Keep user-facing explanations simple and concrete. Avoid developer jargon unless it is explained in plain language. For AI/API/deployment topics, first answer in plain Chinese whether it is ready, what is still missing, and what Codex will do next; do not make the user interpret API names, model parameters, command output, or engineering details.
- The user explicitly says they “only understand human language.” Do not report status with unexplained terms like stash, worktree, upstream, unstaged, untracked, commit, push, deploy, Wrangler, Worker, or D1. Translate them first, for example: “代码没有没保存的改动，也没有没上传到 GitHub 的改动” or “代码已上传，但网站还没更新到公网，因为 Cloudflare 登录失效.”
- If a change affects the extension filtering behavior, update both local extension code and Cloudflare Worker code in the same pass.
- If a change affects the stable product state, update the relevant docs before finishing.
- For the existing reply-moderation AI, the user prefers a stronger “AI as teacher” posture. Do not avoid bounded extra AI checks merely to save tokens; it is acceptable to send high-risk or database-caught candidates for sampled AI review so the database learns better. Still keep normal replies out of AI, keep batching/cooldowns, and do not introduce a new paid provider or broad full-page AI calling without explaining the cost/risk.
- The user now explicitly says the AI participation is still too low if they personally have to train the database by repeated manual hides. In the early learning phase, bias toward more AI teacher review for high-risk, ambiguous, image/avatar-supported, database-caught, or repeated-pattern candidates so AI judgments create labels and memory. Do not make manual user feedback the primary training path.
- If the user says the AI “is not working / did not move / is not doing work,” do not only edit prompts, examples, or this assistant’s wording. Inspect and change the product’s actual AI routing path: extension candidate selection, queue timing, cached decisions, Worker memory/database short-circuits, provider-call budget, and whether AI judgments are written to labels/memory.
- When the user sends a screenshot of missed spam, do not assume they want the exact text hard-coded into the extension. Treat the screenshot first as evidence for improving the AI/database teaching method: explain the likely signals, ask or discuss before changing code when the intent is ambiguous, and prefer better AI evidence, prompts, routing, image/avatar understanding, and database learning over one-off literal phrase patches. If older notes conflict with this, this rule wins.
- The user explicitly clarified on 2026-05-03: anything they send about missed spam is meant to optimize AI configuration, AI evidence routing, and the AI-teacher-to-database learning loop. Do not locally hand-write new filtering phrases just because a screenshot contains them. Local/Worker reusable rules should come from AI teacher judgments, stored labels/memory, multi-sample evidence, or an explicit developer confirmation step; when a local rule is still needed for product speed, document the AI/database evidence or the explicit confirmation behind it.
- The user clarified on 2026-05-04 that product copy must preserve data truth: do not label old local/manual records as "just marked" or imply the user clicked something unless a fresh `manual_hide` event exists. In user-facing copy, treat AI and database learning as one backend; prefer unified wording such as "后台已判断 / 后台自动下沉 / 后台学习库" over making the user distinguish "AI backend" from "database backend." Old manual teaching/history hits should also be presented as "后台学习库下沉" rather than "手动记录下沉": before AI existed, the user was teaching the database, so those records are part of backend learning.

## Data Safety

- Treat the Cloudflare D1 database as important production data.
- Before schema changes, data cleanup, migrations, or risky writes, create a D1 backup first.
- Never delete production/user history unless the user explicitly asks for that exact cleanup and the target rows are verified.
- Developer/account-global data and per-user data must stay layered:
  - Global/shared rules and samples may be used by every account.
  - Each user's personal hidden count, restored count, preferences, and history must remain account-specific.
  - Do not make every new account inherit the developer's personal hidden-count total.
- A `manual_hide` / `冲走` event can contribute garbage candidates. A `manual_allow` / `恢复` event only means "do not treat this as garbage / do not promote this rule"; do not use it as a broad reverse-training sample.
- A single user repeating the same manual hide must not automatically become a public/global rule. Automatic public promotion needs multiple contributors or explicit developer confirmation.

## Filtering Rules

- The current X / Safari filtering experience is a stable asset. Do not casually rewrite thresholds, UI flow, or the main hide/restore behavior.
- The target reply-moderation route is simple and should be treated as the product goal: database/memory scans first; if the database clearly knows it is bad, remove it immediately; if the database does not know, send it to AI as quickly as possible; AI hide decisions should remove the item and be written back into labels/memory/database candidates; AI allow decisions should leave the item visible. Temporary hiding before an AI result is only an exceptional safety bridge for confirmed or very high-risk content, not the default user experience, and future work should keep shrinking that bridge.
- Name-based filtering matters. Risky display names such as free-sex bait, local hookup bait, numeric-handle bait, and low-information lure names must continue to be considered.
- Screenshot-level evidence matters. If avatars or images show clear solicitation or routing text such as `全国安排` / `全国可飞`, and the configured AI provider can safely inspect images, route that image evidence to AI for high-risk candidates. If the provider cannot inspect images, say so plainly and propose the smallest safe way to add image/OCR evidence before changing paid providers or broadening API usage.
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
- New sessions should use handoff docs as a map: read current anchors and durable rules first, and search old dated logs only when diagnosing a specific version or regression. Do not spend time line-by-line analyzing historical release notes unless the user asks.
- When the user repeats a working preference or a durable project rule, promote it into this file or `docs/next-thread-handoff.md` instead of relying on chat memory.
- When a deployment, local Safari app build, database migration, or stable behavior changes, update the handoff and the relevant stable-state doc in the same change.
- Prefer dated version anchors, exact paths, and verification commands over vague reminders.
- If the handoff grows too long, compress old release logs or move them into a history/archive document, and keep the direct new-thread prompt aligned with the latest current version.

## High-Risk Actions

Pause and explain the risk before doing any of these:

- Deleting or overwriting Cloudflare D1 data
- Changing authentication or account identity logic
- Rotating secrets or changing `.dev.vars`
- Introducing paid AI/API usage
- Replacing the stable filter strategy with a new architecture
