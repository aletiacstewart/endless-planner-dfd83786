# Apply a cover and icon set straight from the packs page

Right now the Cover & Icon Packs page only lets you look: each card has a preview button and (for buyers) an add-to-cart action. Switching your journal to a different cover is only possible from Settings, which is why unlocked covers feel like dead ends.

## What changes

1. **"Use this cover" on every unlocked card.** Any cover you already own — and, on admin or tester accounts, every cover — gets a clear action on its card that switches your journal to it immediately: cover art, theme colours and matching page icons all change together (this is the same switch Settings performs).
2. **Same action inside the icon preview popup.** When you open a cover to look at its page icons, the popup gets a "Use this cover" button for unlocked covers, so you can apply it without closing the popup first. Locked covers keep showing the add-to-cart / price action instead.
3. **Clear current state.** The cover your journal is using now is marked "In use" and its button is disabled, so it's obvious which one is active.
4. **Confirmation.** Applying shows a short confirmation message and the page re-themes instantly.

Locked covers behave exactly as they do today: preview and buy, no apply.

## Technical notes

- `CoverPackPicker` gains internal access to settings (`loadSettings`/`saveSettings` via the existing settings hook used on `Settings.tsx`) and writes `{ coverId }`; `useCoverTheme(settings.coverId)` in `App.tsx` already repaints the palette, and `getCoverPageIcon` already keys page icons off `coverId`, so no theming work is needed.
- Apply eligibility = `isPackPurchased(id) || ent.fullAccess` (same predicate as the existing `hasAccess` helper), so purchase gating and admin/tester access stay unchanged.
- `CoverIconPreviewDialog` gets optional `canApply` / `isCurrent` / `onApply` props passed down from the picker; when `canApply` is false it renders the current add/remove control.
- No pricing, entitlement, checkout, or sync logic changes.
