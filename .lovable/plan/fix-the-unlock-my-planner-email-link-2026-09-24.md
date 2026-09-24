# Fix the "Unlock my planner" email link

## What's wrong
The purchase email builds its link from the address of the payment system's server, not your website. So the link opens a backend address and shows "requested path is invalid" instead of your planner.

## What changes
- Unlock links in purchase emails (planner and extra covers) will point to the website where the customer checked out: the preview while testing, and your live site for real customers.
- If that address can't be found, the link falls back to your live domain, https://brandedbydigital.com.
- The same fix applies to the "Resend my code" email.

## Your existing test email
The link in the email you already received is still broken. After the fix, you can open it by replacing the start of the address with your site's address, or by using "Resend my code".

## Technical details
- `payments-webhook/index.ts`: stop using `https://${url.host}` as a fallback. In `fulfill()`, get the origin from `new URL(session.return_url).origin` (the embedded checkout sets `return_url`), and fall back to the `SITE_URL` constant `https://brandedbydigital.com`.
- `finalize-purchase` and `resend-unlock-code`: use the request `origin` header, and fall back to the same constant when it's empty.
- Redeploy all three functions. Then do a test purchase and confirm the email link opens `/unlock` on the site.
