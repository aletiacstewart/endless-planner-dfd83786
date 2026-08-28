# Fix the personalization bar buttons (Title, Subtitle, Body, Background, Cards, Accent, Cozy, Sticker)

## What's happening

Every chip in the toolbar except **Library** uses the same popover mechanism. Library is the only one that works because it opens a modal dialog instead of an anchored popover. So the failure is in the popover layer that all the other chips share, not in each individual button.

Two things I confirmed by reading the code and loading the app in a browser:

- The Sticker chip has an extra `onPointerDown` "preventDefault" hack plus a manual open/close toggle added in a previous change. That combination double-toggles the tray (popovers open on pointer-down, then the manual click handler closes it again).
- The app logs a large number of React warnings on every page load ("Function components cannot be given refs"), including for components that have nothing to do with the toolbar. That means element references are not being attached reliably app-wide, which is exactly the condition that makes an anchored popover treat the click on its own trigger as an "outside click" and shut instantly.

I could not click the toolbar myself to confirm the second point: the test session that is available lands on the onboarding wizard rather than your planner, so the toolbar never renders for me. The diagnosis above is therefore my best-supported reading, not a verified one, and step 1 below is to verify it.

## Plan

1. **Reproduce on a real planner page.** Open your planner entry page in a browser session with the planner unlocked, click each chip, and record whether the panel opens, stays open, or closes immediately. This confirms which of the two causes is in play before changing behavior.

2. **Remove the Sticker chip hack.** Delete the `onPointerDown` preventDefault and the manual toggle so the Sticker chip behaves like every other chip (single source of truth for open/closed state).

3. **Make the toolbar panels self-contained.** Replace the shared anchored-popover usage in the personalization bar with a single lightweight dropdown panel that the bar itself controls:
   - one piece of state tracks which chip is open (only one panel at a time)
   - the panel renders inline under the bar, closing on: clicking the same chip again, choosing another chip, pressing Escape, or clicking anywhere outside the bar
   - panel contents (fonts, sizes, colors, background, card tint, accent, density, stickers) stay exactly as they are today
   This removes the entire class of "opens and closes instantly" failures, since nothing depends on ref/anchor plumbing or outside-click detection from a portal.

4. **Keep the toolbar horizontally scrollable** and make sure the open panel is not clipped by the scroll container (panel renders below the bar, full width, not inside the scroll strip).

5. **Clean up the ref warnings** that show on page load so real problems are visible in the console again: trace which wrappers are being handed refs they cannot accept and fix those, without converting components in a way that breaks hot reload (that caused the blank-page error earlier).

6. **Verify in the browser**: each of the nine chips opens, stays open while you pick values, applies the change to the page, and closes on outside click or Escape. Stickers can be placed several in a row without the tray closing. Confirm zero new console errors.

## Technical notes

- Files touched: `src/components/entry/EntryPersonalization.tsx` (main rewrite of the chip panels), and possibly `src/components/ui/popover.tsx` only if step 1 shows the popover primitive itself is fine and reusable.
- `StickerLibraryDialog` and the sticker placement logic (`addSticker`, `addFromLibrary`, `addRecent`, recents storage) stay unchanged.
- No changes to saved data, entry meta shape, or sync behavior — this is presentation-layer only.
