import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const welcomedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function maybeWelcome(s: Session | null) {
      if (!s?.user?.id || welcomedRef.current.has(s.user.id)) return;
      welcomedRef.current.add(s.user.id);
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const ownerName =
          (s.user.user_metadata?.full_name as string | undefined) ||
          (s.user.user_metadata?.name as string | undefined) ||
          s.user.email?.split("@")[0];
        // Fire-and-forget; the function is idempotent via profiles.welcomed_at.
        await supabase.functions.invoke("send-welcome-email", {
          body: { timezone, ownerName, origin: window.location.origin },
        });
      } catch (err) {
        console.warn("welcome dispatch failed", err);
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === "SIGNED_IN") {
        // Defer to avoid running inside the auth callback.
        setTimeout(() => maybeWelcome(s), 0);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session) setTimeout(() => maybeWelcome(data.session), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}
