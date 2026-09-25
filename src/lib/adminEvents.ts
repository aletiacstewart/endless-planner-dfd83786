import { supabase } from "@/integrations/supabase/client";

/** Fire-and-forget audit log for the owner dashboard. No-op when signed out. */
export async function logAdminEvent(kind: "backup_export" | "backup_restore" | "pdf_export", detail: Record<string, unknown> = {}) {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;
    await supabase.from("admin_events").insert({ user_id: user.id, email: user.email ?? null, kind, detail: detail as never });
  } catch { /* never block the user */ }
}
