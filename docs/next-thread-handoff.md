# Colorful Toilet 下一轮接力说明

最后整理日期：2026-05-04

这份文件是给下一轮 Codex / 开发助手看的，不是产品宣传文档。目标只有一个：新对话打开后，能快速、安全、连续地接手，不重复解释，不误删数据，不改坏已经稳定的插件。

重要读法：这份文件是地图，不是历史书。新对话只需要先抓当前状态、用户工作方式、下一步优先级和关键文件；第 3 节里大量按日期排列的发布记录，只在排查某个版本、某个漏网样本或某次回归时按关键词查，不要逐条复述或长时间分析。

## 0. 新对话开场必须先做

下一轮接手时，先按这个顺序做：

1. 进入仓库：`/Users/boriszhang/Documents/Codex/project 1`
2. 运行：`git status --branch --short`
3. 先读，但不要逐条背历史：
   - 完整读 `AGENTS.md`
   - 快速读本文档第 0、1、2、9、10、11、12 节
   - 第 3 节只抓最新当前锚点；旧日期记录只在排查时用 `rg` 搜关键词
   - `docs/current-stable-filter-state.md` 和 `docs/current-stable-ui-state.md` 先读顶部结论和“不要改坏”的基线
   - `docs/moderation-database-training-plan.md` 先读 AI 老师、数据库记忆、`manual_hide` / `manual_allow` 口径
   - `docs/ai-api-provider-handoff.md` 只在改 AI 设置、接口、模型、Key 时细读
4. 再根据用户最新一句话行动，不要被旧上下文带偏。

不要假设工作区是干净的。不要回退自己没改过的东西。

当前活跃分支是 `codex/cloudflare-public-foundation`。用户看到多个分支时，不要让用户手动切换、合并或删除分支；继续使用当前活跃分支即可。`main` 和旧的 `codex/...backup...` / `codex/update...` 分支先视为历史线或备份线，除非用户明确要求清理，否则不要动。

2026-05-03 用户担心交接文档太长会让新 AI 每次浪费时间。以后接手时要先用当前锚点回答和行动，不要把历史发布流水当成必须逐条消化的上下文；维护本文档时也要优先压缩旧记录、更新当前结论，避免旧状态和新提示词互相矛盾。

## 1. 用户工作方式

用户没有计算机基础，不应该被迫理解提交、推送、部署、D1、Worker、构建签名、AI 接口、模型适配、API Key 这些细节。

用户明确说过：“我只听人话”。以后汇报状态时，不要直接说 `stash`、`worktree`、`upstream`、`未暂存`、`未跟踪`、`commit`、`push`、`deploy`、`Wrangler`、`D1` 这类词就结束。必须先翻成普通中文，例如：

- “代码没有没保存的改动，也没有没上传到 GitHub 的改动。”
- “网站代码已经保存并上传了，但还没真正更新到公网，原因是 Cloudflare 登录失效，需要重新登录后我才能发布。”
- “本机 App 已经换成最新版，并且我确认 Safari 正在用新版。”
- “数据库没有动真实用户数据；这次只是看状态。”

对用户解释时必须先用大白话说结论：

- 先说“能不能用 / 还差什么 / 我下一步会做什么”
- 不要直接甩 API 名称、接口路径、模型参数、错误码、命令输出
- 必须提技术词时，后面立刻用一句普通中文解释
- 需要用户提供密钥、登录、付款、真人验证时，只说用户要做的那一步，不让用户判断工程细节
- 2026-05-04 用户明确新增工作规则：如果 Cloudflare 公网发布因为登录过期、令牌失效或账号权限问题失败，Codex 要立刻停止继续尝试，直接告诉用户需要登录 Cloudflare；不要反复重试、探测或让用户白等。
- 用户问“准备好了吗”这类问题时，优先回答“准备好了 / 还没完全准备好”，再用一两句解释原因

默认工作方式：

- 能做的就直接做完
- 修改后自己测试
- 需要提交就提交
- 需要推送就推送
- 需要上线就部署
- 官网 / 控制台前端改动做完后，必须立刻部署到公网并验证公网地址；只做到本地预览不算完成，因为用户需要在另一台设备上检查。
- 影响 Safari 扩展就更新 `/Applications/web2.5.app`
- 更新本机 App 后验证 `BUILD_ID` 和签名
- 2026-05-02 重要教训：替换或重新构建 Safari App 后，不能只看 `/Applications/web2.5.app` 的文件、`BUILD_ID` 和签名。Safari 可能让已打开的 X 标签页暂时失去内容脚本，或者系统扩展注册被刚构建的临时 app 干扰。以后每次 `npm run cloud:deploy`、`npm run browser:artifacts`、`npm run safari:build`、替换 `/Applications/web2.5.app` 后，都必须执行：`pluginkit -e use -i com.yourCompany.web25.extension`、`npm run safari:verify-live`，并确认真实 X 页面里 `document.documentElement.dataset.web25Build` 是当前 `BUILD_ID`、详情页有可见 `冲走` 按钮、右栏有关闭按钮。没有通过前，不准说插件已可用。
- 最后用简单中文说清楚“已经做到哪一步”
- 用户说“做到无能为力”为止时，意思是不要停在建议或半成品；要继续做到遇到真实外部阻塞，例如账号登录、真人验证、付款、必须用户亲自验收等，并把阻塞点写清楚。
- 用户反复提醒的长期工作习惯和项目规则，要及时写进 `AGENTS.md` 或本文档，不要只靠当前对话上下文。
- 用户明确要求：后续对话里，如果出现很带有用户个人风格、长期协作方式、或对 Codex 的统一要求，要随时同步进交接文档；不要等到换线程时才补。
- 2026-05-03 用户进一步明确：发“漏网截图”不一定是在要求把截图里的文字硬写进插件规则，更多是在讨论如何优化 AI / 数据库的判断方法。以后遇到漏网截图，先把它当作训练和诊断素材：分清哪些是正文、显示名、handle、头像、图片、批量相邻、上下文脱节等信号；先用人话说明“为什么 AI/数据库没学会”和“准备怎么让 AI 学会”，必要时先和用户讨论，再改代码。若旧记录里有“看到截图就立即补固定模板”的倾向，以这个新规则为准。
- 用户希望“AI 当老师”不是口号：前期老师应尽量多看高风险和数据库已命中的可疑候选，帮助数据库越来越会分辨。普通正常回复仍不要全量进 AI，但对头像/图片、明显招嫖引流、随机数字账号、空洞口号、emoji 噪音、与原帖无关等组合风险，允许有上限地多送 AI 复核和沉淀记忆。
- 2026-05-03 用户进一步强调：当前 AI 参与强度如果太低，就会变成用户本人靠手动 `冲走` 来训练数据库，效率很低。以后优化方向要让 AI 老师承担更多前期训练工作：对高风险、边界模糊、头像/图片有证据、数据库已命中但值得复核、或反复出现的新模式，更积极地送 AI 判断并写入标注和记忆；不要把“省 token”放在训练效率前面。仍要保护普通正常回复，不做无差别全量审核。
- 2026-05-04 用户明确补充最终主路线：数据库 / AI 记忆先扫；数据库明确知道是垃圾就立刻撤掉；数据库不知道但候选可疑时，尽快交给 AI；AI 判定垃圾就撤掉并沉淀回标注、记忆和数据库候选；AI 判定没问题就留在页面上。`临时隐藏` 只能是极高风险安全桥，不是默认流程。后续工作要朝“数据库处理已知问题，AI 快速处理未知问题，AI 结果教数据库”的体验收敛。
- 对“全国安排 / 全国可飞”等头像或图片文字：如果当前 DeepSeek 配置能直接识别图片，就应把高风险候选的头像图片作为证据给 AI 判断，识别到明显招嫖引流时直接隐藏并沉淀为学习样本；如果当前模型/接口不能看图，要先向用户说明限制，再提出最小安全方案，例如头像 OCR 或换支持视觉的模型。不要让 AI 在没看到图时凭空猜头像内容，也不要未经说明接入新的付费能力或大范围全页看图。

只有高风险动作需要先停下来讲清楚：

- 删除或覆盖 Cloudflare D1 真实数据
- 改登录、账号身份、权限
- 改密钥、环境变量、费用相关配置
- 接入会产生费用的 AI / API
- 大改当前已经稳定的筛选架构

一句话：普通维护默认完整执行，高风险数据和费用动作先确认。

## 2. 当前产品状态

### 已稳定

- `X / Safari` 插件主链路已经稳定：
  - 冲走
  - 自动下沉
  - 恢复
  - 蓝框
  - 官方广告跳过
  - 右栏模块关闭
  - 名字屏蔽
  - 基础云端同步
- 公网网站可用：
  - 首页：`https://colorful-toilet.colorful-toilet.workers.dev/`
  - 控制台：`https://colorful-toilet.colorful-toilet.workers.dev/console/`
- 开发者登录可用：
  - 邮箱：`2715000591@qq.com`
  - 开发者验证码当前会直接显示
- 开发者模式可用：
  - 待确认投喂
  - 精确项直达全局
  - 全局撤回
- 插件默认同步地址已经指向公网，不再默认写本地后台。
- 第一层数据分层防线已经在代码层补强：
  - 个人统计继续按 `user_id` 隔离
  - 自动全局精确规则至少需要多贡献者
  - 同一账号多个设备不能伪装成多人共识
  - 新增开发者只读审计接口：`GET /api/developer/data-layer-audit`
  - 新增审计脚本：`npm run cloud:audit-data-layer`
  - 2026-05-01 已部署到线上 Worker

### 还没完成

- 普通用户真实邮件验证码发送还没接正式发信服务
- 普通用户正式登录闭环还没完全收口
- 个性化屏蔽还没开始
- AI 判断已接入 DeepSeek 小额测试配置；2026-05-01 已部署通用大模型兼容适配，会自动尝试多种常见返回格式。用户已明确 API 已提供，下一轮不要再让用户重新购买。线上开发者账号曾加密保存 DeepSeek Key，模型为 `deepseek-v4-flash`，并已通过真实 AI 接入测试、6 条小样本识别测试、4 条成人内容边界小样本测试。2026-05-01 后续发现保存 AI 设置时会把空 Key 输入框误当成清空 Key，已修复并部署。用户已重新提供 Key，当前已通过线上接口加密保存，控制台只应显示后四位 `a6db`；不要把完整 Key 写入文档、代码、命令、日志或 GitHub。基础层现在明确放过正常成人/色情讨论，只压约见导流、联系方式、诈骗、木马/安装包、主页诱导和空洞钓鱼。2026-05-01 已新增提示词包 `docs/ai-prompt-packs/sexual-leadgen-foundation/`，并用线上 Key 验证：引流样本 hide，正常成人治理讨论 allow。2026-05-02 已确认新版插件注入真实 X 页面；后续只需用自然遇到的真实样本继续观察误判和漏网。
- 正式自定义域名还没定
- 远程 D1 里仍有少量开发测试原始行，只能在明确识别后清理

## 3. 当前版本锚点

这些是截至 2026-05-04 的已知稳定锚点：

