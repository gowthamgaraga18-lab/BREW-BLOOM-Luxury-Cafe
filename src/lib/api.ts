import { NextResponse } from "next/server";
import { getAdminSession } from "./auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function getAdminOrFail() {
  const session = await getAdminSession();
  return session;
}
