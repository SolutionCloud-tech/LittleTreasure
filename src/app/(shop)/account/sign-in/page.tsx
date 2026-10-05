import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/account/AuthForms";
import { currentUser, safeNext } from "@/lib/auth";
import { AuthShell } from "../AuthShell";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/account/sign-in">) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : undefined);
  if (await currentUser()) redirect(target);
  return (
    <AuthShell title="Welcome back" intro="Sign in to check your orders and check out faster.">
      <SignInForm next={target} />
    </AuthShell>
  );
}
