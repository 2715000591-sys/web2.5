# Colorful Toilet 当前稳定 UI 状态

## 这份文件的目的

这份文件记录的是当前 `X / Safari` 插件里，已经被用户明确认可的 `界面与交互稳态`。

它不是功能构想，也不是待办清单，而是当前默认应该守住的 UI 基线。

如果未来没有新的明确用户指令，下一任助手或开发者默认必须把这一版当作：

- `当前认可的交互状态`
- `不要轻易改坏的稳定体验`
- `右栏模块关闭能力的基准线`

## 当前已经稳定的右栏行为

当前右栏这七块，已经允许用户手动关闭：

- `订阅 Premium`
- `X 上的直播`
- `你可能会喜欢`
- `相关用户`
- `有什么新鲜事`
- `推荐关注`
- `服务条款 / 隐私政策 / Cookie 政策 / 辅助功能 / 广告信息 / 更多`

这七块当前必须满足：

- 右上角都有灰色小叉
- 点掉后只关闭自己，不误伤别的模块
- 关闭后下面的模块会自然顶上来
- 关闭后不能留下白色空框
- 关闭后不能让整个 X 页面白屏
- 站内跳转或详情页延迟渲染后，如果 X 自己把灰叉吃掉，插件要自动补挂回来

## 当前新增的用户开关口径

当前这项能力已经不是“默认强塞”的单向设计，而是用户可决定是否启用：

- Safari 插件左上角弹窗里有单独勾选
- 官网公开页里也有同一项偏好开关
- 用户登录账号后，这个偏好会尽量在官网和插件之间保持一致
- 如果用户主动关闭这项能力，就不要继续往右栏注入灰色小叉
- 这项用户开关当前优先级高于“默认展示能力”

## 当前官网控制台累计方格入口

截至 2026-05-02，官网控制台的屏蔽记录不应该继续只堆成长列表，也不应该继续展示一堆用户看不懂的旧来源方格。

控制台里需要把来源入口集成进 `你的累计成果` 那组已有 `metric-card` 方格里，不要再单独画一块新的“屏蔽来源入口”。这些方格按来源解释被挡内容：

- `累计跳过无用内容`：AI 直接屏蔽、AI 学习库屏蔽、手动冲走、官方广告跳过的总数
- `AI 直接屏蔽`：第一次交给 AI 新判断隐藏的回复
- `AI 学习库屏蔽`：AI 判过后被云端记住、下次没有再次调用 AI 的隐藏
- `你手动冲走`：用户手动标记的内容
- `跳过官方广告`：主页和回复区官方广告跳过合计

旧的 `数据库历史命中`、`公共数据库规则`、`账号黑名单`、`本地规则下沉`、`恢复误判`、`累计涉及账号数`、`累计高频话术数`、主页/回复区广告分卡，不再作为主方格展示。旧来源如果仍有数据，应归并到 `AI 学习库屏蔽` 或对应的手动/广告明细里。详情里要显示回复正文、账号、来源标签、简短原因、时间，并在有 X 链接时提供打开按钮。AI 隐藏类仍保留“恢复误判”能力。

2026-05-02 起，控制台前端改为“方格直达详情页”：

- 用户点击 `你的累计成果` 里的可查看方格后，直接跳到 `/console/?detail=...`，不再需要先展开下面的折叠列表。
- 原来 `官方广告记录` 和 `回复审查` 折叠区里的明细，已合并到这些方格背后的详情页里。
- 详情页顶部显示当前分类、条数和返回累计成果按钮；每条明细旁边保留恢复入口。
- 详情页不再显示控制台大标题、登录卡片、设备列表和累计方格，第一屏只端出当前方格背后的明细内容。
- 在来源详情页点 `恢复这条` / `恢复误判` 后，当前列表必须马上移除被恢复的原记录；刷新后也不能继续把同一条放在原来的来源方格里。
- 恢复结果必须跨详情入口生效：同一条内容恢复后，不能继续出现在 `本地规则下沉`、`累计自动整理`、底部近期审查列表或广告详情页中的原屏蔽记录里。
- 2026-05-02 AI 学习库改造后，详情入口固定为 `all_skipped`、`ai_direct`、`ai_memory`、`manual`、`ads`。
- 2026-05-02 用户再次明确认可当前主页和控制台形态：“主页做得挺好的了，控制台做得挺好的了，就按这样子做挺好的了。”后续不要借修 bug 顺手重设计控制台。
- 2026-05-02 13:55 控制台空正文文案已上线，显示为“这条回复当时没有可读取正文，系统保存了账号信息和判断原因。”，避免用户误以为数据库坏了。
- 2026-05-02 13:55 插件和 Worker 已进一步补强正文保存：新记录如果没有正文，会尽量保存 `账号线索：显示名 @handle`。这不是控制台重设计，只是避免后续训练样本空掉。

