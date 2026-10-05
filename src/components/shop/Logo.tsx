export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <circle cx="16" cy="16" r="16" className="fill-sea" />
        <path
          d="M16 7.5c-4.6 0-8.3 3.6-8.3 8.1 0 2.4 1 4.5 2.7 6l5.6-11.6 5.6 11.6c1.7-1.5 2.7-3.6 2.7-6 0-4.5-3.7-8.1-8.3-8.1Z"
          className="fill-sun"
        />
        <path d="M11.3 23.4 16 13.6l4.7 9.8c-1.4.7-3 1.1-4.7 1.1s-3.3-.4-4.7-1.1Z" className="fill-coral" />
      </svg>
      <span className="font-display text-[21px] leading-none font-semibold tracking-tight text-ink">
        Little Treasures
      </span>
    </span>
  );
}
