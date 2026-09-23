import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Loader2, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-cal-sync`;

interface SyncStatus {
  connected: boolean;
  email: string | null;
  lastSyncAt: string | null;
  reconnectRequired?: boolean;
}

async function callSyncFn(method: "GET" | "POST" | "DELETE") {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(FN_URL, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data } as { ok: boolean; data: any };
}

function waitForOAuthCompletion(popup: Window) {
  return new Promise<void>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        event.data?.connectorId !== "google_calendar" ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      ) return;
      cleanup();
      if (type === "appUserConnectorOAuthComplete") {
        resolve();
        return;
      }
      popup.close();
      reject(new Error(event.data?.reason ?? "Google Calendar connection did not complete."));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("The Google window was closed before finishing."));
    }, 500);
  });
}

/** Two-way sync between the planner and each user's own Google Calendar. */
export function GoogleCalendarSyncSection() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!user) {
      setStatus(null);
      return;
    }
    const { data } = await callSyncFn("GET");
    setStatus({
      connected: !!data?.connected,
      email: data?.email ?? null,
      lastSyncAt: data?.lastSyncAt ?? null,
      reconnectRequired: !!data?.reconnectRequired,
    });
  }, [user]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      const { ok, data } = await callSyncFn("POST");
      if (!ok || data?.error) {
        toast.error(data?.error ?? "Could not sync with Google Calendar. Please try again.");
        await refreshStatus();
        return false;
      }
      if (data?.connected === false) {
        await refreshStatus();
        toast.info(data?.reconnectRequired
          ? "Your Google Calendar access needs to be renewed — tap Reconnect below."
          : "Connect Google Calendar first.");
        return false;
      }
      const bits: string[] = [];
      if (data.created) bits.push(`${data.created} new to Google`);
      if (data.updated) bits.push(`${data.updated} updated`);
      if (data.removed) bits.push(`${data.removed} removed from Google`);
      if (data.pulled) bits.push(`${data.pulled} from Google`);
      if (data.pulledRemoved) bits.push(`${data.pulledRemoved} cleared from planner`);
      toast.success(bits.length ? `Synced: ${bits.join(", ")}` : "Everything is already up to date.");
      await refreshStatus();
      return true;
    } finally {
      setSyncing(false);
    }
  }, [refreshStatus]);

  const connect = useCallback(async () => {
    setConnecting(true);
    const popup = window.open("", "lovable-oauth", "width=600,height=720");
    if (!popup) {
      setConnecting(false);
      toast.error("Allow pop-ups in your browser, then try again.");
      return;
    }
    try {
      const start = await supabase.functions.invoke("google-cal-oauth-start", {
        body: { origin: window.location.origin },
      });
      if (start.error) throw start.error;
      const completion = waitForOAuthCompletion(popup);
      popup.location.href = start.data.authorizationUrl;
      await completion;
      toast.success("Google Calendar connected");
      await runSync();
    } catch (err) {
      popup.close();
      toast.error(err instanceof Error ? err.message : "Could not connect Google Calendar.");
    } finally {
      setConnecting(false);
    }
  }, [runSync]);

  const disconnect = useCallback(async () => {
    if (!window.confirm("Disconnect Google Calendar? Dates already copied stay where they are.")) return;
    setDisconnecting(true);
    try {
      const { ok } = await callSyncFn("DELETE");
      if (!ok) {
        toast.error("Could not disconnect. Please try again.");
        return;
      }
      toast.success("Google Calendar disconnected");
      await refreshStatus();
    } finally {
      setDisconnecting(false);
    }
  }, [refreshStatus]);

  if (!user) {
    return (
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-sm font-medium">Two-way Google sync</p>
        <p className="text-xs text-muted-foreground">
          Sign in with cloud sync to connect your own Google Calendar.
        </p>
      </div>
    );
  }

  const connected = status?.connected;

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-sm font-medium flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-muted-foreground" />
        Two-way Google sync
      </p>
      <p className="text-[11px] text-muted-foreground">
        Events you add in Google Calendar appear on your planner's monthly pages, and your
        planner's dated notes and appointments appear in Google Calendar. Each person connects
        their own Google account — nothing is shared between users.
      </p>

      {status === null ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking connection…
        </div>
      ) : connected ? (
        <>
          <div className="text-xs text-muted-foreground">
            Connected{status.email ? ` · ${status.email}` : ""}
            {status.lastSyncAt ? ` · last synced ${new Date(status.lastSyncAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runSync} className="flex-1 min-w-[9rem]" disabled={syncing}>
              {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {syncing ? "Syncing…" : "Sync now"}
            </Button>
            <Button onClick={disconnect} variant="ghost" className="flex-1 min-w-[9rem]" disabled={disconnecting}>
              {disconnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
              Disconnect
            </Button>
          </div>
        </>
      ) : (
        <Button onClick={connect} className="w-full" disabled={connecting}>
          {connecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {status.reconnectRequired ? "Reconnect Google Calendar" : "Connect Google Calendar"}
        </Button>
      )}
    </div>
  );
}
