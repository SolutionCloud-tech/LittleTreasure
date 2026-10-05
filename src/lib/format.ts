import type { Cents } from "./types";

/**
 * R500, R1 040, R99.50. Formatted by hand rather than with Intl so the server
 * and the browser always produce exactly the same string.
 */
export function formatPrice(cents: Cents): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const rands = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  const c = abs % 100;
  return `${sign}R${rands}${c ? "." + String(c).padStart(2, "0") : ""}`;
}

/** The shop is in South Africa; show times there even if the server runs in UTC. */
const TZ = "Africa/Johannesburg";

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString("en-ZA", { timeZone: TZ, ...(opts ?? { day: "numeric", month: "short" }) });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(d) - start(today)) / 86_400_000);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  if (diff > 1 && diff < 7) return d.toLocaleDateString("en-ZA", { weekday: "long" });
  return formatDate(iso, { day: "numeric", month: "long" });
}

/** Turns a local SA number (082 123 4567) into a wa.me link. */
export function whatsappLink(phone: string, text?: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "27" + digits.slice(1);
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${q}`;
}
