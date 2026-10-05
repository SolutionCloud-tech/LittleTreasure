import Image from "next/image";
import Link from "next/link";
import { productAvailability } from "@/lib/availability";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AvailabilityBadge } from "./AvailabilityBadge";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const info = productAvailability(product);
  const soldOut = info.tone === "out";
  const swatches = product.variants.filter((v) => v.swatch);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden bg-sand-deep">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition duration-500 group-hover:scale-[1.04] ${soldOut ? "grayscale-[60%] opacity-70" : ""}`}
        />
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          <AvailabilityBadge info={info} className="shadow-sm ring-1 ring-black/5" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="font-display text-xl leading-snug font-semibold text-ink">{product.name}</h3>
          <p className="text-sm leading-relaxed text-ink-soft">{product.tagline}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div>
            <p className="text-xl font-bold tracking-tight">{formatPrice(product.price)}</p>
            {info.detail && <p className="text-xs font-medium text-ink-muted">{info.detail}</p>}
          </div>
          {swatches.length > 0 ? (
            <div className="flex items-center -space-x-1.5" aria-label={`${product.variants.length} colours`}>
              {swatches.map((v) => (
                <span
                  key={v.id}
                  title={v.name}
                  className={`size-5 rounded-full ring-2 ring-white ${v.stock === 0 ? "opacity-30" : ""}`}
                  style={{ background: v.swatch }}
                />
              ))}
            </div>
          ) : (
            <span className="text-xs font-medium text-ink-muted">
              {product.variants.length > 1 ? `${product.variants.length} options` : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
