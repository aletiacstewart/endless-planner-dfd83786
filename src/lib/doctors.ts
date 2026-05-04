/**
 * Shared Doctors directory — referenced by Medical Records and Medications.
 * Stored in the IndexedDB `meta` store under a single key so it doesn't appear
 * as a page in the planner navigation.
 */

import { getDB, newId } from "./db";

export interface Doctor {
  id: string;
  name: string;
  practice?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

const DOCTORS_KEY = "doctors";

export async function listDoctors(): Promise<Doctor[]> {
  const db = await getDB();
  const row = await db.get("meta", DOCTORS_KEY);
  const arr = (row?.value as Doctor[] | undefined) ?? [];
  return [...arr].sort((a, b) => a.name.localeCompare(b.name));
}

export async function addDoctor(input: Omit<Doctor, "id">): Promise<Doctor> {
  const db = await getDB();
  const row = await db.get("meta", DOCTORS_KEY);
  const arr = (row?.value as Doctor[] | undefined) ?? [];
  const doc: Doctor = { id: newId(), ...input };
  const next = [...arr, doc];
  await db.put("meta", { key: DOCTORS_KEY, value: next });
  return doc;
}

export async function getDoctor(id: string): Promise<Doctor | undefined> {
  const list = await listDoctors();
  return list.find((d) => d.id === id);
}

export function formatDoctor(d: Doctor): string {
  return d.practice ? `${d.name} — ${d.practice}` : d.name;
}
