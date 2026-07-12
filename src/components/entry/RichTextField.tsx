import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Palette, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemedSwatches, toCss } from "@/hooks/useThemedSwatches";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
}

/**
 * Lightweight rich-text editor built on contentEditable + document.execCommand.
 * Stores HTML. Plain-text values from the pre-rich-text era render unchanged
 * and are upgraded to HTML on the next edit.
 */
export function RichTextField({ value, onChange, placeholder, rows = 3, id }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const swatches = useThemedSwatches();

  // Set initial HTML only when the incoming value is different from what's rendered,
  // so typing doesn't get reset each keystroke.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const current = el.innerHTML;
    // Treat plain text (no tags) as a first-time upgrade.
    const incoming = value ?? "";
    if (current !== incoming) {
      if (document.activeElement === el) return; // don't clobber while typing
      el.innerHTML = incoming;
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    // fire an input event manually so onChange picks up
    const el = ref.current;
    if (el) onChange(el.innerHTML);
  };

  const minH = `${Math.max(2, rows) * 1.6}rem`;

  return (
    <div className="relative">
      {focused && (
        <div
          className="absolute -top-9 left-0 z-20 flex items-center gap-0.5 rounded-md border border-border bg-popover px-1 py-1 shadow-md"
          // Prevent blur on toolbar click
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
      <div
        id={id}
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setColorOpen(false); }}
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
