import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid credentials.", 400);

  const admin = await db.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!admin) return error("Invalid credentials.", 401);
  if (!verifyPassword(parsed.data.password, admin.passwordHash)) {
    return error("Invalid credentials.", 401);
  }

  await setSessionCookie({
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  return json({
    success: true,
    admin: { email: admin.email, name: admin.name, role: admin.role },
  });
}
