import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Pen, Redo2, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DrawingPoint { x: number; y: number; pressure?: number }
export interface DrawingStroke { color: string; width: number; eraser?: boolean; points: DrawingPoint[] }
export interface DrawingValue { strokes: DrawingStroke[] }

interface Props { value?: DrawingValue | null; label: string; onChange: (value: DrawingValue) => void }

const COLORS = ["hsl(var(--foreground))", "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))"];

export function DrawingCanvas({ value, label, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<DrawingStroke | null>(null);
  const strokes = value?.strokes ?? [];
  const [redo, setRedo] = useState<DrawingStroke[]>([]);
  const [eraser, setEraser] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(4);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(rect.width * ratio) || canvas.height !== Math.round(rect.height * ratio)) {
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokes) {
      if (stroke.points.length < 1) continue;
      ctx.globalCompositeOperation = stroke.eraser ? "destination-out" : "source-over";
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      stroke.points.forEach((p, i) => i ? ctx.lineTo(p.x * rect.width, p.y * rect.height) : ctx.moveTo(p.x * rect.width, p.y * rect.height));
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }, [strokes]);

  useEffect(() => { render(); }, [render]);
  useEffect(() => {
    const observer = new ResizeObserver(render);
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [render]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>): DrawingPoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height, pressure: event.pressure };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = { color, width: eraser ? width * 3 : width, eraser, points: [point(event)] };
    setRedo([]);
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current.points.push(point(event));
    onChange({ strokes: [...strokes, drawing.current] });
  };
  const end = () => { drawing.current = null; };

  return <div className="space-y-2">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <label className="field-label">{label}</label>
      <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label={`${label} drawing tools`}>
        <Button type="button" size="icon" variant={!eraser ? "secondary" : "ghost"} onClick={() => setEraser(false)} title="Pen"><Pen className="h-4 w-4" /></Button>
        <Button type="button" size="icon" variant={eraser ? "secondary" : "ghost"} onClick={() => setEraser(true)} title="Eraser"><Eraser className="h-4 w-4" /></Button>
        {COLORS.map((swatch) => <button key={swatch} type="button" aria-label="Ink color" onClick={() => { setColor(swatch); setEraser(false); }} className={cn("h-7 w-7 rounded-full border-2", color === swatch && !eraser ? "border-primary" : "border-border")} style={{ backgroundColor: swatch }} />)}
        <input aria-label="Stroke thickness" type="range" min="2" max="12" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-20 accent-primary" />
        <Button type="button" size="icon" variant="ghost" disabled={!strokes.length} onClick={() => { const last = strokes.at(-1); if (!last) return; onChange({ strokes: strokes.slice(0, -1) }); setRedo((r) => [...r, last]); }} title="Undo"><Undo2 className="h-4 w-4" /></Button>
        <Button type="button" size="icon" variant="ghost" disabled={!redo.length} onClick={() => { const last = redo.at(-1); if (!last) return; onChange({ strokes: [...strokes, last] }); setRedo((r) => r.slice(0, -1)); }} title="Redo"><Redo2 className="h-4 w-4" /></Button>
        <Button type="button" size="icon" variant="ghost" disabled={!strokes.length} onClick={() => { drawing.current = null; setRedo([]); onChange({ strokes: [] }); }} title="Clear sketch" aria-label="Clear sketch"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
    <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} className="h-72 w-full touch-none rounded-md border border-border bg-background/60 paper-dot cursor-crosshair" aria-label={label} />
  </div>;
}
