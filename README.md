# web2.5 / Colorful Toilet

Colorful Toilet 是一个站在用户一侧的 X / Safari 内容整理工具。当前重点不是展示概念，而是让真实 X 页面里的低质量、招嫖引流、诈骗导流、空洞批量回复更快下沉，同时尽量保护正常评论。

## 当前状态

当前稳定锚点见：

- `AGENTS.md`
- `docs/next-thread-handoff.md`
- `docs/current-stable-filter-state.md`
- `docs/current-stable-ui-state.md`

截至 2026-05-04，当前最新版本是：

- `BUILD_ID=2026-05-04-1159`
- 扩展版本：`0.1.76`
- 公网：`https://colorful-toilet.colorful-toilet.workers.dev/`
- 控制台：`https://colorful-toilet.colorful-toilet.workers.dev/console/`

## 产品主线

当前回复审核路线是：

```text
本地插件先挑可疑回复
  ↓
云端先查数据库和 AI 学习库
  ↓
已知垃圾直接下沉
  ↓
未知但可疑的内容尽快交给 AI
  ↓
AI 判断结果写回标注、记忆和候选规则
```

也就是说，AI 是老师，数据库是记忆本。不要把用户的一张截图直接改成一堆固定短语规则；先判断 AI / 数据库为什么没学会。

## 目录地图

当前主线：

- `extension/content/rules.js`：本地规则引擎
- `extension/content/content.js`：X 页面扫描、下沉、恢复、AI 候选队列
- `cloudflare/src/index.js`：公网后台、AI 路由、数据库学习库、控制台 API
- `cloudflare/schema.sql`：数据库结构
- `site/`：官网和控制台页面
- `web2.5/`：Safari App 工程
- `scripts/`：构建、发布、审计、真实页面验证脚本

已经从主线清掉的旧入口：

- 旧本地后台 `backend/server.mjs`
- 旧主页信息采集实验扩展 `home-feed-extension/`
- 旧 Pages 重定向项目 `legacy-pages-redirect/`
- 旧 MVP / 临时 Safari 文档

如果以后需要查这些历史，用 Git 历史搜，不要把它们恢复到主线误导新人。

## 常用命令

一键体检：

```bash
npm run doctor
```

完整体检：

```bash
npm run doctor:full
```

单独语法检查：

```bash
node --check cloudflare/src/index.js
node --check extension/content/rules.js
node --check extension/content/content.js
node --check site/app.js
```

公网后台检查：

```bash
npm run cloud:check
npm run cloud:audit-data-layer
```

发布公网：

```bash
npm run cloud:deploy
```

构建并验证本机 Safari App：

```bash
npm run safari:build
npm run safari:verify-live
```

查单条样本会走哪层：

```bash
npm run cloud:probe-reply-ai -- --text "样本文字" --display-name "昵称" --handle "账号"
```

## 工作规则

- 用户只听人话，先说能不能用、还差什么、下一步做什么；验证失败或卡在登录、权限、人机验证、付款时，讲清楚卡点并停下，不要绕过或假装完成。
- 下一步清楚、风险低、明显能满足用户目标时，继续做；只有发布公网、上传 GitHub、动真实数据库、花钱、改账号安全或可能让用户意外时才先问。
- 改官网、控制台、云端后台、AI 路由、数据库判断、下载包时，验证后要发布公网。
- 改本机 Safari 扩展时，要更新 `/Applications/web2.5.app` 并验证真实 X 页面加载新版。
- GitHub 上传是老板认可后的存档和交接：等用户对高完成度成果大幅度赞美、明确要求上传，或确认保存稳定节点时再做，不是每个小诊断都必须立刻做。
- 动真实数据库结构、清理、迁移或批量写入前，必须先备份并向用户解释风险。
- 用户累计屏蔽总数、广告/招嫖引流统计、`冲走` / `恢复` 历史、AI 判断和数据库学习库是产品记忆；代码清理和文档整理不能动这些数据。
- 会写线上 D1 的维护脚本需要 `WEB25_ALLOW_D1_WRITE=I_UNDERSTAND_PROTECTED_STATS` 才能运行写入；没有明确确认时只做 `--dry-run`。
