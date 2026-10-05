"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser, endSession, safeNext, startSession } from "./auth";
import {
  AccountError,
  CheckoutError,
  createUser,
  getUserWithHashByEmail,
  placeOrder,
  saveProduct,
  setAvailability,
  setVariantStock,
  updateOrderStatus,
  updateUser,
} from "./data/store";
import { hashPassword, verifyPassword } from "./password";
import type { CartLine, FulfilmentMethod, OrderStatus, PaymentMethod, Variant } from "./types";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Echoed back so the form keeps what the user typed after a failed submit. */
  values?: Record<string, string>;
  success?: string;
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/** Returns the value if it is one of the allowed options, otherwise the fallback. */
function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

const ORDER_STATUSES = ["pending_payment", "paid", "ready", "completed", "cancelled"] as const;
const CATEGORIES = ["beach", "car", "toys", "home"] as const;
const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;
const AVAILABILITIES = ["in_stock", "preorder"] as const;

function revalidateEverything() {
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ checkout */

export async function checkoutAction(_: FormState, fd: FormData): Promise<FormState> {
  const fieldErrors: Record<string, string> = {};
  const name = str(fd, "name");
  const phone = str(fd, "phone");
  const email = str(fd, "email");
  const fulfilment = str(fd, "fulfilment") as FulfilmentMethod;
  const payment = str(fd, "payment") as PaymentMethod;
  const address = str(fd, "address");

  if (name.length < 2) fieldErrors.name = "Please enter your name.";
  if (phone.replace(/\D/g, "").length < 9) fieldErrors.phone = "We need a number to WhatsApp you on.";
  if (fulfilment === "courier" && address.length < 5) fieldErrors.address = "Where should we send it?";
  const values = { name, phone, email, address, note: str(fd, "note") };
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  let lines: CartLine[] = [];
  try {
    lines = JSON.parse(str(fd, "cart"));
  } catch {
    return { error: "Your cart could not be read. Please refresh and try again." };
  }

  const user = await currentUser();
  let orderId: string;
  try {
    const order = await placeOrder({
      userId: user?.id,
      lines,
      customer: { name, phone, email: email || undefined, address: fulfilment === "courier" ? address : undefined },
      fulfilment: fulfilment === "courier" ? "courier" : "collect",
      payment: payment === "cash_on_collection" && fulfilment === "collect" ? "cash_on_collection" : "eft",
      note: str(fd, "note") || undefined,
    });
    orderId = order.id;
  } catch (e) {
    if (e instanceof CheckoutError) return { error: e.message, values };
    throw e;
  }
  revalidateEverything();
  redirect(`/order/${orderId}?placed=1`);
}

/* ------------------------------------------------------------------ accounts */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function checkDetails(name: string, phone: string, email: string) {
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please enter your name.";
  if (phone.replace(/\D/g, "").length < 9) fieldErrors.phone = "We need a number to WhatsApp you on.";
  if (!EMAIL.test(email)) fieldErrors.email = "Enter an email address like you@example.com.";
  return fieldErrors;
}

export async function signUpAction(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name");
  const phone = str(fd, "phone");
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  const values = { name, phone, email };

  const fieldErrors = checkDetails(name, phone, email);
  if (password.length < MIN_PASSWORD) fieldErrors.password = `Use at least ${MIN_PASSWORD} characters.`;
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  let userId: string;
  try {
    userId = (await createUser({ name, phone, email, passwordHash: hashPassword(password) })).id;
  } catch (e) {
    if (e instanceof AccountError) {
      return { fieldErrors: { email: "There is already an account with this email. Sign in instead?" }, values };
    }
    throw e;
  }
  await startSession(userId);
  redirect(safeNext(str(fd, "next")));
}

// Compared against when the email is unknown, so a wrong email takes as long as a wrong password.
let dummyHash: string | undefined;

export async function signInAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email");
  const password = String(fd.get("password") ?? "");
  const values = { email };
  if (!email || !password) return { error: "Enter your email and password.", values };

  const user = await getUserWithHashByEmail(email);
  dummyHash ??= hashPassword("not-a-real-password");
  const ok = verifyPassword(password, user?.passwordHash ?? dummyHash);
  if (!user || !ok) return { error: "That email and password don’t match. Check them and try again.", values };

  await startSession(user.id);
  redirect(safeNext(str(fd, "next")));
}

