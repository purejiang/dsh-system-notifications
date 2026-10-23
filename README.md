# System Notifications · DeepSeek Harness plugin

A **client-only** plugin for the DeepSeek Harness (`dsh`) Web UI that raises a desktop
notification when a session needs you, and jumps back to that session when you click it.

- A session **waits for permission approval / an answer / a plan review** → notification.
- A session **finishes a run** (`running` flips `true → false`) → notification.
- **Clicking** the notification brings the browser window to the front and opens that session.
- Settings live in **Settings → General → System Notifications**.

Notifications are edge-triggered: the first snapshot after page load is taken as the baseline,
so a refresh never floods you with a backlog.

> Version 1.1.0 — notification titles name the **project** (`Project · Event`,
> e.g. `harness-plugins · Approval required`), and the body names the session.

## Requirements

- DeepSeek Harness with plugin support (`engines.dsh: >=0.2.1-rc.2`), Web GUI served in a
  Chromium-based browser (Chrome/Edge). `http://127.0.0.1` is a secure context, so no HTTPS is
  required for the Notification API.
- The page must stay open — notifications are raised by the page's JavaScript, not by the host.

## Install

The package is not published on npm yet; install it straight from this repository:

```sh
dsh plugin --profile web add github:purejiang/dsh-system-notifications
```

Or in the Web UI: **Plugins → Install**, and paste
`github:purejiang/dsh-system-notifications`.

The plugin is build-free: it ships `index.js` (an empty host half that registers the bundle row)
and `client.js` (the whole feature). Refreshing the page after install is enough.

## Enable and test

1. Open **Settings → General → System Notifications** and switch it on.
2. Grant the browser's notification permission. The plugin asks once, on your **first click or
   keypress** after the page loads; you can also use the **Authorize** button in the same row.
   If you dismissed or denied the prompt, allow `http://127.0.0.1:3080` in
   `chrome://settings/content/notifications` (or the site icon in the address bar) and retry.
3. The **Test notification** button is hidden in the shipped UI. To use it, double-click the
   row title “System Notifications” (stored per session in `sessionStorage`), or open the page
   with `?dshNotificationTest=1`.

## Behaviour

- **When:** a new `pendingInteraction` appears (`approval`, `question`, or `plan-review`), or
  `running` changes from `true` to `false`.
- **Title:** `<project> · <event>`. The project is the title of the workspace that owns the
  session (the default workspace is localized, e.g. “Default Workspace”); if the workspace list
  is not loaded yet it falls back to the directory name of the session's `cwd`.
- **Body:** the session's display title plus the reason, e.g.
  ““Refactor the toolbar” requests to run bash and is waiting for your approval.”
  Approval notifications include the tool name; completion notifications include the elapsed
  time when the plugin observed the whole run.
- **Icon:** the embedded 128×128 DeepSeek whale mark (PNG data URL, no external requests).
- **Quiet while you watch:** no notification while that session's conversation panel is visible
  and the window has focus.
- **No noise:** subagent sessions are skipped, duplicate notifications collapse per session
  (`tag`), and at most 6 notifications are kept open.

## Settings row

The row is built from the host's own primitives (`Switch`/`Button` from
`@deepseek-ai/dsh-client-ui-primitives`), so its spacing and type match the built-in settings
rows. It shows the current state and explains why notifications are off when the browser
permission is denied.

## How it works

Everything is done through documented client extension points; no host-side code is needed:

| Need | Extension point |
| --- | --- |
| Detect waiting / finished | `shell.overlay` component reading `props.useSessionStatus()` |
| Session title | `props.useSessions()` → `SessionListState.byId[id].displayTitle` |
| Project name | `props.useWorkspaces()` (workspace title / session ownership), fallback to `cwd` |
| Am I looking at it | `props.usePanelInfo().activePanelId`, `document.hasFocus()`, `visibilityState` |
| Raise the notification | the browser `Notification` API |
| Click → open session | `ctx.get('uiWorkspace').openSession(sessionId)` |
| Settings controls | `settings.general.item` |

The `running` transition is observed both through React snapshots and by subscribing to the
client `uiSession.sessionStatus` store, because background tabs throttle rendering and would
otherwise coalesce a short run into no visible change.

## Files

```
package.json          # dsh.bundle + dsh.client declarations
cordis.patch.yml      # inserts the bundle row
index.js              # host half: registers the bundle, no logic
client.js             # observer, project-name resolution, session tracker, settings row
locale/en.json        # plugin list title/description (English)
locale/zh.json        # plugin list title/description (Chinese)
icon.svg              # plugin list / settings row icon
notification-icon.png # notification icon source (also embedded in client.js)
notification-icon.svg # vector source of the notification icon
```

## Limitations

- The page must remain open; a closed tab cannot notify.
- Notification layout (font, colour, extra buttons) is controlled by the browser and the OS.
- Clicking an old notification after a page reload focuses the window but may not reopen the
  session (the page context is gone).
- Notification titles are truncated by the OS; the project name is placed first so it stays
  visible.
- If the browser permission is denied, nothing is sent and the settings row states the reason.

## License

MIT
