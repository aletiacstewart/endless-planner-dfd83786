import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoverImage } from "@/components/cover/CoverImage";
import { CoverPicker } from "@/components/cover/CoverPicker";
import { useUserSettings } from "@/hooks/useUserSettings";
import { getCover } from "@/data/covers";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const { settings, update } = useUserSettings();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [plannerName, setPlannerName] = useState(settings?.plannerName ?? "");
  const [ownerName, setOwnerName] = useState(settings?.ownerName ?? "");

  if (!settings) return null;

  const cover = getCover(settings.coverId);

  const saveText = async () => {
    await update({ plannerName: plannerName.trim() || "My Planner", ownerName: ownerName.trim() });
    toast.success("Saved");
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--gradient-paper)" }}>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="section-title">Settings</h1>
      </header>

      <main className="px-5 space-y-5">
        <section className="planner-card">
          <h2 className="font-display text-xl mb-1">Cover</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Your cover sets the mood — the whole app re-themes to match.
          </p>
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-border relative group"
          >
            <CoverImage
              cover={cover}
              plannerName={settings.plannerName}
              ownerName={settings.ownerName}
              className="absolute inset-0"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-card/90 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Change cover
              </div>
            </div>
          </button>
          <p className="text-xs text-muted-foreground mt-2 text-center">{cover.name}</p>
        </section>

        <section className="planner-card space-y-4">
          <h2 className="font-display text-xl">Names</h2>
          <label className="block">
            <span className="field-label block mb-1.5">Planner name</span>
            <Input
              value={plannerName}
              onChange={(e) => setPlannerName(e.target.value)}
              maxLength={40}
            />
          </label>
          <label className="block">
            <span className="field-label block mb-1.5">Your name</span>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Shown on personalised covers"
              maxLength={40}
            />
          </label>
          <Button onClick={saveText} className="w-full">Save</Button>
        </section>

        <Link to="/" className="block text-center text-sm text-muted-foreground underline pt-2">
          Back to planner
        </Link>
      </main>

      <CoverPicker
        open={pickerOpen}
        selectedId={settings.coverId}
        plannerName={settings.plannerName}
        ownerName={settings.ownerName}
        onSelect={(id) => update({ coverId: id })}
        onClose={() => setPickerOpen(false)}
        onConfirm={() => setPickerOpen(false)}
        confirmLabel="Done"
      />
    </div>
  );
}
