import Link from "next/link";
import { CircleUserRound, MessageCircle, Sparkles } from "lucide-react";
import { CartButton } from "@/components/shop/CartButton";
import { Logo } from "@/components/shop/Logo";
import { currentUser } from "@/lib/auth";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const user = await currentUser();
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
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Little Treasures home">
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
            <Link href="/#shop" className="transition hover:text-ink">Shop all</Link>
            <Link href="/?category=beach#shop" className="transition hover:text-ink">Beach</Link>
            <Link href="/?category=car#shop" className="transition hover:text-ink">Car</Link>
            <Link href="/?category=toys#shop" className="transition hover:text-ink">Toys</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href={user ? "/account" : "/account/sign-in"}
              aria-label={user ? `Your account (${accountLabel})` : "Sign in"}
              className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2.5 text-sm font-semibold text-ink-soft transition hover:bg-white hover:text-ink sm:px-3.5"
            >
              <CircleUserRound className="size-5" strokeWidth={1.9} />
              <span className="hidden max-w-[10ch] truncate sm:inline">{accountLabel}</span>
            </Link>
            <CartButton />
          </div>
        </div>
        <nav
          aria-label="Categories"
          className="-mt-2 flex gap-2 overflow-x-auto px-4 pb-3 text-sm font-medium text-ink-soft md:hidden"
        >
          {[
            ["/#shop", "Shop all"],
            ["/?category=beach#shop", "Beach"],
            ["/?category=car#shop", "Car"],
            ["/?category=toys#shop", "Toys"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex h-9 shrink-0 items-center rounded-full border border-line bg-white px-3.5 hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>
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
              href="https://wa.me/27820000000"
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
