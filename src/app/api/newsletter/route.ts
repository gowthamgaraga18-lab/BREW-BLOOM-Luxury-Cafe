import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("A valid email is required.", 400);

  const existing = await db.newsletterSubscriber.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existing) {
    return json({ success: true, already: true, message: "You're already on our list." });
  }
  await db.newsletterSubscriber.create({
    data: { email: parsed.data.email.toLowerCase() },
  });
  return json({ success: true });
}
