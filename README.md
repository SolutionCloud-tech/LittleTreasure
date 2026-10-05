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

## How it's put together

- Next.js (App Router) + TypeScript + Tailwind CSS.
- All data goes through `src/lib/data/store.ts`. For the POC it is an in-memory store
  seeded from `src/lib/data/seed.ts`, so **changes reset when the server restarts**.
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
