import { useEffect, useState } from "react";
import {
  getEntitlements,
  hasPack,
  hasPlanner,
  refreshEntitlements,
  subscribeEntitlements,
  type EntitlementState,
} from "@/lib/entitlements";

/** Live view of the signed-in account's server-verified entitlements. */
export function useEntitlements() {
  const [state, setState] = useState<EntitlementState>(getEntitlements());

  useEffect(() => {
    const unsub = subscribeEntitlements(setState);
    void refreshEntitlements();
    return () => { unsub(); };
  }, []);

  return {
    ...state,
    loading: !state.resolved,
    hasPlanner: (id: string) => hasPlanner(id),
    hasPack: (id: string) => hasPack(id),
    refresh: () => refreshEntitlements(true),
  };
}
