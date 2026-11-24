import { db } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  categoryId: z.string().min(1).optional(),
  price: z.number().int().min(0).optional(),
  description: z.string().min(5).max(1000).optional(),
  image: z.string().min(1).optional(),
  gallery: z.array(z.string()).optional(),
  available: z.boolean().optional(),
  vegetarian: z.boolean().optional(),
  featured: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return error("Not found", 404);
  return json({
    ...product,
    gallery: product.gallery ? safeParse(product.gallery) : null,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid data.", 400);
  const d = parsed.data;

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return error("Not found", 404);

  const data: Record<string, unknown> = { ...d };
  if (d.gallery !== undefined) {
    data.gallery = d.gallery && d.gallery.length ? JSON.stringify(d.gallery) : null;
  }

  const product = await db.product.update({
    where: { id },
    data,
    include: { category: true },
  });
  return json({ ...product, gallery: product.gallery ? safeParse(product.gallery) : null });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return json({ success: true });
  } catch {
    return error("Could not delete — product may be referenced by existing orders.", 400);
  }
}

function safeParse(s: string): string[] | null {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : null;
  } catch {
    return null;
  }
}
