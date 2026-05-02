# Colorful Toilet 下一轮接力说明

最后整理日期：2026-05-02

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
   - `docs/ai-api-provider-handoff.md`
4. 再根据用户最新一句话行动，不要被旧上下文带偏。

不要假设工作区是干净的。不要回退自己没改过的东西。

当前活跃分支是 `codex/cloudflare-public-foundation`。用户看到多个分支时，不要让用户手动切换、合并或删除分支；继续使用当前活跃分支即可。`main` 和旧的 `codex/...backup...` / `codex/update...` 分支先视为历史线或备份线，除非用户明确要求清理，否则不要动。

## 1. 用户工作方式

用户没有计算机基础，不应该被迫理解提交、推送、部署、D1、Worker、构建签名、AI 接口、模型适配、API Key 这些细节。

用户明确说过：“我只听人话”。以后汇报状态时，不要直接说 `stash`、`worktree`、`upstream`、`未暂存`、`未跟踪`、`commit`、`push`、`deploy`、`Wrangler`、`D1` 这类词就结束。必须先翻成普通中文，例如：

- “代码没有没保存的改动，也没有没上传到 GitHub 的改动。”
- “网站代码已经保存并上传了，但还没真正更新到公网，原因是 Cloudflare 登录失效，需要重新登录后我才能发布。”
- “本机 App 已经换成最新版，并且我确认 Safari 正在用新版。”
- “数据库没有动真实用户数据；这次只是看状态。”

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
- 2026-05-02 重要教训：替换或重新构建 Safari App 后，不能只看 `/Applications/web2.5.app` 的文件、`BUILD_ID` 和签名。Safari 可能让已打开的 X 标签页暂时失去内容脚本，或者系统扩展注册被刚构建的临时 app 干扰。以后每次 `npm run cloud:deploy`、`npm run browser:artifacts`、`npm run safari:build`、替换 `/Applications/web2.5.app` 后，都必须执行：`pluginkit -e use -i com.yourCompany.web25.extension`、`npm run safari:verify-live`，并确认真实 X 页面里 `document.documentElement.dataset.web25Build` 是当前 `BUILD_ID`、详情页有可见 `冲走` 按钮、右栏有关闭按钮。没有通过前，不准说插件已可用。
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
- AI 判断已接入 DeepSeek 小额测试配置；2026-05-01 已部署通用大模型兼容适配，会自动尝试多种常见返回格式。用户已明确 API 已提供，下一轮不要再让用户重新购买。线上开发者账号曾加密保存 DeepSeek Key，模型为 `deepseek-v4-flash`，并已通过真实 AI 接入测试、6 条小样本识别测试、4 条成人内容边界小样本测试。2026-05-01 后续发现保存 AI 设置时会把空 Key 输入框误当成清空 Key，已修复并部署。用户已重新提供 Key，当前已通过线上接口加密保存，控制台只应显示后四位 `a6db`；不要把完整 Key 写入文档、代码、命令、日志或 GitHub。基础层现在明确放过正常成人/色情讨论，只压约见导流、联系方式、诈骗、木马/安装包、主页诱导和空洞钓鱼。2026-05-01 已新增提示词包 `docs/ai-prompt-packs/sexual-leadgen-foundation/`，并用线上 Key 验证：引流样本 hide，正常成人治理讨论 allow。2026-05-02 已确认新版插件注入真实 X 页面；后续只需用自然遇到的真实样本继续观察误判和漏网。
- 正式自定义域名还没定
- 远程 D1 里仍有少量开发测试原始行，只能在明确识别后清理

## 3. 当前版本锚点

这些是截至 2026-05-02 的已知稳定锚点：

