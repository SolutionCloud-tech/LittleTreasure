import "server-only";
import type {
  Availability,
  CartLine,
  Customer,
  FulfilmentMethod,
  Order,
  OrderLine,
  OrderStatus,
  PaymentMethod,
  Product,
  PublicUser,
  User,
} from "../types";
import { hashPassword } from "../password";
import { seedOrders, seedProducts } from "./seed";

/**
 * In-memory data store for the POC.
 *
 * Every read and write in the app goes through the functions in this file, so
 * swapping in a real database later (Postgres via Prisma/Drizzle, Supabase, …)
 * means re-implementing this module and nothing else. Data resets when the
 * server restarts.
 */

interface DB {
  products: Product[];
  orders: Order[];
  users: User[];
}

const g = globalThis as unknown as { __littleTreasuresDb?: DB };

function db(): DB {
  if (!g.__littleTreasuresDb) {
    const products = seedProducts();
    const orders = seedOrders(products);
    // Demo customer for the POC: thandi@example.com / demo1234, with her seeded orders linked.
    const thandi: User = {
      id: "usr_thandi",
      name: "Thandi Mokoena",
      phone: "082 555 0141",
      email: "thandi@example.com",
      passwordHash: hashPassword("demo1234"),
      createdAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
    };
    for (const o of orders) if (o.customer.name === thandi.name) o.userId = thandi.id;
    g.__littleTreasuresDb = { products, orders, users: [thandi] };
  }
  return g.__littleTreasuresDb;
}

const clone = <T,>(v: T): T => structuredClone(v);

export const SHIPPING_FEE = 9900;

/* ------------------------------------------------------------------ products */

