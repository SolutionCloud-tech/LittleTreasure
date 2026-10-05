"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/** Form submit button with a pending spinner and an optional "are you sure?" step. */
export function SubmitButton({
  className,
  confirm,
  children,
}: {
  className: string;
  confirm?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
