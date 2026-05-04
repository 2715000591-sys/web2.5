# Colorful Toilet 下一轮接力说明

最后整理日期：2026-05-04

这份文件是给下一位 Codex / 开发助手看的。目标很简单：打开新对话后，先看当前事实和下一步，不要被旧流水账拖慢，不要让用户解释工程细节。

## 0. 先读这个

新对话开场顺序：

1. 进入仓库：`/Users/boriszhang/Documents/Codex/project 1`
2. 运行：`npm run doctor`
3. 读 `AGENTS.md`
4. 读本文档第 1 到 9 节
5. 只在改 AI 设置、接口、模型或 Key 时读 `docs/ai-api-provider-handoff.md`
6. 只在改筛选体验时读 `docs/current-stable-filter-state.md`
7. 只在改界面体验时读 `docs/current-stable-ui-state.md`
8. 只在改数据库学习闭环时读 `docs/moderation-database-training-plan.md`

不要逐条研究旧发布记录。旧历史只在排查某个版本、某个漏网样本、某次回归时用关键词搜索；摘要在 `docs/history/release-summary-2026-05-02-to-2026-05-04.md`，完整旧流水在 Git 历史里。

当前活跃分支：`codex/cloudflare-public-foundation`。不要让用户手动切分支、合分支或清理旧分支。

## 1. 当前真实状态

当前本机和公网最新锚点：

- `BUILD_ID=2026-05-04-1742`
- 扩展版本：`0.1.77`
- App / Extension 版本：`1.0.77 (78)`
- Cloudflare Worker Version ID：`1ba9b2db-60bc-482d-b549-c760b6b0e40f`
- 公网首页：`https://colorful-toilet.colorful-toilet.workers.dev/`
- 公网控制台：`https://colorful-toilet.colorful-toilet.workers.dev/console/`
- 开发者邮箱：`2715000591@qq.com`
- DeepSeek Key 已加密保存，控制台只应显示后四位：`a6db`

当前稳定能力：

- X / Safari 插件的 `冲走`、自动下沉、恢复、蓝框、官方广告跳过、右栏关闭、名字屏蔽可用。
- 官网、控制台、下载清单可用。
- 回复审核路线已经是“数据库和 AI 学习库先处理已知问题，未知可疑内容尽快交给 AI，AI 结果再教数据库”。
- 后台下发的全局屏蔽账号名单已经接入本地扫描；用户手动恢复 / 放行仍然优先。
- DeepSeek 当前不能直接看头像图片文字；同类头像证据先靠页面文字、账号形态、主帖相关性和批量模式兜底。接入 OCR 或视觉模型属于可能增加费用和能力边界的动作，先解释再做。

重要数据保护：

- 用户“累计屏蔽总数、广告 / 招嫖引流 / 垃圾回复统计”、`冲走` / `恢复` 历史、AI 判断记录、数据库学习库、账号和设备绑定、用户偏好，都是产品记忆，不是可清理垃圾。
- 文档整理、旧代码删除、构建缓存清理、分支清理时，不能动这些真实统计和历史记录。
- 任何会改变线上 D1、统计总数、历史明细、用户偏好、AI 学习记录的动作，都必须先做 D1 备份，再用人话解释影响，等用户明确确认后才能做。
- 会写线上 D1 的维护脚本必须显式解锁：`WEB25_ALLOW_D1_WRITE=I_UNDERSTAND_PROTECTED_STATS`。没有这个解锁值只能做只读检查或 `--dry-run`。

当前还没完成：

- 普通用户正式邮件验证码发送还没接完整发信服务。
- 普通用户正式登录闭环还没完全收口。
- 开发者调试验证码当前按老板明确要求先不动。以后要关，必须先确认正式邮件验证码能稳定发送，否则可能让老板登录不了。
- 个性化屏蔽还没开始。
- 正式自定义域名还没定。
- 远程数据库里仍有少量开发测试原始行，只能在明确识别后清理。

## 2. 对老板汇报和卡住规则

用户没有计算机基础，明确说“我只听人话”。每次汇报按一个准则写：先说能不能用，再说还差什么，最后说 Codex 下一步做什么；技术词只能作为补充，不能把 `commit`、`push`、`deploy`、`Worker`、`D1`、`Wrangler`、`schema`、`pending`、`stash`、`worktree` 直接甩给用户。必须说时，立刻翻译成普通中文。

