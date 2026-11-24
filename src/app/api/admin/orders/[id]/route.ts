import { db } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return error("Not found", 404);
  return json({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  });
}

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return error("Invalid update.", 400);

  const existing = await db.order.findUnique({ where: { id } });
  if (!existing) return error("Not found", 404);

  const order = await db.order.update({
    where: { id },
    data: parsed.data,
    include: { items: true },
  });
  return json({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  });
}
