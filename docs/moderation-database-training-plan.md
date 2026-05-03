# 内容审核数据库训练方案

## 核心判断

现阶段不要把数据库理解成“训练好一个模型”，而要理解成：

- 收集真实样本
- 保留用户反馈和审核结论
- 让 AI 首次高置信判断沉淀成可复用记忆
- 给以后 AI 判断、评测、微调提供干净数据

也就是说，AI 先做判断，数据库先做事实层、证据层和 AI 记忆层；不要让旧本地规则反过来教 AI。

## 推荐分层

### 1. 公共基础层

适合处理大多数用户都不想看到的内容：

- 招嫖引流
- 诈骗广告
- 账号导流
- 黑产联系方式
- 高频重复话术
- 已确认的高风险账号或模板

这类内容优先用数据库规则、样本统计、黑名单和模板命中处理，便宜、快、稳定。

### 2. 样本标注层

用户的手动隐藏、恢复、开发者确认、AI 判断都不要直接变成规则。

它们应该先进入样本和标注：

- `moderation_samples` 存原始样本和归一化文本
- `moderation_sample_labels` 存谁在什么时候给了什么判断
- `moderation_rule_candidates` 存从样本里提炼出来的候选规则

只有当候选规则达到足够共识，才升级成全局规则。

### 3. 个人偏好层

个人喜好以后再接 AI 或个性化规则。

例如有人想屏蔽某些话题、某种语气、某类账号风格，这些不应该污染公共规则库。公共规则只处理高共识垃圾内容，个人偏好保留在用户自己的设置和 AI 判断里。

## 新增数据表用途

### `moderation_samples`

公共样本库。它不是最终结论，而是内容事实。

适合存：

- 回复文本
- 原帖上下文
- 作者 handle / 显示名
- 归一化文本
- 规则特征键
- 样本来源
- 是否允许进入共享贡献池

关键字段：

- `sample_fingerprint`：去重键
- `contribution_scope`：`private` / `public`
- `quality_status`：`pending` / `trusted` / `rejected` / `quarantined`
- `feature_keys_json`：以后从规则引擎提取的特征

### `moderation_sample_labels`

标注记录。每一次用户反馈、开发者审核、AI 判断都可以成为一条 label。

适合存：

- 用户说“该隐藏”
- 用户说“不该隐藏”
- 开发者确认
- AI 判断结果
- 模型版本和原始响应

关键字段：

- `decision`：`hide` / `allow` / `review` / `unknown`
- `label_source`：`user_feedback` / `developer_review` / `ai` / `rule`
- `trust_weight`：不同来源权重不同，防止恶意投毒
- `safety_labels_json`：违规类别，比如 `adult_solicitation`、`lead_gen_spam`、`contact_redirect`

重要口径：

- `manual_hide` / `冲走` 可以作为垃圾候选样本。
- `manual_allow` / `恢复` 只能表示“这条不该继续按垃圾处理”或“这条不是当前规则要压的垃圾”。
- 当前有效库必须听 `manual_allow`：同一用户或同一同步身份下，同一条回复后续被恢复后，旧的 `auto_hide` / `manual_hide` / 广告隐藏事件只能留作历史，不再算当前屏蔽、当前统计、当前明细或待上传规则候选。
- 控制台里恢复 AI 隐藏记录时，也只把对应单条 `reply_ai_results` 改成 `manual_allow/allow`，用于纠正这一条误判和短期复用放过结果；不要把它升级成广泛反向训练或公共放行规则。
- `manual_allow` 不能被粗暴当成“反向垃圾样本”去训练模型，也不能自动代表用户喜欢这类内容。
- 在候选规则里，`negative_label_count` 的含义是“抑制/撤销/不应升级为公共垃圾规则的证据”，不是另一个内容类别的正样本。

### `moderation_rule_candidates`

候选规则表。它承接“很多样本都指向同一个模式”这件事。

适合存：

- 精确文本键
- 模板键
- 账号键
- 域名/短链键
- 关键词组合

关键字段：

- `rule_type`
- `pattern_key`
- `positive_label_count`
- `negative_label_count`
- `distinct_user_count`
- `confidence_score`
- `status`：`candidate` / `active` / `rejected` / `revoked`

