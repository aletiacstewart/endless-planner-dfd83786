import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Landing page Google redirects back to after a two-way sync consent. */
export default function GoogleCalendarReturn() {
  const [message, setMessage] = useState("Finishing the connection…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notifyOpenerAndClose = (type: "appUserConnectorOAuthComplete" | "appUserConnectorOAuthFailed") => {
      window.opener?.postMessage(
        { type, connectorId: "google_calendar" },
        window.location.origin,
      );
      window.close();
    };
    if (params.get("success") !== "true") {
      setMessage(params.get("error") ?? "Google Calendar did not finish connecting.");
      notifyOpenerAndClose("appUserConnectorOAuthFailed");
      return;
    }
    const code = params.get("code");
    if (!code) {
      setMessage("Google connected, but no exchange code came back. Please try connecting again.");
      notifyOpenerAndClose("appUserConnectorOAuthFailed");
      return;
    }
    void supabase.functions
      .invoke("google-cal-oauth-complete", { body: { code } })
      .then(({ error }) => {
        if (error) throw error;
        notifyOpenerAndClose("appUserConnectorOAuthComplete");
      })
      .catch(() => {
        setMessage("Could not finish the connection. Please try again.");
        notifyOpenerAndClose("appUserConnectorOAuthFailed");
      });
  }, []);

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <p className="text-sm text-muted-foreground text-center max-w-xs">{message}</p>
    </div>
  );
}
