import { useCallback, useEffect, useState } from "react";
import { loadSettings, saveSettings, type UserSettings } from "@/lib/settings";

let cache: UserSettings | null = null;
const subscribers = new Set<(s: UserSettings) => void>();

function notify(next: UserSettings) {
  cache = next;
  subscribers.forEach((cb) => cb(next));
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(cache);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    let mounted = true;
    if (cache === null) {
      loadSettings().then((s) => {
        if (!mounted) return;
        cache = s;
        setSettings(s);
        setLoading(false);
      });
    }
    const cb = (s: UserSettings) => setSettings(s);
    subscribers.add(cb);
    return () => {
      mounted = false;
      subscribers.delete(cb);
    };
  }, []);

  const update = useCallback(async (patch: Partial<UserSettings>) => {
    const next = await saveSettings(patch);
    notify(next);
    return next;
  }, []);

  return { settings, loading, update };
}