## 推荐升级流程

```text
用户或插件产生事件
  ↓
写入 moderation_events / timeline_posts / reply_ai_items
  ↓
抽取成 moderation_samples
  ↓
用户反馈、开发者审核、AI 判断写入 moderation_sample_labels
  ↓
统计高共识模式，写入 moderation_rule_candidates
  ↓
开发者确认后，升级到现有 developer_global_decisions 或全局规则缓存
```

## 当前不要做的事

- 不要把所有用户反馈立即变成公共规则
- 不要让单个用户的个人偏好污染全局数据库
- 不要没有审核就拿公共上传样本训练模型
- 不要只存最终结论而丢掉原始文本、来源和时间
- 不要做“大家直接写一个压缩包”的样本入口；应优先从现有数据库事件和 AI 结果自动抽样，用户只通过冲走、恢复误判、开发者确认来留下结构化证据。

## 2026-05-01 当前数据库现状

只读检查结果：

- `moderation_events` 非测试口径：`auto_hide=397`、`manual_hide=143`、`manual_allow=10`、`ad_home_hide=129`、`ad_reply_hide=13`。直接查原始表会多出少量开发测试行，例如 `devtrash` / `测试开发者全局投喂样本`，日常判断以非测试口径为准。
- `reply_ai_items=1064`，`reply_ai_results=1064`；其中 ready/hide 约 `117`，ready/allow 约 `756`，failed 约 `178`。这些主要是旧 AI 审核项，不代表当前每条新回复都送 AI。
- `moderation_samples=0`、`moderation_sample_labels=0`、`moderation_rule_candidates=0`。也就是说，当前还没有把“冲走/恢复/AI 判定”自动抽成训练样本，更没有反复把数据库里的垃圾信息丢给 AI 训练。
- 手动重复冲走样本里，当前看到重复较多的是资源包/网盘链接样本和一条开发测试样本；仍然只能作为候选，不应直接升级公共规则。

当前正确口径：AI 只做辅助判断和生成 label 的证据来源。后续要做训练闭环，也必须先抽样到 `moderation_samples` / `moderation_sample_labels`，再让开发者确认或多贡献者共识，不能把单用户重复冲走直接喂成公共模型/公共规则。

基础提示词包已经建立在 `docs/ai-prompt-packs/sexual-leadgen-foundation/`，用于沉淀“色情引流 / 空洞诱饵 / 联系方式导流”的公共审核口径和回归样本。

## 2026-05-02 AI 记忆库口径

用户已明确选择 `AI 当老师，数据库当记忆本`。

- 新增 `reply_ai_memory`，只学习回复区 AI 直接高置信隐藏结果。
- 同文案、短文本风险上下文、可靠模板可在有效期内复用，复用结果展示为 `AI 学习库屏蔽`。
- 2026-05-03 用户再次明确：AI 老师可以多教一点，token 不是主要问题。因此高风险或数据库已命中的可疑候选，可以在预算上限内追加给 AI 老师复核；但普通正常回复仍不能全量进 AI。
- `manual_hide/冲走` 只能进入手动记录和候选证据，不能直接写入 AI 记忆库。
- `manual_allow/恢复误判` 会停用对应 AI 记忆，之后同类内容要重新交给 AI 或放过。
- 旧的本地规则、账号黑名单、历史命中不再作为控制台主分类；如果仍产生有效隐藏，展示口径归入 `AI 学习库屏蔽`。
- 2026-05-02 已备份并应用线上 D1 schema；备份文件在本机 `backups/d1/web25-2026-05-02-ai-memory-before-schema.sql`。当前线上 Worker Version ID 为 `f931af5f-32ee-459d-ba1b-62b6dee83bb3`。

## 2026-05-02 当前核对

本轮通过公网开发者审计接口核对到：

