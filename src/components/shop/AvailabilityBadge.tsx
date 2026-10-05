import type { AvailabilityInfo, Tone } from "@/lib/availability";

const TONES: Record<Tone, string> = {
  ok: "bg-ok-tint text-ok",
  low: "bg-low-tint text-low",
  preorder: "bg-pre-tint text-pre",
  out: "bg-out-tint text-out",
};

const DOTS: Record<Tone, string> = {
  ok: "bg-ok",
  low: "bg-low",
  preorder: "bg-pre",
  out: "bg-out",
};

export function AvailabilityBadge({
  info,
  size = "md",
  className = "",
}: {
  info: AvailabilityInfo;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${TONES[info.tone]} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      } ${className}`}
    >
      <span className={`size-1.5 rounded-full ${DOTS[info.tone]} ${info.tone === "low" ? "animate-pulse" : ""}`} />
      {info.label}
    </span>
  );
}