- 当前分支：`codex/cloudflare-public-foundation`
- Cloudflare Worker：
  - URL：`https://colorful-toilet.colorful-toilet.workers.dev`
  - Version ID：`febe67c9-e44a-4f28-a563-f71c0f25e4f2`
  - 2026-05-04 11:59 已发布 `BUILD_ID=2026-05-04-1159` / `extensionVersion=0.1.76` 到公网。用户指出 `🔥全网唯一真实社区🥹线下直接对接 @belanich34344 / ⚡🤩💨🥳` 明显漏网，并追问是不是 AI 没工作；只读查到真实记录已进入后台但停在 `pending / 等待后台判断 / model 空`，说明不是 AI 已看错，而是等待状态没有可靠收尾。新版没有把截图词硬写进数据库：本地和 Worker 同步补通用风险昵称证据，覆盖 `线下/同城/附近 + 对接/牵线/安排/资源/接待/社区`、`真实/真人/唯一 + 社区/资源/对接/牵线/约见` 等组合；前端和 Worker 的回复 AI 单批从 8 条缩到 4 条，前端等待后台结果从 30 秒放宽到 55 秒；Worker 写入 pending 后会安排 12 秒后台补判，避免浏览器请求中途断开或 AI 批量慢时长期空挂；页面收到 `failed / AI 批量结果不完整` 也会重新排队再试，后台补判也会捞这类失败项。公网 `/downloads/latest.json` 返回 `buildId=2026-05-04-1159`、`extensionVersion=0.1.76`，首页和控制台均返回 200；线上路线探针带真实 DeepSeek 调用返回 `Final layer: ai / ready / hide / high`、理由为诱导昵称、可疑 handle、emoji 空回复且与主帖无关，`Database writes: no`。`node --check` 三个核心文件、`git diff --check`、`npm run cloud:check`、`npm run cloud:audit-data-layer` 通过；审计仍确认单用户重复冲走不会自动进入公共规则。本轮没有 schema 变更、没有清理或删除 D1 数据、没有新增付费 AI/API 能力。
  - 2026-05-04 10:34 已发布 `BUILD_ID=2026-05-04-1034` / `extensionVersion=0.1.74` 到公网。用户完成 Cloudflare 登录验证后已补跑发布；后续同版本重发一次，最终公网 Version ID 为上一行。公网 `/downloads/latest.json` 返回 `buildId=2026-05-04-1034`、`extensionVersion=0.1.74`，首页和控制台均返回 200。本轮按用户补充口径，把旧手动教学 / 历史命中合并显示为“后台学习库下沉”，不再单独显示“手动记录下沉”；AI 等待态单独计为“后台复审中”，避免把 pending 误算进“本机自动下沉”；后台返回英文原因短句时，底部卡片会展示中文概括。真实 Safari 页 `https://x.com/fadai202202/status/2051011398134911475` 曾验证：页面读到 `build=2026-05-04-1034`，底部显示 `Colorful Toilet 已整理 4 条回复`、`后台已判断 6 条，后台自动下沉 1 条，后台学习库下沉 3 条`，展开 / 收起 / 等待 4 秒后 4 张底部卡片都保留且按钮不变灰。发布后已重新替换本机 App、签名验证通过；最终 `npm run safari:verify-live` 对真实页读到 `build=2026-05-04-1034`、`stage=scan:done`、`articles=10`、`flushes=7`、`manualButtons=7`、`sideButtons=3`。`npm run cloud:audit-data-layer` 通过，本轮没有改筛选阈值、Worker 审核逻辑、schema、D1 数据或付费 AI 能力。
  - 2026-05-04 09:57 已发布 `BUILD_ID=2026-05-04-0951` / `extensionVersion=0.1.71`。修复用户反馈的底部“查看列表”反复变成“无下沉”的问题：X 在展开底部或页面重排时可能临时卸载隐藏回复 DOM，旧版把“当前 DOM 里没看到隐藏回复”误当成“没有下沉”，导致按钮变灰、底部列表清空，等用户滚动后又重新隐藏。新版按当前详情页缓存已下沉条目，X 短暂拿走 DOM 时仍保留底部列表；恢复或后台明确放过时会清理缓存。本轮没有改筛选阈值、Worker 审核逻辑、schema、D1 数据或付费 AI 能力。
  - 2026-05-04 09:38 已发布 `BUILD_ID=2026-05-04-0938` / `extensionVersion=0.1.70`。继续按用户“AI 后台就是数据库插件后台”的口径统一官网控制台、底部整理卡片和后台原因短句：用户可见来源改为“后台直接下沉 / 后台学习库下沉 / 后台已判断”，不再让用户区分 AI 后台和数据库后台；历史/本机手动记录继续显示“手动记录下沉”，不冒充刚刚点击。没有改筛选阈值、schema、D1 数据或付费 AI 能力。
  - 2026-05-04 09:18 已发布 `BUILD_ID=2026-05-04-0918` / `extensionVersion=0.1.68`。用户截图指出底部卡片显示“AI 已复审 3 条、AI 自动下沉 1 条、你刚标记下沉 1 条”，但自己没有刚点标记，并强调数据库不能造假、AI 后台和数据库后台不要分裂成两套说法。只读 D1 核验：最新 `moderation_events` 没有新的 `manual_hide`；截图里的 `欣伊 @KarenColem24174 / 找个长期搭子` 是 `reply_ai_items id=1373`，DeepSeek 在 2026-05-04 01:09:48Z 高置信 hide；同批另有两条 allow，所以“复审 3 条”是“后台判断总数”，不是“下沉条数”。新版把底部文案统一为“后台已判断 X 条（下沉 Y 条）/ 本机自动下沉 / 手动记录下沉”，不再显示“你刚标记下沉”、`AI 自动下沉` 或 `AI 学习库屏蔽`；历史手动命中用 `history` 来源，不再冒充本次点击。没有改 schema、没有删除或清理 D1 数据。
  - 2026-05-04 01:59 已发布 `BUILD_ID=2026-05-04-0159` / `extensionVersion=0.1.67`。本轮重点解决用户指出的“未知可疑回复等待 AI 太久、pending 卡住、低风险内容被先藏”的体验问题，不是继续堆固定规则。新版把页面 AI 队列发送等待压到 180ms，给作者资料补充取证加 1.2 秒上限，避免资料请求拖住整批 AI；AI 批量返回缺项、失败或部分超时时会自动短延迟重试，减少 `pending / 等待 AI 判断` 长期挂住。临时隐藏阈值从 3 提到 6，只有极高风险内容才先藏，低风险和边界内容等待 AI 时保持可见。Worker 侧数据库 / 记忆 / 已知规则命中会先立刻返回给页面处理，AI 老师复核改为后台继续补课；DeepSeek 不能看图时，带头像证据但纯文本的候选保持批量文本判断，不再拆成多次慢调用。公网首页、控制台和 `/downloads/latest.json` 已确认可访问，`latest.json` 返回 `buildId=2026-05-04-0159`、`extensionVersion=0.1.67`；线上探针显示未知可疑样本约 7 秒走 AI 隐藏，已知数据库样本约 2 秒直接隐藏且不等外接 AI。本轮没有改 schema、没有清理或删除 D1 数据，也没有新增付费 AI 能力。
  - 2026-05-04 01:24 已发布 `BUILD_ID=2026-05-04-0124` / `extensionVersion=0.1.66`。用户恢复多条“角度/光线/JK/长裙”正常回复后追问“为什么 AI 等待后才判断、不是实时判断”：只读 D1 确认其中两条仍停在 `pending / 等待 AI 判断`，根因是旧版前端把所有“等待 AI”的候选都先隐藏，同时浏览器只等云端 8 秒；DeepSeek 批量判断稍慢时，普通内容会先被藏住并留在等待状态。新版把“送 AI 老师看”和“等待时先隐藏”分开：低风险候选继续送 AI，但页面先显示；只有强风险或分数达到 3 的候选才临时隐藏。AI 批量请求等待时间从 8 秒放宽到 30 秒，后台转发也支持对应超时取消，缓存号换到 `web25-reply-ai-cache-v8`。公网首页、控制台和 `/downloads/latest.json` 已确认可访问，`latest.json` 返回 `buildId=2026-05-04-0124`、`extensionVersion=0.1.66`。本轮没有改 schema、没有清理或删除 D1 数据，也没有新增付费 AI 能力。
  - 2026-05-04 00:42 已发布 `BUILD_ID=2026-05-04-0037` / `extensionVersion=0.1.65`。用户截图 `Pxrids @pxrids78304 / ᴰᵉˡᵘˢⁱᵒⁿ 甘愿沉溺在有你的梦境 ᴰᵉˡᵘˢⁱᵒⁿ`、`Xgoasmby @xgoasmby17820 / ᴴᵘˢʰ 世界安静唯独思念喧嚣 ᴴᵘˢʰ`、`Xducqo @xducqo27774 / 𓇜𓇝 情深似海甘愿被情缚 𓇜𓇝` 仍露出的根因不是 AI 语义看不懂，而是没有进入审核：真实 DOM 里英文标签是上标/花体 Unicode，旧重复英文标签识别从原始文本找普通 `[a-z]`，所以没命中；埃及符号壳被算进短口号长度，导致泛化短空话超限。新版同步本地和 Worker：重复英文标签先正规化再匹配，泛化短空话长度只看实际文字内容；截图同类会隐藏或先临时下沉进入 AI 老师复核。公网首页、控制台和 `/downloads/latest.json` 已确认可访问，`latest.json` 返回 `buildId=2026-05-04-0037`、`extensionVersion=0.1.65`；只读路线探针显示 `Pxrids`、`Xducqo` 同类样本会进入外接 AI 路线且不写数据库。没有改 schema、没有清理或删除 D1 数据。
  - 2026-05-03 23:45 已发布 `BUILD_ID=2026-05-03-2345` / `extensionVersion=0.1.64`。用户问“DeepSeek 不能看图，那这种全国安排头像同款是不是就没法挡”：结论是能挡，不靠头像读字，而靠页面可读证据。新版本地和 Worker 同步新增 `bilingual_short_slogan_reply` 证据标签和 `pattern:bilingual-short-slogan-lure-account` 候选键，识别随机英文数字账号发“重复英文标签 + 中文空洞短句 + 同一英文标签 + emoji 装饰”的批量无关口号；AI prompt 也描述这种结构，但没有硬写截图里的具体英文词。回归：`SADNESS/EVENING/WINDOW/RAINY/FLOWER ... 英文标签` 5 条同款本地隐藏；`BTC 今天走势挺强 BTC 🚀`、`LOVE 生日快乐 LOVE 🎂`、`WINDOW 窗口函数这个问题可以这么理解 WINDOW` 放过。线上探针 `Dakfzsyv @dakfzsyv19237 / SADNESS 人间起落情绪皆有你 SADNESS 🍂🧢` 带真实 DeepSeek 调用返回 `Final layer=ai / ready / hide / high`，候选键为 `pattern:bilingual-short-slogan-lure-account`，不写数据库。`npm run cloud:check`、`npm run cloud:deploy`、`npm run cloud:audit-data-layer` 通过；公网首页 200，`/downloads/latest.json` 返回 `buildId=2026-05-03-2345`、`extensionVersion=0.1.64`。本轮没有 schema 变更、没有清理或删除 D1 数据。
  - 2026-05-03 22:46 已发布 `BUILD_ID=2026-05-03-2246` / `extensionVersion=0.1.63`。本次不是改提示词，而是修真实页面 AI 写入链路：只读 D1 查到当前设备真实页面已写入 `reply_ai_items`，但 2026-05-03 09:00 UTC 后 16 条里有 14 条没有对应 `reply_ai_results`，说明“真实写入”和“最终 AI 判断”之间仍可能断开。新版把前端和 Worker 单批 AI 候选上限从 16 降到 8、老师复核预算从 16 降到 8，并在云端收到真实页面样本后先写入 `pending / 等待 AI 判断` 结果；AI 成功后再覆盖为 `ready`，如果后续页面重试看到 `pending` 也会重新判断。以后排查时要区分：开发者探针默认不写数据库；真实页面 `reply_ai_items` 代表已监听和写入；`reply_ai_results.status=pending` 代表等待 AI；`ready` 才代表 AI 已给最终结论。`npm run cloud:check`、`npm run cloud:audit-data-layer`、`npm run cloud:deploy` 通过；公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-03-2246`。
  - 2026-05-03 14:12 已发布 `BUILD_ID=2026-05-03-1402` / `extensionVersion=0.1.62`。用户截图 `舒希/怂歆/芭乐芭乐/椰子/丽莎` 一组暴露出两类问题：明确诱导昵称没有完全覆盖 `来个真人认识一下`、`附近的DD`；更重要的是，`独具魅力`、`克服睡眼` 这种无上下文短口号虽然人能看出是批量号垃圾，旧 AI 提示词却因没有露骨词/联系方式而放过。新版同步本地和 Worker：新增 `generic_short_slogan_reply` AI 证据标签和 `pattern:generic-short-slogan-lure-account` 候选键，`⭐` 等装饰符进入 emoji/低信息识别，弱随机 handle + 短装饰口号会先送 AI 老师并临时下沉；Worker prompt 明确这类批量短口号是 `meaningless_bait`。线上探针验证：`独具魅力`、`克服睡眼` 均为 `ai / ready / hide / high`，正常粗口评论 `你这问题有意思。男的就是会这样犯贱啊` 为 `ai / ready / allow / low`。真实 Safari 页 `https://x.com/ronronzi/status/2050591230275539384` 返回 `build=2026-05-03-1402`、`articles=47`，`PaulBarbar6873`、`RyanTerrel92368`、`zhizi856`、`dffgfoo02` 对应 cell 为 `data-web25-hidden=1` 且 `display:none`，`sorallllllan` 仍可见。`npm run cloud:audit-data-layer` 通过；没有 schema 变更、没有删除或清理 D1 数据。
  - 2026-05-03 14:44 用户质疑“AI 是否真实读过页面数据，是否只是在探针里跑”。只读查 D1 后必须诚实区分：线上历史确实有 `reply_ai_items=1099` / `reply_ai_results=1099`，其中 DeepSeek 直接 AI 判断约 977 条；但 2026-05-03 当前本机 Safari 的 sync key `sync_d6c8560a4eeb47d4a589675e75d37e7d` 当时未绑定开发者账号，`/api/state` 返回 `replyAiEnabled=false`，所以今天真实页面只在写 `auto_hide` 事件，没有写新的 `reply_ai_items`。已用现有登录和绑定接口把该 sync key / device `device_2c1dd7191f764a08931356308eefea2a` 绑定到 `2715000591@qq.com`，再次查询 `/api/state` 返回 `replyAiEnabled=true`、`replyAiSettingsUpdatedAt=2026-05-01T13:58:11.717Z`。随后刷新真实页 `https://x.com/ronronzi/status/2050591230275539384`，线上写入 15 条真实 `reply_ai_items`，15 条全部由 `deepseek-v4-flash` 返回 `decision_layer=ai / ready / hide / high`，最新更新时间 `2026-05-03T06:44:22.522Z`。以后不要把“开发者探针真实调用 AI”混同为“真实页面已写入 AI 学习记录”；两者都可能调用模型，但探针默认 `Database writes: no`。
  - 2026-05-03 17:15 用户确认这一版实际刷起来“屏蔽挺好，没有明显漏过”，可作为一个阶段段落；但也指出有少量误杀，典型例子是原帖反复说“没钱/有钱导致过得不好”，回复 `你穷怕了` 是相关正常评论，虽然语气尖锐但不应隐藏。只读核验：该条有 `manual_allow` 事件 `id=1212`，绑定当前 sync key 和用户账号；样本库有 `user_feedback / allow` 标注，理由“用户恢复或放过”；同时 `reply_ai_items id=1123` 已保存 `main_post_text`，说明 AI 证据卡能拿到原帖上下文。后续优化重点：不要再盲目加硬规则，应让 AI/规则更尊重原帖上下文，保护与主帖相关的尖锐、粗口、反驳、吐槽评论。
  - 2026-05-03 13:45 用户完成 Cloudflare 登录后，已发布 `BUILD_ID=2026-05-03-1327` / `extensionVersion=0.1.61` 到公网。此前 `天使熊❤️附近的来 @hayes_jaco16929 / 纯 emoji` 漏网的准确结论是：旧版真实 Safari 页面没有把这条送进 AI 队列，也没有隐藏；不能说“AI 已经检查过”。新版已同步本地和 Worker：`附近/同城/线下 + 来/来聊/来找/找我/私/约/见` 作为风险昵称诱导，本地 AI 候选显示顺序改为先 `AI 复审中` 隐藏再等云端结果，缓存号换到 `web25-reply-ai-cache-v3`。公网首页和控制台 200；`/downloads/latest.json` 返回 `buildId=2026-05-03-1327`、`extensionVersion=0.1.61`；线上同款探针真实调用 DeepSeek，返回 `Final layer: ai / ready / hide / high`、`External AI: called`、`Database writes: no`；真实 Safari 页 `https://x.com/yizhunli10167/status/2050601910487461905` 返回 `build=2026-05-03-1327`、`articles=52`，`@hayes_jaco16929` 对应 cell 为 `data-web25-hidden=1` 且 `display:none`。`npm run cloud:audit-data-layer` 通过；本轮没有 schema 变更、没有删除或清理 D1 数据。
  - 2026-05-03 12:56 已发布 `BUILD_ID=2026-05-03-1256` / `extensionVersion=0.1.60`，Worker Version ID `bfd0967e-cd2f-4c08-b488-729f8cbcdbb5`。本次是按用户明确要求“让产品里的 AI 真干活”改调度，不是继续补固定话术：本地 AI 候选批量上限 12 -> 16、发送等待 650ms -> 350ms、最小间隔 750ms -> 350ms、老师复核分 3 -> 2、会话缓存 360 -> 600，并把本页临时 AI 缓存号从 `v1` 换到 `v2`，避免旧页面继续吃旧结果。云端老师复核预算 8 -> 16；高风险候选即使已经命中 AI 记忆、数据库规则、账号黑名单或旧复用层，也会先追加给 DeepSeek 老师看，AI 高置信隐藏时最终层为 `ai`，AI 不高置信时回落到原拦截结果，不让已确认垃圾露出。老师复核的非最终 AI 判断也会写入样本标注，避免“AI 看了但没留下教学记录”。公网探针 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 带真实调用返回 `Final layer: ai / ready / hide / high`、`External AI: called`；公网首页和控制台 200；`/downloads/latest.json` 返回 `buildId=2026-05-03-1256`、`extensionVersion=0.1.60`；`npm run cloud:audit-data-layer` 通过。本轮没有改 schema、没有删除或清理 D1 数据。
  - 2026-05-03 11:40 已发布 `BUILD_ID=2026-05-03-1138` / `extensionVersion=0.1.59`。用户截图 `孙甜甜❤️寻男大固泡 @MonaKristi9125` 发纯 emoji 噪音仍露出，根因不是版本旧也不是没扫描：真实页 `https://x.com/YLDLZN/status/2050723821460853237` 当时为 `BUILD_ID=2026-05-03-1117`、`stage=scan:done`、`articles=55`，但旧昵称规则只覆盖 `找固定泡友/炮友/固炮`，没有覆盖 `寻男 + 固泡` 这种缩写；同时 X 把 emoji 渲染成图片 alt，旧正文读取只取 `innerText` 时漏掉了 emoji 正文。新版补 `寻男/寻女/固泡/泡友/炮友/性友` 到本地和 Worker 昵称风险词与强风险模式，并让 `getTweetText` 从 tweetText 节点收集 emoji 图片 alt。回归：同款 emoji / 空正文 + 该风险昵称隐藏，普通 `我在找固定搭档做项目`、`今晚准时看直播吗` 放过。公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-1138`、`extensionVersion=0.1.59`；`npm run cloud:audit-data-layer` 通过；没有改 schema、没有清理或删除 D1 数据。
  - 2026-05-03 11:21 已发布 `BUILD_ID=2026-05-03-1117` / `extensionVersion=0.1.58`。用户截图里 `Phaoswk/Abxlj/Waxnrvqf/Xarmw/Gjued/Ghxlksc/Hgpvaqb` 这批并不是 AI 扫描次数不够：真实 X 详情页 `https://x.com/Sizhe_bitcat/status/2050555799991468314` 当时已经显示 `stage=scan:done`、扫到 53 条回复。根因是 X 的正文只给到埃及象形符号壳和空洞中文短句，没有给截图里的彩色 emoji；旧的装饰口号识别不包含 `\u{13000}-\u{1342F}` 这段符号，也缺少 `灵魂/共鸣/同频/知音/三观` 等抽象交友空话词。本次同步修本地和 Worker：把这类“埃及符号壳 + 空洞交友口号 + 随机数字 handle”纳入 `decorative-slogan-from-suspicious-handle`，同时收窄 AI 候选入口，避免正常账号仅因短句和软信号就进 AI。普通正常句子如 `我们三观不合，所以还是别一起做项目了。`、`同频的人聊天很舒服...`、`灵魂不负相逢，这句歌词挺美的。` 放过。公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-1117`、`extensionVersion=0.1.58`；`npm run cloud:audit-data-layer` 通过；没有改 schema、没有清理或删除 D1 数据。
  - 2026-05-03 10:46 已发布 `BUILD_ID=2026-05-03-1039` / `extensionVersion=0.1.57`。本次按用户“AI 介入强度再大一点”的明确要求调整代码，不是新增固定屏蔽话术：本地 AI 候选批量上限从 8 提到 12、发送等待从 900ms 降到 650ms、最小间隔从 1500ms 降到 750ms、基础候选分从 2 降到 1，但去掉“仅凭随机数字 handle 就送 AI”的宽口，仍要求短/薄/诱导/模板/上下文风险等配套证据；老师复核分从 5 降到 3，缓存上限从 240 提到 360。云端批量接收上限同步到 12，数据库命中后的老师复核预算从每批 4 条提到 8 条；`teacher_review_requested`、头像证据、风险昵称、关系诱导、已知垃圾模板等标签都可以触发数据库命中后的 DeepSeek 老师复核。线上真实探针 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 带老师复核标记时命中 `pattern:geo-relationship-bait`，同时真实调用 DeepSeek，返回 `Final layer: ai / ready / hide / high`，开发者探针不写数据库。公网首页、控制台、`/downloads/latest.json` 均 200；`latest.json` 返回 `buildId=2026-05-03-1039`、`extensionVersion=0.1.57`。`npm run cloud:audit-data-layer` 通过；本轮没有改 schema、没有清理或删除 D1 数据。
  - 2026-05-03 10:05 已发布 `BUILD_ID=2026-05-03-1001` / `extensionVersion=0.1.56`。用户截图里仍露出的 `Qdhcgou / 浅交不如深知己`、`Vgfsrtjw / 高质量交友贵在合拍`、`Xdorg / 品行相近方同行`、`Xyfbuat / 拒绝无效的寒暄`，根因是 X 当时没有稳定给到原帖正文，旧规则只按 `emoji-noise + 随机数字 handle` 打到 2 分，低于自动隐藏线；这些新口号也不在既有诗句模板里。新版把这批短口号纳入 `pattern:poetic-slogan-lure-account`，并把 `有没有单身哥哥` 归入 `pattern:geo-relationship-bait`，本地和 Worker 同步。普通账号的完整正常句子如 `高质量交友贵在合拍，关键是共同爱好和边界感。`、`有没有单身哥哥一起打游戏？`、`附近有家面馆不错`、`生日快乐🎂🎉🥳` 仍放过。线上探针 `高质量交友贵在合拍 🌟✂️🌟🎁` 返回 `db_rule_pattern / ready / hide / high`，匹配 `pattern:poetic-slogan-lure-account`；`有没有单身哥哥✨🤤🫶Oa` 返回 `db_rule_pattern / ready / hide / high`，匹配 `pattern:geo-relationship-bait`；两者均未调用外接 AI、未写数据库。公网首页、控制台、`/downloads/latest.json` 均 200；`latest.json` 返回 `buildId=2026-05-03-1001`、`extensionVersion=0.1.56`。`npm run cloud:audit-data-layer` 通过；本轮没有改 schema、没有清理或删除 D1 数据。
  - 2026-05-03 09:39 已发布 `BUILD_ID=2026-05-03-0037` / `extensionVersion=0.1.55`。这次接手上一位 AI 的半成品并补完闭环：用户明确要求 AI 辅助强度开大，AI 是老师，token 不是主要问题；新版把本地 AI 候选批量上限从 6 提到 8、发送等待从 1200ms 降到 900ms、最小间隔从 4000ms 降到 1500ms、基础候选分从 3 降到 2，并给高风险候选打 `teacher_review_requested`。云端仍先查静态规则、AI 记忆、数据库候选规则；如果数据库已命中且带老师复核标记，每批最多 4 条追加调用 DeepSeek。线上探针 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 命中 `pattern:geo-relationship-bait`，同时真实调用 DeepSeek，返回 `Final layer: ai / ready / hide / high`，开发者探针不写数据库。公网首页、控制台、`/downloads/latest.json` 均 200；`latest.json` 返回 `buildId=2026-05-03-0037`、`extensionVersion=0.1.55`。`npm run cloud:audit-data-layer` 通过；本轮没有改 schema、没有清理或删除 D1 数据。
  - 2026-05-03 00:22 已发布 `BUILD_ID=2026-05-03-0022` / `extensionVersion=0.1.54`。用户指出剩余 `Minsqw @minsqw49924 / ✩ 人间钟情柔情 ✩ 👍 🎊`，怀疑之前是在删具体样本而不是算法筛选；本次明确按算法修：本地和 Worker 都把 `人间.{0,4}(钟情|柔情)` 纳入 `pattern:poetic-slogan-lure-account`，仍依赖随机数字 handle、emoji 噪音、上下文脱节等组合信号，不是删账号、删历史或清数据库。真实 X 页面头像图片没有可读 alt，Safari 本地不能直接读出头像里的 `全国安排`；头像继续作为云端 AI 辅助证据，但即时隐藏靠可见文本和账号风险信号。线上探针返回 `db_rule_pattern / ready / hide / high`，外接 AI 不运行、数据库不写入；公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-0022`、`extensionVersion=0.1.54`。本机真实 X 详情页返回 `build=2026-05-03-0022`、`stage=scan:done`、`articles=27`，`Minsqw` cell 为 `data-web25-hidden=1` 且 `display:none`。`npm run cloud:audit-data-layer` 通过，仍确认单用户重复冲走不会自动进入公共规则。
  - 2026-05-03 00:11 已发布 `BUILD_ID=2026-05-03-0011` / `extensionVersion=0.1.53`。用户复查仍看到这些内容，根因不是云端没同步，而是真实 X 页面里的文本不是昨天测试的 emoji 版本；实际是 `༙༚ 晨昏静候柔意 ༚༙`、`༘꙳ 温柔漫染眉眼 ꙳༘`、`༳ 晨昏暗生情愫 ༳`、`ꧨ 时光赠予柔情 ꧨ`、`꧆ 晚风裹着温柔 ꧇`、`༗ 俗世偏爱温存 ༗`、以及纯 `缘起眉眼温柔`。旧规则要求诗句模板带 emoji，所以没有自动收掉真实版本。新版本地和 Worker 都把这些固定诗句模板 + 随机数字 handle 直接归入 `pattern:poetic-slogan-lure-account`，不再要求 emoji。线上 7 条真实文字探针全部返回 `db_rule_pattern / ready / hide / high`，外接 AI 不运行；本机真实 X 详情页 7 条对应 cell 均为 `data-web25-hidden=1` 且 `display:none`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-03-0011`、`extensionVersion=0.1.53`。
  - 2026-05-02 23:57 已发布 `BUILD_ID=2026-05-02-2357` / `extensionVersion=0.1.52`。本次不是继续扩大普通 emoji 规则，而是修正“数据库为什么没挡住”的根因：Worker 和本地手动反馈原来会把 `温柔漫染眉眼` 这类同时带诗句模板和装饰空话的样本优先归到较宽的 `pattern:decorative-slogan-lure-account`，导致没有命中更精确的 `pattern:poetic-slogan-lure-account`。新版把诗句式垃圾键排在装饰空话键前面，并在备份 D1 后把 `pattern:poetic-slogan-lure-account` 登记为开发者确认的活跃数据库规则。备份：`backups/d1/web25-2026-05-02T15-57-00-before-poetic-slogan-rule.sql`。线上 7 条截图同款 `lvdro/Gjvyhno/Mucbt/Agjghbw/Nyoad/Cyfbld/Mocbr` 探针全部返回 `db_rule_pattern / ready / hide / high`，匹配 `pattern:poetic-slogan-lure-account`，外接 AI 不需要运行；公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-02-2357`、`extensionVersion=0.1.52`。本机 App 已替换，签名、`pluginkit`、`npm run safari:verify-live` 通过；真实 X 详情页返回 `build=2026-05-02-2357`，其中一个详情页有可见 `冲走` 按钮 3 个、右栏关闭按钮 3 个。`npm run cloud:audit-data-layer` 通过，仍确认单用户重复冲走不会自动进入公共规则。
  - 2026-05-02 23:43 已发布 `BUILD_ID=2026-05-02-2340` / `extensionVersion=0.1.51`。本次继续补用户截图里的“全国安排头像 + 随机英文数字账号 + 晨昏/温柔/晚风/俗世/缘起诗句空话 + emoji 噪音”批量回复：新增模板包括 `晨昏静候柔意`、`温柔漫染眉眼`、`晨昏暗生情愫`、`时光赠予柔情`、`晚风裹着温柔`、`俗世偏爱温存`、`缘起眉眼温柔`。关键修正是：即使 X 暂时没把原帖正文暴露给插件，这 7 条同款也会靠 `poetic-slogan-from-suspicious-handle` 直接隐藏；普通 `生日快乐🎂🎉🥳` 和有信息量的 `晚风裹着温柔...散步...空气很好` 放过。头像取证也扩大到 emoji 噪音可疑项，避免只在上下文脱节时才请求头像辅助。没有改数据库结构、没有清理或删除 D1 数据。已验证 `node --check cloudflare/src/index.js`、`node --check extension/content/rules.js`、`node --check extension/content/content.js`、`git diff --check`、`npm run cloud:check`、`npm run cloud:deploy`、`npm run cloud:audit-data-layer`。公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-02-2340`、`extensionVersion=0.1.51`。本机 App 已替换，`/Applications/web2.5.app` 内含新版 `BUILD_ID` 和新模板，签名与 `pluginkit` 通过；`npm run safari:verify-live` 对两个真实 X 详情页通过：`build=2026-05-02-2340`，详情页有可见 `冲走` 按钮 6/12 个，右栏关闭按钮 3/4 个。
  - 2026-05-02 23:25 已发布 `BUILD_ID=2026-05-02-2317` / `extensionVersion=0.1.50`。本次修复用户截图里 `Gmuabzl @gmuabzl73394 / 有缘自会相识。🎁🔥🌺` 和 `Utmhryx @utmhryx13099 / ⚜ 怡好刚好温良友 ⚜ 💘 🧊 🤌🏽🍀🔥` 漏网：本地和 Worker 都新增“短空话 + emoji 噪音 + 随机数字 handle + 与主帖无关”的组合识别，并把 `有缘自会相识`、`怡好刚好温良友` 收入诗句式空洞模板。回复 AI prompt 现在明确要求把 `mainPostText` 和 `replyText` 一起看；可疑项会带 `emoji_noise_reply`、`context_detached_reply`、`avatar_vision_requested` 等头像辅助证据标签，模型支持图片时继续检查头像里是否有“全国安排”等文字。新增数据库候选键 `pattern:emoji-noise-lure-account`，本轮没有改数据库结构、没有清理或删除 D1 数据。回归：两条截图同款隐藏，`有缘自会相识。` 在相识语境下放过，`生日快乐🎂🎉🥳` 在生日主帖下放过，金融语境 emoji 回复放过。线上真实 AI 小样本 `有缘自会相识。🎁🔥🌺` 返回 `ready / hide / high`，理由为诗句式低信息、随机号、脱离主帖、emoji 诱饵；不写数据库。已验证 `node --check cloudflare/src/index.js`、`node --check extension/content/rules.js`、`node --check extension/content/content.js`、`git diff --check`、`npm run cloud:check`、`npm run cloud:deploy`、`npm run cloud:audit-data-layer`。公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-02-2317`、`extensionVersion=0.1.50`。本机 App 已替换，`/Applications/web2.5.app` 内含新版 `BUILD_ID` 和新规则，签名与 `pluginkit` 通过；`npm run safari:verify-live` 对当前 X 页读到 `build=2026-05-02-2317`。当时 X 详情页未加载回复列表，首页无右栏模块样本，所以只完成真实注入核验，未看到可见 `冲走` / 右栏关闭按钮数量。
  - 2026-05-02 22:43 已发布开发者只读“回复 AI 路线探针”：新增 `POST /api/developer/reply-ai-routing-probe` 和脚本 `npm run cloud:probe-reply-ai`。它用于给一条回复样本看清最终会走 `ai_memory_*`、`db_rule_*`、旧复用层、账号黑名单，还是外接 AI；默认只读数据库、不写 D1、不调用外接 AI，只有显式 `-- --call-provider` 才会做真实外接 AI 小额调用。本次没有改数据库结构、没有改筛选阈值、没有改本地 Safari 扩展代码；线上默认样本 `孟轩🌸无常线下🌸 @MullerChri42258 / 找个同城弟弟` 返回 `Final layer: db_rule_pattern`、`External AI: not needed`、`Database writes: no`。`/downloads/latest.json` 仍为 `buildId=2026-05-02-2157`、`extensionVersion=0.1.49`。
  - 2026-05-02 22:00 已发布 `BUILD_ID=2026-05-02-2157` / `extensionVersion=0.1.49`。本次修复用户截图里 `是不是这个? + pan.quark.cn/s/...` 的夸克网盘引流漏网：根因不是外接 AI 看不懂中文，而是本地/Worker 的 `share-link-scam` 只认“网盘链接 + 资源词”或“特别短链接回复”，没有把“是不是这个 / 是这个吗 / 就是这个 + 网盘链接”纳入同一类短引诱话术。已同步本地插件和 Worker；截图同款两条隐藏，`是不是这个问题的原因`、`你说的是这个吗？我刚才没看懂` 放过。发布后又发现 Safari 偶发把扩展停在 `boot` 阶段，补了本地存储和 IndexedDB 读取超时兜底，避免整页过滤卡住。没有改数据库结构、没有批量写 D1、没有改变 `manual_allow` 口径。已验证 `node --check cloudflare/src/index.js`、`node --check extension/content/rules.js`、`node --check extension/content/content.js`、`git diff --check`、`npm run cloud:check`、`npm run cloud:deploy`、`npm run cloud:audit-data-layer`。公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-02-2157`、`extensionVersion=0.1.49`。本机 App 已替换并确认含新版 `BUILD_ID`，签名和 `pluginkit` 通过；最终 `npm run safari:verify-live` 对当前 `https://x.com/home` 返回 `build=2026-05-02-2157`、`marking=1`、`stage=ads:done`。
  - 2026-05-02 21:29 已发布 `BUILD_ID=2026-05-02-2124` / `extensionVersion=0.1.47`。本次是小范围同构修正：本地插件现在也会发出云端已经认识的 `pattern:geo-relationship-bait` 和 `pattern:poetic-slogan-lure-account`，让用户手动 `冲走` / `恢复` 留下的样本键与数据库候选规则更一致；没有改阈值、UI、AI 调用顺序或数据库结构。已验证 `node --check cloudflare/src/index.js`、`node --check extension/content/rules.js`、`node --check extension/content/content.js`、`git diff --check`、`npm run cloud:check`、`npm run cloud:deploy`、`npm run cloud:audit-data-layer`。公网首页、控制台、`/downloads/latest.json` 均 200，`latest.json` 返回 `buildId=2026-05-02-2124`、`extensionVersion=0.1.47`。本机 App 已替换并确认含新版 `BUILD_ID`，签名和 `pluginkit` 通过；`npm run safari:verify-live` 在当前打开的 `https://x.com/home` 返回 `build=2026-05-02-2124`、`marking=1`、`stage=ads:done`。尝试用两个 X 详情页做更严格按钮验收时，X 页面一直停在 `articles=0` / `stage=boot` 或 `scan:not-enough-articles`，所以本轮只能证明详情页注入成功，未能看到实际回复按钮数量；后续遇到能正常加载回复的真实详情页应再补验 `冲走` 和右栏关闭按钮。
  - 2026-05-02 19:34 已修复手动反馈刷新数据库候选的后台缺口：`recordModerationTrainingLabelFromEvent` 以前写入样本和标注后，刷新候选处引用了不存在的 AI `decision` 变量，错误被保护逻辑吞掉，导致新 `manual_hide` / `manual_allow` 没有实时刷新 `moderation_rule_candidates`。现在手动冲走或恢复都会刷新候选；单用户冲走仍只是候选证据，不直接变公共规则。已部署公网 Worker Version ID `8480bcdf-8a69-45e8-8aa9-a981f41d7f2c`。随后运行 `npm run cloud:rebuild-rule-candidates`，先备份 D1 到 `backups/d1/web25-2026-05-02T11-34-30-329Z-before-rule-candidates.sql`，整理结果：`active=223`、`candidate=66`、写入候选 289 条。`npm run cloud:audit-data-layer` 通过；公网 `/downloads/latest.json` 仍为 `buildId=2026-05-02-1912`、`extensionVersion=0.1.46`；官网和控制台 200；本机 App 签名与真实 Safari 详情页验证通过。
  - 2026-05-02 19:12 已部署公网。`/downloads/latest.json` 返回 `buildId=2026-05-02-1912`、`extensionVersion=0.1.46`，官网和控制台返回 200。本次修复用户截图 `🐇有狗.（月固定 @vaughan_jo90233 / 找个温柔的哥哥🌹💐❤️ 0`：`月固定/周固定/长期固定` 现在是强风险昵称；`找/求/蹲 + 温柔/固定/长期/月固定/帅/乖/可爱/宠人/有钱 + 哥哥/姐姐/弟弟/妹妹` 进入强关系诱导模板。回归：截图同款隐藏，`找个温柔的哥哥帮我修电脑`、`这个哥哥很温柔`、`固定收益产品风险很高`、`附近有家面馆不错` 放过。真实 Safari 详情页验证 `build=2026-05-02-1912`、`flushes=15`、`manualButtons=15`、`sideButtons=3`、`articles=30`、`stage=scan:done`。
  - 2026-05-02 18:46 已部署公网。`/downloads/latest.json` 返回 `buildId=2026-05-02-1846`、`extensionVersion=0.1.45`，官网和控制台返回 200。按用户要求，回复 AI 输入现在按“证据卡”组织：昵称、@用户名、正文、主贴文字、主页简介、主页外链、主页风险标签都作为独立证据；当回复像随机诗句/空洞词、和主贴上下文脱节、且账号 handle 可疑时，插件会附加头像图片地址、头像 alt 文本和 `avatar_vision_requested`。后台遇到头像证据项会单条送 AI，不混入批量；如果外接模型支持图片输入，头像会作为图片辅助证据送入。发布前已备份 D1：`backups/d1/web25-2026-05-02T10-53-58-3NZ-before-avatar-evidence-schema.sql`，线上 `reply_ai_items` 已确认存在 5 个头像证据字段。
  - 2026-05-02 18:22 已部署公网。`/downloads/latest.json` 返回 `buildId=2026-05-02-1822`、`extensionVersion=0.1.44`，官网和控制台返回 200。本次修复用户截图里的“全国安排头像 + 随机英文数字 handle + 诗句式空洞回复”漏网：本地和 Worker 都新增 `烟火暖了相逢`、`人海有幸擦肩`、`缘分引线人海逢`、`遇见温柔满人间`、`旧城偶遇故人`、`晚风撞我相逢`、`一念恰好相逢` 这类低信息诱饵模板。回复区 AI prompt 也已写入这些例子，因为外接 API 只看单条短正文时容易不知道这是一组批量号。7 条截图同款本地回归全部隐藏；普通账号发类似正常感慨仍放过。
  - 2026-05-02 18:06 用户完成 Cloudflare 重新登录后，已成功部署公网。`/downloads/latest.json` 返回 `buildId=2026-05-02-1756`、`extensionVersion=0.1.43`，官网和控制台返回 200。外接 API 的回复区提示词修复已经在线上 Worker 生效。
  - 2026-05-02 17:56 用户质疑“我把中文拿给你你能判断，为什么外接 API 不行”。根因分两层：一是这些样本把风险藏在昵称里，正文只发数字/emoji，旧基础规则没有收进 `每晚准时大秀`、`找固定泡友`、`今晚准时涩播`、`蹲一个弟弟` 等新昵称模板；二是 Worker 的回复区 AI 提示词没有把控制台补充审核要求附加进去，导致用户补的口径对回复区 AI 没生效。已同步修本地和 Worker：新增上述风险昵称模式，补充 AI 提示词中文样例，并把 `settings.moderationPrompt` 附加到回复区 AI prompt。5 条截图同款样本本地全部隐藏，`附近有家面馆不错`、`有没有天安门附近的`、`今晚准时看直播吗` 放过。
  - 2026-05-02 17:47 用户再次追问“为什么 AI / 数据库没挡住这些明显引流”。根因已确认：之前插件扫描到可疑回复后，主要把本地规则当作 AI 候选筛选和排序；如果云端结果还没回来，部分高风险候选会先露在页面上，流程没有严格做到“基础层没截住就 AI 扫，AI 没放过前不显示”。已修正本机链路：本地基础规则会立即下沉明确垃圾；高风险候选在等待云端数据库 / AI 期间显示为 `AI 复审中` 并临时下沉；AI 明确放过后自动显示。已新增 `Pe/CL她好涩 我不行了 👉 @...`、`看我主页 + 附近真实约见` 风险昵称和纯表情薄回复组合识别。本地回归 4 条截图同款样本全部隐藏，`附近有家面馆不错`、`有没有天安门附近的` 放过。Worker 源码已同步新增规则并通过 `npm run cloud:check`，但公网发布失败：Cloudflare 返回 `Invalid access token [code: 9109]` / `Authentication error [code: 10000]`。当前公网仍停在 17:31 的 Worker Version ID `0e62a0bf-38d6-47ff-8834-369a59cb8524` 和 `/downloads/latest.json buildId=2026-05-02-1726`；用户完成 Cloudflare 重新登录后，必须补跑 `npm run cloud:deploy`。
  - 2026-05-02 17:31 用户截图反馈仍有多条漏网：`比她好看的没她强，比她强的没她好看 @designksh1/@xiaonm88`、`刷了半天的X就她的主页能打✈️了 @designksh1/@xiaonm88`、`线下我就日过这个骚货 @designksh1`、以及 `免费破处` 风险昵称发 `十🙈`。根因：前两种重复导流话术没有被收进明确垃圾模板；云端候选规则也没把“风险昵称 + 一个字/表情薄回复”当作低信息诱导账号模式，所以部分样本没有稳定命中数据库层。已同步补本地规则和 Worker：新增两条模板，云端 `buildRowKeys` 把 minimal emoji payload 纳入 `low-information-lure-account` / `low-information-strong-lure-name`。公网 7 条截图同款样本全部返回 `db_rule_pattern` 或 `db_rule_template`、`action=hide`、`confidence=high`，`model=moderation-rule-candidates-2026-05-02-v1`，说明由数据库学习库接管，不调用外部 AI。测试 item 为 `1100`-`1106`，属于 `sync_dev_test_screenshot_templates_*` 开发验收数据。
  - 2026-05-02 17:11 已按用户追问验收并发布“数据库优先截住低信息风险账号回复”补强：`2🙃😍🧡` 这类数字/符号/表情薄回复会和风险昵称、随机数字 handle 组合进本地与 Worker 同构规则。公网真实测试样本 `孟轩🌸无常线下🌸 @MullerChri42258 / 2🙃😍🧡` 返回 `decisionLayer=db_rule_pattern`、`action=hide`、`confidence=high`、`model=moderation-rule-candidates-2026-05-02-v1`，说明命中数据库学习库，不调用外部 AI。测试 item 为 `1099`，使用 `sync_dev_test_db_rule_1650_*` / `device_test_db_rule_1650_*`，属于开发验收数据。
  - 2026-05-02 13:55 用户完成 Cloudflare 授权后，已发布“旧数据库整理进学习库”通道：开发者接口 `POST /api/developer/backfill-training` 和脚本 `npm run cloud:backfill-training` 已上线。公网首页、控制台、`/downloads/latest.json` 均返回 200。
  - 2026-05-02 13:55 已备份并回填线上 D1。备份文件包括 `backups/d1/web25-2026-05-02T05-38-54-857Z-before-training-backfill.sql`。回填结果：旧手动事件处理 156 条、旧 AI 判断处理 1070 条、AI 记忆写入尝试 130 次。只读核验：`moderation_samples=1220`、`moderation_sample_labels=1226`、`reply_ai_memory active=84`。
  - 2026-05-02 15:24 已上线“数据库接管重复垃圾”闭环：新增开发者接口 `POST /api/developer/rebuild-rule-candidates` 和脚本 `npm run cloud:rebuild-rule-candidates`。它会从旧样本、AI 高置信隐藏、开发者确认/撤回里整理 `moderation_rule_candidates`，云端 AI 判断前先查这张候选规则表；命中后返回 `db_rule_*`，不调用外部 AI。正式整理前已备份 D1 到 `backups/d1/web25-2026-05-02T07-23-57-109Z-before-rule-candidates.sql`。线上核验：`active=222`、`candidate=64`；`找个同城的哥哥` 精确规则和 `pattern:geo-relationship-bait` 已启用；`pattern:geo-meetup-bait` 和 `template:hook+meetup` 因存在恢复/放过证据仍是候选，未粗暴启用。
  - 2026-05-02 15:26 真实云端小测试通过：测试样本 `找个同城弟弟` 返回 `decisionLayer=db_rule_pattern`、`action=hide`，并确认测试 item `1097/1098` 没有产生新的外部 AI 调用。误伤核验：`我在万达广场附近上班`、`附近有家面馆不错`、`pattern:geo-meetup-bait`、`template:hook+meetup` 没有活跃规则直接粗暴命中。
  - 2026-05-02 13:55 新记录正文保存已上线：插件和 Worker 都会尽量保存回复正文；如果 X 当时不给正文，就保存 `账号线索：显示名 @handle`，避免学习样本完全空掉。旧的空正文历史不能凭空还原，只能以后尽量不再新增空样本。
  - 2026-05-02 12:22 已修复扩展 AI 首判入口：之前实际代码会把每条可读回复都排进 AI；现在 `buildReplyAiModerationCandidate` 只在强风险触发或弱风险组合时排队。普通正常回复不应消耗 AI。
  - 2026-05-02 13:55 轻量学习闭环已上线：新发生的 `manual_hide` / `manual_allow` 会写入 `moderation_samples` / `moderation_sample_labels`，AI 首次判断也会写入 AI 标注；这些仍然只是证据层，不会自动升级公共规则。
  - 2026-05-02 12:35 通过公网开发者审计接口核对：真实事件 `totalEvents=702`、`auto_hide=397`、`manual_hide=143`、`manual_allow=13`、`ad_home_hide=133`、`ad_reply_hide=16`；分层检查全部 PASS。Cloudflare 直接 D1 读取同样因账号登录失效失败。
  - 2026-05-02 已完成 `AI 首判、云端记忆复用`：新增并应用线上 `reply_ai_memory` 表；只把 AI 直接高置信隐藏结果写入记忆；记忆命中、旧复用、`global_blocklist` 等在控制台归入 `AI 学习库屏蔽`；用户恢复误判会停用对应记忆。发布前已备份 D1 到 `backups/d1/web25-2026-05-02-ai-memory-before-schema.sql`。
  - 2026-05-02 `/api/state` 已改为不再把公共精确规则合并进插件本地手动隐藏列表；公共规则和高共识模板只作为云端 AI 判断参考信号。公网烟测显示新测试身份返回 `manualHideKeys: []`，随后已删除该临时测试 sync key。
  - 2026-05-02 控制台累计方格已固定为 5 块：`累计跳过无用内容`、`后台直接下沉`、`后台学习库下沉`、`你手动冲走`、`跳过官方广告`。详情入口为 `all_skipped`、`ai_direct`、`ai_memory`、`manual`、`ads`。
  - 2026-05-02 验证通过：`node --check cloudflare/src/index.js`、`node --check extension/content/rules.js`、`node --check extension/content/content.js`、`node --check site/app.js`、`git diff --check`、`npm run cloud:check`、`npm run cloud:audit-data-layer`、`npm run cloud:deploy`。公网首页、控制台、`/console/?detail=ai_memory`、`/downloads/latest.json` 均返回 200。
  - 2026-05-02 15:24 数据库接管层上线后再次验证：`node --check cloudflare/src/index.js`、`node --check scripts/rebuild-rule-candidates.mjs`、`git diff --check`、`npm run cloud:check`、`npm run cloud:deploy`、`npm run cloud:rebuild-rule-candidates`、`npm run cloud:audit-data-layer` 均通过；公网首页、控制台、`/downloads/latest.json` 均返回 200。2026-05-02 15:45 为发布新版 Safari 下载包再次部署，当前 Worker Version ID 为 `8b9891cf-236d-4b89-a547-2e68f1c45697`。
  - 2026-05-02 `npm run cloud:deploy` 已成功部署控制台前端方格直达详情页改动。
  - 2026-05-02 用户已亲自完成 Cloudflare 网页登录授权；本机发布权限恢复。随后已再次运行 `npm run cloud:check` 和 `npm run cloud:deploy`，公网更新成功，当前 Version ID 为 `f66362e3-0f48-46e0-9639-95bf51590205`。已用系统代理验证首页、控制台、`/console/?detail=ai_hide`、`/downloads/latest.json` 均返回 200，线上 `/app.js` 已包含详情页精简模式和设备显示修正。
  - 2026-05-02 已修复控制台“恢复这条”前台不同步：用户在来源详情页恢复后，当前列表会立刻移除原来的隐藏记录；刷新后的来源分类也会用 `manual_allow` 抑制同一条 `auto_hide` / `manual_hide`，不再让它继续留在“本地规则下沉”里。已部署到公网 Version ID `f54ff4e3-e820-4f34-840f-6a6da3c72cfa`。
  - 2026-05-02 后续发现“累计自动整理”详情页仍独立读取 `auto_hide`，没有套用同一条 `manual_allow` 抑制逻辑。已修复为所有相关明细入口共用恢复结果：`本地规则下沉`、`累计自动整理`、底部近期审查列表、广告详情页都会在同一条恢复后隐藏原来的被挡记录。已部署到公网 Version ID `29714654-a468-4df3-b5fb-2ce99b3dbb44`，并验证 `/console/?detail=auto` 和线上 `/app.js` 可访问。
  - 2026-05-02 再次按用户要求修到底层口径：`manual_allow` 不只在前台遮住旧记录，Worker 后台统计、最近记录、广告明细、开发者待整理池、确认上传入口都会把同一条后来的恢复记录当成“这条已撤销，不再算当前屏蔽”。D1 原始历史仍保留，不能为了界面干净删除真实事件。已部署到公网 Version ID `d45d03b9-e4db-4ec3-838a-243f92aaffe5`。只读 D1 核验：事件 `698`（`auto_hide`，`有没有天安门附近的`，`@erqeqwaaa`）被判定为“已恢复，不再算当前屏蔽”；事件 `699` 是对应 `manual_allow`。线上 `/api/dashboard` 登录核验：最近记录只返回 `699/manual_allow`，不再返回 `698/auto_hide`。验证命令：`node --check cloudflare/src/index.js`、`git diff --check`、`npm run cloud:check`、`npm run cloud:deploy`、`curl --proxy http://127.0.0.1:7897 -L https://colorful-toilet.colorful-toilet.workers.dev/console/?detail=auto`。
  - 2026-05-02 已按用户判断收窄地点搭讪误伤：`有没有天安门附近的` / `有没有天安门广场附近的` / `有没有北京天安门附近的` 这类明显公共地标玩梗或阴阳怪气句式，不应仅因“有没有 + 附近”直接被本地规则挡下；但 `有万达广场附近的吗`、`有附近的吗`、`找个同城的哥哥`、`有没有天安门附近可约吗` 仍应隐藏。已同步改本地规则和 Worker。
  - 线上代码已确认包含 `/api/developer/data-layer-audit`、`contributor-layering-v2`、`buildRuleContributorKey` 和 `GLOBAL_RULE_MIN_CONTRIBUTORS`。
  - 线上代码已包含通用大模型兼容适配：用户给 API Key、兼容接口地址、模型名后，Worker 会自动尝试多种常见返回格式；如果平台完全不兼容，再补单独适配。
  - 线上控制台 AI 设置区已新增“测试一次 AI 接入”按钮。按钮会先保存设置，再只发一条小样本测试 Key / 接口地址 / 模型名是否可用；它不会自动运行，用户手动点击才会消耗少量 API 额度。
  - 2026-05-01 已将线上开发者账号的共享 AI 设置接入 DeepSeek：
    - `providerBaseUrl = https://api.deepseek.com`
    - `model = deepseek-v4-flash`
    - Key 已重新加密保存，控制台只显示后四位 `a6db`，不要把完整 Key 写入代码、文档、命令、日志或 GitHub。2026-05-01 后续保存设置时曾被 bug 误清空；该 bug 已修复，并已复测不带 `apiKey` 的普通保存不会再清 Key。
    - “测试一次 AI 接入”已返回 `status=ready`、`action=hide`、`confidence=high`，标签包含 `adult_solicitation`、`contact_redirect`。
    - 6 条小样本识别测试全部符合预期：招嫖/联系方式引流、附近约见诱导、风险名字+低信息回复会隐藏；`Apple ID 一直登不上`、正常地点讨论、普通短回复会放过。
    - 2026-05-01 修复了扩展侧 AI 排队保护：只有本地规则先判定为可疑候选、且本地/数据库规则还没有直接隐藏的回复才会进入 AI 队列，避免打开详情页后把所有回复都送去模型，也避免 `找个同城的哥哥` 这类模板已经能本地隐藏时还消耗 API。
    - 2026-05-01 收紧 AI 基础审核边界：正常成人话题、色情讨论、性教育/平台治理讨论不能只因为含有色情词就隐藏；基础层要保护正常表达，只隐藏诈骗、约见引流、联系方式、木马/安装包、主页诱导、空洞钓鱼，以及由名字、handle、主页简介、主页外链等账号证据支撑的低信息垃圾。头像/图片只有在未来真的采集并提供给 AI 时才能作为辅助证据，不能让模型凭空脑补。4 条真实 DeepSeek 临时样本测试通过：2 条正常成人讨论放过，2 条导流/安装包风险隐藏。
    - 2026-05-01 再次加强默认提示词和线上补充提示词：色情内容本身允许；只屏蔽色情引流、约见导流、联系方式导流、主页/置顶/简介诱导、空洞低信息诱饵、诈骗、木马、安装包、资源包和不安全外链。普通短句不能只因短就隐藏，`meaningless_bait` 必须有风险账号或导流证据支撑。
  - 线上控制台“最近 AI 隐藏记录”已新增“恢复误判”：会写入 `manual_allow`，并把对应 `reply_ai_results` 标成 `manual_allow/allow`，让该条从 AI 隐藏列表消失；同账号同文案短期会复用放过结果。不要把这个恢复当成广泛反向训练，只表示这条 AI 误判。
    - 2026-05-02 控制台前端已改为“累计方格直达详情页”，当前已部署到公网 Version ID `f66362e3-0f48-46e0-9639-95bf51590205`。来源方格仍集成在 `你的累计成果` 那组 `metric-card` 里，不要单独画新的“屏蔽来源入口”。点击可查看方格后直接跳到 `/console/?detail=...`，不再要求用户展开底部折叠区。详情页显示分类、条数、具体记录和恢复入口；`官方广告记录` / `回复审查` 折叠区里的明细已经前端合并到这些方格背后的详情页。来源包括：`AI 智能屏蔽`、`AI 结果复用`、`数据库历史命中`、`公共数据库规则`、`账号黑名单`、`本地规则下沉`、`累计自动整理`、`你手动冲走`、`恢复误判`、`已在主页跳过广告`、`已在回复区跳过广告`。`global_blocklist` 在界面上叫 `账号黑名单`，不要再叫“AI 全局屏蔽”；`reuse_exact_hide` / `reuse_template_hide` / `reuse_account_hide` 归入 `AI 结果复用`，不算新的 AI 调用。当前 dashboard 近期事件还不能稳定区分公共规则和本地规则，前端已保留独立卡片，缺字段时显示待接入/0。
    - 2026-05-02 后续按用户要求，详情页模式不再显示控制台大标题、登录卡片、设备列表和累计方格；进入 `/console/?detail=...` 时第一屏只显示当前方格背后的明细内容和返回按钮。已部署到公网 Version ID `f66362e3-0f48-46e0-9639-95bf51590205`，并验证 `/console/?detail=ai_hide` 可打开。
    - 2026-05-02 已查验开发者账号 `已接入设备` 显示过多的原因：线上 dashboard 返回 6 个底层 `device_id`，其中包含 `device_eval_*` / `device_dev_gemini_*` 开发测试标识，也有同一台 Mac 在插件重建、重新绑定或本地存储变化后留下的历史连接标识。前端代码已改为只突出“当前这台设备”，其余折叠为历史连接说明；不删除 D1 历史数据，不改 schema。`node --check site/app.js`、`node --check cloudflare/src/index.js`、`npm run cloud:check` 均通过；2026-05-02 用户完成 Cloudflare 登录授权后已部署到公网 Version ID `f66362e3-0f48-46e0-9639-95bf51590205`。
    - 轻量样本分类方向：不要做用户直接写压缩包；应自动从现有 `moderation_events`、`reply_ai_items`、`reply_ai_results` 抽到 `moderation_samples` / `moderation_sample_labels`。`manual_hide` 是垃圾候选，AI 高置信 hide 是辅助证据，`manual_allow` / “恢复误判”是抑制和纠错证据，只有多贡献者或开发者确认后才升级公共规则。
  - API 接入下一步详见 `docs/ai-api-provider-handoff.md`。
  - 2026-05-01 已验证公网首页、控制台、`/downloads/latest.json`、Safari 下载包、Chrome/Edge 下载包都可从 Cloudflare 线上地址直接访问，不依赖本地部署。
  - 本机直连 `https://colorful-toilet.colorful-toilet.workers.dev/` 会连接超时；原因是命令行直连没有走 macOS 系统代理。`scripts/audit-data-layer.mjs` 已修复：检测到 macOS HTTPS 代理时会自动用 `NODE_USE_ENV_PROXY=1` 重启自己。
  - 2026-05-01 `npm run cloud:audit-data-layer` 已直接跑通，线上分层审计全部 PASS：`total_users=2`，真实事件 `total_events=692`、`bound_events=692`、`unbound_events=0`、`event_user_count=1`；`single_contributor_blocked_candidates=8`。
  - 2026-05-01 已确认 Worker Secret 名单包含 `USER_AI_SETTINGS_SECRET`，AI Key 可以加密保存。
  - 2026-05-01 已修复 AI 设置保存 bug：如果请求里没有带 `apiKey`，Worker 会保留原来的加密 Key，不再把空输入框误当成清空 Key。已部署到 Version ID `8039945b-87ba-4a4c-8eca-775775e9b7fa`。
