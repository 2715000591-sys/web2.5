# Colorful Toilet 当前稳定筛选状态

最后整理日期：2026-05-04

这份文件记录当前 X / Safari 回复筛选的稳定基线。它不是历史发布日志。改筛选前先读这里，确认不要改坏用户已经认可的体验。

## 1. 当前结论

当前稳定版本：

- `BUILD_ID=2026-05-04-1159`
- 扩展版本：`0.1.76`
- App / Extension 版本：`1.0.76 (77)`
- Worker Version ID：`febe67c9-e44a-4f28-a563-f71c0f25e4f2`

当前总体方向：

- 数据库 / AI 学习库先处理已知垃圾。
- 数据库不知道但可疑的内容尽快交给 AI。
- AI 判定垃圾后，页面撤掉，并写回标注、记忆和候选规则。
- AI 判定没问题，内容留在页面上。
- 临时隐藏只用于极高风险内容，不是默认体验。
- 普通正常回复不能全量进 AI。

2026-05-04 11:59 最新修复重点：明显高风险候选进入后台后不能长期停在 `pending`。前端和 Worker 的回复 AI 单批为 4 条，前端等待后台结果为 55 秒，Worker 写入 pending 后会安排后台补判；页面收到“AI 批量结果不完整”会重新排队。

## 2. 必须守住的命中能力

以下类型默认必须能压住：

- 地点搭讪问句：`有万达广场附近的吗`、`有附近的吗`、`离得近的吗`
- 关系诱导：`哥哥我想要`、`有哥哥找下吗`、`找个同城的哥哥`
- 主页 / 账号导流：`主页置顶看id`、`搜我小号 vx123456`、`主页简介自取福利`
- 风险昵称配极薄回复：显示名带 `免费破处`、`无偿`、`同城`、`线下`、`搭子`、`附近的来`，正文只是 `dd`、数字、符号、emoji
- 随机英文数字账号发无关短口号：诗句式空话、中英混合短口号、重复英文标签、装饰符号壳
- 网盘 / 链接诱导：`是不是这个 / 是这个吗 / 就是这个 + 网盘链接`
- 明显线下对接或真实社区诱导昵称：`线下/同城/附近 + 对接/牵线/安排/资源/接待/社区`，`真实/真人/唯一 + 社区/资源/对接/约见`

## 3. 必须避免的误伤

以下类型默认不应该被直接自动下沉：

- `Apple ID 一直登不上`
- `我在万达广场附近上班`
- `万达广场附近有什么好吃的`
- `附近有家面馆不错`
- `有没有天安门附近的`
- `有没有天安门广场附近的`
- 普通账号正常说 `hi` / `ok`
- 和原帖强相关的尖锐、粗口、反驳、吐槽，例如原帖在讨论没钱/有钱时，回复 `你穷怕了` 应优先保护
- 正常成人话题、色情治理讨论、性教育讨论，不能只因色情词隐藏

公共地标附近问句不能一刀切。`有没有天安门附近的` 这类可能是玩梗或正常讨论；只有叠加 `可约`、联系方式、主页导流、风险账号画像等证据才应处理。

## 4. 当前关键模式键

本地和云端应保持同构的模式键：

- `pattern:geo-meetup-bait`
- `pattern:geo-relationship-bait`
- `pattern:bait-question-shape`
- `pattern:low-information-lure-account`
- `pattern:low-information-strong-lure-name`
- `pattern:share-link-scam`
- `pattern:spam-template-signal`
- `pattern:mention-lure-redirect`
- `pattern:explicit-erotic-bait`
- `pattern:poetic-slogan-lure-account`
- `pattern:decorative-slogan-lure-account`
- `pattern:emoji-noise-lure-account`
- `pattern:bilingual-short-slogan-lure-account`
- `pattern:generic-short-slogan-lure-account`

如果新增高价值模式键，必须同时考虑：

- `extension/content/content.js` 是否发出同名键
- `cloudflare/src/index.js` 是否认识同名键
- `docs/current-stable-filter-state.md` 是否记录该键的目的和误伤边界

## 5. 当前实现原则

不要只靠一个总分阈值硬压。当前更稳的做法是组合证据：

- 回复正文
- 显示名
- @handle
- 主页简介和主页链接
- 主帖上下文
- emoji / 装饰符 / 链接 / 联系方式
- 是否与主帖脱节
- 是否是批量账号或随机数字账号形态

作者显示名必须完整提取，不能只取第一段。风险名字如 `蒋萝莉❤️免费破处❤️` 必须完整进入判断。

DeepSeek 当前不能直接看头像图片里的字。头像如果明显有招嫖或导流文字，先说明模型限制；除非接入并验证视觉能力或 OCR，否则不要让 AI 凭空猜头像内容。

## 6. 用户截图的正确处理方式

用户发漏网截图，优先当作 AI / 数据库学习链路诊断素材。

先看：

- 真实 DOM 里回复正文到底是什么
- 显示名和 handle 是否有风险
- emoji 是否藏在图片 alt 里
- 头像 / 图片证据是否真的传给 AI
- 主帖上下文是否拿到了
- 是否进入 `reply_ai_items`
- 对应结果是 `pending`、`failed` 还是 `ready`
- 是否命中数据库记忆或候选规则

不要直接把截图里的具体词写死到本地规则。只有模式稳定、误伤边界明确、有 AI / 数据库证据，或用户明确确认后，才固化为本地和 Worker 同构规则。

## 7. 数据安全边界

- `manual_hide` / `冲走` 是垃圾候选样本。
- `manual_allow` / `恢复` 是纠错和抑制。
- 单个用户重复冲走不能自动变公共规则。
- 公共升级需要多贡献者或开发者确认。
- 改数据库结构、清理、迁移或批量写入前必须备份 D1。

## 8. 改筛选前后要做什么

改之前：

1. 明确是修漏网、减少误杀，还是调整 AI 路由。
2. 列出会影响的典型垃圾样本和正常反例。
3. 优先做小范围定向加权，不大改架构。

改之后：

1. 本地扩展和 Worker 保持同构。
2. 更新 `BUILD_ID`。
3. 跑语法检查和云端检查。
4. 影响用户马上能用的公网结果时，发布公网。
5. 影响 Safari 扩展时，替换并验证 `/Applications/web2.5.app`。
6. 更新本文档和 `docs/next-thread-handoff.md`。

## 9. 最小验证命令

```bash
node --check cloudflare/src/index.js
node --check extension/content/rules.js
node --check extension/content/content.js
npm run cloud:check
npm run cloud:audit-data-layer
```

需要真实页面验证时：

```bash
npm run safari:verify-live
```

## 10. 给下一任助手的话

当前这版筛选是用户认可的稳定资产。除非用户明确要求，不要自作主张降低强度、重写评分机制、改成另一套架构，或者只改本地不改云端。

一句话：守住已知稳定效果，修问题要小步、同构、可验证。