- 线上 AI 设置仍为开启，模型为 `deepseek-v4-flash`，Key 只显示后四位 `a6db`。
- 事件总数为 `702`：`auto_hide=397`、`manual_hide=143`、`manual_allow=13`、`ad_home_hide=133`、`ad_reply_hide=16`。
- 当前账号可见累计口径里，AI 直接隐藏约 `131`，AI 学习库复用隐藏约 `4`；这些是已经发生过的 AI 判断和复用，不代表每条正常回复都应该进 AI。
- 2026-05-02 13:55 已发布轻量闭环：新发生的 `manual_hide` / `manual_allow` 会写入样本和用户反馈标注；AI 首次判断也会写入 AI 标注。它们仍然只是证据层，不会自动变成公共规则。
- 2026-05-02 13:55 已完成旧数据回填。只读核验：`moderation_samples=1220`、`moderation_sample_labels=1226`、`reply_ai_memory active=84`。样本来源：`moderation_event=150`、`reply_ai_item=1070`。标注分布：AI allow `940`、AI hide `130`、用户 allow `13`、用户 hide `143`。

## 2026-05-02 回填工具状态

用户要求把现有数据库里的可用内容整理进学习样本库，并把旧 AI 判断当成“老师教过的内容”补进云端记忆。

本地代码已经上线并执行过：

- 新增开发者接口：`POST /api/developer/backfill-training`
- 新增脚本：`npm run cloud:backfill-training`
- 正式写线上数据库前，脚本会先导出 D1 备份到 `backups/d1/`
- 它会扫描旧 `manual_hide/冲走` 和 `manual_allow/恢复` 事件，写入样本和标注
- 它会扫描旧 AI 首次判断，写入 AI 标注
- 它会跳过明显的开发测试 sync key、测试设备、测试账号和测试正文
- 旧 AI 直接高置信隐藏结果会补进 `reply_ai_memory`，以后同类内容可由云端记忆库直接复用
- `manual_hide/冲走` 仍然只是垃圾候选和用户反馈，不会单靠一个用户变成公共规则
- `manual_allow/恢复` 仍然只作为抑制和纠错证据
- 新增正文兜底：以后如果 X 没给回复正文，系统会保存 `账号线索：显示名 @handle`，避免样本完全空白；旧空正文历史无法凭空还原

2026-05-02 13:55 用户完成 Cloudflare 授权后，已执行：

1. `npm run cloud:deploy`
2. D1 备份，最新回填前备份：`backups/d1/web25-2026-05-02T05-38-54-857Z-before-training-backfill.sql`
3. 小批量回填：旧手动事件处理 156 条、旧 AI 判断处理 1070 条、AI 记忆写入尝试 130 次
4. `npm run cloud:audit-data-layer`，所有分层检查 PASS

## 2026-05-02 数据库接管层

用户明确要求把“AI 当老师、数据库当记忆本”推进到下一步：重复垃圾话术命中数据库后，不再调用外部 AI。

本轮已上线：

- 新增开发者接口：`POST /api/developer/rebuild-rule-candidates`
- 新增脚本：`npm run cloud:rebuild-rule-candidates`
- 新增实时刷新逻辑：新的 `manual_hide` / `manual_allow` 和 AI 高置信隐藏会刷新对应候选规则。
- 云端回复审核顺序改为：静态检查 -> `reply_ai_memory` -> `moderation_rule_candidates` -> 账号黑名单/旧复用 -> 外部模型 API。
- 命中候选规则时返回 `db_rule_exact_text` / `db_rule_compact_text` / `db_rule_template` / `db_rule_pattern`，控制台仍可归入 AI 学习库类目，但不会消耗外部 API。
- 用户恢复误判或开发者撤回会把对应候选压回待确认；AI 自己低置信/中置信放过只降分，不再像用户恢复一样硬压制明显垃圾。
- 2026-05-02 新增候选键 `pattern:emoji-noise-lure-account`：用于沉淀“emoji 堆砌短空话 + 随机数字 handle / 可疑账号画像”的重复垃圾。它仍遵守候选规则表的公共升级约束，不能因为单个用户反复冲走就污染全局规则。

线上结果：

