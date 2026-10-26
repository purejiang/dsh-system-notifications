window.__ModuleLoader__.load({
  id: 'dsh-system-notifications',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    /**
     * Host UI primitives. The shell's own General settings rows render their toggle
     * with `Switch` and their actions with `Button` from this runtime module, so
     * reusing the same components keeps this row visually native instead of a
     * hand-drawn lookalike.
     */
    let primitives;
    try {
      primitives = require('@deepseek-ai/dsh-client-ui-primitives');
    } catch (error) {
      primitives = undefined;
      console.warn('system-notifications: host UI primitives unavailable; using fallback controls');
    }
    const HostSwitch = primitives ? primitives.Switch : undefined;
    const HostButton = primitives ? primitives.Button : undefined;

    /** Client locale namespace owned by this plugin. */
    const NS = 'system-notifications';
    /** localStorage key for the user preference (per browser profile). */
    const ENABLED_KEY = 'dsh.system-notifications.enabled';
    /** localStorage key for the "persistent" preference: keep notifications on screen. */
    const PERSISTENT_KEY = 'dsh.system-notifications.persistent';
    /** Marks that this browser was already asked once, so a dismissed prompt does not nag. */
    const PERMISSION_ASKED_KEY = 'dsh.system-notifications.permission-asked';
    /** Cap the action-center entries this page keeps alive. */
    const MAX_LIVE_NOTIFICATIONS = 6;
    /** Inline DeepSeek whale artwork (128×128 PNG, brand blue) so notifications do not depend on a served asset URL. */
    const NOTIFICATION_ICON = 'data:image/png;base64,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';
    const EMPTY_MAP = new Map();
    /** Stored title of the automatic first-use Workspace; the shell localizes it for display. */
    const DEFAULT_WORKSPACE_TITLE = 'default-workspace';

    /** Simplified Chinese dictionary and key-set source of truth. */
    const zh = {
      'settings.label': '系统通知',
      'settings.description': '等待审批或任务完成时发送系统通知，点击通知跳转到对应会话。',
      'settings.enabled': '已开启',
      'settings.disabled': '已关闭',
      'settings.needPermission': '尚未授权浏览器通知，打开开关即可授权。',
      'settings.denied': '浏览器已阻止通知，请在站点设置中允许后刷新页面。',
      'settings.unsupported': '当前环境不支持系统通知。',
      'settings.open': '授权',
      'settings.test': '测试通知',
      'settings.persistent.label': '常驻通知',
      'settings.persistent.description': '通知不会自动收起，直到你点击或手动关闭；关闭时按系统默认时长消失。',
      'notify.test.title': '系统通知已就绪',
      'notify.test.body': '点击这条通知即可跳转到对应会话。',
      'notify.approval.title': '需要你的审批',
      'notify.approval.body': '「{title}」正在等待你允许或拒绝一次工具调用。',
      'notify.approval.bodyTool': '「{title}」请求执行 {tool}，等待你的审批。',
      'notify.question.title': '需要你的回答',
      'notify.question.body': '「{title}」正在等待你的回答。',
      'notify.planReview.title': '计划待确认',
      'notify.planReview.body': '「{title}」的计划等待你确认。',
      'notify.interaction.title': '需要你的操作',
      'notify.interaction.body': '「{title}」正在等待你继续。',
      'notify.completed.title': '执行完成',
      'notify.completed.body': '「{title}」已完成本轮执行。',
      'notify.completed.bodyWithDuration': '「{title}」已完成本轮执行，耗时 {duration}。',
      'project.defaultWorkspace': '默认工作区',
      'duration.seconds': '{n} 秒',
      'duration.minutes': '{m} 分 {s} 秒',
      'duration.hours': '{h} 小时 {m} 分',
    };

    /** English mirror of the Chinese key set. */
    const en = {
      'settings.label': 'System notifications',
      'settings.description': 'Notify on approval requests and finished runs. Clicking a notification opens that session.',
      'settings.enabled': 'On',
      'settings.disabled': 'Off',
      'settings.needPermission': 'Browser notifications are not authorized yet. Turn the switch on to authorize.',
      'settings.denied': 'Notifications are blocked. Allow them in the site settings and reload.',
      'settings.unsupported': 'System notifications are unavailable in this environment.',
      'settings.open': 'Authorize',
      'settings.test': 'Test',
      'settings.persistent.label': 'Persistent notifications',
      'settings.persistent.description': 'Keep notifications on screen until you click or dismiss them. Off uses the system default timeout.',
      'notify.test.title': 'Notifications are ready',
      'notify.test.body': 'Click this notification to open the session.',
      'notify.approval.title': 'Approval needed',
      'notify.approval.body': '"{title}" is waiting for you to allow or reject a tool call.',
      'notify.approval.bodyTool': '"{title}" wants to run {tool} and is waiting for your approval.',
      'notify.question.title': 'Answer needed',
      'notify.question.body': '"{title}" is waiting for your answer.',
      'notify.planReview.title': 'Plan review pending',
      'notify.planReview.body': '"{title}" has a plan waiting for confirmation.',
      'notify.interaction.title': 'Action needed',
      'notify.interaction.body': '"{title}" is waiting for you to continue.',
      'notify.completed.title': 'Run finished',
      'notify.completed.body': '"{title}" finished its run.',
      'notify.completed.bodyWithDuration': '"{title}" finished its run in {duration}.',
      'project.defaultWorkspace': 'Default workspace',
      'duration.seconds': '{n}s',
      'duration.minutes': '{m}m {s}s',
      'duration.hours': '{h}h {m}m',
    };

    /**
     * Row metrics copied verbatim from the shell's own General rows
     * (ui-settings-general `DeveloperToolsRow.module.css`): 16px vertical
     * padding, 24px gap, a half-pixel hairline, 14/20 title and a 12/18
     * secondary description, with the shell's action cluster at 8px.
     */
    const SETTINGS_CSS = '.dsn-row{border-bottom:.5px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:24px;padding:16px 0;display:flex}.dsn-main{min-width:0}.dsn-title{font-size:14px;line-height:20px}.dsn-desc{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}.dsn-actions{align-items:center;gap:8px;min-width:0;display:flex}';
    const SETTINGS_CSS_ID = 'dsh-system-notifications/settings-row.css';

    /** Install the row stylesheet once, with the same data-plugin-css marker the shell's own CSS tags carry. */
    function installSettingsStyles() {
      if (
        typeof document === 'undefined' ||
        typeof document.querySelector !== 'function' ||
        typeof document.createElement !== 'function' ||
        !document.head
      ) {
        return;
      }
      if (document.querySelector(`style[data-plugin-css="${SETTINGS_CSS_ID}"]`) !== null) return;
      const tag = document.createElement('style');
      tag.dataset.plugin = 'dsh-system-notifications';
      tag.dataset.pluginCss = SETTINGS_CSS_ID;
      tag.textContent = SETTINGS_CSS;
      document.head.appendChild(tag);
    }

    /**
     * The test affordance is hidden by default: double-click the row title to
     * reveal it for this tab (sessionStorage), or open the GUI with
     * `?dshNotificationTest=1`. It is not a shipped user-facing control.
     */
    const TEST_MODE_KEY = 'dsh.system-notifications.test-mode';

    function readTestMode() {
      try {
        if (String(globalThis.location && globalThis.location.search).includes('dshNotificationTest=1')) return true;
      } catch {
        // A hostile location object is not a reason to fail the row.
      }
      try {
        return globalThis.sessionStorage.getItem(TEST_MODE_KEY) === '1';
      } catch {
        return false;
      }
    }

    function writeTestMode(value) {
      try {
        globalThis.sessionStorage.setItem(TEST_MODE_KEY, value ? '1' : '0');
      } catch {
        // Private-mode storage may be unavailable; the state still lives in React.
      }
    }

    /** Inline fallbacks used only when the host primitives module is unavailable. */
    const fallbackStyles = {
      button: {
        font: 'inherit',
        fontSize: '12px',
        lineHeight: '18px',
        color: 'var(--dsw-alias-label-primary)',
        background: '0 0',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: '6px',
        padding: '3px 10px',
        cursor: 'pointer',
      },
      switchTrack: {
        position: 'relative',
        width: '36px',
        height: '20px',
        padding: '2px',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        flexShrink: 0,
      },
      switchKnob: {
        display: 'block',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: 'var(--dsw-alias-bg-base)',
        transition: 'transform 120ms ease',
      },
    };

    function supportsNotifications() {
      return typeof globalThis.Notification !== 'undefined';
    }

    function currentPermission() {
      return supportsNotifications() ? Notification.permission : 'unsupported';
    }

    function readEnabled() {
      try {
        // Off until the user authorizes browser notifications and flips the
        // switch, so the first-run switch state matches the real capability.
        return globalThis.localStorage.getItem(ENABLED_KEY) === '1';
      } catch {
        return false;
      }
    }

    function writeEnabled(value) {
      try {
        globalThis.localStorage.setItem(ENABLED_KEY, value ? '1' : '0');
      } catch {
        // A browser that refuses storage still keeps the in-memory preference.
      }
    }

    /**
     * Persistent notifications stay on screen until the user acts on them.
     * Off by default: it changes how the OS treats every notification this
     * plugin raises, so it is an explicit opt-in.
     */
    function readPersistent() {
      try {
        return globalThis.localStorage.getItem(PERSISTENT_KEY) === '1';
      } catch {
        return false;
      }
    }

    function writePersistent(value) {
      try {
        globalThis.localStorage.setItem(PERSISTENT_KEY, value ? '1' : '0');
      } catch {
        // A browser that refuses storage still keeps the in-memory preference.
      }
    }

    return {
      inject: ['slots', 'locale'],

      apply(ctx) {
        const t = ctx.locale.bind(NS);
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'system-notifications: dictionaries');
        installSettingsStyles();

        let enabled = readEnabled();
        let persistent = readPersistent();
        let visibleSessionId;
        let latestSessions;
        let latestWorkspaces;
        let latestPanelInfo;
        let disposed = false;
        const preferenceListeners = new Set();
        const liveNotifications = new Set();
        /** Start time of the currently running interval, per Session. */
        const runningSince = new Map();

        function subscribePreferences(listener) {
          preferenceListeners.add(listener);
          return () => {
            preferenceListeners.delete(listener);
          };
        }

        /** Tell both settings rows that a stored preference changed. */
        function notifyPreferencesChanged() {
          for (const listener of [...preferenceListeners]) {
            try {
              listener();
            } catch (error) {
              console.error('system-notifications: listener failed', error);
            }
          }
        }

        function setEnabled(value) {
          enabled = value;
          writeEnabled(value);
          notifyPreferencesChanged();
        }

        function setPersistent(value) {
          persistent = value;
          writePersistent(value);
          notifyPreferencesChanged();
        }

        function canNotify() {
          return enabled && !disposed && supportsNotifications() && Notification.permission === 'granted';
        }

        /** Session display label: durable title, then a short id. */
        function sessionTitleFor(sessions, sessionId) {
          const summary = sessions && sessions.byId ? sessions.byId[sessionId] : undefined;
          if (summary && summary.displayTitle) return summary.displayTitle;
          const text = String(sessionId);
          return text.length > 8 ? text.slice(0, 8) : text;
        }

        /** Final non-empty segment of a Host path; mirrors the shell's workspace-title helper. */
        function projectNameFromPath(path) {
          if (typeof path !== 'string') return undefined;
          const trimmed = path.trim().replace(/[/\\]+$/u, '');
          if (trimmed === '') return undefined;
          const cut = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));
          const name = cut === -1 ? trimmed : trimmed.slice(cut + 1);
          return name === '' ? undefined : name;
        }

        /**
         * Project (Workspace) name for a Session: the Workspace row that accounts
         * it first, then the Session's own cwd basename. The automatic first-use
         * Workspace stores `default-workspace` and is shown localized.
         */
        function projectFor(sessions, workspaces, sessionId) {
          const items = workspaces && Array.isArray(workspaces.items) ? workspaces.items : [];
          const workspace = items.find(
            (item) => Array.isArray(item?.sessionIds) && item.sessionIds.includes(sessionId),
          );
          const title = typeof workspace?.title === 'string' ? workspace.title.trim() : '';
          if (title !== '') {
            return title === DEFAULT_WORKSPACE_TITLE ? t('project.defaultWorkspace') : title;
          }
          const summary = sessions && sessions.byId ? sessions.byId[sessionId] : undefined;
          return projectNameFromPath(summary && summary.cwd);
        }

        /** Compose the notification title as `project · event`; omit the project when unknown. */
        function withProject(title, project) {
          return project === undefined || project === '' ? title : `${project} · ${title}`;
        }

        function isSubagent(sessions, sessionId) {
          const summary = sessions && sessions.byId ? sessions.byId[sessionId] : undefined;
          // A running/pending status can arrive before the list row: treat an
          // unknown identity as a main Session rather than silently dropping it.
          if (!summary) return false;
          return summary.parentId !== undefined || summary.origin === 'subagent';
        }

        function isLookingAt(sessionId, panelInfo) {
          if (sessionId !== visibleSessionId) return false;
          // A non-null active panel means Settings (or another main panel) covers
          // the conversation, so the waiting Session is not actually on screen.
          if (panelInfo && panelInfo.activePanelId !== null) return false;
          return document.visibilityState === 'visible' && document.hasFocus();
        }

        function openSession(sessionId) {
          const workspace = ctx.get('uiWorkspace');
          if (workspace && typeof workspace.openSession === 'function') {
            try {
              workspace.openSession(sessionId);
              return;
            } catch (error) {
              console.error('system-notifications: openSession failed', error);
            }
          }
          console.warn('system-notifications: uiWorkspace.openSession is unavailable');
        }

        function deliver(spec) {
          if (disposed || !canNotify()) return;
          let notification;
          try {
            notification = new Notification(spec.title, {
              body: spec.body,
              tag: spec.tag,
              icon: NOTIFICATION_ICON,
              silent: false,
              // Ask the OS to keep the toast up until the user acts on it. The
              // browser/OS may still downgrade this (e.g. route it to the
              // notification center), so it is best-effort by design.
              requireInteraction: persistent,
            });
          } catch (error) {
            console.error('system-notifications: creating a Notification failed', error);
            return;
          }

          liveNotifications.add(notification);
          notification.onclick = () => {
            liveNotifications.delete(notification);
            try {
              notification.close();
            } catch {
              // The browser may already have retired it.
            }
            try {
              globalThis.focus();
            } catch {
              // Focusing is best-effort; the click already targets this page.
            }
            if (spec.sessionId) openSession(spec.sessionId);
          };
          const retire = () => liveNotifications.delete(notification);
          notification.onclose = retire;
          notification.onerror = retire;

          while (liveNotifications.size > MAX_LIVE_NOTIFICATIONS) {
            const oldest = liveNotifications.values().next().value;
            liveNotifications.delete(oldest);
            try {
              oldest.close();
            } catch {
              // Ignore a notification the OS already dropped.
            }
          }
        }

        function pendingContent(pendingInteraction, title) {
          switch (pendingInteraction.kind) {
            case 'approval': {
              const tool =
                typeof pendingInteraction.toolName === 'string' && pendingInteraction.toolName !== ''
                  ? pendingInteraction.toolName
                  : undefined;
              return {
                title: t('notify.approval.title'),
                body: tool
                  ? t('notify.approval.bodyTool', { title, tool })
                  : t('notify.approval.body', { title }),
              };
            }
            case 'question':
              return {
                title: t('notify.question.title'),
                body: t('notify.question.body', { title }),
              };
            case 'plan-review':
              return {
                title: t('notify.planReview.title'),
                body: t('notify.planReview.body', { title }),
              };
            default:
              return {
                title: t('notify.interaction.title'),
                body: t('notify.interaction.body', { title }),
              };
          }
        }

        /** Human-friendly elapsed time for the finished-run copy. */
        function formatElapsed(milliseconds) {
          const totalSeconds = Math.max(1, Math.round(milliseconds / 1000));
          if (totalSeconds < 60) return t('duration.seconds', { n: totalSeconds });
          if (totalSeconds < 3600) {
            return t('duration.minutes', {
              m: Math.floor(totalSeconds / 60),
              s: totalSeconds % 60,
            });
          }
          return t('duration.hours', {
            h: Math.floor(totalSeconds / 3600),
            m: Math.floor((totalSeconds % 3600) / 60),
          });
        }

        /**
         * Ask the browser for notification permission. Browsers only show the
         * prompt during a user gesture, so this is called from a click handler or
         * from the first page interaction armed by armPermissionGesture().
         */
        let permissionRequesting = false;
        let permissionAskedThisPage = false;

        async function requestNotificationPermission() {
          if (!supportsNotifications()) return 'unsupported';
          if (Notification.permission !== 'default') return Notification.permission;
          if (permissionRequesting) return 'default';
          permissionRequesting = true;
          let result = Notification.permission;
          try {
            result = await Notification.requestPermission();
          } catch (error) {
            console.error('system-notifications: requestPermission failed', error);
          } finally {
            permissionRequesting = false;
            permissionAskedThisPage = true;
            try {
              globalThis.localStorage.setItem(PERMISSION_ASKED_KEY, '1');
            } catch {
              // A refused storage still keeps the in-memory attempt flag.
            }
          }
          if (result === 'granted') {
            setEnabled(true);
            deliver({
              sessionId: visibleSessionId,
              title: withProject(
                t('notify.test.title'),
                visibleSessionId ? projectFor(latestSessions, latestWorkspaces, visibleSessionId) : undefined,
              ),
              body: t('notify.test.body'),
              tag: 'dsh-sn-test',
            });
          }
          return result;
        }

        /**
         * A page may not open the permission prompt on load, so request it on the
         * first real click/key press instead of requiring a visit to Settings.
         */
        function armPermissionGesture() {
          if (!supportsNotifications() || Notification.permission !== 'default') return;
          if (permissionAskedThisPage) return;
          try {
            if (globalThis.localStorage.getItem(PERMISSION_ASKED_KEY) === '1') return;
          } catch {
            // Without storage, keep the one-shot listener for this page only.
          }
          let armed = true;
          const attempt = () => {
            if (!armed) return;
            armed = false;
            void requestNotificationPermission();
          };
          const detach = () => {
            armed = false;
            document.removeEventListener('click', attempt, true);
            document.removeEventListener('keydown', attempt, true);
          };
          ctx.effect(() => {
            document.addEventListener('click', attempt, true);
            document.addEventListener('keydown', attempt, true);
            return detach;
          }, 'system-notifications: first-gesture permission');
        }

        /**
         * Always-mounted observer: diffs the Client-wide Session status snapshot
         * and raises one notification per newly pending interaction or finished run.
         *
         * The transitions are read from the Client session-service store instead of
         * a React render: a hidden tab throttles rendering, so two events that
         * arrive while the page is in the background (running -> idle) can collapse
         * into a single render and the completion edge would be lost.
         */
        function sessionStatusStore() {
          try {
            const service = ctx.get('uiSession');
            const store = service && service.sessionStatus;
            if (store && typeof store.getSnapshot === 'function' && typeof store.subscribe === 'function') {
              return store;
            }
          } catch (error) {
            console.error('system-notifications: reading the session status store failed', error);
          }
          return undefined;
        }

        /** Diff one status snapshot against the previous one and notify. */
        function observeStatuses(previous, statuses) {
          // Never throw out of this diff: the Host invokes store subscribers inside a
          // try/catch loop, so one bad snapshot would silently swallow every later
          // edge. A missing snapshot is a contract mismatch, not a notification event.
          if (typeof previous?.get !== 'function' || typeof statuses?.forEach !== 'function') return;
          if (!canNotify()) return;
          const list = latestSessions;
          const panelInfo = latestPanelInfo;

          for (const [sessionId, status] of statuses) {
            const before = previous.get(sessionId);
            if (status.running === true && !runningSince.has(sessionId)) {
              runningSince.set(sessionId, Date.now());
            }
            if (before === undefined) continue;
            if (isSubagent(list, sessionId)) continue;

            const completed = before.running === true && status.running === false;
            const startedAt = completed ? runningSince.get(sessionId) : undefined;
            if (completed) runningSince.delete(sessionId);

            const pending = status.pendingInteraction;
            const beforePending = before.pendingInteraction;
            if (pending !== undefined && (beforePending === undefined || beforePending.key !== pending.key)) {
              if (!isLookingAt(sessionId, panelInfo)) {
                const sessionTitle = sessionTitleFor(list, sessionId);
                const content = pendingContent(pending, sessionTitle);
                deliver({
                  sessionId,
                  title: withProject(content.title, projectFor(list, latestWorkspaces, sessionId)),
                  body: content.body,
                  tag: `dsh-sn-need-${sessionId}-${pending.key}`,
                });
              }
              continue;
            }

            if (pending === undefined && completed && !isLookingAt(sessionId, panelInfo)) {
              const sessionTitle = sessionTitleFor(list, sessionId);
              const elapsed = startedAt === undefined ? undefined : Date.now() - startedAt;
              deliver({
                sessionId,
                title: withProject(
                  t('notify.completed.title'),
                  projectFor(list, latestWorkspaces, sessionId),
                ),
                body:
                  elapsed === undefined
                    ? t('notify.completed.body', { title: sessionTitle })
                    : t('notify.completed.bodyWithDuration', {
                        title: sessionTitle,
                        duration: formatElapsed(elapsed),
                      }),
                tag: `dsh-sn-done-${sessionId}`,
              });
            }
          }
          for (const sessionId of [...runningSince.keys()]) {
            if (!statuses.has(sessionId)) runningSince.delete(sessionId);
          }
        }

        function StatusObserver(props) {
          const useStatus = props.useSessionStatus;
          const statuses = useStatus ? useStatus((snapshot) => snapshot) : EMPTY_MAP;
          const sessions = props.useSessions ? props.useSessions((state) => state) : undefined;
          const workspaces = props.useWorkspaces ? props.useWorkspaces((state) => state) : undefined;
          const panelInfo = props.usePanelInfo ? props.usePanelInfo((info) => info) : undefined;
          latestSessions = sessions;
          latestWorkspaces = workspaces;
          latestPanelInfo = panelInfo;
          const previousRef = React.useRef(null);
          const directRef = React.useRef(false);
          const directDisposeRef = React.useRef(null);

          function attachDirect() {
            if (directRef.current) return true;
            const store = sessionStatusStore();
            if (!store) return false;
            directRef.current = true;
            let previous = store.getSnapshot();
            // The Client store notifies its subscribers WITHOUT an argument: the Host's
            // `notifySubscribers(listeners, label)` calls every listener as `listener()`
            // and subscribers are expected to re-read `getSnapshot()`. Trusting a
            // listener argument yields `undefined` in the real page, which used to throw
            // on the first status change and drop every notification after it.
            directDisposeRef.current = store.subscribe(() => {
              const next = store.getSnapshot();
              observeStatuses(previous, next);
              previous = next;
            });
            return true;
          }

          React.useEffect(() => {
            attachDirect();
            return () => {
              directRef.current = false;
              const dispose = directDisposeRef.current;
              directDisposeRef.current = null;
              if (dispose) dispose();
            };
          }, []);

          React.useEffect(() => {
            const previous = previousRef.current;
            previousRef.current = statuses;
            if (attachDirect()) return; // The store subscription owns transitions.
            if (previous === null) return; // First snapshot is the load baseline.
            observeStatuses(previous, statuses);
          }, [statuses]);

          return null;
        }

        /** Session-scoped marker so completion notices can skip the visible conversation. */
        function SessionTracker(props) {
          const sessionId = props.sessionId;
          React.useEffect(() => {
            visibleSessionId = sessionId;
            return () => {
              if (visibleSessionId === sessionId) visibleSessionId = undefined;
            };
          }, [sessionId]);
          return null;
        }

        /**
         * A settings switch rendered with the host's primitive when available,
         * falling back to a hand-drawn one on a foreign shell. Returns null when
         * the browser cannot raise notifications at all.
         */
        function switchControl(key, checked, labelText, onChange) {
          if (!supportsNotifications()) return null;
          if (HostSwitch) {
            return h(HostSwitch, { key, checked, label: labelText, onChange });
          }
          return h(
            'button',
            {
              key,
              type: 'button',
              role: 'switch',
              'aria-checked': checked,
              'aria-label': labelText,
              style: {
                ...fallbackStyles.switchTrack,
                background: checked
                  ? 'var(--dsw-alias-brand-primary)'
                  : 'var(--dsw-alias-bg-layer-2)',
                boxShadow: 'inset 0 0 0 1px var(--dsw-alias-border-l1)',
              },
              onClick: onChange,
            },
            h('span', {
              style: {
                ...fallbackStyles.switchKnob,
                transform: checked ? 'translateX(16px)' : 'translateX(0)',
              },
            }),
          );
        }

        /** One General-settings row: authorization, on/off preference, and a test notification. */
        function SettingsRow(props) {
          const sessions = props.useSessions ? props.useSessions((state) => state) : undefined;
          const workspaces = props.useWorkspaces ? props.useWorkspaces((state) => state) : undefined;
          const [, bump] = React.useReducer((value) => value + 1, 0);
          const [permission, setPermission] = React.useState(currentPermission());
          // Hidden by default; revealed for this tab by double-clicking the row title
          // (or `?dshNotificationTest=1`) so the shipped surface stays clean.
          const [testMode, setTestMode] = React.useState(readTestMode());

          React.useEffect(
            () =>
              subscribePreferences(() => {
                setPermission(currentPermission());
                bump();
              }),
            [],
          );

          React.useEffect(() => {
            const sync = () => {
              setPermission(currentPermission());
              bump();
            };
            globalThis.addEventListener('focus', sync);
            document.addEventListener('visibilitychange', sync);
            return () => {
              globalThis.removeEventListener('focus', sync);
              document.removeEventListener('visibilitychange', sync);
            };
          }, []);

          function testTarget() {
            if (visibleSessionId) return visibleSessionId;
            if (sessions && sessions.ids && sessions.ids.length > 0) return sessions.ids[0];
            return undefined;
          }

          function sendTest() {
            const target = testTarget();
            deliver({
              sessionId: target,
              title: withProject(
                t('notify.test.title'),
                target ? projectFor(sessions, workspaces, target) : undefined,
              ),
              body: t('notify.test.body'),
              tag: 'dsh-sn-test',
            });
          }

          async function authorize() {
            if (!supportsNotifications()) {
              setPermission('unsupported');
              return;
            }
            const result = await requestNotificationPermission();
            setPermission(result === 'unsupported' ? 'unsupported' : result);
            bump();
          }

          function toggle() {
            if (!enabled) {
              if (currentPermission() !== 'granted') {
                void authorize();
                return;
              }
              setEnabled(true);
              bump();
              return;
            }
            setEnabled(false);
            bump();
          }

          function toggleTestMode() {
            const next = !testMode;
            setTestMode(next);
            writeTestMode(next);
          }

          const supported = supportsNotifications();
          const granted = permission === 'granted';
          const description =
            !supported
              ? t('settings.unsupported')
              : permission === 'denied'
                ? t('settings.denied')
                : permission === 'default'
                  ? t('settings.needPermission')
                  : enabled
                    ? t('settings.enabled')
                    : t('settings.disabled');

          /** Native shell button; falls back to a plain styled button on a foreign shell. */
          function actionButton(key, label, onClick) {
            if (HostButton) {
              return h(HostButton, { key, variant: 'outline', size: 'sm', onClick }, label);
            }
            return h(
              'button',
              { key, type: 'button', style: fallbackStyles.button, onClick },
              label,
            );
          }

          const actions = [];
          if (supported && permission === 'default') {
            actions.push(actionButton('authorize', t('settings.open'), () => void authorize()));
          }
          // Test affordance: only while the hidden test mode is on, and only when a
          // notification could actually be delivered.
          if (testMode && supported && granted && enabled) {
            actions.push(actionButton('test', t('settings.test'), sendTest));
          }

          const switchNode = switchControl('switch', enabled, t('settings.label'), toggle);
          if (switchNode) actions.push(switchNode);

          return h(
            'div',
            { className: 'dsn-row' },
            h(
              'div',
              { className: 'dsn-main', onDoubleClick: toggleTestMode },
              h('div', { className: 'dsn-title' }, t('settings.label')),
              h('div', { className: 'dsn-desc' }, description),
            ),
            h('div', { className: 'dsn-actions' }, actions),
          );
        }

        /**
         * Second General-settings row: keep notifications on screen until the
         * user acts on them. It sits next to the main row instead of inside it,
         * so each switch keeps a single label and the native row layout.
         */
        function PersistentRow() {
          const [, bump] = React.useReducer((value) => value + 1, 0);
          React.useEffect(() => subscribePreferences(() => bump()), []);

          if (!supportsNotifications()) return null;

          const control = switchControl(
            'persistent',
            persistent,
            t('settings.persistent.label'),
            () => setPersistent(!persistent),
          );
          return h(
            'div',
            { className: 'dsn-row' },
            h(
              'div',
              { className: 'dsn-main' },
              h('div', { className: 'dsn-title' }, t('settings.persistent.label')),
              h('div', { className: 'dsn-desc' }, t('settings.persistent.description')),
            ),
            h('div', { className: 'dsn-actions' }, control ? [control] : []),
          );
        }

        ctx.effect(
          () => () => {
            disposed = true;
            for (const notification of liveNotifications) {
              try {
                notification.close();
              } catch {
                // Already retired by the OS.
              }
            }
            liveNotifications.clear();
            preferenceListeners.clear();
          },
          'system-notifications: dispose',
        );

        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'system-notifications.observer',
              order: 40,
              locale: NS,
            },
            StatusObserver,
          ),
        );

        ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register(
            {
              name: 'conversation.composer.dock',
              id: 'system-notifications.current-session',
              order: 90,
              locale: NS,
            },
            SessionTracker,
          ),
        );

        ctx.slots.inject('settings.general.item', () =>
          ctx.slots.register(
            {
              name: 'settings.general.item',
              id: 'system-notifications',
              order: 25,
              locale: NS,
            },
            SettingsRow,
          ),
        );

        ctx.slots.inject('settings.general.item', () =>
          ctx.slots.register(
            {
              name: 'settings.general.item',
              id: 'system-notifications.persistent',
              order: 26,
              locale: NS,
            },
            PersistentRow,
          ),
        );

        armPermissionGesture();
      },
    };
  },
});