export async function listProducts(opts: { includeHidden?: boolean } = {}): Promise<Product[]> {
  const all = db().products.filter((p) => opts.includeHidden || p.status === "active");
  return clone(all);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const p = db().products.find((x) => x.slug === slug && x.status === "active");
  return p && clone(p);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const p = db().products.find((x) => x.id === id);
  return p && clone(p);
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt" | "slug"> & {
  id?: string;
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function saveProduct(input: ProductInput): Promise<Product> {
  const store = db();
  const now = new Date().toISOString();
  const existing = input.id ? store.products.find((p) => p.id === input.id) : undefined;

  let slug = slugify(input.name) || "product";
  if (store.products.some((p) => p.slug === slug && p.id !== existing?.id)) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  if (existing) {
    Object.assign(existing, { ...input, id: existing.id, slug, updatedAt: now });
    return clone(existing);
  }
  const product: Product = {
    ...input,
    id: `prod_${Math.random().toString(36).slice(2, 10)}`,
    slug,
    createdAt: now,
    updatedAt: now,
  };
  store.products.unshift(product);
  return clone(product);
}

export async function setVariantStock(productId: string, variantId: string, stock: number) {
  const p = db().products.find((x) => x.id === productId);
  const v = p?.variants.find((x) => x.id === variantId);
  if (!p || !v) throw new Error("Variant not found");
  v.stock = Math.max(0, Math.floor(stock));
  p.updatedAt = new Date().toISOString();
}

export async function setAvailability(productId: string, availability: Availability) {
  const p = db().products.find((x) => x.id === productId);
  if (!p) throw new Error("Product not found");
  p.availability = availability;
  if (availability === "in_stock") p.preorderEta = undefined;
  p.updatedAt = new Date().toISOString();
}

/* -------------------------------------------------------------------- orders */

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const all = db().orders.filter((o) => !status || o.status === status);
  return clone(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const mine = db().orders.filter((o) => o.userId === userId);
  return clone(mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const o = db().orders.find((x) => x.id === id);
  return o && clone(o);
}

export class CheckoutError extends Error {}

export async function placeOrder(input: {
  lines: CartLine[];
  customer: Customer;
  fulfilment: FulfilmentMethod;
  payment: PaymentMethod;
  note?: string;
  userId?: string;
}): Promise<Order> {
  const store = db();
  if (!input.lines.length) throw new CheckoutError("Your cart is empty.");

  // Merge repeated lines for the same option so two lines can't oversell it together.
  const merged = new Map<string, CartLine>();
  for (const line of input.lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) {
      throw new CheckoutError("One of the quantities in your cart isn't valid.");
    }
    const prev = merged.get(line.variantId);
    merged.set(line.variantId, prev ? { ...prev, quantity: prev.quantity + line.quantity } : { ...line });
  }

  // Validate everything before touching stock, so a failed checkout changes nothing.
  const resolved = [...merged.values()].map((line) => {
    const product = store.products.find((p) => p.id === line.productId && p.status === "active");
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant) throw new CheckoutError("An item in your cart is no longer available.");
    if (line.quantity > variant.stock) {
      throw new CheckoutError(
        variant.stock === 0
          ? `${product.name} (${variant.name}) has just sold out.`
          : `Only ${variant.stock} of ${product.name} (${variant.name}) left.`,
      );
    }
    return { product, variant, quantity: line.quantity };
  });

  const lines: OrderLine[] = resolved.map(({ product, variant, quantity }) => {
    variant.stock -= quantity;
    return {
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantName: variant.name,
      image: variant.image ?? product.image,
      unitPrice: product.price,
      quantity,
      preorder: product.availability === "preorder",
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const shipping = input.fulfilment === "courier" ? SHIPPING_FEE : 0;
  const number = Math.max(1000, ...store.orders.map((o) => o.number)) + 1;
  const now = new Date().toISOString();

  const order: Order = {
    id: `ord_${number}`,
    number,
    userId: input.userId,
    createdAt: now,
    status: "pending_payment",
    customer: input.customer,
    lines,
    fulfilment: input.fulfilment,
    payment: input.payment,
    subtotal,
    shipping,
    total: subtotal + shipping,
    note: input.note,
    history: [{ status: "pending_payment", at: now }],
  };
  store.orders.unshift(order);
  return clone(order);
}

/** Allowed moves: forward one step at a time, or cancel while the order is still open. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const store = db();
  const order = store.orders.find((o) => o.id === id);
  if (!order) throw new Error("Order not found");
  if (order.status === status) return;
  if (!TRANSITIONS[order.status].includes(status)) {
    throw new Error(`Can't move an order from ${order.status} to ${status}`);
  }

  // Cancelling puts the units back on the shelf.
  if (status === "cancelled" && order.status !== "cancelled") {
    for (const line of order.lines) {
      const v = store.products
        .find((p) => p.id === line.productId)
        ?.variants.find((x) => x.id === line.variantId);
      if (v) v.stock += line.quantity;
    }
  }
  order.status = status;
  order.history.push({ status, at: new Date().toISOString() });
}

/* --------------------------------------------------------------------- users */

const toPublic = (user: User): PublicUser => {
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return clone(rest);
};

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

export async function getUser(id: string): Promise<PublicUser | undefined> {
  const u = db().users.find((x) => x.id === id);
  return u && toPublic(u);
}

/** Includes the password hash, so only auth code should call this. */
export async function getUserWithHashByEmail(email: string): Promise<User | undefined> {
  const u = db().users.find((x) => x.email === normaliseEmail(email));
  return u && clone(u);
}

export async function getUserHash(id: string): Promise<string | undefined> {
  return db().users.find((x) => x.id === id)?.passwordHash;
}

export class AccountError extends Error {}

export async function createUser(input: { name: string; phone: string; email: string; passwordHash: string }) {
  const store = db();
  const email = normaliseEmail(input.email);
  if (store.users.some((u) => u.email === email)) throw new AccountError("email-taken");
  const user: User = {
    ...input,
    email,
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  return toPublic(user);
}

export async function updateUser(id: string, patch: Partial<Pick<User, "name" | "phone" | "email" | "passwordHash">>) {
  const store = db();
  const user = store.users.find((u) => u.id === id);
  if (!user) throw new AccountError("not-found");
  if (patch.email !== undefined) {
    patch.email = normaliseEmail(patch.email);
    if (store.users.some((u) => u.email === patch.email && u.id !== id)) throw new AccountError("email-taken");
  }
  Object.assign(user, patch);
  return toPublic(user);
}

/* ----------------------------------------------------------------- reporting */

export async function getDashboard() {
  const { products, orders } = db();
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(now).getTime();
  const counted = orders.filter((o) => o.status !== "cancelled" && o.status !== "pending_payment");

  const inRange = (o: Order, fromDaysAgo: number, toDaysAgo = 0) => {
    const t = Date.parse(o.createdAt);
    return t >= today - fromDaysAgo * 86_400_000 && t < today + (1 - toDaysAgo) * 86_400_000;
  };
  const sum = (os: Order[]) => os.reduce((s, o) => s + o.total, 0);

  const last30 = counted.filter((o) => inRange(o, 29));
  const prev30 = counted.filter((o) => inRange(o, 59, 30));

  const daily = Array.from({ length: 30 }, (_, i) => {
    const dayStart = today - (29 - i) * 86_400_000;
    const os = counted.filter((o) => {
      const t = Date.parse(o.createdAt);
      return t >= dayStart && t < dayStart + 86_400_000;
    });
    return { date: new Date(dayStart).toISOString(), revenue: sum(os), orders: os.length };
  });

  const byProduct = new Map<string, { name: string; image: string; units: number; revenue: number }>();
  for (const o of last30) {
    for (const l of o.lines) {
      const p = products.find((x) => x.id === l.productId);
      const row = byProduct.get(l.productId) ?? { name: l.productName, image: p?.image ?? l.image, units: 0, revenue: 0 };
      row.units += l.quantity;
      row.revenue += l.unitPrice * l.quantity;
      byProduct.set(l.productId, row);
    }
  }

  const lowStock = products
    .filter((p) => p.status === "active")
    .flatMap((p) =>
      p.variants
        .filter((v) => v.stock <= p.lowStockThreshold)
        .map((v) => ({ product: p, variant: v })),
    )
    .sort((a, b) => a.variant.stock - b.variant.stock);

  return clone({
    revenue30: sum(last30),
    revenuePrev30: sum(prev30),
    orders30: last30.length,
    ordersPrev30: prev30.length,
    avgOrder: last30.length ? Math.round(sum(last30) / last30.length) : 0,
    revenueToday: sum(counted.filter((o) => inRange(o, 0))),
    daily,
    topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue),
    awaitingPayment: orders.filter((o) => o.status === "pending_payment"),
    toPack: orders.filter(
      (o) =>
        o.status === "paid" &&
        !o.lines.some((l) => products.find((p) => p.id === l.productId)?.availability === "preorder"),
    ),
    waitingOnStock: orders.filter(
      (o) =>
        o.status === "paid" &&
        o.lines.some((l) => products.find((p) => p.id === l.productId)?.availability === "preorder"),
    ),
    ready: orders.filter((o) => o.status === "ready"),
    lowStock,
    preorders: products.filter((p) => p.status === "active" && p.availability === "preorder"),
    recent: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
  });
}
