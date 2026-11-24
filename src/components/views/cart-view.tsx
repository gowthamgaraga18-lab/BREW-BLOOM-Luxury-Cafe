"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, X } from "lucide-react";
import { useCart, useCartSubtotal, useCartDiscount } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useRouter } from "@/lib/router";
import { formatINR } from "@/lib/format";
import { CAFE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { LuxeButton } from "@/components/site/luxe-button";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

export function CartView() {
  const { navigate } = useRouter();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const setCoupon = useCart((s) => s.setCoupon);
  const coupon = useCart((s) => s.coupon);
  const subtotal = useCartSubtotal();
  const discount = useCartDiscount();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const delivery = items.length > 0 && discountedSubtotal < CAFE.freeDeliveryThreshold ? CAFE.deliveryCharge : 0;
  const total = discountedSubtotal + delivery;

  const applyCoupon = async () => {
    if (!code.trim()) return;
    setValidating(true);
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({ code: data.code, amount: data.discount });
        toast({ title: "Coupon applied", description: `${data.code} — ${formatINR(data.discount)} off` });
        setCode("");
      } else {
        toast({ title: "Coupon not valid", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Could not validate coupon", variant: "destructive" });
    } finally {
      setValidating(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background pt-20 text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="size-9 text-mocha" />
        </div>
        <h1 className="font-display text-4xl text-espresso">Your cart is empty</h1>
        <p className="max-w-sm font-editorial text-xl text-mocha">
          Discover our signature brews and handcrafted delicacies.
        </p>
        <LuxeButton variant="primary" size="lg" onClick={() => navigate("/menu")}>
          Explore the Menu <ArrowRight className="size-4" />
        </LuxeButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container-luxe py-12">
        <Reveal className="mb-8 flex flex-col gap-2">
          <span className="eyebrow">Cart</span>
          <h1 className="font-display text-4xl text-espresso sm:text-5xl">Your selection</h1>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Items */}
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-5 border border-border bg-card p-4 shadow-luxe sm:p-5"
              >
                <button
                  onClick={() => navigate(`/product/${item.slug}`)}
                  className="size-24 shrink-0 overflow-hidden rounded-sm bg-secondary sm:size-28"
                >
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </button>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => navigate(`/product/${item.slug}`)} className="text-left">
                      <h3 className="font-display text-lg text-espresso hover:text-mocha">{item.name}</h3>
                    </button>
                    <button
                      onClick={() => remove(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="text-mocha hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <span className="text-sm text-mocha">{formatINR(item.price)} each</span>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button onClick={() => setQty(item.productId, item.quantity - 1)} aria-label="Decrease" className="flex size-9 items-center justify-center text-espresso hover:bg-secondary">
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-10 text-center font-sans text-sm text-espresso">{item.quantity}</span>
                      <button onClick={() => setQty(item.productId, item.quantity + 1)} aria-label="Increase" className="flex size-9 items-center justify-center text-espresso hover:bg-secondary">
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <span className="font-display text-xl text-espresso">{formatINR(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}

            <LuxeButton variant="link" size="sm" className="w-fit px-0" onClick={() => navigate("/menu")}>
              <ArrowLeft className="size-4" /> Continue shopping
            </LuxeButton>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-5 border border-border bg-card p-6 shadow-luxe sm:p-8">
              <h2 className="font-display text-xl text-espresso">Order summary</h2>

              {/* Coupon */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between rounded-sm border border-olive/30 bg-olive/5 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-olive">
                      <Tag className="size-3.5" /> {coupon.code} · {formatINR(coupon.amount)} off
                    </span>
                    <button onClick={() => setCoupon(null)} aria-label="Remove coupon" className="text-mocha hover:text-destructive">
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Promo code"
                      className="h-10 flex-1 rounded-sm border border-border bg-background px-3 font-sans text-sm uppercase tracking-wide-2 text-espresso outline-none focus:border-mocha"
                    />
                    <LuxeButton variant="dark" size="sm" onClick={applyCoupon} disabled={validating || !code.trim()}>
                      {validating ? "…" : "Apply"}
                    </LuxeButton>
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">Try BLOOM10, WEEKEND15 or FREESHIP</p>
              </div>

              <div className="hairline" />

              <div className="flex flex-col gap-2.5 text-sm">
                <Row label="Subtotal" value={formatINR(subtotal)} />
                {discount > 0 && <Row label="Discount" value={`− ${formatINR(discount)}`} tone="olive" />}
                <Row
                  label="Delivery"
                  value={delivery === 0 ? "Complimentary" : formatINR(delivery)}
                  sub={delivery === 0 ? undefined : `Free above ${formatINR(CAFE.freeDeliveryThreshold)}`}
                />
              </div>

              <div className="hairline" />

              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-espresso">Total</span>
                <span className="font-display text-2xl text-espresso">{formatINR(total)}</span>
              </div>

              <LuxeButton variant="primary" size="lg" className="w-full" onClick={() => navigate("/checkout")}>
                Proceed to Checkout <ArrowRight className="size-4" />
              </LuxeButton>
              <p className="text-center text-xs text-muted-foreground">
                Test mode — no real payment is processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "olive" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mocha">
        {label}
        {sub && <span className={cn("block text-xs", tone === "olive" ? "text-olive" : "text-muted-foreground")}>{sub}</span>}
      </span>
      <span className={cn("text-espresso", tone === "olive" && "text-olive")}>{value}</span>
    </div>
  );
}