## 当前官网控制台设备显示口径

2026-05-02 代码侧已调整控制台 `已接入设备`：不再逐条显示底层 `device_id`。

- 主界面只突出当前这台设备和最近活跃时间。
- 旧的连接标识会折叠成一句“历史连接标识”说明。
- `device_dev_*`、`device_eval_*`、`device_test_*` 这类开发测试标识不应该被当成用户真实设备展示。
- 这是展示口径修正，不删除历史数据，也不改 D1 结构。
- 2026-05-02 用户完成 Cloudflare 登录授权后，已部署到公网 Version ID `f66362e3-0f48-46e0-9639-95bf51590205`，并验证控制台和详情页可打开。
- 2026-05-02 后续修复恢复后前台不同步，已部署到公网 Version ID `f54ff4e3-e820-4f34-840f-6a6da3c72cfa`。
- 2026-05-02 后续修复“累计自动整理”仍显示已恢复记录，已部署到公网 Version ID `29714654-a468-4df3-b5fb-2ce99b3dbb44`。
- 2026-05-02 已完成 5 块新方格和 AI 学习库口径，已部署到公网 Version ID `f931af5f-32ee-459d-ba1b-62b6dee83bb3`；公网首页、控制台、`/console/?detail=ai_memory`、`/downloads/latest.json` 均返回 200。

## 当前认可的刷新行为

当前右栏关闭状态的正确行为是：

- 在当前这次页面实例里，点叉后模块保持关闭
- 页面局部重渲染时，已经关闭的模块不要自己复活
- 但只要真正刷新页面，这些模块就应该重新出现
- 重新出现后，用户可以再次点叉关闭

也就是说，当前产品口径是：

**右栏关闭是“当前页面有效”，不是“跨刷新永久记忆”。**

## 当前必须守住的体验结论

下一任默认必须守住这些结果：

- `订阅 Premium` 可以被完整收起，不留空白
- `X 上的直播` 可以被完整收起，不留空白
- `你可能会喜欢` 可以被完整收起，不留空白
- `相关用户` 可以被完整收起，不留空白
- `有什么新鲜事` 可以被完整收起，不留空白
- `推荐关注` 可以被完整收起，不留空白
- 底部政策链接块可以被完整收起，不留空白
- 这七块之间的补位运动必须自然
- 主时间线、左栏、顶部导航不能因为点叉而消失

## 当前实现边界

这套能力当前是：

- `Safari 插件本地能力`
- 不依赖 Cloudflare Worker 才能生效
- 只要当前 Safari 实际加载到正确扩展版本，就可以直接使用

也就是说，这块不属于“必须云端参与才可用”的能力。

## 不要轻易改的地方

如果未来没有新的明确用户要求，不要自作主张：

- 改右栏叉子的视觉位置
- 把当前“刷新恢复”改回持久记忆
- 为了省事重新用粗暴 `display:none` 直接动大外层宿主
- 为了“更简洁”删掉安全壳层判断
- 顺手改坏前面的审查 / 评分 / 图片相关主链路

## 当前本机确认过的稳定版本

截至这次归档，当前本机确认可用的是：

