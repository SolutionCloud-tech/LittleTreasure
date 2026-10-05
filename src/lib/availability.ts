import { relativeDay } from "./format";
import type { Product, Variant } from "./types";

/** Below this many units across all variants the storefront shows "Only N left". */
const LOW_TOTAL = 10;

export type Tone = "ok" | "low" | "preorder" | "out";

export interface AvailabilityInfo {
  tone: Tone;
  label: string;
  detail?: string;
}

export function totalStock(p: Product): number {
  return p.variants.reduce((s, v) => s + v.stock, 0);
}

export function productAvailability(p: Product): AvailabilityInfo {
  const total = totalStock(p);
  if (total === 0) return { tone: "out", label: "Sold out" };
  if (p.availability === "preorder") {
    return {
      tone: "preorder",
      label: "Pre-order",
      detail: p.preorderEta ? `Arrives ${relativeDay(p.preorderEta)}` : "Arriving soon",
    };
  }
  if (total <= LOW_TOTAL) {
    return { tone: "low", label: `Only ${total} left` };
  }
  return { tone: "ok", label: "In stock", detail: `${total} available` };
}

export function variantAvailability(p: Product, v: Variant): AvailabilityInfo {
  if (v.stock === 0) return { tone: "out", label: "Sold out" };
  if (p.availability === "preorder") {
    return { tone: "preorder", label: `${v.stock} pre-order spots left` };
  }
  if (v.stock <= p.lowStockThreshold) return { tone: "low", label: `Only ${v.stock} left` };
  return { tone: "ok", label: `${v.stock} in stock` };
}
