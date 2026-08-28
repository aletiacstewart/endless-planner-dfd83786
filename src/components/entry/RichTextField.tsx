import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Palette, Eraser, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemedSwatches, toCss } from "@/hooks/useThemedSwatches";
import {
  registerInlineTarget,
  unregisterInlineTarget,
  saveInlineCaret,
  inlineStickerSize,
  setInlineStickerSize,
} from "@/lib/inlineStickers";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
}

/**
 * Lightweight rich-text editor built on contentEditable.
 * Uses styleWithCSS so bold/italic/underline emit inline styles that
 * inherit the surrounding font-family (fixing "bold breaks font" bug).
 */
export function RichTextField({ value, onChange, placeholder, rows = 3, id }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [picked, setPicked] = useState<HTMLElement | null>(null);
  const swatches = useThemedSwatches();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const incoming = value ?? "";
    if (el.innerHTML !== incoming) {
      if (document.activeElement === el) return;
      el.innerHTML = incoming;
    }
  }, [value]);

  // Clean up the inline-sticker target registration when unmounting.
  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) unregisterInlineTarget(el);
    };
  }, []);

  const claimTarget = () => {
    const el = ref.current;
    if (el) registerInlineTarget({ el, commit: (html) => onChange(html) });
  };

  const exec = (cmd: string, arg?: string) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    // styleWithCSS ensures bold/italic/underline use <span style="…">
    // which inherits the surrounding font stack correctly.
    try { document.execCommand("styleWithCSS", false, "true"); } catch { /* noop */ }
    document.execCommand(cmd, false, arg);
    onChange(el.innerHTML);
  };

  const resizePicked = (delta: number) => {
    const el = ref.current;
    if (!picked || !el) return;
    setInlineStickerSize(picked, inlineStickerSize(picked) + delta);
    onChange(el.innerHTML);
  };

  const removePicked = () => {
    const el = ref.current;
    if (!picked || !el) return;
    picked.remove();
    setPicked(null);
    onChange(el.innerHTML);
  };

  const minH = `${Math.max(2, rows) * 1.6}rem`;


  return (
    <div className="relative">
      {focused && (
        <div
          className="absolute -top-9 left-0 z-20 flex items-center gap-0.5 rounded-md border border-border bg-popover px-1 py-1 shadow-md"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ToolbarBtn onClick={() => exec("bold")} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => exec("italic")} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => exec("underline")} title="Underline"><Underline className="w-3.5 h-3.5" /></ToolbarBtn>
          <span className="w-px h-4 bg-border mx-1" />
          <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet list"><List className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
          <span className="w-px h-4 bg-border mx-1" />
          <div className="relative">
            <ToolbarBtn onClick={() => setColorOpen((v) => !v)} title="Text color"><Palette className="w-3.5 h-3.5" /></ToolbarBtn>
            {colorOpen && (
              <div className="absolute top-full left-0 mt-1 flex gap-1 rounded-md border border-border bg-popover p-1.5 shadow-md">
                {swatches.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => { exec("foreColor", toCss(s.hsl)); setColorOpen(false); }}
                    className="w-5 h-5 rounded-full border border-border"
                    style={{ background: toCss(s.hsl) }}
                    aria-label={s.name}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => { exec("removeFormat"); setColorOpen(false); }}
                  className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-muted-foreground"
                  aria-label="Clear color"
                >
                  <Eraser className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {picked && (
        <div
          className="absolute -top-9 right-0 z-30 flex items-center gap-1 rounded-full border border-border bg-popover px-1.5 py-1 shadow-md"
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className="px-1 text-[10px] uppercase tracking-wide text-muted-foreground">Sticker</span>
          <ToolbarBtn onClick={() => resizePicked(-6)} title="Smaller"><Minus className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={() => resizePicked(6)} title="Larger"><Plus className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn onClick={removePicked} title="Remove sticker"><X className="w-3.5 h-3.5" /></ToolbarBtn>
        </div>
      )}
      <div
        id={id}
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onFocus={() => { setFocused(true); claimTarget(); }}
        onBlur={() => {
          setFocused(false);
          setColorOpen(false);
          if (ref.current) saveInlineCaret(ref.current);
        }}
        onKeyUp={() => ref.current && saveInlineCaret(ref.current)}
        onMouseUp={() => ref.current && saveInlineCaret(ref.current)}
        onClick={(e) => {
          const t = (e.target as HTMLElement).closest?.("[data-inline-sticker]") as HTMLElement | null;
          setPicked(t && ref.current?.contains(t) ? t : null);
        }}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}

        className={cn(
          "richtext w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring/40 whitespace-pre-wrap"
        )}
        style={{ minHeight: minH }}
        suppressContentEditableWarning
      />
    </div>
  );
}

function ToolbarBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded flex items-center justify-center text-foreground hover:bg-muted"
    >
      {children}
    </button>
  );
}
