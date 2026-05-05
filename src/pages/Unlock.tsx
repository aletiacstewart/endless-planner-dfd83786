import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { setUnlocked, setPackUnlocked, getDeviceId } from "@/lib/unlock";

export default function Unlock() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Unlocking your planner…");

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setStatus("error");
      setMessage("Missing unlock code.");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("validate-unlock", {
          body: { code, deviceId: getDeviceId() },
        });
        if (error || !data?.ok) throw new Error(error?.message || "Invalid unlock code");
        if (data.type === "pack" && data.pack_id) {
          setPackUnlocked(data.pack_id, code);
          navigate("/settings?cover=" + encodeURIComponent(data.pack_id), { replace: true });
        } else {
          setUnlocked(data.planner_id, code);
          navigate("/app", { replace: true });
        }
      } catch (e) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Could not unlock.");
      }
    })();
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="planner-card max-w-md w-full text-center">
        {status === "loading" ? (
          <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
        ) : (
          <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary" />
        )}
        <h1 className="font-display text-2xl mb-2">
          {status === "loading" ? "Unlocking…" : "We couldn't unlock"}
        </h1>
        <p className="text-muted-foreground">{message}</p>
        {status === "error" && (
          <button onClick={() => navigate("/")} className="mt-6 underline text-sm">
            Back to home
          </button>
        )}
      </div>
    </div>
  );
}
