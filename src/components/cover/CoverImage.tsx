import { forwardRef, useEffect, useRef } from "react";
import { type Cover } from "@/data/covers";
import { cn } from "@/lib/utils";

type Props = {
  cover: Cover;
  plannerName?: string;
  ownerName?: string;
  className?: string;
  /** When true, render the personalized text overlay on a canvas. */
  personalize?: boolean;
};

/**
 * Cover image renderer. For non-personalized covers this is just an <img>.
 * For the Vintage Scrapbook cover (personalized=true) it draws the planner
 * name + owner name onto the blank "Belongs to" note via canvas so the
 * artwork stays sharp and updates whenever the user renames their planner.
 */
export const CoverImage = forwardRef<HTMLImageElement | HTMLCanvasElement, Props>(function CoverImage(
  { cover, plannerName, ownerName, className, personalize = true },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPersonalized = cover.personalized && personalize;

  useEffect(() => {
    if (!isPersonalized) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = cover.image;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      // Vintage Scrapbook layout (image is 2000 × 1380):
      //  - Right-side note paper occupies roughly x: 1180..1900, y: 560..1100
      //  - "Belongs to" label is already painted onto the image near the top.
      //  - Lined area for handwriting starts ~y=750.
      const region = { x: 1240, y: 760, w: 600, lineH: 110 };

      ctx.fillStyle = "#2a2a2a";
      ctx.font = "italic 78px 'Caveat', cursive";
      ctx.textBaseline = "alphabetic";

      const name = (plannerName || "").trim();
      const owner = (ownerName || "").trim();

      if (name) {
        ctx.fillText(truncate(ctx, name, region.w), region.x, region.y);
      }
      if (owner) {
        ctx.font = "italic 56px 'Caveat', cursive";
        ctx.fillText(truncate(ctx, owner, region.w), region.x, region.y + region.lineH);
      }
    };
  }, [cover.image, isPersonalized, plannerName, ownerName]);

  if (isPersonalized) {
    return (
      <canvas
        ref={(el) => {
          canvasRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }

  return (
    <img
      ref={ref as React.Ref<HTMLImageElement>}
      src={cover.image}
      alt={cover.name}
      loading="lazy"
      className={cn("w-full h-full object-cover", className)}
    />
  );
});

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(text.slice(0, mid) + "…").width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return text.slice(0, lo) + "…";
}
