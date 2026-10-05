/** Money is always stored as whole cents (ZAR) to avoid floating point drift. */
export type Cents = number;

export type ProductStatus = "active" | "draft" | "archived";
export type Availability = "in_stock" | "preorder";
export type Category = "beach" | "car" | "toys" | "home";

export interface Variant {
  id: string;
  name: string;
  /** Units the shop can still sell. For pre-order products this is the incoming allocation. */
  stock: number;
  image?: string;
  /** Optional colour swatch shown on the variant picker. */
  swatch?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: Cents;
  category: Category;
  image: string;
  features: string[];
  variants: Variant[];
  status: ProductStatus;
  availability: Availability;
  /** ISO date the pre-order stock is expected (only for pre-orders). */
  preorderEta?: string;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "ready"
  | "completed"
  | "cancelled";

export type FulfilmentMethod = "collect" | "courier";
export type PaymentMethod = "eft" | "cash_on_collection";

export interface OrderLine {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  image: string;
  unitPrice: Cents;
  quantity: number;
  preorder: boolean;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Order {
  id: string;
  number: number;
  createdAt: string;
  status: OrderStatus;
  customer: Customer;
  lines: OrderLine[];
  fulfilment: FulfilmentMethod;
  payment: PaymentMethod;
  subtotal: Cents;
  shipping: Cents;
  total: Cents;
  note?: string;
  history: { status: OrderStatus; at: string }[];
}

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  beach: "Beach & outdoors",
  car: "Car accessories",
  toys: "Toys & fidgets",
  home: "Home",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid · to pack",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};
