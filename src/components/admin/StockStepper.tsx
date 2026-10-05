"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { setStockAction } from "@/lib/actions";

/** Inline stock editor: tap +/- or type a number; saves straight away. */
export function StockStepper({
  productId,
  variantId,
  stock,
  low,
}: {
  productId: string;
  variantId: string;
  stock: number;
  low: number;
}) {
  const [value, setValue] = useState(String(stock));
  const [saved, setSaved] = useState(stock);
  const [pending, start] = useTransition();

  function save(next: number) {
    const n = Math.max(0, Math.floor(next || 0));
    setValue(String(n));
    if (n === saved) return;
    setSaved(n);
    const fd = new FormData();
    fd.set("productId", productId);
    fd.set("variantId", variantId);
    fd.set("stock", String(n));
    start(() => setStockAction(fd));
  }

  const n = Number(value);
  const tone = n === 0 ? "text-out" : n <= low ? "text-low" : "text-ink";

  return (
    <div className={`flex h-9 items-center rounded-full border border-line bg-white transition ${pending ? "opacity-60" : ""}`}>
      <button
        type="button"
        aria-label="One less"
        onClick={() => save(n - 1)}
        disabled={n <= 0}
        className="grid size-9 place-items-center text-ink-soft hover:text-ink disabled:opacity-30"
      >
        <Minus className="size-3.5" />
      </button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        onBlur={() => save(n)}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        inputMode="numeric"
        aria-label="Stock"
        className={`w-9 bg-transparent text-center text-sm font-bold tabular-nums outline-none ${tone}`}
      />
      <button
        type="button"
        aria-label="One more"
        onClick={() => save(n + 1)}
        className="grid size-9 place-items-center text-ink-soft hover:text-ink"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
