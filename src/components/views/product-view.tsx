"use client";

import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag, Star, Leaf, Check, ChevronRight } from "lucide-react";
import { useProduct } from "@/lib/queries";
import { useRouter, useRoute } from "@/lib/router";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { formatINR } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { LuxeButton } from "@/components/site/luxe-button";
import { SmartImage } from "@/components/site/smart-image";
import { ProductCard } from "@/components/site/product-card";
import { Reveal, RevealStagger } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { CAFE } from "@/lib/constants";

export function ProductView() {
  const route = useRoute();
  const slug = route.path.split("/")[2] ?? "";
  const { navigate } = useRouter();
  const { data, isLoading, isError } = useProduct(slug);
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const { toast } = useToast();
  const [qty, setQty] = useState(1);

  const product = data;

  const handleAdd = () => {
    if (!product || !product.available) return;
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      qty
    );
    toast({ title: "Added to cart", description: `${qty} × ${product.name}` });
    openCart();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container-luxe grid gap-12 py-16 lg:grid-cols-2">
          <div className="aspect-[4/5] w-full animate-pulse rounded-sm bg-secondary" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-1/4 rounded bg-secondary" />
            <div className="h-10 w-3/4 rounded bg-secondary" />
            <div className="h-6 w-1/4 rounded bg-secondary" />
            <div className="mt-4 h-24 w-full rounded bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background pt-20 text-center">
        <h1 className="font-display text-3xl text-espresso">Product not found</h1>
        <p className="font-editorial text-lg text-mocha">
          The item you're looking for may have been moved or is no longer available.
        </p>
        <LuxeButton variant="primary" size="md" onClick={() => navigate("/menu")}>
          Back to Menu
        </LuxeButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container-luxe flex items-center gap-2 py-4 text-xs text-muted-foreground">
          <button onClick={() => navigate("/menu")} className="hover:text-mocha">Menu</button>
          <ChevronRight className="size-3" />
          <span className="text-mocha">{product.category?.name}</span>
          <ChevronRight className="size-3" />
          <span className="truncate text-espresso">{product.name}</span>
        </div>
      </div>

      <div className="container-luxe grid gap-12 py-16 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <Reveal>
          <div className="flex flex-col gap-4">
            <SmartImage
              src={product.image}
              alt={product.name}
              aspect="square"
              className="w-full rounded-sm shadow-luxe"
              priority
            />
            <div className="grid grid-cols-3 gap-3">
              {[product.image, ...(product.gallery ?? [])].slice(0, 3).map((img, i) => (
                <SmartImage key={i} src={img} alt={`${product.name} ${i + 1}`} aspect="square" className="rounded-sm" />
              ))}
            </div>
          </div>
        </Reveal>

        {/* Details */}
        <Reveal delay={0.1} className="flex flex-col gap-6 lg:py-6">
          <div className="flex items-center justify-between">
            <span className="eyebrow">{product.category?.name}</span>
            <span className="flex items-center gap-1 text-sm text-mocha">
              <Star className="size-4 fill-champagne text-champagne" />
              {product.rating.toFixed(1)}
            </span>
          </div>
          <h1 className="font-display text-4xl leading-tight text-espresso sm:text-5xl text-balance">
            {product.name}
          </h1>
          <p className="font-editorial text-xl leading-relaxed text-mocha text-pretty">
            {product.description}
          </p>

          <div className="flex items-center gap-4">
            <span className="font-display text-3xl text-espresso">{formatINR(product.price)}</span>
            {product.vegetarian && (
              <span className="flex items-center gap-1.5 text-sm text-olive">
                <Leaf className="size-4" /> Vegetarian
              </span>
            )}
          </div>

          <div className="hairline my-2" />

          <div className="flex items-center gap-3 text-sm">
            {product.available ? (
              <span className="flex items-center gap-2 text-olive">
                <Check className="size-4" /> Available now
              </span>
            ) : (
              <span className="text-destructive">Currently unavailable</span>
            )}
          </div>

          {/* Quantity + add */}
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex size-12 items-center justify-center text-espresso hover:bg-secondary"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center font-display text-lg text-espresso">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
                className="flex size-12 items-center justify-center text-espresso hover:bg-secondary"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <LuxeButton
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleAdd}
              disabled={!product.available}
            >
              <ShoppingBag className="size-4" />
              Order Now · {formatINR(product.price * qty)}
            </LuxeButton>
          </div>

          {/* Meta */}
          <div className="mt-6 grid gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-1">Prepared</p>
              <p className="font-editorial text-base text-mocha">Freshly brewed to order</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Served at</p>
              <p className="font-editorial text-base text-mocha">{CAFE.hours}</p>
            </div>
          </div>

          <LuxeButton
            variant="link"
            size="sm"
            className="mt-2 w-fit px-0"
            onClick={() => navigate("/menu")}
          >
            <ArrowLeft className="size-4" /> Back to menu
          </LuxeButton>
        </Reveal>
      </div>

      {/* Related */}
      {data?.related && data.related.length > 0 && (
        <section className="bg-secondary/40 py-20">
          <div className="container-luxe">
            <SectionHeading eyebrow="You may also like" title="Pairs beautifully" />
            <RevealStagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </RevealStagger>
          </div>
        </section>
      )}
    </div>
  );
}
