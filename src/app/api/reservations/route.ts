import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { z } from "zod";
import { RESERVATION_SLOTS } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date."),
  time: z.string(),
  guests: z.number().int().min(1).max(12),
  specialRequests: z.string().max(500).optional(),
});

const MAX_GUESTS_PER_SLOT = 24;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid reservation.";
    return error(msg, 400);
  }
  const data = parsed.data;

  if (!RESERVATION_SLOTS.includes(data.time)) {
    return error("Please choose a valid time slot.", 400);
  }

  // Date must be today or future, within 60 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chosen = new Date(`${data.date}T00:00:00`);
  if (isNaN(chosen.getTime())) return error("Invalid date.", 400);
  const diffDays = Math.round((chosen.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return error("Please choose a future date.", 400);
  if (diffDays > 60) return error("Reservations open up to 60 days ahead.", 400);

  // Duplicate prevention: same email + date + time
  const dup = await db.reservation.findFirst({
    where: { email: data.email.toLowerCase(), date: data.date, time: data.time },
  });
  if (dup) {
    return error("You already have a reservation for this date and time.", 400);
  }

  // Slot capacity: sum of guests already booked (non-cancelled) + new must fit
  const existing = await db.reservation.findMany({
    where: { date: data.date, time: data.time, status: { not: "cancelled" } },
    select: { guests: true },
  });
  const booked = existing.reduce((s, r) => s + r.guests, 0);
  if (booked + data.guests > MAX_GUESTS_PER_SLOT) {
    return error(
      `This slot is fully booked. Please choose another time.`,
      400
    );
  }

  const reservation = await db.reservation.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      date: data.date,
      time: data.time,
      guests: data.guests,
      specialRequests: data.specialRequests?.trim() || null,
      status: "pending",
    },
  });

  return json({ success: true, reservation }, 201);
}
