"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

interface Point {
  date: string;
  revenue: number;
  orders: number;
}

/** Daily revenue bars for the last 30 days, with a hover tooltip per bar. */
export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const pad = { t: 12, r: 8, b: 26, l: 52 };
  const max = Math.max(...data.map((d) => d.revenue), 1);
  // Round the axis to a friendly step (R500 / R1 000 / R2 000 …).
  const step = [50000, 100000, 200000, 250000, 500000].find((s) => max / s <= 4) ?? 1000000;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const slot = iw / data.length;
  const bw = Math.max(4, slot - 6);
  const y = (v: number) => pad.t + ih - (v / top) * ih;
  const label = (iso: string) => new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
  const h = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue per day, last 30 days">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#ece6dc" strokeWidth={1} />
            <text x={pad.l - 10} y={y(t) + 4} textAnchor="end" className="fill-ink-muted text-[11px] tabular-nums">
              {t === 0 ? "R0" : formatPrice(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * slot + (slot - bw) / 2;
          const bh = Math.max(d.revenue ? 3 : 0, (d.revenue / top) * ih);
          const r = Math.min(4, bw / 2, bh);
          const base = pad.t + ih;
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad.l + i * slot} y={pad.t} width={slot} height={ih} fill="transparent" />
              {bh > 0 && (
                <path
                  d={`M${x},${base} V${base - bh + r} q0,${-r} ${r},${-r} h${bw - 2 * r} q${r},0 ${r},${r} V${base} Z`}
                  className={`transition-opacity ${hover === null || hover === i ? "fill-sea" : "fill-sea opacity-35"}`}
                />
              )}
              {(i % 7 === 1 || i === data.length - 1) && (
                <text x={x + bw / 2} y={H - 6} textAnchor="middle" className="fill-ink-muted text-[11px]">
                  {i === data.length - 1 ? "Today" : label(d.date)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih} y2={pad.t + ih} stroke="#cfc6b8" strokeWidth={1} />
      </svg>
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs whitespace-nowrap text-sand shadow-lift"
          style={{ left: `${((pad.l + hover * slot + slot / 2) / W) * 100}%` }}
        >
          <p className="text-sand/70">{new Date(h.date).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}</p>
          <p className="text-sm font-semibold">{formatPrice(h.revenue)}</p>
          <p className="text-sand/70">{h.orders} order{h.orders === 1 ? "" : "s"}</p>
        </div>
      )}
    </div>
  );
}
