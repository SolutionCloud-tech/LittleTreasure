# Little Treasures

Proof of concept for a small online shop, built to replace selling through WhatsApp posts.
It has two halves:

- **Shop** (`/`): product pages with live stock per colour/design, "only N left" and
  pre-order badges, a cart, and a one-page checkout (collect or PUDO courier, EFT or cash).
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

## Not in the POC yet

Admin login, photo uploads, card payments (Yoco/PayFast), email/WhatsApp notifications
and a database. The code leaves an obvious place for each.
