import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MyOrg { id: string; name: string; plan_tier: string }

const KEY = "brandedby:active-org";

export function useMyOrgs() {
  const [orgs, setOrgs] = useState<MyOrg[]>([]);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [activeId, setActiveIdState] = useState<string | null>(() => localStorage.getItem(KEY));

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSignedIn(!!session);
      if (!session) return;
      const { data } = await supabase.from("organizations").select("id,name,plan_tier").order("created_at");
      const list = data ?? [];
      setOrgs(list);
      setActiveIdState((cur) => (cur && list.some((o) => o.id === cur) ? cur : list[0]?.id ?? null));
    })();
  }, []);

  const setActiveId = (id: string) => { localStorage.setItem(KEY, id); setActiveIdState(id); };
  return { orgs, signedIn, activeId, setActiveId, activeOrg: orgs.find((o) => o.id === activeId) ?? null };
}
