Add an admin access link to the bottom of the app's home page.

**What**
- Append a small, unobtrusive "Admin Login" link at the very bottom of the `Home` page (inside `/app`) that navigates to `/admin-planner?key=let-me-in-2026`.
- Style it subtly (small, muted text) so it doesn't distract regular users.

**Where**
- `src/pages/Home.tsx` — add a `<Link>` inside the bottom of `<main>` or just after it.

**Why**
- The owner currently needs to remember and manually type the full `/admin-planner?key=let-me-in-2026` URL to unlock the test planner. A link on the home page makes this a single click.

**Implementation details**
- Use the existing `Link` import from `react-router-dom`.
- No new dependencies.
- No database or auth changes.