import Link from "next/link";
import { Logo } from "@/components/shop/Logo";

/** Catches unknown URLs anywhere on the site (outside the shop layout). */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <Link href="/" aria-label="Little Treasures home" className="mb-6">
        <Logo />
      </Link>
      <h1 className="font-display text-4xl font-semibold tracking-tight">This treasure has gone.</h1>
      <p className="text-ink-soft">The page may have moved, or the item sold out. Have a look at what&apos;s in store now.</p>
      <Link href="/#shop" className="btn-primary mt-2">
        Back to the shop
      </Link>
    </div>
  );
}
