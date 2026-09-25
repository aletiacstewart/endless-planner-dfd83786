import { useEffect, useRef, useState } from "react";
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
import { reconcileNow, signOut as syncSignOut } from "@/lib/sync";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const routingAfterSignIn = useRef(false);
  // When someone arrives to switch accounts we must not bounce them straight
  // back into the planner they are already signed into.
  const [switching, setSwitching] = useState(
    () => new URLSearchParams(window.location.search).get("switch") === "1",
  );
  const [mode, setMode] = useState<"choose" | "email" | "otp" | "password">(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") ?? "";
    return params.get("mode") === "signin" || params.get("switch") === "1" || next.startsWith("/unlock") || next.includes("checkout=1")
      ? "password"
      : "choose";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);


  const routeAfterSignIn = async () => {
    if (routingAfterSignIn.current) return;
    routingAfterSignIn.current = true;

    // Route immediately after authentication. Cloud reconciliation can take a
    // while on large planners and must never hold someone on the sign-in page.
    const params = new URLSearchParams(window.location.search);
    const stateNext = (window.history.state?.usr as { next?: string } | undefined)?.next;
    const next = params.get("next") || stateNext || sessionStorage.getItem("authNext");
    sessionStorage.removeItem("authNext");
    if (next && next.startsWith("/")) {
      navigate(next, { replace: true });
    } else if (isUnlocked(PLANNERS[0].id)) {
      navigate("/app", { replace: true });
    } else {
      navigate("/app", { replace: true });
    }

    void (async () => {
      try { await supabase.rpc("link_user_purchases"); } catch {}
      try { await refreshUnlocks(); } catch {}
      try { await reconcileNow(); } catch {}
    })();
  };

  useEffect(() => {
    if (!loading && user && !switching) routeAfterSignIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, switching]);

  const signOutHere = async () => {
    setBusy(true);
    try {
      await syncSignOut();
      routingAfterSignIn.current = false;
      setSwitching(false);
      setMode("password");
      toast.success("Signed out — sign in with another account");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't sign out");
    } finally {
      setBusy(false);
    }
  };


  const signInGoogle = async () => {
    setBusy(true);
    try {
      const n = new URLSearchParams(window.location.search).get("next");
      if (n && n.startsWith("/")) sessionStorage.setItem("authNext", n);
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
    toast.success("Signed in — opening your planner…");
    // useEffect on `user` will run routeAfterSignIn once the session is set.
  };

  const [needsConfirm, setNeedsConfirm] = useState(false);

  const resendActivation = async () => {
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + "/auth?next=/app" },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Activation email sent — check your inbox (and spam).");
  };

  const signInPassword = async () => {
    if (!email.trim() || !password) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      const code = (error as { code?: string }).code;
      if (code === "email_not_confirmed" || /not confirmed/i.test(error.message)) {
        setNeedsConfirm(true);
        toast.error("Please activate your account first — tap the link in the email we sent you.");
        return;
      }
      if (code === "invalid_credentials") {
        toast.error("That email and password don't match. Check for typos and try again.");
        return;
      }
      toast.error(error.message);
      return;
    }
    toast.success("Signed in — opening your planner…");
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
            <button
              onClick={() => setMode("password")}
              className="text-xs text-muted-foreground underline w-full"
            >
              Sign in with a password instead
            </button>
          </div>
        )}

        {mode === "password" && (
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
            <label className="block">
              <span className="field-label block mb-1.5">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && signInPassword()}
                placeholder="Your password"
              />
            </label>
            <Button onClick={signInPassword} disabled={busy || !email.trim() || !password} className="w-full">
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Sign in
            </Button>
            {needsConfirm && (
              <div className="rounded-md border border-border p-3 text-sm space-y-2">
                <p>Your account isn't activated yet. Open the email we sent to <strong>{email}</strong> and tap the activation link.</p>
                <Button variant="outline" className="w-full" onClick={resendActivation} disabled={busy}>
                  Resend activation email
                </Button>
              </div>
            )}
            <button onClick={() => setMode("choose")} className="text-xs text-muted-foreground underline w-full">
              Back
            </button>
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
