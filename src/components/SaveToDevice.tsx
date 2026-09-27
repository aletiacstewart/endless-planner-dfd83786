import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Laptop, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DeviceKey = "iphone" | "android" | "mac" | "windows";

const DEVICES: {
  key: DeviceKey;
  label: string;
  icon: typeof Smartphone;
  steps: string[];
  note?: string;
}[] = [
  {
    key: "iphone",
    label: "iPhone & iPad",
    icon: Tablet,
    steps: [
      "Open your planner link in Safari.",
      "Tap the Share button at the bottom (a square with an arrow going up).",
      'Scroll down and tap "Add to Home Screen".',
      'Tap "Add" in the top corner.',
    ],
    note: "Your planner now sits on your home screen like any other app and opens full screen.",
  },
  {
    key: "android",
    label: "Android",
    icon: Smartphone,
    steps: [
      "Open your planner link in Chrome.",
      "Tap the three dots menu in the top right.",
      'Tap "Install app" (or "Add to Home screen").',
      'Tap "Install" to confirm.',
    ],
    note: "Look for the planner icon with your other apps.",
  },
  {
    key: "mac",
    label: "Mac",
    icon: Laptop,
    steps: [
      "Open your planner link in Safari or Chrome.",
      "In Safari, click File in the menu bar, then Add to Dock.",
      'In Chrome, click the install icon in the address bar, then "Install".',
    ],
    note: "The planner opens in its own window, with no tabs or address bar.",
  },
  {
    key: "windows",
    label: "Windows PC",
    icon: Monitor,
    steps: [
      "Open your planner link in Chrome or Edge.",
      "Click the install icon at the right of the address bar (a screen with an arrow).",
      'Click "Install".',
      "Pin it to your taskbar so it is always one click away.",
    ],
    note: "The planner opens in its own window, with no tabs or address bar.",
  },
];

function detectDevice(): DeviceKey {
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "iphone";
  if (/Android/i.test(ua)) return "android";
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
  return "windows";
}

export function SaveToDeviceGuide({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<DeviceKey>("windows");
  const [copied, setCopied] = useState(false);

  useEffect(() => setActive(detectDevice()), []);

  const link = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/app`;
  }, []);

  const device = DEVICES.find((d) => d.key === active) ?? DEVICES[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {/* Your personal planner link */}
      <div className="rounded-xl border border-border bg-muted/40 p-3">
        <span className="field-label block mb-2">Your planner link</span>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate text-sm px-3 h-11 flex items-center rounded-lg bg-card border border-border">
            {link}
          </code>
          <Button
            type="button"
            variant="secondary"
            onClick={copy}
            className="h-11 min-w-11 shrink-0 touch-manipulation"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="ml-2 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Sign in with the same email on any device and everything you wrote is there.
        </p>
      </div>

      {/* Device chooser */}
      <div className="flex flex-wrap gap-2">
        {DEVICES.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => setActive(d.key)}
              className={cn(
                "inline-flex items-center gap-2 min-h-11 px-3.5 rounded-full border text-sm touch-manipulation transition-colors",
                active === d.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-accent",
              )}
            >
              <Icon className="w-4 h-4" />
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Steps */}
      <ol className="space-y-2.5">
        {device.steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="w-6 h-6 shrink-0 rounded-full bg-primary-soft text-primary text-xs font-semibold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="pt-0.5">{s}</span>
          </li>
        ))}
      </ol>

      {device.note && (
        <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
          {device.note}
        </p>
      )}
    </div>
  );
}

export function SaveToDeviceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Save your planner to this device</DialogTitle>
          <DialogDescription>
            Add it to your home screen so it opens like an app — on your phone, tablet and computer.
          </DialogDescription>
        </DialogHeader>
        <SaveToDeviceGuide />
      </DialogContent>
    </Dialog>
  );
}
