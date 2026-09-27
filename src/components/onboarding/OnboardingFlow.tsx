import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoverImage } from "@/components/cover/CoverImage";
import { CoverPicker } from "@/components/cover/CoverPicker";
import { DEFAULT_COVER_ID, getCover } from "@/data/covers";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useCoverTheme } from "@/hooks/useCoverTheme";
import { SaveToDeviceGuide } from "@/components/SaveToDevice";

type Step = "welcome" | "name" | "cover" | "device";

export function OnboardingFlow() {
  const { settings, update } = useUserSettings();
  const [step, setStep] = useState<Step>("welcome");
  const [plannerName, setPlannerName] = useState(settings?.plannerName ?? "");
  const [ownerName, setOwnerName] = useState(settings?.ownerName ?? "");
  const [coverId, setCoverId] = useState(DEFAULT_COVER_ID);

  // Live-preview the selected cover's theme as the user browses.
  useCoverTheme(coverId);

  const finish = async (chosenCoverId: string) => {
    await update({
      plannerName: plannerName.trim() || "My Planner",
      ownerName: ownerName.trim(),
      coverId: chosenCoverId,
      onboarded: true,
    });
  };


  if (step === "welcome") {
    const hero = getCover(DEFAULT_COVER_ID);
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-paper)" }}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center">
            <div className="aspect-square rounded-3xl overflow-hidden mb-8 shadow-2xl mx-auto">
              <CoverImage cover={hero} className="w-full h-full" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Welcome</span>
            </div>
            <h1 className="font-display text-4xl font-semibold mb-3">
              Your story,
              <br />
              your planner.
            </h1>
            <p className="text-muted-foreground mb-8">
              Name it, dress it, and make it entirely yours.
            </p>
            <Button size="lg" className="w-full" onClick={() => setStep("name")}>
              Begin
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "name") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-paper)" }}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full">
            <p className="font-script text-2xl text-primary mb-1">Step 2 of 3</p>
            <h1 className="font-display text-3xl font-semibold mb-2">
              Name your planner
            </h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Give it a name that feels like yours. You can change it later.
            </p>

            <label className="block mb-6">
              <span className="field-label block mb-2">Planner name</span>
              <Input
                autoFocus
                value={plannerName}
                onChange={(e) => setPlannerName(e.target.value)}
                placeholder="My Year, Becoming, Quiet Pages…"
                maxLength={40}
                className="text-lg"
              />
            </label>

            <label className="block mb-8">
              <span className="field-label block mb-2">Your name (optional)</span>
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="For personalised covers"
                maxLength={40}
              />
              <span className="text-xs text-muted-foreground mt-1.5 block">
                Shown on covers like the Vintage Scrapbook.
              </span>
            </label>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("welcome")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep("cover")}
                disabled={!plannerName.trim()}
                className="flex-1"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "device") {
    const chosen = getCover(coverId);
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-paper)" }}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-16 rounded-lg overflow-hidden shadow-lg shrink-0">
                <CoverImage
                  cover={chosen}
                  plannerName={plannerName}
                  ownerName={ownerName}
                  className="w-full h-full"
                />
              </div>
              <div className="min-w-0">
                <p className="font-script text-xl text-primary">Last step</p>
                <h1 className="font-display text-2xl font-semibold truncate">
                  Keep it on your devices
                </h1>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-5">
              Save {plannerName.trim() || "your planner"} to your home screen so it opens with one
              tap — and use the same link on your phone, tablet and computer.
            </p>

            <SaveToDeviceGuide />

            <Button size="lg" className="w-full mt-6" onClick={() => finish(coverId)}>
              Open my planner
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              You can find these steps again any time in Settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CoverPicker
      open
      hideClose
      selectedId={coverId}
      plannerName={plannerName}
      ownerName={ownerName}
      onSelect={setCoverId}
      confirmLabel="Next"
      onConfirm={(id) => {
        setCoverId(id);
        setStep("device");
      }}
    />
  );

}
