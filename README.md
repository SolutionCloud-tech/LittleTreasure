# Little Treasures

Proof of concept for a small online shop, built to replace selling through WhatsApp posts.
It has two halves:

- **Shop** (`/`): product pages with live stock per colour/design, "only N left" and
  pre-order badges, a cart, and a one-page checkout (collect or PUDO courier, EFT or cash).
- **Customer accounts** (`/account`): optional sign-up and sign-in. Signed-in customers get
  checkout filled in, and see their orders and can edit their details on `/account`.
  Guest checkout still works. Demo customer: `thandi@example.com` / `demo1234`.
- **Admin** (`/admin`): sales dashboard, today's to-do list (payments to check, orders to
  pack, pre-orders arriving, low stock), order management with ready-made WhatsApp
  messages, inline stock editing, and an add/edit product form with a live preview.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000, admin at /admin
```

## Deploying a demo (Vercel)

1. Sign in at vercel.com with GitHub and import `SolutionCloud-tech/LittleTreasure`
   (pick the branch with the shop on it if it isn't merged yet).
2. Add an environment variable `AUTH_SECRET` set to a long random string
   (e.g. the output of `openssl rand -hex 32`). The app refuses to start in production
   without it.
3. In the project's **Storage** tab, create a free **Upstash Redis** database and
   connect it to the project. This adds `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
   Without it, each Vercel server instance keeps its own in-memory copy, so orders
   and accounts appear to vanish.
4. Deploy (or redeploy after adding variables). Every push redeploys automatically.

With Redis connected, the whole demo dataset is stored as one JSON document
(`src/lib/data/persist.ts`). Locally, without those variables, it stays in memory.
To reset the live demo to its starting data, delete the `little-treasures:db:v1` key
in the Upstash console.

## How it's put together

- Next.js (App Router) + TypeScript + Tailwind CSS.
- All data goes through `src/lib/data/store.ts`. For the POC it is seeded from
  `src/lib/data/seed.ts` and kept in memory locally (resets on restart) or in Upstash
  Redis when deployed.
  Moving to a real database means re-implementing that one file; nothing else reads data
  directly.
- Mutations are server actions in `src/lib/actions.ts`. Checkout re-checks prices and
  stock on the server and reserves units the moment an order is placed; cancelling an
  order puts the units back.
- Money is stored as whole cents (ZAR).
- Accounts: passwords are hashed with scrypt and a random salt (`src/lib/password.ts`).
  Sessions are an httpOnly, sameSite=lax cookie signed with HMAC-SHA256
  (`src/lib/auth.ts`). Set `AUTH_SECRET` to a long random string in production; dev uses
  a built-in fallback. The admin login can reuse the same helpers with its own cookie and a
  role check.

## Not in the POC yet

Admin login (the customer session helpers are ready to reuse), password reset, photo uploads, card payments (Yoco/PayFast), email/WhatsApp notifications
and a database. The code leaves an obvious place for each.
