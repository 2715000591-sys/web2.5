# 在 Safari 里跑起来

这份说明只针对当前仓库里的 `extension/` 文件夹。

## 你现在能做到什么

即使还没有 Xcode, 也可以先把这个扩展 `临时装进 Safari` 做原型验证。

## 第一步: 打开 Safari 的开发功能

1. 打开 `Safari`
2. 进入 `Safari > 设置`
3. 打开 `高级`
4. 勾上:
   - `在菜单栏中显示“开发”菜单`
   - 或在较新版本 Safari 里勾上 `显示 Web 开发者功能`

## 第二步: 允许未签名扩展

1. 继续在 `Safari > 设置`
2. 打开 `开发者` 标签
3. 勾上 `Allow unsigned extensions`

注意:

- 这个开关在退出 Safari 后可能会重置
- 下次再测时可能需要重新打开

## 第三步: 临时安装扩展

1. 还是在 `Safari > 设置`
2. 打开 `开发者` 标签
3. 点击 `Add Temporary Extension...`
4. 选择本项目里的这个文件夹:

```text
/Users/boriszhang/Documents/Codex/project 1/extension
```

5. 允许 Safari 的相关提示

Safari 会把这个扩展加到临时扩展列表里。

## 第四步: 启用扩展

1. 回到 `Safari > 设置`
2. 打开 `扩展` 标签
3. 找到 `web2.5`
4. 勾选启用

如果你使用 Safari Profile, 还需要在对应 Profile 的扩展权限里启用它。

## 第五步: 去 X 里测试

1. 打开一个 `X 单条帖子详情页`
2. 确认地址像这样:

```text
https://x.com/.../status/1234567890
```

3. 点击 Safari 工具栏里的扩展按钮
4. 打开 `web2.5`
5. 确认开关是开启状态

## 当前版本的预期表现

- 只处理 `详情页回复区`
- 只试图隐藏 `明显可疑的中文回复`
- `蓝标` 和 `你关注的人` 默认放行
- 如果隐藏了内容, 会在回复区最底部出现:
  - `已隐藏 N 条可疑回复`

## 如果没生效, 先检查这几件事

- 你打开的是不是 `单条帖子详情页`
- 扩展有没有启用
- 扩展开关是不是打开
- Safari 退出后是不是忘了重新勾 `Allow unsigned extensions`
- 页面是不是还没刷新

## 以后什么时候需要 Xcode

等你要做下面这些事时, 就需要 Xcode:

- 把扩展打包成正式 Safari 工程
- 做 macOS App 容器
- 上 iPhone/iPad
- 正式分发或上架
