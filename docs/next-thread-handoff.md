# Colorful Toilet 下一轮接力说明

最后整理日期：2026-05-01

这份文件是给下一轮 Codex / 开发助手看的，不是产品宣传文档。目标只有一个：新对话打开后，能快速、安全、连续地接手，不重复解释，不误删数据，不改坏已经稳定的插件。

## 0. 新对话开场必须先做

下一轮接手时，先按这个顺序做：

1. 进入仓库：`/Users/boriszhang/Documents/Codex/project 1`
2. 运行：`git status --branch --short`
3. 先读：
   - `AGENTS.md`
   - `docs/next-thread-handoff.md`
   - `docs/current-stable-filter-state.md`
   - `docs/current-stable-ui-state.md`
   - `docs/moderation-database-training-plan.md`
   - 如果下一步是接大模型 API，再读 `docs/ai-api-provider-handoff.md`
4. 再根据用户最新一句话行动，不要被旧上下文带偏。

不要假设工作区是干净的。不要回退自己没改过的东西。

当前活跃分支是 `codex/cloudflare-public-foundation`。用户看到多个分支时，不要让用户手动切换、合并或删除分支；继续使用当前活跃分支即可。`main` 和旧的 `codex/...backup...` / `codex/update...` 分支先视为历史线或备份线，除非用户明确要求清理，否则不要动。

## 1. 用户工作方式

用户没有计算机基础，不应该被迫理解提交、推送、部署、D1、Worker、构建签名、AI 接口、模型适配、API Key 这些细节。

对用户解释时必须先用大白话说结论：

- 先说“能不能用 / 还差什么 / 我下一步会做什么”
- 不要直接甩 API 名称、接口路径、模型参数、错误码、命令输出
- 必须提技术词时，后面立刻用一句普通中文解释
- 需要用户提供密钥、登录、付款、真人验证时，只说用户要做的那一步，不让用户判断工程细节
- 用户问“准备好了吗”这类问题时，优先回答“准备好了 / 还没完全准备好”，再用一两句解释原因

默认工作方式：

- 能做的就直接做完
- 修改后自己测试
- 需要提交就提交
- 需要推送就推送
- 需要上线就部署
- 官网 / 控制台前端改动做完后，必须立刻部署到公网并验证公网地址；只做到本地预览不算完成，因为用户需要在另一台设备上检查。
- 影响 Safari 扩展就更新 `/Applications/web2.5.app`
- 更新本机 App 后验证 `BUILD_ID` 和签名
- 最后用简单中文说清楚“已经做到哪一步”
- 用户说“做到无能为力”为止时，意思是不要停在建议或半成品；要继续做到遇到真实外部阻塞，例如账号登录、真人验证、付款、必须用户亲自验收等，并把阻塞点写清楚。
- 用户反复提醒的长期工作习惯和项目规则，要及时写进 `AGENTS.md` 或本文档，不要只靠当前对话上下文。
- 用户明确要求：后续对话里，如果出现很带有用户个人风格、长期协作方式、或对 Codex 的统一要求，要随时同步进交接文档；不要等到换线程时才补。

只有高风险动作需要先停下来讲清楚：

- 删除或覆盖 Cloudflare D1 真实数据
- 改登录、账号身份、权限
- 改密钥、环境变量、费用相关配置
- 接入会产生费用的 AI / API
- 大改当前已经稳定的筛选架构

一句话：普通维护默认完整执行，高风险数据和费用动作先确认。

## 2. 当前产品状态

### 已稳定

- `X / Safari` 插件主链路已经稳定：
  - 冲走
  - 自动下沉
  - 恢复
  - 蓝框
  - 官方广告跳过
  - 右栏模块关闭
  - 名字屏蔽
  - 基础云端同步
- 公网网站可用：
  - 首页：`https://colorful-toilet.colorful-toilet.workers.dev/`
  - 控制台：`https://colorful-toilet.colorful-toilet.workers.dev/console/`
- 开发者登录可用：
  - 邮箱：`2715000591@qq.com`
  - 开发者验证码当前会直接显示
- 开发者模式可用：
  - 待确认投喂
  - 精确项直达全局
  - 全局撤回
- 插件默认同步地址已经指向公网，不再默认写本地后台。
- 第一层数据分层防线已经在代码层补强：
  - 个人统计继续按 `user_id` 隔离
  - 自动全局精确规则至少需要多贡献者
  - 同一账号多个设备不能伪装成多人共识
  - 新增开发者只读审计接口：`GET /api/developer/data-layer-audit`
  - 新增审计脚本：`npm run cloud:audit-data-layer`
  - 2026-05-01 已部署到线上 Worker

