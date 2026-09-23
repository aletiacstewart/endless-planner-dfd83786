import { useRef, useState } from "react";
import { Camera, Loader2, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addDoctor, listDoctors } from "@/lib/doctors";
import type { FieldValue } from "@/lib/pageTypes";

export type ScanMode = "prescription" | "medical";

interface ScannedMed {
  name: string;
  strength: string;
  reason: string;
  doctor: string;
  directions: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
}

interface ScannedVisit {
  visit_date: string;
  doctor_name: string;
  clinic: string;
  reason: string;
  blood_pressure: string;
  heart_rate: string;
  weight: string;
  temperature: string;
  diagnoses: string;
  test_results: string;
  lab_notes: string;
  next_appointment: string;
}

const EMPTY_VISIT: ScannedVisit = {
  visit_date: "",
  doctor_name: "",
  clinic: "",
  reason: "",
  blood_pressure: "",
  heart_rate: "",
  weight: "",
  temperature: "",
  diagnoses: "",
  test_results: "",
  lab_notes: "",
  next_appointment: "",
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const MAX_BYTES = 12 * 1024 * 1024;

/** Read a file, shrinking photos so the scan uploads quickly. PDFs pass through. */
async function toDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
  if (!file.type.startsWith("image/")) return raw;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("bad image"));
      el.src = raw;
    });
    const max = 1600;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return raw;
  }
}

interface Props {
  mode: ScanMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: Record<string, FieldValue>;
  onChange: (key: string, value: FieldValue) => void;
}

