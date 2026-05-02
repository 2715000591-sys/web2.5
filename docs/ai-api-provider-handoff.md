# AI API 接入交接文档

最后整理日期：2026-05-02

这份文档给下一任 Codex / 开发助手看。用户没有编程基础，解释时必须先说大白话结论，不要让用户判断接口、模型参数、部署、命令输出。

2026-05-01 用户已明确 API 已经提供。下一轮不要再默认让用户重新购买 API；先检查线上控制台里已保存的加密配置和真实测试结果。只有线上配置丢失、Key 失效、额度不足，或用户主动要换平台时，才让用户补新的 Key / 接口地址 / 模型名字。

2026-05-02 用户准备让下一位 AI 重点调试：AI 数据库、AI 审核本身、API 调度之间的关系。下一位不要先重做 UI，也不要先让用户重买 API。先确认现有 DeepSeek 设置仍可用，再用少量真实 X 样本检查“本地候选筛选 -> 云端记忆复用 -> 必要时调用模型 -> 写回样本和记忆”的链路。

2026-05-01 后续排查发现：线上 DeepSeek 配置的接口地址和模型还在，但 API Key 已被一次普通保存误清空。原因是 Worker 接口把“请求里没有带 apiKey”错误当成“清空 apiKey”。已修复并部署到 Worker Version ID `8039945b-87ba-4a4c-8eca-775775e9b7fa`：以后保存开关、模型或提示词时，如果没有提交新的 Key，会保留原来的加密 Key。

2026-05-01 用户重新提供 DeepSeek Key，已通过线上 `/api/ai-settings` 加密保存到开发者账号；只记录后四位 `a6db`，不要把完整 Key 写入代码、文档、命令、日志或 GitHub。随后已复测一次“不带 apiKey 的普通保存”，返回 `preservedAfterEmptySave=true`，并只读确认远程 D1 里 `api_key_last4=a6db`、加密内容长度非 0。

2026-05-01 已用线上已保存 Key 做两条临时测试，都会消耗少量额度，但不会写入 `reply_ai_items`：

- 引流样本：`主页置顶看联系方式，同城哥哥私聊，今晚可约。` 返回 `ready / hide / high`，标签包含 `adult_solicitation`、`lead_gen_spam`、`contact_redirect`。
- 正常成人治理讨论样本：`成人内容的分级和平台治理...不能只靠色情关键词一刀切` 返回 `ready / allow / low`。

当前补充提示词已保存到线上账号：色情内容本身允许；只屏蔽色情引流、约见导流、联系方式导流、主页/置顶/简介诱导、空洞低信息诱饵、诈骗、木马、安装包、资源包和不安全外链。提示词包文件在 `docs/ai-prompt-packs/sexual-leadgen-foundation/`。

## 1. 当前结论

现在已经不是只能接 DeepSeek。

截至 2026-05-01，线上 Worker 已经支持通用大模型兼容接入。开发者账号已经重新接入 DeepSeek：

- 兼容接口地址：`https://api.deepseek.com`
- 模型：`deepseek-v4-flash`
- API Key：已加密保存，控制台只应显示后四位 `a6db`

系统会自动尝试多种常见返回格式。大多数写着“兼容 OpenAI 接口”的平台，理论上都可以先试，不需要再为每个平台单独写死。

如果某个平台仍然失败，再按失败原因补单独适配。

## 2. 已经完成

- Cloudflare Worker 已部署通用大模型兼容适配。
- 官网控制台的 AI 配置文案已经改成通用说法，不再只提示 DeepSeek。
- 官网控制台的 AI 配置区已新增“测试一次 AI 接入”按钮。它会先保存设置，再发一条小样本测试 Key、接口地址、模型名是否能真实调用；只有用户手动点击才会消耗少量额度。
- DeepSeek `deepseek-v4-flash` 已重新接入线上开发者账号，Key 已加密保存，后四位 `a6db`。
- 回复区 AI 默认提示词已进一步收紧：成人/色情内容本身允许；证据不足时放过；普通短句不能只因短就隐藏；`meaningless_bait` 必须有风险账号或导流证据支撑。
- 已补强通用 JSON 模式提示：当平台不支持严格 JSON Schema、只能走普通 JSON 对象模式时，Worker 会把允许使用的审核标签明确写进提示里，避免模型自造标签。
- 2026-05-01 已修复扩展侧 AI 排队保护：本地规则必须先判定为可疑候选，回复才会送入 AI 队列，避免无脑调用模型。
- 2026-05-01 已继续收紧扩展侧 AI 排队：如果本地/数据库规则已经能直接隐藏，例如 `找个同城的哥哥` 这类 `pattern:geo-relationship-bait`，就不再送 AI，避免为模板垃圾浪费 API 额度。
- 2026-05-01 已收紧基础审核口径：正常成人话题、色情讨论、性教育/平台治理讨论不应仅因色情词被隐藏；基础层要保护正常表达，只隐藏诈骗、约见引流、联系方式、木马/安装包、主页诱导、空洞钓鱼，以及由名字、handle、主页简介、主页外链等账号证据支撑的低信息垃圾。头像/图片只有在未来真的采集并提供给 AI 时才能作为辅助证据，不能让模型凭空脑补。
- 官网控制台“最近 AI 隐藏记录”已新增“恢复误判”。恢复会写入 `manual_allow`，并把对应 AI 结果改成 `manual_allow/allow`，用于纠正单条误判。
- `/api/ai-settings/test` 已支持传入临时 `sample` 做一次性识别测试；样本不会写入 `reply_ai_items`。
- 已做 6 条小样本识别测试，结果全部符合预期；本轮测试约消耗 2805 token。
- 2026-05-01 又做了 4 条成人内容边界小样本真实调用测试：2 条正常成人/色情讨论放过，2 条约见联系方式导流/资源安装包风险隐藏。
- 官网下载包已经重新生成并上传到 Cloudflare。
- 已确认公网首页、控制台、下载清单和下载包可以直接访问，不依赖本地部署。
- GitHub 当前分支已推送。
- 线上数据分层审计已通过。
- Worker 已确认配置 `USER_AI_SETTINGS_SECRET`，可以加密保存用户提供的 API Key。

