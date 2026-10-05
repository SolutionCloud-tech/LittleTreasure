import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { StatusPill } from "@/components/admin/StatusPill";
import { updateOrderStatusAction } from "@/lib/actions";
import { getOrder } from "@/lib/data/store";
import { formatDateTime, formatPrice, whatsappLink } from "@/lib/format";
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  pending_payment: { status: "paid", label: "Payment received" },
  paid: { status: "ready", label: "Packed · ready" },
  ready: { status: "completed", label: "Collected / delivered" },
};

function messages(o: Order) {
  const first = o.customer.name.split(" ")[0];
  const ref = `LT${o.number}`;
  return [
    {
      label: "Payment reminder",
      text: `Hi ${first}! Just a reminder that order ${ref} (${formatPrice(o.total)}) is reserved for you. Please send proof of payment when you can 😊`,
    },
    { label: "Payment received", text: `Thanks ${first}, payment for ${ref} received! We'll let you know as soon as it's packed.` },
    o.fulfilment === "collect"
      ? { label: "Ready to collect", text: `Hi ${first}! Your order ${ref} is packed and ready to collect 🎉` }
      : {
          label: "Sent to PUDO",
          text: `Hi ${first}! Your order ${ref} is on its way to your PUDO locker. You'll get an SMS with the collection code.`,
        },
  ];
}

export default async function OrderDetail({ params }: PageProps<"/admin/orders/[id]">) {
  const order = await getOrder((await params).id);
  if (!order) notFound();
  const next = NEXT[order.status];
  const open = order.status !== "completed" && order.status !== "cancelled";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Orders
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight">LT{order.number}</h1>
            <StatusPill status={order.status} />
          </div>
          <p className="mt-1 text-ink-soft">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        {open && (
          <div className="flex flex-wrap gap-2">
            <StatusButton id={order.id} status="cancelled" className="btn-ghost text-coral-deep">
              Cancel & restock
            </StatusButton>
            {next && (
              <StatusButton id={order.id} status={next.status} className="btn-primary">
                Mark as: {next.label}
              </StatusButton>
            )}
          </div>
        )}
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <ul className="divide-y divide-line-soft">
              {order.lines.map((l) => (
                <li key={l.variantId} className="flex items-center gap-4 p-4 sm:px-6">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand-deep">
                    <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{l.productName}</p>
                    <p className="text-sm text-ink-soft">
                      {l.variantName} · {formatPrice(l.unitPrice)} × {l.quantity}
                      {l.preorder && <span className="ml-2 text-xs font-semibold text-pre">Pre-order</span>}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatPrice(l.unitPrice * l.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line-soft bg-sand/40 p-4 text-sm sm:px-6">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{order.fulfilment === "courier" ? "PUDO courier" : "Collection"}</dt>
                <dd>{order.shipping ? formatPrice(order.shipping) : "Free"}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-semibold">History</h2>
            <ol className="mt-4 space-y-4 border-l-2 border-line-soft pl-5">
              {order.history.map((h, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute top-1 -left-[27px] size-3 rounded-full ring-4 ring-white ${
                      i === order.history.length - 1 ? "bg-sea" : "bg-line"
                    }`}
                  />
                  <p className="text-sm font-medium">{ORDER_STATUS_LABELS[h.status]}</p>
                  <p className="text-xs text-ink-muted">{formatDateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-4 p-5 sm:p-6">
            <h2 className="font-semibold">Customer</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-ink-soft">{order.customer.phone}</p>
              {order.customer.email && <p className="text-ink-soft">{order.customer.email}</p>}
            </div>
            <div className="space-y-1 border-t border-line-soft pt-4 text-sm">
              <p className="eyebrow">Delivery</p>
              <p>{order.fulfilment === "courier" ? `PUDO: ${order.customer.address ?? ""}` : "Collection"}</p>
              <p className="eyebrow pt-2">Payment</p>
              <p>{order.payment === "eft" ? "EFT" : "Cash on collection"}</p>
              {order.note && (
                <>
                  <p className="eyebrow pt-2">Note</p>
                  <p className="text-ink-soft">{order.note}</p>
                </>
              )}
            </div>
          </section>

          <section className="card space-y-3 p-5 sm:p-6">
            <h2 className="font-semibold">Message on WhatsApp</h2>
            <p className="text-xs text-ink-muted">Opens WhatsApp with the message ready to send.</p>
            {messages(order).map((m) => (
              <a
                key={m.label}
                href={whatsappLink(order.customer.phone, m.text)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-sm font-medium transition hover:border-[#1f9d55] hover:text-[#188046]"
              >
                <MessageCircle className="size-4 text-[#1f9d55]" /> {m.label}
              </a>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusButton({
  id,
  status,
  className,
  children,
}: {
  id: string;
  status: OrderStatus;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <form action={updateOrderStatusAction}>
      <input type="hidden" name="orderId" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={className}>{children}</button>
    </form>
  );
}
