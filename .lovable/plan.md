# Change of Life Planner — Mobile App Plan

A mobile-first, installable web app version of your planner. Every page is fillable, you can tap "Add another" to create a fresh copy of any page, and everything saves automatically on the device.

## What you'll get

- A clean, modern mobile UI inspired by the planner (no PDF replica)
- All planner sections rebuilt as digital, fillable pages
- Manual **"+ Add another"** button on each section to spawn a new blank entry
- Auto-save to the phone (no login, no internet needed)
- Installable to the home screen on iPhone & Android (Add to Home Screen)
- Export / share an entry as PDF or text (so nothing is ever truly stuck)
- Light + dark mode

## App structure

```text
Home (Dashboard)
├── Section list (one card per planner section)
│   ├── Goals & Vision
│   ├── Daily Reflection
│   ├── Weekly Planner
│   ├── Monthly Review
│   ├── Habit Tracker
│   ├── Gratitude
│   ├── Notes / Journal
│   └── …(final list confirmed from your PDF on first build pass)
│
└── Each section screen:
    ├── List of saved entries (newest first, with date + preview)
    ├── [+ Add another] button → new blank page of that type
    └── Tap entry → full editable page
        ├── All fields from the PDF page
        ├── Auto-save on every change
        ├── Duplicate / Delete / Export buttons
```

## Page types & fields

Because the PDF parser couldn't open your file in this mode, I'll extract the section list and every field on the very first build step (open the PDF, list pages, map each unique page layout to a "page type" with its fields — text inputs, checkboxes, date pickers, rating scales, long-form text, etc.).

You'll get a quick confirmation list of detected page types before I wire them up, so nothing is missed or misnamed.

## Saving & data

- All entries stored in the browser's **IndexedDB** (survives app restarts, works offline)
- Each entry: `{ id, pageType, createdAt, updatedAt, fields }`
- Auto-save fires ~500ms after you stop typing
- **Export per entry**: download as PDF or plain text
- **Backup all data**: one-tap export of a `.json` file you can email to yourself; matching "Restore from file" import
- No account, no server, no tracking

## Add-another behavior

- Each page type has a `[+ Add another <Page Name>]` button at the top of its section
- Tapping it creates a fresh blank entry, opens it immediately, and adds it to the list
- Old entries remain untouched and editable

## Look & feel

- Mobile-first layout, large touch targets, single column
- Soft, calm palette inspired by the planner (will pull dominant colors from the PDF)
- Rounded cards, generous spacing, friendly serif headings + clean sans body
- Smooth transitions between list ↔ entry
- Dark mode toggle

## Installable (PWA-lite)

Per Lovable's guidance, a full service-worker PWA can interfere with the editor preview. Recommended approach:

- Add a **web app manifest** (`manifest.json`) with name, icons, theme color, and `display: "standalone"`
- Add iOS/Android meta tags so "Add to Home Screen" gives a real app-like launch (no browser chrome)
- **No service worker** — keeps the editor preview reliable. The app still works offline for already-loaded sessions because all data is local; users just need internet on first open.
- If you later want true offline-first, we can add a guarded service worker as a follow-up.

## Build steps

1. **Extract planner content** — open the PDF, list every page, identify unique page layouts and their fields. Confirm the list with you.
2. **Design system** — set colors, typography, spacing tokens in `index.css` + `tailwind.config.ts` based on the planner's palette.
3. **Data layer** — IndexedDB wrapper (via `idb` library), typed entry schema, auto-save hook.
4. **Routing & shell** — Home, Section, Entry routes; bottom nav or back-button header.
5. **Page-type renderer** — one configurable component that renders any page type from a JSON schema (so adding/changing fields later is trivial).
6. **Sections & entries UI** — list views, "+ Add another", entry editor, delete/duplicate.
7. **Export** — per-entry PDF (using `jspdf`) and full JSON backup/restore.
8. **Installability** — manifest, icons (generated from the planner cover), iOS meta tags, install hint screen.
9. **Polish** — empty states, animations, dark mode, mobile QA at 375px and 414px widths.

## Technical notes

- Stack: existing React + Vite + Tailwind + shadcn/ui
- Storage: `idb` (IndexedDB wrapper) — no Lovable Cloud needed
- PDF export: `jspdf` + `jspdf-autotable`
- Routing: existing `react-router-dom`, add `/section/:id` and `/entry/:id`
- Forms: `react-hook-form` with Zod for validation, debounced auto-save
- Icons: `lucide-react` (already available)
- No backend, no auth, no network calls after first load

## Out of scope (can add later)

- Cloud sync / multi-device
- Reminders / notifications
- Sharing entries with others
- Full offline service worker

Approve this and I'll start by extracting the planner's pages and fields, then confirm the page-type list with you before building the UI.