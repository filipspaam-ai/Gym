// Captures the browser's install prompt (Chrome/Android/Edge) so the app can offer its own button.

let deferred = null;
const listeners = new Set();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((fn) => fn());
  });
}

export const getInstallPrompt = () => deferred;

export function subscribeInstall(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
