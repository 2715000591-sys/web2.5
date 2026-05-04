# 内容审核数据库训练方案

最后整理日期：2026-05-04

这份文件说明“AI 老师”和“数据库记忆本”怎么配合。它不是历史日志。改数据库学习闭环、样本标注、候选规则、记忆复用时先看这里。

## 1. 核心判断

不要把数据库理解成“训练好了一个模型”。当前数据库更像：

- 事实库：保存真实样本、原帖上下文、账号线索。
- 标注库：保存用户、开发者、AI 的判断。
- 记忆库：保存 AI 高置信判断后可复用的结果。
- 候选规则库：把重复出现的模式提炼出来，等足够可靠后再启用。

一句话：AI 先当老师判断新东西，数据库记住老师讲过的题。

## 2. 当前目标路线

```text
用户或插件产生事件
  ↓
写入 moderation_events / reply_ai_items
  ↓
抽取成 moderation_samples
  ↓
用户反馈、开发者审核、AI 判断写入 moderation_sample_labels
  ↓
统计重复模式，刷新 moderation_rule_candidates
  ↓
AI 高置信隐藏写入 reply_ai_memory
  ↓
后续同类内容优先由数据库 / 记忆库处理
```

页面体验目标：

- 已知垃圾由数据库和记忆库快速处理。
- 未知可疑内容尽快交给 AI。
- AI hide 后下沉，并教数据库。
- AI allow 后保留或恢复可见。
- 临时隐藏只用于极高风险，不是默认流程。

## 3. 数据分层

公共基础层：

- 大多数用户都不想看到的招嫖、诈骗、黑产联系方式、账号导流、高频垃圾模板。
- 可以由数据库规则、候选规则、账号风险和 AI 记忆处理。

样本标注层：

- 用户冲走、用户恢复、开发者确认、AI 判断都先成为样本和标注。
- 不要把任何单次反馈直接变成公共规则。

个人偏好层：

- 个人不喜欢的话题、语气、账号风格以后再做。
- 不能污染公共规则库。

## 4. 关键表用途

`moderation_samples`：

- 存内容事实，不是最终结论。
- 适合保存回复文本、主帖上下文、显示名、handle、归一化文本、特征键、来源。

`moderation_sample_labels`：

- 存每一次判断。
- 来源可以是用户、开发者、AI、规则。
- `decision` 包括 `hide`、`allow`、`review`、`unknown`。

`moderation_rule_candidates`：

- 存从样本里提炼出的候选规则。
- 记录正向证据、抑制证据、贡献者数量、置信度、状态。
- 状态包括 `candidate`、`active`、`rejected`、`revoked`。

`reply_ai_memory`：

- 存 AI 直接高置信隐藏后可复用的记忆。
- 用户恢复误判后，对应记忆应停用。

## 5. 手动反馈口径

`manual_hide` / `冲走`：

- 可以成为垃圾候选样本。
- 可以帮助刷新候选规则。
- 单个用户反复冲走不能直接变成公共规则。

`manual_allow` / `恢复`：

- 表示这条不应继续按垃圾处理。
- 是纠错和抑制证据。
- 不能当成“用户喜欢这类内容”。
- 不能自动训练成公共放行规则。

同一用户或同一同步身份下，同一条回复后来被恢复后，旧的自动隐藏或手动隐藏只能保留作历史，不再算当前屏蔽、当前统计、当前明细或待上传规则候选。

## 6. 公共规则升级原则

候选规则升级为公共规则，需要满足可靠证据：

- 多贡献者共识，或
- AI 高置信判断沉淀，或
- 开发者明确确认。

同一账号的多个设备不能伪装成多人共识。自动全局精确规则优先按 `user_id` 计贡献者，未登录时才退回 `sync_key`。

## 7. AI 老师参与原则

用户已经明确：前期学习阶段不要为了省 token 让用户本人反复手动训练数据库。

应更积极送 AI 老师看的候选：

- 高风险昵称。
- 随机数字账号配低信息回复。
- 头像 / 图片有疑似招嫖或导流证据。
- 数据库已命中但值得抽查复核的高风险项。
- 新出现的重复模板。
- 上下文脱节的短口号、emoji 噪音、装饰符号壳。

仍然不能做：

- 普通正常回复全量进 AI。
- 没证据就扩大付费调用。
- 只为省实现步骤而把低风险内容先藏起来。

## 8. 当前已知能力边界

- 当前 DeepSeek 配置不能直接看头像图片文字。
- 头像证据可以作为“需要图片/OCR”的标签，但不能让 AI 脑补看不见的内容。
- 如果要接 OCR 或视觉模型，属于可能产生费用的新能力，先向用户说明。

## 9. 常用诊断

排查真实页面学习链路：

1. 看是否有新的 `reply_ai_items`。
2. 看是否有对应 `reply_ai_results`。
3. `pending` 表示等待最终判断，不等于 AI 放过。
4. `ready` 才是最终可用结论。
5. 开发者探针默认不写数据库，不能代替真实页面记录。

排查候选规则：

1. 看样本是否写入 `moderation_samples`。
2. 看 label 是否写入 `moderation_sample_labels`。
3. 看候选是否刷新到 `moderation_rule_candidates`。
4. 看候选是 `candidate` 还是 `active`。
5. 看是否有 `manual_allow` 抑制证据。

## 10. 高风险动作

这些动作先备份 D1，并向用户解释：

- 改 schema。
- 数据迁移。
- 批量重建候选规则。
- 清理线上数据。
- 批量回填训练样本。

绝不删除真实用户历史，除非用户明确要求删除某类已核验目标数据。

## 11. 关键代码位置

- 样本抽取：`buildModerationTrainingSourceRow`
- 样本写入：`upsertModerationTrainingSample`
- 标注写入：`insertModerationTrainingLabel`
- 事件反馈标注：`recordModerationTrainingLabelFromEvent`
- AI 判断标注：`recordModerationTrainingLabelFromReplyAiDecision`
- 候选刷新：`refreshModerationRuleCandidatesForSourceRow`
- 候选重建：`rebuildModerationRuleCandidates`
- AI 记忆写入：`upsertReplyAiMemoryFromDecision`
- AI 记忆停用：`deactivateReplyAiMemoryForItem`

主要文件：`cloudflare/src/index.js`。

## 12. 验证命令

```bash
node --check cloudflare/src/index.js
npm run cloud:check
npm run cloud:audit-data-layer
```

需要看单条样本路线：

```bash
npm run cloud:probe-reply-ai -- --text "样本文字" --display-name "昵称" --handle "账号"
```

一句话：数据库学习要稳，先保事实和标注，再让 AI 高置信、多贡献者或开发者确认推动规则升级。
