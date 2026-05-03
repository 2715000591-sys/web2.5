# AI API 接入交接文档

最后整理日期：2026-05-03

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
- 2026-05-01 已继续收紧扩展侧 AI 排队：如果本地/数据库规则已经能直接隐藏，例如 `找个同城的哥哥` 这类 `pattern:geo-relationship-bait`，原来不再送 AI，避免为模板垃圾浪费 API 额度。
- 2026-05-03 已按用户新要求把 AI 老师强度开大两次：数据库已命中的高风险候选现在可以带 `teacher_review_requested`，云端老师复核预算先从每批 0 提到 4，随后提高到每批 8；本地批量上限 12、发送等待 650ms、最小间隔 750ms、基础候选分 1、老师复核分 3。普通回复仍不全量进 AI，已有数据库规则仍先挡住明显垃圾。
- 2026-05-03 用户进一步强调：AI 参与强度可以更大，尤其早期训练数据库时不能主要靠用户手动冲走。当前代码已提高高风险候选、数据库命中候选、头像/图片证据候选、重复新模式候选的 AI 老师复核比例，让 AI 判断更主动写入标注、记忆和候选规则。
- 2026-05-03 10:05 已把新一批短口号漏网样本补进基础层和 AI 提示词例子：`浅交不如深知己`、`高质量交友贵在合拍`、`品行相近方同行`、`拒绝无效的寒暄` 走 `pattern:poetic-slogan-lure-account`；`有没有单身哥哥` 走 `pattern:geo-relationship-bait`。公网探针确认命中数据库规则，不调用外接 AI，不写数据库。
- 2026-05-03 11:21 已补另一类真实漏网：埃及象形符号壳 + 空洞交友口号 + 随机数字 handle。重点不是“AI 扫描次数不够”，而是旧证据类型没有覆盖；现在 `灵魂/共鸣/同频/知音/三观` 等词和 `\u{13000}-\u{1342F}` 装饰壳已进入本地/Worker 同构识别。后续遇到类似截图，先判断 AI 是否拿到了足够证据，再决定是否需要老师复核或小范围规则。
- 2026-05-03 11:40 已补 `寻男大固泡 + emoji-only` 漏网：这是风险昵称缩写和 emoji alt 取证缺口，不是扫描次数问题。现在本地会把 tweetText 里的 emoji 图片 alt 拼进正文，Worker 和 AI prompt 也认识 `寻男大固泡` 这类昵称证据。
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
- Worker Version ID：`b6a95ac2-1b2a-49e4-9ec8-9d5fd699e726`
- 当前线上版本包含“测试一次 AI 接入”入口、DeepSeek JSON 标签提示补强、扩展侧 AI 排队保护、保存 AI 设置时不再误清空已有 Key 的修复、2026-05-03 上线并加大的 AI 老师抽查数据库命中机制，以及 2026-05-03 10:05 / 11:21 / 11:40 补入的短口号、埃及符号壳、`寻男大固泡` 低信息诱饵证据类型。

## 3. 还没完成

- DeepSeek API Key 已重新加密保存，并已通过临时引流 hide / 正常成人讨论 allow 两条测试；2026-05-03 已用开发者探针验证数据库命中时也能追加调用 DeepSeek 老师复核。后续仍应继续用自然遇到的真实 X 样本观察误判和漏网。
- 已产生少量测试调用消耗；2026-05-01 的 6 条小样本批量测试约消耗 `2805` token。
- 2026-05-01 的 4 条成人内容边界临时测试也产生少量调用消耗，但没有写入真实回复审核数据表。
- 已用真实 X 详情页做过回复审核验收：`https://x.com/YLDLZN/status/2050723821460853237` 在 `BUILD_ID=2026-05-03-1138` 下返回 `stage=scan:done`，`孙甜甜寻男大固泡 @MonaKristi9125` 对应行已隐藏；`https://x.com/Sizhe_bitcat/status/2050555799991468314` 在 `BUILD_ID=2026-05-03-1117` 下也验证过截图同类关键词和账号在可见回复中没有匹配项。
- 还没有确定 DeepSeek 长期是否最稳；目前先用便宜的 `deepseek-v4-flash`。

这不是功能坏了，而是下一步要去真实 X 页面看边界垃圾回复是否能被 AI 辅助层压住。

2026-05-02 已完成数据库回填和 AI 记忆库整理：线上 `moderation_samples=1220`、`moderation_sample_labels=1226`、`reply_ai_memory active=84`。这说明数据库学习库已经有内容。下一步不是继续盲目回填，而是看真实页面里每条可疑回复最终走的是哪一层。

2026-05-02 15:24 已进一步上线数据库接管层：线上 `moderation_rule_candidates active=222`、`candidate=64`。现在云端收到可疑回复后，会先查 `reply_ai_memory`，再查 `moderation_rule_candidates`；命中时返回 `db_rule_*` 并直接隐藏，不再调用外部 AI。已验证 `找个同城弟弟` 命中 `db_rule_pattern`，测试 item `1097/1098` 的新外部 AI 调用数为 `0`。后续看真实页面时，重点区分 `decisionLayer=ai`（真实模型调用）、`ai_memory_*`（AI 记忆复用）、`db_rule_*`（数据库候选规则接管）。

