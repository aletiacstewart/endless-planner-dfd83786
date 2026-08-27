import { useEffect, useRef, useState } from "react";
import { X, Minus, Plus, RotateCcw, RotateCw, BringToFront, SendToBack } from "lucide-react";
import { sortStickers, topStickerZ, type Sticker } from "@/lib/entryMeta";

interface Props {
  stickers: Sticker[];
  onChange: (next: Sticker[]) => void;
}

/** Positions (in %) stickers snap to while dragging. */
const SNAP_POINTS = [25, 50, 75];
const SNAP_TOLERANCE = 1.6;

function snap(value: number): { value: number; guide: number | null } {
  for (const p of SNAP_POINTS) {
    if (Math.abs(value - p) <= SNAP_TOLERANCE) return { value: p, guide: p };
  }
  return { value, guide: null };
}

/**
 * Overlay of draggable stickers positioned relative to the parent
 * (which must be `position: relative`). Tap to select → shows delete/size/
 * rotate/layer controls. Dragging snaps to centre and third guides.
 */
export function StickerLayer({ stickers, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  // Deselect when clicking outside any sticker
  useEffect(() => {
    if (!selectedId) return;
    const handler = (e: MouseEvent | TouchEvent) => {
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

  const update = (next: Sticker) => onChange(stickers.map((x) => (x.id === next.id ? next : x)));

  const bringToFront = (s: Sticker) => update({ ...s, z: topStickerZ(stickers) + 1 });
  const sendToBack = (s: Sticker) => {
    const min = stickers.reduce((m, x) => Math.min(m, x.z ?? 0), 0);
    update({ ...s, z: min - 1 });
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {guides.x !== null && (
        <div
          className="absolute top-0 bottom-0 w-px bg-primary/60"
          style={{ left: `${guides.x}%` }}
          aria-hidden
        />
      )}
      {guides.y !== null && (
        <div
          className="absolute left-0 right-0 h-px bg-primary/60"
          style={{ top: `${guides.y}%` }}
          aria-hidden
        />
      )}

      {sortStickers(stickers).map((s) => (
        <StickerItem
          key={s.id}
          sticker={s}
          selected={selectedId === s.id}
          onSelect={() => setSelectedId(s.id)}
          onGuides={setGuides}
          onUpdate={update}
          onFront={() => bringToFront(s)}
          onBack={() => sendToBack(s)}
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
  onFront,
  onBack,
  onGuides,
}: {
  sticker: Sticker;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (s: Sticker) => void;
  onRemove: () => void;
  onFront: () => void;
  onBack: () => void;
  onGuides: (g: { x: number | null; y: number | null }) => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);
  // Active pointers for pinch gestures (two-finger resize on touch devices).
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; size: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const pinchDistance = () => {
    const pts = [...pointersRef.current.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      // Second finger down → switch from drag to pinch-resize.
      dragRef.current = null;
      setDragging(false);
      pinchRef.current = { dist: pinchDistance(), size: sticker.size };
      onSelect();
      return;
    }
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: sticker.x, origY: sticker.y, moved: false };
    setDragging(true);
    onSelect();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pinchRef.current && pointersRef.current.size >= 2) {
      const dist = pinchDistance();
      if (dist > 0 && pinchRef.current.dist > 0) {
        const next = Math.round((pinchRef.current.size * dist) / pinchRef.current.dist);
        onUpdate({ ...sticker, size: Math.max(20, Math.min(240, next)) });
      }
      return;
    }

    if (!dragRef.current) return;
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    if (Math.abs(dx) + Math.abs(dy) > 0.3) dragRef.current.moved = true;

    const rawX = Math.max(0, Math.min(96, dragRef.current.origX + dx));
    const rawY = Math.max(0, Math.min(98, dragRef.current.origY + dy));
    const sx = snap(rawX);
    const sy = snap(rawY);
    onGuides({ x: sx.guide, y: sy.guide });
    onUpdate({ ...sticker, x: sx.value, y: sy.value });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    dragRef.current = null;
    setDragging(false);
    onGuides({ x: null, y: null });
  };


  const bump = (delta: number) =>
    onUpdate({ ...sticker, size: Math.max(20, Math.min(160, sticker.size + delta)) });
  const rotate = (delta: number) =>
    onUpdate({ ...sticker, rot: ((sticker.rot ?? 0) + delta) });

  return (
    <div
      data-sticker
      data-no-swipe
      className="pointer-events-auto absolute"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        zIndex: (sticker.z ?? 0) + 100,
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
            <button type="button" onClick={onFront} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted" aria-label="Bring to front">
              <BringToFront className="w-3 h-3" />
            </button>
            <button type="button" onClick={onBack} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted" aria-label="Send to back">
              <SendToBack className="w-3 h-3" />
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