- 正式整理前 D1 备份：`backups/d1/web25-2026-05-02T07-23-57-109Z-before-rule-candidates.sql`
- `moderation_rule_candidates active=222`
- `moderation_rule_candidates candidate=64`
- `找个同城的哥哥` 的精确文本和压缩文本规则已启用。
- `pattern:geo-relationship-bait` 已启用。
- `pattern:geo-meetup-bait` 和 `template:hook+meetup` 因存在恢复/放过证据仍保持候选，不直接启用，避免误伤 `我在万达广场附近上班`、`附近有家面馆不错` 这类正常句子。
- 云端小测试：`找个同城弟弟` 返回 `db_rule_pattern/hide/high`，测试 item `1097/1098` 没有产生新的外部 AI 调用。
- 2026-05-02 17:11 已按用户追问追加验收：风险昵称 `孟轩🌸无常线下🌸`、随机数字 handle `MullerChri42258`、低信息回复 `2🙃😍🧡` 返回 `db_rule_pattern/hide/high`，`model=moderation-rule-candidates-2026-05-02-v1`。这说明同类“老师已经讲过的题”会被数据库学习库先截住，不再调用外部 AI。测试 item 为 `1099`，属于 `sync_dev_test_db_rule_1650_*` 开发验收数据。
- 2026-05-02 17:31 已追加截图漏网模板验收：`比她好看的没她强，比她强的没她好看 @designksh1/@xiaonm88`、`刷了半天的X就她的主页能打✈️了 @designksh1/@xiaonm88`、`线下我就日过这个骚货 @designksh1`、`免费破处` 风险昵称发 `十🙈`，全部返回数据库学习库隐藏，`decisionLayer=db_rule_pattern/db_rule_template`。测试 item 为 `1100`-`1106`，属于 `sync_dev_test_screenshot_templates_*` 开发验收数据。
- 2026-05-03 00:22 已追加 `pattern:poetic-slogan-lure-account` 的模板覆盖：`人间钟情柔情` / `人间柔情` 类诗句式低信息短文案，搭配随机数字 handle、emoji 噪音、上下文脱节等信号时进入同一候选规则。线上只读探针 `Minsqw @minsqw49924 / ✩ 人间钟情柔情 ✩ 👍 🎊` 返回 `db_rule_pattern / ready / hide / high`，不调用外接 AI，不写数据库。本轮没有新增 D1 表、没有清理或删除生产数据，也没有把单个用户重复冲走升级成公共规则；它复用此前开发者确认的活跃规则。`npm run cloud:audit-data-layer` 通过，仍确认单用户重复冲走不会自动进入公共规则。

## 2026-05-03 AI 老师抽查数据库命中

用户指出“本地数据库做得不好时，AI 老师应该多教一点”，并明确 token 不是主要问题。本轮已上线一个有上限的老师复核层：

