# Fix: Sticker button "opens and closes, can't use"

## Diagnosis

Tested the entry page in desktop, touch, and iPad emulation: the Sticker popover and
Library dialog both open and stay open. The real usability bug is in
`EntryPersonalization.tsx`: tapping any emoji in the quick Sticker tray calls
`setStickerOpen(false)`, so the tray slams shut after every single placement. To place
three stickers you must reopen the tray three times — it feels like it "opens and
closes" and can't be used. The Library dialog was already built as a stay-open tray;
the quick tray was not.

Two console warnings also come from this dialog flow:
- `Function components cannot be given refs ... Check the render method of StickerLibraryDialog` (DialogHeader receives a ref from Radix but is a plain function component)
- `Missing Description or aria-describedby for DialogContent`

## Changes

**1. Keep the quick Sticker tray open while placing** (`src/components/entry/EntryPersonalization.tsx`)
- Remove `setStickerOpen(false)` from `addSticker` so each tap places a sticker and the
  tray stays open — same behavior as the Library tray ("tap as many as you like").
- Update the helper text to say the tray stays open and you tap outside or press the
  Sticker button again to close it.

**2. Harden the toggle against double-firing on touch devices**
- On the Sticker trigger button, prevent the synthetic double click some touch devices
  emit (which toggles the popover open→closed in one tap): control `open` explicitly
  via `onOpenChange` plus `e.preventDefault()` on the trigger's pointerdown, so a tap
  can only ever open-or-close once.

**3. Fix the dialog warnings** (`src/components/entry/StickerLibraryDialog.tsx`, `src/components/ui/dialog.tsx`)
- Convert the plain `<p>` subtitle into Radix `DialogDescription` so screen readers and
  the console warning are satisfied.
- Wrap `DialogHeader` / `DialogFooter` in `React.forwardRef` in `dialog.tsx` so Radix
  can attach refs without the dev warning (fixes the same warning anywhere else
  DialogHeader is used too).

## Verify
- Playwright: open an entry, tap Sticker, place 3 emoji in a row without the tray
  closing; open Library, confirm no console warnings; confirm on iPad emulation too.
