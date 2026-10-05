/** Shared frame for the sign-in and sign-up pages. */
export function AuthShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 pt-10 sm:pt-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="mt-2 text-ink-soft">{intro}</p>
      <div className="card mt-8 p-5 sm:p-7">{children}</div>
    </div>
  );
}
