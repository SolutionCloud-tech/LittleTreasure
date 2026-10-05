import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProduct } from "@/lib/data/store";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const product = await getProduct((await params).id);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Products
      </Link>
      <h1 className="font-display text-4xl font-semibold tracking-tight">{product.name}</h1>
      <ProductForm key={product.updatedAt} product={product} />
    </div>
  );
}
