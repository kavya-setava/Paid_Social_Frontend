// Promise-based confirm dialog, backed by <ConfirmHost/> mounted at the app root.
//   const ok = await confirmDialog({ title, message, confirmText, tone });
//   if (!ok) return;
// Falls back to window.confirm if the host isn't mounted (safety).
let handler = null;

export function registerConfirmHandler(fn) {
  handler = fn;
}

export function confirmDialog(opts) {
  const options = typeof opts === "string" ? { message: opts } : (opts || {});
  if (!handler) {
    return Promise.resolve(window.confirm(options.message || "Are you sure?"));
  }
  return handler(options);
}