- Cloudflare D1：
  - 数据库名：`web25`
  - 绑定名：`DB`
- Safari / Web Extension：
  - `BUILD_ID = 2026-05-04-1159`
  - extension manifest version：`0.1.76`
  - App / Extension version：`1.0.76 (77)`
  - 本机安装路径：`/Applications/web2.5.app`
  - Bundle：`com.yourCompany.web25.extension`
  - 2026-05-04 11:59 已替换本机 App 到 `BUILD_ID=2026-05-04-1159`。签名验证通过，App / Extension 版本为 `1.0.76 (77)`，manifest 为 `0.1.76`；`pluginkit` 已重新启用扩展。`npm run safari:verify-live` 确认真实 Safari X 页读到新版：首页 `build=2026-05-04-1159`、`sidebar=1`、`sideButtons=4`、`marking=1`、`articles=6`；详情页 `https://x.com/YLDLZN/status/2050723821460853237` 返回 `build=2026-05-04-1159`、`detail=1`、`sidebar=1`、`flushes=14`、`sideButtons=3`、`manualButtons=14`、`marking=1`、`articles=30`、`stage=scan:done`。另一个详情页 `https://x.com/fadai202202/status/2051011398134911475` 当时未加载出回复列表，停在 `articles=0` / `stage=scan:not-enough-articles`。
  - 2026-05-04 10:34 已替换本机 App 到 `BUILD_ID=2026-05-04-1034`。签名验证通过，App / Extension 版本为 `1.0.74 (75)`，manifest 为 `0.1.74`；`pluginkit` 已重新启用扩展。`npm run safari:verify-live` 确认真实 Safari 页 `https://x.com/fadai202202/status/2051011398134911475` 为 `build=2026-05-04-1034`、`stage=scan:done`、`articles=13`、有可见 `冲走` 按钮和右栏关闭按钮；底部文案不再出现“手动记录下沉”。手动点击底部展开、等待 4 秒、收起，4 张卡片均稳定存在，未复现“无下沉”或按钮变灰。
  - 2026-05-04 09:57 已替换本机 App 到 `BUILD_ID=2026-05-04-0951`。签名验证通过，App / Extension 版本为 `1.0.71 (72)`，manifest 为 `0.1.71`；`pluginkit` 已重新启用扩展；`npm run safari:verify-live` 确认真实 Safari X 标签页读到新版 `build=2026-05-04-0951`。当时 X 两个详情页都没有加载出回复列表（`articles=0` / `stage=boot` 或 `scan:not-enough-articles`），所以本轮已验证新版注入、签名和安装，尚无可见回复按钮样本；后续遇到正常加载回复的详情页应再补验底部列表展开是否稳定。
  - 2026-05-04 09:38 已替换本机 App 到 `BUILD_ID=2026-05-04-0938`。本轮只统一用户文案：官网控制台用“后台直接下沉 / 后台学习库下沉”，底部整理卡片和原因短句也统一叫后台；历史手动记录不叫“你刚标记”。
  - 2026-05-04 09:18 已替换本机 App 到 `BUILD_ID=2026-05-04-0918`。底部整理卡片统一“后台/本机/手动记录”口径：AI 和数据库学习库对用户统一叫后台；历史手动记录不再叫“你刚标记”。本轮只改 UI 文案和历史手动来源分类，不改筛选阈值、数据库结构或真实数据。
  - 2026-05-04 02:11 已替换本机 App 到 `BUILD_ID=2026-05-04-0159`、缓存号 `web25-reply-ai-cache-v9`。签名验证通过，App / Extension 版本为 `1.0.67 (68)`，manifest 为 `0.1.67`；`pluginkit` 已重新启用扩展；`npm run safari:verify-live` 对真实 X 首页和详情页通过：首页 `build=2026-05-04-0159`、`sidebar=1`、`sideButtons=5`、`marking=1`；详情页 `https://x.com/YLDLZN/status/2050723821460853237` 返回 `build=2026-05-04-0159`、`detail=1`、`sidebar=1`、`flushes=12`、`sideButtons=4`、`manualButtons=12`、`marking=1`、`articles=28`、`stage=scan:done`。本轮没有改右栏 UI，只修回复 AI 审核速度、重试、等待显示和已知命中不被老师复核阻塞。
  - 2026-05-04 01:29 已替换本机 App 到 `BUILD_ID=2026-05-04-0124`、缓存号 `web25-reply-ai-cache-v8`。签名验证通过，App / Extension 版本为 `1.0.66 (67)`，manifest 为 `0.1.66`；`npm run safari:verify-live` 对真实 X 首页和详情页通过：首页 `build=2026-05-04-0124`、`sidebar=1`、`sideButtons=5`、`marking=1`、`articles=4`、`stage=ads:done`；详情页 `https://x.com/ronronzi/status/2050591230275539384` 返回 `build=2026-05-04-0124`、`detail=1`、`sidebar=1`、`flushes=3`、`sideButtons=4`、`manualButtons=3`、`marking=1`、`articles=54`、`stage=scan:done`。本轮没有改右栏 UI，只修 AI 等待时的误藏和批量请求等待时间。
  - 2026-05-04 00:59 已替换本机 App 到 `BUILD_ID=2026-05-04-0037`、缓存号 `web25-reply-ai-cache-v7`。签名验证通过，App / Extension 版本为 `1.0.65 (66)`，manifest 为 `0.1.65`；`npm run safari:verify-live` 对真实 X 详情页通过：`build=2026-05-04-0037`、`detail=1`、`sidebar=1`、`flushes=1`、`sideButtons=4`、`manualButtons=1`、`marking=1`、`articles=13`、`stage=scan:done`。本轮修花体/上标英文标签和装饰壳短口号证据。
  - 2026-05-03 23:45 已替换本机 App 到 `BUILD_ID=2026-05-03-2345`、缓存号 `web25-reply-ai-cache-v6`、新增中英混合短口号证据。签名验证通过，`pluginkit` 显示扩展版本 `1.0.64`；`npm run safari:verify-live` 对真实 X 详情页通过：`build=2026-05-03-2345`、`detail=1`、`sidebar=1`、`flushes=10`、`sideButtons=4`、`manualButtons=10`、`marking=1`、`articles=13`、`stage=scan:done`。
  - 2026-05-03 22:46 已替换本机 App 到 `BUILD_ID=2026-05-03-2246`、缓存号 `web25-reply-ai-cache-v5`、单批 AI 候选 8。签名验证通过，`pluginkit` 显示扩展版本 `1.0.63`；`npm run safari:verify-live` 对真实 X 首页通过：`build=2026-05-03-2246`、`sidebar=1`、`sideButtons=5`、`marking=1`、`articles=5`、`stage=ads:done`。当前打开的是首页，不是详情页，所以本轮尚未产生新的真实回复 AI 样本；用户可以打开 X 详情页继续刷，后续用 D1 区分 `pending` 和 `ready`。
  - 2026-05-03 14:12 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-1402`、缓存号 `web25-reply-ai-cache-v4`、`generic_short_slogan_reply` 标签和 `pattern:generic-short-slogan-lure-account` 候选键。签名验证通过，`npm run safari:verify-live` 读到新版；真实页 `https://x.com/ronronzi/status/2050591230275539384` 加载后为 `build=2026-05-03-1402`、`stage=scan:done`、`articles=47`。截图样本中的 `PaulBarbar6873`、`RyanTerrel92368`、`zhizi856`、`dffgfoo02` 已隐藏，`sorallllllan` 正常评论仍可见。
  - 2026-05-03 13:27 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-1327`、缓存号 `web25-reply-ai-cache-v3`，并把 AI 候选显示顺序提前为 `AI 复审中`。签名验证通过，`npm run safari:verify-live` 读到新版。真实 X 详情页 `https://x.com/yizhunli10167/status/2050601910487461905` 加载完成后为 `build=2026-05-03-1327`、`stage=scan:done`、`articles=45`；`天使熊附近的来 @hayes_jaco16929` 对应行 `data-web25-hidden=1` 且 `display:none`。注意：这证明本机页面已隐藏；线上数据库个人列表没有查到该条，不能声称这条真实记录已经落库为 AI 判断。
  - 2026-05-03 13:02 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-1256`、AI 批量上限 16、缓存号 `web25-reply-ai-cache-v2`。签名验证通过，`pluginkit` 显示扩展版本 `1.0.60`。`npm run safari:verify-live` 对真实 X 详情页 `https://x.com/YLDLZN/status/2050723821460853237` 通过：`build=2026-05-03-1256`、`detail=1`、`sidebar=1`、`flushes=6`、`sideButtons=3`、`manualButtons=6`、`marking=1`、`articles=22`、`stage=scan:done`。
  - 2026-05-03 11:42 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-1138`、`寻男/固泡` 风险昵称和 emoji alt 正文提取。签名验证通过，`pluginkit` 显示扩展版本 `1.0.59`。`npm run safari:verify-live` 读到新版；真实 X 详情页随后加载完成：`build=2026-05-03-1138`、`stage=scan:done`、`articles=19`，`孙甜甜寻男大固泡 @MonaKristi9125` 对应行 `hidden=true` 且 `cellHidden=true`。
  - 2026-05-03 11:26 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-1117`、`灵魂` 等新装饰口号词、`\u{13000}-\u{1342F}` 符号壳识别和 `decorative-slogan-from-suspicious-handle` 证据。签名验证通过，`pluginkit` 显示扩展版本 `1.0.58`。`npm run safari:verify-live` 对真实 X 详情页通过：`build=2026-05-03-1117`、`detail=1`、`sidebar=1`、`flushes=11`、`sideButtons=3`、`manualButtons=11`、`marking=1`、`articles=15`、`stage=scan:done`。进一步检查该页 `灵魂/余生/静待/远离/同频/静候/随缘` 等关键词和截图账号，`matchedRows=[]`，说明这些漏网回复已不在可见页面里。
  - 2026-05-03 10:48 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-1039`、AI 批量上限 12、老师复核分 3 和 `teacher_review_requested` 前置标签。签名验证通过，`pluginkit` 显示扩展版本 `1.0.57`。`npm run safari:verify-live` 对真实 X 首页和详情页通过：详情页 `https://x.com/wysgdmn/status/2050614965938389445` 返回 `build=2026-05-03-1039`、`detail=1`、`sidebar=1`、`flushes=12`、`sideButtons=3`、`manualButtons=12`、`marking=1`、`articles=26`、`stage=scan:done`。
  - 2026-05-03 10:07 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-1001` 和新模板 `浅交`、`高质量交友`、`品行相近`、`拒绝无效的寒暄`。签名验证通过，`pluginkit` 显示扩展版本 `1.0.56`。`npm run safari:verify-live` 对真实 X 详情页通过：`build=2026-05-03-1001`、`detail=1`、`sidebar=1`、`flushes=12`、`sideButtons=3`、`manualButtons=12`、`marking=1`、`articles=22`、`stage=scan:done`。
  - 2026-05-03 09:40 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-0037` 和 `teacher_review_requested` 老师复核标记。签名验证通过，`pluginkit` 显示扩展版本 `1.0.55`。`npm run safari:verify-live` 对真实 X 详情页通过：`build=2026-05-03-0037`、`detail=1`、`sidebar=1`、`flushes=4`、`sideButtons=3`、`manualButtons=4`、`marking=1`、`articles=25`、`stage=scan:done`。
  - 2026-05-03 00:22 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-0022` 和 `人间.{0,4}(钟情|柔情)` 新模板。签名验证通过，`pluginkit` 显示扩展版本 `1.0.54`。`npm run safari:verify-live` 通过读取新版 build；真实 X 详情页加载到 `articles=27`，`Minsqw / 人间钟情柔情` 对应格子 `display:none`。
  - 2026-05-03 00:11 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-03-0011` 和新增装饰符号壳识别。签名验证通过，`pluginkit` 显示扩展版本 `1.0.53`。`npm run safari:verify-live` 通过读取新版 build；真实 X 详情页随后加载到 `articles=27`，7 条用户指出的同款全部隐藏，页面中对应格子 `display:none`。
  - 2026-05-02 23:57 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-2357`、新顺序的 `pattern:poetic-slogan-lure-account` 键和截图同款诗句模板。签名验证通过，`pluginkit` 显示扩展版本 `1.0.52`。`npm run safari:verify-live` 对两个真实 X 详情页通过：一个页面 `articles=15`、可见 `冲走` 按钮 3 个、右栏关闭按钮 3 个、`stage=scan:done`；另一个页面读到新版 build 但 X 暂未加载回复列表。
  - 2026-05-02 23:43 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-2340` 和新的“全国安排头像批量诗句空话”模板。签名验证通过，`pluginkit` 显示扩展版本 `1.0.51`。`npm run safari:verify-live` 对两个真实 X 详情页通过：`build=2026-05-02-2340`、详情页有可见 `冲走` 按钮 6/12 个，右栏关闭按钮 3/4 个，`stage=scan:done`。
  - 2026-05-02 23:25 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-2317`、`有缘自会相识` / `怡好刚好温良友` 诗句模板、`emoji_noise_reply` 头像取证标签和上下文脱节判断。签名验证通过，`pluginkit` 显示扩展版本 `1.0.50`。`npm run safari:verify-live` 对当前打开的 X 详情页和首页均读到 `build=2026-05-02-2317`；详情页当时 `articles=0`、首页 `stage=ads:done` 但没有右栏模块样本，所以本轮证明注入成功，未能看到可见 `冲走` / 右栏关闭按钮数量。
  - 2026-05-02 21:57 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-2157`、新的“是不是这个 + 网盘链接”识别词，以及 Safari 存储读取超时兜底。签名验证通过，`pluginkit` 已启用扩展。最终 `npm run safari:verify-live` 对当前 `https://x.com/home` 通过，返回 `build=2026-05-02-2157`、`marking=1`、`stage=ads:done`。
  - 2026-05-02 21:48 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-2148` 和新的“是不是这个 + 网盘链接”识别词，签名验证通过，`pluginkit` 已启用扩展。`npm run safari:verify-live` 对当前打开的 X 详情页通过，返回 `build=2026-05-02-2148`、`marking=1`、`articles=0`、`stage=scan:not-enough-articles`；该页当时没加载出回复列表，所以未能看到可见 `冲走` / 右栏关闭按钮数量。
  - 2026-05-02 21:24 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-2124`，签名验证通过，`pluginkit` 已启用扩展。`npm run safari:verify-live` 对当前打开的 `https://x.com/home` 通过，返回 `build=2026-05-02-2124`、`marking=1`、`stage=ads:done`。两个尝试打开的 X 详情页均未加载出回复列表（`articles=0`），因此未完成可见 `冲走` / 右栏关闭按钮数量验收；这属于 X 页面内容未加载，不是本机 App 缺新版。
  - 2026-05-02 19:12 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1912`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1912`、`flushes=15`、`manualButtons=15`、`sideButtons=3`、`articles=30`、`stage=scan:done`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1912`、`extensionVersion=0.1.46`。
  - 2026-05-02 18:46 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1846`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari 首页标签页返回 `build=2026-05-02-1846`、`marking=1`、`stage=ads:done`。尝试打开旧详情页 `https://x.com/kittenhyl/status/2050347599266504791` 时 X 一直停在 `stage=boot/articles=0`，不是插件未注入；已关闭该卡住标签。
  - 2026-05-02 18:22 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1822`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1822`、`flushes=4`、`manualButtons=4`、`sideButtons=3`、`articles=46`、`stage=scan:done`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1822`、`extensionVersion=0.1.44`。
  - 2026-05-02 17:56 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1756`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 标签页返回 `build=2026-05-02-1756`，但 X 当时没加载出回复列表，结果为 `articles=0`、`stage=scan:not-enough-articles`，所以只证明注入成功。2026-05-02 18:06 公网下载包已发布，`/downloads/latest.json` 返回 `buildId=2026-05-02-1756`、`extensionVersion=0.1.43`。
  - 2026-05-02 17:47 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1747`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1747`、`flushes=7`、`manualButtons=7`、`sideButtons=3`、`articles=29`、`stage=scan:done`。公网下载包已在本地生成，但 Cloudflare 登录令牌失效导致发布失败，公网 `/downloads/latest.json` 仍是上一版 `buildId=2026-05-02-1726`。
  - 2026-05-02 17:31 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1726`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1726`、`flushes=19/18`、`manualButtons=19/18`、`sideButtons=3`、`stage=scan:done`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1726`、`extensionVersion=0.1.40`。
  - 2026-05-02 17:11 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1650`，签名验证通过，`pluginkit` 已启用扩展，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1650`、`flushes=16`、`manualButtons=16`、`sideButtons=3`、`stage=scan:done`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1650`、`extensionVersion=0.1.39`。
  - 2026-05-02 16:34 继续按用户纠正补强并已发布公网：`梦萱/孟轩`本身不是问题，问题是 `🌸无线线下🌸`、`🌸无常线下🌸`、`🌸无偿线下🌸` 这种昵称绕写搭配随机数字 handle 和数字表情低信息回复。现在三种绕写都会被本地识别为风险昵称，也会进入云端 Worker 同构规则；回归样本仍确认 `有没有天安门附近的`、`附近有家面馆不错` 放过。线上 Worker Version ID：`71fc1d62-7185-4e64-9019-e6f10ab3bf45`。公网 `/downloads/latest.json` 返回 `buildId=2026-05-02-1633`、`extensionVersion=0.1.37`。线上 AI 设置测试样本 `孟轩🌸无常线下🌸 @MullerChri42258 / 2🙃😍🧡` 返回 `action=hide`、`confidence=high`、`model=deepseek-v4-flash`、标签 `meaningless_bait`。
  - 2026-05-02 16:23 已补截图漏网规则：`梦萱🌸无线线下🌸 @MullerChri42258` 发 `2🙃😍🧡` 这类“线下绕写昵称 + 随机数字 handle + 数字表情低信息回复”现在会进入低信息诱导账号规则。本地和 Worker 同步改了 `无线/无限 + 线下` 显示名绕写、`🌸` 招揽昵称装饰识别。回归样本：`有没有天安门附近的`、`附近有家面馆不错` 仍放过。
  - 2026-05-02 16:35 已替换本机 App；`/Applications/web2.5.app` 内含 `BUILD_ID=2026-05-02-1633`，签名验证通过，`npm run safari:verify-live` 通过。真实 Safari X 详情页返回 `build=2026-05-02-1633`、`flushes=7/16`、`sideButtons=3`、`stage=scan:done`。
  - 2026-05-02 15:41 用户真实检查发现 `冲走` 按钮没有默认出现。已把 `回复下方显示“冲走”` 改为默认开启，并对旧安装做一次自动迁移；用户以后主动关闭时仍保存选择。`scripts/verify-safari-extension-live.sh` 已加严：详情页有回复但没有可见 `冲走` 时直接失败，不能再只因 `BUILD_ID` 正确就放过。
  - 2026-05-02 15:45 已替换本机 App；签名验证通过；真实 Safari 详情页 `https://x.com/InfiCheesy/status/2050247194150945201` 返回 `build=2026-05-02-1541`、`detail=1`、`marking=1`、`manualButtons=8`、`flushes=8`、`sideButtons=3`、`stage=scan:done`。
  - 2026-05-02 13:59 用户准备换新 AI 前已复查插件：`BUILD_ID=2026-05-02-1307`，`codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app` 通过，`pluginkit -e use -i com.yourCompany.web25.extension` 通过，`npm run safari:verify-live` 通过。真实 Safari 页面 `https://x.com/home` 返回 `build=2026-05-02-1307`。当前没有发现插件失效。
  - 2026-05-02 13:07 已替换本机 App；`codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app` 通过；`npm run safari:verify-live` 通过。真实 Safari 页面结果：`https://x.com/home` 加载 `BUILD_ID=2026-05-02-1307`。
  - 2026-05-02 12:28 已替换本机 App；`codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app` 通过；`npm run safari:verify-live` 通过。真实 Safari 页面结果：`https://x.com/home` 加载 `BUILD_ID=2026-05-02-1222`，右栏关闭按钮曾返回 3 个可见按钮；后续页面重载时 X 侧栏可能暂未渲染，脚本仍确认 build 注入成功。

