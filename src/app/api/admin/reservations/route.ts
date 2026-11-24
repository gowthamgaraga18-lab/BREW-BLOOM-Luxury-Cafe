import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const reservations = await db.reservation.findMany({
    where: status && status !== "all" ? { status } : undefined,
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  return json(reservations);
}
