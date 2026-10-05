import type { Metadata } from "next";
import { CartView } from "@/components/shop/CartView";
import { currentUser } from "@/lib/auth";
import { listProducts, SHIPPING_FEE } from "@/lib/data/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const [products, user] = await Promise.all([listProducts(), currentUser()]);
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Your cart</h1>
      <CartView products={products} shippingFee={SHIPPING_FEE} user={user} />
    </div>
  );
}