### 还没完成

- 普通用户真实邮件验证码发送还没接正式发信服务
- 普通用户正式登录闭环还没完全收口
- 个性化屏蔽还没开始
- AI 判断已接入 DeepSeek 小额测试配置；2026-05-01 已部署通用大模型兼容适配，会自动尝试多种常见返回格式。用户已明确 API 已提供，下一轮不要再让用户重新购买。线上开发者账号曾加密保存 DeepSeek Key，模型为 `deepseek-v4-flash`，并已通过真实 AI 接入测试、6 条小样本识别测试、4 条成人内容边界小样本测试。2026-05-01 后续发现保存 AI 设置时会把空 Key 输入框误当成清空 Key，已修复并部署。用户已重新提供 Key，当前已通过线上接口加密保存，控制台只应显示后四位 `a6db`；不要把完整 Key 写入文档、代码、命令、日志或 GitHub。基础层现在明确放过正常成人/色情讨论，只压约见导流、联系方式、诈骗、木马/安装包、主页诱导和空洞钓鱼。2026-05-01 已新增提示词包 `docs/ai-prompt-packs/sexual-leadgen-foundation/`，并用线上 Key 验证：引流样本 hide，正常成人治理讨论 allow。后续还需要用真实 X 回复做页面级验收。
- 正式自定义域名还没定
- 远程 D1 里仍有少量开发测试原始行，只能在明确识别后清理

## 3. 当前版本锚点

这些是截至 2026-05-01 的已知稳定锚点：

