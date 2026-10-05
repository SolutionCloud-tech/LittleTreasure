"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, Loader2, Plus, X } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { saveProductAction, type FormState } from "@/lib/actions";
import { CATEGORY_LABELS, type Availability, type Category, type Product, type ProductStatus } from "@/lib/types";

type VariantRow = { id: string; name: string; stock: string; swatch: string; image?: string };

const IMAGE_LIBRARY = [
  "/products/ponchos.jpg",
  "/products/armrest-organiser.jpg",
  "/products/squishies.jpg",
  "/products/placeholder.svg",
];

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProductAction, {});
  const fe = state.fieldErrors ?? {};

  const [name, setName] = useState(product?.name ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [price, setPrice] = useState(product ? String(product.price / 100) : "");
  const [category, setCategory] = useState<Category>(product?.category ?? "home");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "active");
  const [availability, setAvailability] = useState<Availability>(product?.availability ?? "in_stock");
  const [eta, setEta] = useState(product?.preorderEta?.slice(0, 10) ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [features, setFeatures] = useState(product?.features.join("\n") ?? "");
  const [low, setLow] = useState(String(product?.lowStockThreshold ?? 2));
  const [image, setImage] = useState(product?.image ?? IMAGE_LIBRARY[3]);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => ({ id: v.id, name: v.name, stock: String(v.stock), swatch: v.swatch ?? "", image: v.image })) ?? [
      { id: "", name: "Standard", stock: "0", swatch: "" },
    ],
  );

  const update = (i: number, patch: Partial<VariantRow>) =>
    setVariants((vs) => vs.map((v, k) => (k === i ? { ...v, ...patch } : v)));

  const preview: Product = {
    id: product?.id ?? "preview",
    slug: "preview",
    name: name || "Product name",
    tagline: tagline || "A short line that sells it",
    description: "",
    price: Math.round((Number(price) || 0) * 100),
    category,
    image,
    features: [],
    variants: variants.map((v) => ({ id: v.id || v.name, name: v.name, stock: Number(v.stock) || 0, swatch: v.swatch || undefined })),
    status,
    availability,
    preorderEta: eta ? new Date(eta).toISOString() : undefined,
    lowStockThreshold: Number(low) || 0,
    createdAt: "",
    updatedAt: "",
  };

  return (
    <form action={action} className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(
          variants.map((v) => ({ id: v.id, name: v.name, stock: v.stock, swatch: v.swatch || undefined, image: v.image })),
        )}
      />

      <div className="space-y-6">
        <Section title="Basics">
          <div>
            <label className="label" htmlFor="name">Product name</label>
            <input id="name" name="name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kids' beach poncho" />
            <Err msg={fe.name} />
          </div>
          <div>
            <label className="label" htmlFor="tagline">Short tagline</label>
            <input id="tagline" name="tagline" className="field" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One line shown under the name" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="price">Price (R)</label>
              <div className="relative">
                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted">R</span>
                <input id="price" name="price" inputMode="decimal" className="field pl-8" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="250" />
              </div>
              <Err msg={fe.price} />
            </div>
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select id="category" name="category" className="field" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={5} className="field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Paste the text from your WhatsApp post here." />
          </div>
          <div>
            <label className="label" htmlFor="features">Highlights (one per line)</label>
            <textarea id="features" name="features" rows={4} className="field" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder={"100% cotton\nAdult free size"} />
          </div>
        </Section>

        <Section title="Photo">
          <input type="hidden" name="image" value={image} />
          <div className="grid grid-cols-4 gap-3">
            {[...new Set([image, ...IMAGE_LIBRARY])].map((src) => (
              <button
                type="button"
                key={src}
                aria-label={`Use photo: ${src.split("/").pop()?.replace(/\.\w+$/, "")}`}
                aria-pressed={image === src}
                onClick={() => setImage(src)}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-sand-deep transition ${
                  image === src ? "border-ink" : "border-transparent hover:border-line"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
          <Err msg={fe.image} />
          <p className="text-xs text-ink-muted">
            In the real shop you&apos;ll upload photos straight from your phone. For the demo, pick one of these.
          </p>
        </Section>

        <Section title="Options & stock" hint="Colours, designs or sizes. Each has its own stock count.">
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <label className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line" title="Colour swatch (optional)">
                  <span className="absolute inset-0" style={{ background: v.swatch || "repeating-linear-gradient(45deg,var(--color-sand-deep) 0 4px,#fff 4px 8px)" }} />
                  <input type="color" aria-label={`Colour swatch for ${v.name || "this option"} (optional)`} value={v.swatch || "#ffffff"} onChange={(e) => update(i, { swatch: e.target.value })} className="absolute inset-0 opacity-0" />
                </label>
                <input aria-label="Option name" className="field" value={v.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="e.g. Beige" />
                <input
                  aria-label={`${v.name || "Option"} stock`}
                  inputMode="numeric"
                  className="field w-24 text-center"
                  value={v.stock}
                  onChange={(e) => update(i, { stock: e.target.value.replace(/\D/g, "") })}
                />
                <button
                  type="button"
                  aria-label={`Remove ${v.name || "option"}`}
                  onClick={() => setVariants((vs) => vs.filter((_, k) => k !== i))}
                  disabled={variants.length === 1}
                  className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-muted hover:bg-coral-tint hover:text-coral-deep disabled:opacity-30"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <Err msg={fe.variants} />
          <button
            type="button"
            onClick={() => setVariants((vs) => [...vs, { id: "", name: "", stock: "0", swatch: "" }])}
            className="btn-ghost btn-sm"
          >
            <Plus className="size-3.5" /> Add option
          </button>
          <div className="max-w-[200px]">
            <label className="label" htmlFor="low">Warn me when stock drops to</label>
            <input id="low" name="lowStockThreshold" inputMode="numeric" className="field" value={low} onChange={(e) => setLow(e.target.value.replace(/\D/g, ""))} />
          </div>
        </Section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-8">
        <Section title="Selling">
          <div className="space-y-2">
            <Radio name="availability" value="in_stock" checked={availability === "in_stock"} onChange={() => setAvailability("in_stock")} title="In stock" text="Ready to collect or send now." />
            <Radio name="availability" value="preorder" checked={availability === "preorder"} onChange={() => setAvailability("preorder")} title="Pre-order" text="Customers reserve now, stock arrives later." />
          </div>
          {availability === "preorder" && (
            <div>
              <label className="label" htmlFor="eta">Stock arrives on</label>
              <input id="eta" type="date" name="preorderEta" className="field" value={eta} onChange={(e) => setEta(e.target.value)} />
              <Err msg={fe.preorderEta} />
            </div>
          )}
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
            <span>
              <span className="block text-sm font-semibold">Show in shop</span>
              <span className="block text-xs text-ink-muted">Turn off to keep it as a hidden draft</span>
            </span>
            <input type="hidden" name="status" value={status} />
            <input
              type="checkbox"
              checked={status === "active"}
              onChange={(e) => setStatus(e.target.checked ? "active" : "draft")}
              className="peer sr-only"
            />
            <span className="relative h-6 w-11 rounded-full bg-line transition peer-checked:bg-ok after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sea" />
          </label>
        </Section>

        <div className="space-y-2">
          <p className="eyebrow px-1">Preview in shop</p>
          <div className="pointer-events-none">
            <ProductCard product={preview} />
          </div>
        </div>

        {state.error && (
          <p role="alert" className="flex gap-2 rounded-xl bg-coral-tint p-3 text-sm text-coral-deep">
            <AlertCircle className="size-4 shrink-0" /> {state.error}
          </p>
        )}
        <div className="flex gap-2">
          <Link href="/admin/products" className="btn-ghost flex-1">Cancel</Link>
          <button type="submit" disabled={pending} className="btn-primary flex-[2]">
            {pending && <Loader2 className="size-4 animate-spin" />}
            {product ? "Save changes" : "Add product"}
          </button>
        </div>
      </aside>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {hint && <p className="text-sm text-ink-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Radio({ title, text, ...input }: { title: string; text: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl border border-line p-3.5 transition has-checked:border-ink has-checked:bg-sand has-checked:ring-1 has-checked:ring-ink">
      <input type="radio" className="mt-0.5 size-4 accent-ink" {...input} />
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-ink-muted">{text}</span>
      </span>
    </label>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg ? (
    <p role="alert" className="mt-1.5 text-xs font-medium text-coral-deep">
      {msg}
    </p>
  ) : null;
}