- Safari 扩展 `BUILD_ID = 2026-05-02-0943`
- Safari 扩展 `BUILD_ID = 2026-05-02-1033`
- Safari 扩展 `BUILD_ID = 2026-05-02-1222`
- Safari 扩展 `BUILD_ID = 2026-05-02-1307`
- Safari 扩展 `BUILD_ID = 2026-05-02-1541`
- Safari 扩展 `BUILD_ID = 2026-05-02-1623`
- Safari 扩展 `BUILD_ID = 2026-05-02-1633`
- Safari 扩展 `BUILD_ID = 2026-05-02-1650`
- Safari 扩展 `BUILD_ID = 2026-05-02-1726`
- Safari 扩展 `BUILD_ID = 2026-05-02-1747`
- Safari 扩展 `BUILD_ID = 2026-05-02-1756`
- Safari 扩展 `BUILD_ID = 2026-05-02-1822`
- Safari 扩展 `BUILD_ID = 2026-05-02-1846`
- Safari 扩展 `BUILD_ID = 2026-05-02-1912`
- Safari 扩展 `BUILD_ID = 2026-05-02-2124`
- Safari 扩展 `BUILD_ID = 2026-05-02-2148`
- Safari 扩展 `BUILD_ID = 2026-05-02-2157`
- Safari 扩展 `BUILD_ID = 2026-05-02-2317`
- Safari 扩展 `BUILD_ID = 2026-05-02-2340`
- Safari 扩展 `BUILD_ID = 2026-05-02-2357`
- Safari 扩展 `BUILD_ID = 2026-05-03-0011`
- Safari 扩展 `BUILD_ID = 2026-05-03-0022`
- Safari 扩展 `BUILD_ID = 2026-05-03-0037`
- Safari 扩展 `BUILD_ID = 2026-05-03-1001`
- Safari 扩展 `BUILD_ID = 2026-05-03-1039`
- Safari 扩展 `BUILD_ID = 2026-05-03-1117`
- Safari 扩展 `BUILD_ID = 2026-05-03-1256`
- Safari 扩展 `BUILD_ID = 2026-05-03-1327`
- Safari 扩展 `BUILD_ID = 2026-05-03-1402`
- Safari 扩展 `BUILD_ID = 2026-05-03-2246`
- Safari 扩展 `BUILD_ID = 2026-05-03-2345`
- Safari 扩展 `BUILD_ID = 2026-05-04-0037`
- Safari 扩展 `BUILD_ID = 2026-05-04-0124`
- Safari 扩展 `BUILD_ID = 2026-05-04-0159`
- 扩展版本 `0.1.67`
- App / Extension 版本 `1.0.67 (68)`

2026-05-04 02:11 已替换本机 App 到 `BUILD_ID=2026-05-04-0159`，签名验证通过，App / Extension 版本为 `1.0.67 (68)`，manifest 为 `0.1.67`。本轮没有改右栏 UI，只修回复 AI 审核速度、低风险等待显示、自动重试和数据库命中不被后台老师复核拖慢；`npm run safari:verify-live` 对真实 X 首页和详情页通过：首页 `build=2026-05-04-0159`、`sidebar=1`、`sideButtons=5`、`marking=1`；详情页 `https://x.com/YLDLZN/status/2050723821460853237` 返回 `build=2026-05-04-0159`、`detail=1`、`sidebar=1`、`flushes=12`、`sideButtons=4`、`manualButtons=12`、`marking=1`、`articles=28`、`stage=scan:done`。

2026-05-04 01:29 已替换本机 App 到 `BUILD_ID=2026-05-04-0124`，签名验证通过，App / Extension 版本为 `1.0.66 (67)`，manifest 为 `0.1.66`。本轮没有改右栏 UI，只修 AI 等待判断期间低风险内容被先藏的问题，并把 AI 批量请求等待时间放宽到 30 秒；`npm run safari:verify-live` 对真实 X 首页和详情页通过：首页 `build=2026-05-04-0124`、`sidebar=1`、`sideButtons=5`、`marking=1`、`articles=4`、`stage=ads:done`；详情页 `https://x.com/ronronzi/status/2050591230275539384` 返回 `build=2026-05-04-0124`、`detail=1`、`sidebar=1`、`flushes=3`、`sideButtons=4`、`manualButtons=3`、`marking=1`、`articles=54`、`stage=scan:done`。

