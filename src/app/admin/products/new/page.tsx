import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Products
      </Link>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Add a product</h1>
      <ProductForm />
    </div>
  );
}
