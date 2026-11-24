"use client";

import { Leaf, Star, ShoppingBag } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { SmartImage } from "./smart-image";
import { RevealItem } from "./reveal";
import { useToast } from "@/hooks/use-toast";

type ProductCardProps = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigate } = useRouter();
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const { toast } = useToast();

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.available) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast({
      title: "Added to cart",
      description: product.name,
    });
    openCart();
  };

  const goToProduct = () => navigate(`/product/${product.slug}`);

  return (
    <RevealItem className="h-full">
      <article
        onClick={goToProduct}
        className={cn(
          "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500",
          "hover:-translate-y-1.5 hover:border-amber/40 hover:shadow-luxe-lg"
        )}
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          <SmartImage
            src={product.image}
            alt={product.name}
            aspect="portrait"
            className="w-full"
            imgClassName="group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
          />
          {/* Colorful gradient wash on hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.featured && (
              <span className="btn-grad rounded-full px-3 py-1 font-sans text-[0.58rem] font-bold uppercase tracking-luxe text-white shadow-glow-amber">
                Signature
              </span>
            )}
            {product.vegetarian && (
              <span className="flex size-7 items-center justify-center rounded-full bg-matcha text-white shadow-md" title="Vegetarian">
                <Leaf className="size-3.5" />
              </span>
            )}
          </div>

          {/* Rating chip */}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[0.68rem] font-semibold text-amber-dark backdrop-blur-sm shadow-sm">
            <Star className="size-3 fill-amber text-amber" />
            {product.rating.toFixed(1)}
          </div>

          {!product.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-coffee/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-white px-4 py-1.5 font-sans text-[0.65rem] font-bold uppercase tracking-luxe text-berry">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-5">
          <span className="eyebrow text-[0.6rem]">
            {product.category?.name ?? "Specialty"}
          </span>
          <h3 className="font-display text-lg leading-snug text-coffee">
            {product.name}
          </h3>
          <p className="line-clamp-2 flex-1 font-editorial text-[1rem] leading-relaxed text-mocha">
            {product.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-sans text-[0.6rem] uppercase tracking-wide-2 text-muted-foreground">Price</span>
              <span className="font-display text-2xl font-bold text-grad">
                {formatINR(product.price)}
              </span>
            </div>
          </div>

          {/* Order Now button */}
          {product.available ? (
            <button
              onClick={handleOrder}
              aria-label={`Order ${product.name} now`}
              className="btn-grad btn-shine mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full font-sans text-[0.72rem] font-bold uppercase tracking-wide-2 text-white"
            >
              <ShoppingBag className="size-4" />
              Order Now
            </button>
          ) : (
            <div className="mt-3 flex h-11 w-full items-center justify-center rounded-full border-2 border-dashed border-border font-sans text-[0.65rem] uppercase tracking-wide-2 text-muted-foreground">
              Unavailable
            </div>
          )}
        </div>
      </article>
    </RevealItem>
  );
}