- 插件仍只挑可疑候选，不把普通正常回复全量送 AI。
- 本地 AI 候选更积极：批量上限 8、等待 900ms、最小间隔 1500ms、基础可疑分 2。
- 高风险候选会带 `teacher_review_requested` 证据标签。
- Worker 仍按静态规则、AI 记忆、数据库候选规则的顺序先拦住明显垃圾。
- 当数据库候选规则已经命中，并且候选带老师复核标签时，Worker 每批最多额外抽 4 条调用已配置的 DeepSeek。
- 如果老师返回直接高置信隐藏，就按 AI 结果写入后续记忆和标注；如果老师没有高置信隐藏，就回落到原数据库规则，不让已确认垃圾露出。
- 线上验证：`孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 命中 `pattern:geo-relationship-bait`，同时因 `teacher_review_requested` 真实调用 DeepSeek，返回 `Final layer: ai`、`ready / hide / high`。开发者探针不写数据库。
- 本轮没有 schema 变更、没有 D1 清理、没有删除生产数据。

2026-05-03 用户再次强调 AI 参与强度应更大：如果主要靠用户本人不断手动冲走，数据库训练效率太低。前期数据库还不够聪明时，应让 AI 老师主动多看高风险和边界样本，尤其是头像/图片有招嫖引流证据、随机数字账号、低信息口号、emoji 噪音、上下文脱节、数据库已命中但仍值得复核、或反复出现的新模式。AI 高置信结论要继续写入 `reply_ai_results`、`moderation_sample_labels`、`reply_ai_memory`，并刷新候选规则。普通正常回复仍不全量进 AI，但不要把节省 token 放在训练效率之上。

2026-05-03 用户再次纠正工作方向：漏网截图优先是给 AI/数据库找“为什么没学会”的训练素材，不是要求把截图文字逐条硬编码进插件。后续处理截图时，应先抽象判断方法：账号形态、显示名、handle、正文是否空洞、emoji 噪音、是否脱离原帖、是否批量相邻、头像/图片里是否有 `全国安排` / `全国可飞` 等引流字样。只有当某个模式已经足够稳定、误伤边界明确、并和用户讨论过，才把它固化成本地/Worker 规则。

如果当前 DeepSeek 配置支持图片识别，高风险候选应优先把头像图片证据交给 AI 老师，让老师识别头像里的招嫖/导流文字并写入后续记忆和标注；如果不支持图片识别，先说明限制，再考虑 OCR 或支持视觉的模型。不要让“看不见头像文字”的文本规则替代真正的图像证据，也不要未经说明扩大付费调用范围。

## 近期最实用的下一步

后续继续按这个小闭环走：

1. 从 `manual_hide` 和 `manual_allow` 事件抽取样本
2. 给每条样本写入对应 label，其中 `manual_allow` 只写成“不应隐藏 / 不应升级”的抑制信号
3. 立刻刷新对应 `moderation_rule_candidates`，让数据库候选规则能接住重复模式
4. 只把 AI 高置信、多人共识或开发者确认的候选升级为活跃规则
5. 误判恢复会压低候选，不会当成“用户喜欢这类内容”的反向训练

这条路线最省 API，也最不容易误伤。

2026-05-02 19:29 已修正实时手动反馈刷新：`manual_hide` / `manual_allow` 以前会写入样本和标注，但候选刷新处引用了不存在的 AI `decision` 变量，导致这一步被保护性捕获后静默失败。现在手动冲走或恢复写完 label 后都会刷新对应数据库候选规则；单用户冲走仍然只是候选证据，不会直接变公共规则。AI 首次直接判断链路原本已能写入 `moderation_sample_labels`，高置信隐藏也会继续写入 `reply_ai_memory`。2026-05-02 19:34 已重新整理线上候选规则，整理前 D1 备份为 `backups/d1/web25-2026-05-02T11-34-30-329Z-before-rule-candidates.sql`，结果为 `moderation_rule_candidates active=223`、`candidate=66`。

2026-05-02 21:24 已补本地插件与云端数据库候选键的同构缺口：本地 `getReplyManualKeys` 现在会发出 `pattern:geo-relationship-bait` 和 `pattern:poetic-slogan-lure-account`，与 Worker 的 `buildRowKeys` 对齐。这个改动不改变数据库结构、不批量写入 D1、不把单用户反馈升级公共规则，只让后续手动 `冲走` / `恢复` 样本更容易按同一模式刷新候选规则。公网已发布 Worker Version ID `9fd4a255-7913-4fcc-ba5a-9966193f8ad0`，`npm run cloud:audit-data-layer` 通过。

2026-05-02 21:51 已补 `share-link-scam` 的真实网盘引流形状：`是不是这个 / 是这个吗 / 就是这个 + pan.quark.cn/s/...` 现在本地基础层和 Worker 都会优先拦截。这个修复不改数据库结构、不重建候选库、不批量写 D1；后续如果用户手动 `冲走` 同类漏网，样本仍会按 `pattern:share-link-scam` 进入候选刷新，但单用户反馈不会直接变公共规则，`manual_allow` 仍只做纠错和抑制。

2026-05-02 22:43 已新增开发者只读“回复 AI 路线探针”：`POST /api/developer/reply-ai-routing-probe` 和 `npm run cloud:probe-reply-ai`。它把同一条样本按真实云端顺序检查：静态跳过条件、AI 记忆库、数据库候选规则、账号黑名单、旧复用层，最后才标记“下一步会调用外接 AI”。默认不写 D1、不调用外接 AI、不改变候选分数；只有显式加 `-- --call-provider` 才会做真实外接 AI 小额调用。线上默认样本已验证为 `db_rule_pattern/hide/high`，没有调用外接 AI，也没有写数据库。这个工具的用途是排查“为什么这条没被数据库接住 / 是否浪费 API / 是否被恢复记录压住”，不是新增筛选阈值。

2026-05-02 23:57 已按用户截图明确确认，将 `pattern:poetic-slogan-lure-account` 升为开发者确认的活跃数据库规则。操作前已备份线上 D1：`backups/d1/web25-2026-05-02T15-57-00-before-poetic-slogan-rule.sql`。本次同时修正本地和 Worker 的模式键顺序：诗句式空洞模板优先于较宽的装饰空话模板。线上 7 条截图同款探针全部命中 `db_rule_pattern/hide/high`，不调用外接 AI；`pattern:decorative-slogan-lure-account` 仍保持 candidate，不扩大到普通装饰空话。

2026-05-03 00:11 已补真实 X 渲染版本：用户复查时看到的同款实际是无 emoji 的装饰符号/纯短句版本。Worker 和本地现在都允许 `pattern:poetic-slogan-lure-account` 由固定诗句模板 + 随机数字 handle 直接触发，不再要求 emoji；线上 7 条真实文字探针全部命中数据库规则，不调用外接 AI。

2026-05-03 10:05 已补用户新截图里的短口号变体：`浅交不如深知己`、`高质量交友贵在合拍`、`品行相近方同行`、`拒绝无效的寒暄` 搭配随机数字 handle / emoji 噪音时进入 `pattern:poetic-slogan-lure-account`；`有没有单身哥哥` 进入已启用的 `pattern:geo-relationship-bait`。根因是 X 未提供原帖正文时，旧的 emoji 噪音组合分不够，且这些短口号不在既有诗句模板里。线上探针 `高质量交友贵在合拍 🌟✂️🌟🎁` 和 `有没有单身哥哥✨🤤🫶Oa` 都返回 `db_rule_pattern / ready / hide / high`，不调用外接 AI，不写数据库。本轮没有新增 D1 表、没有清理或删除生产数据，也没有把单用户反馈升级成公共规则；复用既有活跃候选键。

## 下一任重点：AI、数据库、API 调度关系

用户下一步主要要调试这三者的关系，不是重做 UI。

当前正确链路是：

```text
插件读到回复
  ↓
