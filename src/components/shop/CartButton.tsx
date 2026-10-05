"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export function CartButton() {
  const { count, pulse } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex h-11 items-center gap-2 rounded-full bg-ink pr-4 pl-3.5 text-sm font-semibold text-sand transition hover:bg-sea-deep"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      <ShoppingBag className="size-[18px]" strokeWidth={2} />
      <span className="hidden sm:inline">Cart</span>
      <span
        key={pulse}
        className={`grid min-w-6 place-items-center rounded-full px-1.5 text-xs tabular-nums ${
          count ? "bg-sun text-ink" : "bg-white/15 text-sand/80"
        } ${pulse ? "animate-[rise_.4s_ease-out]" : ""}`}
      >
        {count}
      </span>
    </Link>
  );
}
