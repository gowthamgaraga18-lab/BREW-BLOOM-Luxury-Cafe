import { db } from "@/lib/db";
import { json, error } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) return error("Product not found", 404);

  let related: Awaited<ReturnType<typeof db.product.findMany>> = [];
  if (product) {
    related = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        available: true,
      },
      take: 4,
      include: { category: true },
    });
  }

  return json({
    ...product,
    gallery: product.gallery ? safeParse(product.gallery) : null,
    related,
  });
}

function safeParse(s: string): string[] | null {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : null;
  } catch {
    return null;
  }
}
