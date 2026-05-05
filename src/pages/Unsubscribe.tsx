import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "valid" | "already" | "invalid" | "submitting" | "success" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
    fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setState("invalid");
          return;
        }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setState("already");
        } else if (data.valid) {
          setState("valid");
        } else {
          setState("invalid");
        }
      })
      .catch(() => setState("invalid"));
  }, [token]);

  const confirm = async () => {
    setState("submitting");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if ((data as any)?.success) setState("success");
      else if ((data as any)?.reason === "already_unsubscribed") setState("already");
      else {
        setErrorMsg("Unable to process unsubscribe.");
        setState("error");
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Unable to process unsubscribe.");
      setState("error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-semibold">Email preferences</h1>
        {state === "loading" && <p className="text-muted-foreground">Checking your link…</p>}
        {state === "valid" && (
          <>
            <p className="text-muted-foreground">
              Click below to unsubscribe from emails sent by Endless Planner.
            </p>
            <Button onClick={confirm} size="lg">Confirm unsubscribe</Button>
          </>
        )}
        {state === "submitting" && <p className="text-muted-foreground">Processing…</p>}
        {state === "success" && (
          <p className="text-muted-foreground">
            You've been unsubscribed. We won't send you any more emails.
          </p>
        )}
        {state === "already" && (
          <p className="text-muted-foreground">You're already unsubscribed.</p>
        )}
        {state === "invalid" && (
          <p className="text-muted-foreground">This unsubscribe link is invalid or expired.</p>
        )}
        {state === "error" && (
          <p className="text-destructive">{errorMsg}</p>
        )}
      </div>
    </main>
  );
}
