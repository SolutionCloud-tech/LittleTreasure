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
  name,
}: {
  productId: string;
  variantId: string;
  stock: number;
  low: number;
  name: string;
}) {
  const [value, setValue] = useState(String(stock));
  const [saved, setSaved] = useState(stock);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  function save(next: number) {
    const n = Math.max(0, Math.floor(next || 0));
    setValue(String(n));
    if (n === saved) return;
    const previous = saved;
    setSaved(n);
    setFailed(false);
    const fd = new FormData();
    fd.set("productId", productId);
    fd.set("variantId", variantId);
    fd.set("stock", String(n));
    start(async () => {
      try {
        await setStockAction(fd);
      } catch {
        // Put the old number back so the screen never shows a count that wasn't saved.
        setSaved(previous);
        setValue(String(previous));
        setFailed(true);
      }
    });
  }

  const n = Number(value);
  const tone = n === 0 ? "text-out" : n <= low ? "text-low" : "text-ink";

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={`flex h-11 items-center rounded-full border bg-white transition focus-within:ring-4 focus-within:ring-sea/15 sm:h-9 ${
          failed ? "border-coral" : "border-line focus-within:border-sea"
        } ${pending ? "opacity-60" : ""}`}
      >
        <button
          type="button"
          aria-label={`One fewer ${name}`}
          onClick={() => save(n - 1)}
          disabled={n <= 0}
          className="grid size-11 place-items-center text-ink-soft hover:text-ink disabled:opacity-30 sm:size-9"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
          onBlur={() => save(n)}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          inputMode="numeric"
          aria-label={`${name} stock`}
          className={`w-9 bg-transparent text-center text-sm font-bold tabular-nums outline-none ${tone}`}
        />
        <button
          type="button"
          aria-label={`One more ${name}`}
          onClick={() => save(n + 1)}
          className="grid size-11 place-items-center text-ink-soft hover:text-ink sm:size-9"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      {failed && (
        <p role="alert" className="text-[11px] font-semibold text-coral-deep">
          Didn&apos;t save, try again
        </p>
      )}
    </div>
  );
}