- 当前分支：`codex/cloudflare-public-foundation`
- Cloudflare Worker：
  - URL：`https://colorful-toilet.colorful-toilet.workers.dev`
  - Version ID：`0e62a0bf-38d6-47ff-8834-369a59cb8524`
  - 2026-05-02 17:31 用户截图反馈仍有多条漏网：`比她好看的没她强，比她强的没她好看 @designksh1/@xiaonm88`、`刷了半天的X就她的主页能打✈️了 @designksh1/@xiaonm88`、`线下我就日过这个骚货 @designksh1`、以及 `免费破处` 风险昵称发 `十🙈`。根因：前两种重复导流话术没有被收进明确垃圾模板；云端候选规则也没把“风险昵称 + 一个字/表情薄回复”当作低信息诱导账号模式，所以部分样本没有稳定命中数据库层。已同步补本地规则和 Worker：新增两条模板，云端 `buildRowKeys` 把 minimal emoji payload 纳入 `low-information-lure-account` / `low-information-strong-lure-name`。公网 7 条截图同款样本全部返回 `db_rule_pattern` 或 `db_rule_template`、`action=hide`、`confidence=high`，`model=moderation-rule-candidates-2026-05-02-v1`，说明由数据库学习库接管，不调用外部 AI。测试 item 为 `1100`-`1106`，属于 `sync_dev_test_screenshot_templates_*` 开发验收数据。
  - 2026-05-02 17:11 已按用户追问验收并发布“数据库优先截住低信息风险账号回复”补强：`2🙃😍🧡` 这类数字/符号/表情薄回复会和风险昵称、随机数字 handle 组合进本地与 Worker 同构规则。公网真实测试样本 `孟轩🌸无常线下🌸 @MullerChri42258 / 2🙃😍🧡` 返回 `decisionLayer=db_rule_pattern`、`action=hide`、`confidence=high`、`model=moderation-rule-candidates-2026-05-02-v1`，说明命中数据库学习库，不调用外部 AI。测试 item 为 `1099`，使用 `sync_dev_test_db_rule_1650_*` / `device_test_db_rule_1650_*`，属于开发验收数据。
  - 2026-05-02 13:55 用户完成 Cloudflare 授权后，已发布“旧数据库整理进学习库”通道：开发者接口 `POST /api/developer/backfill-training` 和脚本 `npm run cloud:backfill-training` 已上线。公网首页、控制台、`/downloads/latest.json` 均返回 200。
  - 2026-05-02 13:55 已备份并回填线上 D1。备份文件包括 `backups/d1/web25-2026-05-02T05-38-54-857Z-before-training-backfill.sql`。回填结果：旧手动事件处理 156 条、旧 AI 判断处理 1070 条、AI 记忆写入尝试 130 次。只读核验：`moderation_samples=1220`、`moderation_sample_labels=1226`、`reply_ai_memory active=84`。
  - 2026-05-02 15:24 已上线“数据库接管重复垃圾”闭环：新增开发者接口 `POST /api/developer/rebuild-rule-candidates` 和脚本 `npm run cloud:rebuild-rule-candidates`。它会从旧样本、AI 高置信隐藏、开发者确认/撤回里整理 `moderation_rule_candidates`，云端 AI 判断前先查这张候选规则表；命中后返回 `db_rule_*`，不调用外部 AI。正式整理前已备份 D1 到 `backups/d1/web25-2026-05-02T07-23-57-109Z-before-rule-candidates.sql`。线上核验：`active=222`、`candidate=64`；`找个同城的哥哥` 精确规则和 `pattern:geo-relationship-bait` 已启用；`pattern:geo-meetup-bait` 和 `template:hook+meetup` 因存在恢复/放过证据仍是候选，未粗暴启用。
  - 2026-05-02 15:26 真实云端小测试通过：测试样本 `找个同城弟弟` 返回 `decisionLayer=db_rule_pattern`、`action=hide`，并确认测试 item `1097/1098` 没有产生新的外部 AI 调用。误伤核验：`我在万达广场附近上班`、`附近有家面馆不错`、`pattern:geo-meetup-bait`、`template:hook+meetup` 没有活跃规则直接粗暴命中。
  - 2026-05-02 13:55 新记录正文保存已上线：插件和 Worker 都会尽量保存回复正文；如果 X 当时不给正文，就保存 `账号线索：显示名 @handle`，避免学习样本完全空掉。旧的空正文历史不能凭空还原，只能以后尽量不再新增空样本。
  - 2026-05-02 12:22 已修复扩展 AI 首判入口：之前实际代码会把每条可读回复都排进 AI；现在 `buildReplyAiModerationCandidate` 只在强风险触发或弱风险组合时排队。普通正常回复不应消耗 AI。
  - 2026-05-02 13:55 轻量学习闭环已上线：新发生的 `manual_hide` / `manual_allow` 会写入 `moderation_samples` / `moderation_sample_labels`，AI 首次判断也会写入 AI 标注；这些仍然只是证据层，不会自动升级公共规则。
  - 2026-05-02 12:35 通过公网开发者审计接口核对：真实事件 `totalEvents=702`、`auto_hide=397`、`manual_hide=143`、`manual_allow=13`、`ad_home_hide=133`、`ad_reply_hide=16`；分层检查全部 PASS。Cloudflare 直接 D1 读取同样因账号登录失效失败。
  - 2026-05-02 已完成 `AI 首判、云端记忆复用`：新增并应用线上 `reply_ai_memory` 表；只把 AI 直接高置信隐藏结果写入记忆；记忆命中、旧复用、`global_blocklist` 等在控制台归入 `AI 学习库屏蔽`；用户恢复误判会停用对应记忆。发布前已备份 D1 到 `backups/d1/web25-2026-05-02-ai-memory-before-schema.sql`。
  - 2026-05-02 `/api/state` 已改为不再把公共精确规则合并进插件本地手动隐藏列表；公共规则和高共识模板只作为云端 AI 判断参考信号。公网烟测显示新测试身份返回 `manualHideKeys: []`，随后已删除该临时测试 sync key。
  - 2026-05-02 控制台累计方格已固定为 5 块：`累计跳过无用内容`、`AI 直接屏蔽`、`AI 学习库屏蔽`、`你手动冲走`、`跳过官方广告`。详情入口为 `all_skipped`、`ai_direct`、`ai_memory`、`manual`、`ads`。
  - 2026-05-02 验证通过：`node --check cloudflare/src/index.js`、`node --check extension/content/rules.js`、`node --check extension/content/content.js`、`node --check site/app.js`、`git diff --check`、`npm run cloud:check`、`npm run cloud:audit-data-layer`、`npm run cloud:deploy`。公网首页、控制台、`/console/?detail=ai_memory`、`/downloads/latest.json` 均返回 200。
  - 2026-05-02 15:24 数据库接管层上线后再次验证：`node --check cloudflare/src/index.js`、`node --check scripts/rebuild-rule-candidates.mjs`、`git diff --check`、`npm run cloud:check`、`npm run cloud:deploy`、`npm run cloud:rebuild-rule-candidates`、`npm run cloud:audit-data-layer` 均通过；公网首页、控制台、`/downloads/latest.json` 均返回 200。2026-05-02 15:45 为发布新版 Safari 下载包再次部署，当前 Worker Version ID 为 `8b9891cf-236d-4b89-a547-2e68f1c45697`。
  - 2026-05-02 `npm run cloud:deploy` 已成功部署控制台前端方格直达详情页改动。
  - 2026-05-02 用户已亲自完成 Cloudflare 网页登录授权；本机发布权限恢复。随后已再次运行 `npm run cloud:check` 和 `npm run cloud:deploy`，公网更新成功，当前 Version ID 为 `f66362e3-0f48-46e0-9639-95bf51590205`。已用系统代理验证首页、控制台、`/console/?detail=ai_hide`、`/downloads/latest.json` 均返回 200，线上 `/app.js` 已包含详情页精简模式和设备显示修正。
  - 2026-05-02 已修复控制台“恢复这条”前台不同步：用户在来源详情页恢复后，当前列表会立刻移除原来的隐藏记录；刷新后的来源分类也会用 `manual_allow` 抑制同一条 `auto_hide` / `manual_hide`，不再让它继续留在“本地规则下沉”里。已部署到公网 Version ID `f54ff4e3-e820-4f34-840f-6a6da3c72cfa`。
  - 2026-05-02 后续发现“累计自动整理”详情页仍独立读取 `auto_hide`，没有套用同一条 `manual_allow` 抑制逻辑。已修复为所有相关明细入口共用恢复结果：`本地规则下沉`、`累计自动整理`、底部近期审查列表、广告详情页都会在同一条恢复后隐藏原来的被挡记录。已部署到公网 Version ID `29714654-a468-4df3-b5fb-2ce99b3dbb44`，并验证 `/console/?detail=auto` 和线上 `/app.js` 可访问。
  - 2026-05-02 再次按用户要求修到底层口径：`manual_allow` 不只在前台遮住旧记录，Worker 后台统计、最近记录、广告明细、开发者待整理池、确认上传入口都会把同一条后来的恢复记录当成“这条已撤销，不再算当前屏蔽”。D1 原始历史仍保留，不能为了界面干净删除真实事件。已部署到公网 Version ID `d45d03b9-e4db-4ec3-838a-243f92aaffe5`。只读 D1 核验：事件 `698`（`auto_hide`，`有没有天安门附近的`，`@erqeqwaaa`）被判定为“已恢复，不再算当前屏蔽”；事件 `699` 是对应 `manual_allow`。线上 `/api/dashboard` 登录核验：最近记录只返回 `699/manual_allow`，不再返回 `698/auto_hide`。验证命令：`node --check cloudflare/src/index.js`、`git diff --check`、`npm run cloud:check`、`npm run cloud:deploy`、`curl --proxy http://127.0.0.1:7897 -L https://colorful-toilet.colorful-toilet.workers.dev/console/?detail=auto`。
  - 2026-05-02 已按用户判断收窄地点搭讪误伤：`有没有天安门附近的` / `有没有天安门广场附近的` / `有没有北京天安门附近的` 这类明显公共地标玩梗或阴阳怪气句式，不应仅因“有没有 + 附近”直接被本地规则挡下；但 `有万达广场附近的吗`、`有附近的吗`、`找个同城的哥哥`、`有没有天安门附近可约吗` 仍应隐藏。已同步改本地规则和 Worker。
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
    - 2026-05-02 控制台前端已改为“累计方格直达详情页”，当前已部署到公网 Version ID `f66362e3-0f48-46e0-9639-95bf51590205`。来源方格仍集成在 `你的累计成果` 那组 `metric-card` 里，不要单独画新的“屏蔽来源入口”。点击可查看方格后直接跳到 `/console/?detail=...`，不再要求用户展开底部折叠区。详情页显示分类、条数、具体记录和恢复入口；`官方广告记录` / `回复审查` 折叠区里的明细已经前端合并到这些方格背后的详情页。来源包括：`AI 智能屏蔽`、`AI 结果复用`、`数据库历史命中`、`公共数据库规则`、`账号黑名单`、`本地规则下沉`、`累计自动整理`、`你手动冲走`、`恢复误判`、`已在主页跳过广告`、`已在回复区跳过广告`。`global_blocklist` 在界面上叫 `账号黑名单`，不要再叫“AI 全局屏蔽”；`reuse_exact_hide` / `reuse_template_hide` / `reuse_account_hide` 归入 `AI 结果复用`，不算新的 AI 调用。当前 dashboard 近期事件还不能稳定区分公共规则和本地规则，前端已保留独立卡片，缺字段时显示待接入/0。
    - 2026-05-02 后续按用户要求，详情页模式不再显示控制台大标题、登录卡片、设备列表和累计方格；进入 `/console/?detail=...` 时第一屏只显示当前方格背后的明细内容和返回按钮。已部署到公网 Version ID `f66362e3-0f48-46e0-9639-95bf51590205`，并验证 `/console/?detail=ai_hide` 可打开。
    - 2026-05-02 已查验开发者账号 `已接入设备` 显示过多的原因：线上 dashboard 返回 6 个底层 `device_id`，其中包含 `device_eval_*` / `device_dev_gemini_*` 开发测试标识，也有同一台 Mac 在插件重建、重新绑定或本地存储变化后留下的历史连接标识。前端代码已改为只突出“当前这台设备”，其余折叠为历史连接说明；不删除 D1 历史数据，不改 schema。`node --check site/app.js`、`node --check cloudflare/src/index.js`、`npm run cloud:check` 均通过；2026-05-02 用户完成 Cloudflare 登录授权后已部署到公网 Version ID `f66362e3-0f48-46e0-9639-95bf51590205`。
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
  - `BUILD_ID = 2026-05-02-1726`
  - extension manifest version：`0.1.40`
  - App / Extension version：`1.0.40 (41)`
  - 本机安装路径：`/Applications/web2.5.app`
  - Bundle：`com.yourCompany.web25.extension`
  - 2026-05-02 17:31 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1726`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1726`、`flushes=19/18`、`manualButtons=19/18`、`sideButtons=3`、`stage=scan:done`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1726`、`extensionVersion=0.1.40`。
  - 2026-05-02 17:11 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1650`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1650`、`flushes=16`、`manualButtons=16`、`sideButtons=3`、`stage=scan:done`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1650`、`extensionVersion=0.1.39`。
  - 2026-05-02 16:34 继续按用户纠正补强并已发布公网：`梦萱/孟轩`本身不是问题，问题是 `🌸无线线下🌸`、`🌸无常线下🌸`、`🌸无偿线下🌸` 这种昵称绕写搭配随机数字 handle 和数字表情低信息回复。现在三种绕写都会被本地识别为风险昵称，也会进入云端 Worker 同构规则；回归样本仍确认 `有没有天安门附近的`、`附近有家面馆不错` 放过。线上 Worker Version ID：`71fc1d62-7185-4e64-9019-e6f10ab3bf45`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1633`、`extensionVersion=0.1.37`。线上 AI 设置测试样本 `孟轩🌸无常线下🌸 @MullerChri42258 / 2🙃😍🧡` 返回 `action=hide`、`confidence=high`、`model=deepseek-v4-flash`、标签 `meaningless_bait`。
  - 2026-05-02 16:23 已补截图漏网规则：`梦萱🌸无线线下🌸 @MullerChri42258` 发 `2🙃😍🧡` 这类“线下绕写昵称 + 随机数字 handle + 数字表情低信息回复”现在会进入低信息诱导账号规则。本地和 Worker 同步改了 `无线/无限 + 线下` 显示名绕写、`🌸` 招揽昵称装饰识别。回归样本：`有没有天安门附近的`、`附近有家面馆不错` 仍放过。
  - 2026-05-02 16:35 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1633`，签名验证通过，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1633`、`flushes=7/16`、`sideButtons=3`、`stage=scan:done`。
  - 2026-05-02 15:41 用户真实检查发现 `冲走` 按钮没有默认出现。已把 `回复下方显示“冲走”` 改为默认开启，并对旧安装做一次自动迁移；用户以后主动关闭时仍保存选择。`scripts/verify-safari-extension-live.sh` 已加严：详情页有回复但没有可见 `冲走` 时直接失败，不能再只因 `BUILD_ID` 正确就放过。
  - 2026-05-02 15:45 已替换本机 App；签名验证通过；真实 Safari 详情页 `https://x.com/InfiCheesy/status/2050247194150945201` 返回 `build=2026-05-02-1541`、`detail=1`、`marking=1`、`manualButtons=8`、`flushes=8`、`sideButtons=3`、`stage=scan:done`。
  - 2026-05-02 13:59 用户准备换新 AI 前已复查插件：`BUILD_ID=2026-05-02-1307`，`codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app` 通过，`pluginkit -e use -i com.yourCompany.web25.extension` 通过，`npm run safari:verify-live` 通过。真实 Safari 页面 `https://x.com/home` 返回 `build=2026-05-02-1307`。当前没有发现插件失效。
  - 2026-05-02 13:07 已替换本机 App；`codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app` 通过；`npm run safari:verify-live` 通过。真实 Safari 页面结果：`https://x.com/home` 加载 `BUILD_ID=2026-05-02-1307`。
  - 2026-05-02 12:28 已替换本机 App；`codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app` 通过；`npm run safari:verify-live` 通过。真实 Safari 页面结果：`https://x.com/home` 加载 `BUILD_ID=2026-05-02-1222`，右栏关闭按钮曾返回 3 个可见按钮；后续页面重载时 X 侧栏可能暂未渲染，脚本仍确认 build 注入成功。

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

