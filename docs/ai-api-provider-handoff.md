# AI API 接入交接文档

最后整理日期：2026-05-04

这份文件只在改 AI 设置、模型、接口、Key、调用预算或 AI 路由时细读。普通筛选修复先看 `docs/next-thread-handoff.md` 和 `docs/current-stable-filter-state.md`。

## 1. 当前结论

AI 已经接入，不要让用户重复购买或重复提供 Key。

当前线上开发者账号：

- API 平台：DeepSeek
- 接口地址：`https://api.deepseek.com`
- 模型：`deepseek-v4-flash`
- API Key：已加密保存，只能显示后四位 `a6db`
- 当前产品版本：`BUILD_ID=2026-05-04-1159` / `extensionVersion=0.1.76`
- 当前 Worker Version ID：`febe67c9-e44a-4f28-a563-f71c0f25e4f2`

不要把完整 Key 写进代码、文档、命令、日志或 GitHub。

## 2. 给用户的人话口径

用户问 AI 准备好了吗，先这样说：

- “AI 已经接上了，不需要你重新买 API。”
- “如果某条漏网，要先看真实页面有没有把样本送到后台、后台是不是还在等待、AI 有没有最终判断。”
- “开发者探针能证明接口能跑，但不能证明真实 X 页面已经写入学习记录。”
- “如果要接新的看图能力或 OCR，可能会增加费用和风险，需要先说明再做。”

不要让用户判断接口格式、模型参数、错误码或命令输出。

## 3. 当前 AI 和数据库关系

当前目标不是让 AI 看所有内容，而是让 AI 当老师、数据库当记忆本：

```text
插件挑出可疑回复
  ↓
云端先查 AI 学习库 reply_ai_memory
  ↓
再查数据库候选规则 moderation_rule_candidates
  ↓
已知垃圾直接返回页面处理
  ↓
需要补课的高风险项后台给 AI 老师复核
  ↓
未知但可疑的内容调用外接 AI
  ↓
AI 高置信隐藏写入 reply_ai_results、moderation_sample_labels、reply_ai_memory、候选规则
```

关键判断：

- `reply_ai_items`：真实页面已经把样本送到后台。
- `reply_ai_results.status=pending`：后台收到样本，但还没有最终判断。
- `reply_ai_results.status=ready`：已经有最终可用判断。
- 开发者探针默认不写数据库，不要拿探针结果冒充真实页面学习记录。

## 4. 当前能力边界

DeepSeek 当前配置不能直接看头像图片里的字。遇到“全国安排 / 全国可飞”这类头像证据：

- 如果页面文字、昵称、handle、emoji 空回复、主帖无关性足够，要用这些可读证据处理。
- 不要让模型在没看到图片时凭空猜头像内容。
- 如果要让 AI 真正看图，需要先实测模型是否支持图片输入。
- 如果当前模型不支持图片，再考虑 OCR 或支持视觉的模型；这属于可能增加费用的能力扩展，先讲清楚再做。

## 5. 什么时候查 AI 设置

出现这些情况再查：

- 用户说“AI 没工作 / 没动 / 没有学习”。
- 真实页面有漏网，怀疑样本没进入 AI 队列。
- `reply_ai_items` 有新样本但长期没有 `ready` 结果。
- 控制台显示 AI 设置丢失、Key 后四位不对、额度不足或接口失败。
- 要换模型、换平台、接视觉能力。

先查真实页面链路，不要一上来改提示词。

## 6. 常用诊断路径

排查“AI 没工作”：

1. 看当前设备 `/api/state` 是否返回 `replyAiEnabled=true`。
2. 看真实页面是否写入新的 `reply_ai_items`。
3. 看对应 `reply_ai_results` 是 `pending`、`failed` 还是 `ready`。
4. 如果没进入队列，查 `extension/content/content.js` 的 `buildReplyAiModerationCandidate`。
5. 如果长期 pending，查前端批量发送、云端补判、批量结果是否完整。
6. 如果 AI 判错，查输入证据和提示词边界，不要把截图文字硬写成本地规则。

排查“是不是浪费 API”：

1. 先查是否命中 `reply_ai_memory`。
2. 再查是否命中 `moderation_rule_candidates`。
3. 高风险命中后继续给 AI 老师复核不一定是浪费，这是前期教学设计。
4. 普通正常回复不应该全量调用 AI。

## 7. 关键代码位置

- 扩展候选筛选：`extension/content/content.js` 的 `buildReplyAiModerationCandidate`
- 扩展队列发送：`extension/content/content.js` 的 `enqueueReplyAiDecision` 和批量发送逻辑
- 云端接收：`cloudflare/src/index.js` 的 `/api/reply-ai`
- 云端分类：`classifyReplyAiItemEntries`
- 学习库查询：`findReplyAiMemoryDecision`
- 外接 AI 调用：`requestReplyAiDecisionFromProvider` / `requestReplyAiBatchDecisionsFromProvider`
- 标注写入：`recordModerationTrainingLabelFromReplyAiDecision`
- 记忆写入：`upsertReplyAiMemoryFromDecision`
- 误判恢复：`markReplyAiItemAllowedByManualRestore` / `deactivateReplyAiMemoryForItem`

## 8. 验证命令

改 AI 路由或接口后至少跑：

```bash
node --check cloudflare/src/index.js
node --check extension/content/rules.js
node --check extension/content/content.js
npm run cloud:check
npm run cloud:audit-data-layer
```

查一条样本路线：

```bash
npm run cloud:probe-reply-ai -- --text "样本文字" --display-name "昵称" --handle "账号"
```

真实调用外接 AI 时才加 `-- --call-provider`，这会消耗少量额度。

## 9. 高风险提醒

这些动作先停下来讲清楚：

- 接新的付费 AI / API。
- 换模型导致费用、速度、能力边界变化。
- 接 OCR 或视觉模型。
- 改密钥、`.dev.vars`、Worker secret。
- 批量重跑真实数据或写入生产数据库。

一句话：AI 已经能用，下一步重点是让真实页面样本稳定进入判断、稳定写回学习库，而不是让用户重新买 API。