2026-05-04 00:59 已替换本机 App 到 `BUILD_ID=2026-05-04-0037`，签名验证通过，App / Extension 版本为 `1.0.65 (66)`，manifest 为 `0.1.65`。本轮没有改右栏 UI，只修“花体/上标英文标签 + 中文短口号”和“装饰符号壳 + 中文短口号”的筛选证据；`npm run safari:verify-live` 对真实 X 详情页通过：`build=2026-05-04-0037`、`detail=1`、`sidebar=1`、`flushes=1`、`sideButtons=4`、`manualButtons=1`、`marking=1`、`articles=12`、`stage=scan:done`。

2026-05-03 23:45 已替换本机 App 到 `BUILD_ID=2026-05-03-2345`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.64`。本轮没有改右栏 UI，只补“中英混合短口号 + 随机账号 + 与主帖无关”的筛选证据；`npm run safari:verify-live` 对真实 X 详情页通过：`build=2026-05-03-2345`、`detail=1`、`sidebar=1`、`flushes=10`、`sideButtons=4`、`manualButtons=10`、`marking=1`、`articles=13`、`stage=scan:done`。

2026-05-03 22:46 已替换本机 App 到 `BUILD_ID=2026-05-03-2246`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.63`。本轮没有改右栏 UI，只修真实页面 AI 写入/判断落库链路和 AI 批量大小；`npm run safari:verify-live` 对真实 X 首页通过：`build=2026-05-03-2246`、`sidebar=1`、`sideButtons=5`、`marking=1`、`articles=5`、`stage=ads:done`。当前打开的是首页，不是详情页，所以本轮没有可见 `冲走` 按钮样本；用户打开详情页后可继续补真实反馈。

2026-05-03 13:27 已替换本机 App 到 `BUILD_ID=2026-05-03-1327`，签名验证通过。UI 主体没改；只是为 AI 候选改成先显示 `AI 复审中` 的隐藏路线，并补 `附近的来` 这类风险昵称。`npm run safari:verify-live` 读到新版；真实 X 详情页 `https://x.com/yizhunli10167/status/2050601910487461905` 加载完成后 `build=2026-05-03-1327`、`stage=scan:done`、`articles=45`，`@hayes_jaco16929` 对应行 `display:none`。公网发布被 Cloudflare 登录令牌失效挡住，公网下载清单仍是上一版。

2026-05-03 13:02 已替换本机 App 到 `BUILD_ID=2026-05-03-1256`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.60`。本轮没有改右栏 UI，只提高 AI 老师实际参与强度并换新版包。`npm run safari:verify-live` 对真实 X 详情页 `https://x.com/YLDLZN/status/2050723821460853237` 通过：`build=2026-05-03-1256`、`detail=1`、`sidebar=1`、`flushes=6`、`sideButtons=3`、`manualButtons=6`、`marking=1`、`articles=22`、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-03-1256`、`extensionVersion=0.1.60`。

2026-05-02 13:59 换新 AI 前复查：`/Applications/web2.5.app` 签名验证通过，`pluginkit -e use -i com.yourCompany.web25.extension` 通过，`npm run safari:verify-live` 通过。真实 Safari `https://x.com/home` 返回 `BUILD_ID=2026-05-02-1307`。当前没有发现插件失效。

2026-05-02 追加硬约束：替换或重新构建 Safari App 后，必须重新确认 Safari 当前真实 X 页面已经注入扩展。只验证 app 文件、签名和 `BUILD_ID` 不够；要运行 `pluginkit -e use -i com.yourCompany.web25.extension` 和 `npm run safari:verify-live`，并看到真实 X 标签页返回当前 `BUILD_ID`、详情页有可见 `冲走` 按钮、右栏有可见关闭按钮。否则用户会看到“推特里插件都没了”。

2026-05-02 15:41 修正用户反馈：`回复下方显示“冲走”` 不能默认关闭。新版扩展把这项默认改为开启，并对旧安装做一次自动迁移；用户以后如果再主动关掉，仍按用户选择保存。`npm run safari:verify-live` 也已改为：真实详情页有回复却没有可见 `冲走` 时直接失败，不能只靠 `BUILD_ID` 通过。