2026-05-03 09:39 已调整为“数据库先挡住，AI 老师再抽查”。数据库命中不再绝对代表外接 AI 不运行；如果插件给候选打上 `teacher_review_requested`，Worker 会在每批最多 4 条的上限内追加调用 DeepSeek。线上样本 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 命中 `pattern:geo-relationship-bait`，同时真实调用 DeepSeek，最终 `Final layer: ai / ready / hide / high`。开发者探针默认不写数据库。

2026-05-03 用户指出这个强度仍可能偏低：如果 AI 不多参与，训练数据库就会变成用户本人手动训练，效率太低。下一步改 AI 调度时，应优先考虑提高“老师复核率”和“可疑新样本入 AI 率”，尤其是高风险账号画像、头像/图片证据、数据库命中但需要抽查、新出现的重复模板、低信息 emoji 口号等候选。要继续避免普通正常内容全量进 AI。

2026-05-03 10:46 已按用户明确要求继续提高代码里的 AI 介入强度：本地候选批量上限 12，发送等待 650ms，最小间隔 750ms，基础候选分 1，老师复核分 3；但随机数字 handle 不能单独让普通长回复进 AI，仍需要短/薄/诱导/模板/emoji/上下文等风险证据。云端数据库命中后的老师复核预算提高到每批 8 条，头像取证、风险昵称、关系诱导和垃圾模板证据也能触发老师复核。线上探针 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 带老师复核标记时命中 `pattern:geo-relationship-bait`，同时真实调用 DeepSeek，最终 `Final layer: ai / ready / hide / high`；开发者探针不写数据库。

2026-05-03 10:05 已补用户新截图短口号：`高质量交友贵在合拍 🌟✂️🌟🎁` 命中 `pattern:poetic-slogan-lure-account`，`有没有单身哥哥✨🤤🫶Oa` 命中 `pattern:geo-relationship-bait`，两条公网探针均为 `db_rule_pattern / ready / hide / high`、`External AI: not needed`、`Database writes: no`。这类已知模板由数据库接住即可，不需要每次交给外接 AI。

2026-05-03 用户纠正：类似截图不应默认理解成“把这些字写进插件规则”，而应优先理解成“请优化 AI 设置和证据输入，让 AI 分清正常表达与垃圾引流”。后续如果用户发漏网图，先讨论和诊断：AI 是否拿到了头像、图片、批量相邻、主帖上下文、显示名、handle、主页线索；如果没拿到，优先补证据输入和老师复核策略。只有用户明确要求立刻修复线上漏网，或模式已经稳定且误伤边界清楚，才固化成本地/Worker 规则。

2026-05-03 11:21 已确认一类“看起来 AI 应该懂、但线上没挡住”的真正原因：插件已扫完页面，但传给规则/AI 的正文不是截图里彩色 emoji 版本，而是埃及象形符号壳包着空洞交友词。以后排查这种问题，先从真实 DOM 文本和证据卡入手，不要只按截图观感判断。当前已把这类证据类型加入基础层；若后续要让 DeepSeek 直接看头像里的 `全国安排/全国可飞`，仍要先确认当前模型和接口是否支持图片。

2026-05-03 11:40 另一类 DOM 取证教训：X 会把 emoji 正文放在图片 `alt` 里，`innerText` 可能只剩昵称、handle、时间和计数。回复正文采集必须优先从 tweetText 节点递归收集文字节点和图片 alt，否则 AI / 数据库会少看到“纯 emoji 噪音”这个关键证据。

2026-05-02 17:11 已追加验证用户指出的风险昵称场景：`孟轩🌸无常线下🌸 @MullerChri42258 / 2🙃😍🧡` 命中 `db_rule_pattern`，`model=moderation-rule-candidates-2026-05-02-v1`，不是 `deepseek-v4-flash`。这说明它走数据库候选规则接管，没有进入外部 AI 调用。测试 item 为 `1099`。

2026-05-02 17:31 用户截图里的 7 条漏网样本已全部验证为数据库接管：`比她好看的没她强...@designksh1/@xiaonm88`、`刷了半天的X...主页能打✈️...@designksh1/@xiaonm88`、`线下我就日过这个骚货 @designksh1`、`免费破处` 风险昵称发 `十🙈` 均返回 `db_rule_pattern` 或 `db_rule_template`，`model=moderation-rule-candidates-2026-05-02-v1`。这批样本不再调用外部 AI。测试 item 为 `1100`-`1106`。

