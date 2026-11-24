"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Copy, Truck, Store, Receipt } from "lucide-react";
import { useRoute, useRouter } from "@/lib/router";
import { formatINR, formatDateTime } from "@/lib/format";
import { LuxeButton } from "@/components/site/luxe-button";
import { Reveal } from "@/components/site/reveal";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ConfirmationView() {
  const route = useRoute();
  const { navigate } = useRouter();
  const id = route.path.split("/")[2] ?? "";
  const email = route.params.email ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id || !email) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${id}?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setOrder(data);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, email]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-20">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-champagne border-t-mocha" />
          <p className="font-editorial text-lg text-mocha">Retrieving your order…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background pt-20 text-center">
        <h1 className="font-display text-3xl text-espresso">Order not found</h1>
        <p className="max-w-sm font-editorial text-lg text-mocha">
          We couldn't locate this order. It may have been placed with a different email.
        </p>
        <LuxeButton variant="primary" size="md" onClick={() => navigate("/menu")}>
          Back to Menu
        </LuxeButton>
      </div>
    );
  }

  const copyNumber = () => {
    navigator.clipboard?.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container-luxe py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex size-20 items-center justify-center rounded-full bg-olive/10"
          >
            <CheckCircle2 className="size-11 text-olive" />
          </motion.div>
          <Reveal className="flex flex-col items-center gap-3">
            <span className="eyebrow">Order received</span>
            <h1 className="font-display text-4xl text-espresso sm:text-5xl text-balance">
              Thank you, {order.customerName.split(" ")[0]}.
            </h1>
            <p className="max-w-md font-editorial text-xl text-mocha text-pretty">
              Your order has been placed. We'll send updates to{" "}
              <span className="text-espresso">{order.email}</span>.
            </p>
          </Reveal>

          <div className="flex items-center gap-2">
            <span className="font-display text-lg text-mocha">Order</span>
            <code className="rounded-sm bg-secondary px-3 py-1 font-sans text-sm font-medium text-espresso">
              {order.orderNumber}
            </code>
            <button onClick={copyNumber} aria-label="Copy order number" className="text-mocha hover:text-espresso">
              {copied ? <CheckCircle2 className="size-4 text-olive" /> : <Copy className="size-4" />}
            </button>
          </div>

          {/* Status banner */}
          <div className={cn(
            "flex w-full items-center justify-center gap-2 rounded-sm border px-4 py-3 text-sm",
            order.fulfillment === "delivery"
              ? "border-champagne/40 bg-champagne/10 text-mocha"
              : "border-olive/30 bg-olive/5 text-olive"
          )}>
            {order.fulfillment === "delivery" ? <Truck className="size-4" /> : <Store className="size-4" />}
            {order.fulfillment === "delivery"
              ? "Delivery · Pay on arrival (test mode — no payment processed)"
              : "Pickup · Pay at counter (test mode — no payment processed)"}
          </div>
        </div>

        {/* Details */}
        <Reveal delay={0.15} className="mx-auto mt-12 max-w-2xl">
          <div className="border border-border bg-card p-6 shadow-luxe sm:p-8">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Receipt className="size-4 text-mocha" />
              <h2 className="font-display text-lg text-espresso">Order details</h2>
            </div>
            <ul className="flex flex-col divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex flex-col">
                    <span className="font-display text-base text-espresso">{item.productName}</span>
                    <span className="text-xs text-muted-foreground">{item.quantity} × {formatINR(item.price)}</span>
                  </div>
                  <span className="font-sans text-sm text-espresso">{formatINR(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={formatINR(order.subtotal)} />
              {order.discount > 0 && <Row label="Discount" value={`− ${formatINR(order.discount)}`} tone="olive" />}
              <Row label="Delivery" value={order.deliveryCharge === 0 ? "Complimentary" : formatINR(order.deliveryCharge)} />
              <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
                <span className="font-display text-lg text-espresso">Total</span>
                <span className="font-display text-xl text-espresso">{formatINR(order.total)}</span>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 border-t border-border pt-6 text-sm sm:grid-cols-2">
              <Info label="Placed">{formatDateTime(order.createdAt)}</Info>
              <Info label="Status"><span className="capitalize">{order.status}</span></Info>
              <Info label="Phone">{order.phone}</Info>
              <Info label="Fulfillment"><span className="capitalize">{order.fulfillment}</span></Info>
              {order.address && <Info label="Address" full>{order.address}</Info>}
              {order.instructions && <Info label="Instructions" full>{order.instructions}</Info>}
            </dl>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LuxeButton variant="primary" size="md" onClick={() => navigate("/menu")}>
            Continue browsing <ArrowRight className="size-4" />
          </LuxeButton>
          <LuxeButton variant="outline" size="md" onClick={() => navigate("/")}>
            Back to home
          </LuxeButton>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "olive" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mocha">{label}</span>
      <span className={cn("text-espresso", tone === "olive" && "text-olive")}>{value}</span>
    </div>
  );
}

function Info({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1", full && "sm:col-span-2")}>
      <dt className="eyebrow">{label}</dt>
      <dd className="font-editorial text-base text-espresso">{children}</dd>
    </div>
  );
}