2026-05-02 15:45 已发布包含 `BUILD_ID=2026-05-02-1541` 的公网下载包，Worker Version ID 为 `8b9891cf-236d-4b89-a547-2e68f1c45697`。公网首页、控制台和 `/downloads/latest.json` 已验证可访问，`latest.json` 返回 `buildId=2026-05-02-1541`。

2026-05-02 16:26 已替换本机 App 到 `BUILD_ID=2026-05-02-1623`，签名验证通过，`npm run safari:verify-live` 通过。当前打开的 X 页面能读到新版 build，但当时 X 没加载出回复列表，未看到可见 `冲走` 按钮样本。公网下载包已在本地生成，Cloudflare 发布因登录失效未完成。

2026-05-02 16:35 已替换本机 App 到 `BUILD_ID=2026-05-02-1633`，签名验证通过，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1633`、详情页有可见 `冲走` 按钮、右栏有关闭按钮。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-1633`。

2026-05-02 17:11 已替换本机 App 到 `BUILD_ID=2026-05-02-1650`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1650`、`flushes=16`、`manualButtons=16`、`sideButtons=3`、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-1650`。

2026-05-02 17:31 已替换本机 App 到 `BUILD_ID=2026-05-02-1726`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1726`、详情页有可见 `冲走` 按钮、右栏有关闭按钮。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-1726`。

2026-05-02 17:47 已替换本机 App 到 `BUILD_ID=2026-05-02-1747`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1747`、`flushes=7`、`manualButtons=7`、`sideButtons=3`、`articles=29`、`stage=scan:done`。公网下载包已在本地生成，但 Cloudflare 发布因登录令牌失效未完成，公网 `/downloads/latest.json` 仍是上一版 `buildId=2026-05-02-1726`。

2026-05-02 17:56 已替换本机 App 到 `BUILD_ID=2026-05-02-1756`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 标签页能读到 `build=2026-05-02-1756`，但当时 X 没加载出回复列表，返回 `articles=0`、`stage=scan:not-enough-articles`，所以只证明插件注入成功。2026-05-02 18:06 用户完成 Cloudflare 登录后，公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-1756`、`extensionVersion=0.1.43`。

2026-05-02 18:22 已替换本机 App 到 `BUILD_ID=2026-05-02-1822`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1822`、`flushes=4`、`manualButtons=4`、`sideButtons=3`、`articles=46`、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-1822`、`extensionVersion=0.1.44`，官网和控制台返回 200。

2026-05-02 18:46 已替换本机 App 到 `BUILD_ID=2026-05-02-1846`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari 首页标签页返回 `build=2026-05-02-1846`、`marking=1`、`stage=ads:done`。曾尝试打开旧详情页 `https://x.com/kittenhyl/status/2050347599266504791` 做更严格详情验证，但该 X 标签页停在 `stage=boot` 且 `articles=0`，属于 X 内容未加载，已关闭该卡住标签。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-1846`、`extensionVersion=0.1.45`，官网和控制台返回 200。

2026-05-02 19:12 已替换本机 App 到 `BUILD_ID=2026-05-02-1912`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1912`、`flushes=15`、`manualButtons=15`、`sideButtons=3`、`articles=30`、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-1912`、`extensionVersion=0.1.46`，官网和控制台返回 200。

2026-05-02 21:24 已替换本机 App 到 `BUILD_ID=2026-05-02-2124`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 对当前 X 首页通过，返回 `build=2026-05-02-2124`、`marking=1`、`stage=ads:done`。本轮尝试打开两个 X 详情页做按钮验收，但页面一直没有加载出回复列表（`articles=0`，停在 `stage=boot` 或 `scan:not-enough-articles`），所以未能看到可见 `冲走` / 右栏关闭按钮数量；后续遇到正常加载回复的详情页要补验。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-2124`、`extensionVersion=0.1.47`，官网和控制台返回 200。

