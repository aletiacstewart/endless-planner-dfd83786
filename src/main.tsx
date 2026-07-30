import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Kill-switch: unregister any previously-installed service workers and clear
 * their caches so stale preview builds stop being served.
 *
 * Guarded by a sessionStorage flag so the reload can never loop.
 */
const RELOAD_FLAG = "sw-cleanup-reloaded";

async function cleanupStaleWorkers(force: boolean) {
  if (!("serviceWorker" in navigator)) return false;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    const removed = await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.allSettled(keys.map((k) => caches.delete(k)));
    }
    const wasControlled = Boolean(navigator.serviceWorker.controller);
    return (force || (removed.some(Boolean) && wasControlled));
  } catch {
    return false;
  }
}

const params = new URLSearchParams(window.location.search);
const forceFresh = params.get("fresh") === "1";

cleanupStaleWorkers(forceFresh).then((shouldReload) => {
  if (!shouldReload) return;
  if (sessionStorage.getItem(RELOAD_FLAG) === "1") return;
  sessionStorage.setItem(RELOAD_FLAG, "1");
  if (forceFresh) {
    params.delete("fresh");
    const q = params.toString();
    window.location.replace(window.location.pathname + (q ? `?${q}` : "") + window.location.hash);
  } else {
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
