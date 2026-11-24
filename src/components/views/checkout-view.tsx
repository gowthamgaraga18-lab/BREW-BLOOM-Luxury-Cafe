"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Truck, Store, Check, Lock, ShieldCheck } from "lucide-react";
import { useCart, useCartSubtotal, useCartDiscount } from "@/lib/cart-store";
import { useCreateOrder } from "@/lib/queries";
import { useRouter } from "@/lib/router";
import { formatINR } from "@/lib/format";
import { CAFE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { LuxeButton } from "@/components/site/luxe-button";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

export function CheckoutView() {
  const { navigate } = useRouter();
  const items = useCart((s) => s.items);
  const coupon = useCart((s) => s.coupon);
  const clear = useCart((s) => s.clear);
  const subtotal = useCartSubtotal();
  const discount = useCartDiscount();
  const mutation = useCreateOrder();
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    fulfillment: "delivery" as "delivery" | "pickup",
    address: "",
    instructions: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  if (items.length === 0 && !mutation.isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background pt-20 text-center">
        <h1 className="font-display text-4xl text-espresso">Nothing to check out</h1>
        <p className="max-w-sm font-editorial text-xl text-mocha">Your cart is empty.</p>
        <LuxeButton variant="primary" size="lg" onClick={() => navigate("/menu")}>
          Explore the Menu
        </LuxeButton>
      </div>
    );
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const delivery = form.fulfillment === "delivery" && discountedSubtotal < CAFE.freeDeliveryThreshold ? CAFE.deliveryCharge : 0;
  const total = discountedSubtotal + delivery;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.customerName.trim().length < 2) e.customerName = "Please enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.phone.trim().length < 7) e.phone = "Enter a valid phone number.";
    if (form.fulfillment === "delivery" && form.address.trim().length < 8) e.address = "Enter your full delivery address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast({ title: "Please check the form", variant: "destructive" });
      return;
    }
    try {
      const res = await mutation.mutateAsync({
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        fulfillment: form.fulfillment,
        address: form.fulfillment === "delivery" ? form.address : undefined,
        instructions: form.instructions || undefined,
        couponCode: coupon?.code,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      clear();
      toast({ title: "Order placed", description: res.order.orderNumber });
      navigate(`/confirmation/${res.order.id}?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      toast({ title: "Could not place order", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container-luxe py-12">
        <Reveal className="mb-8 flex flex-col gap-2">
          <span className="eyebrow">Checkout</span>
          <h1 className="font-display text-4xl text-espresso sm:text-5xl">Almost there.</h1>
        </Reveal>

        <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Form */}
          <div className="flex flex-col gap-8">
            {/* Contact */}
            <section className="border border-border bg-card p-6 shadow-luxe sm:p-8">
              <h2 className="mb-5 font-display text-xl text-espresso">Contact details</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" error={errors.customerName}>
                  <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} className={inputCls(!!errors.customerName)} placeholder="Your name" />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls(!!errors.phone)} placeholder="+91 …" />
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Email" error={errors.email}>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(!!errors.email)} placeholder="you@example.com" />
                </Field>
              </div>
            </section>

            {/* Fulfillment */}
            <section className="border border-border bg-card p-6 shadow-luxe sm:p-8">
              <h2 className="mb-5 font-display text-xl text-espresso">How would you like it?</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <FulfillmentOption
                  active={form.fulfillment === "delivery"}
                  onClick={() => set("fulfillment", "delivery")}
                  icon={Truck}
                  title="Delivery"
                  desc={`To your address · ${formatINR(CAFE.deliveryCharge)} (free above ${formatINR(CAFE.freeDeliveryThreshold)})`}
                />
                <FulfillmentOption
                  active={form.fulfillment === "pickup"}
                  onClick={() => set("fulfillment", "pickup")}
                  icon={Store}
                  title="Pickup"
                  desc={`Collect at ${CAFE.address.split(",")[0]}`}
                />
              </div>

              {form.fulfillment === "delivery" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-5">
                  <Field label="Delivery address" error={errors.address}>
                    <textarea value={form.address} onChange={(e) => set("address", e.target.value)} rows={3} className={inputCls(!!errors.address)} placeholder="Flat, street, landmark, city, PIN" />
                  </Field>
                </motion.div>
              )}

              <div className="mt-5">
                <Field label="Additional instructions" optional>
                  <textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)} rows={2} className={inputCls(false)} placeholder="Ring once, leave at desk, sugar on the side…" />
                </Field>
              </div>
            </section>

            {/* Payment (test mode) */}
            <section className="border border-border bg-card p-6 shadow-luxe sm:p-8">
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-mocha" />
                <h2 className="font-display text-xl text-espresso">Payment</h2>
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-sm border border-champagne/40 bg-champagne/10 p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-mocha" />
                <div>
                  <p className="font-sans text-sm font-medium text-espresso">Test mode — no live payment</p>
                  <p className="mt-1 text-sm text-mocha">
                    Orders are placed as pay-on-delivery. No card details are
                    collected and no payment is processed until live credentials
                    are configured.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-mocha">
                <Check className="size-4 text-olive" /> Pay on delivery / pickup
              </div>
            </section>

            <LuxeButton variant="link" size="sm" className="w-fit px-0" onClick={() => navigate("/cart")}>
              <ArrowLeft className="size-4" /> Back to cart
            </LuxeButton>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-5 border border-border bg-card p-6 shadow-luxe sm:p-8">
              <h2 className="font-display text-xl text-espresso">Your order</h2>
              <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="size-14 rounded-sm object-cover" />
                    <div className="flex flex-1 flex-col">
                      <span className="font-display text-sm text-espresso">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.quantity} × {formatINR(item.price)}</span>
                    </div>
                    <span className="font-sans text-sm text-espresso">{formatINR(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="hairline" />

              <div className="flex flex-col gap-2 text-sm">
                <Row label="Subtotal" value={formatINR(subtotal)} />
                {discount > 0 && <Row label={`Discount (${coupon?.code})`} value={`− ${formatINR(discount)}`} tone="olive" />}
                <Row label="Delivery" value={delivery === 0 ? "Complimentary" : formatINR(delivery)} />
              </div>

              <div className="hairline" />

              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-espresso">Total</span>
                <span className="font-display text-2xl text-espresso">{formatINR(total)}</span>
              </div>

              <LuxeButton type="submit" variant="primary" size="lg" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Placing order…" : "Place Order"}
                {!mutation.isPending && <ArrowRight className="size-4" />}
              </LuxeButton>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" /> Secured · No payment processed
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, optional, children }: { label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center gap-2 font-sans text-xs uppercase tracking-wide-2 text-mocha">
        {label}
        {optional && <span className="text-muted-foreground/60 normal-case tracking-normal">(optional)</span>}
      </span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

function inputCls(hasError: boolean, extra = "") {
  return cn(
    "h-11 w-full rounded-sm border bg-background px-3 font-sans text-sm text-espresso outline-none transition-colors focus:border-mocha",
    hasError ? "border-destructive" : "border-border",
    extra
  );
}

function FulfillmentOption({ active, onClick, icon: Icon, title, desc }: { active: boolean; onClick: () => void; icon: typeof Truck; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-sm border p-4 text-left transition-all",
        active ? "border-espresso bg-espresso/5 shadow-luxe" : "border-border bg-background hover:border-mocha"
      )}
    >
      <Icon className={cn("size-5", active ? "text-espresso" : "text-mocha")} />
      <span className="font-display text-base text-espresso">{title}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
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
