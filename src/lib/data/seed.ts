import type { Order, OrderLine, OrderStatus, Product } from "../types";

/**
 * Demo data for the POC, based on the seller's current WhatsApp posts.
 * Dates are generated relative to "now" so the dashboard always looks alive.
 */

const DAY = 86_400_000;

function daysFromNow(days: number, hour = 10): string {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export function seedProducts(): Product[] {
  const now = new Date().toISOString();
  return [
    {
      id: "prod_ponchos",
      slug: "cotton-velour-beach-poncho",
      name: "Cotton Velour Beach Poncho",
      tagline: "Thick, real towelling. Not a thin quick-dry.",
      description:
        "Level up your beach days with the ultimate post-swim comfort. These adult ponchos are made from thick 100% cotton velour, much heavier than the ones sold before. They are actual towelling material, soft and absorbent, with a roomy hood and a front pocket. Change under it, dry off in it, and stay warm on the walk back to the car.",
      price: 50000,
      category: "beach",
      image: "/products/ponchos.jpg",
      features: [
        "100% cotton velour",
        "Soft & absorbent",
        "Keeps you warm & dry",
        "Adult free size",
        "Full length",
      ],
      variants: [
        { id: "v_poncho_rainbow", name: "Rainbow stripe", stock: 6, image: "/products/poncho-rainbow.jpg" },
        { id: "v_poncho_wave", name: "Blue wave", stock: 8, image: "/products/poncho-wave.jpg" },
        { id: "v_poncho_reef", name: "Reef stripe", stock: 2, image: "/products/poncho-reef.jpg" },
        { id: "v_poncho_sunset", name: "Sunset diagonal", stock: 7, image: "/products/poncho-sunset.jpg" },
        { id: "v_poncho_palm", name: "Palm leaf", stock: 9, image: "/products/poncho-palm.jpg" },
      ],
      status: "active",
      availability: "preorder",
      preorderEta: daysFromNow(3),
      lowStockThreshold: 3,
      createdAt: daysFromNow(-12),
      updatedAt: now,
    },
    {
      id: "prod_armrest",
      slug: "multi-purpose-armrest-organiser",
      name: "Multi-Purpose Armrest Organiser",
      tagline: "Say goodbye to a cluttered car.",
      description:
        "The sleek, stylish upgrade your car's interior has been waiting for. Crafted from premium quilted diamond-stitch material, it sits over your centre console and keeps drinks, tissues and everyday essentials within reach. Two cup holders, a tissue compartment and side pockets for phones, cables and sunglasses.",
      price: 22000,
      category: "car",
      image: "/products/armrest-organiser.jpg",
      features: [
        "Built-in cup holders",
        "Tissue compartment",
        "Multi-purpose side pockets",
        "Quilted diamond-stitch finish",
        "Fits most centre consoles",
      ],
      variants: [
        { id: "v_arm_black", name: "Black with red edging", stock: 7, swatch: "#1c1c1c", image: "/products/armrest-black-red.jpg" },
        { id: "v_arm_beige", name: "Beige", stock: 4, swatch: "#c9ab82", image: "/products/armrest-beige.jpg" },
        { id: "v_arm_burgundy", name: "Burgundy", stock: 0, swatch: "#7a1d2b", image: "/products/armrest-burgundy.jpg" },
        { id: "v_arm_charcoal", name: "Charcoal grey", stock: 5, swatch: "#5b5e63", image: "/products/armrest-charcoal.jpg" },
        { id: "v_arm_chocolate", name: "Chocolate brown", stock: 2, swatch: "#4a2c22", image: "/products/armrest-chocolate.jpg" },
      ],
      status: "active",
      availability: "in_stock",
      lowStockThreshold: 2,
      createdAt: daysFromNow(-70),
      updatedAt: now,
    },
    {
      id: "prod_squishies",
      slug: "glitter-maltose-squishies",
      name: "Glitter Maltose Squishies",
      tagline: "Get the firm squeeze you need. Only 10 of each.",
      description:
        "Glitter hard maltose squish elephants and capybaras. Packed with a thick maltose gel fill for a firm, resistive grip that melts away stress, then slowly springs back to shape. About 8 × 7 cm, the perfect size for a pocket or a desk. Limited stock: only 10 of each came in.",
      price: 10000,
      category: "toys",
      image: "/products/squishies.jpg",
      features: [
        "Deep pressure relief",
        "Thick maltose gel fill",
        "Slow rise, holds its shape",
        "About 8 × 7 cm",
        "Colours vary, glitter throughout",
      ],
      variants: [
        { id: "v_sq_elephant", name: "Elephant", stock: 6, image: "/products/squishy-elephant.jpg" },
        { id: "v_sq_capybara", name: "Capybara", stock: 3, image: "/products/squishy-capybara.jpg" },
      ],
      status: "active",
      availability: "in_stock",
      lowStockThreshold: 3,
      createdAt: daysFromNow(-6),
      updatedAt: now,
    },
  ];
}

const CUSTOMERS = [
  ["Thandi Mokoena", "082 555 0141"],
  ["Lerato Dlamini", "071 555 0177"],
  ["Megan van der Merwe", "083 555 0102"],
  ["Ayesha Patel", "084 555 0190"],
  ["Sipho Nkosi", "072 555 0163"],
  ["Chantel Botha", "076 555 0118"],
  ["Nomsa Khumalo", "079 555 0124"],
  ["Jess Pillay", "061 555 0155"],
  ["Ruan Steyn", "082 555 0136"],
  ["Zanele Mthembu", "073 555 0189"],
] as const;

/** Small deterministic PRNG so the demo looks the same on every restart. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function seedOrders(products: Product[]): Order[] {
  const rand = rng(42);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  const orders: Order[] = [];
  let number = 1001;

  for (let day = -64; day <= 0; day++) {
    // Busier on weekends and as the new arrivals were posted.
    const date = new Date(Date.now() + day * DAY);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const count = Math.floor(rand() * (weekend ? 4 : 2.6)) + (day > -8 ? 1 : 0);

    for (let i = 0; i < count; i++) {
      const lines: OrderLine[] = [];
      const items = rand() < 0.75 ? 1 : 2;
      for (let j = 0; j < items; j++) {
        // Squishies only arrived 6 days ago; ponchos opened for pre-order 12 days ago.
        const available = products.filter((p) => Date.parse(p.createdAt) <= date.getTime());
        if (!available.length) continue;
        const p = pick(available);
        const v = pick(p.variants);
        if (lines.some((l) => l.variantId === v.id)) continue;
        lines.push({
          productId: p.id,
          variantId: v.id,
          productName: p.name,
          variantName: v.name,
          image: v.image ?? p.image,
          unitPrice: p.price,
          quantity: rand() < 0.8 ? 1 : 2,
          preorder: p.availability === "preorder",
        });
      }
      if (!lines.length) continue;

      const [name, phone] = pick(CUSTOMERS);
      const fulfilment = rand() < 0.6 ? "collect" : "courier";
      const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
      const shipping = fulfilment === "courier" ? 9900 : 0;
      const hour = 8 + Math.floor(rand() * 12);
      const createdAt = new Date(
        Math.min(Date.parse(daysFromNow(day, hour)), Date.now() - (i + 1) * 47 * 60_000),
      ).toISOString();

      let status: OrderStatus = "completed";
      if (day >= -1) status = rand() < 0.55 ? "pending_payment" : "paid";
      else if (day >= -3) status = rand() < 0.5 ? "paid" : "ready";
      else if (rand() < 0.06) status = "cancelled";
      if (lines.some((l) => l.preorder) && status === "ready") status = "paid";

      const flow: OrderStatus[] = ["pending_payment", "paid", "ready", "completed"];
      const history =
        status === "cancelled"
          ? [{ status: "pending_payment" as const, at: createdAt }, { status, at: createdAt }]
          : flow.slice(0, flow.indexOf(status) + 1).map((s, k) => ({
              status: s,
              at: new Date(Date.parse(createdAt) + k * 5 * 3_600_000).toISOString(),
            }));

      orders.push({
        id: `ord_demo${number}`,
        number,
        createdAt,
        status,
        customer: {
          name,
          phone,
          address: fulfilment === "courier" ? "PUDO locker · Engen Main Road" : undefined,
        },
        lines,
        fulfilment,
        payment: fulfilment === "collect" && rand() < 0.4 ? "cash_on_collection" : "eft",
        subtotal,
        shipping,
        total: subtotal + shipping,
        history,
      });
      number++;
    }
  }

  return orders.reverse();
}
