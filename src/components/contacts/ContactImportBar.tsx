import { useRef, useState } from "react";
import { Download, Loader2, Smartphone, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { FieldValue } from "@/lib/pageTypes";
import {
  downloadVcf,
  parseContactsFile,
  phonePickerAvailable,
  pickPhoneContacts,
  type SimpleContact,
} from "@/lib/contactsIo";

type Variant = "contacts" | "emergency";

const CONFIG: Record<Variant, { gridKey: string; baseRows: number; hasEmail: boolean; hasAddress: boolean }> = {
  contacts: { gridKey: "contact_rows", baseRows: 20, hasEmail: true, hasAddress: true },
  emergency: { gridKey: "ice_contacts", baseRows: 8, hasEmail: false, hasAddress: false },
};

interface Props {
  variant: Variant;
  values: Record<string, FieldValue>;
  onChange: (key: string, value: FieldValue) => void;
}

export function ContactImportBar({ variant, values, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const cfg = CONFIG[variant];
  const grid = (values[cfg.gridKey] as Record<string, string> | undefined) ?? {};

  const add = (contacts: SimpleContact[]) => {
    const usable = contacts.filter((c) => c.name || c.phone || c.email);
    if (usable.length === 0) {
      toast.error("No contacts were found in that file.");
      return;
    }
    const next: Record<string, string> = { ...grid };
    let visible = Math.max(cfg.baseRows, Number(next.__rows ?? "") || 0);
    let row = 1;
    for (const c of usable) {
      while (row <= visible && (next[`${row}-Name`] ?? "").trim()) row += 1;
      if (row > visible) visible = row;
      next[`${row}-Name`] = c.name;
      next[`${row}-Phone`] = c.phone;
      if (cfg.hasEmail) next[`${row}-Email`] = c.email;
      if (cfg.hasAddress) next[`${row}-Address`] = c.address;
      const extras = cfg.hasEmail
        ? [c.notes]
        : [c.email, c.address, c.notes];
      next[`${row}-Notes`] = extras.filter(Boolean).join(" · ");
      row += 1;
    }
    next.__rows = String(Math.max(visible, cfg.baseRows));
    onChange(cfg.gridKey, next as unknown as FieldValue);
    toast.success(`${usable.length} contact${usable.length === 1 ? "" : "s"} added.`);
  };

  const fromPhone = async () => {
    setBusy(true);
    try {
      add(await pickPhoneContacts());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read contacts from this phone.");
    } finally {
      setBusy(false);
    }
  };

  const fromFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      add(parseContactsFile(file.name, await file.text()));
    } catch {
      toast.error("That file couldn't be read. Export your contacts as .vcf or .csv and try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const exportAll = () => {
    const rows: SimpleContact[] = [];
    const visible = Math.max(cfg.baseRows, Number(grid.__rows ?? "") || 0);
    for (let r = 1; r <= visible; r += 1) {
      const contact: SimpleContact = {
        name: grid[`${r}-Name`] ?? "",
        phone: grid[`${r}-Phone`] ?? "",
        email: cfg.hasEmail ? grid[`${r}-Email`] ?? "" : "",
        address: cfg.hasAddress ? grid[`${r}-Address`] ?? "" : "",
        notes: [cfg.hasEmail ? "" : grid[`${r}-Relationship`] ?? "", grid[`${r}-Notes`] ?? ""]
          .filter(Boolean)
          .join(" · "),
      };
      if (contact.name || contact.phone || contact.email) rows.push(contact);
    }
    if (rows.length === 0) {
      toast.error("There are no contacts to save yet.");
      return;
    }
    downloadVcf(rows, variant === "emergency" ? "emergency-contacts.vcf" : "planner-contacts.vcf");
    toast.success("Contact file saved — open it to add them to your phone.");
  };

  return (
    <div className="planner-card space-y-3">
      <div>
        <h2 className="font-display text-lg">Bring in contacts from your phone</h2>
        <p className="text-sm text-muted-foreground">
          On Android you can pick contacts straight from your phone. On iPhone, share or export your contacts as a
          contact file (.vcf) and add it here. Saving sends them back to your phone.
        </p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".vcf,.csv,text/vcard,text/csv"
        className="sr-only"
        onChange={(e) => void fromFile(e.target.files?.[0])}
      />
      <div className="flex flex-wrap gap-2">
        {phonePickerAvailable() && (
          <Button type="button" onClick={() => void fromPhone()} disabled={busy} className="touch-manipulation">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2 h-4 w-4" />}
            Import from phone
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="touch-manipulation"
        >
          <Upload className="mr-2 h-4 w-4" /> Import contact file
        </Button>
        <Button type="button" variant="outline" onClick={exportAll} disabled={busy} className="touch-manipulation">
          <Download className="mr-2 h-4 w-4" /> Save to my phone
        </Button>
      </div>
    </div>
  );
}
