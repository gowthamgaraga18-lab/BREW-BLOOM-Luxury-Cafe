import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { z } from "zod";
import { generateOrderNumber } from "@/lib/format";
import { CAFE } from "@/lib/constants";

const schema = z.object({
  customerName: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  fulfillment: z.enum(["delivery", "pickup"]),
  address: z.string().max(300).optional(),
  instructions: z.string().max(500).optional(),
  couponCode: z.string().max(40).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, "Your cart is empty."),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid order.";
    return error(msg, 400);
  }
  const data = parsed.data;

  if (data.fulfillment === "delivery" && (!data.address || data.address.trim().length < 8)) {
    return error("A delivery address is required.", 400);
  }

  // Resolve products from DB (never trust client prices)
  const ids = data.items.map((i) => i.productId);
  const products = await db.product.findMany({ where: { id: { in: ids } } });
  if (products.length !== ids.length) {
    return error("Some items in your cart are no longer available.", 400);
  }
  const unavailable = products.filter((p) => !p.available);
  if (unavailable.length) {
    return error(`${unavailable[0].name} is currently unavailable.`, 400);
  }

  const lineItems = data.items.map((i) => {
    const p = products.find((pr) => pr.id === i.productId)!;
    return { product: p, quantity: i.quantity };
  });
  const subtotal = lineItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  // Re-validate coupon server-side
  let discount = 0;
  if (data.couponCode) {
    const code = data.couponCode.trim().toUpperCase();
    const coupon = await db.discountCode.findUnique({ where: { code } });
    if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt >= new Date()) && subtotal >= coupon.minSubtotal) {
      if (coupon.percentage) discount = Math.round((subtotal * coupon.percentage) / 100);
      else if (coupon.flatAmount) discount = coupon.flatAmount;
      discount = Math.min(discount, subtotal);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const deliveryCharge =
    data.fulfillment === "delivery" && discountedSubtotal < CAFE.freeDeliveryThreshold
      ? CAFE.deliveryCharge
      : 0;
  const total = discountedSubtotal + deliveryCharge;

  // Upsert customer
  const customer = await db.customer.upsert({
    where: { email: data.email.toLowerCase() },
    create: { email: data.email.toLowerCase(), name: data.customerName, phone: data.phone },
    update: { name: data.customerName, phone: data.phone },
  });

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName: data.customerName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      fulfillment: data.fulfillment,
      address: data.address?.trim() || null,
      instructions: data.instructions?.trim() || null,
      subtotal,
      discount,
      deliveryCharge,
      total,
      status: "pending",
      // Test mode: no payment is verified, so always unpaid.
      paymentStatus: "unpaid",
      paymentMode: "cod",
      customerId: customer.id,
      items: {
        create: lineItems.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  });

  return json({ success: true, order: serialize(order) }, 201);
}

function serialize(o: Awaited<ReturnType<typeof db.order.create>> & { items: unknown }) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    email: o.email,
    phone: o.phone,
    fulfillment: o.fulfillment,
    address: o.address,
    instructions: o.instructions,
    subtotal: o.subtotal,
    discount: o.discount,
    deliveryCharge: o.deliveryCharge,
    total: o.total,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMode: o.paymentMode,
    createdAt: o.createdAt.toISOString(),
    items: (o.items as Array<{ id: string; productId: string; productName: string; price: number; quantity: number }>),
  };
}