- 当前分支：`codex/cloudflare-public-foundation`
- Cloudflare Worker：
  - URL：`https://colorful-toilet.colorful-toilet.workers.dev`
  - Version ID：`eb69a37c-fe26-4bdf-80cb-b3fd06a9581d`
  - 2026-05-01 `npm run cloud:deploy` 已成功部署。
  - 线上代码已确认包含 `/api/developer/data-layer-audit`、`contributor-layering-v2`、`buildRuleContributorKey` 和 `GLOBAL_RULE_MIN_CONTRIBUTORS`。
  - 线上代码已包含通用大模型兼容适配：用户给 API Key、兼容接口地址、模型名后，Worker 会自动尝试多种常见返回格式；如果平台完全不兼容，再补单独适配。
  - 线上控制台 AI 设置区已新增“测试一次 AI 接入”按钮。按钮会先保存设置，再只发一条小样本测试 Key / 接口地址 / 模型名是否可用；它不会自动运行，用户手动点击才会消耗少量 API 额度。
  - 2026-05-01 已将线上开发者账号的共享 AI 设置接入 DeepSeek：
    - `providerBaseUrl = https://api.deepseek.com`
    - `model = deepseek-v4-flash`
    - Key 已重新加密保存，控制台只显示后四位 `a6db`，不要把完整 Key 写入代码、文档、命令、日志或 GitHub。2026-05-01 后续保存设置时曾被 bug 误清空；该 bug 已修复，并已复测不带 `apiKey` 的普通保存不会再清 Key。
    - “测试一次 AI 接入”已返回 `status=ready`、`action=hide`、`confidence=high`，标签包含 `adult_solicitation`、`contact_redirect`。
    - 6 条小样本识别测试全部符合预期：招嫖/联系方式引流、附近约见诱导、风险名字+低信息回复会隐藏；`Apple ID 一直登不上`、正常地点讨论、普通短回复会放过。
    - 2026-05-01 修复了扩展侧 AI 排队保护：只有本地规则先判定为可疑候选、且本地/数据库规则还没有直接隐藏的回复才会进入 AI 队列，避免打开详情页后把所有回复都送去模型，也避免 `找个同城的哥哥` 这类模板已经能本地隐藏时还消耗 API。
    - 2026-05-01 收紧 AI 基础审核边界：正常成人话题、色情讨论、性教育/平台治理讨论不能只因为含有色情词就隐藏；基础层要保护正常表达，只隐藏诈骗、约见引流、联系方式、木马/安装包、主页诱导、空洞钓鱼，以及由名字、handle、主页简介、主页外链等账号证据支撑的低信息垃圾。头像/图片只有在未来真的采集并提供给 AI 时才能作为辅助证据，不能让模型凭空脑补。4 条真实 DeepSeek 临时样本测试通过：2 条正常成人讨论放过，2 条导流/安装包风险隐藏。
    - 2026-05-01 再次加强默认提示词和线上补充提示词：色情内容本身允许；只屏蔽色情引流、约见导流、联系方式导流、主页/置顶/简介诱导、空洞低信息诱饵、诈骗、木马、安装包、资源包和不安全外链。普通短句不能只因短就隐藏，`meaningless_bait` 必须有风险账号或导流证据支撑。
  - 线上控制台“最近 AI 隐藏记录”已新增“恢复误判”：会写入 `manual_allow`，并把对应 `reply_ai_results` 标成 `manual_allow/allow`，让该条从 AI 隐藏列表消失；同账号同文案短期会复用放过结果。不要把这个恢复当成广泛反向训练，只表示这条 AI 误判。
    - 2026-05-01 控制台前端已部署来源小方格到公网 Version ID `eb69a37c-fe26-4bdf-80cb-b3fd06a9581d`，并已按用户要求集成进 `你的累计成果` 那组 `metric-card` 方格，不要单独画新的“屏蔽来源入口”。来源包括：`AI 智能屏蔽`、`AI 结果复用`、`数据库历史命中`、`公共数据库规则`、`账号黑名单`、`本地规则下沉`、`你手动冲走`、`恢复误判`。详情列表默认隐藏，点击对应方格后要立刻展开并跳转/滚动到详情列表，不要只把方格变灰。`global_blocklist` 在界面上叫 `账号黑名单`，不要再叫“AI 全局屏蔽”；`reuse_exact_hide` / `reuse_template_hide` / `reuse_account_hide` 归入 `AI 结果复用`，不算新的 AI 调用。当前 dashboard 近期事件还不能稳定区分公共规则和本地规则，前端已保留独立卡片，缺字段时显示待接入/0。
    - 轻量样本分类方向：不要做用户直接写压缩包；应自动从现有 `moderation_events`、`reply_ai_items`、`reply_ai_results` 抽到 `moderation_samples` / `moderation_sample_labels`。`manual_hide` 是垃圾候选，AI 高置信 hide 是辅助证据，`manual_allow` / “恢复误判”是抑制和纠错证据，只有多贡献者或开发者确认后才升级公共规则。
  - API 接入下一步详见 `docs/ai-api-provider-handoff.md`。
  - 2026-05-01 已验证公网首页、控制台、`/downloads/latest.json`、Safari 下载包、Chrome/Edge 下载包都可从 Cloudflare 线上地址直接访问，不依赖本地部署。
  - 本机直连 `https://colorful-toilet.colorful-toilet.workers.dev/` 会连接超时；原因是命令行直连没有走 macOS 系统代理。`scripts/audit-data-layer.mjs` 已修复：检测到 macOS HTTPS 代理时会自动用 `NODE_USE_ENV_PROXY=1` 重启自己。
  - 2026-05-01 `npm run cloud:audit-data-layer` 已直接跑通，线上分层审计全部 PASS：`total_users=2`，真实事件 `total_events=692`、`bound_events=692`、`unbound_events=0`、`event_user_count=1`；`single_contributor_blocked_candidates=8`。
  - 2026-05-01 已确认 Worker Secret 名单包含 `USER_AI_SETTINGS_SECRET`，AI Key 可以加密保存。
  - 2026-05-01 已修复 AI 设置保存 bug：如果请求里没有带 `apiKey`，Worker 会保留原来的加密 Key，不再把空输入框误当成清空 Key。已部署到 Version ID `8039945b-87ba-4a4c-8eca-775775e9b7fa`。
- Cloudflare D1：
  - 数据库名：`web25`
  - 绑定名：`DB`
- Safari / Web Extension：
  - `BUILD_ID = 2026-05-01-2117`
  - extension manifest version：`0.1.32`
  - App / Extension version：`1.0.32 (33)`
  - 本机安装路径：`/Applications/web2.5.app`
  - Bundle：`com.yourCompany.web25.extension`

如果实际文件或线上状态与这里不一致，以实际检查结果为准，并更新本文件。

## 4. 数据库硬约束

Cloudflare D1 是重要生产数据，不是临时缓存。

必须守住：

- 动 schema、迁移、清理、危险写入前，先备份 D1
- 不删除真实用户事件
- 不删除真实同步历史
- 不删除真实全局规则
- 只清理已经确认的开发测试行
- 如果无法确认是不是测试数据，默认保留
- 不把单个用户反馈直接变成公共规则
- 不让个人偏好污染公共规则库

数据分层口径：

- 公共基础层：大家普遍不想看到的招嫖、诈骗、导流、黑产联系方式、高频垃圾模板
- 样本标注层：用户反馈、开发者审核、AI 判断都先成为样本和 label
- 个人偏好层：个人不喜欢的话题、语气、账号风格，后续再用 AI 或个性化规则处理

