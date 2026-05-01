# AI API 接入交接文档

最后整理日期：2026-05-01

这份文档给下一任 Codex / 开发助手看。用户接下来准备购买或提供大模型 API。用户没有编程基础，解释时必须先说大白话结论，不要让用户判断接口、模型参数、部署、命令输出。

## 1. 当前结论

现在已经不是只能接 DeepSeek。

截至 2026-05-01，线上 Worker 已经支持通用大模型兼容接入，并且开发者账号已经接入 DeepSeek：

- 兼容接口地址：`https://api.deepseek.com`
- 模型：`deepseek-v4-flash`
- API Key：已加密保存，控制台只显示后四位 `bc09`

系统会自动尝试多种常见返回格式。大多数写着“兼容 OpenAI 接口”的平台，理论上都可以先试，不需要再为每个平台单独写死。

如果某个平台仍然失败，再按失败原因补单独适配。

## 2. 已经完成

- Cloudflare Worker 已部署通用大模型兼容适配。
- 官网控制台的 AI 配置文案已经改成通用说法，不再只提示 DeepSeek。
- 官网控制台的 AI 配置区已新增“测试一次 AI 接入”按钮。它会先保存设置，再发一条小样本测试 Key、接口地址、模型名是否能真实调用；只有用户手动点击才会消耗少量额度。
- DeepSeek `deepseek-v4-flash` 已接入线上开发者账号，并通过真实调用测试。
- 已补强通用 JSON 模式提示：当平台不支持严格 JSON Schema、只能走普通 JSON 对象模式时，Worker 会把允许使用的审核标签明确写进提示里，避免模型自造标签。
- 2026-05-01 已修复扩展侧 AI 排队保护：本地规则必须先判定为可疑候选，回复才会送入 AI 队列，避免无脑调用模型。
- 2026-05-01 已收紧基础审核口径：正常成人话题、色情讨论、性教育/平台治理讨论不应仅因色情词被隐藏；只隐藏约见导流、联系方式、诈骗、木马/安装包、主页诱导、空洞钓鱼等。
- 官网控制台“最近 AI 隐藏记录”已新增“恢复这条”。恢复会写入 `manual_allow`，并把对应 AI 结果改成 `manual_allow/allow`，用于纠正单条误判。
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
- Worker Version ID：`2b98554c-c410-46ec-8212-c6411221e5ef`
- Git commit：当前分支最新提交包含“测试一次 AI 接入”入口、DeepSeek JSON 标签提示补强、扩展侧 AI 排队保护

## 3. 还没完成

- 已接入真实 DeepSeek API Key，并已做小样本真实调用测试。
- 已产生少量测试调用消耗；2026-05-01 的 6 条小样本批量测试约消耗 `2805` token。
- 2026-05-01 的 4 条成人内容边界临时测试也产生少量调用消耗，但没有写入真实回复审核数据表。
- 还没有做真实 X 页面回复审核验收。
- 还没有确定 DeepSeek 长期是否最稳；目前先用便宜的 `deepseek-v4-flash`。

这不是功能坏了，而是下一步要去真实 X 页面看边界垃圾回复是否能被 AI 辅助层压住。

## 4. 用户去买 API 时怎么说

对用户只说这句就够：

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
2. 打开线上控制台：`https://colorful-toilet.colorful-toilet.workers.dev/console/`
3. 登录开发者账号。
4. 如果需要重新配置，在 AI 设置里填：
   - API Key
   - 兼容接口地址
   - 模型名字
5. 保存后确认控制台显示已保存 Key 后四位。
6. 在控制台点“测试一次 AI 接入”。这一步会消耗很少量 API 额度，只用来确认 Key、接口地址和模型名真的能调用。
7. 测试通过后，打开插件里的“回复区 AI 审核”开关。
8. 刷新 X 详情页。
9. 找边界垃圾回复做真实测试。
10. 确认 AI 隐藏记录出现在控制台。

如果第一次失败，不要立刻改筛选规则。先看失败是不是 API 平台不兼容、Key 无效、额度不足、接口地址填错、模型名填错。

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

如果改动扩展侧 AI 调度、候选过滤、页面采集或 BUILD_ID，需要重建并替换本机 Safari App。2026-05-01 已替换 `/Applications/web2.5.app` 到 `BUILD_ID = 2026-05-01-1924`。

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

1. 让用户提供一个便宜 API 的三项信息。
2. 先在控制台保存。
3. 当前 DeepSeek 小样本测试已经通过，下一步直接用一两条真实 X 回复做小额测试。
4. 看控制台 AI 隐藏记录是否出现。
5. 如果失败，记录具体失败原因，再补单个平台适配或提示词适配。

目标不是炫技接很多平台，而是让用户买到便宜 API 后，真实能跑、不会乱花钱、不会误伤稳定筛选。
