import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { ClearCart } from "@/components/shop/ClearCart";
import { getOrder } from "@/lib/data/store";
import { formatPrice, relativeDay } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order placed" };

// Demo banking details. In the real shop these come from settings.
const BANK = [
  ["Bank", "FNB"],
  ["Account name", "Little Treasures"],
  ["Account number", "62 000 000 000"],
  ["Branch code", "250655"],
];
const SHOP_WHATSAPP = "27820000000";

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[id]">) {
  const order = await getOrder((await params).id);
  if (!order) notFound();
  const { placed } = await searchParams;
  const ref = `LT${order.number}`;
  const waText = `Hi! Proof of payment for order ${ref} (${formatPrice(order.total)}).`;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
      {placed && <ClearCart />}
      <div className="animate-rise space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-14 text-ok" strokeWidth={1.5} />
        <p className="eyebrow">Order {ref}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-balance">
          Thank you, {order.customer.name.split(" ")[0]}! Your items are reserved.
        </h1>
        <p className="mx-auto max-w-lg text-ink-soft">
          {order.payment === "eft"
            ? "Pay by EFT using your order number as the reference, then send us the proof of payment on WhatsApp."
            : "Pay cash when you collect. We'll WhatsApp you as soon as it's ready."}
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {order.payment === "eft" && (
          <section className="card space-y-4 p-6">
            <h2 className="font-semibold">EFT details</h2>
            <dl className="space-y-2 text-sm">
              {BANK.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 rounded-lg bg-sun/20 px-2 py-1.5 -mx-2">
                <dt className="font-semibold">Reference</dt>
                <dd className="font-bold">{ref}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-3">
                <dt className="font-semibold">Amount</dt>
                <dd className="text-lg font-bold">{formatPrice(order.total)}</dd>
              </div>
            </dl>
            <a
              href={`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(waText)}`}
              className="btn w-full bg-[#1f9d55] text-white hover:bg-[#188046]"
            >
              <MessageCircle className="size-4" /> Send proof of payment
            </a>
          </section>
        )}

        <section className={`card space-y-4 p-6 ${order.payment === "eft" ? "" : "sm:col-span-2"}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your order</h2>
            <span className="rounded-full bg-low-tint px-2.5 py-1 text-xs font-semibold text-low">
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <ul className="space-y-3">
            {order.lines.map((l) => (
              <li key={l.variantId} className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sand-deep">
                  <Image src={l.image} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{l.productName}</p>
                  <p className="text-ink-soft">
                    {l.variantName} × {l.quantity}
                    {l.preorder && <span className="ml-1.5 font-semibold text-pre">Pre-order</span>}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPrice(l.unitPrice * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">{order.fulfilment === "courier" ? "PUDO courier" : "Collection"}</span>
              <span>{order.shipping ? formatPrice(order.shipping) : "Free"}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
          <p className="text-xs text-ink-muted">Placed {relativeDay(order.createdAt)}</p>
        </section>
      </div>

      <div className="mt-10 text-center">
        <Link href="/" className="btn-ghost">Keep shopping</Link>
      </div>
    </div>
  );
}