新账号可以共享公共基础库，但不能继承开发者账号的个人屏蔽数量、恢复数量、偏好和历史。

`冲走` 可以作为垃圾候选样本；`恢复` 只能表示“不该按垃圾处理 / 不应升级为公共垃圾规则”，不能当成另一类内容的反向训练样本。

## 5. 筛选机制硬约束

当前筛选机制已经得到用户明确认可，默认是稳态资产。

不要随意：

- 改评分阈值
- 重写筛选架构
- 把已经压住的引流话术放回来
- 只改本地不改云端
- 只改云端不改本地

必须守住的命中类型：

- `有万达广场附近的吗`
- `有附近的吗`
- `离得近的吗`
- `主页置顶看id`
- `搜我小号 vx123456`
- `NEW / dd / 极短符号 + 风险显示名 + 数字 handle`
- `哥哥我想要`
- `有哥哥找下吗`
- `找个同城的哥哥`
- 风险显示名配低信息回复，例如 `男大可约` + `dd`

必须避免误伤：

- `Apple ID 一直登不上`
- `我在万达广场附近上班`
- `万达广场附近有什么好吃的`
- `附近有家面馆不错`
- 普通账号正常说 `hi` / `ok`

当前关键模式键：

- `pattern:geo-meetup-bait`
- `pattern:geo-relationship-bait`
- `pattern:bait-question-shape`
- `pattern:low-information-lure-account`
- `pattern:low-information-strong-lure-name`

相关文件必须同构：

- `extension/content/rules.js`
- `extension/content/content.js`
- `cloudflare/src/index.js`

## 6. UI 硬约束

右栏关闭能力是稳定能力，不要乱改。

当前可关闭模块：

- `订阅 Premium`
- `X 上的直播`
- `你可能会喜欢`
- `相关用户`
- `有什么新鲜事`
- `推荐关注`
- 底部政策链接块

必须守住：

- 每块右上角有灰色小叉
- 点叉只关闭自己
- 关闭后不能留下白框
- 关闭后不能让页面白屏
- 页面局部重渲染后要能补挂灰叉
- 真正刷新页面后模块会重新出现，用户可以再次关闭

右栏关闭是“当前页面有效”，不是“跨刷新永久记忆”。

## 7. 常见任务怎么做

### 改筛选规则

1. 先看 `docs/current-stable-filter-state.md`
2. 小范围定向加权，不大改架构
3. 同时改本地和云端：
   - `extension/content/rules.js`
   - `extension/content/content.js`
   - `cloudflare/src/index.js`
4. 更新 `BUILD_ID`
5. 跑语法检查和样本回归
6. `npm run cloud:check`
7. 需要上线就 `npm run cloud:deploy`
8. 需要本机可用就重建并替换 `/Applications/web2.5.app`
9. 更新稳定状态文档
10. 提交并推送

### 改数据库或清理数据

1. 先备份远程 D1
2. 明确目标是 schema、迁移、还是清理
3. 只处理确认范围内的数据
4. 不确定是不是测试数据就保留
5. 改完验证表结构、关键计数、个人/全局分层
6. 记录备份文件和执行结果

只读分层审计优先用：

```bash
npm run cloud:audit-data-layer
```

如果 Cloudflare token 失效，`wrangler d1 execute --remote` 会失败；这个脚本走线上开发者登录接口，部署后更适合做日常验收。

本机当前 macOS 系统代理是 `127.0.0.1:7897`。审计脚本会自动检测 HTTPS 代理并重启自己；如果未来又出现 `fetch failed`，先检查代理是否还在运行。

### 改网站 / Worker

1. 读 `cloudflare/src/index.js`、`site/`、`wrangler.jsonc`
2. 跑 `npm run cloud:check`
3. 需要上线就 `npm run cloud:deploy`
4. 记录 Cloudflare Version ID
5. 更新相关文档

### 更新本机 Safari App

常用流程：

```bash
npm run safari:build
rm -rf /Applications/web2.5.app
ditto /tmp/web25-derived/Build/Products/Debug/web2.5.app /Applications/web2.5.app
codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app
open /Applications/web2.5.app
npm run safari:verify-live
```

重要：替换 App 后，已经打开的 `x.com` / `twitter.com` 标签页不会自动重新注入 content script。必须刷新 X 标签页，或者重启 Safari 后再验证。否则用户会看到“冲走”和右栏灰叉都消失，但其实只是旧标签页没有加载扩展。

