/**
 * Full planner PDF export.
 *
 * Builds one complete PDF "book" of the planner: the chosen cover, a contents
 * list, then every filled page in planner order with all of its text, grids,
 * artwork (page graphic, stickers, sketches and uploaded photos).
 *
 * Runs entirely client-side on top of the existing jspdf + jspdf-autotable
 * dependencies. Image fetches are cached and individually guarded so one
 * missing photo can never abort the export.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAllEntries, type PlannerEntry, type FieldValue } from "./db";
import { loadSettings } from "./settings";
import { PAGE_TYPES, type FieldDef, type PageTypeDef, type SectionDef } from "./pageTypes";
import { getCover } from "@/data/covers";
import { getCoverPageIcon } from "./coverIcons";
import { getMeta, sortStickers, type Sticker } from "./entryMeta";
import { supabase } from "@/integrations/supabase/client";

/* -------------------------------------------------------------------------- */
/* Page geometry                                                               */
/* -------------------------------------------------------------------------- */

const PW = 595.28; // A4 portrait, points
const PH = 841.89;
const M = 46;
const CONTENT_W = PW - M * 2;
const BOTTOM = PH - M - 18;

const ROWS_PER_CONTENTS_PAGE = 32;

export type PdfProgress = (done: number, total: number, label: string) => void;

export interface PlannerPdfResult {
  entries: number;
  pages: number;
  missingPhotos: number;
}

/* -------------------------------------------------------------------------- */
/* Images                                                                      */
/* -------------------------------------------------------------------------- */

interface Img {
  dataUrl: string;
  w: number;
  h: number;
  format: "JPEG" | "PNG";
}

const imgCache = new Map<string, Img | null>();

