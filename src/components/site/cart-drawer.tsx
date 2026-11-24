"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, X, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart, useCartSubtotal, useCartDiscount } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useRouter } from "@/lib/router";
import { formatINR } from "@/lib/format";
import { CAFE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { LuxeButton } from "./luxe-button";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const cartOpen = useUI((s) => s.cartOpen);
  const closeCart = useUI((s) => s.closeCart);
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

  const handleApply = async () => {
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
        toast({
          title: "Coupon applied",
          description: `${data.code} — ${formatINR(data.discount)} off`,
        });
        setCode("");
      } else {
        toast({
          title: "Coupon not valid",
          description: data.message ?? "Please check the code and try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Could not validate coupon",
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  const goCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  const goCart = () => {
    closeCart();
    navigate("/cart");
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70]"
        >
          <div
            className="absolute inset-0 bg-espresso/50 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-luxe-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-mocha" />
                <h3 className="font-display text-lg text-espresso">Your Cart</h3>
                <span className="text-sm text-mocha">
                  ({items.reduce((n, i) => n + i.quantity, 0)})
                </span>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="text-espresso hover:text-mocha"
              >
                <X className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-secondary">
                  <ShoppingBag className="size-8 text-mocha" />
                </div>
                <div>
                  <p className="font-display text-xl text-espresso">
                    Your cart is empty
                  </p>
                  <p className="mt-1 font-editorial text-mocha">
                    Discover our signature brews and handcrafted delicacies.
                  </p>
                </div>
                <LuxeButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    closeCart();
                    navigate("/menu");
                  }}
                >
                  Explore the Menu
                </LuxeButton>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="flex flex-col divide-y divide-border">
                    {items.map((item) => (
                      <li key={item.productId} className="flex gap-4 py-4">
                        <div className="size-20 shrink-0 overflow-hidden rounded-sm bg-secondary">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display text-base leading-tight text-espresso">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => remove(item.productId)}
                              aria-label={`Remove ${item.name}`}
                              className="text-mocha hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <span className="text-sm text-mocha">
                            {formatINR(item.price)}
                          </span>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center border border-border">
                              <button
                                onClick={() => setQty(item.productId, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="flex size-8 items-center justify-center text-espresso hover:bg-secondary"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-8 text-center font-sans text-sm text-espresso">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => setQty(item.productId, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="flex size-8 items-center justify-center text-espresso hover:bg-secondary"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="font-display text-base text-espresso">
                              {formatINR(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="border-t border-border px-6 py-5">
                  {/* Coupon */}
                  <div className="mb-4">
                    {coupon ? (
                      <div className="flex items-center justify-between rounded-sm border border-olive/30 bg-olive/5 px-3 py-2">
                        <span className="flex items-center gap-2 text-sm text-olive">
                          <Tag className="size-3.5" />
                          {coupon.code} · {formatINR(coupon.amount)} off
                        </span>
                        <button
                          onClick={() => setCoupon(null)}
                          className="text-xs text-mocha hover:text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="Promo code"
                          className="h-9 flex-1 rounded-sm border border-border bg-card px-3 font-sans text-sm uppercase tracking-wide-2 text-espresso outline-none focus:border-mocha"
                        />
                        <LuxeButton
                          variant="dark"
                          size="sm"
                          onClick={handleApply}
                          disabled={validating || !code.trim()}
                        >
                          {validating ? "…" : "Apply"}
                        </LuxeButton>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between text-mocha">
                      <span>Subtotal</span>
                      <span className="text-espresso">{formatINR(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-olive">
                        <span>Discount</span>
                        <span>− {formatINR(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-mocha">
                      <span>Delivery</span>
                      <span className="text-espresso">
                        {subtotal - discount >= CAFE.freeDeliveryThreshold
                          ? "Complimentary"
                          : formatINR(CAFE.deliveryCharge)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between border-t border-border pt-2 font-display text-lg text-espresso">
                      <span>Estimated total</span>
                      <span>
                        {formatINR(
                          Math.max(0, subtotal - discount) +
                            (subtotal - discount >= CAFE.freeDeliveryThreshold
                              ? 0
                              : CAFE.deliveryCharge)
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <LuxeButton
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={goCheckout}
                    >
                      Checkout
                      <ArrowRight className="size-4" />
                    </LuxeButton>
                    <button
                      onClick={goCart}
                      className={cn(
                        "text-center font-sans text-[0.7rem] uppercase tracking-wide-2 text-mocha hover:text-espresso"
                      )}
                    >
                      View full cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
