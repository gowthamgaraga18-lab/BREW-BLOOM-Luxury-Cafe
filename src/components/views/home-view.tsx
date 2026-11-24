"use client";

import { motion } from "framer-motion";
import { ArrowRight, Coffee, Leaf, Star, Quote, Sparkles, Flower2 } from "lucide-react";
import { useProducts } from "@/lib/queries";
import { useRouter } from "@/lib/router";
import { IMG, HERO_IMAGE, STORY_IMAGE, GALLERY_IMAGES } from "@/data/images";
import { CAFE, TESTIMONIALS, FEATURED_PROMOTIONS } from "@/lib/constants";
import { LuxeButton } from "@/components/site/luxe-button";
import { SectionHeading } from "@/components/site/section-heading";
import { ProductCard } from "@/components/site/product-card";
import { Reveal, RevealStagger, RevealItem } from "@/components/site/reveal";
import { SmartImage } from "@/components/site/smart-image";

const MARQUEE_WORDS = [
  "Single Origin",
  "Small Batch Roasted",
  "Handcrafted Daily",
  "Estate-Direct Beans",
  "Baked Before Dawn",
  "Slow Mornings",
  "Brew & Bloom",
];

export function HomeView() {
  const { navigate } = useRouter();
  const { data: products, isLoading } = useProducts();

  const featured = (products ?? []).filter((p) => p.featured).slice(0, 4);
  const signature = (products ?? [])
    .filter((p) => p.category?.slug === "signature-coffee")
    .slice(0, 3);

  const heroImage = IMG.sig_lattes?.[0] ?? IMG.barista?.[0] ?? HERO_IMAGE;

  return (
    <div className="overflow-x-hidden">
      {/* HERO — bright, asymmetric, with decorative lines */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage
            src={heroImage}
            alt="Latte art at Brew & Bloom"
            aspect="landscape"
            className="h-full"
            priority
            imgClassName="h-full w-full animate-slow-zoom [filter:contrast(1.08)_brightness(0.92)_saturate(1.15)]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-coffee/90 via-coffee/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-coffee/55 via-transparent to-amber/10" />
        </div>

        {/* Decorative vertical gradient lines on the right */}
        <div className="pointer-events-none absolute right-8 top-0 hidden h-full flex-row gap-6 lg:flex">
          <span className="divider-grad-vert h-full opacity-30" />
          <span className="divider-grad-vert h-full opacity-20" />
          <span className="divider-grad-vert h-full opacity-10" />
        </div>
        {/* Bright glow blob */}
        <div className="pointer-events-none absolute -right-20 top-1/4 size-72 rounded-full bg-amber/30 blur-3xl animate-float-blob" />

        <div className="container-luxe relative z-10 flex flex-col py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-w-xl flex-col items-start gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-amber" />
              <span className="rounded-full bg-amber/20 px-3 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-luxe text-amber ring-1 ring-amber/30">
                Brew &amp; Bloom · Specialty Café
              </span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[2.75rem] leading-[1.02] text-ivory sm:text-6xl lg:text-7xl text-balance"
            >
              A Little Moment
              <br />
              of <span className="text-grad">Perfection.</span>
            </motion.h1>

            {/* Underline accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="h-1 w-24 origin-left rounded-full bg-gradient-to-r from-amber to-coral"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.55 }}
              className="max-w-md font-editorial text-xl text-ivory/90 sm:text-2xl text-pretty"
            >
              Single-origin coffee, handcrafted pastry and moments worth slowing
              down for.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.75 }}
              className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <LuxeButton variant="primary" size="lg" onClick={() => navigate("/menu")}>
                <ArrowRight className="size-4" />
                Order Now
              </LuxeButton>
              <LuxeButton
                variant="matcha"
                size="lg"
                onClick={() => navigate("/reservations")}
              >
                Reserve a Table
              </LuxeButton>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-8 right-8 hidden flex-col items-center gap-2 text-ivory/60 sm:flex"
        >
          <span className="font-sans text-[0.6rem] uppercase tracking-luxe [writing-mode:vertical-rl]">Scroll</span>
          <div className="divider-grad-vert h-12 w-px opacity-70" />
        </motion.div>
      </section>

      {/* BRIGHT MARQUEE BAND — a line of scrolling words */}
      <div className="btn-grad overflow-hidden py-3.5">
        <div className="marquee-track animate-marquee">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className="flex items-center gap-8 font-display text-sm font-medium uppercase tracking-wide-2 text-white">
              {w}
              <Flower2 className="size-3.5 text-white/70" />
            </span>
          ))}
        </div>
      </div>

      {/* BRAND INTRO */}
      <section className="relative bg-background py-24">
        <div className="container-luxe grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">Est. 2019 · Bengaluru</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-coffee sm:text-4xl lg:text-[2.7rem] text-balance">
              A café devoted to the craft of slowing down.
            </h2>
            <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-amber to-coral" />
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col gap-6">
            <p className="font-editorial text-xl leading-relaxed text-mocha text-pretty">
              Brew &amp; Bloom began with a simple belief — that a cup of coffee
              can be a small ceremony. We source single-origin beans from
              independent estates, roast in small batches, and brew each cup as
              if it were the only one that mattered.
            </p>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { icon: Coffee, title: "Single Origin", text: "Beans traced to the estate", grad: "from-amber to-coral" },
                { icon: Leaf, title: "Handcrafted", text: "Made to order, never rushed", grad: "from-matcha-bright to-matcha" },
                { icon: Star, title: "Small Batches", text: "Roasted fresh each week", grad: "from-coral to-berry" },
              ].map((f) => (
                <div key={f.title} className="group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-luxe transition-all hover:-translate-y-1 hover:shadow-luxe-lg">
                  <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.grad}`} />
                  <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${f.grad} text-white shadow-md`}>
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-1 font-display text-base text-coffee">{f.title}</h3>
                  <p className="font-sans text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <Divider />
      </section>

      {/* FEATURED MENU */}
      <section className="bg-background py-24">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="The Selection"
            title="Featured this season"
            description="A curated few from our kitchen and bar — the cups and plates our regulars return for."
          />
          <div className="mt-14">
            {isLoading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <RevealStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </RevealStagger>
            )}
          </div>
          <div className="mt-12 flex justify-center">
            <LuxeButton variant="primary" size="md" onClick={() => navigate("/menu")}>
              View Full Menu
              <ArrowRight className="size-4" />
            </LuxeButton>
          </div>
        </div>
        <Divider />
      </section>

      {/* SIGNATURE COLLECTION — bright gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-peach via-cream to-white py-24">
        <div className="pointer-events-none absolute -left-16 top-10 size-72 rounded-full bg-amber/20 blur-3xl animate-float-blob" />
        <div className="pointer-events-none absolute -right-10 bottom-0 size-80 rounded-full bg-matcha/15 blur-3xl animate-float-blob" />
        <div className="container-luxe relative grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <Reveal className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-amber" />
              <span className="eyebrow">Signature Collection</span>
              <span className="h-px w-8 bg-amber" />
            </div>
            <h2 className="font-display text-4xl leading-tight text-coffee sm:text-5xl text-balance">
              The cups that <span className="text-grad">define us.</span>
            </h2>
            <p className="font-editorial text-xl text-mocha text-pretty">
              Three house signatures — built on our estate espresso, refined over
              hundreds of pours, and served the way they were meant to be.
            </p>
            <div className="mt-2">
              <LuxeButton variant="primary" size="md" onClick={() => navigate("/menu?category=signature-coffee")}>
                Explore Signatures
                <ArrowRight className="size-4" />
              </LuxeButton>
            </div>
          </Reveal>
          <RevealStagger className="grid gap-5 sm:grid-cols-3">
            {signature.map((p, i) => (
              <RevealItem key={p.id} className="group cursor-pointer">
                <div onClick={() => navigate(`/product/${p.slug}`)} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-luxe transition-all group-hover:-translate-y-1.5 group-hover:shadow-luxe-lg">
                  <div className="relative overflow-hidden">
                    <SmartImage
                      src={p.image}
                      alt={p.name}
                      aspect="portrait"
                      className="w-full"
                      imgClassName="group-hover:scale-110 transition-transform duration-700"
                    />
                    <span className="btn-grad absolute left-3 top-3 rounded-full px-3 py-1 font-display text-xs font-bold text-white shadow-glow-amber">
                      No. 0{i + 1}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <h3 className="font-display text-lg text-coffee">{p.name}</h3>
                    <p className="line-clamp-2 font-editorial text-base text-mocha">{p.description}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
        <Divider />
      </section>

      {/* OUR STORY TEASER */}
      <section className="bg-background py-24">
        <div className="container-luxe grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal className="relative">
            <div className="absolute -left-3 -top-3 h-full w-full rounded-3xl border-2 border-dashed border-amber/40" />
            <SmartImage
              src={STORY_IMAGE}
              alt="Barista preparing coffee"
              aspect="tall"
              className="relative w-full rounded-3xl shadow-luxe-lg"
            />
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col gap-6">
            <p className="eyebrow">Our Story</p>
            <h2 className="font-display text-3xl leading-tight text-coffee sm:text-4xl lg:text-[2.7rem] text-balance">
              From a corner roastery to a quiet institution.
            </h2>
            <div className="h-1 w-20 rounded-full bg-gradient-to-r from-amber to-coral" />
            <p className="font-editorial text-xl leading-relaxed text-mocha text-pretty">
              What started as a single drum roaster and a borrowed counter has
              become a refuge for slow mornings and considered conversations. We
              still roast in small batches, still bake before dawn, and still
              believe the best things take the time they take.
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              {[
                { icon: Coffee, text: "Estate-direct beans, roasted weekly" },
                { icon: Leaf, text: "Pastries laminated and baked in-house" },
                { icon: Star, text: "A room designed for lingering" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 border-l-2 border-amber pl-4 text-coffee">
                  <item.icon className="size-4 text-amber-dark" /> {item.text}
                </li>
              ))}
            </ul>
            <LuxeButton variant="primary" size="md" onClick={() => navigate("/story")}>
              Read Our Story
              <ArrowRight className="size-4" />
            </LuxeButton>
          </Reveal>
        </div>
        <Divider />
      </section>

      {/* PROMOTIONS — bright colorful cards */}
      <section className="bg-gradient-to-b from-peach/50 to-background py-24">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Now & Then"
            title="Special promotions"
            description="Seasonal offers and members-only indulgences, available for a limited time."
          />
          <RevealStagger className="mt-14 grid gap-6 md:grid-cols-3">
            {FEATURED_PROMOTIONS.map((promo, i) => (
              <RevealItem key={promo.code}>
                <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-white p-7 shadow-luxe transition-all hover:-translate-y-1.5 hover:shadow-luxe-lg">
                  <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${i === 0 ? "from-amber to-coral" : i === 1 ? "from-coral to-berry" : "from-matcha-bright to-matcha"}`} />
                  <span className="flex w-fit items-center gap-1.5 rounded-full bg-peach px-3 py-1 font-sans text-[0.6rem] font-bold uppercase tracking-luxe text-amber-dark">
                    <Sparkles className="size-3" /> Use code
                  </span>
                  <h3 className="font-display text-2xl text-coffee">{promo.title}</h3>
                  <p className="flex-1 font-editorial text-lg text-mocha text-pretty">{promo.desc}</p>
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="font-display text-lg font-bold text-grad tracking-wide">{promo.code}</span>
                    <LuxeButton variant="link" size="sm" onClick={() => navigate("/menu")}>
                      Order now <ArrowRight className="size-3.5" />
                    </LuxeButton>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
        <Divider />
      </section>

      {/* GALLERY PREVIEW */}
      <section className="bg-background py-24">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="The Room"
            title="A look inside Brew &amp; Bloom"
            description="Light, texture and the quiet choreography of a working café."
          />
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {GALLERY_IMAGES.slice(0, 8).map((src, i) => (
              <Reveal
                key={src}
                delay={(i % 4) * 0.08}
                className={i === 0 || i === 5 ? "col-span-2 row-span-1" : ""}
              >
                <SmartImage
                  src={src}
                  alt="Brew & Bloom gallery"
                  aspect={i === 0 || i === 5 ? "landscape" : "square"}
                  className="w-full rounded-2xl shadow-luxe"
                />
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <LuxeButton variant="outline" size="md" onClick={() => navigate("/gallery")}>
              View Gallery
              <ArrowRight className="size-4" />
            </LuxeButton>
          </div>
        </div>
        <Divider />
      </section>

      {/* TESTIMONIALS — bright */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream via-peach/40 to-white py-24">
        <div className="pointer-events-none absolute right-0 top-0 size-72 rounded-full bg-coral/15 blur-3xl animate-float-blob" />
        <div className="container-luxe relative">
          <SectionHeading
            eyebrow="Kind Words"
            title="What our guests say"
          />
          <RevealStagger className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <RevealItem key={t.name}>
                <figure className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-white p-8 shadow-luxe transition-all hover:-translate-y-1 hover:shadow-luxe-lg">
                  <span className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${i === 0 ? "from-amber to-coral" : i === 1 ? "from-matcha-bright to-matcha" : "from-coral to-berry"} text-white shadow-md`}>
                    <Quote className="size-6" />
                  </span>
                  <blockquote className="flex-1 font-editorial text-xl leading-relaxed text-coffee text-pretty">
                    “{t.quote}”
                  </blockquote>
                  <div className="flex items-center gap-1 border-t border-border pt-4">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="size-4 fill-amber text-amber" />
                    ))}
                  </div>
                  <figcaption>
                    <div className="font-display text-lg text-coffee">{t.name}</div>
                    <div className="font-sans text-xs uppercase tracking-wide-2 text-amber-dark">
                      {t.role}
                    </div>
                  </figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
        <Divider />
      </section>

      {/* RESERVATION CTA — brightened */}
      <section className="relative overflow-hidden">
        <SmartImage
          src={GALLERY_IMAGES[2] ?? HERO_IMAGE}
          alt=""
          aspect="landscape"
          className="absolute inset-0 h-full"
          imgClassName="h-full w-full [filter:brightness(0.7)_saturate(1.1)]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-coffee/85 via-coffee/60 to-coral/40" />
        {/* decorative lines */}
        <div className="pointer-events-none absolute left-8 top-0 hidden h-full flex-row gap-6 lg:flex">
          <span className="divider-grad-vert h-full opacity-30" />
          <span className="divider-grad-vert h-full opacity-20" />
        </div>
        <div className="container-luxe relative flex flex-col items-center gap-6 py-28 text-center">
          <Reveal className="flex flex-col items-center gap-5">
            <span className="rounded-full bg-amber/20 px-3 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-luxe text-amber ring-1 ring-amber/30">Reserve</span>
            <h2 className="max-w-2xl font-display text-4xl leading-tight text-ivory sm:text-5xl text-balance">
              Your table is <span className="text-grad">waiting.</span>
            </h2>
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-amber to-coral" />
            <p className="max-w-xl font-editorial text-xl text-ivory/85 text-pretty">
              Book a quiet corner for two or a long table for friends. We hold
              the room; you bring the occasion.
            </p>
            <LuxeButton variant="primary" size="lg" onClick={() => navigate("/reservations")}>
              Reserve a Table
              <ArrowRight className="size-4" />
            </LuxeButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Divider() {
  return (
    <div className="container-luxe mt-20">
      <div className="divider-grad" />
    </div>
  );
}

function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-4">
          <div className="aspect-[4/5] w-full rounded-xl bg-secondary" />
          <div className="mt-4 h-4 w-1/3 rounded bg-secondary" />
          <div className="mt-2 h-5 w-2/3 rounded bg-secondary" />
          <div className="mt-3 h-4 w-1/4 rounded bg-secondary" />
          <div className="mt-4 h-9 w-full rounded-full bg-secondary" />
        </div>
      ))}
    </div>
  );
}
