import { createContext, useContext, type ReactNode } from "react";

type PlannerCoverContextValue = {
  showCover: () => void;
};

const PlannerCoverContext = createContext<PlannerCoverContextValue>({
  showCover: () => undefined,
});

export function PlannerCoverProvider({
  children,
  showCover,
}: {
  children: ReactNode;
  showCover: () => void;
}) {
  return (
    <PlannerCoverContext.Provider value={{ showCover }}>
      {children}
    </PlannerCoverContext.Provider>
  );
}

export function usePlannerCover() {
  return useContext(PlannerCoverContext);
}