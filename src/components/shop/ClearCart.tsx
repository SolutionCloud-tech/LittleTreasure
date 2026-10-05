"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

/** Empties the cart once an order has been placed, then removes the ?placed flag from the URL. */
export function ClearCart() {
  const { clear, ready } = useCart();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (!ready) return;
    clear();
    router.replace(path, { scroll: false });
  }, [ready, clear, router, path]);
  return null;
}
