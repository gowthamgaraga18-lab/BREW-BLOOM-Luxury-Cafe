"use client";

import { TrendingUp, ShoppingBag, CalendarCheck, Package, Mail, Users, ArrowUpRight, Clock } from "lucide-react";
import { useAdminStats } from "@/lib/queries";
import { formatINR, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Section } from "../dashboard-types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-champagne/20 text-mocha",
  confirmed: "bg-olive/15 text-olive",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-amber-100 text-amber-700",
  completed: "bg-olive/15 text-olive",
  cancelled: "bg-red-100 text-red-700",
};

export function OverviewPanel({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { data, isLoading, isError } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-sm border border-border bg-card" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="rounded-sm border border-border bg-card p-8 text-center text-mocha">Could not load dashboard data.</div>;
  }

  const t = data.totals;
  const stats = [
    { label: "Total Revenue", value: formatINR(t.revenue), icon: TrendingUp, sub: "From non-cancelled orders" },
    { label: "Orders", value: String(t.orders), icon: ShoppingBag, sub: `${t.pendingOrders} pending` },
    { label: "Reservations", value: String(t.reservations), icon: CalendarCheck, sub: `${t.pendingReservations} pending · ${t.confirmedReservations} confirmed` },
    { label: "Products", value: String(t.products), icon: Package, sub: "On the menu" },
    { label: "Customers", value: String(t.customers), icon: Users, sub: "Registered" },
    { label: "Messages", value: String(t.messages), icon: Mail, sub: `${t.unreadMessages} unread` },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-sm border border-border bg-card p-5 shadow-luxe">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{s.label}</span>
              <s.icon className="size-4 text-mocha" />
            </div>
            <div className="mt-3 font-display text-3xl text-espresso">{s.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-sm border border-border bg-card p-5 shadow-luxe">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-display text-lg text-espresso">Recent orders</h3>
            <button onClick={() => onNavigate("orders")} className="flex items-center gap-1 text-xs text-mocha hover:text-espresso">
              All <ArrowUpRight className="size-3" />
            </button>
          </div>
          <ul className="flex flex-col divide-y divide-border">
            {data.recentOrders.map((o: any) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div className="flex flex-col">
                  <span className="font-sans text-sm text-espresso">{o.orderNumber}</span>
                  <span className="text-xs text-muted-foreground">{o.customerName} · {formatINR(o.total)}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] capitalize", STATUS_COLORS[o.status] ?? "bg-secondary text-mocha")}>{o.status}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{formatDateTime(o.createdAt)}</span>
                </div>
              </li>
            ))}
            {data.recentOrders.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No orders yet.</li>}
          </ul>
        </div>

        {/* Upcoming reservations */}
        <div className="rounded-sm border border-border bg-card p-5 shadow-luxe">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-display text-lg text-espresso">Upcoming reservations</h3>
            <button onClick={() => onNavigate("reservations")} className="flex items-center gap-1 text-xs text-mocha hover:text-espresso">
              All <ArrowUpRight className="size-3" />
            </button>
          </div>
          <ul className="flex flex-col divide-y divide-border">
            {data.upcomingReservations.map((r: any) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div className="flex flex-col">
                  <span className="font-sans text-sm text-espresso">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.date} · {r.time} · {r.guests} guests</span>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] capitalize", STATUS_COLORS[r.status] ?? "bg-secondary text-mocha")}>{r.status}</span>
              </li>
            ))}
            {data.upcomingReservations.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No reservations.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
