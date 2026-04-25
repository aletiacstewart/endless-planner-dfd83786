import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Section from "./pages/Section.tsx";
import Entry from "./pages/Entry.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { SplashScreen } from "./components/SplashScreen";
import { useUserSettings } from "./hooks/useUserSettings";
import { useCoverTheme } from "./hooks/useCoverTheme";
import { getCover } from "./data/covers";

const queryClient = new QueryClient();

function AppShell() {
  const { settings, loading } = useUserSettings();
  // Splash stays open until the user taps it — like opening the front
  // cover of a paper journal. Re-shows on full reload.
  const [splashed, setSplashed] = useState(false);

  // Apply cover theme whenever cover changes (also during onboarding the
  // OnboardingFlow has its own preview hook).
  useCoverTheme(settings?.coverId);

  if (loading || !settings) return null;

  if (!settings.onboarded) {
    return <OnboardingFlow />;
  }

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/section/:pageTypeId" element={<Section />} />
          <Route path="/entry/:entryId" element={<Entry />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppShell />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