2026-05-02 17:56 已修复回复区 AI 提示词缺口：之前控制台保存的补充审核要求只加到了主页时间线 AI prompt，回复区 AI prompt 没有追加 `settings.moderationPrompt`，所以用户补充口径可能没有真正喂给外接模型。现在回复区 AI prompt 会同时包含默认规则、中文垃圾昵称示例和控制台补充审核要求。同步新增中文风险昵称样例：`每晚准时大秀`、`今晚准时涩播/色播`、`找固定泡友/炮友`、`蹲一个弟弟/哥哥`、`免费破处`、`无偿线下`、`看我主页`、`附近真实约见`；这些昵称搭配数字/emoji 极薄回复和随机数字 handle 应隐藏。2026-05-02 18:06 用户完成 Cloudflare 重新登录后已部署到公网 Worker Version ID `13ae7164-3096-4169-a3d9-2706b97cfc42`，外接 API 的回复区提示词修复已在线上生效。

2026-05-02 19:29 已修复手动反馈进入数据库候选的实时刷新缺口：`manual_hide` / `manual_allow` 原本会写入 `moderation_samples` 和 `moderation_sample_labels`，但刷新 `moderation_rule_candidates` 时误用了 AI 决策变量，导致这一步被保护性捕获后没有实时生效。现在用户冲走或恢复后会刷新对应候选；AI 高置信隐藏继续写入 `reply_ai_memory`，数据库候选规则仍只在 AI 高置信、多人共识或开发者确认时活跃，避免单用户误伤。已部署公网 Worker Version ID `8480bcdf-8a69-45e8-8aa9-a981f41d7f2c`，并重新整理候选规则：备份 `backups/d1/web25-2026-05-02T11-34-30-329Z-before-rule-candidates.sql`，结果 `active=223`、`candidate=66`。

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

2026-05-03 追加用户口径：如果头像或图片里有 `全国安排`、`全国可飞` 这类明显招嫖/引流文字，并且当前 DeepSeek 模型/接口能识别图片，就应该让 AI 直接看图并据此隐藏高风险候选，而不是等这类账号继续发出来。修改前要先实测当前模型是否支持图片；不支持时先说明，再考虑 OCR 或视觉模型方案。

2026-05-02 19:12 已补 `月固定` 和 `找个温柔的哥哥` 漏网。外接 AI prompt 里也应理解：`月固定/周固定/长期固定` 是强风险昵称；`找/求/蹲 + 温柔/固定/长期/月固定/帅/乖/可爱/宠人/有钱 + 哥哥/姐姐/弟弟/妹妹` 是关系诱导模板，不能只当普通“找人聊天”。

2026-05-02 21:24 已补本地插件发给云端的数据库候选键：`geo-relationship-bait` 和 `poetic-slogan-lure-account` 现在本地、Worker 两边同名。后续调试“为什么数据库没有挡住”时，先确认样本的 `patternTextKey` / Worker `patternKey` 是否同构，再判断是不是需要外接 AI 或提示词调整。

2026-05-03 10:05 后续遇到“全国安排头像 + 随机英文数字号 + 短口号/emoji”新变体时，先看正文是否属于已知短口号模板，或是否应扩充 `pattern:poetic-slogan-lure-account`。这次漏网的直接原因是旧模板不认识 `浅交不如深知己`、`高质量交友贵在合拍`、`品行相近方同行`、`拒绝无效的寒暄`，且 X 没给原帖正文时上下文脱节加分不可用。2026-05-03 11:21 又补充：如果真实 DOM 里出现 `\u{13000}-\u{1342F}` 这类埃及符号壳，优先检查 `decorative-slogan-from-suspicious-handle` 是否命中，而不是怀疑扫描次数上限。

2026-05-02 21:51 用户截图里的 `是不是这个? + pan.quark.cn/s/...` 漏网不是外接 AI 看不懂中文，而是基础层 `share-link-scam` 缺少“短引诱句 + 网盘链接”这一类提示词。已同步补本地插件和 Worker：`是不是这个 / 是这个吗 / 就是这个 / 这个链接 + 网盘链接` 会优先被基础层挡住，普通没有网盘链接的“是不是这个问题”仍放过。后续遇到同类问题，先看基础层和 `pattern:share-link-scam` 是否命中，再决定是否需要外接 AI。

2026-05-02 22:43 已新增“回复 AI 路线探针”，方便下一轮直接看一条样本会不会花外接 AI 额度。命令：`npm run cloud:probe-reply-ai -- --text "样本文字" --display-name "昵称" --handle "账号"`。默认只读检查，不写真实审核记录、不调用外接 AI；输出里的 `Final layer` 如果是 `db_rule_*` 或 `ai_memory_*`，说明数据库/记忆库已经接住；如果是 `external_ai_would_run`，才代表下一步会交给外接 AI。线上默认样本已验证为 `Final layer: db_rule_pattern`、`External AI: not needed`、`Database writes: no`。需要真实调用时才加 `-- --call-provider`，这会消耗少量 API 额度。

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

如果改动扩展侧 AI 调度、候选过滤、页面采集或 BUILD_ID，需要重建并替换本机 Safari App。2026-05-03 已替换 `/Applications/web2.5.app` 到 `BUILD_ID = 2026-05-03-1138`。

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
- 记忆未命中，再查 `moderation_rule_candidates`；命中会先返回 `db_rule_*` 作为兜底隐藏。2026-05-03 起，如果该候选带 `teacher_review_requested`，云端可在每批最多 4 条的上限内追加调用 AI 老师复核。
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
