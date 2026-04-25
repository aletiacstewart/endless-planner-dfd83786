import { getDB } from "./db";
import { DEFAULT_COVER_ID } from "@/data/covers";

export interface UserSettings {
  plannerName: string;
  ownerName: string; // shown on personalized covers (e.g. scrapbook)
  coverId: string;
  onboarded: boolean;
  createdAt: number;
}

const SETTINGS_KEY = "user-settings";

const DEFAULTS: UserSettings = {
  plannerName: "",
  ownerName: "",
  coverId: DEFAULT_COVER_ID,
  onboarded: false,
  createdAt: 0,
};

export async function loadSettings(): Promise<UserSettings> {
  const db = await getDB();
  const row = await db.get("meta", SETTINGS_KEY);
  if (!row) return { ...DEFAULTS };
  return { ...DEFAULTS, ...(row.value as Partial<UserSettings>) };
}

export async function saveSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const current = await loadSettings();
  const next: UserSettings = { ...current, ...patch };
  if (!next.createdAt) next.createdAt = Date.now();
  const db = await getDB();
  await db.put("meta", { key: SETTINGS_KEY, value: next });
  return next;
}