如果下一步清楚、风险低、能直接满足用户已经说过的目标，就继续做，不要动不动停下来问。需要问的情况只有：会改变产品行为、动真实数据库、花钱、需要账号权限、改登录身份安全、发布公网、上传 GitHub，或可能让用户意外。低风险文档整理、检查脚本、交接规则补强、重复说明合并，应该主动推进。

必需验证失败、Cloudflare 登录失效、账号权限、人机验证、付款、密钥、或任何只有用户能完成的步骤卡住时，立刻停下，用人话说明：哪一步已经通过、哪一步失败、为什么不能继续、需要用户做什么。不要跳过验证、降低标准、假装完成、反复盲试，或者绕开用户必须亲自完成的步骤。

推荐说法：

- “本机 App 已经换成最新版，并且我确认 Safari 正在用新版。”
- “网站还没更新到公网，因为 Cloudflare 登录失效，需要你重新登录后我才能发布。”
- “这次只是看状态，没有动真实数据库数据。”
- “后台已经收到样本，但还没留下最终判断，所以不能说 AI 已经放过它。”

## 3. 当前产品主路线

回复审核的目标路线：

```text
回复出现
  ↓
数据库 / AI 学习库先查
  ↓
已知垃圾：页面立刻撤掉
  ↓
未知但可疑：尽快交给 AI
  ↓
AI 判垃圾：撤掉，并写回标注、记忆和候选规则
  ↓
AI 判没问题：留在页面上
```

重要口径：

- 临时隐藏只能用于极高风险内容，不是默认体验。
- 用户发漏网截图，默认是在优化 AI 证据、AI 老师和数据库学习链路，不是让 Codex 把截图文字硬写进本地规则。
- 本地规则和云端规则必须同构。影响筛选行为时，通常同时看 `extension/content/rules.js`、`extension/content/content.js`、`cloudflare/src/index.js`。
- `manual_hide` / `冲走` 是垃圾候选样本。
- `manual_allow` / `恢复` 是纠错和抑制，不是“用户喜欢这类内容”，也不能变成公共放行规则。
- 单用户重复冲走不能自动变成所有人共享规则；公共升级需要多贡献者或开发者明确确认。

## 4. 高风险动作

这些动作高风险，先解释风险再做：

- 删除或覆盖 Cloudflare D1 真实数据，也就是线上生产数据库。
- 重置、重算、清理或合并用户累计屏蔽统计、广告/招嫖引流统计、`冲走` / `恢复` 历史、AI 判断记录、数据库学习库。
- 改登录、账号身份、权限。
- 改密钥、环境变量、付款或费用相关配置。
- 接入新的付费 AI / API 能力。
- 大改当前已经稳定的筛选架构。

## 5. 公网发布和 GitHub 上传规则

公网发布决定“用户能不能马上用到新版”。

必须发布公网的情况：

- 改官网、控制台、下载清单或公网下载包。
- 改 Cloudflare 后台逻辑、AI 路由、数据库判断、云端规则。
- 用户需要在其他设备或公网地址检查结果。

不一定发布公网的情况：

- 只改本机 Safari App 里的本地扩展代码，且用户只在这台 Mac 上测试。
- 只做本地诊断、只读检查、非公网文档整理。

GitHub 上传决定“后续同事会不会接错版本”，不是用户马上能不能用的开关。最新版老板规则是：不要每一步都上传；当用户对高完成度成果大幅度赞美、明确说上传 GitHub、要求交接/备份，或者 Codex 建议保存稳定节点且用户确认时，才上传。公开发布或本机 App 更新后可以建议保存，但不能把旧的“每次都上传”当成默认命令。

相似的 GitHub、发布、交接规则要合并；如果历史文档和用户最新说法冲突，以最新说法为准。

## 6. 上下文快满提醒

Codex 不能精确知道上下文还剩多少，但必须做提前提醒。出现这些情况时，先更新交接状态，再继续大任务：

- 对话很长，或已经发生过自动压缩。
- 本轮读了很多大文件、跑了很多长输出命令。
- 完成了一段重要改动，准备进入下一段大改。
- 交接文档又开始接近流水账，当前结论被旧历史挡住。
- 需要切换新人、换线程、结束当天工作，或准备 GitHub 保存。

