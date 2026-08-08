import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const stampNow = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const buildStamp = stampNow();

const VIRTUAL_ID = "virtual:build-stamp";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

/**
 * Serves a fresh timestamp on every rebuild. The config-time constant only
 * ever reflects dev-server boot, which made the stamp look permanently stale.
 */
function buildStampPlugin() {
  return {
    name: "build-stamp",
    resolveId(id: string) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    load(id: string) {
      if (id !== RESOLVED_ID) return null;
      return `export const stamp = ${JSON.stringify(stampNow())};`;
    },
    handleHotUpdate({ server }: { server: any }) {
      const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) server.moduleGraph.invalidateModule(mod);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BUILD_STAMP__: JSON.stringify(buildStamp),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    headers: {
      "Cache-Control": "no-store",
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
