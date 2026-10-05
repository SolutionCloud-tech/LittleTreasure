import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { getProductBySlug } from "@/lib/data/store";
import { CATEGORY_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">) {
  const product = await getProductBySlug((await params).slug);
  return { title: product?.name ?? "Not found" };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 md:pt-10">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/#shop" className="inline-flex items-center gap-1 hover:text-ink">
          <ChevronLeft className="size-4" /> Shop
        </Link>
        <span>/</span>
        <Link href={`/?category=${product.category}#shop`} className="hover:text-ink">
          {CATEGORY_LABELS[product.category]}
        </Link>
      </nav>
      <ProductPurchase product={product} />
    </div>
  );
}
