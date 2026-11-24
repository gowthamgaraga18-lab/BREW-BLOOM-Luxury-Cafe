"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { SmartImage } from "@/components/site/smart-image";
import { GALLERY_IMAGES } from "@/data/images";
import { useRouter } from "@/lib/router";
import { LuxeButton } from "@/components/site/luxe-button";
import { cn } from "@/lib/utils";

const CAPTIONS = [
  "The main counter at first light",
  "A signature latte, mid-pour",
  "Single-origin beans, freshly roasted",
  "The mezzanine reading nook",
  "Blueberry cheesecake, plated",
  "Laminated croissants, just baked",
  "Pour-over in progress",
  "The lane at golden hour",
];

// Varying spans for editorial masonry feel
const SPANS = [
  "sm:col-span-2 sm:row-span-2",
  "",
  "",
  "sm:col-span-2",
  "",
  "sm:row-span-2",
  "",
  "sm:col-span-2",
];

export function GalleryView() {
  const { navigate } = useRouter();
  const [active, setActive] = useState<number | null>(null);

  const images = GALLERY_IMAGES.slice(0, 12);

  const close = () => setActive(null);
  const prev = () => setActive((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () => setActive((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <div>
      <PageHero
        eyebrow="The Gallery"
        title="A look inside the room."
        description="Light, texture and the quiet choreography of a working café — a few frames from our corner of the city."
        image={GALLERY_IMAGES[6] ?? GALLERY_IMAGES[0]}
      />

      <section className="bg-background py-16">
        <div className="container-luxe">
          <div className="grid auto-rows-[180px] grid-cols-2 gap-4 sm:auto-rows-[220px] md:grid-cols-4">
            {images.map((src, i) => (
              <Reveal
                key={src + i}
                delay={(i % 4) * 0.06}
                className={cn("group relative cursor-pointer overflow-hidden rounded-sm", SPANS[i % SPANS.length])}
              >
                <button onClick={() => setActive(i)} className="block h-full w-full">
                  <SmartImage
                    src={src}
                    alt={CAPTIONS[i % CAPTIONS.length]}
                    aspect="square"
                    className="h-full"
                    imgClassName="h-full w-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-espresso/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="p-4 font-editorial text-base text-ivory">
                      {CAPTIONS[i % CAPTIONS.length]}
                    </span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <h3 className="font-display text-2xl text-espresso">See it in person</h3>
            <p className="max-w-md font-editorial text-lg text-mocha">
              The room reads better in daylight. Reserve a table and let us pour you something.
            </p>
            <LuxeButton variant="primary" size="md" onClick={() => navigate("/reservations")}>
              Reserve a Table <ArrowRight className="size-4" />
            </LuxeButton>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-espresso/90 backdrop-blur-sm"
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 text-ivory/80 hover:text-champagne"
            >
              <X className="size-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/70 hover:text-champagne"
            >
              <ArrowLeft className="size-7" />
            </button>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex max-h-[85vh] max-w-4xl flex-col gap-3 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[active]}
                alt={CAPTIONS[active % CAPTIONS.length]}
                className="max-h-[78vh] w-auto rounded-sm object-contain shadow-luxe-lg"
              />
              <p className="text-center font-editorial text-lg text-ivory/80">
                {CAPTIONS[active % CAPTIONS.length]}
              </p>
            </motion.div>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/70 hover:text-champagne"
            >
              <ArrowRight className="size-7" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
