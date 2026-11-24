import { db } from "@/lib/db";
import { json, unauthorized } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  const [
    orders,
    pendingOrders,
    products,
    reservations,
    pendingReservations,
    messages,
    unreadMessages,
    customers,
  ] = await Promise.all([
    db.order.findMany({ select: { total: true, status: true } }),
    db.order.count({ where: { status: "pending" } }),
    db.product.count(),
    db.reservation.findMany({ select: { guests: true, status: true } }),
    db.reservation.count({ where: { status: "pending" } }),
    db.contactMessage.findMany({ select: { read: true } }),
    db.contactMessage.count({ where: { read: false } }),
    db.customer.count(),
  ]);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const confirmedReservations = reservations.filter(
    (r) => r.status === "confirmed"
  ).length;
  const totalGuests = reservations
    .filter((r) => r.status !== "cancelled")
    .reduce((s, r) => s + r.guests, 0);

  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { items: { select: { productName: true, quantity: true } } },
  });

  const upcomingReservations = await db.reservation.findMany({
    where: { status: { not: "cancelled" } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    take: 5,
  });

  return json({
    totals: {
      orders: orders.length,
      revenue,
      pendingOrders,
      products,
      reservations: reservations.length,
      pendingReservations,
      confirmedReservations,
      totalGuests,
      messages: messages.length,
      unreadMessages,
      customers,
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      itemCount: o.items.length,
      createdAt: o.createdAt.toISOString(),
    })),
    upcomingReservations: upcomingReservations.map((r) => ({
      id: r.id,
      name: r.name,
      date: r.date,
      time: r.time,
      guests: r.guests,
      status: r.status,
    })),
  });
}
