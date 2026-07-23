// Browser desktop (OS) notifications. Works cross-laptop because the trigger
// is a socket event delivered to the logged-in user on whichever machine
// they're on.

// Ask the browser for permission (no-op if already decided / unsupported).
export const requestDesktopPermission = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  try {
    if (Notification.permission === 'default') Notification.requestPermission();
  } catch (_) { /* ignore */ }
};

// Show a desktop notification (only if the user granted permission).
export const showDesktopNotification = (body, title = 'PaidSocial') => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted' || !body) return;
  try {
    const n = new Notification(title, { body, icon: '/mediamintlogo.jpg', tag: `ps-${Date.now()}` });
    n.onclick = () => { try { window.focus(); } catch (_) { /* ignore */ } n.close(); };
  } catch (_) { /* ignore */ }
};
