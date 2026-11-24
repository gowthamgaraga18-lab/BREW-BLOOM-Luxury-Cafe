"use client";

import { useState, Fragment } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAdminOrders, QUERY_KEYS } from "@/lib/queries";
import { formatINR, formatDateTime } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import type { Order } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-champagne/20 text-mocha",
  confirmed: "bg-olive/15 text-olive",
  preparing: "bg-amber-100 text-amber-700",
  ready: "bg-blue-100 text-blue-700",
  completed: "bg-olive/15 text-olive",
  cancelled: "bg-red-100 text-red-700",
};

export function OrdersPanel() {
  const { data: orders, isLoading } = useAdminOrders();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl text-espresso">Orders</h2>
        <p className="text-sm text-muted-foreground">{orders?.length ?? 0} total orders</p>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-card shadow-luxe">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr className="text-xs uppercase tracking-wide-2 text-mocha">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Loading orders…</td></tr>
              ) : (orders ?? []).length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No orders yet.</td></tr>
              ) : (
                (orders ?? []).map((o: Order) => (
                  <Fragment key={o.id}>
                    <tr
                      className="cursor-pointer hover:bg-secondary/30"
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {expanded === o.id ? <ChevronDown className="size-4 text-mocha" /> : <ChevronRight className="size-4 text-mocha" />}
                          <div className="flex flex-col">
                            <span className="font-sans text-sm text-espresso">{o.orderNumber}</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-espresso">{o.customerName}</span>
                          <span className="text-xs text-muted-foreground">{o.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-espresso">{formatINR(o.total)}</td>
                      <td className="px-4 py-3">
                        <PaymentSelect order={o} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect order={o} />
                      </td>
                    </tr>
                    {expanded === o.id && (
                      <tr key={o.id + "-detail"} className="bg-secondary/20">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="eyebrow mb-2">Items</p>
                              <ul className="flex flex-col gap-1">
                                {o.items.map((it) => (
                                  <li key={it.id} className="flex justify-between text-sm">
                                    <span className="text-espresso">{it.quantity}× {it.productName}</span>
                                    <span className="text-muted-foreground">{formatINR(it.price * it.quantity)}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-3 flex flex-col gap-1 border-t border-border pt-2 text-xs text-muted-foreground">
                                <span>Subtotal: {formatINR(o.subtotal)}</span>
                                {o.discount > 0 && <span>Discount: −{formatINR(o.discount)}</span>}
                                <span>Delivery: {formatINR(o.deliveryCharge)}</span>
                              </div>
                            </div>
                            <div>
                              <p className="eyebrow mb-2">Details</p>
                              <dl className="flex flex-col gap-1 text-sm">
                                <Detail label="Fulfillment" value={o.fulfillment} />
                                <Detail label="Phone" value={o.phone} />
                                {o.address && <Detail label="Address" value={o.address} />}
                                {o.instructions && <Detail label="Notes" value={o.instructions} />}
                                <Detail label="Payment" value={`${o.paymentMode} · ${o.paymentStatus}`} />
                              </dl>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusSelect({ order }: { order: Order }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminOrders });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminStats });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });
  return (
    <select
      value={order.status}
      disabled={mutation.isPending}
      onChange={(e) => { mutation.mutate(e.target.value); toast({ title: "Status updated", description: `${order.orderNumber} → ${e.target.value}` }); }}
      className={cn("rounded-full border-0 px-2 py-1 text-[0.7rem] capitalize outline-none", STATUS_COLORS[order.status] ?? "bg-secondary text-mocha")}
    >
      {ORDER_STATUSES.map((s) => <option key={s} value={s} className="bg-card capitalize text-espresso">{s}</option>)}
    </select>
  );
}

function PaymentSelect({ order }: { order: Order }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: async (paymentStatus: string) => {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminOrders });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminStats });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });
  return (
    <select
      value={order.paymentStatus}
      disabled={mutation.isPending}
      onChange={(e) => { mutation.mutate(e.target.value); toast({ title: "Payment updated", description: `${order.orderNumber} → ${e.target.value}` }); }}
      className={cn("rounded-full border-0 px-2 py-1 text-[0.7rem] capitalize outline-none", order.paymentStatus === "paid" ? "bg-olive/15 text-olive" : order.paymentStatus === "refunded" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}
    >
      {PAYMENT_STATUSES.map((s) => <option key={s} value={s} className="bg-card capitalize text-espresso">{s}</option>)}
    </select>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right capitalize text-espresso">{value}</dd>
    </div>
  );
}