export function MedicalScannerDialog({ mode, open, onOpenChange, values, onChange }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [meds, setMeds] = useState<ScannedMed[] | null>(null);
  const [visit, setVisit] = useState<ScannedVisit | null>(null);

  const reset = () => {
    setPreview(null);
    setMeds(null);
    setVisit(null);
    setBusy(false);
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const scan = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("That file is too large — 12 MB or smaller please.");
      return;
    }
    setBusy(true);
    setMeds(null);
    setVisit(null);
    try {
      const dataUrl = await toDataUrl(file);
      setPreview(file.type.startsWith("image/") ? dataUrl : null);
      const { data, error } = await supabase.functions.invoke("scan-medical-document", {
        body: { mode, fileDataUrl: dataUrl, mimeType: file.type, filename: file.name },
      });
      if (error) throw new Error(error.message);
      const payload = data as { ok?: boolean; error?: string; data?: Record<string, unknown> };
      if (!payload?.ok || !payload.data) throw new Error(payload?.error || "The scan didn't work.");

      if (mode === "prescription") {
        const rows = Array.isArray(payload.data.medications) ? payload.data.medications : [];
        const parsed: ScannedMed[] = rows
          .map((r) => {
            const m = r as Record<string, unknown>;
            return {
              name: str(m.name),
              strength: str(m.strength),
              reason: str(m.reason),
              doctor: str(m.doctor),
              directions: str(m.directions),
              morning: m.morning === true,
              afternoon: m.afternoon === true,
              night: m.night === true,
            };
          })
          .filter((m) => m.name || m.strength || m.directions);
        if (parsed.length === 0) {
          toast.error("No medication details could be read. Try a closer, well-lit photo of the label.");
          return;
        }
        setMeds(parsed);
      } else {
        const d = payload.data;
        setVisit({
          visit_date: str(d.visit_date),
          doctor_name: str(d.doctor_name),
          clinic: str(d.clinic),
          reason: str(d.reason),
          blood_pressure: str(d.blood_pressure),
          heart_rate: str(d.heart_rate),
          weight: str(d.weight),
          temperature: str(d.temperature),
          diagnoses: str(d.diagnoses),
          test_results: str(d.test_results),
          lab_notes: str(d.lab_notes),
          next_appointment: str(d.next_appointment),
        });
      }
      toast.success("Scan complete — check the details below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The scan didn't work. Please try again.");
    } finally {
      setBusy(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /** Look up a doctor by name, creating them when they're new. */
  const resolveDoctorId = async (name: string): Promise<string> => {
    const clean = name.replace(/^\s*(dr\.?|doctor)\s+/i, "").trim();
    if (!clean) return "";
    const list = await listDoctors();
    const hit = list.find((d) => d.name.toLowerCase() === clean.toLowerCase());
    if (hit) return hit.id;
    const created = await addDoctor({ name: clean });
    return created.id;
  };

  const applyMeds = async () => {
    if (!meds) return;
    setBusy(true);
    try {
      const list: Record<string, string> = { ...((values.med_list as Record<string, string>) ?? {}) };
      const baseRows = 20;
      let visible = Math.max(baseRows, Number(list.__rows ?? "") || 0);
      let next = 1;
      for (const med of meds) {
        while (next <= visible && (list[`${next}_name`] ?? "").trim()) next += 1;
        if (next > visible) visible = next;
        list[`${next}_name`] = med.name;
        list[`${next}_strength`] = med.strength;
        list[`${next}_reason`] = med.reason || med.directions;
        if (med.doctor) {
          list[`${next}_doctor`] = med.doctor;
          const id = await resolveDoctorId(med.doctor);
          if (id) list[`${next}_doctor_id`] = id;
        }
        list[`${next}_m`] = med.morning ? "1" : "";
        list[`${next}_a`] = med.afternoon ? "1" : "";
        list[`${next}_n`] = med.night ? "1" : "";
        next += 1;
      }
      list.__rows = String(Math.max(visible, baseRows));
      onChange("med_list", list as unknown as FieldValue);
      toast.success(`${meds.length} medication${meds.length === 1 ? "" : "s"} added to your list.`);
      close(false);
    } catch {
      toast.error("Couldn't add those medications. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const applyVisit = async () => {
    if (!visit) return;
    setBusy(true);
    try {
      let doctorId = (values.doctor_id as string) || "";
      if (visit.doctor_name) {
        const id = await resolveDoctorId(visit.doctor_name);
        if (id) {
          doctorId = id;
          onChange("doctor_id", id);
        }
      }
      const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(visit.visit_date) ? visit.visit_date : "";
      if (isoDate) onChange("date", isoDate);

      const scoped = (key: string) => (doctorId ? `${key}__${doctorId}` : key);
      const append = (key: string, text: string) => {
        if (!text.trim()) return;
        const k = scoped(key);
        const current = ((values[k] as string) ?? "").trim();
        onChange(k, current ? `${current}\n\n${text.trim()}` : text.trim());
      };

      const summary = [
        visit.visit_date && `Visit date: ${visit.visit_date}`,
        visit.doctor_name && `Doctor: ${visit.doctor_name}`,
        visit.clinic && `Clinic: ${visit.clinic}`,
        visit.reason && `Reason: ${visit.reason}`,
        visit.blood_pressure && `Blood pressure: ${visit.blood_pressure}`,
        visit.heart_rate && `Heart rate: ${visit.heart_rate}`,
        visit.weight && `Weight: ${visit.weight}`,
        visit.temperature && `Temperature: ${visit.temperature}`,
        visit.diagnoses && `Diagnosis: ${visit.diagnoses}`,
        visit.next_appointment && `Next appointment: ${visit.next_appointment}`,
      ]
        .filter(Boolean)
        .join("\n");

      append("medical_appointment_notes", summary);
      append("test_results", visit.test_results);
      append("lab_result_notes", visit.lab_notes);
      toast.success("Details added to this medical record.");
      close(false);
    } catch {
      toast.error("Couldn't save those details. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "prescription" ? "Scan a prescription" : "Scan medical papers";
  const hasReview = mode === "prescription" ? !!meds : !!visit;

  const visitField = (label: string, key: keyof ScannedVisit, long = false) => (
    <label className="block text-xs font-medium uppercase text-muted-foreground">
      {label}
      {long ? (
        <Textarea
          rows={3}
          value={visit?.[key] ?? ""}
          onChange={(e) => setVisit((v) => (v ? { ...v, [key]: e.target.value } : v))}
          className="mt-1 normal-case"
        />
      ) : (
        <Input
          value={visit?.[key] ?? ""}
          onChange={(e) => setVisit((v) => (v ? { ...v, [key]: e.target.value } : v))}
          className="mt-1 normal-case"
        />
      )}
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "prescription"
              ? "Take a photo of the bottle label or pharmacy printout and the details are filled in for you."
              : "Take a photo or upload a scan of your visit summary, lab report or appointment slip."}
          </DialogDescription>
        </DialogHeader>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => void scan(e.target.files?.[0])}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={(e) => void scan(e.target.files?.[0])}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => cameraRef.current?.click()} disabled={busy} className="touch-manipulation">
            <Camera className="mr-2 h-4 w-4" /> Take a photo
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="touch-manipulation"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload photo or PDF
          </Button>
        </div>

        {preview && (
          <img src={preview} alt="Scanned document" className="max-h-56 w-full rounded-md object-contain ring-1 ring-border" />
        )}

        {busy && !hasReview && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading your document…
          </p>
        )}

        {meds && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Check these details, fix anything that looks wrong, then add them.</p>
            {meds.map((med, i) => (
              <section key={i} className="space-y-2 rounded-md border border-border bg-card/40 p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["name", "strength", "reason", "doctor"] as const).map((key) => (
                    <label key={key} className="block text-xs font-medium uppercase text-muted-foreground">
                      {key === "strength" ? "Strength / dose" : key}
                      <Input
                        value={med[key]}
                        onChange={(e) =>
                          setMeds((list) =>
                            list ? list.map((m, j) => (j === i ? { ...m, [key]: e.target.value } : m)) : list,
                          )
                        }
                        className="mt-1 normal-case"
                      />
                    </label>
                  ))}
                </div>
                {med.directions && <p className="text-xs text-muted-foreground">Label says: {med.directions}</p>}
                <div className="flex flex-wrap gap-4">
                  {(["morning", "afternoon", "night"] as const).map((slot) => (
                    <label key={slot} className="flex items-center gap-2 text-sm capitalize">
                      <Checkbox
                        checked={med[slot]}
                        onCheckedChange={(c) =>
                          setMeds((list) =>
                            list ? list.map((m, j) => (j === i ? { ...m, [slot]: c === true } : m)) : list,
                          )
                        }
                      />
                      {slot}
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {visit && (
          <div className="grid gap-3 sm:grid-cols-2">
            {visitField("Visit date (yyyy-mm-dd)", "visit_date")}
            {visitField("Doctor", "doctor_name")}
            {visitField("Clinic / hospital", "clinic")}
            {visitField("Reason for visit", "reason")}
            {visitField("Blood pressure", "blood_pressure")}
            {visitField("Heart rate", "heart_rate")}
            {visitField("Weight", "weight")}
            {visitField("Temperature", "temperature")}
            {visitField("Next appointment", "next_appointment")}
            <div className="sm:col-span-2 grid gap-3">
              {visitField("Diagnosis", "diagnoses", true)}
              {visitField("Test results", "test_results", true)}
              {visitField("Lab notes", "lab_notes", true)}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => close(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void (mode === "prescription" ? applyMeds() : applyVisit())}
            disabled={busy || !hasReview}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Add to planner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
