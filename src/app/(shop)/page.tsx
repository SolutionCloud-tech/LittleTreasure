import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, CalendarClock, PackageCheck } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { productAvailability } from "@/lib/availability";
import { listProducts } from "@/lib/data/store";
import { CATEGORY_LABELS, type Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { category, show } = await searchParams;
  const products = await listProducts();
  const active = typeof category === "string" && category in CATEGORY_LABELS ? (category as Category) : undefined;
  // Quick filters from the menu: ?show=preorder or ?show=in-stock
  const only = show === "preorder" || show === "in-stock" ? show : undefined;
  const shown = products.filter((p) => {
    if (active && p.category !== active) return false;
    if (only === "preorder") return p.availability === "preorder" && productAvailability(p).tone !== "out";
    if (only === "in-stock") return p.availability === "in_stock" && productAvailability(p).tone !== "out";
    return true;
  });
  const heading = only === "preorder" ? "Open for pre-order" : only === "in-stock" ? "In stock now" : active ? CATEGORY_LABELS[active] : "Everything in store";
  const categories = [...new Set(products.map((p) => p.category))];
  // The hero collage only uses products that have a real photo.
  const [a, b, c] = products.filter((p) => !p.image.endsWith(".svg"));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-sun/20 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-40 size-[420px] rounded-full bg-sea/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pt-20 md:pb-24">
          <div className="animate-rise space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral-tint px-3 py-1 text-xs font-semibold text-coral-deep">
              <span className="size-1.5 animate-pulse rounded-full bg-coral" />
              New arrivals this week
            </span>
            <h1 className="font-display text-[44px] leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl">
              Little finds for beach days, road trips & small hands.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-ink-soft">
              Limited stock that usually sells out fast. See exactly what&apos;s left, reserve on
              pre-order, and collect or courier when it lands.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="#shop" className="btn-primary h-12 px-6">
                Shop new arrivals <ArrowRight className="size-4" />
              </Link>
              <span className="text-sm text-ink-muted">Prices in rand, VAT included</span>
            </div>
          </div>

          {a && b && c && (
            <div className="relative grid h-[420px] grid-cols-6 grid-rows-6 gap-3 sm:h-[480px]">
              <Link href={`/products/${a.slug}`} className="relative col-span-4 row-span-6 overflow-hidden rounded-[28px] shadow-lift">
                <Image src={a.image} alt={a.name} fill priority sizes="400px" className="object-cover" />
              </Link>
              <Link href={`/products/${b.slug}`} className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl shadow-card">
                <Image src={b.image} alt={b.name} fill sizes="200px" className="object-cover object-right" />
              </Link>
              <Link href={`/products/${c.slug}`} className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl shadow-card">
                <Image src={c.variants[0]?.image ?? c.image} alt={c.name} fill sizes="200px" className="object-cover" />
              </Link>
              <div className="absolute -bottom-4 left-6 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-lift backdrop-blur">
                <p className="font-display text-lg font-semibold">Squishies just landed</p>
                <p className="text-xs font-medium text-ink-muted">Only 10 of each</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products */}
      <section id="shop" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-5 border-t border-line pt-12 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip href="/#shop" active={!active && !only}>All</Chip>
            {categories.map((c) => (
              <Chip key={c} href={`/?category=${c}#shop`} active={active === c}>
                {CATEGORY_LABELS[c]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 3} />
          ))}
        </div>
        {shown.length === 0 && (
          <p className="card mt-8 p-10 text-center text-ink-soft">Nothing here right now. Check back soon.</p>
        )}
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto mt-24 max-w-6xl scroll-mt-24 px-4 sm:px-6">
        <div className="grid gap-4 rounded-[32px] bg-ink p-8 text-sand sm:p-12 md:grid-cols-3 md:gap-10">
          <div className="md:col-span-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-sun uppercase">How ordering works</p>
            <h2 className="font-display mt-2 text-3xl font-semibold">Simple, like ordering from a friend.</h2>
          </div>
          {[
            { icon: CalendarClock, t: "Reserve yours", d: "Order in stock items or pre-order new arrivals. Your units are held the moment you check out." },
            { icon: Banknote, t: "Pay by EFT", d: "You get the banking details and your order number straight away. Or pay cash when you collect." },
            { icon: PackageCheck, t: "Collect or courier", d: "We WhatsApp you when it's packed. Collect for free, or we send it to your nearest PUDO locker." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="space-y-3 border-t border-white/10 pt-6">
              <Icon className="size-6 text-sun" strokeWidth={1.75} />
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="text-sm leading-relaxed text-sand/70">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active ? "border-ink bg-ink text-sand" : "border-line bg-white text-ink-soft hover:border-ink/30 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
