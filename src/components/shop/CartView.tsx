"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { checkoutAction, type FormState } from "@/lib/actions";
import { formatPrice, relativeDay } from "@/lib/format";
import type { Product } from "@/lib/types";

export function CartView({ products, shippingFee }: { products: Product[]; shippingFee: number }) {
  const { lines, ready, setQuantity, remove } = useCart();
  const [fulfilment, setFulfilment] = useState<"collect" | "courier">("collect");
  const [state, formAction, pending] = useActionState<FormState, FormData>(checkoutAction, {});

  const rows = lines
    .map((l) => {
      const product = products.find((p) => p.id === l.productId);
      const variant = product?.variants.find((v) => v.id === l.variantId);
      return product && variant ? { ...l, product, variant } : null;
    })
    .filter((r) => r !== null);

  // Forget items that were removed from the shop since they were added.
  useEffect(() => {
    if (!ready) return;
    for (const l of lines) {
      if (!products.some((p) => p.id === l.productId && p.variants.some((v) => v.id === l.variantId))) {
        remove(l.variantId);
      }
    }
  }, [ready, lines, products, remove]);

  if (!ready) return <div className="mt-10 h-64 animate-pulse rounded-3xl bg-sand-deep" />;

  if (!rows.length) {
    return (
      <div className="card mt-8 flex flex-col items-center gap-4 px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold">Your cart is empty</p>
        <p className="max-w-sm text-ink-soft">Stock moves quickly. Have a look at what just arrived.</p>
        <Link href="/#shop" className="btn-primary mt-2">
          Browse the shop <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  const subtotal = rows.reduce((s, r) => s + r.product.price * r.quantity, 0);
  const shipping = fulfilment === "courier" ? shippingFee : 0;
  const hasPreorder = rows.some((r) => r.product.availability === "preorder");
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  return (
    <form action={formAction} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_420px]">
      <input
        type="hidden"
        name="cart"
        value={JSON.stringify(rows.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })))}
      />

      <div className="space-y-8">
        {/* Items */}
        <ul className="card divide-y divide-line-soft" aria-label="Items in your cart">
          {rows.map((r) => {
            const over = r.quantity > r.variant.stock;
            return (
              <li key={r.variantId} className="flex gap-4 p-4 sm:p-5">
                <Link
                  href={`/products/${r.product.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-sand-deep sm:size-28"
                >
                  <Image src={r.variant.image ?? r.product.image} alt="" fill sizes="112px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{r.product.name}</p>
                      <p className="text-sm text-ink-soft">{r.variant.name}</p>
                      {r.product.availability === "preorder" && (
                        <p className="mt-1 text-xs font-semibold text-pre">
                          Pre-order · arrives {r.product.preorderEta ? relativeDay(r.product.preorderEta) : "soon"}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold tabular-nums">{formatPrice(r.product.price * r.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex h-11 items-center rounded-full border border-line sm:h-9">
                      <button
                        type="button"
                        aria-label={`One fewer ${r.variant.name}`}
                        onClick={() => setQuantity(r.variantId, r.quantity - 1)}
                        className="grid size-11 place-items-center text-ink-soft hover:text-ink sm:size-9"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{r.quantity}</span>
                      <button
                        type="button"
                        aria-label={`One more ${r.variant.name}`}
                        disabled={r.quantity >= r.variant.stock}
                        onClick={() => setQuantity(r.variantId, r.quantity + 1)}
                        className="grid size-11 place-items-center text-ink-soft hover:text-ink disabled:opacity-30 sm:size-9"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(r.variantId)}
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted hover:text-coral-deep"
                    >
                      <Trash2 className="size-4" /> Remove
                    </button>
                  </div>
                  {over && (
                    <p className="text-xs font-semibold text-coral-deep">
                      {r.variant.stock === 0 ? "This just sold out." : `Only ${r.variant.stock} left, please reduce the quantity.`}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Details */}
        <section className="card space-y-6 p-5 sm:p-7">
          <div>
            <h2 className="font-display text-2xl font-semibold">Your details</h2>
            <p className="mt-1 text-sm text-ink-soft">We&apos;ll confirm your order and send updates on WhatsApp.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="name" defaultValue={v.name} error={fe.name} autoComplete="name" />
            <Field label="WhatsApp number" name="phone" defaultValue={v.phone} error={fe.phone} autoComplete="tel" placeholder="082 123 4567" inputMode="tel" />
            <Field label="Email (optional)" name="email" defaultValue={v.email} type="email" autoComplete="email" className="sm:col-span-2" />
          </div>

          <div className="space-y-3">
            <p className="label">How would you like to get it?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Option
                name="fulfilment"
                value="collect"
                checked={fulfilment === "collect"}
                onChange={() => setFulfilment("collect")}
                title="Collect"
                price="Free"
                text="We'll WhatsApp you when it's ready to collect."
              />
              <Option
                name="fulfilment"
                value="courier"
                checked={fulfilment === "courier"}
                onChange={() => setFulfilment("courier")}
                title="PUDO locker"
                price={formatPrice(shippingFee)}
                text="Courier to a locker near you, 2–4 working days."
              />
            </div>
          </div>

          {fulfilment === "courier" && (
            <Field
              label="Which PUDO locker or address?"
              name="address"
              defaultValue={v.address}
              error={fe.address}
              placeholder="e.g. Engen Main Road, or your street address"
            />
          )}

          <div className="space-y-3">
            <p className="label">Payment</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Option name="payment" value="eft" defaultChecked title="EFT" text="Banking details on the next screen." />
              <Option
                name="payment"
                value="cash_on_collection"
                disabled={fulfilment !== "collect"}
                title="Cash on collection"
                text={fulfilment === "collect" ? "Pay when you pick it up." : "Only for collections."}
              />
            </div>
            <p className="text-xs text-ink-muted">Card payments (Yoco or PayFast) can be switched on here later.</p>
          </div>

          <div>
            <label className="label" htmlFor="note">Anything we should know? (optional)</label>
            <textarea id="note" name="note" rows={2} defaultValue={v.note} className="field" placeholder="Gift, preferred colour backup, collection time…" />
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="card space-y-5 p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl font-semibold">Summary</h2>
        <dl className="space-y-3 text-sm">
          <Row label={`Subtotal (${rows.reduce((s, r) => s + r.quantity, 0)} items)`} value={formatPrice(subtotal)} />
          <Row label={fulfilment === "courier" ? "PUDO courier" : "Collection"} value={shipping ? formatPrice(shipping) : "Free"} />
          <div className="flex items-baseline justify-between border-t border-line pt-4 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="text-2xl font-bold tracking-tight tabular-nums">{formatPrice(subtotal + shipping)}</dd>
          </div>
        </dl>
        {hasPreorder && (
          <p className="rounded-xl bg-pre-tint/70 p-3 text-xs leading-relaxed text-pre">
            Your cart includes pre-order items. They&apos;re reserved for you now and sent as soon as they land.
          </p>
        )}
        {state.error && (
          <p className="flex gap-2 rounded-xl bg-coral-tint p-3 text-sm font-medium text-coral-deep" role="alert">
            <AlertCircle className="size-4 shrink-0 translate-y-0.5" aria-hidden /> {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-accent h-13 w-full text-base">
          {pending ? <Loader2 className="size-5 animate-spin" /> : null}
          {pending ? "Placing order…" : `Place order · ${formatPrice(subtotal + shipping)}`}
        </button>
        <p className="text-center text-xs text-ink-muted">No account needed. Your items are held once you place the order.</p>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  className = "",
  ...rest
}: { label: string; name: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        className={`field ${error ? "border-coral focus:border-coral focus:ring-coral/10" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-coral-deep">
          {error}
        </p>
      )}
    </div>
  );
}

function Option({
  title,
  text,
  price,
  ...input
}: { title: string; text: string; price?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={`relative flex cursor-pointer gap-3 rounded-2xl border border-line bg-white p-4 transition has-checked:border-ink has-checked:bg-sand has-checked:ring-1 has-checked:ring-ink has-disabled:cursor-not-allowed has-disabled:opacity-50 hover:border-ink/30`}
    >
      <input type="radio" className="mt-0.5 size-4 accent-ink" {...input} />
      <span className="flex-1">
        <span className="flex items-center justify-between gap-2 font-semibold">
          {title}
          {price && <span className="text-sm text-ink-soft">{price}</span>}
        </span>
        <span className="mt-0.5 block text-sm text-ink-soft">{text}</span>
      </span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
