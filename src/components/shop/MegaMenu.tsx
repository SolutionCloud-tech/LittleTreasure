"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, MessageCircle, X } from "lucide-react";
import type { Tone } from "@/lib/availability";

export interface MenuProduct {
  slug: string;
  name: string;
  image: string;
  price: string;
  status: string;
  tone: Tone;
}

export interface MenuData {
  columns: { href: string; label: string; products: MenuProduct[] }[];
  featured?: MenuProduct & { tagline: string };
}

const QUICK_LINKS = [
  { href: "/#shop", label: "All products" },
  { href: "/?show=preorder#shop", label: "Open for pre-order" },
  { href: "/?show=in-stock#shop", label: "In stock now" },
  { href: "/#how", label: "How ordering works" },
];

const TONE_TEXT: Record<Tone, string> = { ok: "text-ok", low: "text-low", preorder: "text-pre", out: "text-out" };

/** Desktop: "Shop" opens a full-width panel under the header. Phones: a slide-out drawer. */
export function MegaMenu({ data, whatsapp, variant }: { data: MenuData; whatsapp: string; variant: "desktop" | "phone" }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const openedAt = useRef(0);

  // Close everything after navigating.
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on route change
    setOpen(false);
    drawer.current?.close();
  }, [pathname, search]);

  // Escape and click-outside for the desktop panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // Hover opens for mouse users only; touch and keyboard use the button.
  const hover = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (next) openedAt.current = Date.now();
      setOpen(next);
    }, next ? 80 : 180);
  };

  // A click straight after hover-open keeps it open instead of toggling it shut.
  const toggle = () => {
    clearTimeout(hoverTimer.current);
    if (open && Date.now() - openedAt.current < 500) return;
    openedAt.current = Date.now();
    setOpen(!open);
  };

  const linkClass = "transition hover:text-ink";

  if (variant === "desktop") {
    return (
      <div
        ref={root}
        className="flex items-center gap-7 text-sm font-medium text-ink-soft"
        onPointerLeave={hover(false)}
      >
        <nav aria-label="Main" className="flex items-center gap-7">
          <button
            ref={trigger}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={toggle}
            onPointerEnter={hover(true)}
            className={`inline-flex h-11 items-center gap-1.5 ${linkClass} ${open ? "text-ink" : ""}`}
          >
            Shop
            <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
          </button>
          <Link href="/?show=preorder#shop" className={linkClass}>Pre-orders</Link>
          <Link href="/#how" className={linkClass}>How it works</Link>
        </nav>

        <div
          id={panelId}
          hidden={!open}
          onPointerEnter={hover(true)}
          className="animate-rise absolute inset-x-0 top-full border-b border-line bg-sand shadow-lift"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
            <MenuBody data={data} />
            {data.featured && <Featured product={data.featured} />}
          </div>
          <Footer whatsapp={whatsapp} />
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => drawer.current?.showModal()}
        className="inline-flex size-11 items-center justify-center rounded-full text-ink-soft transition hover:bg-white hover:text-ink"
        aria-label="Open menu"
      >
        <Menu className="size-5" strokeWidth={1.9} />
      </button>
      <dialog
        ref={drawer}
        aria-label="Menu"
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-0 h-dvh max-h-none w-[88vw] max-w-sm bg-sand p-0 text-ink shadow-lift backdrop:bg-ink/40 open:animate-rise"
      >
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-sand px-4 py-2">
            <p className="font-display text-xl font-semibold">Shop</p>
            <button
              type="button"
              onClick={() => drawer.current?.close()}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 px-4 py-5">
            <MenuBody data={data} />
          </div>
          <Footer whatsapp={whatsapp} />
        </div>
      </dialog>
    </>
  );
}

function MenuBody({ data }: { data: MenuData }) {
  return (
    <div className="grid gap-8 md:grid-cols-[180px_1fr]">
      <ul className="space-y-1">
        {QUICK_LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex min-h-11 items-center rounded-xl px-3 text-[15px] font-semibold text-ink transition hover:bg-white md:-mx-3"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {data.columns.map((col) => (
          <section key={col.href} aria-label={col.label}>
            <Link
              href={col.href}
              className="group flex min-h-11 items-center gap-1.5 font-display text-lg font-semibold text-ink hover:text-sea"
            >
              {col.label}
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <ul className="mt-1 space-y-1">
              {col.products.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/products/${p.slug}`}
                    className="-mx-2 flex min-h-11 items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-sand-deep">
                      <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 block text-sm leading-snug font-medium text-ink">{p.name}</span>
                      <span className={`block text-xs font-medium ${TONE_TEXT[p.tone]}`}>
                        {p.price} · {p.status}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Featured({ product }: { product: MenuProduct & { tagline: string } }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative hidden overflow-hidden rounded-3xl bg-ink text-sand lg:block"
    >
      <span className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={product.image}
          alt=""
          fill
          sizes="300px"
          className="object-cover transition duration-500 motion-safe:group-hover:scale-[1.04]"
        />
      </span>
      <span className="block space-y-1 p-5">
        <span className="block text-xs font-semibold text-sun">Just landed</span>
        <span className="block font-display text-xl font-semibold">{product.name}</span>
        <span className="block text-sm text-sand/80">{product.tagline}</span>
        <span className="flex items-center justify-between pt-2 text-sm font-semibold">
          {product.price}
          <span className="inline-flex items-center gap-1">
            Shop now <ArrowRight className="size-4" aria-hidden />
          </span>
        </span>
      </span>
    </Link>
  );
}

function Footer({ whatsapp }: { whatsapp: string }) {
  return (
    <div className="border-t border-line bg-sand-deep/50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm text-ink-soft md:px-6">
        <span>Collect free or PUDO locker R99</span>
        <span>Pay by EFT or cash on collection</span>
        <a href={whatsapp} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-sea hover:text-sea-deep md:ml-auto">
          <MessageCircle className="size-4" aria-hidden /> Questions? WhatsApp us
        </a>
      </div>
    </div>
  );
}
