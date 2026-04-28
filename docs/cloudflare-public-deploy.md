# Colorful Toilet Cloudflare 公网部署

这版把 `Colorful Toilet` 拆成了：

- 官网首页：公开访问
- 控制台：登录后访问
- 后台 API：Cloudflare Worker
- 数据库：Cloudflare D1

## 目录

- Worker 入口：`cloudflare/src/index.js`
- D1 初始化：`cloudflare/schema.sql`
- Wrangler 配置：`wrangler.jsonc`

## 第一次部署前需要准备

1. Cloudflare 账号
2. 一个 D1 数据库
3. 一个邮件发送服务
4. 一个正式域名，或者先接受 Cloudflare 默认域名

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
- `GLOBAL_RULE_MIN_SYNC_KEYS`
- `GLOBAL_RULE_MIN_SCORE`

## 推荐上线顺序

1. 在 Cloudflare 创建 D1 数据库
2. 把 `wrangler.jsonc` 里的 `database_id` 改成真实值
3. 执行 D1 初始化 SQL
4. 配好邮件发送环境变量
  5. `npm run cloud:check`
  6. `npm run cloud:deploy`
  7. 把 Safari 插件里的同步服务地址改成正式网址

## 当前这版上线前还必须确认的三件事

1. Cloudflare 的发布权限已经真正可用
2. D1 数据库已经创建，`database_id` 不再是占位符
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
