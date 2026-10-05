"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ReceiptText, Store } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/products", label: "Products & stock", icon: Package },
];

export function AdminNav({ openOrders }: { openOrders: number }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 md:flex-col">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
              active ? "bg-white text-ink shadow-card" : "text-ink-soft hover:bg-white/60 hover:text-ink"
            }`}
          >
            <Icon className={`size-[18px] ${active ? "text-sea" : ""}`} strokeWidth={1.9} />
            <span className={active ? "" : "hidden sm:inline"}>{label}</span>
            {href === "/admin/orders" && openOrders > 0 && (
              <span className="ml-auto rounded-full bg-coral px-1.5 py-0.5 text-[11px] leading-none font-bold text-white">
                {openOrders}
              </span>
            )}
          </Link>
        );
      })}
      <Link
        href="/"
        aria-label="View shop"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap text-ink-soft transition hover:bg-white/60 hover:text-ink md:mt-4"
      >
        <Store className="size-[18px]" strokeWidth={1.9} />
        <span className="hidden sm:inline">View shop</span>
      </Link>
    </nav>
  );
}
