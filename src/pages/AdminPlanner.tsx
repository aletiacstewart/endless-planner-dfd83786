import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { setUnlocked, setPackUnlocked } from "@/lib/unlock";
import { PLANNERS } from "@/data/planners";
import { COVER_PACKS } from "@/data/coverPacks";

// Simple owner-only test access. Not high-security: it just keeps
// the URL out of casual public discovery on the marketing homepage.
const ADMIN_KEY = "let-me-in-2026";

export default function AdminPlanner() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Unlocking your test planner…");

  useEffect(() => {
    const key = params.get("key");
    if (key !== ADMIN_KEY) {
      setStatus("error");
      setMessage("This page is not available.");
      return;
    }

    try {
      // Unlock every planner
      for (const p of PLANNERS) setUnlocked(p.id, "ADMIN-TEST");

      // Optionally unlock every cover/icon pack for testing
      if (params.get("packs") !== "0") {
        for (const pack of COVER_PACKS) setPackUnlocked(pack.id, "ADMIN-TEST");
      }

      navigate("/app", { replace: true });
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Could not unlock.");
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="planner-card max-w-md w-full text-center">
        {status === "loading" ? (
          <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
        ) : (
          <ShieldCheck className="w-10 h-10 mx-auto mb-4 text-primary" />
        )}
        <h1 className="font-display text-2xl mb-2">
          {status === "loading" ? "Opening test planner…" : "Not available"}
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
