# 内容审核数据库训练方案

## 核心判断

现阶段不要把数据库理解成“训练好一个模型”，而要理解成：

- 收集真实样本
- 保留用户反馈和审核结论
- 把高共识内容沉淀成公共规则
- 给以后 AI 判断、评测、微调提供干净数据

也就是说，数据库先做事实层和证据层，AI 后面再做推断层。

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

## 近期最实用的下一步

先做一个小闭环：

1. 从 `manual_hide` 和 `manual_allow` 事件抽取样本
2. 给每条样本写入对应 label，其中 `manual_allow` 只写成“不应隐藏 / 不应升级”的抑制信号
3. 统计重复出现的 `pattern_key`
4. 只把高共识候选项展示给开发者确认
5. 确认后再进入现有全局规则机制

这条路线最省 API，也最不容易误伤。