如果实际文件或线上状态与这里不一致，以实际检查结果为准，并更新本文件。

## 4. 数据库硬约束

Cloudflare D1 是重要生产数据，不是临时缓存。

必须守住：

- 动 schema、迁移、清理、危险写入前，先备份 D1
- 不删除真实用户事件
- 不删除真实同步历史
- 不删除真实全局规则
- 只清理已经确认的开发测试行
- 如果无法确认是不是测试数据，默认保留
- 不把单个用户反馈直接变成公共规则
- 不让个人偏好污染公共规则库

数据分层口径：

- 公共基础层：大家普遍不想看到的招嫖、诈骗、导流、黑产联系方式、高频垃圾模板
- 样本标注层：用户反馈、开发者审核、AI 判断都先成为样本和 label
- 个人偏好层：个人不喜欢的话题、语气、账号风格，后续再用 AI 或个性化规则处理

新账号可以共享公共基础库，但不能继承开发者账号的个人屏蔽数量、恢复数量、偏好和历史。

`冲走` 可以作为垃圾候选样本；`恢复` 只能表示“不该按垃圾处理 / 不应升级为公共垃圾规则”，不能当成另一类内容的反向训练样本。

## 5. 筛选机制硬约束

当前筛选机制已经得到用户明确认可，默认是稳态资产。

