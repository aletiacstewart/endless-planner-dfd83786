/**
 * Tracks the most recently focused rich-text field so stickers picked from the
 * personalization bar / library can be inserted *inside* that field at the
 * caret, instead of being dropped on the page overlay.
 */

export interface InlineTarget {
  el: HTMLElement;
  commit: (html: string) => void;
}

export interface InlineStickerInput {
  kind: "emoji" | "img";
  src: string;
  size?: number;
  label?: string;
}

let active: InlineTarget | null = null;
let savedRange: Range | null = null;

export function registerInlineTarget(t: InlineTarget) {
  active = t;
}

export function unregisterInlineTarget(el: HTMLElement) {
  if (active?.el === el) {
    active = null;
    savedRange = null;
  }
}

/** Call on selection changes / blur so we can restore the caret later. */
export function saveInlineCaret(el: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (el.contains(range.commonAncestorContainer)) savedRange = range.cloneRange();
}

export function hasInlineTarget(): boolean {
  return !!active && document.body.contains(active.el);
}

/** Inserts the sticker into the active field. Returns false if there is none. */
export function insertInlineSticker(s: InlineStickerInput): boolean {
  if (!active || !document.body.contains(active.el)) return false;
  const el = active.el;

  const node: HTMLElement =
    s.kind === "emoji"
      ? Object.assign(document.createElement("span"), { textContent: s.src })
      : Object.assign(document.createElement("img"), { src: s.src, alt: s.label ?? "" });

  node.setAttribute("data-inline-sticker", "1");
  const size = s.size ?? (s.kind === "emoji" ? 28 : 48);
  if (s.kind === "emoji") {
    node.style.fontSize = `${size}px`;
    node.style.lineHeight = "1";
    node.style.verticalAlign = "middle";
  } else {
    node.style.width = `${size}px`;
    node.style.height = "auto";
    node.style.display = "inline-block";
    node.style.verticalAlign = "middle";
  }

  el.focus();
  const sel = window.getSelection();
  if (savedRange && el.contains(savedRange.commonAncestorContainer)) {
    sel?.removeAllRanges();
    sel?.addRange(savedRange);
  }

  const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
  if (range && el.contains(range.commonAncestorContainer)) {
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
    savedRange = range.cloneRange();
  } else {
    el.appendChild(node);
  }

  active.commit(el.innerHTML);
  return true;
}

/** Resize / remove helpers used by the in-field sticker controls. */
export function inlineStickerSize(node: HTMLElement): number {
  if (node.tagName === "IMG") return node.offsetWidth || 48;
  return parseFloat(node.style.fontSize || "28") || 28;
}

export function setInlineStickerSize(node: HTMLElement, size: number) {
  const next = Math.max(16, Math.min(240, Math.round(size)));
  if (node.tagName === "IMG") {
    node.style.width = `${next}px`;
    node.style.height = "auto";
  } else {
    node.style.fontSize = `${next}px`;
  }
}
