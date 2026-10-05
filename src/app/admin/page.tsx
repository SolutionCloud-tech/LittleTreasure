import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  PackageOpen,
  Plane,
  Plus,
  Store,
} from "lucide-react";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusPill } from "@/components/admin/StatusPill";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { setAvailabilityAction } from "@/lib/actions";
import { getDashboard } from "@/lib/data/store";
import { formatPrice, relativeDay } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const d = await getDashboard();
  // The server may run in UTC; greet in the shop's own time zone.
  const hour = Number(
    new Intl.DateTimeFormat("en-ZA", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Johannesburg" }).format(new Date()),
  );
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const tasks =
    d.awaitingPayment.length + d.toPack.length + d.ready.length + d.preorders.length + (d.lowStock.length ? 1 : 0);
  const things = tasks === 1 ? "1 thing" : `${tasks} things`;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{greeting}</h1>
          <p className="mt-1 text-ink-soft">
            {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Johannesburg" })}
            {" · "}You have <strong className="text-ink">{things}</strong> to look at today.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="size-4" /> Add product
        </Link>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 [&>*]:min-w-0">
        <Kpi label="Sales · last 30 days" value={formatPrice(d.revenue30)} now={d.revenue30} prev={d.revenuePrev30} />
        <Kpi label="Orders · last 30 days" value={String(d.orders30)} now={d.orders30} prev={d.ordersPrev30} />
        <Kpi label="Average order" value={formatPrice(d.avgOrder)} />
        <Kpi label="Sales today" value={formatPrice(d.revenueToday)} hint="Paid orders only" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* Chart */}
        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="font-semibold">Sales per day</h2>
              <p className="text-sm text-ink-muted">Last 30 days, paid orders</p>
            </div>
            <p className="text-sm font-semibold">{formatPrice(d.revenue30)}</p>
          </div>
          <RevenueChart data={d.daily} />
        </section>

        {/* To-do */}
        <section className="card overflow-hidden">
          <div className="border-b border-line-soft px-5 py-4 sm:px-6">
            <h2 className="font-semibold">Today&apos;s to-do</h2>
          </div>
          <ul className="divide-y divide-line-soft">
            <Task
              href="/admin/orders?status=pending_payment"
              icon={<Banknote className="size-[18px]" />}
              tone="bg-low-tint text-low"
              title="Check EFT payments"
              text={`${d.awaitingPayment.length} order${d.awaitingPayment.length === 1 ? "" : "s"} waiting for proof of payment`}
              count={d.awaitingPayment.length}
            />
            <Task
              href="/admin/orders?status=paid"
              icon={<PackageOpen className="size-[18px]" />}
              tone="bg-coral-tint text-coral-deep"
              title="Pack paid orders"
              text={`${d.toPack.length} paid order${d.toPack.length === 1 ? "" : "s"} ready to pack or send`}
              count={d.toPack.length}
            />
            {d.waitingOnStock.length > 0 && (
              <Task
                href="/admin/orders?status=paid"
                icon={<Plane className="size-[18px]" />}
                tone="bg-sea-tint text-sea"
                title="Paid, waiting on pre-order stock"
                text={`${d.waitingOnStock.length} order${d.waitingOnStock.length === 1 ? "" : "s"} to send when stock lands`}
                count={d.waitingOnStock.length}
              />
            )}
            <Task
              href="/admin/orders?status=ready"
              icon={<Store className="size-[18px]" />}
              tone="bg-pre-tint text-pre"
              title="Waiting for collection"
              text={`${d.ready.length} packed and ready`}
              count={d.ready.length}
            />
            {d.preorders.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sea-tint text-sea">
                  <Plane className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-ink-muted">
                    Pre-order stock due {p.preorderEta ? relativeDay(p.preorderEta) : "soon"}
                  </p>
                </div>
                <form action={setAvailabilityAction}>
                  <input type="hidden" name="productId" value={p.id} />
                  <input type="hidden" name="availability" value="in_stock" />
                  <SubmitButton className="btn-ghost btn-sm">Mark arrived</SubmitButton>
                </form>
              </li>
            ))}
            {d.lowStock.length > 0 && (
              <li className="px-5 py-3.5 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-low-tint text-low">
                    <AlertTriangle className="size-[18px]" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Running low</p>
                    <p className="text-xs text-ink-muted">Reorder or update stock</p>
                  </div>
                  <Link href="/admin/products" className="text-xs font-semibold text-sea hover:underline">
                    Stock
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 pl-12">
                  {d.lowStock.map(({ product, variant }) => (
                    <span
                      key={variant.id}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        variant.stock === 0 ? "bg-out-tint text-out" : "bg-low-tint text-low"
                      }`}
                    >
                      {product.name.split(" ").slice(-1)[0]} · {variant.name}: {variant.stock === 0 ? "sold out" : variant.stock}
                    </span>
                  ))}
                </div>
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* Recent orders */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4 sm:px-6">
            <h2 className="font-semibold">Latest orders</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-sea hover:underline">
              All orders <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-line-soft">
            {d.recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-sand/60 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {o.customer.name} <span className="font-normal text-ink-muted">· LT{o.number}</span>
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {o.lines.map((l) => `${l.quantity}× ${l.productName.split(" ").slice(-2).join(" ")} (${l.variantName})`).join(", ")}
                    </p>
                  </div>
                  <StatusPill status={o.status} />
                  <p className="w-16 text-right text-sm font-semibold tabular-nums">{formatPrice(o.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Top products */}
        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold">Best sellers</h2>
          <p className="text-sm text-ink-muted">Last 30 days</p>
          <ul className="mt-5 space-y-4">
            {d.topProducts.map((p) => {
              const share = d.topProducts[0] ? p.revenue / d.topProducts[0].revenue : 0;
              return (
                <li key={p.name} className="flex items-center gap-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-sand-deep">
                    <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="font-semibold tabular-nums">{formatPrice(p.revenue)}</p>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft">
                        <div className="h-full rounded-full bg-sea" style={{ width: `${share * 100}%` }} />
                      </div>
                      <span className="w-12 text-right text-xs text-ink-muted tabular-nums">{p.units} sold</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, now, prev, hint }: { label: string; value: string; now?: number; prev?: number; hint?: string }) {
  const change = now !== undefined && prev ? (now - prev) / prev : undefined;
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-[28px]">{value}</p>
      {change !== undefined ? (
        <p className={`mt-1 inline-flex items-center gap-0.5 text-xs font-semibold ${change >= 0 ? "text-ok" : "text-coral-deep"}`}>
          {change >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {Math.abs(Math.round(change * 100))}% vs previous 30 days
        </p>
      ) : (
        <p className="mt-1 text-xs text-ink-muted">{hint ?? " "}</p>
      )}
    </div>
  );
}

function Task({
  href,
  icon,
  tone,
  title,
  text,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  tone: string;
  title: string;
  text: string;
  count: number;
}) {
  return (
    <li>
      <Link href={href} className={`flex items-center gap-3 px-5 py-3.5 transition hover:bg-sand/60 sm:px-6 ${count ? "" : "opacity-50"}`}>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-ink-muted">{text}</p>
        </div>
        <span className="text-lg font-bold tabular-nums">{count}</span>
      </Link>
    </li>
  );
}