export async function signOutAction() {
  await endSession();
  revalidateEverything();
  redirect("/");
}

export async function updateDetailsAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) redirect("/account/sign-in");
  const name = str(fd, "name");
  const phone = str(fd, "phone");
  const email = str(fd, "email");
  const values = { name, phone, email };
  const fieldErrors = checkDetails(name, phone, email);
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  try {
    await updateUser(user.id, { name, phone, email });
  } catch (e) {
    if (e instanceof AccountError) return { fieldErrors: { email: "Another account already uses this email." }, values };
    throw e;
  }
  revalidatePath("/", "layout");
  return { success: "Your details are saved.", values };
}

/* --------------------------------------------------------------------- admin */

export async function updateOrderStatusAction(fd: FormData) {
  const status = str(fd, "status");
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;
  await updateOrderStatus(str(fd, "orderId"), status as OrderStatus);
  revalidateEverything();
}

export async function setStockAction(fd: FormData) {
  const stock = Number(fd.get("stock"));
  if (!Number.isFinite(stock)) return;
  await setVariantStock(str(fd, "productId"), str(fd, "variantId"), stock);
  revalidateEverything();
}

export async function setAvailabilityAction(fd: FormData) {
  await setAvailability(str(fd, "productId"), oneOf(str(fd, "availability"), AVAILABILITIES, "in_stock"));
  revalidateEverything();
}

export async function saveProductAction(_: FormState, fd: FormData): Promise<FormState> {
  const fieldErrors: Record<string, string> = {};
  const name = str(fd, "name");
  const price = Math.round(Number(str(fd, "price").replace(",", ".")) * 100);
  const availability = oneOf(str(fd, "availability"), AVAILABILITIES, "in_stock");
  const preorderEta = str(fd, "preorderEta");

  let variants: Variant[] = [];
  try {
    variants = (JSON.parse(str(fd, "variants")) as Variant[])
      .map((v) => ({ ...v, name: v.name.trim(), stock: Math.max(0, Math.floor(Number(v.stock) || 0)) }))
      .filter((v) => v.name);
  } catch {
    variants = [];
  }

  if (name.length < 2) fieldErrors.name = "Give the product a name.";
  if (!Number.isFinite(price) || price <= 0) fieldErrors.price = "Enter a price in rand, e.g. 250.";
  if (!variants.length) fieldErrors.variants = "Add at least one option, even if it is just “Standard”.";
  if (availability === "preorder" && Number.isNaN(Date.parse(preorderEta))) {
    fieldErrors.preorderEta = "When is the stock arriving?";
  }
  // Only images the shop itself serves; uploads replace this in the real build.
  const image = str(fd, "image");
  if (image && !/^\/products\/[\w.-]+$/.test(image)) fieldErrors.image = "Pick one of the photos.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  await saveProduct({
    id: str(fd, "id") || undefined,
    name,
    tagline: str(fd, "tagline"),
    description: str(fd, "description"),
    price,
    category: oneOf(str(fd, "category"), CATEGORIES, "home"),
    image: image || "/products/placeholder.svg",
    features: str(fd, "features")
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean),
    variants: variants.map((v) => ({
      id: v.id || `v_${Math.random().toString(36).slice(2, 9)}`,
      name: v.name.slice(0, 60),
      stock: v.stock,
      swatch: v.swatch && /^#[0-9a-f]{6}$/i.test(v.swatch) ? v.swatch : undefined,
      image: v.image && /^\/products\/[\w.-]+$/.test(v.image) ? v.image : undefined,
    })),
    status: oneOf(str(fd, "status"), PRODUCT_STATUSES, "active"),
    availability,
    preorderEta: availability === "preorder" ? new Date(preorderEta).toISOString() : undefined,
    lowStockThreshold: Math.max(0, Math.floor(Number(str(fd, "lowStockThreshold"))) || 0),
  });
  revalidateEverything();
  redirect("/admin/products?saved=1");
}
