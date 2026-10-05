import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/shop/Logo";
import { listOrders } from "@/lib/data/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Little Treasures" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const orders = await listOrders();
  const open = orders.filter((o) => o.status === "pending_payment" || o.status === "paid").length;

  return (
    <div className="min-h-dvh bg-admin md:grid md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-admin-side/95 px-4 py-3 backdrop-blur md:h-dvh md:flex-col md:items-stretch md:gap-8 md:border-r md:border-b-0 md:px-4 md:py-6">
        <Link href="/admin" className="shrink-0 md:px-2">
          <Logo className="[&>span:last-child]:hidden md:[&>span:last-child]:inline" />
        </Link>
        <div className="min-w-0 overflow-x-auto">
          <AdminNav openOrders={open} />
        </div>
        <div className="mt-auto hidden rounded-2xl border border-dashed border-ink/15 p-4 text-xs leading-relaxed text-ink-soft md:block">
          <p className="font-semibold text-ink">Demo admin</p>
          No login yet and data resets on restart. In the real shop this sits behind a password.
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
    </div>
  );
}
