import { db } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return json(
    customers.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      phone: c.phone,
      createdAt: c.createdAt.toISOString(),
      orderCount: c._count.orders,
    }))
  );
}
