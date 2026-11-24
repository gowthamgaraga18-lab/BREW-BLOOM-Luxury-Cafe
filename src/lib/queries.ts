"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product, Category, Order, Reservation } from "./types";

export const QUERY_KEYS = {
  products: (params?: Record<string, string>) => ["products", params] as const,
  product: (slug: string) => ["product", slug] as const,
  categories: ["categories"] as const,
  adminSession: ["admin-session"] as const,
  adminStats: ["admin-stats"] as const,
  adminProducts: ["admin-products"] as const,
  adminOrders: ["admin-orders"] as const,
  adminReservations: ["admin-reservations"] as const,
  adminMessages: ["admin-messages"] as const,
  adminCustomers: ["admin-customers"] as const,
  adminCategories: ["admin-categories"] as const,
  adminDiscounts: ["admin-discounts"] as const,
};

export function useProducts(params?: Record<string, string>) {
  return useQuery({
    queryKey: QUERY_KEYS.products(params),
    queryFn: async () => {
      const qs = new URLSearchParams(params ?? {}).toString();
      const res = await fetch(`/api/products${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to load products");
      return (await res.json()) as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.product(slug),
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Product not found");
      return (await res.json()) as Product & { related: Product[] };
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      return (await res.json()) as (Category & { _count?: { products: number } })[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (payload: {
      customerName: string;
      email: string;
      phone: string;
      fulfillment: "delivery" | "pickup";
      address?: string;
      instructions?: string;
      couponCode?: string;
      items: { productId: string; quantity: number }[];
    }) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place order");
      return data as { success: boolean; order: Order };
    },
  });
}

export function useCreateReservation() {
  return useMutation({
    mutationFn: async (payload: Omit<Reservation, "id" | "status" | "createdAt">) => {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not reserve");
      return data as { success: boolean; reservation: Reservation };
    },
  });
}

/* Admin hooks */

export function useAdminSession() {
  return useQuery({
    queryKey: QUERY_KEYS.adminSession,
    queryFn: async () => {
      const res = await fetch("/api/admin/session");
      return (await res.json()) as {
        authenticated: boolean;
        admin?: { email: string; name: string; role: string };
      };
    },
    retry: 0,
  });
}

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.adminSession }),
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/admin/logout", { method: "POST" });
    },
    onSuccess: () => {
      qc.setQueryData(QUERY_KEYS.adminSession, { authenticated: false });
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: QUERY_KEYS.adminStats,
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) throw new Error("unauthorized");
      return res.json();
    },
    retry: 0,
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.adminProducts,
    queryFn: async () => {
      const res = await fetch("/api/admin/products");
      if (res.status === 401) throw new Error("unauthorized");
      return res.json();
    },
    retry: 0,
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.adminOrders,
    queryFn: async () => {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) throw new Error("unauthorized");
      return res.json();
    },
    retry: 0,
  });
}

export function useAdminReservations() {
  return useQuery({
    queryKey: QUERY_KEYS.adminReservations,
    queryFn: async () => {
      const res = await fetch("/api/admin/reservations");
      if (res.status === 401) throw new Error("unauthorized");
      return res.json();
    },
    retry: 0,
  });
}

export function useAdminMessages() {
  return useQuery({
    queryKey: QUERY_KEYS.adminMessages,
    queryFn: async () => {
      const res = await fetch("/api/admin/messages");
      if (res.status === 401) throw new Error("unauthorized");
      return res.json();
    },
    retry: 0,
  });
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: QUERY_KEYS.adminCustomers,
    queryFn: async () => {
      const res = await fetch("/api/admin/customers");
      if (res.status === 401) throw new Error("unauthorized");
      return res.json();
    },
    retry: 0,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.adminCategories,
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) throw new Error("unauthorized");
      return res.json();
    },
    retry: 0,
  });
}