线上锚点：

- 站点：`https://colorful-toilet.colorful-toilet.workers.dev/`
- 控制台：`https://colorful-toilet.colorful-toilet.workers.dev/console/`
- Worker Version ID：`3d44a89e-52c4-477c-967f-47eed7d72a6c`
- Git commit：当前分支最新提交包含“测试一次 AI 接入”入口、DeepSeek JSON 标签提示补强、扩展侧 AI 排队保护，以及保存 AI 设置时不再误清空已有 Key 的修复

## 3. 还没完成

- DeepSeek API Key 已重新加密保存，并已通过临时引流 hide / 正常成人讨论 allow 两条测试；还需要用真实 X 回复做页面级验收。
- 已产生少量测试调用消耗；2026-05-01 的 6 条小样本批量测试约消耗 `2805` token。
- 2026-05-01 的 4 条成人内容边界临时测试也产生少量调用消耗，但没有写入真实回复审核数据表。
- 还没有做真实 X 页面回复审核验收。
- 还没有确定 DeepSeek 长期是否最稳；目前先用便宜的 `deepseek-v4-flash`。

这不是功能坏了，而是下一步要去真实 X 页面看边界垃圾回复是否能被 AI 辅助层压住。

2026-05-02 已完成数据库回填和 AI 记忆库整理：线上 `moderation_samples=1220`、`moderation_sample_labels=1226`、`reply_ai_memory active=84`。这说明数据库学习库已经有内容。下一步不是继续盲目回填，而是看真实页面里每条可疑回复最终走的是哪一层。

2026-05-02 15:24 已进一步上线数据库接管层：线上 `moderation_rule_candidates active=222`、`candidate=64`。现在云端收到可疑回复后，会先查 `reply_ai_memory`，再查 `moderation_rule_candidates`；命中时返回 `db_rule_*` 并直接隐藏，不再调用外部 AI。已验证 `找个同城弟弟` 命中 `db_rule_pattern`，测试 item `1097/1098` 的新外部 AI 调用数为 `0`。后续看真实页面时，重点区分 `decisionLayer=ai`（真实模型调用）、`ai_memory_*`（AI 记忆复用）、`db_rule_*`（数据库候选规则接管）。

2026-05-02 17:11 已追加验证用户指出的风险昵称场景：`孟轩🌸无常线下🌸 @MullerChri42258 / 2🙃😍🧡` 命中 `db_rule_pattern`，`model=moderation-rule-candidates-2026-05-02-v1`，不是 `deepseek-v4-flash`。这说明它走数据库候选规则接管，没有进入外部 AI 调用。测试 item 为 `1099`。

2026-05-02 17:31 用户截图里的 7 条漏网样本已全部验证为数据库接管：`比她好看的没她强...@designksh1/@xiaonm88`、`刷了半天的X...主页能打✈️...@designksh1/@xiaonm88`、`线下我就日过这个骚货 @designksh1`、`免费破处` 风险昵称发 `十🙈` 均返回 `db_rule_pattern` 或 `db_rule_template`，`model=moderation-rule-candidates-2026-05-02-v1`。这批样本不再调用外部 AI。测试 item 为 `1100`-`1106`。

