"use client";

import { Mail, Phone, ShoppingBag } from "lucide-react";
import { useAdminCustomers } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export function CustomersPanel() {
  const { data: customers, isLoading } = useAdminCustomers();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl text-espresso">Customers</h2>
        <p className="text-sm text-muted-foreground">{customers?.length ?? 0} registered customers</p>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-card shadow-luxe">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr className="text-xs uppercase tracking-wide-2 text-mocha">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Loading customers…</td></tr>
              ) : (customers ?? []).length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No customers yet.</td></tr>
              ) : (
                (customers ?? []).map((c: any) => (
                  <tr key={c.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-secondary font-display text-sm text-espresso">
                          {(c.name ?? c.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-display text-sm text-espresso">{c.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs text-mocha"><Mail className="size-3" />{c.email}</span>
                        {c.phone && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="size-3" />{c.phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-espresso"><ShoppingBag className="size-3.5 text-mocha" />{c.orderCount}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