不要随意：

- 改评分阈值
- 重写筛选架构
- 把已经压住的引流话术放回来
- 只改本地不改云端
- 只改云端不改本地

必须守住的命中类型：

- `有万达广场附近的吗`
- `有附近的吗`
- `离得近的吗`
- `主页置顶看id`
- `搜我小号 vx123456`
- `NEW / dd / 极短符号 + 风险显示名 + 数字 handle`
- `哥哥我想要`
- `有哥哥找下吗`
- `找个同城的哥哥`
- 风险显示名配低信息回复，例如 `男大可约` + `dd`

必须避免误伤：

- `Apple ID 一直登不上`
- `我在万达广场附近上班`
- `万达广场附近有什么好吃的`
- `附近有家面馆不错`
- 普通账号正常说 `hi` / `ok`

当前关键模式键：

- `pattern:geo-meetup-bait`
- `pattern:geo-relationship-bait`
- `pattern:bait-question-shape`
- `pattern:low-information-lure-account`
- `pattern:low-information-strong-lure-name`

相关文件必须同构：

- `extension/content/rules.js`
- `extension/content/content.js`
- `cloudflare/src/index.js`

## 6. UI 硬约束

右栏关闭能力是稳定能力，不要乱改。

当前可关闭模块：

- `订阅 Premium`
- `X 上的直播`
- `你可能会喜欢`
- `相关用户`
- `有什么新鲜事`
- `推荐关注`
- 底部政策链接块

