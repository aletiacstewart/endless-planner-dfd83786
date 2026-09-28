import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Opt in/out of the 7 AM morning email (today, bills due, celebrations). */
export function MorningDigestToggle() {
  const { user } = useAuth();
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("reminder_preferences")
      .select("morning_digest")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setOn(!!data?.morning_digest);
        setReady(true);
      });
  }, [user]);

  if (!user) return null;

  const change = async (next: boolean) => {
    setOn(next);
    const { error } = await supabase.from("reminder_preferences").upsert(
      {
        user_id: user.id,
        morning_digest: next,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) {
      setOn(!next);
      toast.error("Couldn't save your reminder setting. Please try again.");
      return;
    }
    toast.success(next ? "Morning reminders on — see you at 7 AM" : "Morning reminders off");
  };

  return (
    <section className="planner-card space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-display text-xl">Reminders</h2>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Morning email at 7 AM</p>
          <p className="text-xs text-muted-foreground">
            Today's appointments and notes, bills due in the next 3 days, and birthdays or
            celebrations this week. Only sent on days with something to show.
          </p>
        </div>
        <Switch checked={on} onCheckedChange={change} disabled={!ready} aria-label="Morning email reminders" />
      </div>
      <p className="text-[11px] text-muted-foreground">
        Tip: the live calendar link below also rings your phone — bills 3 days before and on the day,
        birthdays the day before and the morning of, appointments the day before and that morning.
      </p>
    </section>
  );
}