提醒要说人话：“这轮内容已经很长，我先把当前状态写回交接文档，避免下一次压缩后接不上。”

## 7. 常见任务路线

改筛选规则：

1. 先读 `docs/current-stable-filter-state.md`
2. 只做小范围定向修正
3. 本地和云端同时对齐
4. 更新 `BUILD_ID`
5. 跑核心检查
6. 需要用户马上用到公网结果时发布公网
7. 影响 Safari 扩展时更新 `/Applications/web2.5.app`
8. 更新稳定状态文档

改 AI / 数据库学习链路：

1. 先确认是真实页面写入问题，还是开发者探针结果
2. 区分 `reply_ai_items`、`reply_ai_results.status=pending`、`ready`
3. 优先查候选入口、队列、缓存、云端补判和写回标注
4. 不要只改提示词或只加固定短语
5. 动数据库结构、迁移、清理或批量写入前必须备份 D1

改网站 / 控制台：

1. 看 `cloudflare/src/index.js`、`site/`、`wrangler.jsonc`
2. 跑 `npm run cloud:check`
3. 验证后发布公网
4. 记录公网 Version ID
5. 更新相关文档

更新本机 Safari App：

```bash
npm run safari:build
rm -rf /Applications/web2.5.app
ditto /tmp/web25-derived/Build/Products/Debug/web2.5.app /Applications/web2.5.app
codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app
open /Applications/web2.5.app
npm run safari:verify-live
```

替换 App 后必须确认真实 X 页面已经加载新版。只看文件、签名或下载清单不够。

## 8. 常用验证命令

按改动范围选择，不要假装验证过。

```bash
npm run doctor
node --check cloudflare/src/index.js
node --check extension/content/rules.js
node --check extension/content/content.js
node --check site/app.js
npm run cloud:check
npm run cloud:audit-data-layer
codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app
npm run safari:verify-live
```

查一条样本会走哪层：

```bash
npm run cloud:probe-reply-ai -- --text "样本文字" --display-name "昵称" --handle "账号"
```

默认探针不写数据库、不调用外接 AI。只有加 `-- --call-provider` 才会真实调用外接模型并消耗少量额度。

一键体检：

- `npm run doctor`：快速检查版本、文档锚点、本机 App、公开下载清单、核心语法；不发布，不做 D1 迁移、清理、重算或审核学习库写入。
- `npm run doctor:full`：在快速检查外，加云端 dry-run 和 AI 路线探针；登录 / 路线探针可能产生验证码或会话类记录，不能把它描述成“绝对不写数据库”。遇到登录或权限问题按第 2 节停下。
- 体检会顺便检查本地插件和云端 Worker 的 `pattern:*` key 是否对齐，避免同一个规则只写了一边。

## 9. 关键文件地图

当前主线文件：

- 本地扩展规则：`extension/content/rules.js`
- 本地扩展页面逻辑：`extension/content/content.js`
- 云端 Worker 和 API：`cloudflare/src/index.js`
- 数据库结构：`cloudflare/schema.sql`
- 官网和控制台：`site/index.html`、`site/console.html`、`site/app.js`、`site/styles.css`
- Safari App 工程：`web2.5/`
- 构建脚本：`scripts/build-safari-app.sh`
- 真实页面验收脚本：`scripts/verify-safari-extension-live.sh`
- 第二轮监督报告：`docs/supervisor-report-2026-05-04-round2.md`

已经从主线清掉的旧入口：

- 旧本地后台 `backend/server.mjs` 和本地自启动脚本。
- 旧主页信息采集实验扩展 `home-feed-extension/`。
- 旧 Pages 重定向项目 `legacy-pages-redirect/`。
- 旧 MVP / 临时 Safari 文档。
- 重复控制台页面 `site/console/index.html` 和旧 Pages Worker `site/_worker.js`。

这些旧线如果以后真要追溯，从 Git 历史查，不要恢复到主线误导新人。`site/stable-state.html` 仍是公开稳定状态页面源码，若要改并让用户看到，需要走公网发布。

第二轮监督员问题处理：

