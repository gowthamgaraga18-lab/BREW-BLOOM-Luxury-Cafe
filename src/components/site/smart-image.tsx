"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspect?: "square" | "portrait" | "landscape" | "wide" | "tall" | string;
  priority?: boolean;
};

const aspectMap: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[3/2]",
  wide: "aspect-[16/9]",
  tall: "aspect-[3/4]",
};

export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  aspect = "landscape",
  priority = false,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // React-recommended "adjust state when a prop changes" pattern (no effect).
  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
    setErrored(false);
  }

  const aspectClass = aspectMap[aspect] ?? aspect;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-secondary",
        aspectClass && aspectClass,
        className
      )}
    >
      {!loaded && !errored && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary via-muted to-secondary" />
      )}
      {errored ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-chocolate via-espresso to-mocha">
          <div className="flex flex-col items-center gap-2 text-champagne/70">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <span className="font-editorial text-sm italic">Brew &amp; Bloom</span>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "relative z-10 h-full w-full object-cover",
            imgClassName
          )}
        />
      )}
    </div>
  );
}
