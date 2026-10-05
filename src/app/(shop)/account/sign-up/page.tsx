import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/account/AuthForms";
import { currentUser, safeNext } from "@/lib/auth";
import { AuthShell } from "../AuthShell";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignUpPage({ searchParams }: PageProps<"/account/sign-up">) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : undefined);
  if (await currentUser()) redirect(target);
  return (
    <AuthShell
      title="Create your account"
      intro="Keep track of your orders and pre-orders, and skip retyping your details at checkout. You can still order without one."
    >
      <SignUpForm next={target} />
    </AuthShell>
  );
}
