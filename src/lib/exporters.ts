/**
 * Multi-format exporters for the user's planner data.
 *
 * Every exporter pulls from IndexedDB via getAllEntries() so the output covers
 * the full history (first entry → today). All exporters run client-side and
 * trigger a browser download — no server, no cloud, no account needed.
 */

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAllEntries, type PlannerEntry } from "./db";
import { PAGE_TYPES } from "./pageTypes";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function pageTypeName(id: string) {
  return PAGE_TYPES.find((p) => p.id === id)?.name ?? id;
}

/**
 * Flatten any FieldValue into a printable cell string.
 * Nested objects/arrays become compact JSON so the data round-trips and is
 * still readable in Excel/CSV.
 */
function flatten(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function escapeCsv(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/* -------------------------------------------------------------------------- */
/* JSON                                                                        */
/* -------------------------------------------------------------------------- */

export async function downloadJson(): Promise<number> {
  const entries = await getAllEntries();
  const json = JSON.stringify({ version: 1, exportedAt: Date.now(), entries }, null, 2);
  downloadBlob(new Blob([json], { type: "application/json" }), `planner-backup-${todayStamp()}.json`);
  return entries.length;
}

/* -------------------------------------------------------------------------- */
/* CSV (long format — one row per field, opens in any spreadsheet)            */
/* -------------------------------------------------------------------------- */

export async function downloadCsv(): Promise<number> {
  const entries = await getAllEntries();
  const headers = ["entryId", "pageType", "pageName", "createdAt", "updatedAt", "fieldKey", "fieldValue"];
  const lines = [headers.map(escapeCsv).join(",")];

  for (const e of entries) {
    const created = new Date(e.createdAt).toISOString();
    const updated = new Date(e.updatedAt).toISOString();
    const name = pageTypeName(e.pageType);
    const keys = Object.keys(e.values ?? {});
    if (keys.length === 0) {
      lines.push([e.id, e.pageType, name, created, updated, "", ""].map(escapeCsv).join(","));
      continue;
    }
    for (const k of keys) {
      lines.push(
        [e.id, e.pageType, name, created, updated, k, flatten(e.values[k])]
          .map(escapeCsv)
          .join(",")
      );
    }
  }

  downloadBlob(
    new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }),
    `planner-backup-${todayStamp()}.csv`
  );
  return entries.length;
}

/* -------------------------------------------------------------------------- */
/* XLSX (one sheet per page type, columns = field keys)                       */
/* -------------------------------------------------------------------------- */

export async function downloadXlsx(): Promise<number> {
  const entries = await getAllEntries();
  const wb = XLSX.utils.book_new();

  // Group by pageType
  const grouped: Record<string, PlannerEntry[]> = {};
  for (const e of entries) {
    (grouped[e.pageType] ||= []).push(e);
  }

  if (Object.keys(grouped).length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([["No entries yet"]]);
    XLSX.utils.book_append_sheet(wb, ws, "Empty");
  } else {
    for (const [pageType, list] of Object.entries(grouped)) {
      // Collect every field key seen on this page type for stable columns
      const keys = Array.from(
        new Set(list.flatMap((e) => Object.keys(e.values ?? {})))
      ).sort();
      const headers = ["createdAt", "updatedAt", ...keys];
      const rows = list.map((e) => [
        new Date(e.createdAt).toISOString(),
        new Date(e.updatedAt).toISOString(),
        ...keys.map((k) => flatten(e.values?.[k])),
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      // Sheet names limited to 31 chars in Excel
      const safeName = pageTypeName(pageType).slice(0, 31).replace(/[\\/:*?[\]]/g, "-");
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    }
  }

  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  downloadBlob(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `planner-backup-${todayStamp()}.xlsx`
  );
  return entries.length;
}

/* -------------------------------------------------------------------------- */
/* PDF (one section per page type, table of summaries)                        */
/* -------------------------------------------------------------------------- */

export async function downloadPdf(plannerName?: string): Promise<number> {
  const entries = await getAllEntries();
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Header
  doc.setFontSize(18);
  doc.text(plannerName ?? "Planner backup", 40, 50);
  doc.setFontSize(10);
  doc.setTextColor(120);
  const range = entries.length
    ? `${new Date(Math.min(...entries.map((e) => e.createdAt))).toLocaleDateString()} – ${new Date().toLocaleDateString()}`
    : "No entries yet";
  doc.text(`Backup exported ${new Date().toLocaleString()}`, 40, 68);
  doc.text(`Date range: ${range}`, 40, 82);
  doc.text(`Total entries: ${entries.length}`, 40, 96);
  doc.setTextColor(0);

  if (!entries.length) {
    doc.save(`planner-backup-${todayStamp()}.pdf`);
    return 0;
  }

  // Group by page type
  const grouped: Record<string, PlannerEntry[]> = {};
  for (const e of entries) (grouped[e.pageType] ||= []).push(e);

  let cursorY = 120;
  for (const [pageType, list] of Object.entries(grouped)) {
    const pt = PAGE_TYPES.find((p) => p.id === pageType);
    const name = pt?.name ?? pageType;

    if (cursorY > 720) {
      doc.addPage();
      cursorY = 50;
    }

    doc.setFontSize(13);
    doc.text(name, 40, cursorY);
    cursorY += 8;

    const rows = list
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((e) => [
        new Date(e.createdAt).toLocaleDateString(),
        new Date(e.updatedAt).toLocaleDateString(),
        pt?.summary?.(e.values) ?? "",
        // Compact field dump (truncated)
        Object.entries(e.values ?? {})
          .map(([k, v]) => `${k}: ${flatten(v).slice(0, 80)}`)
          .join(" · ")
          .slice(0, 240),
      ]);

    autoTable(doc, {
      startY: cursorY + 4,
      head: [["Created", "Updated", "Summary", "Fields"]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [60, 60, 80] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
        2: { cellWidth: 120 },
        3: { cellWidth: "auto" },
      },
      margin: { left: 40, right: 40 },
    });

    // jsPDF-autotable sets lastAutoTable.finalY
    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } })
      .lastAutoTable?.finalY;
    cursorY = (finalY ?? cursorY) + 24;
  }

  doc.save(`planner-backup-${todayStamp()}.pdf`);
  return entries.length;
}
