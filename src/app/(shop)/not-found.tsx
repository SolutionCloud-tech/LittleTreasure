import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="font-display text-4xl font-semibold tracking-tight">This treasure has gone.</h1>
      <p className="text-ink-soft">It may have sold out or been taken down. Have a look at what&apos;s in store now.</p>
      <Link href="/#shop" className="btn-primary mt-2">
        Back to the shop
      </Link>
    </div>
  );
}
