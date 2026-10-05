import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Pencil } from "lucide-react";
import { StockStepper } from "@/components/admin/StockStepper";
import { AvailabilityBadge } from "@/components/shop/AvailabilityBadge";
import { productAvailability, totalStock } from "@/lib/availability";
import { listProducts } from "@/lib/data/store";
import { formatPrice } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/types";

export const metadata = { title: "Products & stock" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { saved } = await searchParams;
  const products = await listProducts({ includeHidden: true });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Products & stock</h1>
          <p className="mt-1 text-ink-soft">Update counts as stock comes in. Changes show on the shop immediately.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">+ Add product</Link>
      </header>

      {saved && (
        <p className="flex items-center gap-2 rounded-2xl bg-ok-tint px-4 py-3 text-sm font-medium text-ok">
          <CheckCircle2 className="size-4" /> Product saved.
        </p>
      )}

      <div className="space-y-4">
        {products.map((p) => (
          <article key={p.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-sand-deep sm:size-20">
                <Image src={p.image} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  {p.status !== "active" && (
                    <span className="rounded-full bg-out-tint px-2 py-0.5 text-[11px] font-semibold text-out uppercase">
                      {p.status === "draft" ? "Hidden draft" : "Archived"}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {CATEGORY_LABELS[p.category]} · {formatPrice(p.price)} · {totalStock(p)} units across {p.variants.length}{" "}
                  option{p.variants.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AvailabilityBadge info={productAvailability(p)} />
                {p.status === "active" && (
                  <Link href={`/products/${p.slug}`} className="btn-ghost btn-sm" title="View in shop">
                    <ExternalLink className="size-3.5" />
                  </Link>
                )}
                <Link href={`/admin/products/${p.id}`} className="btn-ghost btn-sm">
                  <Pencil className="size-3.5" /> Edit
                </Link>
              </div>
            </div>
            <div className="grid border-t border-line-soft sm:grid-cols-2 lg:grid-cols-3">
              {p.variants.map((v) => (
                <div key={v.id} className="-mr-px -mb-px flex items-center gap-3 border-r border-b border-line-soft px-4 py-3 sm:px-5">
                  {v.swatch ? (
                    <span className="size-6 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: v.swatch }} />
                  ) : v.image ? (
                    <span className="relative size-8 shrink-0 overflow-hidden rounded-lg">
                      <Image src={v.image} alt="" fill sizes="32px" className="object-cover" />
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.name}</p>
                    <p className={`text-xs ${v.stock === 0 ? "font-semibold text-out" : v.stock <= p.lowStockThreshold ? "font-semibold text-low" : "text-ink-muted"}`}>
                      {v.stock === 0 ? "Sold out" : v.stock <= p.lowStockThreshold ? "Running low" : p.availability === "preorder" ? "Pre-order allocation" : "In stock"}
                    </p>
                  </div>
                  <StockStepper key={`${v.id}-${v.stock}`} productId={p.id} variantId={v.id} stock={v.stock} low={p.lowStockThreshold} name={v.name} />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
