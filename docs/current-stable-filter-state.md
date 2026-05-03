# Colorful Toilet 当前稳定筛选状态

## 这份文件的目的

这不是普通说明文档，而是当前 `X / Safari` 插件筛选机制的稳定基线记录。

当前这版筛选效果已经得到用户明确高评价，默认视为：

- `当前最符合用户心意的版本`
- `后续修改的对照基线`
- `不要轻易改坏的金状态`

如果未来没有新的明确用户指令，下一任助手或开发者必须默认：

- 不要随意改阈值
- 不要为了“更聪明”大改筛选策略
- 不要把已经压住的典型垃圾话术重新放出来
- 不要只改本地或只改云端，必须保持两边同步

## 当前状态结论

当前筛选机制的总体方向是：

- 评论区先过本地基础规则和云端数据库学习库，明显垃圾不能在等待 AI 时露出来
- 云端数据库没截住的新话术，再交给 AI 审核
- 2026-05-03 起，用户明确要求“AI 老师”多教一点：高风险或数据库已命中的可疑候选，可以在有预算上限的情况下追加给 AI 抽查复核，用来沉淀更好的 AI 记忆；普通正常回复仍然不进 AI。
- AI 第一次高置信隐藏后，云端数据库会作为“AI 记忆本”复用结果
- 本地规则继续负责采集、风险信号、立即安全下沉和排队排序；普通正常回复不进 AI 队列。

也就是说，当前推荐做法是：

- 明显已知垃圾先由基础规则 / 数据库直接截住
- 新话术先交给 AI 判断；等待 AI 期间，高风险候选会临时下沉，AI 放过后自动显示
- 数据库已经截住的高风险项也可以少量抽给 AI 老师复核；AI 高置信隐藏可继续写入记忆，AI 不高置信时仍回落到原数据库规则，不让明显垃圾露出来
- AI 判过的相同或可靠相似内容，后续由云端记忆库直接复用，减少重复调用
- 不要把用户单次 `冲走` 或旧本地规则直接升级成所有人共享的公共规则
- 用户手动 `冲走` / `恢复` 应先成为样本和标注证据，后续再由多贡献者共识或开发者确认升级，不直接污染公共规则。

## 当前必须守住的命中能力

以下这些类型，默认必须能压住：

- 地点搭讪问句
  - `有万达广场附近的吗`
  - `有附近的吗`
  - `离得近的吗`
  - `万达广场附近有吗`
- 账号 / ID / 导流型回复
  - `主页置顶看id`
  - `搜我小号 vx123456`
  - `主页简介自取福利`
- 低信息垃圾回复 + 风险账号画像
  - 显示名带 `免费破处` / `无偿` / `同城` / `搭子` / `小狗` 等诱导词
  - handle 带明显数字串或导流式结构
  - 正文只是 `NEW` / `dd` / 极短符号 / emoji / badge 式内容
- 明显关系 / 情色搭讪
  - `哥哥我想要`
  - `有哥哥找下吗`

## 当前必须守住的不误伤样本

以下这些类型，默认不应该被直接自动下沉：

- `Apple ID 一直登不上`
- `我在万达广场附近上班`
- `万达广场附近有什么好吃的`
- `附近有家面馆不错`
- `有没有天安门附近的`
- `有没有天安门广场附近的`
- `有没有北京天安门附近的`
- 普通账号发送的正常短英文词，比如 `hi` / `ok`

2026-05-02 新增口径：`天安门`、`天安门广场`、`故宫` 等公共地标附近问句，可能是在模仿垃圾话术做阴阳怪气或玩梗。只要没有 `可约`、`见面`、联系方式、主页导流、风险账号画像等额外证据，不要仅凭“有没有 + 地标 + 附近”自动下沉。对应反例：`有没有天安门附近可约吗` 仍然要挡。

## 当前筛选机制的关键实现原则

### 1. 不要只靠一个总阈值蛮压

当前更好的做法是：

- 保持基础阈值稳定
- 对高价值垃圾信号做组合加权

已经被证明有效的组合包括：

- `geo-meetup-bait`
- `bait-question-shape`
- `low-information-lure-account`
- `low-information-strong-lure-name`
- `risky-account-profile`
- `hook-erotic-combo`

### 2. 本地与云端必须同构

以下模式键必须在本地扩展和 Cloudflare Worker 同时存在，不能只改一边：

- `pattern:geo-meetup-bait`
- `pattern:bait-question-shape`
- `pattern:low-information-lure-account`
- `pattern:low-information-strong-lure-name`

如果未来新增新的高价值模式键，也必须遵守同样原则：

- `extension/content/content.js` 生成键
- `cloudflare/src/index.js` 学习 / 分发同键

### 3. 公共规则不能被单用户污染

`冲走` 可以贡献垃圾候选，但单个用户反复冲走同类内容，不能直接把个人偏好刷成所有人共用的公共规则。

当前公共基础库的正确入口是：

- 开发者明确确认进入全局
- 或达到多贡献者共识的自动候选

同一个账号的多个设备不能伪装成多人共识。自动全局精确规则必须按贡献者计数，优先使用 `user_id`，未登录时才退回到 `sync_key`。

### 4. 作者画像不能再被截断

作者显示名必须完整提取，不能只取第一段文字。

像下面这类风险名字，必须完整进入判断：

- `蒋萝莉❤️免费破处❤️`

如果显示名抽取再次退化成只读前半段，筛选效果会明显变差。

## 当前验证过的同步状态

截至这次稳定备份，以下两层已经对齐：

