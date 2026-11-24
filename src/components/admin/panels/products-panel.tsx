"use client";

import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Star, X } from "lucide-react";
import { useAdminProducts, useAdminCategories, QUERY_KEYS } from "@/lib/queries";
import { formatINR } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LuxeButton } from "@/components/site/luxe-button";
import type { Product } from "@/lib/types";

export function ProductsPanel() {
  const { data: products, isLoading } = useAdminProducts();
  const { data: categories } = useAdminCategories();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = (products ?? []).filter(
    (p: Product) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-espresso">Products</h2>
          <p className="text-sm text-muted-foreground">{products?.length ?? 0} items on the menu</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mocha" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="h-10 w-full rounded-sm border border-border bg-card pl-9 pr-3 font-sans text-sm text-espresso outline-none focus:border-mocha"
            />
          </div>
          <LuxeButton variant="primary" size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Add
          </LuxeButton>
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-card shadow-luxe">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr className="text-xs uppercase tracking-wide-2 text-mocha">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Loading products…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No products found.</td></tr>
              ) : (
                filtered.map((p: Product) => (
                  <tr key={p.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="size-10 rounded-sm object-cover" />
                        <div className="flex flex-col">
                          <span className="font-display text-sm text-espresso">{p.name}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            {p.featured && <Star className="size-3 fill-champagne text-champagne" />}
                            {p.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-mocha">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-espresso">{formatINR(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem]", p.available ? "bg-olive/15 text-olive" : "bg-red-100 text-red-700")}>
                        {p.available ? "Available" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing(p)} aria-label="Edit" className="flex size-8 items-center justify-center text-mocha hover:bg-secondary hover:text-espresso">
                          <Pencil className="size-4" />
                        </button>
                        <DeleteButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(editing || creating) && (
        <ProductDialog
          product={editing}
          categories={categories ?? []}
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not delete");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminStats });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.products() });
      toast({ title: "Product deleted" });
    },
    onError: (err: Error) => toast({ title: "Could not delete", description: err.message, variant: "destructive" }),
  });
  return (
    <button
      onClick={() => { if (confirm(`Delete "${name}"? This cannot be undone.`)) mutation.mutate(); }}
      aria-label="Delete"
      className="flex size-8 items-center justify-center text-mocha hover:bg-red-50 hover:text-destructive"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

function ProductDialog({
  product,
  categories,
  onClose,
}: {
  product: Product | null;
  categories: { id: string; name: string }[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    price: product?.price ?? 0,
    description: product?.description ?? "",
    image: product?.image ?? "",
    available: product?.available ?? true,
    vegetarian: product?.vegetarian ?? true,
    featured: product?.featured ?? false,
    rating: product?.rating ?? 4.8,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.categoryId || form.price < 0 || !form.image) {
      toast({ title: "Please complete all fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminStats });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.products() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.product(product?.slug ?? "") });
      toast({ title: product ? "Product updated" : "Product created" });
      onClose();
    } catch (err) {
      toast({ title: "Could not save", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-espresso">
            {product ? "Edit product" : "New product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-4">
          <Field label="Name">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inp} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inp}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Price (₹)">
              <input type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))} className={inp} />
            </Field>
          </div>
          <Field label="Image URL">
            <input value={form.image} onChange={(e) => set("image", e.target.value)} className={inp} placeholder="https://…" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={inp} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle label="Available" checked={form.available} onChange={(v) => set("available", v)} />
            <Toggle label="Vegetarian" checked={form.vegetarian} onChange={(v) => set("vegetarian", v)} />
            <Toggle label="Featured" checked={form.featured} onChange={(v) => set("featured", v)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <LuxeButton type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</LuxeButton>
            <LuxeButton type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </LuxeButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-sans text-xs uppercase tracking-wide-2 text-mocha">{label}</span>
      {children}
    </label>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={cn("flex items-center justify-between rounded-sm border px-3 py-2 text-sm", checked ? "border-espresso bg-espresso/5 text-espresso" : "border-border text-muted-foreground")}>
      {label}
      <span className={cn("size-4 rounded-full", checked ? "bg-olive" : "bg-secondary")} />
    </button>
  );
}
const inp = "h-10 w-full rounded-sm border border-border bg-background px-3 font-sans text-sm text-espresso outline-none focus:border-mocha";
