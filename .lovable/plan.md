I’ll add a safe owner-only way for you to open and test the planner without going through the purchase homepage.

Implementation plan:

1. Add an admin/test unlock route
   - Create a route like `/admin-planner` or `/admin/unlock`.
   - Visiting it will unlock the main planner locally on that device and send you straight to `/app`.
   - This keeps the public homepage purchase flow intact for customers.

2. Protect it so it is not an obvious customer path
   - Use a simple shared test key in the URL, for example `/admin-planner?key=...`.
   - If the key is missing or wrong, show a friendly “not found / unavailable” message or redirect home.
   - This is not meant to be high-security admin auth, but it prevents casual public discovery and avoids exposing a visible admin button.

3. Add clear owner instructions in the app/docs
   - Document the exact URL you can use whenever you want to test the planner.
   - Include the manual fallback: if needed, use the normal `/unlock?code=...` path with a test purchase code.

4. Optional cleanup for your testing experience
   - If you want, the admin route can also unlock all cover/icon packs locally so you can test every cover and icon set without buying each pack.
   - I’ll default to unlocking the main planner only unless you want all packs included for admin testing.

Technical details:

- Current app behavior blocks all planner routes unless local storage contains `planner-unlock:wellness-journey`.
- The homepage now correctly acts as the sales/purchase landing page.
- The admin test route will set that local unlock value via the existing `setUnlocked("wellness-journey", ...)` helper, then navigate to `/app`.
- No database change is required for the quickest test route.
- If you prefer a real backend-owned test code instead, I can create a test purchase/unlock code in Lovable Cloud, but the local admin route is faster and easier for ongoing preview testing.