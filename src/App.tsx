import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Section from "./pages/Section.tsx";
import Entry from "./pages/Entry.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
import Landing from "./pages/Landing.tsx";
import Unlock from "./pages/Unlock.tsx";
import ThankYou from "./pages/ThankYou.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import PlannerDetail from "./pages/PlannerDetail.tsx";
import Packs from "./pages/Packs.tsx";
import AdminPlanner from "./pages/AdminPlanner.tsx";
import Auth from "./pages/Auth.tsx";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { SplashScreen } from "./components/SplashScreen";
import { useUserSettings } from "./hooks/useUserSettings";
import { useCoverTheme } from "./hooks/useCoverTheme";
import { getCover } from "./data/covers";
import { isUnlocked } from "./lib/unlock";
import { PLANNERS } from "./data/planners";
import { initSync } from "./lib/sync";
import { useCoverTheme } from "./hooks/useCoverTheme";
import { getCover } from "./data/covers";
import { isUnlocked } from "./lib/unlock";
import { PLANNERS } from "./data/planners";

const queryClient = new QueryClient();

const PRIMARY_PLANNER_ID = PLANNERS[0].id;

function RequireUnlock({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isUnlocked(PRIMARY_PLANNER_ID)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

function PlannerApp() {
  const { settings, loading } = useUserSettings();
  const [splashed, setSplashed] = useState(false);
  useCoverTheme(settings?.coverId);

  if (loading || !settings) return null;
  if (!settings.onboarded) return <OnboardingFlow />;

  return (
    <>
      {!splashed && (
        <SplashScreen
          cover={getCover(settings.coverId)}
          plannerName={settings.plannerName}
          ownerName={settings.ownerName}
          onOpen={() => setSplashed(true)}
        />
      )}
      <Routes>
        <Route path="/app" element={<Index />} />
        <Route path="/section/:pageTypeId" element={<Section />} />
        <Route path="/entry/:entryId" element={<Entry />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/planner/:plannerId" element={<PlannerDetail />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/unlock" element={<Unlock />} />
          <Route path="/admin-planner" element={<AdminPlanner />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route
            path="/*"
            element={
              <RequireUnlock>
                <PlannerApp />
              </RequireUnlock>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
