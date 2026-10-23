/**
 * Host half of the system-notifications bundle.
 *
 * The whole feature lives in the browser half (`client.js`): it watches the
 * Client Session status source and raises Web Notifications, then navigates back
 * to the waiting Session through `ctx.uiWorkspace.openSession()`. No Host
 * service is needed, so this entry only exists to register the bundle row.
 */
export function apply() {}