当前用户明确说，下一位 AI 主要要继续调试“AI 数据库、AI 审核本身、API 调度之间的关系”。这件事可以继续做，但不要重设计主页和控制台，用户已经认可当前主页和控制台形态。

第一优先级：把 AI 审核链路跑清楚

- 先确认插件不是每条回复都调用 AI：本地 `buildReplyAiModerationCandidate` 必须只把强风险或弱风险组合送进队列。
- 再确认云端优先查 `reply_ai_memory`：命中记忆时归入 `AI 学习库屏蔽`，不再花 API 钱。
- 只有记忆没命中、又是可疑候选时，才进入真实模型调用。
- AI 直接高置信隐藏写入 `reply_ai_results`，再写入 `moderation_sample_labels`，并沉淀到 `reply_ai_memory`。
- 用户点 `恢复误判` / `恢复这条` 后，应写入 `manual_allow`，停用对应 AI 记忆，并把旧隐藏从当前统计和当前明细里移走。

第二优先级：调 API 调度和省钱策略

- 先用控制台“测试一次 AI 接入”确认 Key、接口地址、模型名可用；这一步只测 API，不写真实回复审核表。
- 真实 X 页面调试时，只拿少量自然遇到的边界样本跑，不要大批量乱刷 API。
- 观察每条样本最后落到哪一层：本地规则直接下沉、AI 直接屏蔽、AI 学习库复用、用户手动冲走、用户恢复。
- 如果调用量异常，先查扩展队列和云端记忆命中，不要先改提示词。
- 如果误判异常，先查 AI 输入证据和提示词边界，不要把 `manual_allow` 当成公共放行规则。

