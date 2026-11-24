import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const featured = searchParams.get("featured");
  const available = searchParams.get("available");

  const where: Record<string, unknown> = {};
  if (category && category !== "all") {
    where.category = { slug: category };
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (featured === "true") where.featured = true;
  if (available === "true") where.available = true;
  else if (available === "false") where.available = false;

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "featured") orderBy = [{ featured: "desc" }, { rating: "desc" }];
  else if (sort === "rating") orderBy = { rating: "desc" };

  const products = await db.product.findMany({
    where,
    orderBy,
    include: { category: true },
  });

  return json(
    products.map((p) => ({
      ...p,
      gallery: p.gallery ? safeParse(p.gallery) : null,
    }))
  );
}

function safeParse(s: string): string[] | null {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : null;
  } catch {
    return null;
  }
}
