import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { isUnlocked, refreshUnlocks } from "@/lib/unlock";
import { PLANNERS } from "@/data/planners";
import { reconcileNow } from "@/lib/sync";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"choose" | "email" | "otp">("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const routeAfterSignIn = async () => {
    // Claim any anonymous purchases/subscriptions bought with this email, then
    // pull the server-verified entitlements for this account.
    try { await supabase.rpc("link_user_purchases"); } catch {}
    try { await refreshUnlocks(); } catch {}
    try { await reconcileNow(); } catch {}
    // Support ?next redirect (e.g. from Subscribe page requiring auth)
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next && next.startsWith("/")) {
      navigate(next, { replace: true });
      return;
    }
    if (isUnlocked(PLANNERS[0].id)) {
      navigate("/app", { replace: true });
    } else {
      toast.message("Signed in. Enter your unlock code to open your planner.");
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    if (!loading && user) routeAfterSignIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const signInGoogle = async () => {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (res.error) {
        toast.error(res.error.message || "Couldn't sign in with Google");
        setBusy(false);
      }
      // If redirected, page navigates away.
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't sign in");
      setBusy(false);
    }
  };

  const sendCode = async () => {
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email for the 6-digit code");
    setMode("otp");
  };

  const verifyCode = async () => {
    if (otp.length !== 6) return;
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "email",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in — syncing your planner…");
    // useEffect on `user` will run routeAfterSignIn once the session is set.
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--gradient-paper)" }}>
      <div className="planner-card max-w-md w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="font-display text-2xl mb-2">Sync across devices</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in once, and your planner — entries, settings, and packs — will follow you to every phone, tablet, or computer.
        </p>

        {mode === "choose" && (
          <div className="space-y-3">
            <Button onClick={signInGoogle} disabled={busy} className="w-full" variant="outline">
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Continue with Google
            </Button>
            <Button onClick={() => setMode("email")} disabled={busy} className="w-full">
              <Mail className="w-4 h-4 mr-2" /> Continue with email
            </Button>
          </div>
        )}

        {mode === "email" && (
          <div className="space-y-3">
            <label className="block">
              <span className="field-label block mb-1.5">Email</span>
              <Input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <Button onClick={sendCode} disabled={busy || !email.trim()} className="w-full">
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send 6-digit code
            </Button>
            <button onClick={() => setMode("choose")} className="text-xs text-muted-foreground underline w-full">
              Back
            </button>
          </div>
        )}

        {mode === "otp" && (
          <div className="space-y-4">
            <p className="text-sm text-center">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={verifyCode} disabled={busy || otp.length !== 6} className="w-full">
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Verify & sign in
            </Button>
            <button
              onClick={() => {
                setOtp("");
                setMode("email");
              }}
              className="text-xs text-muted-foreground underline w-full"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
