import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json, error, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;

  const products = await db.product.findMany({
    where: search
      ? { OR: [{ name: { contains: search } }, { slug: { contains: search } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return json(products.map((p) => ({ ...p, gallery: p.gallery ? safeParse(p.gallery) : null })));
}

const createSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).optional(),
  categoryId: z.string().min(1),
  price: z.number().int().min(0),
  description: z.string().min(5).max(1000),
  image: z.string().url().or(z.string().min(1)),
  gallery: z.array(z.string()).optional(),
  available: z.boolean().default(true),
  vegetarian: z.boolean().default(true),
  featured: z.boolean().default(false),
  rating: z.number().min(0).max(5).default(4.8),
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid data.", 400);
  const d = parsed.data;

  const slug = d.slug ? slugify(d.slug) : slugify(d.name);
  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) return error("A product with this slug already exists.", 400);

  const product = await db.product.create({
    data: {
      name: d.name,
      slug,
      categoryId: d.categoryId,
      price: d.price,
      description: d.description,
      image: d.image,
      gallery: d.gallery && d.gallery.length ? JSON.stringify(d.gallery) : null,
      available: d.available,
      vegetarian: d.vegetarian,
      featured: d.featured,
      rating: d.rating,
    },
    include: { category: true },
  });
  return json({ ...product, gallery: product.gallery ? safeParse(product.gallery) : null }, 201);
}

function safeParse(s: string): string[] | null {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : null;
  } catch {
    return null;
  }
}
