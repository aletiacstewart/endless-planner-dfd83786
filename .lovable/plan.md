Update the four "Home"/"Back home" links inside the planner so they return to the planner dashboard (`/app`) instead of the marketing landing page (`/`).

Edits:
- `src/pages/Section.tsx` line 27: `to="/"` → `to="/app"`
- `src/pages/Section.tsx` line 46: `to="/"` → `to="/app"`
- `src/pages/Entry.tsx` line 46: `to="/"` → `to="/app"`
- `src/pages/Settings.tsx` line 91: `to="/"` → `to="/app"`

No other changes. Marketing Landing at `/` is untouched.