- 本地 Safari 扩展构建：
  - `BUILD_ID = 2026-05-03-1402`
  - 扩展版本 `0.1.62`
  - App / Extension 版本 `1.0.62 (63)`
  - 2026-05-03 14:12 用户发截图让 GPT-5.5 自判，指出 `舒希🌸🌸 / 想dD找会疼人的哥哥`、`怂歆🌸来个真人认识一下🌸 / 6❤🎁😊💌`、`芭乐芭乐❤️附近的DD啊 / 5🙊🙈`、`椰子 / 🤓独具魅力`、`丽莎 / ⭐克服睡眼` 都应有问题，`云酱Yuiun / 你这问题有意思...` 是正常粗口评论。根因分三层：旧数据库还没有 `generic-short-slogan-lure-account` 这种候选键；本地 AI 入口不认识 `来个真人认识一下`、`附近的DD` 和 `⭐` 这类装饰符号，弱随机 handle 的短口号也不够分；DeepSeek 老师提示词对“没有露骨词/联系方式”的短口号过于保守，最初把 `独具魅力`、`克服睡眼` 放过。新版同步本地和 Worker：风险昵称认识 `来个真人认识一下`、`附近的DD`，`⭐` 进入 emoji/装饰符识别；短、无上下文、带装饰符号/emoji、来自随机样 handle 的口号会发出 `generic_short_slogan_reply` 和 `pattern:generic-short-slogan-lure-account`，先送 AI 老师并临时下沉；AI prompt 明确这类批量号短口号本身是 `meaningless_bait`，不再要求出现露骨招嫖或联系方式。线上探针：`独具魅力`、`克服睡眼` 均为 `ai / ready / hide / high`，正常粗口评论为 `ai / ready / allow / low`。真实 Safari 页 `https://x.com/ronronzi/status/2050591230275539384` 验证 `build=2026-05-03-1402`、`articles=47`，`PaulBarbar6873`、`RyanTerrel92368`、`zhizi856`、`dffgfoo02` 对应 cell 均 `data-web25-hidden=1` 且 `display:none`，`sorallllllan` 仍可见。本轮没有改 schema、没有删除 D1 数据。
  - 2026-05-03 13:49 用户追问截图 `天使熊❤️附近的来 @hayes_jaco16929 / 纯 emoji` 为什么仍露出。复查发现前一轮说法不够严谨：同内容开发者探针会调用 DeepSeek，但真实 Safari 页面里的这条当时没有进入 AI 队列，也没有被隐藏。根因是旧昵称风险只强认识 `固泡/同城上门/无偿线下/免费破处` 等，`附近的来` 这种短昵称没有被当成诱导昵称；纯 emoji 正文和可疑 handle 分数不够。新版本地和 Worker 同步加入 `附近/同城/线下 + 来/来聊/来找/找我/私/约/见` 昵称诱导模式，并把 AI 候选的显示顺序提前：凡是应送 AI 的高风险项先按 `AI 复审中` 隐藏，再等云端结果。临时 AI 缓存号换到 `web25-reply-ai-cache-v3`。本地回归：截图同款隐藏，`附近有家面馆不错` 放过。用户完成 Cloudflare 登录后已发布公网；线上探针同款样本真实调用 DeepSeek，返回 `Final layer: ai / ready / hide / high`、`External AI: called`、`Database writes: no`。真实 Safari 页 `https://x.com/yizhunli10167/status/2050601910487461905` 验证 `build=2026-05-03-1327`、`articles=52`，`@hayes_jaco16929` 对应 cell 为 `data-web25-hidden=1`、`display:none`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-1327`、`extensionVersion=0.1.61`；本轮没有改 schema、没有删除 D1 数据。
  - 2026-05-03 12:56 已按用户“AI 根本没干活，要改产品里的 AI”要求提高 AI 老师实际参与度。本地批量上限 12 -> 16，发送等待 650ms -> 350ms，最小间隔 750ms -> 350ms，老师复核分 3 -> 2，会话缓存 360 -> 600，并把临时缓存号换成 `web25-reply-ai-cache-v2`，让新版重新审核可疑项。云端老师复核预算 8 -> 16；高风险候选即使命中 AI 记忆、数据库规则、账号黑名单或旧复用层，也会先追加给 DeepSeek 老师复核；AI 高置信隐藏则最终层为 `ai`，AI 不高置信时回落到原拦截结果，非最终老师判断也写入样本标注。真实 Safari 详情页验证 `build=2026-05-03-1256`、`stage=scan:done`、`articles=22`、可见 `冲走` 按钮 6 个、右栏关闭按钮 3 个。本轮没有改数据库结构，没有删除 D1 数据。
  - 2026-05-03 11:40 已补用户截图里 `孙甜甜❤️寻男大固泡 @MonaKristi9125 / 纯 emoji 噪音` 漏网。根因有两层：旧昵称规则认识 `找固定泡友/炮友/固炮`，但没认识 `寻男 + 固泡` 缩写；同时 X 把 tweet 正文 emoji 渲染成图片，旧 `getTweetText` 只读 `innerText` 时会漏掉 emoji alt。新版把 `寻男/寻女/固泡/泡友/炮友/性友` 纳入风险昵称和强风险模式，本地和 Worker 同步；并让正文读取从 tweetText 节点收集 emoji 图片 alt。回归：同款 emoji / 空正文 + 风险昵称隐藏；`我在找固定搭档做项目`、`今晚准时看直播吗` 放过。真实 Safari 页验证 `build=2026-05-03-1138`、`stage=scan:done`、`articles=19`，该行 `hidden=true` 且 `cellHidden=true`。本轮没有改数据库结构，没有删除 D1 数据。
  - 2026-05-03 11:21 已补用户截图里仍露出的“全国安排头像 + 埃及符号壳 + 空洞交友口号”一组。根因不是 AI 扫描次数有限：真实 X 详情页已经 `stage=scan:done`，并扫到 53 条回复；漏网是因为旧规则没把 `\u{13000}-\u{1342F}` 这段埃及象形符号当成装饰壳，也缺少 `灵魂/共鸣/同频/知音/三观` 等抽象交友空话词。新版把这类“装饰符号壳 + 空洞口号 + 随机数字 handle”纳入 `decorative-slogan-from-suspicious-handle`，本地和 Worker 同步。回归：7 条截图同款全部隐藏；`我们三观不合，所以还是别一起做项目了。`、`同频的人聊天很舒服...`、`灵魂不负相逢，这句歌词挺美的。` 等普通语境放过。真实 Safari 详情页验证 `build=2026-05-03-1117`、`stage=scan:done`、`articles=15`、可见 `冲走` 按钮 11 个、右栏关闭按钮 3 个；进一步查截图关键词和账号，`matchedRows=[]`。本轮没有改数据库结构，没有删除 D1 数据。
  - 2026-05-03 10:46 已按用户明确要求继续提高 AI 老师参与强度。本地批量上限 8 -> 12，发送等待 900ms -> 650ms，最小间隔 1500ms -> 750ms，基础候选分 2 -> 1，老师复核分 5 -> 3，缓存 240 -> 360；但仍保留边界：随机数字 handle 不能单独让普通长回复进 AI，必须配合短/薄/诱导/模板/emoji/上下文风险等信号。头像证据更积极：风险昵称、关系诱导、垃圾模板、头像取证会带更多证据标签，`teacher_review_requested` 会优先保留。真实 Safari 详情页验证 `build=2026-05-03-1039`、`stage=scan:done`、`articles=26`、可见 `冲走` 按钮 12 个、右栏关闭按钮 3 个。本轮没有改数据库结构，没有删除 D1 数据。
  - 2026-05-03 10:05 已补用户截图里新一批“全国安排头像 + 随机英文数字号 + 短口号/emoji”漏网。根因不是云端没同步，而是 X 没稳定暴露原帖正文时，旧规则只按 `emoji-noise + suspicious-handle` 打到 2 分；`浅交不如深知己`、`高质量交友贵在合拍`、`品行相近方同行`、`拒绝无效的寒暄` 也不在既有诗句模板里。新版把这些短口号纳入 `poetic-slogan-from-suspicious-handle`，并把 `有没有单身哥哥` 纳入 `geo-relationship-bait`。本地回归 5 条截图同款全部隐藏；`高质量交友贵在合拍，关键是共同爱好和边界感。`、`有没有单身哥哥一起打游戏？`、`附近有家面馆不错`、`生日快乐🎂🎉🥳` 放过。真实 Safari 详情页验证 `build=2026-05-03-1001`、`stage=scan:done`、`articles=22`、可见 `冲走` 按钮 12 个、右栏关闭按钮 3 个。本轮没有改数据库结构，没有删除 D1 数据。
  - 2026-05-03 09:39 已按用户“AI 是老师、辅助强度可以开大”的要求上线老师复核层。本地候选更积极：批量上限从 6 到 8，发送等待从 1200ms 到 900ms，最小批量间隔从 4000ms 到 1500ms，AI 候选基础分从 3 到 2；高风险候选会带 `teacher_review_requested`。云端仍先查静态规则、AI 记忆、数据库候选规则；如果数据库已命中且带老师复核标记，每批最多 4 条追加调用 DeepSeek。公网探针 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 在命中 `pattern:geo-relationship-bait` 的同时真实调用外接 AI，返回 `Final layer: ai / ready / hide / high`，不写数据库。真实 Safari 详情页验证 `build=2026-05-03-0037`、`stage=scan:done`、`articles=25`、可见 `冲走` 按钮 4 个、右栏关闭按钮 3 个。本轮没有改数据库结构，没有删除 D1 数据。
  - 2026-05-03 00:22 已补用户复查后剩下的一条 `Minsqw @minsqw49924 / ✩ 人间钟情柔情 ✩ 👍 🎊`。这不是删除某个账号或某条历史，而是把 `人间.{0,4}(钟情|柔情)` 加入现有诗句式低信息引流模板；仍需要随机数字 handle、emoji 噪音、上下文脱节等组合信号支撑。真实 X 页头像图片本身在 DOM 里没有可读 `全国安排` 文字，Safari 本地不能直接读图识字；头像仍会作为云端 AI 辅助证据，但即时隐藏要靠可见正文、账号形态和上下文信号。真实 Safari 详情页 `https://x.com/bandagemiao/status/2050238861318754634` 已验证：`build=2026-05-03-0022`、`stage=scan:done`、`articles=27`，该 cell 为 `data-web25-hidden=1` 且 `display:none`。
  - 2026-05-03 00:11 已修复用户复查仍能看到同款垃圾的真正原因：真实 X 页面里这些回复不是 emoji 版本，而是 `༙༚ 晨昏静候柔意 ༚༙`、`༘꙳ 温柔漫染眉眼 ꙳༘`、`༳ 晨昏暗生情愫 ༳`、`ꧨ 时光赠予柔情 ꧨ`、`꧆ 晚风裹着温柔 ꧇`、`༗ 俗世偏爱温存 ༗`，以及纯 `缘起眉眼温柔`。旧规则要求诗句模板至少带 emoji，所以只标记了按钮，没有自动收掉这些真实版本。新版把这些装饰符号和纯短句模板也纳入 `poetic-slogan-from-suspicious-handle`；本地回归 7 条真实文本全部隐藏，普通账号发 `缘起眉眼温柔`、`有缘自会相识。`、`晚风裹着温柔，今晚散步的时候空气很好。` 放过。
  - 2026-05-02 23:57 已修正数据库候选键优先级：诗句式空洞模板 + 随机数字 handle 会优先归入 `pattern:poetic-slogan-lure-account`，再考虑较宽的 `pattern:decorative-slogan-lure-account`。这保证用户截图里的 7 条同款进入数据库时用更精确的模式键；本地回归 7 条全部隐藏，`晚风裹着温柔，今晚散步的时候空气很好。` 放过。
  - 2026-05-02 23:43 已补用户新截图里的“全国安排头像 + 随机英文数字账号 + 晨昏/温柔/晚风/俗世/缘起诗句空话 + emoji 噪音”批量回复。新版新增 `晨昏静候柔意`、`温柔漫染眉眼`、`晨昏暗生情愫`、`时光赠予柔情`、`晚风裹着温柔`、`俗世偏爱温存`、`缘起眉眼温柔` 等模板；即使 X 暂时没把原帖正文暴露给插件，这 7 条同款也会直接隐藏。普通 `生日快乐🎂🎉🥳` 和有信息量的 `晚风裹着温柔...散步...空气很好` 放过。头像取证扩大到 emoji 噪音可疑项，不再只依赖上下文脱节时才请求头像辅助。
  - 2026-05-02 23:25 已补用户截图里的 `Gmuabzl @gmuabzl73394 / 有缘自会相识。🎁🔥🌺` 和 `Utmhryx @utmhryx13099 / ⚜ 怡好刚好温良友 ⚜ 💘 🧊 🤌🏽🍀🔥`。新版把“短空话/诗句式空洞模板 + emoji 噪音 + 随机数字 handle + 与主帖无关”作为组合信号，而不是只看单条正文；`mainPostText` 会进入 AI 证据卡，prompt 也明确要求比较主帖和回复是否相关。头像证据新增 `emoji_noise_reply` 标签，可疑时继续触发 `avatar_vision_requested`，让支持图片的模型检查头像里是否有“全国安排”等线索。回归：截图同款隐藏，普通相关 `有缘自会相识。`、生日语境 `生日快乐🎂🎉🥳`、金融语境 emoji 回复放过。本轮没有改数据库结构或删除 D1 数据。
  - 2026-05-02 21:57 已补 Safari 偶发启动卡在 `boot` 的兜底：本地扩展读取 Safari 扩展存储和 IndexedDB 时会有超时回退，避免存储回调不返回时整页过滤不扫描。最终真实 Safari `https://x.com/home` 验证返回 `build=2026-05-02-2157`、`marking=1`、`stage=ads:done`。
  - 2026-05-02 21:48 已补用户截图里的 `是不是这个? + pan.quark.cn/s/...` 夸克网盘引流漏网。根因是旧 `share-link-scam` 已认识网盘域名，但没有把“是不是这个 / 是这个吗 / 就是这个”这种短引诱句当成资源盘导流词；链接编号又让整条回复不够短，所以没触发。新版本地和 Worker 都把这类话术归入 `share-link-scam`；截图同款隐藏，`是不是这个问题的原因`、`你说的是这个吗？我刚才没看懂` 放过。没有改 AI 调用顺序、数据库结构、`manual_allow` 口径或 UI。
  - 2026-05-02 21:24 已做小范围同构修正：本地插件现在会发出 `pattern:geo-relationship-bait` 和 `pattern:poetic-slogan-lure-account`，与云端数据库候选规则键保持一致。这个改动只补手动反馈 / 候选证据键，不改变筛选阈值、AI 调用顺序或 UI。验证：本机 App 含 `BUILD_ID=2026-05-02-2124`，签名和 `pluginkit` 通过，`npm run safari:verify-live` 对当前 X 首页返回 `build=2026-05-02-2124`。两个尝试打开的 X 详情页没有加载出回复列表（`articles=0`），所以本轮未能看到实际 `冲走` 按钮数量；后续真实详情页能正常加载时应补一次可见按钮验收。
  - 2026-05-02 19:12 已补用户新截图里的 `🐇有狗.（月固定 @vaughan_jo90233 / 找个温柔的哥哥🌹💐❤️ 0`。根因：旧规则只把 `找个温柔的哥哥` 识别成一个弱 `hook`，没有把 `月固定` 昵称和“找/求/蹲 + 温柔/固定/长期/月固定/帅/乖/可爱/宠人/有钱 + 哥哥/姐姐/弟弟/妹妹”关系诱导结构合并。新版把 `月固定/周固定/长期固定` 作为强风险昵称，并把这类关系诱导正文纳入 `geo-relationship-bait` 同级强模板。本地回归：截图同款 12 分隐藏；`找个温柔的哥哥帮我修电脑`、`这个哥哥很温柔`、`固定收益产品风险很高`、`附近有家面馆不错` 放过。
  - 2026-05-02 18:46 已按用户要求把回复 AI 输入改成“逐条证据卡”方向：可疑回复会带昵称、@用户名、正文、主贴文字、主页简介、主页外链、主页风险标签；当回复像随机诗句/空洞词且与主贴上下文脱节、账号 handle 又可疑时，本地会额外抓取头像图片地址、头像 alt 文本，并标记 `avatar_vision_requested`。后台遇到这类头像证据项时会拆成单条 AI 判断，不和其他回复混在批量里；如果外接模型支持图片输入，会把头像图片作为辅助证据一起送入。只给可疑项启用头像证据，不对每条普通回复全量看图。
  - 2026-05-02 18:22 已补用户新截图里的“全国安排头像 + 随机英文数字 handle + 诗句式空洞回复”模板：`烟火暖了相逢`、`人海有幸擦肩`、`缘分引线人海逢`、`遇见温柔满人间`、`旧城偶遇故人`、`晚风撞我相逢`、`一念恰好相逢` 这类正文搭配 emoji、随机英文数字 handle 时会隐藏。本地回归：7 条截图同款样本全部隐藏；普通账号发 `烟火暖了相逢`、`人海有幸擦肩，今天真的很感慨`、`附近有家面馆不错`、`今晚准时看直播吗` 仍放过。本机 Safari 已替换到 `BUILD_ID=2026-05-02-1822`，真实 X 详情页验证返回 `flushes=4`、`manualButtons=4`、`sideButtons=3`、`articles=46`、`stage=scan:done`。
  - 2026-05-02 17:56 已补用户新截图里的“昵称藏风险、正文只发数字/emoji”模板：`每晚准时大秀`、`找固定泡友`、`今晚准时涩播`、`蹲一个弟弟` 搭配极薄回复和随机数字 handle 现在会被基础层隐藏。本地回归：5 条截图同款样本全部隐藏，`附近有家面馆不错`、`有没有天安门附近的`、`今晚准时看直播吗` 仍放过。本机 Safari 已替换到 `BUILD_ID=2026-05-02-1756` 并验证真实 X 页能读到新版；当次 X 没加载出回复列表，脚本结果为 `articles=0`，所以仅证明注入成功。
  - 2026-05-02 17:47 已按用户追问修正审核链路：扫描到回复后，本地基础规则会先挡住明确垃圾；未命中基础层但属于高风险候选时，会先显示为 `AI 复审中` 并送云端 AI / 数据库复审，AI 放过后自动恢复显示。新增识别 `Pe/CL她好涩 我不行了 👉 @...`、`看我主页 + 附近真实约见` 风险昵称、以及 `免费破处` 风险昵称搭配纯表情薄回复。回归确认 4 条截图同款样本隐藏，`附近有家面馆不错`、`有没有天安门附近的` 仍放过。本机 Safari 已替换并验证真实 X 详情页 `build=2026-05-02-1747`、`flushes=7`、`manualButtons=7`、`sideButtons=3`、`stage=scan:done`。
  - 2026-05-02 17:31 已补用户截图漏网模板：`比她好看的没她强，比她强的没她好看 @...` 和 `刷了半天的X就她的主页能打✈️了 @...` 现在属于明确垃圾模板；`免费破处` 风险昵称搭配 `十🙈` 这种一个字/表情薄回复也会进入数据库低信息诱导账号模式。回归确认 7 条截图同款样本全部隐藏，`附近有家面馆不错`、`有没有天安门附近的` 仍放过。
  - 2026-05-02 17:11 已继续补强低信息回复识别：`2🙃😍🧡` 这种去掉表情后只剩极薄数字/符号的回复，会和风险昵称、随机数字 handle 组合进 `low-information-lure-account` / `low-information-strong-lure-name`，但普通账号发同样短回复不会被一刀切。本地回归：`孟轩🌸无常线下🌸 @MullerChri42258 / 2🙃😍🧡` 隐藏；普通账号同文案放过；`有没有天安门附近的`、`附近有家面馆不错` 放过。
  - 2026-05-02 16:34 已按用户纠正补强：`梦萱/孟轩`这种普通名字本身不算问题，问题是 `🌸无线线下🌸`、`🌸无常线下🌸`、`🌸无偿线下🌸` 这类昵称绕写。新版三种写法都会被识别为风险昵称；搭配随机数字 handle 和 `2🙃😍🧡` 这类数字表情低信息回复会隐藏。`有没有天安门附近的`、`附近有家面馆不错` 仍放过。线上 AI 设置测试样本 `孟轩🌸无常线下🌸 @MullerChri42258 / 2🙃😍🧡` 返回 `action=hide`、`confidence=high`。
  - 2026-05-02 16:23 已补截图漏网规则：`梦萱🌸无线线下🌸 @MullerChri42258` 发 `2🙃😍🧡` 这类“线下绕写昵称 + 随机数字 handle + 数字表情低信息回复”应隐藏。原因是旧规则只把 `线下` 当单个弱信号，且没把 `🌸` 当招揽式昵称装饰，最终只到 4 分、低于自动下沉线 5 分；新版把 `无线/无限 + 线下` 绕写和 `🌸` 装饰纳入风险昵称。本地回归确认该样本隐藏，`有没有天安门附近的`、`附近有家面馆不错` 仍放过。
  - 2026-05-02 15:41 已修复 `冲走` 按钮默认关闭问题：新版扩展默认开启回复下方 `冲走`，并会把旧安装里没有迁移标记的关闭状态自动改回开启。该改动只修主动标记按钮的可见性，不改变筛选阈值和自动下沉策略。
  - 2026-05-02 AI 学习库改造后，评论区本地规则不再把复杂历史库当最终公共裁判；但 17:47 起，本地基础规则必须能先压住明确垃圾，并把高风险候选在等待 AI / 数据库复审时临时下沉。云端 AI 放过后，临时下沉内容应自动恢复显示。
  - 2026-05-02 13:07 已补强回复正文采集：如果 X 没给正文，插件会尽量保存作者显示名和 handle 作为 `账号线索`，避免后续学习样本完全没有内容。已替换本机 Safari App，并验证真实 `https://x.com/home` 加载 `BUILD_ID=2026-05-02-1307`。
  - 2026-05-02 12:22 已修复 AI 排队入口：`buildReplyAiModerationCandidate` 不再把每条回复都送去 AI；只有强风险触发或弱风险组合才排队。已替换本机 Safari App，并验证真实 `https://x.com/home` 加载 `BUILD_ID=2026-05-02-1222`。
