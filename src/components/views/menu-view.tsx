"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useProducts, useCategories } from "@/lib/queries";
import { useRoute, useRouter } from "@/lib/router";
import { ProductCard } from "@/components/site/product-card";
import { PageHero } from "@/components/site/page-hero";
import { RevealStagger } from "@/components/site/reveal";
import { GALLERY_IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Most loved" },
  { value: "price-asc", label: "Price · Low to High" },
  { value: "price-desc", label: "Price · High to Low" },
];

export function MenuView() {
  const route = useRoute();
  const { navigate } = useRouter();
  // Category is the single source of truth from the URL hash.
  const category = route.params.category ?? "all";
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const { data: categories } = useCategories();

  const params = useMemo(() => {
    const p: Record<string, string> = { sort };
    if (category !== "all") p.category = category;
    if (search.trim()) p.search = search.trim();
    return p;
  }, [category, search, sort]);

  const { data: products, isLoading } = useProducts(params);

  const setCat = (slug: string) => {
    navigate(`/menu${slug !== "all" ? `?category=${slug}` : ""}`);
  };

  return (
    <div>
      <PageHero
        eyebrow="The Menu"
        title="Every cup, considered."
        description="Single-origin espresso, handcrafted pastry and seasonal signatures — browse the full counter."
        image={GALLERY_IMAGES[3] ?? GALLERY_IMAGES[0]}
      />

      <div className="border-b border-border bg-background sticky top-20 z-30 glass-light">
        <div className="container-luxe flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Categories */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryChip active={category === "all"} onClick={() => setCat("all")}>
              All
            </CategoryChip>
            {(categories ?? []).map((c) => (
              <CategoryChip key={c.id} active={category === c.slug} onClick={() => setCat(c.slug)}>
                {c.name}
              </CategoryChip>
            ))}
          </div>

          {/* Search + sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-56">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mocha" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the menu"
                className="h-10 w-full rounded-sm border border-border bg-card pl-9 pr-8 font-sans text-sm text-espresso outline-none focus:border-mocha"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-mocha hover:text-espresso"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mocha" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 appearance-none rounded-sm border border-border bg-card pl-9 pr-8 font-sans text-sm text-espresso outline-none focus:border-mocha"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-background py-16">
        <div className="container-luxe">
          <div className="mb-8 flex items-baseline justify-between">
            <p className="font-sans text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${products?.length ?? 0} items`}
              {category !== "all" && categories ? ` · ${categories.find((c) => c.slug === category)?.name}` : ""}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] w-full rounded-sm bg-secondary" />
                  <div className="mt-4 h-4 w-1/3 rounded bg-secondary" />
                  <div className="mt-2 h-5 w-2/3 rounded bg-secondary" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <RevealStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </RevealStagger>
          ) : (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
                <Search className="size-7 text-mocha" />
              </div>
              <h3 className="font-display text-2xl text-espresso">Nothing on the counter</h3>
              <p className="max-w-sm font-editorial text-lg text-mocha">
                We couldn't find anything matching your search. Try another
                category or clear your filters.
              </p>
              <button
                onClick={() => { setSearch(""); setCat("all"); }}
                className="font-sans text-xs uppercase tracking-wide-2 text-mocha underline-offset-4 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-4 py-2 font-sans text-[0.7rem] font-semibold uppercase tracking-wide-2 transition-all",
        active
          ? "btn-grad border-transparent text-white shadow-glow-amber"
          : "border-border bg-card text-mocha hover:border-amber hover:text-amber-dark hover:bg-peach/50"
      )}
    >
      {children}
    </button>
  );
}
