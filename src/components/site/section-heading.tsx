"use client";

import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  tone?: "dark" | "light";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  tone = "dark",
}: SectionHeadingProps) {
  const isLight = tone === "light";
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <div className="flex items-center gap-3">
          <span className={cn("h-px w-8", isLight ? "bg-amber" : "bg-amber")} />
          <span
            className={cn(
              "eyebrow",
              isLight ? "text-amber" : "text-amber-dark"
            )}
          >
            {eyebrow}
          </span>
          <span className={cn("h-px w-8", isLight ? "bg-amber" : "bg-amber")} />
        </div>
      )}
      <h2
        className={cn(
          "font-display text-3xl sm:text-4xl lg:text-[2.9rem] leading-[1.1] text-balance max-w-3xl",
          isLight ? "text-ivory" : "text-coffee"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "font-editorial text-lg sm:text-xl leading-relaxed text-pretty max-w-2xl",
            isLight ? "text-ivory/80" : "text-mocha"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
