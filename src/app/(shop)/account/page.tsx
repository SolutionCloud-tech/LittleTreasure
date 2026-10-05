import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ChevronRight, LogOut } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { DetailsForm } from "@/components/account/AuthForms";
import { signOutAction } from "@/lib/actions";
import { currentUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/data/store";
import { formatDate, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Your account" };

/** Customer-facing wording; the admin labels talk about packing. */
const STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  pending_payment: { label: "Awaiting payment", tone: "bg-low-tint text-low" },
  paid: { label: "Paid", tone: "bg-sea-tint text-sea" },
  ready: { label: "Ready", tone: "bg-pre-tint text-pre" },
  completed: { label: "Completed", tone: "bg-ok-tint text-ok" },
  cancelled: { label: "Cancelled", tone: "bg-out-tint text-out" },
};

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/account/sign-in?next=/account");
  const orders = await listOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Hi, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-ink-soft">
            {orders.length ? `${orders.length} order${orders.length === 1 ? "" : "s"} with us so far.` : "Your orders will show up here."}
          </p>
        </div>
        <form action={signOutAction}>
          <SubmitButton className="btn-ghost">
            <LogOut className="size-4" /> Sign out
          </SubmitButton>
        </form>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="orders-heading" className="card overflow-hidden">
          <h2 id="orders-heading" className="border-b border-line-soft px-5 py-4 font-semibold sm:px-6">
            Your orders
          </h2>
          {orders.length ? (
            <ul className="divide-y divide-line-soft">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/order/${o.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-sand/60 sm:px-6">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sand-deep">
                      <Image src={o.lines[0].image} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
                        <span className="tabular-nums">LT{o.number}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[o.status].tone}`}>
                          {STATUS[o.status].label}
                        </span>
                      </p>
                      <p className="truncate text-sm text-ink-soft">
                        {o.lines.map((l) => `${l.quantity}× ${l.productName} (${l.variantName})`).join(", ")}
                      </p>
                      <p className="text-xs text-ink-muted">{formatDate(o.createdAt, { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{formatPrice(o.total)}</p>
                    <ChevronRight className="size-4 shrink-0 text-ink-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
              <p className="max-w-sm text-ink-soft">No orders yet. New stock lands often and usually sells out, so have a look.</p>
              <Link href="/#shop" className="btn-primary">
                Browse the shop <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="details-heading" className="card space-y-4 p-5 sm:p-6 lg:sticky lg:top-28">
          <div>
            <h2 id="details-heading" className="font-semibold">Your details</h2>
            <p className="text-sm text-ink-soft">Used to fill in checkout and to WhatsApp you about orders.</p>
          </div>
          <DetailsForm user={user} />
        </section>
      </div>
    </div>
  );
}
