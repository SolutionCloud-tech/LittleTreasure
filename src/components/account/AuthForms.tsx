"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Field } from "@/components/shop/Field";
import { signInAction, signUpAction, updateDetailsAction, type FormState } from "@/lib/actions";
import type { PublicUser } from "@/lib/types";

function FormError({ msg }: { msg?: string }) {
  return msg ? (
    <p className="flex gap-2 rounded-xl bg-coral-tint p-3 text-sm font-medium text-coral-deep" role="alert">
      <AlertCircle className="size-4 shrink-0 translate-y-0.5" /> {msg}
    </p>
  ) : null;
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={pending} className="btn-primary h-12 w-full text-[15px]">
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function SignUpForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signUpAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Full name" name="name" defaultValue={v.name} error={fe.name} autoComplete="name" required />
      <Field
        label="WhatsApp number"
        name="phone"
        defaultValue={v.phone}
        error={fe.phone}
        autoComplete="tel"
        inputMode="tel"
        placeholder="082 123 4567"
        required
      />
      <Field label="Email" name="email" type="email" defaultValue={v.email} error={fe.email} autoComplete="email" required />
      <Field
        label="Password"
        name="password"
        type="password"
        error={fe.password}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
      />
      <FormError msg={state.error} />
      <Submit pending={pending}>Create account</Submit>
      <p className="text-center text-sm text-ink-soft">
        Already have one?{" "}
        <Link href={next ? `/account/sign-in?next=${encodeURIComponent(next)}` : "/account/sign-in"} className="font-semibold text-sea underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signInAction, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" name="email" type="email" defaultValue={v.email} autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      <FormError msg={state.error} />
      <Submit pending={pending}>Sign in</Submit>
      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href={next ? `/account/sign-up?next=${encodeURIComponent(next)}` : "/account/sign-up"} className="font-semibold text-sea underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function DetailsForm({ user }: { user: PublicUser }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateDetailsAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="Full name" name="name" defaultValue={v.name ?? user.name} error={fe.name} autoComplete="name" />
      <Field label="WhatsApp number" name="phone" defaultValue={v.phone ?? user.phone} error={fe.phone} autoComplete="tel" inputMode="tel" />
      <Field label="Email" name="email" type="email" defaultValue={v.email ?? user.email} error={fe.email} autoComplete="email" />
      <FormError msg={state.error} />
      {state.success && !pending && (
        <p className="flex items-center gap-2 rounded-xl bg-ok-tint p-3 text-sm font-medium text-ok" role="status">
          <CheckCircle2 className="size-4 shrink-0" /> {state.success}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-ghost w-full">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save details
      </button>
    </form>
  );
}
