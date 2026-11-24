import { json } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return json({ authenticated: false });
  return json({
    authenticated: true,
    admin: { email: session.email, name: session.name, role: session.role },
  });
}
