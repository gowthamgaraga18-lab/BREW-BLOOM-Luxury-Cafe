import { db } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({ read: z.boolean() });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid update.", 400);
  const msg = await db.contactMessage.update({
    where: { id },
    data: { read: parsed.data.read },
  });
  return json(msg);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const { id } = await params;
  await db.contactMessage.delete({ where: { id } });
  return json({ success: true });
}
