"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SmartImage } from "./smart-image";
import { Reveal } from "./reveal";
import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  image: string;
  align?: "left" | "center";
  tall?: boolean;
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  align = "center",
  tall = false,
}: PageHeroProps) {
  return (
    <section className={cn("relative w-full overflow-hidden", tall ? "min-h-[70vh]" : "min-h-[52vh]")}>
      <div className="absolute inset-0">
        <SmartImage
          src={image}
          alt=""
          aspect="tall"
          className="h-full"
          priority
          imgClassName="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/70 via-espresso/45 to-espresso/80" />
      </div>
      <div className="container-luxe relative flex min-h-[52vh] flex-col justify-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex max-w-2xl flex-col gap-5",
            align === "center" ? "mx-auto items-center text-center" : "items-start text-left"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-champagne" />
            <span className="eyebrow text-champagne">{eyebrow}</span>
            <span className="h-px w-8 bg-champagne" />
          </div>
          <h1 className="font-display text-4xl leading-[1.05] text-ivory sm:text-5xl lg:text-6xl text-balance">
            {title}
          </h1>
          {description && (
            <p className="max-w-xl font-editorial text-lg text-ivory/80 sm:text-xl text-pretty">
              {description}
            </p>
          )}
        </motion.div>
      </div>
      <div className="hairline absolute bottom-0 left-0 right-0 opacity-40" />
    </section>
  );
}

export function PageSection({
  children,
  className,
  id,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "light" | "dark";
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 sm:py-28",
        tone === "dark" ? "bg-espresso text-ivory" : "bg-background text-foreground",
        className
      )}
    >
      <div className="container-luxe">{children}</div>
    </section>
  );
}

export { Reveal };