第三优先级：数据安全和真实验收

- D1 是生产数据；动 schema、清理、迁移、批量写入前必须备份。
- `manual_hide/冲走` 是垃圾候选，不等于公共规则。
- `manual_allow/恢复` 是抑制和纠错，不是反向训练成“用户喜欢”。
- 单用户重复冲走不能自动升级公共规则；公共升级需要多贡献者或开发者确认。
- 每次调试后跑 `npm run cloud:audit-data-layer`，确认个人统计和公共规则仍然分层。

第四优先级：普通用户登录闭环

- 接正式邮件验证码发送
- 普通用户登录后能看自己的统计和偏好
- 开发者模式与普通用户模式保持隔离

第五优先级：完整人工验收

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

> 你现在在 `/Users/boriszhang/Documents/Codex/project 1` 继续接手。先读 `AGENTS.md`、`docs/next-thread-handoff.md`、`docs/current-stable-filter-state.md`、`docs/current-stable-ui-state.md`、`docs/moderation-database-training-plan.md`、`docs/ai-api-provider-handoff.md`，然后跑 `git status --branch --short`。用户没有计算机基础，只听人话，默认要自己完成检查、修改、测试、提交、推送、部署、本机 App 更新和验证。当前 X / Safari 插件主链路稳定，`BUILD_ID=2026-05-02-1307`，冲走、自动下沉、恢复、蓝框、广告跳过、右栏关闭、名字屏蔽和数据库同步都不能改坏。下一步重点是调试 AI 数据库、AI 审核和 API 调度的关系：不要让每条回复都调用 AI；优先复用 `reply_ai_memory`；只有可疑候选才走真实模型；AI 判断和用户反馈先进入 `moderation_samples` / `moderation_sample_labels`，不要把单用户冲走直接变公共规则。Cloudflare D1 是生产数据，动 schema、清理、迁移或批量写入前必须备份。

## 12. 维护这份文件的规则

每次完成重要改动后，检查这份文件是否需要更新。

更新原则：

- 保持短、准、可执行
- 删除过时数字，不把历史计数写成实时状态
- 当前版本锚点要及时更新
- 新增高风险规则要写清楚原因
- 不要把聊天流水账搬进来
