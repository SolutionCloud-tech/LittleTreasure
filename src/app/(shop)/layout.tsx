import Link from "next/link";
import { CircleUserRound, MessageCircle, Sparkles } from "lucide-react";
import { CartButton } from "@/components/shop/CartButton";
import { Logo } from "@/components/shop/Logo";
import { MegaMenu, type MenuData, type MenuProduct } from "@/components/shop/MegaMenu";
import { currentUser } from "@/lib/auth";
import { productAvailability } from "@/lib/availability";
import { listProducts } from "@/lib/data/store";
import { formatPrice } from "@/lib/format";
import { CATEGORY_LABELS, type Category, type Product } from "@/lib/types";

const SHOP_WHATSAPP = "https://wa.me/27820000000";

function menuProduct(p: Product): MenuProduct {
  const info = productAvailability(p);
  return { slug: p.slug, name: p.name, image: p.image, price: formatPrice(p.price), status: info.label, tone: info.tone };
}

async function menuData(): Promise<MenuData> {
  const products = await listProducts();
  const categories = (Object.keys(CATEGORY_LABELS) as Category[]).filter((c) => products.some((p) => p.category === c));
  // Newest product with a real photo gets the feature tile.
  const featured = [...products]
    .filter((p) => !p.image.endsWith(".svg") && productAvailability(p).tone !== "out")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return {
    columns: categories.map((c) => ({
      href: `/?category=${c}#shop`,
      label: CATEGORY_LABELS[c],
      products: products.filter((p) => p.category === c).map(menuProduct),
    })),
    featured: featured && { ...menuProduct(featured), tagline: featured.tagline },
  };
}

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [user, menu] = await Promise.all([currentUser(), menuData()]);
  const accountLabel = user ? user.name.split(" ")[0] : "Sign in";
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="bg-sea text-[13px] text-sea-tint">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center">
          <Sparkles className="size-3.5 shrink-0 text-sun" />
          <span>
            Pre-orders open on new arrivals · Collect for free or courier to a PUDO locker for R99
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-line/70 bg-sand/85 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
          <Link href="/" aria-label="Little Treasures home">
            <Logo />
          </Link>
          <div className="hidden md:block">
            <MegaMenu variant="desktop" data={menu} whatsapp={SHOP_WHATSAPP} />
          </div>
          <div className="flex items-center sm:gap-2">
            <Link
              href={user ? "/account" : "/account/sign-in"}
              aria-label={user ? `Your account (${accountLabel})` : "Sign in"}
              className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2.5 text-sm font-semibold text-ink-soft transition hover:bg-white hover:text-ink sm:px-3.5"
            >
              <CircleUserRound className="size-5" strokeWidth={1.9} />
              <span className="hidden max-w-[10ch] truncate sm:inline">{accountLabel}</span>
            </Link>
            <CartButton />
            <div className="md:hidden">
              <MegaMenu variant="phone" data={menu} whatsapp={SHOP_WHATSAPP} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-line bg-sand-deep/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
              Handpicked finds for the beach, the car and the kids. New stock lands often and
              usually sells out, so pre-order when you see something you love.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="eyebrow">Help</p>
            <p className="text-ink-soft">Pay by EFT, or cash when you collect.</p>
            <p className="text-ink-soft">Courier to any PUDO locker, R99.</p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="eyebrow">Questions?</p>
            <a
              href={SHOP_WHATSAPP}
              className="inline-flex items-center gap-2 font-semibold text-sea hover:text-sea-deep"
            >
              <MessageCircle className="size-4" /> Chat on WhatsApp
            </a>
            <p>
              <Link href="/admin" className="text-ink-muted underline-offset-4 hover:underline">
                Shop admin
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
