"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { productAvailability, variantAvailability } from "@/lib/availability";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AvailabilityBadge } from "./AvailabilityBadge";

export function ProductPurchase({ product }: { product: Product }) {
  const { add, lines } = useCart();
  const firstAvailable = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;
  const inCart = lines.find((l) => l.variantId === variant?.id)?.quantity ?? 0;
  const canAdd = Math.max(0, (variant?.stock ?? 0) - inCart);
  const info = productAvailability(product);
  const vInfo = variant ? variantAvailability(product, variant) : info;
  const preorder = product.availability === "preorder";

  function choose(id: string) {
    setVariantId(id);
    setQty(1);
  }

  function addToCart() {
    if (!variant || qty > canAdd) return;
    add({ productId: product.id, variantId: variant.id, quantity: qty });
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 2400);
  }

  return (
    <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
      {/* Gallery */}
      <div className="md:sticky md:top-28 md:self-start">
        <div className="relative aspect-square overflow-hidden rounded-[28px] border border-line bg-white shadow-card">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          {variant?.image && (
            <div
              key={variant.id}
              className="animate-rise absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/95 p-2 pr-4 shadow-lift backdrop-blur"
            >
              <div className="relative size-16 overflow-hidden rounded-xl bg-sand-deep">
                <Image src={variant.image} alt={variant.name} fill sizes="64px" className="object-cover" />
              </div>
              <div>
                <p className="eyebrow">Selected</p>
                <p className="text-sm font-semibold">{variant.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <AvailabilityBadge info={info} />
            {info.detail && <span className="text-sm font-medium text-ink-muted">{info.detail}</span>}
          </div>
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
            {product.name}
          </h1>
          <p className="text-lg text-ink-soft">{product.tagline}</p>
          <p className="text-3xl font-bold tracking-tight">{formatPrice(product.price)}</p>
        </div>

        {preorder && (
          <div className="rounded-2xl border border-pre/15 bg-pre-tint/60 p-4 text-sm leading-relaxed text-ink">
            <p className="font-semibold text-pre">This is a pre-order</p>
            <p className="mt-1 text-ink-soft">
              Your item is reserved as soon as you check out. We&apos;ll WhatsApp you the moment the
              stock lands so you can collect, or we&apos;ll courier it straight away.
            </p>
          </div>
        )}

        {/* Variant picker */}
        <div role="radiogroup" aria-labelledby="variant-label" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <p id="variant-label" className="text-sm font-semibold">
              {product.variants.some((v) => v.swatch) ? "Colour" : "Choose"}:{" "}
              <span className="font-normal text-ink-soft">{variant?.name}</span>
            </p>
            {variant && <AvailabilityBadge info={vInfo} size="sm" />}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const selected = v.id === variant?.id;
              const out = v.stock === 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => choose(v.id)}
                  disabled={out}
                  role="radio"
                  aria-checked={selected}
                  className={`group relative inline-flex h-11 items-center gap-2 rounded-full border pr-4 text-sm font-medium transition ${
                    v.swatch ? "pl-1.5" : "pl-4"
                  } ${
                    selected
                      ? "border-ink bg-ink text-sand"
                      : "border-line bg-white text-ink hover:border-ink/40"
                  } ${out ? "cursor-not-allowed text-ink-muted line-through opacity-60" : ""}`}
                >
                  {v.swatch && (
                    <span
                      className={`size-8 rounded-full ring-1 ${selected ? "ring-white/40" : "ring-black/10"}`}
                      style={{ background: v.swatch }}
                    />
                  )}
                  {v.name}
                  {!out && v.stock <= product.lowStockThreshold && (
                    <span className={`text-xs font-semibold ${selected ? "text-sun" : "text-low"}`}>
                      {v.stock} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity + add */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-stretch gap-3">
            <div className="flex h-12 items-center rounded-full border border-line bg-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="grid size-12 place-items-center rounded-full text-ink-soft transition hover:text-ink disabled:opacity-30"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(canAdd, q + 1))}
                disabled={qty >= canAdd}
                className="grid size-12 place-items-center rounded-full text-ink-soft transition hover:text-ink disabled:opacity-30"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={canAdd === 0}
              className={`h-12 flex-1 ${added ? "btn bg-ok text-white" : "btn-accent"} min-w-[220px] text-[15px]`}
            >
              {added ? (
                <>
                  <Check className="size-5" /> Added to cart
                </>
              ) : canAdd === 0 && variant && variant.stock > 0 ? (
                "All available units are in your cart"
              ) : canAdd === 0 ? (
                "Sold out"
              ) : (
                <>
                  <ShoppingBag className="size-[18px]" />
                  {preorder ? "Pre-order" : "Add to cart"} · {formatPrice(product.price * qty)}
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-ink-muted">
            {inCart > 0 ? (
              <>
                You have {inCart} in your cart.{" "}
                <Link href="/cart" className="font-semibold text-sea underline-offset-4 hover:underline">
                  Go to checkout
                </Link>
              </>
            ) : variant && variant.stock > 0 ? (
              <>{vInfo.label}. Units are held for you at checkout.</>
            ) : null}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-5 border-t border-line pt-8">
          <p className="leading-relaxed text-ink-soft">{product.description}</p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {product.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm font-medium">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sea-tint text-sea">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