2026-05-02 17:56 已修复回复区 AI 提示词缺口：之前控制台保存的补充审核要求只加到了主页时间线 AI prompt，回复区 AI prompt 没有追加 `settings.moderationPrompt`，所以用户补充口径可能没有真正喂给外接模型。现在回复区 AI prompt 会同时包含默认规则、中文垃圾昵称示例和控制台补充审核要求。同步新增中文风险昵称样例：`每晚准时大秀`、`今晚准时涩播/色播`、`找固定泡友/炮友`、`蹲一个弟弟/哥哥`、`免费破处`、`无偿线下`、`看我主页`、`附近真实约见`；这些昵称搭配数字/emoji 极薄回复和随机数字 handle 应隐藏。2026-05-02 18:06 用户完成 Cloudflare 重新登录后已部署到公网 Worker Version ID `13ae7164-3096-4169-a3d9-2706b97cfc42`，外接 API 的回复区提示词修复已在线上生效。

## 4. 用户去买 API 时怎么说

只有用户还没有 API，或者明确要换一个新平台时，才这样说：

> 你去找一个支持“兼容 OpenAI 接口”的大模型 API，先少量充值。拿到 API Key、接口地址、模型名字这三样给我，我来接、测、上线。

不要让用户研究什么 `/chat/completions`、JSON schema、Responses API。

## 5. 推荐先买什么

优先选择写明“兼容 OpenAI 接口”的平台，因为接入最快。

可以优先考虑：

- DeepSeek
- 通义千问 / 阿里云百炼
- 火山方舟 / 豆包
- 月之暗面 / Kimi
- OpenRouter 这类聚合平台

选择标准：

- 便宜
- 支持中文
- 支持普通文本对话
- 文档里写着兼容 OpenAI
- 可以小额充值或有免费额度

不要一开始大额充值。先用少量额度跑通真实验收。

## 6. 下一任接到 API 后要做什么

1. 不要把 API Key 写进代码或文档。
2. 先打开线上控制台：`https://colorful-toilet.colorful-toilet.workers.dev/console/`
3. 登录开发者账号。
4. 先确认现有 AI 设置是否已经保存；如果已经保存并且 Key 后四位正常，就不要让用户重复提供。若页面显示“当前账号还没有保存共享 AI Key”，按当前状态就是 Key 已空，需要用户重新填一次。
5. 如果需要重新配置，在 AI 设置里填：
   - API Key
   - 兼容接口地址
   - 模型名字
6. 保存后确认控制台显示已保存 Key 后四位。
7. 在控制台点“测试一次 AI 接入”。这一步会消耗很少量 API 额度，只用来确认 Key、接口地址和模型名真的能调用。
8. 测试通过后，打开插件里的“回复区 AI 审核”开关。
9. 刷新 X 详情页。
10. 找边界垃圾回复做真实测试。
11. 确认 AI 隐藏记录出现在控制台。

如果第一次失败，不要立刻改筛选规则。先看失败是不是 API 平台不兼容、Key 无效、额度不足、接口地址填错、模型名填错。

2026-05-02 18:22 已确认一个重要口径：外接 AI 不是“看不懂中文”，而是回复区 API 往往只收到单条文字、作者名和 handle，看不到截图里的头像文字、整屏批量重复、排序相邻等视觉上下文。已把 `烟火暖了相逢`、`人海有幸擦肩`、`缘分引线人海逢`、`遇见温柔满人间`、`旧城偶遇故人`、`晚风撞我相逢`、`一念恰好相逢` 这类“随机英文数字账号 + 诗句式空洞模板 + emoji”的批量诱饵例子写进回复区 AI prompt，并同步成本地/Worker 基础规则。以后遇到类似“GPT 能看出来但 API 放过”的情况，先检查传给 API 的证据是否包含显示名、handle、正文、上下文簇和用户补充提示词。

2026-05-02 18:46 已把回复区 AI 输入改成更接近“截图验收”的证据卡：每条候选会包含回复文字、显示名、@用户名、主贴文字、主页简介、主页外链和主页风险标签。若回复像随机诗句/空洞话术、与主贴上下文脱节、且账号 handle 可疑，插件还会附加头像图片地址、头像 alt 文本和 `avatar_vision_requested`。后台会把这类头像证据项拆成单条 AI 判断；如果当前外接模型/接口支持图片输入，头像会作为图片证据传入。如果模型不支持图片，AI 仍能看到头像 URL 和“需要头像证据”的标签，但不能凭空读取头像文字。

2026-05-02 19:12 已补 `月固定` 和 `找个温柔的哥哥` 漏网。外接 AI prompt 里也应理解：`月固定/周固定/长期固定` 是强风险昵称；`找/求/蹲 + 温柔/固定/长期/月固定/帅/乖/可爱/宠人/有钱 + 哥哥/姐姐/弟弟/妹妹` 是关系诱导模板，不能只当普通“找人聊天”。

## 7. 验证命令

改代码后至少跑：

