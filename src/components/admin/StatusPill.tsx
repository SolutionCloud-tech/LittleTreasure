import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  pending_payment: "bg-low-tint text-low",
  paid: "bg-coral-tint text-coral-deep",
  ready: "bg-pre-tint text-pre",
  completed: "bg-ok-tint text-ok",
  cancelled: "bg-out-tint text-out",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STYLES[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
