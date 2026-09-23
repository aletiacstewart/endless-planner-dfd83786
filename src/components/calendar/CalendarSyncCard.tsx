import { useEffect, useState } from "react";
import { CalendarPlus, Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getAllEntries } from "@/lib/db";
import { collectPlannerEvents, downloadIcs } from "@/lib/calendarExport";
import { GoogleCalendarSyncSection } from "@/components/calendar/GoogleCalendarSync";

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-feed`;

/** Lets people subscribe their phone calendar to the planner, or download a one-off file. */
export function CalendarSyncCard() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!user) {
      setToken(null);
      return;
    }
    supabase
      .from("calendar_feed_tokens")
      .select("token")
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setToken(data?.token ?? null);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const link = token ? `${FUNCTIONS_BASE}?token=${token}` : null;
  const webcal = link ? link.replace(/^https?:/, "webcal:") : null;

  const createLink = async () => {
    if (!user) return;
    setBusy(true);
    const fresh = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase
      .from("calendar_feed_tokens")
      .upsert({ user_id: user.id, token: fresh }, { onConflict: "user_id" });
    setBusy(false);
    if (error) {
      toast.error("Could not create your calendar link. Please try again.");
      return;
    }
    setToken(fresh);
    toast.success(token ? "New calendar link created" : "Calendar link ready");
  };

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success("Link copied");
  };

  const download = async () => {
    setDownloading(true);
    try {
      const events = collectPlannerEvents(await getAllEntries());
      if (!events.length) {
        toast.info("No dated notes or appointments to export yet.");
        return;
      }
      downloadIcs(events);
      toast.success(`${events.length} date${events.length === 1 ? "" : "s"} exported`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="planner-card space-y-4">
      <div className="flex items-center gap-2">
        <CalendarPlus className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-display text-xl">Calendar sync</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Show your planner's dated notes, appointments and important dates in Apple Calendar,
        Google Calendar or Outlook.
      </p>

      <div className="space-y-2">
        <Button onClick={download} variant="outline" className="w-full" disabled={downloading}>
          {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Download calendar file (.ics)
        </Button>
        <p className="text-[11px] text-muted-foreground">
          A one-time file — open it on your phone or import it into any calendar app.
        </p>
      </div>

      {user ? (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-sm font-medium">Live calendar link</p>
          <p className="text-[11px] text-muted-foreground">
            Subscribe once and your calendar keeps itself up to date (usually within a few hours).
            Keep this link private — anyone with it can see these dates.
          </p>
          {link ? (
            <>
              <div className="text-[11px] break-all bg-muted rounded-lg p-2 font-mono">{link}</div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={copy} variant="outline" className="flex-1 min-w-[10rem]">
                  <Copy className="w-4 h-4 mr-2" /> Copy link
                </Button>
                {webcal ? (
                  <Button asChild variant="outline" className="flex-1 min-w-[10rem]">
                    <a href={webcal}>Add to Apple Calendar</a>
                  </Button>
                ) : null}
                <Button asChild variant="outline" className="flex-1 min-w-[10rem]">
                  <a
                    href={`https://calendar.google.com/calendar/r/settings/addbyurl?cid=${encodeURIComponent(link)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Add to Google Calendar
                  </a>
                </Button>
              </div>
              <Button onClick={createLink} variant="ghost" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create a new link (stops the old one)
              </Button>
            </>
          ) : (
            <Button onClick={createLink} className="w-full" disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create my calendar link
            </Button>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Sign in with cloud sync to get a live calendar link that updates on its own.
        </p>
      )}

      <GoogleCalendarSyncSection />
    </section>
  );
}
