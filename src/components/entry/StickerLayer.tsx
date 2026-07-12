import { useEffect, useRef, useState } from "react";
import { X, Minus, Plus, RotateCcw, RotateCw } from "lucide-react";
import type { Sticker } from "@/lib/entryMeta";

interface Props {
  stickers: Sticker[];
  onChange: (next: Sticker[]) => void;
}

/**
 * Overlay of draggable stickers positioned relative to the parent
 * (which must be `position: relative`). Tap to select → shows delete/size/rotate
 * controls. Double-click also removes.
 */
export function StickerLayer({ stickers, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Deselect when clicking outside any sticker
  useEffect(() => {
    if (!selectedId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-sticker]")) setSelectedId(null);
    };
    window.addEventListener("mousedown", handler);
    window.addEventListener("touchstart", handler);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, [selectedId]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {stickers.map((s) => (
        <StickerItem
          key={s.id}
          sticker={s}
          selected={selectedId === s.id}
          onSelect={() => setSelectedId(s.id)}
          onUpdate={(next) => onChange(stickers.map((x) => (x.id === s.id ? next : x)))}
          onRemove={() => {
            onChange(stickers.filter((x) => x.id !== s.id));
            setSelectedId(null);
          }}
        />
      ))}
    </div>
  );
}

function StickerItem({
  sticker,
  selected,
  onSelect,
  onUpdate,
  onRemove,
}: {
  sticker: Sticker;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (s: Sticker) => void;
  onRemove: () => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: sticker.x, origY: sticker.y, moved: false };
    setDragging(true);
    onSelect();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    if (Math.abs(dx) + Math.abs(dy) > 0.3) dragRef.current.moved = true;
    onUpdate({
      ...sticker,
      x: Math.max(0, Math.min(96, dragRef.current.origX + dx)),
      y: Math.max(0, Math.min(98, dragRef.current.origY + dy)),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const bump = (delta: number) =>
    onUpdate({ ...sticker, size: Math.max(20, Math.min(160, sticker.size + delta)) });
  const rotate = (delta: number) =>
    onUpdate({ ...sticker, rot: ((sticker.rot ?? 0) + delta) });

  return (
    <div
      data-sticker
      className="pointer-events-auto absolute"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
      }}
    >
      <div className="relative" style={{ transform: "translate(-50%, -50%)" }}>
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onRemove}
          className="select-none touch-none"
          style={{
            fontSize: sticker.size,
            transform: `rotate(${sticker.rot ?? 0}deg)`,
            cursor: dragging ? "grabbing" : "grab",
            lineHeight: 1,
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
            outline: selected ? "2px dashed hsl(var(--primary))" : "none",
            outlineOffset: 4,
            borderRadius: 8,
          }}
          title="Tap to select · drag to move · double-click to remove"
        >
          {sticker.kind === "emoji" ? (
            <span>{sticker.src}</span>
          ) : (
            <img src={sticker.src} alt="" style={{ width: sticker.size, height: sticker.size }} draggable={false} />
          )}
        </div>

        {selected && (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-border bg-popover px-1.5 py-1 shadow-md"
            style={{ top: `calc(50% + ${sticker.size / 2 + 8}px)` }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <button type="button" onClick={() => bump(-8)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted" aria-label="Smaller">
              <Minus className="w-3 h-3" />
            </button>
            <button type="button" onClick={() => bump(8)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted" aria-label="Larger">
              <Plus className="w-3 h-3" />
            </button>
            <span className="w-px h-4 bg-border mx-0.5" />
            <button type="button" onClick={() => rotate(-15)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted" aria-label="Rotate left">
              <RotateCcw className="w-3 h-3" />
            </button>
            <button type="button" onClick={() => rotate(15)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted" aria-label="Rotate right">
              <RotateCw className="w-3 h-3" />
            </button>
            <span className="w-px h-4 bg-border mx-0.5" />
            <button type="button" onClick={onRemove} className="w-6 h-6 rounded flex items-center justify-center text-destructive hover:bg-destructive/10" aria-label="Delete sticker">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
