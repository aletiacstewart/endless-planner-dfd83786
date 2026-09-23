/**
 * Contact import/export helpers.
 * Reads vCard (.vcf) files exported from iPhone/Android/Outlook and CSV exports
 * (Google Contacts, Outlook), and writes vCards back out again.
 */

export interface SimpleContact {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

function decodeVcardValue(raw: string, params: string): string {
  let v = raw;
  if (/quoted-printable/i.test(params)) {
    v = v.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  return v.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";");
}

/** Parse a vCard file into contacts. Handles 2.1/3.0/4.0 and folded lines. */
export function parseVcf(text: string): SimpleContact[] {
  const unfolded = text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
  const cards = unfolded.split(/BEGIN:VCARD/i).slice(1);
  const out: SimpleContact[] = [];

  for (const card of cards) {
    let name = "";
    let structuredName = "";
    const phones: string[] = [];
    const emails: string[] = [];
    const addresses: string[] = [];
    const notes: string[] = [];

    for (const line of card.split("\n")) {
      const idx = line.indexOf(":");
      if (idx < 0) continue;
      const left = line.slice(0, idx);
      const value = decodeVcardValue(line.slice(idx + 1).trim(), left);
      const prop = left.split(";")[0].replace(/^item\d+\./i, "").toUpperCase();
      if (!value) continue;

      if (prop === "FN") name = clean(value);
      else if (prop === "N") {
        const [family, given, middle] = value.split(";");
        structuredName = clean([given, middle, family].filter(Boolean).join(" "));
      } else if (prop === "TEL") phones.push(clean(value));
      else if (prop === "EMAIL") emails.push(clean(value));
      else if (prop === "ADR") addresses.push(clean(value.split(";").filter(Boolean).join(", ")));
      else if (prop === "NOTE") notes.push(clean(value));
      else if (prop === "ORG") notes.push(clean(value.split(";").filter(Boolean).join(" ")));
    }

    const finalName = name || structuredName;
    if (!finalName && phones.length === 0 && emails.length === 0) continue;
    out.push({
      name: finalName,
      phone: phones.join(", "),
      email: emails.join(", "),
      address: addresses.join(" / "),
      notes: notes.join(" · "),
    });
  }
  return out;
}

/** Split one CSV line, honouring quoted fields. */
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { cells.push(cur); cur = ""; }
    else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

/** Parse a Google/Outlook style contacts CSV export. */
export function parseContactsCsv(text: string): SimpleContact[] {
  const rows = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim());
  if (rows.length < 2) return [];
  const header = splitCsvLine(rows[0]).map((h) => h.toLowerCase());
  const pick = (cells: string[], matchers: RegExp[]) => {
    const values: string[] = [];
    header.forEach((h, i) => {
      if (matchers.some((m) => m.test(h)) && cells[i]) values.push(clean(cells[i]));
    });
    return Array.from(new Set(values)).join(", ");
  };

  const out: SimpleContact[] = [];
  for (const row of rows.slice(1)) {
    const cells = splitCsvLine(row);
    let name = pick(cells, [/^name$/, /display name/, /full name/]);
    if (!name) {
      const first = pick(cells, [/first name/, /given name/]);
      const last = pick(cells, [/last name/, /family name/, /surname/]);
      name = clean(`${first} ${last}`);
    }
    const contact: SimpleContact = {
      name,
      phone: pick(cells, [/phone/, /mobile/, /tel/]),
      email: pick(cells, [/e-?mail/]),
      address: pick(cells, [/address/, /street/, /city/, /postal/, /zip/]),
      notes: pick(cells, [/notes/, /organization/, /company/, /relationship/]),
    };
    if (contact.name || contact.phone || contact.email) out.push(contact);
  }
  return out;
}

export function parseContactsFile(filename: string, text: string): SimpleContact[] {
  if (/\.csv$/i.test(filename)) return parseContactsCsv(text);
  if (/\.vcf$/i.test(filename) || /BEGIN:VCARD/i.test(text)) return parseVcf(text);
  return parseContactsCsv(text);
}

const escapeVcard = (s: string) => s.replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");

/** Build a vCard file so contacts can be saved straight into a phone. */
export function toVcf(contacts: SimpleContact[]): string {
  return contacts
    .filter((c) => c.name || c.phone || c.email)
    .map((c) => {
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeVcard(c.name || "Contact")}`];
      c.phone
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => lines.push(`TEL;TYPE=CELL:${escapeVcard(p)}`));
      c.email
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
        .forEach((e) => lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(e)}`));
      if (c.address) lines.push(`ADR;TYPE=HOME:;;${escapeVcard(c.address)};;;;`);
      if (c.notes) lines.push(`NOTE:${escapeVcard(c.notes)}`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    })
    .join("\r\n");
}

export function downloadVcf(contacts: SimpleContact[], filename = "planner-contacts.vcf") {
  const blob = new Blob([toVcf(contacts)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

type ContactsManager = {
  select: (props: string[], opts?: { multiple?: boolean }) => Promise<
    { name?: string[]; tel?: string[]; email?: string[]; address?: unknown[] }[]
  >;
  getProperties: () => Promise<string[]>;
};

function contactsApi(): ContactsManager | null {
  const nav = navigator as Navigator & { contacts?: ContactsManager };
  const api = nav.contacts;
  if (api && typeof api.select === "function" && "ContactsManager" in window) return api;
  return null;
}

export function phonePickerAvailable(): boolean {
  return contactsApi() !== null;
}

/** One-tap import using the phone's own contact picker (supported on Android). */
export async function pickPhoneContacts(): Promise<SimpleContact[]> {
  const api = contactsApi();
  if (!api) throw new Error("This phone or browser can't share contacts directly — import a contacts file instead.");
  const supported = await api.getProperties();
  const wanted = ["name", "tel", "email", "address"].filter((p) => supported.includes(p));
  const picked = await api.select(wanted, { multiple: true });
  return picked.map((c) => ({
    name: clean((c.name ?? []).join(" ")),
    phone: (c.tel ?? []).map(clean).filter(Boolean).join(", "),
    email: (c.email ?? []).map(clean).filter(Boolean).join(", "),
    address: (c.address ?? [])
      .map((a) => {
        const rec = a as { addressLine?: string[]; city?: string; region?: string; postalCode?: string };
        return clean([...(rec.addressLine ?? []), rec.city, rec.region, rec.postalCode].filter(Boolean).join(", "));
      })
      .filter(Boolean)
      .join(" / "),
    notes: "",
  }));
}
