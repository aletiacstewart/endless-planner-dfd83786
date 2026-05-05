import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ThankYou() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirming your purchase…");

  useEffect(() => {
    const sessionId = params.get("session_id");
    const planner = params.get("planner");
    if (!sessionId || !planner) {
      setStatus("error");
      setMessage("Missing session details.");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("finalize-purchase", {
          body: { session_id: sessionId, planner_id: planner },
        });
        if (error || !data?.ok) throw new Error(error?.message || "Could not confirm purchase");
        setStatus("ok");
        setMessage(`Check ${data.email} — your install link is on its way.`);
      } catch (e) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Something went wrong.");
      }
    })();
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="planner-card max-w-md w-full text-center">
        {status === "loading" && <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />}
        {status === "ok" && <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-primary" />}
        <h1 className="font-display text-2xl mb-2">
          {status === "ok" ? "You're all set!" : status === "error" ? "Hmm." : "One moment…"}
        </h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        {status === "ok" && (
          <p className="text-xs text-muted-foreground">
            Didn't get the email? Check your spam folder, or use the link from any device to unlock the planner.
          </p>
        )}
        <button onClick={() => navigate("/")} className="mt-6 underline text-sm">
          Back to home
        </button>
      </div>
    </div>
  );
}
