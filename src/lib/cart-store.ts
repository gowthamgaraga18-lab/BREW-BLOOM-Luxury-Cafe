"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  coupon: { code: string; amount: number } | null;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  setCoupon: (coupon: { code: string; amount: number } | null) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: qty }] };
        }),
      remove: (productId) =>
        set((s) => ({
          items: s.items.filter((i) => i.productId !== productId),
        })),
      setQty: (productId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: qty } : i
                ),
        })),
      setCoupon: (coupon) => set({ coupon }),
      clear: () => set({ items: [], coupon: null }),
    }),
    { name: "brewbloom-cart-v1" }
  )
);

export function useCartCount(): number {
  return useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
}

export function useCartSubtotal(): number {
  return useCart((s) =>
    s.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
}

export function useCartDiscount(): number {
  return useCart((s) => s.coupon?.amount ?? 0);
}

export function useCartDiscountedSubtotal(): number {
  return useCart((s) => {
    const subtotal = s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return Math.max(0, subtotal - (s.coupon?.amount ?? 0));
  });
}
