# Colorful Toilet Cloudflare 公网部署和维护

当前 `Colorful Toilet` 已经跑在 Cloudflare 公网上。这份文件不是首次上线计划稿，而是以后重新部署、迁移、排查公网问题时看的维护说明。

当前公网结构：

- 官网首页：公开访问
- 控制台：登录后访问
- 后台 API：Cloudflare Worker
- 数据库：Cloudflare D1

## 目录

- Worker 入口：`cloudflare/src/index.js`
- D1 初始化：`cloudflare/schema.sql`
- Wrangler 配置：`wrangler.jsonc`

## 重建或迁移前需要准备

1. Cloudflare 账号
2. 当前 D1 数据库，或明确要迁移到的新 D1 数据库
3. 邮件发送服务，或者保留开发者调试登录作为维护入口
4. 当前 Cloudflare 默认域名，或以后确认的新正式域名

## 本地开发

```bash
npm run cloud:dev
```

如果需要本地 D1：

```bash
npm run cloud:d1:apply:local
```

本地环境变量可以先复制：

```bash
cp .dev.vars.example .dev.vars
```

## 需要配置的环境变量

- `APP_URL`
- `RESEND_API_KEY`（推荐，直接走 Resend）
- `EMAIL_SEND_ENDPOINT`
- `EMAIL_SEND_TOKEN`
- `EMAIL_FROM`
- `ALLOW_DEVELOPER_DEBUG_CODE`
- `DEVELOPER_EMAILS`
- `OTP_TTL_MINUTES`
- `OTP_RESEND_SECONDS`
- `SESSION_TTL_DAYS`
- `GLOBAL_RULE_MIN_CONTRIBUTORS`
- `GLOBAL_RULE_MIN_SCORE`

## 重新部署或迁移顺序

1. 确认 `wrangler.jsonc` 里的 `database_id` 指向正确 D1
2. 如果是新数据库，先备份旧 D1，再执行初始化 SQL
3. 确认邮件发送或开发者调试登录仍可用
4. `npm run cloud:check`，这会顺便确认回复 AI 教材生成文件没有落后
5. `npm run cloud:deploy`，发布前会自动同步回复 AI 教材
6. 如果公网地址变了，再同步更新 Safari 插件里的服务地址

重新部署后建议跑一次只读数据分层审计：

```bash
npm run cloud:audit-data-layer
```

这个脚本会用开发者调试验证码登录，然后读取 `/api/developer/data-layer-audit`，检查个人统计、公共规则、syncKey 绑定和单用户污染风险。

如果本机直连 `workers.dev` 超时，脚本会在 macOS 上自动读取系统 HTTPS 代理并用 `NODE_USE_ENV_PROXY=1` 重启自己。当前常见代理地址是 `127.0.0.1:7897`。

## 重新部署前必须确认的三件事

1. Cloudflare 的发布权限已经真正可用
2. D1 数据库指向正确，不要误连到空库或测试库
3. 要么邮件发送服务已经接通，要么开发者邮箱白名单已经配好，不然生产环境里验证码登录会卡住

## 当前推荐的发信方式

优先用 `Resend`：

- `RESEND_API_KEY` 放到 Worker secret
- `EMAIL_FROM` 填成你在 Resend 里已经验证过的发件地址

如果你已经有自己的邮件发送网关，也可以继续沿用：

- `EMAIL_SEND_ENDPOINT`
- `EMAIL_SEND_TOKEN`
- `EMAIL_FROM`

当前代码逻辑是：

- 只要配置了正式发信服务，普通用户和开发者都会优先收到真实邮件验证码
- 只有没配置发信服务时，开发者邮箱才会退回到调试验证码模式
- 开发者调试验证码是否可用，取决于 `ALLOW_DEVELOPER_DEBUG_CODE=true` 且 `DEVELOPER_EMAILS` 里确实有对应邮箱

## 现在这版已经具备的能力

- 公开首页
- 邮箱验证码登录
- 登录后绑定插件同步密钥
- 全局共享累计统计
- 个人累计统计
- 回复审查区继续只看个人回复记录
- 插件事件继续通过 `syncKey` 进入后台

## 这轮还没有做的事

- AI 个性化内容偏好
- 多浏览器正式发布流程
- 更强的全局规则物化与后台审核台
