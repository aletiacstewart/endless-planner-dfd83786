import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register the PWA service worker (auto-update). Available because of vite-plugin-pwa.
if ("serviceWorker" in navigator) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
