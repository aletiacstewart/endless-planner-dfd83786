import { supabase } from "@/integrations/supabase/client";

export const STASH_CATEGORIES = ["logos", "photos", "documents", "artwork", "general"] as const;
export const STASH_MAX_BYTES = 25 * 1024 * 1024;

export async function uploadToStash(orgId: string, file: Blob, title: string, category: string) {
  const name = (file as File).name ?? `${title}.png`;
  const safe = name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${orgId}/${crypto.randomUUID()}-${safe}`;
  const { error } = await supabase.storage.from("stash").upload(path, file, { contentType: file.type || undefined });
  if (error) throw error;
  const { error: e2 } = await supabase.from("stash_assets").insert({ org_id: orgId, title, file_url: path, size_bytes: file.size, category });
  if (e2) { await supabase.storage.from("stash").remove([path]); throw e2; }
}
