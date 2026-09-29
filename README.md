# UNAU Kyambogo website

Official website of the **United Nations Association of Uganda, Kyambogo University Chapter**:
*Global Goals. Local Action.*

- **Public site:** home, about and team, projects and impact, executive applications (`/apply`)
- **UNAU TreeMap:** map every tree planted, with photos, a leaderboard and GreenBot care advice
- **Admin** at `/admin` (not linked publicly): applications, projects, team, tree moderation, site settings

Stack: Vite + React + TypeScript, Tailwind and shadcn/ui, Supabase (Postgres, Auth, Storage, Edge Functions), Leaflet, Gemini (server-side only).

## Running it

```sh
npm install
npm run dev          # uses your real Supabase project from .env
npm run dev:local    # uses a local Supabase stack (see below)
```

`.env` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Never put secret keys in a `VITE_` variable, because those are bundled into the public site.

### Local Supabase (Docker)

```sh
supabase start -x studio,imgproxy,mailpit,logflare,vector,supavisor,realtime,postgres-meta,edge-runtime
```

Then create `.env.localstack.local` with the local API URL and anon key that `supabase status` prints:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<local anon key>
```

## Deploying database changes

Migrations live in `supabase/migrations`. To apply them to the live project:

```sh
supabase link --project-ref <project-ref>
supabase db push
```

## Admins

Nobody can make themselves an admin from the website. After the person signs up, run this in the Supabase SQL editor:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'their-email@example.com';
```

Every admin-only table is protected by row-level security (`public.is_admin()`), so hiding the `/admin` link is a convenience, not the protection.

## GreenBot (AI)

GreenBot runs in the `greenbot` Edge Function so the Gemini key never reaches the browser:

```sh
supabase secrets set GEMINI_API_KEY=<key>
supabase functions deploy greenbot
```

Only signed-in users can call it.
