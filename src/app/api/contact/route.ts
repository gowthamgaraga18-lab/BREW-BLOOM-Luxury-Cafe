import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  subject: z.string().min(2).max(120),
  message: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return error("Please complete all fields correctly.", 400);
  }
  const msg = await db.contactMessage.create({ data: parsed.data });
  return json({ success: true, id: msg.id });
}
