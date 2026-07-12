import { useRef, useState } from "react";
import type { Sticker } from "@/lib/entryMeta";

interface Props {
  stickers: Sticker[];
  onChange: (next: Sticker[]) => void;
}

/**
 * Overlay of draggable stickers positioned relative to the parent
 * (which must be `position: relative`). Double-click / double-tap removes.
 */
export function StickerLayer({ stickers, onChange }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {stickers.map((s) => (
        <StickerItem
          key={s.id}
          sticker={s}
          onUpdate={(next) => onChange(stickers.map((x) => (x.id === s.id ? next : x)))}
          onRemove={() => onChange(stickers.filter((x) => x.id !== s.id))}
        />
      ))}
    </div>
  );
}

function StickerItem({
  sticker,
  onUpdate,
  onRemove,
}: {
  sticker: Sticker;
  onUpdate: (s: Sticker) => void;
  onRemove: () => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: sticker.x, origY: sticker.y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const parent = (e.currentTarget as HTMLElement).parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
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

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onRemove}
      className="pointer-events-auto absolute select-none touch-none"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        fontSize: sticker.size,
        transform: `rotate(${sticker.rot ?? 0}deg)`,
        cursor: dragging ? "grabbing" : "grab",
        lineHeight: 1,
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
      }}
      title="Drag to move · double-click to remove"
    >
      {sticker.kind === "emoji" ? (
        <span>{sticker.src}</span>
      ) : (
        <img src={sticker.src} alt="" style={{ width: sticker.size, height: sticker.size }} draggable={false} />
      )}
    </div>
  );
}