```bash
node --check cloudflare/src/index.js
node --check extension/content/rules.js
node --check extension/content/content.js
npm run cloud:check
npm run cloud:audit-data-layer
```

如果需要上线：

```bash
npm run cloud:deploy
```

如果影响 Safari 扩展本地代码，才需要重建和替换 `/Applications/web2.5.app`。

如果改动扩展侧 AI 调度、候选过滤、页面采集或 BUILD_ID，需要重建并替换本机 Safari App。2026-05-01 已替换 `/Applications/web2.5.app` 到 `BUILD_ID = 2026-05-01-2117`。

## 8. 高风险提醒

接 API 属于可能产生费用的动作。

在真实调用前，必须提醒用户：

- 这会消耗 API 额度
- 先小额充值测试
- 不要把 Key 发到公开地方
- 不要把 Key 提交到 GitHub

不要改 `.dev.vars` 里的密钥，不要把密钥写进 `wrangler.jsonc`，不要把密钥写进文档。

## 9. 当前代码位置

主要代码：

- `cloudflare/src/index.js`
- `site/console.html`
- `site/console/index.html`
- `site/app.js`

AI 设置表：

- `cloudflare/schema.sql`
- 表名：`user_ai_settings`

真实回复审核数据：

- `reply_ai_items`
- `reply_ai_results`
- `reply_ai_account_risk`

## 10. 当前适配思路

Worker 现在会自动尝试常见格式：

- 官方 OpenAI 优先走官方格式。
- Google Gemini 的 OpenAI 兼容入口走它能接受的格式。
- 其他兼容平台默认走更通用的聊天格式。
- 如果平台不认某种 JSON 返回方式，会自动换另一种方式再试。
- 如果模型返回的 JSON 外面包了多余文字，Worker 会尽量把 JSON 抽出来。

对用户不要解释这一段，除非用户主动要求。

## 11. 不能改坏的东西

AI 只能作为辅助层，不要替换当前稳定筛选主链路。

必须守住：

- 冲走
- 自动下沉
- 恢复
- 蓝框
- 右栏关闭
- 名字屏蔽
- 公共规则和个人统计隔离

不要因为接 AI，就降低现有规则的安全性。

## 12. 下一步建议

下一任最应该做的是：

1. 先确认现有 DeepSeek 设置仍显示 Key 后四位 `a6db`，不要让用户重复提供 Key。
2. 当前 DeepSeek 小样本测试已经通过，下一步直接用一两条真实 X 回复做小额测试。
3. 对每条真实样本记录它走哪一层：本地规则、AI 学习库、真实 AI 调用、手动冲走、恢复误判。
4. 如果调用量异常，先查扩展候选队列和 `reply_ai_memory` 命中，不要先改提示词。
5. 如果误判异常，先查 AI 输入证据、提示词边界和恢复后的记忆停用，不要把 `manual_allow` 做成公共放行规则。
6. 如果 API 失败，记录具体失败原因，再补单个平台适配或提示词适配。

目标不是炫技接很多平台，而是让用户买到便宜 API 后，真实能跑、不会乱花钱、不会误伤稳定筛选。

## 13. API 调度关系

当前调度原则：

- 插件本地只负责挑可疑候选，不负责把所有内容都送 AI。
- 云端收到候选后，先查 `reply_ai_memory`。
- 记忆命中直接返回结果，控制台归入 `AI 学习库屏蔽`，不消耗外部 API。
- 记忆未命中，再查 `moderation_rule_candidates`；命中返回 `db_rule_*`，也不消耗外部 API。
- 学习库和数据库候选都未命中，才读取用户 AI 设置并调用外部模型 API。
- AI 首次判断写入 `reply_ai_results`。
- AI 判断同时写入 `moderation_sample_labels`，成为训练/评测证据。
- AI 直接高置信隐藏再写入 `reply_ai_memory`，让后续相似内容少调用 API。
- 用户恢复误判会把单条 AI 结果改为放过，并停用对应记忆。
- 用户恢复/开发者撤回还会压制对应候选规则；AI 低置信或中置信放过只降分，不作为硬撤回。

关键代码位置：

- 扩展候选筛选：`extension/content/content.js` 的 `buildReplyAiModerationCandidate`
- 扩展队列发送：`extension/content/content.js` 的 `enqueueReplyAiDecision` / 批量发送逻辑
- 云端接收：`cloudflare/src/index.js` 的 `/api/reply-ai`
- 云端分类：`classifyReplyAiItemEntries`
- 记忆查询：`findReplyAiMemoryDecision`
- 外部模型调用：`requestReplyAiDecisionFromProvider`
- 标注写入：`recordModerationTrainingLabelFromReplyAiDecision`
- 记忆写入：`upsertReplyAiMemoryFromDecision`
- 误判恢复：`markReplyAiItemAllowedByManualRestore` / `deactivateReplyAiMemoryForItem`
