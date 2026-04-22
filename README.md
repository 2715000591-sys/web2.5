# web2.5

web2.5 是一个站在用户一侧的本地内容控制层。这个仓库先做第一版 MVP:

- 平台: `X` 网页版
- 载体: `Safari` 浏览器扩展
- 范围: `单条帖子详情页` 的 `中文回复`
- 目标: 默认隐藏明显的色情引流、诈骗式搭话、低质量刷屏回复
- 原则: `保守优先`, 宁可漏掉, 尽量别误伤

## 当前 MVP 规则

- `你已关注的账号` 永远不隐藏
- `蓝标账号` 默认不隐藏
- 先不使用 AI, 只使用本地规则判断
- 只在帖子最底部显示一条轻提示:
  - `已隐藏 N 条可疑回复`

## 仓库结构

```text
docs/
  mvp.md               产品边界和后续路线
  run-in-safari.md     Safari 临时安装说明
extension/
  manifest.json        Web Extension 清单
  popup.html           插件弹窗
  popup.css
  popup.js
  content/
    rules.js           本地规则引擎
    content.js         X 页面扫描与隐藏逻辑
    styles.css         提示条样式
```

## 在 Safari 里试跑

Apple 官方文档说明了两种方式:

- 可以先把一个普通 `web extension folder` 临时装进 macOS Safari 里测试
- 之后再用 Xcode 的 Safari 打包工具生成正式工程和 App 容器

当前这台机器还没有安装 Xcode Command Line Tools, 所以这版先把扩展源文件搭好。你后面具备开发工具后, 可以按官方文档继续:

- `Running your Safari web extension`
- `Packaging a web extension for Safari`

官方文档:

- https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension
- https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari

## 第一版已实现的判断思路

- 看 `原帖内容`
- 看 `回复文本`
- 看 `公开账号信号`
  - 是否蓝标
  - 是否你已关注
- 用保守的本地打分规则决定是否隐藏

## 下一步

- 用你继续提供的截图/样本补充话术库
- 加入“这条不该隐藏 / 这条应该隐藏”的反馈按钮
- 在样本足够后再引入 AI 作为辅助判断层

## 网页控制台

我已经补了一个可部署的公开网页骨架，在这里：

- [site/index.html](/Users/boriszhang/Documents/Codex/project%201/site/index.html)
- [site/styles.css](/Users/boriszhang/Documents/Codex/project%201/site/styles.css)
- [site/app.js](/Users/boriszhang/Documents/Codex/project%201/site/app.js)

这个网页后面会承接：

- 扩展下载
- 被整理内容的审查面板
- 高频话术与风险回复总览
- 未来的 API 配置和跨设备同步

网页控制台的产品说明在这里：

- [docs/web-console-plan.md](/Users/boriszhang/Documents/Codex/project%201/docs/web-console-plan.md)

## 最小真实后台

项目现在已经有一个最小后台和 SQLite 数据库，用来承接扩展的真实同步数据：

- [backend/server.mjs](/Users/boriszhang/Documents/Codex/project%201/backend/server.mjs)
- [package.json](/Users/boriszhang/Documents/Codex/project%201/package.json)

启动方式：

```bash
npm run backend
```

默认会启动在：

```text
http://127.0.0.1:8787
```

如果你只是想把控制台打开，不想自己敲命令，现在可以直接用：

- 双击 `open-web25-console.command`
- 或运行：

```bash
npm run console:open
```

如果你想把它做成“重启电脑后也能直接点 Safari 收藏夹打开”，仓库里也准备好了开机自启脚本：

```bash
npm run console:install-autostart
```

当前也可以用这个命令检查本地后台状态：

```bash
npm run console:status
```

当前最小闭环是：

- 扩展在 `X` 里手动 `标记可疑 / 恢复此条`
- 事件写进 SQLite
- 网页控制台通过 `syncKey` 读取真实数据
