# Colorful Toilet / web2.5 Agent Rules

This file is the first thing future Codex sessions should read. The user does not have a computer-science background, so do not make them manage routine engineering steps manually.

## Default Behavior

- Default to doing the full maintenance loop yourself: inspect, edit, test, update the local Safari app when needed, deploy public Cloudflare changes when needed, and verify the installed or public result. Do not only explain what should happen when the user clearly wants the project updated.
- When the next useful step is clear, low-risk, and directly improves the user's stated goal, keep going instead of stopping to ask for permission. Ask only when the step changes product behavior, touches production data, costs money, needs account access, changes identity/auth/security, publishes publicly, uploads to GitHub, or could plausibly surprise the user.
- Do not let the system trip over itself. When a delay, repeated verification, over-strict process, stale script, stale document, needless upload, repeated login, or noisy check is created by this project rather than by a real external blocker, proactively call it out and remove or reduce it if doing so does not weaken production data safety, account security, spending control, or product quality. Low-risk efficiency fixes should be made directly; risky ones must be explained in plain Chinese first.
- For official website / console frontend changes, deploy to the public Cloudflare site immediately after verification and confirm the public URL works. Local preview alone does not count as done because the user checks from other devices.
- GitHub upload is a boss-approved archive step, not a routine step after every small change. Upload only when the user gives strong praise for a high-completion checkpoint, explicitly asks to upload to GitHub, asks for handoff/backup, or confirms after Codex recommends a stable checkpoint. The user's newest instruction wins over older broad "always push" notes.
- Keep owner-facing explanations in plain Chinese: first say whether it is usable, what is still missing, and what Codex will do next; translate technical terms such as commit, push, deploy, Worker, Wrangler, D1, schema, stash, worktree, upstream, unstaged, and untracked instead of making the user decode them. If required verification fails, or the task is blocked by account login, CAPTCHA, payment, permissions, or another action only the user can complete, stop and report the last successful verification, the exact failed step, and what the user needs to do. Do not skip verification, lower the standard, pretend the work is done, keep retrying blindly, or search for a bypass. For Cloudflare login/token/public deploy failure, one clear failure is enough to pause for user login.
- If a change affects the extension filtering behavior, update both local extension code and Cloudflare Worker code in the same pass.
- If a change affects the stable product state, update the relevant docs before finishing.
- For documentation-only process cleanup, do not rebuild the Safari app or deploy Cloudflare unless the changed file is part of the public website and the user wants that public page updated now.
- Developer debug login is a maintenance path, not an owner-facing safety boundary. Do not make Codex wait on repeated 60-second developer OTP resend limits during checks; if anti-abuse throttling is needed, keep it for ordinary/public login, not for the configured developer debug email while developer debug mode is enabled.
- For the existing reply-moderation AI, the user prefers a stronger “AI as teacher” posture. Do not avoid bounded extra AI checks merely to save tokens; it is acceptable to send high-risk or database-caught candidates for sampled AI review so the database learns better. Still keep normal replies out of AI, keep batching/cooldowns, and do not introduce a new paid provider or broad full-page AI calling without explaining the cost/risk.
- The user now explicitly says the AI participation is still too low if they personally have to train the database by repeated manual hides. In the early learning phase, bias toward more AI teacher review for high-risk, ambiguous, image/avatar-supported, database-caught, or repeated-pattern candidates so AI judgments create labels and memory. Do not make manual user feedback the primary training path.
- If the user says the AI “is not working / did not move / is not doing work,” do not only edit prompts, examples, or this assistant’s wording. Inspect and change the product’s actual AI routing path: extension candidate selection, queue timing, cached decisions, Worker memory/database short-circuits, provider-call budget, and whether AI judgments are written to labels/memory.
- When the user sends a screenshot of missed spam, do not assume they want the exact text hard-coded into the extension. Treat the screenshot first as evidence for improving the AI/database teaching method: explain the likely signals, ask or discuss before changing code when the intent is ambiguous, and prefer better AI evidence, prompts, routing, image/avatar understanding, and database learning over one-off literal phrase patches. If older notes conflict with this, this rule wins.
- The user explicitly clarified on 2026-05-03: anything they send about missed spam is meant to optimize AI configuration, AI evidence routing, and the AI-teacher-to-database learning loop. Do not locally hand-write new filtering phrases just because a screenshot contains them. Local/Worker reusable rules should come from AI teacher judgments, stored labels/memory, multi-sample evidence, or an explicit developer confirmation step; when a local rule is still needed for product speed, document the AI/database evidence or the explicit confirmation behind it.
- The user clarified on 2026-05-04 that product copy must preserve data truth: do not label old local/manual records as "just marked" or imply the user clicked something unless a fresh `manual_hide` event exists. In user-facing copy, treat AI and database learning as one backend; prefer unified wording such as "后台已判断 / 后台自动下沉 / 后台学习库" over making the user distinguish "AI backend" from "database backend." Old manual teaching/history hits should also be presented as "后台学习库下沉" rather than "手动记录下沉": before AI existed, the user was teaching the database, so those records are part of backend learning.
- The reply AI teacher prompt pack in `docs/ai-prompt-packs/sexual-leadgen-foundation/` is intentional product policy, not loose notes. It protects normal adult speech and hides adult lead-generation/spam. If the pack changes, sync it into `cloudflare/src/reply-ai-prompt-pack.generated.js` with `npm run prompt-pack:sync` before verification or deployment.

