import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { StatusPill } from "@/components/admin/StatusPill";
import { listOrders } from "@/lib/data/store";
import { formatDateTime, formatPrice, whatsappLink } from "@/lib/format";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

export const metadata = { title: "Orders" };

const TABS: (OrderStatus | "all")[] = ["all", "pending_payment", "paid", "ready", "completed", "cancelled"];

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { status } = await searchParams;
  const active = TABS.includes(status as OrderStatus) ? (status as OrderStatus) : "all";
  const all = await listOrders();
  const orders = active === "all" ? all : all.filter((o) => o.status === active);
  const count = (s: OrderStatus | "all") => (s === "all" ? all.length : all.filter((o) => o.status === s).length);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-ink-soft">Every order from the shop, newest first.</p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex gap-1 rounded-2xl bg-admin-well p-1">
          {TABS.map((t) => (
            <Link
              key={t}
              href={t === "all" ? "/admin/orders" : `/admin/orders?status=${t}`}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium whitespace-nowrap transition ${
                active === t ? "bg-white text-ink shadow-card" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t === "all" ? "All" : ORDER_STATUS_LABELS[t]}
              <span className="text-xs text-ink-muted tabular-nums">{count(t)}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs text-ink-muted">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Items</th>
                <th className="px-3 py-3 font-medium">Delivery</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {orders.map((o) => (
                <tr key={o.id} className="group relative transition hover:bg-sand/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${o.id}`} className="font-semibold text-ink after:absolute after:inset-0 group-hover:text-sea">
                      LT{o.number}
                    </Link>
                    <p className="text-xs whitespace-nowrap text-ink-muted">{formatDateTime(o.createdAt)}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <p className="font-medium">{o.customer.name}</p>
                    <a href={whatsappLink(o.customer.phone)} className="relative z-10 inline-flex items-center gap-1 text-xs whitespace-nowrap text-ink-muted hover:text-whatsapp">
                      <MessageCircle className="size-3" /> {o.customer.phone}
                    </a>
                  </td>
                  <td className="max-w-[240px] px-3 py-3.5">
                    <p className="truncate">
                      {o.lines.map((l) => `${l.quantity}× ${l.variantName}`).join(", ")}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {[...new Set(o.lines.map((l) => l.productName))].join(", ")}
                      {o.lines.some((l) => l.preorder) && <span className="ml-1 font-semibold text-pre">· pre-order</span>}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 text-ink-soft">
                    {o.fulfilment === "courier" ? "PUDO" : "Collect"}
                    <p className="text-xs text-ink-muted">{o.payment === "eft" ? "EFT" : "Cash"}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="relative px-5 py-3.5 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && <p className="p-10 text-center text-ink-muted">No orders here. Nice and tidy.</p>}
      </div>
    </div>
  );
}