- 开发者调试验证码：老板明确说先不动，保留现状。
- 全局屏蔽账号：已从“后台发了、本地没用”改为本地扫描直接使用；人工恢复 / 放行优先。
- 旧冷却表：只在文档里说明当前运行读写 `ai_provider_cooldowns`，旧 `reply_ai_provider_cooldowns` 不能普通瘦身时直接删线上表。
- 旧文档口径：`docs/web-console-plan.md` 和 `site/stable-state.html` 已改成当前公网事实。
- 小死代码：删掉已确认没有调用的几个残留函数，并把检查写进 `npm run doctor`。
- 监督员复核后补充：`doctor` 这项只能防回潮，不能替代行为测试；后续应补一个小测试覆盖“全局账号会隐藏、手动放行优先、普通账号不受影响”。

## 10. 下一步优先级

当前最值得继续做：

1. 继续梳理 AI、数据库学习库、API 调度之间的真实关系。
2. 减少长期 `pending`，确保真实页面样本最终能留下可靠判断。
3. 保护正常上下文评论，尤其是尖锐、粗口、反驳、吐槽但和原帖相关的回复。
4. 继续扩展 `npm run doctor`，让它覆盖更多“只检查不改动”的日常体检。
5. 逐步标记大规则链：哪些是稳定活规则、哪些可交给 AI / 数据库、哪些确认过时后再删。不要一口气砍。
6. 以后再拆大文件。`cloudflare/src/index.js` 和 `extension/content/content.js` 很大，但拆它们风险高，应该在文档和验证流程清楚后再做。

暂时不要优先：

- 重做主页和控制台 UI。用户已经认可当前形态。
- 无差别全量 AI 审核。
- 大规模重写筛选架构。
- 新接付费视觉模型或 OCR，除非用户理解费用和风险后确认。

## 11. 给新对话的提示词

可以直接发给下一位助手：

> 你现在在 `/Users/boriszhang/Documents/Codex/project 1` 继续接手。先读 `AGENTS.md` 和 `docs/next-thread-handoff.md`，再跑 `npm run doctor`。用户没有计算机基础，只听人话；先说能不能用、还差什么、下一步做什么。下一步清楚且低风险时主动继续做，不要频繁问老板；必需验证失败或需要用户登录、付款、权限、人机验证时，立刻停下讲清楚，不要跳过验证或假装完成。当前最新锚点是 `BUILD_ID=2026-05-04-1742` / `extensionVersion=0.1.77` / Worker Version ID `1ba9b2db-60bc-482d-b549-c760b6b0e40f`。当前主路线是：数据库和 AI 学习库先处理已知垃圾，未知可疑内容尽快交给 AI，AI 判断写回标注、记忆和候选规则；本地扫描已经接上全局屏蔽账号名单，人工恢复 / 放行优先；开发者调试验证码按老板要求先不动。用户发漏网截图时，先当作 AI 证据和数据库学习链路诊断，不要把截图文字直接硬写成本地规则。公网发布是让用户马上用到新版；GitHub 上传要等用户对高完成度成果大幅度赞美、明确要求上传，或确认保存稳定节点，不要每个小步骤都传。D1 是生产数据库，动结构、清理、迁移或批量写入前必须备份。对话很长或压缩后继续大任务时，先更新交接状态，避免断片。

## 12. 维护这份文件的规则

更新原则：

- 像人交接给人一样写。
- 先说当前结论，再说为什么重要，最后给下一步动作。
- 不要写成命令输出、聊天流水或只有工程师才看得懂的缩写堆。
- 面向“下一位忙着接手的人”写，不面向“想研究历史的人”写。
- 历史可以保留可搜索关键词，但不要挡在当前事实和当前动作前面。
- 相似规则合并成一条更硬的规则，不要散成三四处重复提醒。
- 用户最新明确偏好高于旧历史；旧说法冲突时，保留最新规则，把旧说法归档或删除。
- 删除过时数字，不把历史计数写成实时状态。
- 当前版本锚点要及时更新。
- 新增规则要写清楚为什么以后也要遵守。

写交接时用这个短模板，不要写成流水账：

1. 现在能不能用：本机、公网、AI、数据库分别是什么状态。
2. 这次改了什么：只写影响后续接手的事实，不复述聊天。
3. 验证到哪一步：写通过了什么；失败时写卡在哪里，不假装完成。
4. 下一步最值得做：如果低风险且明显有用，下一位直接继续做；高风险才问用户。

一句话：这份文件是路牌，不是日记。