2026-05-02 21:48 已替换本机 App 到 `BUILD_ID=2026-05-02-2148`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 对当前 X 详情页通过，返回 `build=2026-05-02-2148`、`marking=1`、`articles=0`、`stage=scan:not-enough-articles`。该页当时没有加载出回复列表，所以未能看到可见 `冲走` / 右栏关闭按钮数量；公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-2148`、`extensionVersion=0.1.48`，官网和控制台返回 200。

2026-05-02 21:57 已替换本机 App 到 `BUILD_ID=2026-05-02-2157`，签名验证通过，`pluginkit` 已启用扩展。这个版本补了 Safari 存储读取超时兜底，防止页面停在 `boot` 阶段。最终 `npm run safari:verify-live` 对当前 X 首页通过，返回 `build=2026-05-02-2157`、`marking=1`、`stage=ads:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-2157`、`extensionVersion=0.1.49`，官网和控制台返回 200。

2026-05-02 23:25 已替换本机 App 到 `BUILD_ID=2026-05-02-2317`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.50`。本轮没有改右栏 UI，只更新筛选和 AI 证据；`npm run safari:verify-live` 对当前 X 详情页和首页均读到新版 build。详情页当时没有加载出回复列表、首页没有右栏模块样本，所以只完成真实注入验证，未看到可见 `冲走` / 右栏关闭按钮数量。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-2317`、`extensionVersion=0.1.50`。

2026-05-02 23:43 已替换本机 App 到 `BUILD_ID=2026-05-02-2340`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.51`。本轮没有改右栏 UI，只补筛选模板；`npm run safari:verify-live` 对两个真实 X 详情页通过，返回 `build=2026-05-02-2340`、可见 `冲走` 按钮 6/12 个、右栏关闭按钮 3/4 个、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-2340`、`extensionVersion=0.1.51`。

2026-05-02 23:57 已替换本机 App 到 `BUILD_ID=2026-05-02-2357`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.52`。本轮没有改右栏 UI，只修数据库筛选键和发布新版包；`npm run safari:verify-live` 对两个真实 X 详情页通过，其中一个详情页返回 `build=2026-05-02-2357`、可见 `冲走` 按钮 3 个、右栏关闭按钮 3 个、`articles=15`、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-2357`、`extensionVersion=0.1.52`。

2026-05-03 00:11 已替换本机 App 到 `BUILD_ID=2026-05-03-0011`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.53`。本轮没有改右栏 UI，只补真实页面里的装饰符号/纯短句诗句垃圾。`npm run safari:verify-live` 读到新版 build；随后真实 X 详情页 `https://x.com/bandagemiao/status/2050238861318754634` 返回 `build=2026-05-03-0011`、`stage=scan:done`、`articles=27`、隐藏格子 21 个。7 条用户指出的同款在页面中对应 cell 均为 `data-web25-hidden=1` 且 `display:none`。

2026-05-03 00:22 已替换本机 App 到 `BUILD_ID=2026-05-03-0022`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.54`。本轮没有改右栏 UI，只补剩余 `Minsqw / 人间钟情柔情` 诗句式引流模板。`npm run safari:verify-live` 读到新版 build；真实 X 详情页 `https://x.com/bandagemiao/status/2050238861318754634` 返回 `build=2026-05-03-0022`、`stage=scan:done`、`articles=27`、隐藏格子 22 个，`Minsqw` 对应 cell 为 `data-web25-hidden=1` 且 `display:none`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-03-0022`、`extensionVersion=0.1.54`。

2026-05-03 09:40 已替换本机 App 到 `BUILD_ID=2026-05-03-0037`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.55`。本轮没有改右栏 UI，只提高 AI 老师复核强度和 Safari 扩展版本。`npm run safari:verify-live` 对真实 X 详情页 `https://x.com/bandagemiao/status/2050238861318754634` 通过：`build=2026-05-03-0037`、`detail=1`、`sidebar=1`、`flushes=4`、`sideButtons=3`、`manualButtons=4`、`marking=1`、`articles=25`、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-03-0037`、`extensionVersion=0.1.55`。

2026-05-03 10:07 已替换本机 App 到 `BUILD_ID=2026-05-03-1001`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.56`。本轮没有改右栏 UI，只补筛选模板和发布新版包。`npm run safari:verify-live` 对真实 X 详情页 `https://x.com/wysgdmn/status/2050614965938389445` 通过：`build=2026-05-03-1001`、`detail=1`、`sidebar=1`、`flushes=12`、`sideButtons=3`、`manualButtons=12`、`marking=1`、`articles=22`、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-03-1001`、`extensionVersion=0.1.56`。

