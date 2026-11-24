import { db } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
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

  const existing = await db.reservation.findUnique({ where: { id } });
  if (!existing) return error("Not found", 404);

  const reservation = await db.reservation.update({
    where: { id },
    data: parsed.data,
  });
  return json(reservation);
}