可以用 Safari AppleScript 验证真实页面是否已注入：

```bash
osascript -e 'tell application "Safari" to do JavaScript "document.documentElement.dataset.web25Build || \"NO_WEB25_BUILD\"" in current tab of front window'
```

如果返回 `NO_WEB25_BUILD`，优先刷新当前 X 标签页；如果仍不行，再检查 Safari 扩展开关和站点权限。

如果只是 Cloudflare Worker / 网站改动，不一定需要更新本机 App。只要影响扩展代码，就需要。

## 8. 常用验证命令

按改动范围选择，不要假装验证过。

```bash
git status --branch --short
node --check cloudflare/src/index.js
node --check extension/content/rules.js
node --check extension/content/content.js
npm run cloud:audit-data-layer
npm run cloud:check
npm run cloud:deploy
rg -n "BUILD_ID|displayNameLooksStrongLure|low-information-strong-lure-name" "/Applications/web2.5.app/Contents/PlugIns/web2.5 Extension.appex/Contents/Resources/content"
codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app
pluginkit -m -A | rg "web2\\.5|web25|yourCompany|Colorful"
```

真实页面注入验证：

```bash
osascript -e 'tell application "Safari" to do JavaScript "document.documentElement.dataset.web25Build || \"NO_WEB25_BUILD\"" in current tab of front window'
osascript -e 'tell application "Safari" to do JavaScript "document.querySelectorAll(\"[data-web25-action=manual-hide], .web25-sidebar-close, [data-web25-sidebar-close]\").length.toString()" in current tab of front window'
```

## 9. 下一步优先级

当前阶段先收口，不抢跑。

第一优先级：数据安全和真实验收

- 确认 D1 真实数据分层
- 确认开发者账号和普通账号看到的个人统计不同
- 确认公共规则可以共享，但个人计数不共享
- 如需清理测试行，先备份，只删确认测试行

第二优先级：普通用户登录闭环

- 接正式邮件验证码发送
- 普通用户登录后能看自己的统计和偏好
- 开发者模式与普通用户模式保持隔离

第三优先级：完整人工验收

- 插件里真实产生一条动作
- 看是否进入公网 D1
- 看是否出现在公网控制台
- 看开发者确认 / 撤回是否真实影响全局规则

暂时不要优先：

- AI 个性化
- 多浏览器扩展
- 大规模 UI 重做
- 重写插件体验
- 新增很多模块

## 10. 关键文件地图

核心规则：

- `extension/content/rules.js`
- `extension/content/content.js`
- `cloudflare/src/index.js`

云端和数据库：

- `cloudflare/schema.sql`
- `wrangler.jsonc`
- `docs/moderation-database-training-plan.md`
- `docs/ai-api-provider-handoff.md`

网站和控制台：

- `site/index.html`
- `site/console/index.html`
- `site/app.js`
- `site/styles.css`

Safari App：

- `scripts/build-safari-app.sh`
- `web2.5/web2.5.xcodeproj/project.pbxproj`
- `extension/manifest.json`

稳定状态文档：

- `AGENTS.md`
- `docs/current-stable-filter-state.md`
- `docs/current-stable-ui-state.md`
- `docs/next-thread-handoff.md`

## 11. 给新对话的提示词

可以直接把下面这段发给新对话：

> 你现在在 `/Users/boriszhang/Documents/Codex/project 1` 继续接手。先读 `AGENTS.md`、`docs/next-thread-handoff.md`、`docs/current-stable-filter-state.md`、`docs/current-stable-ui-state.md`、`docs/moderation-database-training-plan.md`，然后跑 `git status --branch --short`。先不要扩功能，也不要重构。X / Safari 插件主链路已经稳定，冲走、自动下沉、恢复、蓝框、广告跳过、右栏关闭、名字屏蔽和数据库同步都不能改坏。用户没有计算机基础，所以默认要自己完成检查、修改、测试、提交、推送、部署、本机 App 更新和验证，不要只口头解释。Cloudflare D1 数据很重要，动 schema、清理、迁移前必须先备份；真实数据不能丢。默认优先保护数据、收口普通用户登录/邮件验证码、做完整人工验收，不要抢跑 AI 和大规模个性化。

## 12. 维护这份文件的规则

每次完成重要改动后，检查这份文件是否需要更新。

更新原则：

- 保持短、准、可执行
- 删除过时数字，不把历史计数写成实时状态
- 当前版本锚点要及时更新
- 新增高风险规则要写清楚原因
- 不要把聊天流水账搬进来
