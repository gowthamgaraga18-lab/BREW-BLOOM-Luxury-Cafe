import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().int().min(0),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid request", 400);
  const { code, subtotal } = parsed.data;

  const discount = await db.discountCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!discount || !discount.active) {
    return json({ valid: false, discount: 0, code, message: "This code is not valid." });
  }
  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return json({ valid: false, discount: 0, code, message: "This code has expired." });
  }
  if (subtotal < discount.minSubtotal) {
    return json({
      valid: false,
      discount: 0,
      code,
      message: `Minimum order of ₹${discount.minSubtotal} required for this code.`,
    });
  }

  let amount = 0;
  if (discount.percentage) {
    amount = Math.round((subtotal * discount.percentage) / 100);
  } else if (discount.flatAmount) {
    amount = discount.flatAmount;
  }
  amount = Math.min(amount, subtotal);

  return json({ valid: true, discount: amount, code: discount.code });
}