- 云端 Cloudflare Worker：
  - 已正式部署
  - URL: `https://colorful-toilet.colorful-toilet.workers.dev`
  - Version ID: `968014ae-0027-4426-a759-a036b7a48fcd`
  - 2026-05-03 14:12 已部署 `BUILD_ID=2026-05-03-1402` / `extensionVersion=0.1.62` 到公网。Worker 同步新增 `generic-short-slogan-lure-account` 候选键、`generic_short_slogan_reply` AI 证据标签，并收紧 AI 老师提示词：无上下文短口号 + 随机样 handle + emoji/装饰符是无意义诱饵。公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-1402`、`extensionVersion=0.1.62`；控制台返回 200；`npm run cloud:audit-data-layer` 通过，本轮没有 schema 变更、没有 D1 清理或删除。
  - 2026-05-03 13:45 已部署 `BUILD_ID=2026-05-03-1327` 到公网。Worker 同步认识 `附近/同城/线下 + 来/来聊/来找/找我/私/约/见` 昵称诱导，并保留高风险候选先给 AI 老师复核的链路。公网首页和控制台均返回 200，`/downloads/latest.json` 返回 `buildId=2026-05-03-1327`、`extensionVersion=0.1.61`。线上同款探针 `天使熊❤️附近的来 @hayes_jaco16929 / 🐱🤠🚗🐟🌝🐱🦁` 真实调用 DeepSeek，返回 `Final layer: ai / ready / hide / high`、`External AI: called`、`Database writes: no`。`npm run cloud:audit-data-layer` 通过，本轮没有 schema 变更、没有 D1 清理或删除。
  - 2026-05-03 12:56 已部署 `BUILD_ID=2026-05-03-1256` 到公网。Worker 同步把批量接收上限提到 16，数据库/记忆库/账号黑名单/旧复用命中的高风险项也会在预算内先给 AI 老师复核；老师返回高置信隐藏时用 AI 结果，老师没给高置信隐藏时回落到原拦截结果。公网探针 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 返回 `Final layer: ai / ready / hide / high`、`External AI: called`。公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-03-1256`、`extensionVersion=0.1.60`。`npm run cloud:audit-data-layer` 通过，本轮没有 schema 变更、没有 D1 清理或删除。
  - 2026-05-03 11:40 已部署 `BUILD_ID=2026-05-03-1138` 到公网。Worker 同步认识 `寻男/寻女/固泡/泡友/炮友/性友` 昵称风险词，并在回复区 AI prompt 示例里加入 `寻男大固泡`，避免云端训练/候选和本地即时隐藏脱节。公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-1138`、`extensionVersion=0.1.59`。`npm run cloud:audit-data-layer` 通过，本轮没有 schema 变更、没有 D1 清理或删除。
  - 2026-05-03 11:21 已部署 `BUILD_ID=2026-05-03-1117` 到公网。Worker 同步认识埃及象形装饰符号壳和新增抽象交友空话词，避免本地挡住但云端训练/候选键不一致。公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-1117`、`extensionVersion=0.1.58`。`npm run cloud:audit-data-layer` 通过，本轮没有 schema 变更、没有 D1 清理或删除。
  - 2026-05-03 10:46 已部署 `BUILD_ID=2026-05-03-1039` 到公网。云端批量上限同步为 12，数据库命中后的老师复核预算从每批 4 条提高到 8 条；除 `teacher_review_requested` 外，头像取证、风险昵称、关系诱导、垃圾模板等证据也可触发老师复核。线上探针 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 带老师复核标记时命中 `pattern:geo-relationship-bait`，同时真实调用 DeepSeek，返回 `Final layer: ai / ready / hide / high`。公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-03-1039`、`extensionVersion=0.1.57`。`npm run cloud:audit-data-layer` 通过，本轮没有 schema 变更、没有 D1 清理或删除。
  - 2026-05-03 10:05 已部署 `BUILD_ID=2026-05-03-1001` 到公网。线上探针 `Vgfsrtjw @vgfsrtjw28371 / 高质量交友贵在合拍 🌟✂️🌟🎁` 返回 `db_rule_pattern / ready / hide / high`，匹配 `pattern:poetic-slogan-lure-account`；`亦琪🌸🌸 @TaylorChar13948 / 有没有单身哥哥✨🤤🫶Oa` 返回 `db_rule_pattern / ready / hide / high`，匹配 `pattern:geo-relationship-bait`。两条均未调用外接 AI、未写数据库。公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-03-1001`、`extensionVersion=0.1.56`。`npm run cloud:audit-data-layer` 通过，本轮没有 schema 变更、没有 D1 清理或删除。
  - 2026-05-03 09:39 已部署 `BUILD_ID=2026-05-03-0037` 到公网。新版将高风险数据库命中项纳入有上限的 AI 老师复核：带 `teacher_review_requested` 的数据库命中候选，每批最多 4 条追加调用 DeepSeek；普通回复仍不全量进 AI。线上探针 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 命中 `pattern:geo-relationship-bait`，同时真实调用外接 AI，返回 `Final layer: ai / ready / hide / high`。公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-03-0037`、`extensionVersion=0.1.55`。本轮没有 schema 变更、没有 D1 清理或删除。
  - 2026-05-03 00:22 已部署 `BUILD_ID=2026-05-03-0022` 到公网。线上探针 `Minsqw @minsqw49924 / ✩ 人间钟情柔情 ✩ 👍 🎊` 返回 `db_rule_pattern / ready / hide / high`，匹配 `pattern:poetic-slogan-lure-account`，外接 AI 不运行、数据库不写入；公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-0022`、`extensionVersion=0.1.54`。本轮没有改数据库结构、没有删除 D1 数据，复用 2026-05-02 23:57 已登记的活跃数据库规则。`npm run cloud:audit-data-layer` 通过，仍确认单用户重复冲走不会自动进入公共规则。
  - 2026-05-03 00:11 已部署 `BUILD_ID=2026-05-03-0011` 到公网。线上探针用 7 条真实页面文字全部返回 `db_rule_pattern / ready / hide / high`，匹配 `pattern:poetic-slogan-lure-account`，不调用外接 AI。公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-0011`、`extensionVersion=0.1.53`。本轮没有改数据库结构、没有删除 D1 数据；复用 2026-05-02 23:57 已登记的活跃数据库规则。
  - 2026-05-02 23:57 已部署 `BUILD_ID=2026-05-02-2357` 到公网。发布前备份 D1 到 `backups/d1/web25-2026-05-02T15-57-00-before-poetic-slogan-rule.sql`，随后把 `pattern:poetic-slogan-lure-account` 登记为开发者确认的活跃数据库规则。线上 7 条截图同款探针全部返回 `db_rule_pattern / ready / hide / high`，匹配 `pattern:poetic-slogan-lure-account`，不调用外接 AI。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-2357`、`extensionVersion=0.1.52`，首页和控制台返回 200。`npm run cloud:audit-data-layer` 通过。
  - 2026-05-02 23:43 已部署 `BUILD_ID=2026-05-02-2340` 到公网。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-2340`、`extensionVersion=0.1.51`，首页和控制台返回 200。`npm run cloud:audit-data-layer` 通过，仍确认单用户重复冲走不会自动进入公共规则。本轮没有 schema 变更或 D1 清理。
  - 2026-05-02 23:25 已部署 `BUILD_ID=2026-05-02-2317` 到公网。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-2317`、`extensionVersion=0.1.50`，首页和控制台返回 200。线上只读探针样本 `Gmuabzl @gmuabzl73394 / 有缘自会相识。🎁🔥🌺` 已显示新证据：`emoji-heavy low-substance bait`、`poetic low-substance slogan`、`unrelated to the main post context`、`context_detached_reply`；数据库和学习库未命中时会进入外接 AI 路线。随后真实 AI 小样本返回 `ready / hide / high`，理由为诗句式低信息、随机号、脱离主帖、emoji 诱饵；不写数据库。新增候选键 `pattern:emoji-noise-lure-account`。`npm run cloud:audit-data-layer` 通过，仍确认单用户重复冲走不会自动进入公共规则。
  - 2026-05-02 22:43 已新增开发者只读“回复 AI 路线探针”：`POST /api/developer/reply-ai-routing-probe` 和脚本 `npm run cloud:probe-reply-ai`。它不改变筛选强度，只帮助检查一条样本会走 AI 学习库、数据库候选规则、旧复用层、账号黑名单还是外接 AI；默认不写数据库、不调用外接 AI。线上默认样本已验证命中 `db_rule_pattern`，外接 AI 不需要运行，数据库也没有写入。公网首页、控制台和下载清单已验证 200，下载清单仍为 `buildId=2026-05-02-2157`、`extensionVersion=0.1.49`。
  - 2026-05-02 22:00 已发布网盘短引诱句补丁和 Safari 启动兜底到公网。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-2157`、`extensionVersion=0.1.49`，首页、控制台、下载清单均返回 200。`npm run cloud:audit-data-layer` 通过，仍确认单用户重复冲走不会自动进入公共规则；本轮没有 schema 变更或批量 D1 写入。
  - 2026-05-02 21:29 已发布新版下载包和同构键修正到公网。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-2124`、`extensionVersion=0.1.47`，首页和控制台返回 200。`npm run cloud:audit-data-layer` 通过，仍确认单用户重复冲走不会自动进入公共规则。
  - 2026-05-02 19:34 已修复“手动冲走/恢复写了样本但没有实时刷新数据库候选”的后台缺口。根因是 `recordModerationTrainingLabelFromEvent` 写入 `moderation_sample_labels` 后引用了不存在的 AI `decision` 变量，错误被保护逻辑吞掉，导致手动反馈侧没有立刻刷新 `moderation_rule_candidates`。新版改为手动 `manual_hide` / `manual_allow` 写完 label 后都刷新对应候选；单用户冲走仍只算候选证据，不会直接变公共规则，恢复仍是纠错和抑制。已部署公网 Worker Version ID `8480bcdf-8a69-45e8-8aa9-a981f41d7f2c`。随后运行 `npm run cloud:rebuild-rule-candidates`，自动备份 D1 到 `backups/d1/web25-2026-05-02T11-34-30-329Z-before-rule-candidates.sql`，候选整理结果：`active=223`、`candidate=66`、写入候选 289 条。`npm run cloud:audit-data-layer` 通过，仍确认单用户重复冲走不会自动进入公共规则。公网 `/downloads/latest.json` 仍为 `buildId=2026-05-02-1912`、`extensionVersion=0.1.46`，官网和控制台返回 200。本机 `/Applications/web2.5.app` 仍为 `BUILD_ID=2026-05-02-1912`，签名校验通过；真实 Safari 详情页验证 `build=2026-05-02-1912`、`flushes=16`、`manualButtons=16`、`sideButtons=3`、`articles=29`、`stage=scan:done`。
  - 2026-05-02 19:12 已部署 `BUILD_ID=2026-05-02-1912` 到公网。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1912`、`extensionVersion=0.1.46`，官网和控制台返回 200。真实 Safari 详情页验证通过：`build=2026-05-02-1912`、`flushes=15`、`manualButtons=15`、`sideButtons=3`、`articles=30`、`stage=scan:done`。`npm run cloud:audit-data-layer` 通过。
  - 2026-05-02 18:46 已部署 `BUILD_ID=2026-05-02-1846` 到公网。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1846`、`extensionVersion=0.1.45`，官网和控制台返回 200。发布前已备份线上 D1：`backups/d1/web25-2026-05-02T10-53-58-3NZ-before-avatar-evidence-schema.sql`；线上 `reply_ai_items` 已新增头像证据字段 `avatar_image_url`、`avatar_alt_text`、`avatar_evidence_tags_json`、`avatar_fetch_status`、`avatar_vision_requested` 并确认存在。`npm run cloud:audit-data-layer` 通过。
  - 2026-05-02 18:22 已部署 `BUILD_ID=2026-05-02-1822` 到公网。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1822`、`extensionVersion=0.1.44`，官网和控制台返回 200。Worker 同步新增 `pattern:poetic-slogan-lure-account` 数据库模式，并把“诗句式空洞中文模板 + 随机英文数字 handle”示例写进回复区 AI prompt，避免外接 API 只看到单条短正文时放过。
  - 2026-05-02 18:06 用户完成 Cloudflare 重新登录后，已成功部署 `BUILD_ID=2026-05-02-1756` 到公网。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1756`、`extensionVersion=0.1.43`，官网和控制台返回 200。
  - 2026-05-02 17:56 Worker 源码已同步新增 `每晚准时大秀`、`找固定泡友`、`今晚准时涩播`、`蹲一个弟弟` 等风险昵称模式，并修复回复区 AI 提示词没有附带控制台补充审核要求的问题。回复区 AI prompt 现在会带默认规则、中文垃圾昵称示例和控制台补充审核要求。
  - 2026-05-02 17:47 Worker 源码已同步新增 `看我主页 + 附近真实约见` 风险昵称规则，并通过 `npm run cloud:check`，但公网发布没有完成：Cloudflare 返回 `Invalid access token [code: 9109]` / `Authentication error [code: 10000]`。因此公网 Worker 和 `/downloads/latest.json` 仍停在 17:31 的 `BUILD_ID=2026-05-02-1726`，需要重新登录 Cloudflare 后再发布。
  - 2026-05-02 17:31 已部署截图漏网模板修复。公网测试 7 条截图同款样本全部返回 `db_rule_pattern` 或 `db_rule_template`、`hide/high`，`model=moderation-rule-candidates-2026-05-02-v1`，说明数据库学习库先截住，不调用外部 AI。公网首页、控制台和 `/downloads/latest.json` 均返回 200，下载清单为 `buildId=2026-05-02-1726`。
  - 2026-05-02 17:11 已部署数据库优先截住低信息风险账号回复补强。公网真实接口测试 `孟轩🌸无常线下🌸 @MullerChri42258 / 2🙃😍🧡` 返回 `db_rule_pattern/hide/high`，`model=moderation-rule-candidates-2026-05-02-v1`，说明命中数据库学习库，不调用外部 AI。公网首页、控制台和 `/downloads/latest.json` 均返回 200，下载清单为 `buildId=2026-05-02-1650`。
  - 2026-05-02 15:24 已上线数据库接管层，随后 15:45 为发布新版 Safari 下载包重新部署，当前 Worker Version ID 为 `8b9891cf-236d-4b89-a547-2e68f1c45697`。云端在调用外部 AI 前会先查 `reply_ai_memory` 和 `moderation_rule_candidates`；命中候选规则时返回 `db_rule_*`，不再花外部 AI 调用。线上候选库核验：`active=222`、`candidate=64`。`找个同城的哥哥` 和 `pattern:geo-relationship-bait` 已可由数据库直接接管；`pattern:geo-meetup-bait` / `template:hook+meetup` 保持候选，避免把正常附近讨论一刀切。
  - 2026-05-02 15:26 已用真实云端接口验证：测试样本 `找个同城弟弟` 命中 `db_rule_pattern` 并隐藏，测试 item `1097/1098` 没有产生新的外部 AI 调用。
  - 2026-05-02 13:55 已上线旧数据回填学习库接口：`POST /api/developer/backfill-training`。已把旧 `manual_hide/冲走`、`manual_allow/恢复`、AI 首次判断整理成样本和标注，并把旧 AI 高置信隐藏补进 AI 记忆库。只读核验：`moderation_samples=1220`、`moderation_sample_labels=1226`、`reply_ai_memory active=84`。
  - 2026-05-02 已完成并部署 `AI 首判、云端记忆复用`：新增 `reply_ai_memory`，只学习 AI 直接高置信隐藏结果；命中记忆展示为 `AI 学习库屏蔽`；`manual_hide/冲走` 不直接教数据库，`manual_allow/恢复` 会停用对应 AI 记忆。
  - 2026-05-02 起，`/api/state` 不再把公共精确规则合并到插件本地手动隐藏列表；公共规则和高共识模板只作为送云端 AI 判断的参考信号。
  - 数据分层防线已上线：自动全局精确规则按多贡献者计数，优先使用 `user_id`，同一账号多设备不能伪装成多人共识。
  - 2026-05-01 已部署通用大模型兼容适配；稳定硬规则筛选基线本身未改。
  - 2026-05-01 已修复 AI 设置保存 bug：保存开关、模型或提示词时，如果没有提交新的 Key，会保留原来的加密 Key，不再把空输入框误当成清空 Key。稳定硬规则筛选基线本身未改。
  - 2026-05-01 已收紧回复区 AI 辅助层口径：正常成人话题、色情讨论、性教育/平台治理讨论不应仅因色情词被隐藏；基础层只压诈骗、约见引流、联系方式、木马/安装包、资源包、主页诱导、空洞钓鱼，以及由名字、handle、主页简介、主页外链等账号证据支撑的低信息垃圾。普通短句不能只因短就隐藏，`meaningless_bait` 必须有风险账号或导流证据支撑。提示词包见 `docs/ai-prompt-packs/sexual-leadgen-foundation/`。
  - 控制台 AI 隐藏记录支持“恢复误判”，会把单条 AI 结果改成 `manual_allow/allow`，不作为公共规则反向训练。
  - 2026-05-02 13:55 轻量样本闭环已上线：新发生的 `manual_hide` / `manual_allow` 和 AI 首次判断会写入 `moderation_samples` / `moderation_sample_labels`，但仍不会自动变成公共规则。
  - 2026-05-02 已部署公共地标附近问句误伤修正，稳定硬规则的主强度未放松。
  - 2026-05-02 已部署恢复记录的底层统一口径：同一条内容后来被 `manual_allow/恢复` 后，旧的 `auto_hide` / `manual_hide` / 广告隐藏事件不再算当前有效屏蔽，也不再出现在控制台当前明细或开发者待整理池里。原始 D1 历史保留，用于追溯，不作为当前规则库继续生效。
  - 2026-05-02 16:34 本轮 Worker 规则代码已同步补 `无线/无限/无常/无偿 + 线下` 显示名绕写和 `🌸` 招揽昵称装饰识别，并已部署到公网 Worker Version ID `71fc1d62-7185-4e64-9019-e6f10ab3bf45`。

## 如果未来真的要改筛选，必须先做什么

只有在用户明确要求调整筛选风格时，才允许改。

改之前先做：

1. 明确是要 `更严`、`更松`，还是只修某一类漏网
2. 先列出会影响到的典型样本
3. 不要直接动一堆规则，优先做小范围定向加权

改之后必须同时完成：

1. 更新本地扩展规则
2. 更新云端 Worker 规则键
3. 重新编译 Safari App
4. 重新部署 Cloudflare Worker
5. 用真实样本回归验证

## 给下一任助手的话

如果你读到这份文件，请默认把当前筛选机制当作稳态资产。

除非用户明确要求，不要自作主张：

- 降低当前筛选强度
- 大改评分机制
- 改成另一套“更先进”的抽象策略
- 只动本地不动云端
- 只动云端不动本地

一句话：

**当前这版已经被用户明确认可，默认守住，不要乱秀操作。**