## Data Safety

- Treat the Cloudflare D1 database as important production data.
- The user's moderation statistics are protected product memory: 累计屏蔽总数, ad/spam/lead-generation counts, manual hide/restore history, AI/database labels, reply AI items/results, AI memory, rule candidates, account/device bindings, and per-user preferences must not be deleted, reset, recomputed, downsampled, or "cleaned up" during code or documentation cleanup.
- Before schema changes, data cleanup, migrations, or risky writes, create a D1 备份 first.
- Never delete production/user history unless the user explicitly asks for that exact cleanup, the target tables/rows are verified, the impact on visible totals is explained in plain Chinese, and a D1 backup has already been created.
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
- Original poster self-replies are strong context evidence. Do not hide the original author's own low-risk follow-up comments merely because they are short, emoji-only, match old backend/database learning, or appear on an account blocklist; only act when there is explicit redirect/contact/scam evidence, a strongly high-risk identity signal, or a user/manual hide.
- Screenshot-level evidence matters. If avatars or images show clear solicitation or routing text such as `全国安排` / `全国可飞`, and the configured AI provider can safely inspect images, route that image evidence to AI for high-risk candidates. If the provider cannot inspect images, say so plainly and propose the smallest safe way to add image/OCR evidence before changing paid providers or broadening API usage.
- Keep these code paths aligned:
  - `extension/content/rules.js`
  - `extension/content/content.js`
  - `cloudflare/src/index.js`
  - `cloudflare/schema.sql` when database structure changes
- When adding a new reusable moderation pattern key, emit it locally and teach the Worker the same key.

## Required Verification

Before saying a change is done, run the smallest useful verification set for the touched area. For filter or deployment changes, usually verify:

If a required verification step fails and cannot be fixed by Codex inside the current task, stop and tell the user in plain Chinese. Do not skip that check, weaken the acceptance standard, or mark the task complete.

- `node --check cloudflare/src/index.js`
- `node --check extension/content/rules.js`
- `node --check extension/content/content.js`
- `npm run doctor`
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
- Write handoff and rule documents like a human handoff, not a machine dump: start with the current conclusion, explain why it matters in plain Chinese, keep old history searchable but out of the main path, and translate technical words instead of making the user or next assistant decode them.
- Merge similar instructions instead of repeating them across many places. When old notes conflict with newer user preferences, keep the newest user instruction as the source of truth and move old wording to history only if it is still useful for search.
- When a conversation gets long, has already been compacted, includes many large file reads or long command outputs, finishes a major work segment, or is about to start another large segment, update the handoff first and warn the user that the context may be getting fragile. Treat this as an early warning system, not an exact percentage meter.

## High-Risk Actions

Pause and explain the risk before doing any of these:

- Deleting or overwriting Cloudflare D1 data
- Changing authentication or account identity logic
- Rotating secrets or changing `.dev.vars`
- Introducing paid AI/API usage
- Replacing the stable filter strategy with a new architecture
