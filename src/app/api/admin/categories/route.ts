import { db } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return json(categories);
}

const schema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().optional(),
  description: z.string().max(300).optional(),
  order: z.number().int().default(0),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid category.", 400);
  const d = parsed.data;
  const slug = d.slug ?? d.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) return error("Category slug already exists.", 400);
  const category = await db.category.create({
    data: { name: d.name, slug, description: d.description ?? null, order: d.order },
  });
  return json(category, 201);
}
