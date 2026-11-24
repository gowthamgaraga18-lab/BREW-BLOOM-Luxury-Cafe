import { db } from "@/lib/db";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

// Owner-scoped read: a customer may fetch their own order by id+email.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.toLowerCase();

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return error("Order not found", 404);
  // Enforce owner scope: only the email that placed the order may view it.
  if (!email || order.email !== email) {
    return error("Order not found", 404);
  }
  return json({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    fulfillment: order.fulfillment,
    address: order.address,
    instructions: order.instructions,
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryCharge: order.deliveryCharge,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMode: order.paymentMode,
    createdAt: order.createdAt.toISOString(),
    items: order.items,
  });
}
