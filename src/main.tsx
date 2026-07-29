import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Kill-switch: unregister any previously-installed service workers and clear
// their caches so stale preview builds stop being served.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then(async (regs) => {
      const removed = await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.allSettled(keys.map((k) => caches.delete(k)));
      }
      // If a stale worker was actually controlling this page, its cached HTML
      // may already be on screen — reload once to pick up the fresh build.
      if (removed.some(Boolean) && navigator.serviceWorker.controller) {
        window.location.reload();
      }
    })
    .catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
