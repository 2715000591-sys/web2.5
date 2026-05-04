# 给监督员的第二轮瘦身报告

日期：2026-05-04

## 结论

这轮处理的是监督员提出的第二层问题：旧文档口径、未接上的全局账号屏蔽名单、确认无调用的小残留函数，以及防止这些问题回来的体检规则。

本轮没有改数据库结构、没有删表、没有迁移、没有清理历史数据、没有重算统计、没有写审核学习库，也没有改 `cloudflare/schema.sql`。说明要精确：`npm run doctor:full` 里的登录 / 路线探针可能产生验证码或会话类记录，所以不能说“绝对没有任何数据库写入”。

## 按监督员问题逐条说明

1. 开发者调试验证码：未修改。老板明确说这一项先不用动。后续如果要关闭，必须先确认正式邮件验证码已经能稳定发送，否则可能造成老板无法登录。
2. 全局屏蔽账号：已修。后台 `/api/state` 下发的 `globalReplyBlockedHandles` 现在会被本地详情页扫描直接使用；用户手动恢复 / 放行仍然优先，不会被全局名单覆盖。
3. 旧冷却表：未删线上表。文档已说明当前运行读写 `ai_provider_cooldowns`，旧 `reply_ai_provider_cooldowns` 属于结构残留；未来若要清理，必须先备份 D1 并确认表内数据。
4. 扩展权限：未改。当前项目还没到正式面向普通用户发布权限收窄阶段，贸然缩权限可能影响 X 页面、官网、后台和图片证据链路。
5. 旧文档口径：已修。`docs/web-console-plan.md` 不再写“还需要部署到公共托管平台”，`site/stable-state.html` 不再显示 `2026-04-23 归档`。
6. 小死代码：已删。移除已确认没有调用的 `isTransparentColor`、`sameStringArray`、`shouldConsiderReplyAiModeration`、`buildAiPostUrl`、`renderSourceDetail`、`cloneReplyAiDecision`、`collectKeyCandidates`。
7. 大规则链：未一刀砍。当前 `rules.js`、`content.js`、`cloudflare/src/index.js` 仍有大量活规则，它们保护现有屏蔽效果。后续应逐步标记和迁移，不能为了瘦身直接删除。
8. 本地备份 / 历史数据：未删除。`backend/data/`、`backups/`、`.wrangler/`、下载包等仍按保护规则保留；它们不污染 GitHub，但不能顺手清空。

## 版本变化

- `BUILD_ID=2026-05-04-1742`
- 扩展版本：`0.1.77`
- App / Extension 版本：`1.0.77 (78)`
- Worker Version ID：`1ba9b2db-60bc-482d-b549-c760b6b0e40f`

## 新增体检保护

`npm run doctor` 现在会额外检查：

- 本地全局屏蔽账号名单没有重新写死为“不生效”。
- 这轮确认无调用的小残留函数没有回到主线。
- 旧网页控制台“还没部署”口径不会重新出现。
- 稳定状态页不会退回 `2026-04-23 归档`。

这只是防回潮检查，不等于完整行为测试。后续最好补一个小行为测试：全局账号会隐藏、手动放行会优先、普通账号不受影响。

## 已完成验证

- 本机 Safari App 已替换为 `BUILD_ID=2026-05-04-1742`。
- `codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app` 通过。
- `npm run safari:verify-live` 通过，真实 X 页面已加载 `2026-05-04-1742`。
- `npm run cloud:check` 通过。
- Cloudflare 已发布，最新线上版本 `1ba9b2db-60bc-482d-b549-c760b6b0e40f` 为 100% 流量。
- `npm run doctor:full` 最终结果：39 项通过，0 项提醒，0 项失败。

## 数据库安全声明

本轮没有改变线上 D1 的业务数据：没有改结构、删表、迁移、清理历史、重算统计或写审核学习库。任何未来涉及旧冷却表、统计总数、历史明细、AI 学习库、用户偏好、账号绑定的清理，都必须先备份 D1，再说明影响，并得到明确确认。
