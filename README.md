# Zan-F Digital Business Card System

Employee e-cards at `zanf.in/card/[slug]`, managed from a password-protected
admin panel at `zanf.in/card/admin`. Built with Next.js (App Router),
Supabase, and deployed on Vercel.

## 1. Set up Supabase

1. Create a project at supabase.com (or use your existing one).
2. Open the SQL Editor and run `supabase/schema.sql`, then `supabase/seed.sql`
   (the seed file creates your own card, "Ferose R Salahudeen").
3. Go to **Storage** and create a bucket named `employee-photos`, set to
   **Public**. If `schema.sql`'s bucket insert didn't apply, this manual
   step covers it.
4. Go to **Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret - never expose it in the browser)

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...          # pick a strong password for /card/admin
ADMIN_SESSION_SECRET=...    # any long random string
NEXT_PUBLIC_SITE_URL=https://www.zanf.in
```

## 3. Run locally

```
npm install
npm run dev
```

Visit `http://localhost:3000/card/ferose-r-salahudeen` for your own card,
and `http://localhost:3000/card/admin` for the admin panel.

## 4. Deploy to Vercel

Push this folder to a GitHub repo, import it in Vercel, and add the same
environment variables from `.env.local` in the Vercel project settings.
Point `zanf.in/card` at this deployment (or deploy it as its own subdomain
and reverse-proxy `/card` to it, depending on how the rest of zanf.in is
hosted).

## What's included

- `/card/[slug]` - the public card page: photo, name, designation, tap-to-call,
  tap-to-WhatsApp, email, website, address with a Maps link, Save Contact
  (.vcf download), Share (native share sheet), and a QR code. Deactivated
  employees see a "no longer with the company" fallback that pulls its
  contact number from the editable company settings - no hardcoded number.
- `/card/admin` - password-protected admin: add/edit/deactivate/delete
  employees, upload a photo, set a custom slug, and edit the company-wide
  fallback contact and slogan. Every save publishes instantly - no redeploy.
- `/api/qr/[slug]` - generates each card's QR code PNG (used on the card page
  and as the admin's "Download QR" button).
- `supabase/schema.sql` - table definitions and Row Level Security policies
  (public read-only; all writes go through the server-side admin routes using
  the service role key).

## Phase 2 ideas (not built yet)

- View-count analytics is already tracked in the `employees.view_count`
  column and incremented on every card visit - a small dashboard chart
  could be added later.
- Multiple card templates (sales vs. technical staff).
- Bilingual English/Hindi toggle.