function loadHtmlImage(src: string, anonymous: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only ask for CORS on cross-origin URLs — some same-origin asset proxies
    // reject the preflight and the load fails for no good reason.
    if (anonymous) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

/** Load with the most permissive settings that work, trying both CORS modes. */
async function loadAnyway(src: string): Promise<HTMLImageElement | null> {
  const isAbsolute = /^https?:\/\//i.test(src);
  const crossOrigin = isAbsolute && !src.startsWith(window.location.origin);
  try {
    return await loadHtmlImage(src, crossOrigin);
  } catch {
    try {
      return await loadHtmlImage(src, !crossOrigin);
    } catch {
      return null;
    }
  }
}

/** Ellipsis-truncate to fit a width, so contents rows never end mid-word. */
function fitText(doc: jsPDF, text: string, width: number): string {
  if (doc.getTextWidth(text) <= width) return text;
  let out = text;
  while (out.length > 1 && doc.getTextWidth(`${out}…`) > width) out = out.slice(0, -1);
  return `${out.trimEnd()}…`;
}

async function rasterize(src: string, maxPx: number, keepAlpha: boolean): Promise<Img | null> {
  try {
    const img = await loadAnyway(src);
    if (!img) return null;
    const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (!keepAlpha) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    return keepAlpha
      ? { dataUrl: canvas.toDataURL("image/png"), w, h, format: "PNG" }
      : { dataUrl: canvas.toDataURL("image/jpeg", 0.82), w, h, format: "JPEG" };
  } catch {
    return null;
  }
}

async function getImage(src: string, maxPx = 1400, keepAlpha = false): Promise<Img | null> {
  const key = `${src}|${maxPx}|${keepAlpha}`;
  if (imgCache.has(key)) return imgCache.get(key) ?? null;
  const out = src.startsWith("data:")
    ? await rasterize(src, maxPx, keepAlpha || src.startsWith("data:image/png"))
    : await rasterize(src, maxPx, keepAlpha);
  imgCache.set(key, out);
  return out;
}

/** Emoji stickers are drawn to a canvas first — PDF core fonts have no glyphs. */
async function emojiImage(emoji: string): Promise<Img | null> {
  const key = `emoji:${emoji}`;
  if (imgCache.has(key)) return imgCache.get(key) ?? null;
  try {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.font = `${Math.round(size * 0.78)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 2 + 4);
    const out: Img = { dataUrl: canvas.toDataURL("image/png"), w: size, h: size, format: "PNG" };
    imgCache.set(key, out);
    return out;
  } catch {
    imgCache.set(key, null);
    return null;
  }
}

let signedUrlCache: Map<string, string | null> | null = null;

async function journalPhotoUrl(path: string): Promise<string | null> {
  signedUrlCache ??= new Map();
  if (signedUrlCache.has(path)) return signedUrlCache.get(path) ?? null;
  try {
    const { data, error } = await supabase.storage.from("journal-photos").createSignedUrl(path, 3600);
    const url = error ? null : data.signedUrl;
    signedUrlCache.set(path, url);
    return url;
  } catch {
    signedUrlCache.set(path, null);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Value helpers                                                               */
/* -------------------------------------------------------------------------- */

const META_KEY = "__meta";

function stripHtml(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined || v === "" || v === false) return true;
  if (Array.isArray(v)) return v.every((x) => isEmptyValue(x));
  if (typeof v === "object") {
    return Object.entries(v as Record<string, unknown>).every(
      ([k, val]) => k.startsWith("__") || isEmptyValue(val),
    );
  }
  return false;
}

function prettyKey(key: string): string {
  return key.replace(/^__/, "").replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function scalarText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "—";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return /<[a-z][\s\S]*>/i.test(v) ? stripHtml(v) : v;
  if (Array.isArray(v)) return v.filter((x) => !isEmptyValue(x)).map((x) => scalarText(x)).join(", ");
  const obj = v as Record<string, unknown>;
  if (typeof obj.body === "string") return stripHtml(obj.body);
  return Object.entries(obj)
    .filter(([k, val]) => !k.startsWith("__") && !isEmptyValue(val))
    .map(([k, val]) => `${prettyKey(k)}: ${scalarText(val)}`)
    .join("  ·  ");
}

function entryDateLabel(entry: PlannerEntry): string {
  const v = entry.values ?? {};
  const raw =
    (typeof v.date === "string" && v.date) ||
    (typeof v.month === "string" && v.month) ||
    (typeof v.year === "string" && v.year) ||
    "";
  if (raw) return raw;
  return new Date(entry.createdAt).toLocaleDateString();
}

function entryTitle(pt: PageTypeDef | undefined, entry: PlannerEntry): string {
  const summary = pt?.summary?.(entry.values as Record<string, unknown>) ?? "";
  const title = entry.title || summary;
  return title ? String(title).slice(0, 90) : entryDateLabel(entry);
}

function collectFields(pt: PageTypeDef): FieldDef[] {
  const out: FieldDef[] = [];
  for (const s of pt.sections) {
    out.push(...s.fields);
    for (const g of s.groups ?? []) out.push(...g.fields);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* PDF writer                                                                  */
/* -------------------------------------------------------------------------- */

class Book {
  doc: jsPDF;
  y = M;

  constructor() {
    this.doc = new jsPDF({ unit: "pt", format: "a4" });
    this.doc.setFont("helvetica", "normal");
  }

  newPage() {
    this.doc.addPage();
    this.y = M;
  }

  ensure(h: number) {
    if (this.y + h > BOTTOM) this.newPage();
  }

  heading(text: string, size = 15) {
    this.ensure(size + 16);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(size);
    this.doc.setTextColor(35, 35, 55);
    this.doc.text(text, M, this.y + size);
    this.y += size + 8;
    this.doc.setDrawColor(210, 210, 220);
    this.doc.line(M, this.y, PW - M, this.y);
    this.y += 10;
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(0, 0, 0);
  }

  subheading(text: string) {
    this.ensure(26);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(70, 70, 95);
    this.doc.text(text, M, this.y + 11);
    this.y += 20;
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(0, 0, 0);
  }

  label(text: string) {
    this.ensure(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(95, 95, 115);
    this.doc.text(text, M, this.y + 9);
    this.y += 14;
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(0, 0, 0);
  }

  paragraph(text: string, size = 10.5, indent = 0) {
    if (!text) return;
    this.doc.setFontSize(size);
    const lines = this.doc.splitTextToSize(text, CONTENT_W - indent) as string[];
    const lh = size * 1.35;
    for (const line of lines) {
      this.ensure(lh);
      this.doc.text(line, M + indent, this.y + size);
      this.y += lh;
    }
    this.y += 4;
  }

  table(head: string[], body: string[][]) {
    if (!body.length) return;
    autoTable(this.doc, {
      startY: this.y,
      head: head.length ? [head] : undefined,
      body,
      styles: { fontSize: 8, cellPadding: 3.5, overflow: "linebreak", textColor: [30, 30, 40] },
      headStyles: { fillColor: [90, 90, 120], textColor: 255, fontSize: 8 },
      alternateRowStyles: { fillColor: [246, 246, 250] },
      margin: { left: M, right: M, top: M, bottom: M + 18 },
    });
    const finalY = (this.doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
    this.y = (finalY ?? this.y) + 14;
  }

  async image(img: Img, maxW = CONTENT_W, maxH = 420) {
    const ratio = Math.min(maxW / img.w, maxH / img.h, 1);
    const w = img.w * ratio;
    const h = img.h * ratio;
    this.ensure(h + 8);
    this.doc.addImage(img.dataUrl, img.format, M + (CONTENT_W - w) / 2, this.y, w, h);
    this.y += h + 12;
  }
}

/* -------------------------------------------------------------------------- */
/* Field rendering                                                             */
/* -------------------------------------------------------------------------- */

function measurementGridRows(field: FieldDef, data: Record<string, unknown>) {
  const columns = field.columns ?? [];
  const stored = Number((data as Record<string, string>).__rows);
  const rowCount = Math.max(
    field.rowCount ?? 26,
    Number.isFinite(stored) ? stored : 0,
  );
  const cell = (row: number, col: string) => {
    const v = data[`${row}-${col}`];
    if (v != null && v !== "") return scalarText(v);
    const legacy = col.includes("/") ? col.split("/")[0] : null;
    return legacy ? scalarText(data[`${row}-${legacy}`]) : "";
  };
  const rows: string[][] = [];
  for (let r = 1; r <= rowCount; r++) {
    const cells = columns.map((c) => cell(r, c));
    if (cells.every((c) => !c)) continue;
    rows.push([field.rowLabels?.[r - 1] ?? String(r), ...cells]);
  }
  return { head: [field.rowLabel ?? "#", ...columns], rows };
}

function genericObjectRows(data: Record<string, unknown>): string[][] {
  return Object.entries(data)
    .filter(([k, v]) => !k.startsWith("__") && !isEmptyValue(v))
    .map(([k, v]) => [prettyKey(k), scalarText(v)]);
}

/* -- shapes written by FieldRenderer, rendered faithfully in the export ----- */

interface DrawingLike {
  strokes?: { color?: string; width?: number; eraser?: boolean; points?: { x: number; y: number }[] }[];
}

/** Sketches are stored as normalised vector strokes — rasterise them for the PDF. */
function drawingToImage(value: DrawingLike, wPx = 1100, hPx = 620): Img | null {
  const strokes = (value.strokes ?? []).filter((s) => (s.points?.length ?? 0) > 0 && !s.eraser);
  if (!strokes.length) return null;
  const canvas = document.createElement("canvas");
  canvas.width = wPx;
  canvas.height = hPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, wPx, hPx);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) {
    // Stored colours may be CSS variables that no longer resolve outside the app.
    const colour = s.color && /^(#|rgb)/i.test(s.color) ? s.color : "#2b2b3a";
    ctx.strokeStyle = colour;
    ctx.lineWidth = Math.max(1, (s.width ?? 3) * (wPx / 700));
    ctx.beginPath();
    (s.points ?? []).forEach((p, i) =>
      i ? ctx.lineTo(p.x * wPx, p.y * hPx) : ctx.moveTo(p.x * wPx, p.y * hPx),
    );
    ctx.stroke();
  }
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), w: wPx, h: hPx, format: "JPEG" };
}

/** Checkbox groups store ids like "Cardio-0" — show the label the user ticked. */
function tickLabel(id: unknown): string {
  return String(id ?? "").replace(/-\d+$/, "").trim();
}

function numericKeyRows(data: Record<string, unknown>, head: [string, string]): { head: string[]; rows: string[][] } {
  const rows = Object.entries(data)
    .filter(([k, v]) => !k.startsWith("__") && !k.startsWith("g:") && !isEmptyValue(v))
    .map(([k, v]) => ({ k: k.replace(/^g/, ""), text: scalarText(v) }))
    .filter((r) => r.text)
    .sort((a, b) => (Number(a.k) || 0) - (Number(b.k) || 0))
    .map((r) => [r.k, r.text]);
  return { head, rows };
}

function markedDays(marks: Record<string, unknown>, rowIndex: number): string {
  return Object.entries(marks ?? {})
    .filter(([k, v]) => Boolean(v) && Number(k.split("-")[0]) === rowIndex)
    .map(([k]) => k.split("-")[1])
    .sort((a, b) => Number(a) - Number(b))
    .join(", ");
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthNames(list: string): string {
  return list
    .split(", ")
    .filter(Boolean)
    .map((m) => MONTH_LABELS[Number(m)] ?? m)
    .join(", ");
}

function medListRows(data: Record<string, unknown>): { head: string[]; rows: string[][] } {
  const numbers = new Set<number>();
  for (const k of Object.keys(data)) {
    const n = Number(k.split("_")[0]);
    if (Number.isFinite(n) && n > 0) numbers.add(n);
  }
  const cell = (n: number, key: string) => scalarText(data[`${n}_${key}`] ?? "");
  const rows: string[][] = [];
  for (const n of [...numbers].sort((a, b) => a - b)) {
    const times = (["m", "a", "n"] as const)
      .filter((k) => Boolean(data[`${n}_${k}`]))
      .map((k) => ({ m: "Morning", a: "Afternoon", n: "Night" })[k]);
    const cells = [cell(n, "name"), cell(n, "strength"), cell(n, "reason"), cell(n, "doctor"), times.join(", ")];
    if (cells.every((c) => !c)) continue;
    rows.push([String(n), ...cells]);
  }
  return { head: ["#", "Medication", "Strength", "Reason", "Prescriber", "When"], rows };
}

/**
 * Renders the field types that store structured data (grids, calendars, tick
 * lists, sketches). Returns true when it handled the field.
 */
async function renderTypedField(book: Book, field: FieldDef, value: FieldValue): Promise<boolean> {
  const obj = value !== null && typeof value === "object" ? (value as Record<string, unknown>) : null;

  switch (field.type) {
    case "drawing": {
      if (!obj) return false;
      const img = drawingToImage(obj as DrawingLike);
      book.label(field.label);
      if (img) await book.image(img, CONTENT_W, 300);
      else book.paragraph("(sketch is empty)", 9.5);
      return true;
    }
    case "checkbox-group": {
      if (!Array.isArray(value)) return false;
      const labels = value.map(tickLabel).filter(Boolean);
      if (!labels.length) return true;
      book.label(field.label);
      for (const l of labels) book.paragraph(`[x] ${l}`, 10.5, 10);
      return true;
    }
    case "priority-list": {
      if (!Array.isArray(value)) return false;
      const items = value as { done?: boolean; text?: string }[];
      const lines = items.filter((i) => (i?.text ?? "").trim());
      if (!lines.length) return true;
      book.label(field.label);
      for (const i of lines) book.paragraph(`${i.done ? "[x]" : "[ ]"} ${i.text}`, 10.5, 10);
      return true;
    }
    case "calendar-grid":
    case "calendar-notes":
    case "month-note-picker": {
      if (!obj) return false;
      const { head, rows } = numericKeyRows(obj, ["Day", "Notes & appointments"]);
      if (!rows.length) return true;
      book.label(field.label);
      book.table(head, rows);
      return true;
    }
    case "hourly-timeline": {
      if (!obj) return false;
      const { head, rows } = numericKeyRows(obj, ["Hour", "Plan"]);
      if (!rows.length) return true;
      book.label(field.label);
      book.table(head, rows);
      return true;
    }
    case "time-schedule": {
      const rows = Array.isArray(value)
        ? (value as { time?: string; text?: string }[])
            .filter((r) => (r?.text ?? "").trim() || (r?.time ?? "").trim())
            .map((r) => [r.time ?? "", r.text ?? ""])
        : obj
          ? numericKeyRows(obj, ["Time", "Plan"]).rows
          : [];
      if (!rows.length) return true;
      book.label(field.label);
      book.table(["Time", "Plan"], rows);
      return true;
    }
    case "med-list": {
      if (!obj) return false;
      const { head, rows } = medListRows(obj);
      if (!rows.length) return true;
      book.label(field.label);
      book.table(head, rows);
      return true;
    }
    case "habit-grid": {
      if (!obj) return false;
      const habits = (obj.habits as string[]) ?? [];
      const marks = (obj.marks as Record<string, unknown>) ?? {};
      const rows = habits
        .map((h, i) => [h || `Habit ${i + 1}`, markedDays(marks, i)])
        .filter(([h, days]) => h.trim() || days);
      if (!rows.length) return true;
      book.label(field.label);
      book.table(["Habit", "Days marked"], rows);
      return true;
    }
    case "month-tracker": {
      if (!obj) return false;
      const items = (obj.items as string[]) ?? [];
      const marks = (obj.marks as Record<string, unknown>) ?? {};
      const rows = items
        .map((h, i) => [h || `Item ${i + 1}`, monthNames(markedDays(marks, i))])
        .filter(([h, m]) => h.trim() || m);
      if (!rows.length) return true;
      book.label(field.label);
      book.table(["Item", "Months marked"], rows);
      return true;
    }
    case "yearly-habit-grid": {
      if (!obj) return false;
      const habitRows = (obj.rows as { mode?: string; label?: string }[]) ?? [];
      const marks = (obj.marks as Record<string, unknown>) ?? {};
      const rows = habitRows
        .map((r, i) => [
          r?.label || `Habit ${i + 1}`,
          r?.mode === "break" ? "Break" : r?.mode === "begin" ? "Begin" : "",
          monthNames(markedDays(marks, i)),
        ])
        .filter(([label, , m]) => label.trim() || m);
      if (!rows.length) return true;
      book.label(field.label);
      book.table(["Habit", "Goal", "Months marked"], rows);
      return true;
    }
    case "water-grid": {
      if (!obj) return false;
      const marks = (obj.marks as Record<string, unknown>) ?? {};
      const perDay = new Map<number, number>();
      for (const [k, v] of Object.entries(marks)) {
        if (!v) continue;
        const day = Number(k.split("-")[1]);
        if (!Number.isFinite(day)) continue;
        perDay.set(day, (perDay.get(day) ?? 0) + 1);
      }
      const rows = [...perDay.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([day, count]) => [String(day), String(count)]);
      if (!rows.length) return true;
      book.label(field.label);
      book.table(["Day", "Glasses"], rows);
      return true;
    }
    case "daily-month-grid": {
      if (!obj) return false;
      const cells = (obj.cells as Record<string, unknown>) ?? {};
      const achieved = (obj.achieved as Record<string, unknown>) ?? {};
      const notes = (obj.notes as Record<string, unknown>) ?? {};
      const days = new Set<string>([...Object.keys(cells), ...Object.keys(achieved), ...Object.keys(notes)]);
      const rows = [...days]
        .sort((a, b) => (Number(a.split("-")[0]) || 0) - (Number(b.split("-")[0]) || 0))
        .map((d) => [
          d.split("-")[0],
          scalarText(cells[d] ?? ""),
          achieved[d] ? "Yes" : "",
          scalarText(notes[d] ?? ""),
        ])
        .filter((r) => r[1] || r[2] || r[3]);
      if (!rows.length) return true;
      book.label(field.label);
      book.table([obj.rowLabel ? scalarText(obj.rowLabel) : "Day", "Reading", "Goal met", "Notes"], rows);
      return true;
    }
    case "mood-log":
    case "smart-goal": {
      if (!obj) return false;
      const rows = genericObjectRows(obj);
      if (!rows.length) return true;
      book.label(field.label);
      book.table(field.type === "mood-log" ? ["Time of day", "Mood"] : ["SMART", "Detail"], rows);
      return true;
    }
    default:
      return false;
  }
}

async function renderField(
  book: Book,
  field: FieldDef,
  value: FieldValue,
  counters: { missingPhotos: number },
) {
  if (isEmptyValue(value)) return;

  if (field.type === "drawing" && typeof value === "string") {
    book.label(field.label);
    const img = await getImage(value, 1400, true);
    if (img) await book.image(img, CONTENT_W, 320);
    else book.paragraph("(sketch could not be included)", 9.5);
    return;
  }

  if (field.type === "image" && typeof value === "string") {
    book.label(field.label);
    const url = value.startsWith("data:") || value.startsWith("http") ? value : await journalPhotoUrl(value);
    const img = url ? await getImage(url, 1600) : null;
    if (img) await book.image(img, CONTENT_W, 420);
    else {
      counters.missingPhotos += 1;
      book.paragraph("(photo unavailable — sign in on this device to include cloud photos)", 9.5);
    }
    return;
  }

  if (Array.isArray(value)) {
    book.label(field.label);
    for (const item of value.filter((x) => !isEmptyValue(x))) {
      book.paragraph(`• ${scalarText(item)}`, 10.5, 10);
    }
    return;
  }

  if (value !== null && typeof value === "object") {
    const data = value as Record<string, unknown>;
    if (field.type === "measurement-grid" && (field.columns?.length ?? 0) > 0) {
      const { head, rows } = measurementGridRows(field, data);
      if (!rows.length) return;
      book.label(field.label);
      book.table(head, rows);
      return;
    }
    if (typeof data.body === "string" || typeof data.style === "string") {
      book.label(field.label);
      book.paragraph(stripHtml(String(data.body ?? "")));
      return;
    }
    const rows = genericObjectRows(data);
    if (!rows.length) return;
    book.label(field.label);
    book.table(["Item", "Entry"], rows);
    return;
  }

  const text = scalarText(value);
  if (!text) return;
  if (text.length <= 70 && !text.includes("\n")) {
    book.ensure(18);
    book.doc.setFontSize(10.5);
    book.doc.setFont("helvetica", "bold");
    book.doc.setTextColor(95, 95, 115);
    book.doc.text(`${field.label}: `, M, book.y + 10);
    const w = book.doc.getTextWidth(`${field.label}: `);
    book.doc.setFont("helvetica", "normal");
    book.doc.setTextColor(0, 0, 0);
    book.doc.text(book.doc.splitTextToSize(text, CONTENT_W - w)[0] as string, M + w, book.y + 10);
    book.y += 18;
    return;
  }
  book.label(field.label);
  book.paragraph(text);
}

async function renderSection(
  book: Book,
  section: SectionDef,
  values: Record<string, FieldValue>,
  counters: { missingPhotos: number },
) {
  const fields = [...section.fields, ...(section.groups ?? []).flatMap((g) => g.fields)];
  if (fields.every((f) => isEmptyValue(values[f.key]))) return;

  if (section.title) book.subheading(section.title);
  if (section.description) {
    book.doc.setTextColor(120, 120, 135);
    book.paragraph(section.description, 9);
    book.doc.setTextColor(0, 0, 0);
  }
  for (const f of fields) {
    await renderField(book, f, values[f.key] ?? null, counters);
  }
  book.y += 4;
}

/** Stickers drawn onto the entry's first page, at their saved positions. */
async function renderStickers(book: Book, stickers: Sticker[], page: number, topY: number) {
  if (!stickers.length) return;
  const current = book.doc.getCurrentPageInfo().pageNumber;
  book.doc.setPage(page);
  const boxH = BOTTOM - topY;
  for (const s of sortStickers(stickers)) {
    const img = s.kind === "emoji" ? await emojiImage(s.src) : await getImage(s.src, 320, true);
    if (!img) continue;
    const size = Math.max(14, Math.min(120, s.size * 0.7));
    const x = M + (Math.min(100, Math.max(0, s.x)) / 100) * CONTENT_W - size / 2;
    const y = topY + (Math.min(100, Math.max(0, s.y)) / 100) * boxH - size / 2;
    const h = size * (img.h / img.w || 1);
    try {
      book.doc.addImage(img.dataUrl, img.format, x, y, size, h);
    } catch {
      /* a single sticker never breaks the export */
    }
  }
  book.doc.setPage(current);
}

/* -------------------------------------------------------------------------- */
/* Export                                                                      */
/* -------------------------------------------------------------------------- */

function isEntryFilled(entry: PlannerEntry): boolean {
  const values = entry.values ?? {};
  const hasField = Object.entries(values).some(([k, v]) => k !== META_KEY && !isEmptyValue(v));
  const stickers = getMeta(entry).stickers ?? [];
  return hasField || stickers.length > 0;
}

export async function exportPlannerPdf(onProgress?: PdfProgress): Promise<PlannerPdfResult> {
  const [settings, all] = await Promise.all([loadSettings(), getAllEntries()]);
  const byId = new Map(PAGE_TYPES.map((p, i) => [p.id, i]));

  const entries = all
    .filter(isEntryFilled)
    .sort((a, b) => {
      const ai = byId.get(a.pageType) ?? 999;
      const bi = byId.get(b.pageType) ?? 999;
      if (ai !== bi) return ai - bi;
      return a.createdAt - b.createdAt;
    });

  const total = entries.length + 2;
  const counters = { missingPhotos: 0 };
  const book = new Book();
  const doc = book.doc;
  const cover = getCover(settings.coverId);

  onProgress?.(0, total, "Preparing your cover");

  /* ---- Cover ---- */
  const coverImg = await getImage(cover.image, 1600);
  if (coverImg) {
    const ratio = Math.max(PW / coverImg.w, PH / coverImg.h);
    const w = coverImg.w * ratio;
    const h = coverImg.h * ratio;
    doc.addImage(coverImg.dataUrl, coverImg.format, (PW - w) / 2, (PH - h) / 2, w, h);
  }
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(M, PH / 2 - 70, CONTENT_W, 140, 10, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(35, 35, 55);
  const name = settings.plannerName || "My Planner";
  doc.text(doc.splitTextToSize(name, CONTENT_W - 40) as string[], PW / 2, PH / 2 - 20, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(90, 90, 110);
  if (settings.ownerName) doc.text(settings.ownerName, PW / 2, PH / 2 + 22, { align: "center" });
  doc.setFontSize(10);
  doc.text(
    `Complete planner export · ${new Date().toLocaleDateString()} · ${entries.length} pages`,
    PW / 2,
    PH / 2 + 52,
    { align: "center" },
  );
  doc.setTextColor(0, 0, 0);

  /* ---- Contents placeholders ---- */
  const contentsPages = Math.max(1, Math.ceil(entries.length / ROWS_PER_CONTENTS_PAGE));
  const firstContentsPage = 2;
  for (let i = 0; i < contentsPages; i++) doc.addPage();

  onProgress?.(1, total, "Laying out your pages");

  /* ---- Pages ---- */
  const contents: { label: string; sub: string; page: number }[] = [];
  const extras: PlannerEntry[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const pt = PAGE_TYPES.find((p) => p.id === entry.pageType);
    if (!pt) {
      extras.push(entry);
      continue;
    }

    book.newPage();
    const pageNumber = doc.getCurrentPageInfo().pageNumber;
    const title = entryTitle(pt, entry);
    onProgress?.(i + 2, total, `Preparing ${pt.name} (${i + 1} of ${entries.length})`);

    const icon = getCoverPageIcon(settings.coverId, pt.id);
    if (icon) {
      const iconImg = await getImage(icon, 360);
      if (iconImg) {
        const size = 62;
        doc.addImage(iconImg.dataUrl, iconImg.format, PW - M - size, book.y, size, size);
      }
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(35, 35, 55);
    doc.text(doc.splitTextToSize(pt.name, CONTENT_W - 80)[0] as string, M, book.y + 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(110, 110, 130);
    doc.text(doc.splitTextToSize(title, CONTENT_W - 80)[0] as string, M, book.y + 36);
    doc.setFontSize(9);
    doc.text(`Last updated ${new Date(entry.updatedAt).toLocaleString()}`, M, book.y + 50);
    doc.setTextColor(0, 0, 0);
    book.y += 74;
    const stickerTop = book.y;

    const values = (entry.values ?? {}) as Record<string, FieldValue>;
    for (const section of pt.sections) {
      await renderSection(book, section, values, counters);
    }

    // Anything saved on this page that no current field claims.
    const known = new Set(collectFields(pt).map((f) => f.key));
    const leftovers = Object.entries(values).filter(
      ([k, v]) => k !== META_KEY && !known.has(k) && !isEmptyValue(v),
    );
    if (leftovers.length) {
      book.subheading("Other saved details");
      book.table(["Item", "Entry"], leftovers.map(([k, v]) => [prettyKey(k), scalarText(v)]));
    }

    await renderStickers(book, getMeta(entry).stickers ?? [], pageNumber, stickerTop);
    contents.push({ label: pt.name, sub: title, page: pageNumber });
  }

  /* ---- Appendix: entries with no page template ---- */
  if (extras.length) {
    book.newPage();
    const page = doc.getCurrentPageInfo().pageNumber;
    book.heading("Other saved pages");
    for (const entry of extras) {
      book.subheading(`${prettyKey(entry.pageType)} · ${new Date(entry.createdAt).toLocaleDateString()}`);
      const rows = Object.entries(entry.values ?? {})
        .filter(([k, v]) => k !== META_KEY && !isEmptyValue(v))
        .map(([k, v]) => [prettyKey(k), scalarText(v)]);
      book.table(["Item", "Entry"], rows);
    }
    contents.push({ label: "Other saved pages", sub: `${extras.length} pages`, page });
  }

  /* ---- Fill contents ---- */
  for (let p = 0; p < contentsPages; p++) {
    doc.setPage(firstContentsPage + p);
    let y = M;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(35, 35, 55);
    doc.text(p === 0 ? "Contents" : "Contents (continued)", M, y + 17);
    y += 34;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const slice = contents.slice(p * ROWS_PER_CONTENTS_PAGE, (p + 1) * ROWS_PER_CONTENTS_PAGE);
    for (const row of slice) {
      doc.setFont("helvetica", "bold");
      doc.text(fitText(doc, row.label, 195), M, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(110, 110, 130);
      doc.text(fitText(doc, row.sub, 250), M + 210, y);
      doc.setTextColor(0, 0, 0);
      doc.text(String(row.page), PW - M, y, { align: "right" });
      doc.setDrawColor(230, 230, 238);
      doc.line(M, y + 5, PW - M, y + 5);
      y += 21;
    }
    if (!slice.length) {
      doc.setTextColor(120, 120, 135);
      doc.text("No pages filled in yet.", M, y);
      doc.setTextColor(0, 0, 0);
    }
  }

  /* ---- Footers ---- */
  const pageCount = doc.getNumberOfPages();
  for (let p = 2; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 165);
    doc.text(name, M, PH - 22);
    doc.text(`${p} / ${pageCount}`, PW - M, PH - 22, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const slug = (settings.plannerName || "my-planner").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`${slug || "my-planner"}-${stamp}.pdf`);

  onProgress?.(total, total, "Done");
  return { entries: entries.length, pages: pageCount, missingPhotos: counters.missingPhotos };
}
