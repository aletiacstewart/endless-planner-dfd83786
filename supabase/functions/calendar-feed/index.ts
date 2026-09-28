// Private calendar feed: Apple Calendar, Google Calendar and Outlook subscribe to
// this URL and keep showing the planner's dated notes and appointments.
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildIcs, collectEvents, EVENT_PAGE_TYPES } from "../_shared/plannerEvents.ts";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  const url = new URL(req.url);
  const token = (url.searchParams.get("token") ?? "").trim();
  if (!token) return new Response("Missing calendar token", { status: 400 });

  const { data: row } = await admin
    .from("calendar_feed_tokens")
    .select("user_id")
    .eq("token", token)
    .maybeSingle();

  if (!row) return new Response("This calendar link is no longer active", { status: 404 });

  const { data: entries, error } = await admin
    .from("planner_entries")
    .select("id, page_type, values")
    .eq("user_id", row.user_id)
    .is("deleted_at", null)
    .in("page_type", EVENT_PAGE_TYPES);

  if (error) {
    console.error("feed query failed", error);
    return new Response("Could not build the calendar", { status: 500 });
  }

  const unique = collectEvents(entries ?? []);

  return new Response(buildIcs(unique), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
