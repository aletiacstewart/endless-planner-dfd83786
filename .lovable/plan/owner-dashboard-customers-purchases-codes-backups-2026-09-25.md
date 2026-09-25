# Owner Dashboard: customers, purchases, codes, backups

A private page at `/admin/dashboard`. Only the admin account (aletiacstewart@gmail.com) can open it. Everyone else sees "Not available".

## What you'll see

1. **Summary cards**: active members, canceled members, monthly revenue from memberships, covers sold this month, and new customers this month.
2. **Customers table**, searchable by email:
   - Email, the date they joined, and membership status (active, past due, canceled, or none)
   - When the current period started, the next renewal date, and whether it cancels at the end of the period
   - How many months they've paid, based on how long the membership has run
   - How many covers they own, and when the planner was last backed up to the cloud
3. **Customer detail drawer** (opens when you click a row):
   - **Membership**: plan, status, start date, renewal date, and cancel status
   - **Planner unlock codes**: each code, its date, and the devices that used it (with device count out of 5)
   - **Covers purchased**: cover name, date, unlock code, and whether it came with the membership or was bought on its own
   - **Backup and sync**: number of cloud pages, last sync time, settings last saved, and deleted pages (restorable)
   - **Restores**: a history of backup-file restores
   - **Actions**: resend unlock email, and copy a code
4. **Purchases feed**: every membership and cover purchase, newest first, with date, email, what was bought and the code. You can filter by live or test purchases.

## Technical details

- **New table `admin_events`** (user_id, email, kind: `backup_export` | `backup_restore` | `pdf_export`, detail jsonb, created_at). Grants go to authenticated and service_role. RLS lets a user insert only their own rows, and only admins can select them. The client logs an event in `exportAll`, `importAll`, and the PDF export.
- **New edge function `admin-dashboard`**:
  - It checks the JWT and then `has_role(uid,'admin')`. It uses the service role to read `profiles`, `subscriptions`, `purchases`, `pack_purchases`, `user_packs`, `user_planner_unlocks`, `device_activations`, `planner_entries` (count, max updated_at, deleted count), `user_settings.updated_at`, and `admin_events`.
  - It returns data for two actions: `overview` and `customer` (by user_id or email).
  - Revenue is estimated from active subscriptions × $21.97, plus pack purchases from Stripe amounts when available. Otherwise it counts packs at $5 with the tier discount.
- **New page `src/pages/AdminDashboard.tsx`**: route in `App.tsx`, gated by `useEntitlements().admin`. It uses the existing card and table components with semantic tokens. On phones the table stacks into cards. The existing Admin page gets a link to it.
- **Test/live toggle**: it filters on the `environment` column.
- **Before building**: confirm that aletiacstewart@gmail.com has the admin role row. If it's missing, add it.
