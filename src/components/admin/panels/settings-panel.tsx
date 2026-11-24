"use client";

import { useQuery } from "@tanstack/react-query";
import { Tag, Percent, IndianRupee, CheckCircle2 } from "lucide-react";
import { CAFE } from "@/lib/constants";

export function SettingsPanel() {
  const { data: discounts } = useQuery({
    queryKey: ["admin-discounts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/discounts");
      if (res.status === 401) throw new Error("unauthorized");
      return res.json();
    },
    retry: 0,
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) throw new Error("unauthorized");
      return res.json();
    },
    retry: 0,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-espresso">Settings</h2>
        <p className="text-sm text-muted-foreground">Café details, discounts and categories.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Café info */}
        <div className="rounded-sm border border-border bg-card p-6 shadow-luxe">
          <h3 className="mb-4 font-display text-lg text-espresso">Café information</h3>
          <dl className="flex flex-col gap-3 text-sm">
            <Row label="Name" value={CAFE.name} />
            <Row label="Tagline" value={CAFE.tagline} />
            <Row label="Phone" value={CAFE.phone} />
            <Row label="Email" value={CAFE.email} />
            <Row label="Address" value={CAFE.address} />
            <Row label="Hours" value={CAFE.hours} />
            <Row label="Delivery charge" value={`₹${CAFE.deliveryCharge} (free above ₹${CAFE.freeDeliveryThreshold})`} />
            <Row label="Payment mode" value="Test — pay on delivery / pickup" />
          </dl>
        </div>

        {/* Discounts */}
        <div className="rounded-sm border border-border bg-card p-6 shadow-luxe">
          <h3 className="mb-4 font-display text-lg text-espresso">Discount codes</h3>
          <ul className="flex flex-col divide-y divide-border">
            {(discounts ?? []).map((d: any) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Tag className="size-4 text-mocha" />
                  <div>
                    <span className="font-display text-base text-espresso">{d.code}</span>
                    <p className="text-xs text-muted-foreground">
                      {d.percentage ? `${d.percentage}% off` : `₹${d.flatAmount} off`}
                      {d.minSubtotal > 0 ? ` · min ₹${d.minSubtotal}` : ""}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-olive">
                  <CheckCircle2 className="size-3.5" /> {d.active ? "Active" : "Inactive"}
                </span>
              </li>
            ))}
            {(discounts ?? []).length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No discount codes.</li>}
          </ul>
        </div>

        {/* Categories */}
        <div className="rounded-sm border border-border bg-card p-6 shadow-luxe lg:col-span-2">
          <h3 className="mb-4 font-display text-lg text-espresso">Menu categories</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(categories ?? []).map((c: any) => (
              <div key={c.id} className="rounded-sm border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-base text-espresso">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c._count?.products ?? 0} items</span>
                </div>
                <p className="mt-1 font-editorial text-sm text-mocha">{c.description ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-2">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-right font-editorial text-base text-espresso">{value}</dd>
    </div>
  );
}
