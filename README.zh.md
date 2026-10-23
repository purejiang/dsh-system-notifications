# 系统通知 · DeepSeek Harness 插件

[English](README.md) | 中文

一个 **Client-only** 的 DeepSeek Harness（`dsh`）Web 插件：

- 会话**等待权限审批 / 等待回答 / 计划待确认**时，弹一条系统通知；
- 会话**执行完成**（`running` 由 `true` 变 `false`）时，弹一条系统通知；
- **点击通知**会把浏览器窗口切回前台，并直接跳到对应会话；
- 开关、授权和测试入口在 **设置 → 通用 → 系统通知**。

只在状态**发生跃迁**时通知；页面加载后的首帧快照作为基线，刷新不会补发历史通知。

> v1.1.0：通知标题带项目名，形如 `项目名 · 事件`（如 `harness-plugins · 需要你的审批`），
> 正文仍是 `「会话名」…`。

## 环境要求

- 带插件支持的 DeepSeek Harness（`engines.dsh: >=0.2.1-rc.2`），Web GUI 跑在 Chromium 内核浏览器
  （Chrome / Edge）里。`http://127.0.0.1` 属于安全上下文，不需要 HTTPS 就能用通知 API。
- **页面必须保持打开**：通知由页面里的 JavaScript 发出，不是宿主进程发出的。

## 安装

这个包还没有发布到 npm，直接从仓库安装：

```sh
dsh plugin --profile web add github:purejiang/dsh-system-notifications
```

或者在 Web UI 里打开 **插件 → 安装**，填 `github:purejiang/dsh-system-notifications`。

插件不需要构建：`index.js` 是只负责注册 bundle 行的空 Host 半，全部逻辑在 `client.js`。
装完刷新页面即可生效。

## 启用与测试

1. 打开 **设置 → 通用 → 系统通知**，打开开关。
2. 授权浏览器通知权限。插件会在页面加载后的**第一次点击/按键**时自动请求一次；也可以直接点
   行内的「授权」。如果之前误点了拒绝，去 `chrome://settings/content/notifications` 把
   `http://127.0.0.1:3080` 改为允许，或点地址栏左侧站点图标 → 网站设置 → 通知 → 允许。
3. **「测试通知」按钮默认隐藏**。需要测试时，在设置行**双击标题「系统通知」**（会话级，
   记在 `sessionStorage`），或用 `?dshNotificationTest=1` 打开页面。

## 行为

- **触发时机**：新的 `pendingInteraction` 出现（`approval` / `question` / `plan-review`），
  或 `running` 从 `true` 变为 `false`。
- **标题**：`项目名 · 事件`。项目名优先取会话所属工作区的标题（默认工作区显示本地化名称），
  工作区列表未加载时回退到会话 `cwd` 的目录名。
- **正文**：`「会话名」…`；审批通知会带工具名，完成通知在观察到完整运行区间时带本轮耗时。
- **图标**：内嵌的 128×128 DeepSeek 鲸鱼标（PNG data URL，不请求外部资源）。
- **不打扰**：你正在看该会话（对话面板可见且窗口有焦点）时不通知。
- **降噪**：子会话（subagent）不通知；同一会话按 `tag` 去重；最多同时保留 6 条。
- **点击**：聚焦窗口并通过 `openSession` 直接切到该会话。

## 设置行

设置行使用宿主自带的 primitives（`Switch` / `Button`），行距、字号与系统行一致。
浏览器权限被拒绝时会显示原因。

## 实现方式

全部能力都走 Harness 公开的 Client 扩展点，不需要宿主端代码：

| 需求 | 扩展点 |
| --- | --- |
| 监听等待 / 完成 | `shell.overlay` 里读取 `props.useSessionStatus()` |
| 会话标题 | `props.useSessions()` → `SessionListState.byId[id].displayTitle` |
| 项目名 | `props.useWorkspaces()`（工作区标题 / 会话归属），回退 `cwd` |
| 是否正在看该会话 | `props.usePanelInfo().activePanelId`、`document.hasFocus()`、`visibilityState` |
| 发系统通知 | 浏览器 `Notification` API |
| 点击跳转 | `ctx.get('uiWorkspace').openSession(sessionId)` |
| 设置行 | `settings.general.item` |

运行状态除了 React 快照，还直接订阅 Client 的 `uiSession.sessionStatus` store：后台标签页的渲染
会被浏览器节流，只靠渲染可能把一次短运行合并掉，导致漏发完成通知。

## 文件

```
package.json          # dsh.bundle + dsh.client 声明
cordis.patch.yml      # 插入 bundle 行
index.js              # Host 半：仅注册 bundle
client.js             # 观察器、项目名解析、会话跟踪、设置行
locale/en.json        # 插件列表标题/描述（英文）
locale/zh.json        # 插件列表标题/描述（中文）
icon.svg              # 插件列表/设置行图标
notification-icon.png # 系统通知图标源文件（已内嵌进 client.js）
notification-icon.svg # 通知图标的矢量源
```

## 已知限制

- 页面关闭后不会再有通知。
- 通知的字体、颜色、附加按钮由浏览器和系统控制。
- 页面刷新后，通知中心里的旧通知点击只会聚焦窗口，可能无法再切会话。
- 系统会截断过长的通知标题；项目名放在最前面以保证可见。
- 浏览器权限被拒绝时静默不发，设置行会显示原因。

## 许可证

MIT
