import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BUCKET = "journal-photos";
const MAX_BYTES = 10 * 1024 * 1024;

interface Props {
  value?: string | null;
  label: string;
  onChange: (path: string | null) => void;
}

export async function removeJournalPhoto(path: string | null | undefined) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export function JournalPhotoField({ value, label, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!value) {
      setPreviewUrl(null);
      return () => { active = false; };
    }
    supabase.storage.from(BUCKET).createSignedUrl(value, 3600).then(({ data, error }) => {
      if (!active) return;
      setPreviewUrl(error ? null : data.signedUrl);
    });
    return () => { active = false; };
  }, [value]);

  const chooseFile = () => inputRef.current?.click();

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Photos must be 10 MB or smaller.");
      return;
    }

    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Sign in to upload a journal photo.");
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const previous = value;
      onChange(path);
      if (previous) await removeJournalPhoto(previous);
      toast.success("Photo added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await removeJournalPhoto(value);
      onChange(null);
      toast.success("Photo removed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="field-label">{label}</label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={chooseFile} disabled={busy} className="touch-manipulation">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : previewUrl ? <RefreshCw className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
            <span className="ml-2">{previewUrl ? "Replace" : "Upload photo"}</span>
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="icon" onClick={() => void remove()} disabled={busy} aria-label="Remove photo" title="Remove photo" className="touch-manipulation">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="sr-only"
        onChange={(event) => void upload(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={chooseFile}
        disabled={busy}
        className={cn(
          "flex min-h-64 w-full touch-manipulation items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-background/60",
          !previewUrl && "hover:bg-muted/50",
        )}
        aria-label={previewUrl ? "Replace journal photo" : "Upload journal photo"}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Journal memory" className="max-h-[28rem] w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <ImagePlus className="h-8 w-8" />
            Add a photo from this day
          </span>
        )}
      </button>
    </div>
  );
}