本地先做低成本风险筛选
  ↓
明显正常内容不进 AI
  ↓
可疑内容发到云端
  ↓
云端先查 reply_ai_memory
  ↓
命中则直接复用，显示为 AI 学习库屏蔽
  ↓
没命中再查 moderation_rule_candidates
  ↓
命中则由数据库学习库直接屏蔽，不调用外部模型 API
  ↓
没命中才调用外部模型 API
  ↓
AI 结果写 reply_ai_results
  ↓
AI 标注写 moderation_sample_labels
  ↓
高置信隐藏再沉淀进 reply_ai_memory
  ↓
刷新 moderation_rule_candidates，供以后同类模式优先命中数据库
```

调试时优先看这些问题：

- 是否每条回复都进 AI 队列。如果是，这是 bug，先查 `extension/content/content.js` 的 `buildReplyAiModerationCandidate`。
- 是否记忆命中还继续调用模型。如果是，这是浪费 API，先查 `cloudflare/src/index.js` 的 `findReplyAiMemoryDecision` / `classifyReplyAiItemEntries`。
- 是否数据库候选规则命中还继续调用模型。如果是，查 `findModerationRuleCandidateDecision` 在 `classifyReplyAiItemEntries` 中的位置。
- 是否 AI 隐藏后没有进入样本标注。如果是，查 `recordModerationTrainingLabelFromReplyAiDecision`。
- 是否高置信隐藏没有进入记忆库。如果是，查 `upsertReplyAiMemoryFromDecision`。
- 是否手动冲走/恢复没有刷新数据库候选。如果是，查 `recordModerationTrainingLabelFromEvent`。
- 是否用户恢复后记忆仍然生效。如果是，查 `markReplyAiItemAllowedByManualRestore`、`deactivateReplyAiMemoryForItem` 和 `demoteModerationRuleCandidatesForReplyAiItem`。

调试口径：

- 数据库不是“自己变聪明的模型”，而是事实库、标注库、记忆库。
- AI 是老师，先判断新东西；数据库记住老师判过的可靠内容，后续少花 API 钱。
- `manual_hide/冲走` 是用户反馈和垃圾候选。
- `manual_allow/恢复` 是纠错和抑制。
- 单用户反馈不能直接污染公共规则。