2026-05-03 10:48 已替换本机 App 到 `BUILD_ID=2026-05-03-1039`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.57`。本轮没有改右栏 UI，只提高 AI 老师参与强度和发布新版包。`npm run safari:verify-live` 对真实 X 首页和详情页通过：详情页 `https://x.com/wysgdmn/status/2050614965938389445` 返回 `build=2026-05-03-1039`、`detail=1`、`sidebar=1`、`flushes=12`、`sideButtons=3`、`manualButtons=12`、`marking=1`、`articles=26`、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-03-1039`、`extensionVersion=0.1.57`。

2026-05-03 11:26 已替换本机 App 到 `BUILD_ID=2026-05-03-1117`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.58`。本轮没有改右栏 UI，只补筛选证据和发布新版包。`npm run safari:verify-live` 对真实 X 详情页 `https://x.com/Sizhe_bitcat/status/2050555799991468314` 通过：`build=2026-05-03-1117`、`detail=1`、`sidebar=1`、`flushes=11`、`sideButtons=3`、`manualButtons=11`、`marking=1`、`articles=15`、`stage=scan:done`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-03-1117`、`extensionVersion=0.1.58`。

2026-05-03 11:42 已替换本机 App 到 `BUILD_ID=2026-05-03-1138`，签名验证通过，`pluginkit` 显示扩展版本 `1.0.59`。本轮没有改右栏 UI，只补筛选证据和发布新版包。`npm run safari:verify-live` 读到新版；真实 X 详情页 `https://x.com/YLDLZN/status/2050723821460853237` 随后返回 `build=2026-05-03-1138`、`stage=scan:done`、`articles=19`，`孙甜甜寻男大固泡 @MonaKristi9125` 对应行已隐藏。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-03-1138`、`extensionVersion=0.1.59`。

2026-05-03 13:50 已确认本机 App 为 `BUILD_ID=2026-05-03-1327`，签名验证通过，App / Extension 版本 `1.0.61 (62)`。本轮没有改右栏 UI，只补 AI 老师复核和筛选证据链。`npm run safari:verify-live` 刷新真实 X 详情页后先遇到 X 短暂未加载回复列表；等待后直接查 DOM，真实页 `https://x.com/yizhunli10167/status/2050601910487461905` 返回 `build=2026-05-03-1327`、`articles=52`，`@hayes_jaco16929` 对应回复存在但 cell 为 `data-web25-hidden=1` 且 `display:none`。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-03-1327`、`extensionVersion=0.1.61`。

2026-05-03 14:12 已替换本机 App 到 `BUILD_ID=2026-05-03-1402`，签名验证通过，App / Extension 版本 `1.0.62 (63)`。本轮没有改右栏 UI，只补 AI 老师证据入口和提示词口径。`npm run safari:verify-live` 先遇到 X 短暂未加载回复列表；等待后真实 X 详情页 `https://x.com/ronronzi/status/2050591230275539384` 返回 `build=2026-05-03-1402`、`stage=scan:done`、`articles=47`。截图同页复查：`PaulBarbar6873`、`RyanTerrel92368`、`zhizi856`、`dffgfoo02` 对应回复都存在但 cell 为 `data-web25-hidden=1` 且 `display:none`；正常粗口评论 `sorallllllan` 仍可见。公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-03-1402`、`extensionVersion=0.1.62`。

2026-05-02 云端控制台已部署到 Worker Version ID `3d44a89e-52c4-477c-967f-47eed7d72a6c`：恢复某条隐藏记录后，不只是当前前台列表立刻消失，后台统计、最近记录、累计明细、广告详情和开发者待整理池也统一按“已恢复，不再算当前屏蔽”处理。D1 里仍保留原始历史和恢复历史，方便追溯。

## 给下一任助手的话

如果你读到这份文件，请默认：

- 这块已经不是概念验证
- 这块已经经过真实页面反复修正
- 当前版本用户已经认可

一句话：

**右栏关闭能力现在是稳态资产，别手痒乱改。**