必须守住：

- 每块右上角有灰色小叉
- 点叉只关闭自己
- 关闭后不能留下白框
- 关闭后不能让页面白屏
- 页面局部重渲染后要能补挂灰叉
- 真正刷新页面后模块会重新出现，用户可以再次关闭

右栏关闭是“当前页面有效”，不是“跨刷新永久记忆”。

## 7. 常见任务怎么做

### 改筛选规则

1. 先看 `docs/current-stable-filter-state.md`
2. 小范围定向加权，不大改架构
3. 同时改本地和云端：
   - `extension/content/rules.js`
   - `extension/content/content.js`
   - `cloudflare/src/index.js`
4. 更新 `BUILD_ID`
5. 跑语法检查和样本回归
6. `npm run cloud:check`
7. 需要上线就 `npm run cloud:deploy`
8. 需要本机可用就重建并替换 `/Applications/web2.5.app`
9. 更新稳定状态文档
10. 提交并推送

### 改数据库或清理数据

1. 先备份远程 D1
2. 明确目标是 schema、迁移、还是清理
3. 只处理确认范围内的数据
4. 不确定是不是测试数据就保留
5. 改完验证表结构、关键计数、个人/全局分层
6. 记录备份文件和执行结果

只读分层审计优先用：

```bash
npm run cloud:audit-data-layer
```

