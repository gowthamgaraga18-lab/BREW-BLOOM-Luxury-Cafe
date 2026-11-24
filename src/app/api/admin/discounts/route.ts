import { db } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const discounts = await db.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });
  return json(discounts);
}