如果 Cloudflare token 失效，`wrangler d1 execute --remote` 会失败；这个脚本走线上开发者登录接口，部署后更适合做日常验收。

本机当前 macOS 系统代理是 `127.0.0.1:7897`。审计脚本会自动检测 HTTPS 代理并重启自己；如果未来又出现 `fetch failed`，先检查代理是否还在运行。

### 改网站 / Worker

1. 读 `cloudflare/src/index.js`、`site/`、`wrangler.jsonc`
2. 跑 `npm run cloud:check`
3. 需要上线就 `npm run cloud:deploy`
4. 记录 Cloudflare Version ID
5. 更新相关文档

### 更新本机 Safari App

常用流程：

```bash
npm run safari:build
rm -rf /Applications/web2.5.app
ditto /tmp/web25-derived/Build/Products/Debug/web2.5.app /Applications/web2.5.app
codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app
open /Applications/web2.5.app
npm run safari:verify-live
```

重要：替换 App 后，已经打开的 `x.com` / `twitter.com` 标签页不会自动重新注入 content script。必须刷新 X 标签页，或者重启 Safari 后再验证。否则用户会看到“冲走”和右栏灰叉都消失，但其实只是旧标签页没有加载扩展。

可以用 Safari AppleScript 验证真实页面是否已注入：

```bash
osascript -e 'tell application "Safari" to do JavaScript "document.documentElement.dataset.web25Build || \"NO_WEB25_BUILD\"" in current tab of front window'
```

如果返回 `NO_WEB25_BUILD`，优先刷新当前 X 标签页；如果仍不行，再检查 Safari 扩展开关和站点权限。

如果只是 Cloudflare Worker / 网站改动，不一定需要更新本机 App。只要影响扩展代码，就需要。

## 8. 常用验证命令

按改动范围选择，不要假装验证过。

```bash
git status --branch --short
node --check cloudflare/src/index.js
node --check extension/content/rules.js
node --check extension/content/content.js
npm run cloud:audit-data-layer
npm run cloud:check
npm run cloud:deploy
rg -n "BUILD_ID|displayNameLooksStrongLure|low-information-strong-lure-name" "/Applications/web2.5.app/Contents/PlugIns/web2.5 Extension.appex/Contents/Resources/content"
codesign --verify --deep --strict --verbose=2 /Applications/web2.5.app
pluginkit -m -A | rg "web2\\.5|web25|yourCompany|Colorful"
```

真实页面注入验证：

```bash
osascript -e 'tell application "Safari" to do JavaScript "document.documentElement.dataset.web25Build || \"NO_WEB25_BUILD\"" in current tab of front window'
osascript -e 'tell application "Safari" to do JavaScript "document.querySelectorAll(\"[data-web25-action=manual-hide], .web25-sidebar-close, [data-web25-sidebar-close]\").length.toString()" in current tab of front window'
```

## 9. 下一步优先级

当前用户明确说，下一位 AI 主要要继续调试“AI 数据库、AI 审核本身、API 调度之间的关系”。这件事可以继续做，但不要重设计主页和控制台，用户已经认可当前主页和控制台形态。

当前最可能继续遇到的问题：

- AI 实际有没有读到真实页面：必须区分“开发者探针调用过模型”和“真实 Safari 页面写入了 `reply_ai_items` / `reply_ai_results`”。探针默认不写数据库，不能拿探针结果冒充真实页面学习记录。
- 当前设备有没有拿到 AI 设置：如果当前 `sync_key` / 设备没有绑定到开发者账号，`/api/state` 可能返回 `replyAiEnabled=false`，真实页面就不会产生新的 AI 学习记录。
- 漏网截图的正确处理：用户发漏网内容是在优化 AI 配置、证据输入和 AI 老师学习链路，不是让 Codex 直接手写截图短语。先看正文、昵称、handle、头像、图片、上下文和批量相邻这些证据，再决定是否需要 AI 复核、OCR/图片能力、样本标注或同构规则。
- 少量误杀会成为下一阶段重点：当前 2026-05-03 17:15 的筛选已经基本好用，后续不要继续无脑加严；要保护和原帖强相关的尖锐、粗口、反驳、吐槽，例如 `你穷怕了` 这类上下文相关评论。
- Safari 真实页面可能没有加载新版：替换本机 App 或发布下载包后，必须验证真实 X 页面里的 `BUILD_ID`、`冲走` 按钮和右栏关闭按钮；只看文件、签名或下载清单不够。
- 旧缓存可能影响判断：如果改了 AI 路由、候选显示顺序或缓存含义，需要检查本地 AI 缓存号是否要换，避免旧页面继续吃旧结果。
- 高风险数据库命中后继续叫 AI 不一定是浪费：2026-05-03 后这是“AI 老师补课”的设计；但普通正常回复仍不能全量调用 AI。
- 如果真实页面有 `reply_ai_items` 但没有 `reply_ai_results`，说明样本已写入但最终判断没落下；2026-05-03 22:46 后新样本应至少先有 `pending` 状态，后续刷新/重试会继续判断。
- 用户对等待的产品直觉是正确的：已知垃圾应由数据库瞬间处理，未知可疑项应尽快交给 AI，AI 判完立刻撤掉或留下。等待状态只是网络、页面脚本、云端调用和写库之间的实现细节，不能变成长期状态或默认先隐藏理由。后续优化应优先压缩等待、重试 pending、并减少临时隐藏。
- Cloudflare 登录可能偶尔失效：如果发布失败，要用人话告诉用户“网站还没更新到公网，原因是 Cloudflare 登录失效”，不要让用户读错误码。

第一优先级：把 AI 审核链路跑清楚

- 先确认插件不是每条回复都调用 AI：本地 `buildReplyAiModerationCandidate` 必须只把强风险或弱风险组合送进队列。
- 再确认云端优先查 `reply_ai_memory`：命中记忆时归入 `后台学习库下沉`，不再花 API 钱。
- 记忆没命中时再查 `moderation_rule_candidates`：命中 `db_rule_*` 时由数据库学习库直接挡住，不再花 API 钱。
- 只有记忆和数据库候选都没命中、又是可疑候选时，才进入真实模型调用。
- AI 直接高置信隐藏写入 `reply_ai_results`，再写入 `moderation_sample_labels`，沉淀到 `reply_ai_memory`，并刷新 `moderation_rule_candidates`。
- 用户点 `恢复误判` / `恢复这条` 后，应写入 `manual_allow`，停用对应 AI 记忆，压低对应数据库候选，并把旧隐藏从当前统计和当前明细里移走。
- 2026-05-02 19:29 已修 `recordModerationTrainingLabelFromEvent`：手动 `冲走` / `恢复` 写完 label 后会刷新候选规则；单用户反馈仍只算候选证据，不直接变公共规则。

第二优先级：调 API 调度和预算边界

- 先用控制台“测试一次 AI 接入”确认 Key、接口地址、模型名可用；这一步只测 API，不写真实回复审核表。
- 真实 X 页面调试时，只拿少量自然遇到的边界样本跑，不要大批量乱刷 API。
- 观察每条样本最后落到哪一层：本地规则直接下沉、后台直接下沉、后台学习库复用、用户手动冲走、用户恢复。
- 如果调用量异常，先查扩展队列和云端记忆命中，不要先改提示词。
- 如果误判异常，先查 AI 输入证据和提示词边界，不要把 `manual_allow` 当成公共放行规则。
- 用户已经明确：前期学习阶段不要为了省 token 让用户本人反复手动训练数据库；高风险、边界模糊、头像/图片有证据、数据库已命中但值得复核的候选，应在有上限的预算内让 AI 老师多看一点。

第三优先级：数据安全和真实验收

- D1 是生产数据；动 schema、清理、迁移、批量写入前必须备份。
- `manual_hide/冲走` 是垃圾候选，不等于公共规则。
- `manual_allow/恢复` 是抑制和纠错，不是反向训练成“用户喜欢”。
- 单用户重复冲走不能自动升级公共规则；公共升级需要多贡献者或开发者确认。
- 每次调试后跑 `npm run cloud:audit-data-layer`，确认个人统计和公共规则仍然分层。

第四优先级：普通用户登录闭环

- 接正式邮件验证码发送
- 普通用户登录后能看自己的统计和偏好
- 开发者模式与普通用户模式保持隔离

第五优先级：完整人工验收

- 插件里真实产生一条动作
- 看是否进入公网 D1
- 看是否出现在公网控制台
- 看开发者确认 / 撤回是否真实影响全局规则

暂时不要优先：

- AI 个性化
- 多浏览器扩展
- 大规模 UI 重做
- 重写插件体验
- 新增很多模块

## 10. 关键文件地图

核心规则：

- `extension/content/rules.js`
- `extension/content/content.js`
- `cloudflare/src/index.js`

云端和数据库：

- `cloudflare/schema.sql`
- `wrangler.jsonc`
- `docs/moderation-database-training-plan.md`
- `docs/ai-api-provider-handoff.md`

网站和控制台：

- `site/index.html`
- `site/console/index.html`
- `site/app.js`
- `site/styles.css`

Safari App：

- `scripts/build-safari-app.sh`
- `web2.5/web2.5.xcodeproj/project.pbxproj`
- `extension/manifest.json`

稳定状态文档：

- `AGENTS.md`
- `docs/current-stable-filter-state.md`
- `docs/current-stable-ui-state.md`
- `docs/next-thread-handoff.md`

## 11. 给新对话的提示词

可以直接把下面这段发给新对话：

> 你现在在 `/Users/boriszhang/Documents/Codex/project 1` 继续接手。先读 `AGENTS.md`，再快速读 `docs/next-thread-handoff.md` 的第 0、1、2、9、10、11、12 节；第 3 节旧发布记录只按关键词查，不要逐条复述。再读 `docs/current-stable-filter-state.md`、`docs/current-stable-ui-state.md`、`docs/moderation-database-training-plan.md` 的顶部结论；只有改 AI 设置、接口、模型或 Key 时再细读 `docs/ai-api-provider-handoff.md`。然后跑 `git status --branch --short`。用户没有计算机基础，只听人话，默认要自己完成检查、修改、测试、提交、推送、部署、本机 App 更新和验证。当前本机和公网最新都是 `BUILD_ID=2026-05-04-1034` / `extensionVersion=0.1.74`，公网 Worker Version ID 为 `e74435d5-b7cd-498b-b76f-c7d83c90adef`：底部“查看列表”按当前详情页缓存已下沉条目，不再因 X 临时卸载回复而变成“无下沉”；旧手动教学 / 历史命中统一显示为“后台学习库下沉”，不要再显示“手动记录下沉”或暗示用户刚刚点击；`ai-pending` 单独显示“后台复审中”；后台返回英文原因短句时要展示中文概括。如果 Cloudflare 之后再因登录过期或令牌失效发布失败，要立刻停下告诉用户登录，不要反复重试。最终主路线必须朝用户说的方向收敛：数据库 / AI 记忆先扫，已知垃圾立刻撤掉；数据库不知道但可疑时，尽快交给 AI；AI 判定垃圾就撤掉并沉淀回标注、记忆和数据库候选；AI 判定没问题就留在页面上；临时隐藏只能是极高风险安全桥，不是默认体验。上一版 1402 用户确认“屏蔽挺好，没有明显漏过”，下一阶段重点仍是减少少量误杀，尤其保护和原帖强相关的尖锐、粗口、反驳、吐槽。冲走、自动下沉、恢复、蓝框、广告跳过、右栏关闭、名字屏蔽、头像证据卡、后台学习库和数据库候选规则都不能改坏。用户发漏网内容时，先当作诊断和 AI 训练素材，不要无脑把截图文字写进数据库或本地规则；先解释为什么没挡住，再优先补证据输入、AI 老师复核、AI 标注/记忆/候选写回。只有 AI/数据库证据充分或用户明确确认后，才把可复用模式写成本地和 Worker 同构规则。核心目标是继续优化“AI 当老师，数据库当记忆本”：不要让每条回复都调用 AI；但用户已经明确 token 不是主要问题，高风险候选可以让 AI 老师补课，只是不能让这个补课阻塞已知垃圾的快速处理。必须区分“开发者探针调用过模型”和“真实 Safari 页面写入了 AI 学习记录”；探针默认不写数据库，真实页面 `reply_ai_items` 是已写入，`reply_ai_results.status=pending` 是待判断，`ready` 才是最终 AI 结论。用户 `冲走` / `恢复` 要写入样本和标注并刷新候选，但单用户反馈不能直接变公共规则；`manual_allow` 是纠错和抑制，不能当成用户喜欢这类内容。Cloudflare D1 是生产数据，动 schema、清理、迁移或批量写入前必须备份。

2026-05-03 用户明确补充：他们发来的任何漏网内容都是为了优化 AI 配置和 AI 老师学习链路，不是让 Codex 自己在本地硬写截图短语。后续应优先让 AI 老师判断并写入标签、记忆和候选规则，再由 AI/数据库证据或用户明确确认把可复用模式写回本地和 Worker。不要把单张截图直接变成本地规则。

## 12. 维护这份文件的规则

每次完成重要改动后，检查这份文件是否需要更新。

更新原则：

- 保持短、准、可执行
- 删除过时数字，不把历史计数写成实时状态
- 当前版本锚点要及时更新
- 第 11 节给新对话的提示词必须和第 3 节最新版本锚点一致
- 旧发布流水如果继续增长，应压缩或移到历史归档，不要让新 AI 每次接手都从头读完
- 新增高风险规则要写清楚原因
- 不要把聊天流水账搬进来
