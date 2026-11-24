"use client";

import { Coffee, Leaf, HandHeart, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "@/lib/router";
import { PageHero, PageSection } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { SmartImage } from "@/components/site/smart-image";
import { LuxeButton } from "@/components/site/luxe-button";
import { GALLERY_IMAGES, STORY_IMAGE } from "@/data/images";
import { CAFE } from "@/lib/constants";

export function StoryView() {
  const { navigate } = useRouter();

  return (
    <div>
      <PageHero
        eyebrow="Our Story"
        title="Crafted with passion. Served with love."
        description="The story of a corner café that became a quiet ritual for a city in a hurry."
        image={STORY_IMAGE}
        align="center"
        tall
      />

      <PageSection>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <Reveal>
            <SmartImage
              src={GALLERY_IMAGES[8] ?? STORY_IMAGE}
              alt="Brew & Bloom interior"
              aspect="tall"
              className="w-full rounded-sm shadow-luxe"
            />
          </Reveal>
          <Reveal delay={0.12} className="flex flex-col gap-6">
            <p className="eyebrow">The Beginning</p>
            <h2 className="font-display text-3xl leading-tight text-espresso sm:text-4xl text-balance">
              It started with one drum roaster and a borrowed counter.
            </h2>
            <p className="font-editorial text-xl leading-relaxed text-mocha text-pretty">
              In 2019, two friends — a roaster and a pastry chef — opened a small
              window on Lavelle Lane. They had a single estate's beans, a
              hand-me-down espresso machine, and a stubborn belief that coffee
              should taste like the place it came from.
            </p>
            <p className="font-editorial text-xl leading-relaxed text-mocha text-pretty">
              Six years on, the window has become a room, and the room has become
              a habit. But the rules haven't changed: roast small, bake early,
              and never rush a cup.
            </p>
          </Reveal>
        </div>
      </PageSection>

      <section className="bg-espresso py-24 text-ivory">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="What We Believe"
            title="Four quiet principles"
            tone="light"
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Coffee, title: "Origin first", text: "Every bean is traced to the estate that grew it. We pay above fair trade and roast to honour the farm." },
              { icon: HandHeart, title: "Made by hand", text: "No automated crema, no pre-mixed bases. Every drink is built, tasted and signed by the barista who made it." },
              { icon: Leaf, title: "Baked at dawn", text: "Our laminated doughs rest overnight and bake before opening. What isn't sold today, isn't sold tomorrow." },
              { icon: Clock, title: "Room to linger", text: "We design for slowness — soft light, deep seats and a soundtrack that asks you to stay a while." },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="flex h-full flex-col gap-4 border-t border-ivory/20 pt-6">
                  <v.icon className="size-7 text-champagne" />
                  <h3 className="font-display text-xl text-ivory">{v.title}</h3>
                  <p className="font-editorial text-base leading-relaxed text-ivory/70 text-pretty">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PageSection>
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <Reveal className="flex flex-col gap-6">
            <p className="eyebrow">The Room</p>
            <h2 className="font-display text-3xl leading-tight text-espresso sm:text-4xl text-balance">
              Designed for the kind of morning that doesn't hurry.
            </h2>
            <p className="font-editorial text-xl leading-relaxed text-mocha text-pretty">
              Oak tables, brass-edged shelving, a long marble counter and a
              roastery visible from every seat. The light is warm, the music is
              low, and the door opens onto a lane lined with trees.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Lavelle Lane, Bengaluru", "Seats 42 · 2 floors", "Roastery on view", "Open 7:30 to 23:00"].map((t) => (
                <div key={t} className="flex items-center gap-3 border-t border-border pt-3 text-sm text-mocha">
                  <span className="size-1.5 rounded-full bg-mocha" /> {t}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <SmartImage
              src={GALLERY_IMAGES[5] ?? STORY_IMAGE}
              alt="Café room"
              aspect="square"
              className="w-full rounded-sm shadow-luxe"
            />
          </Reveal>
        </div>
      </PageSection>

      <section className="bg-secondary/50 py-24">
        <div className="container-luxe flex flex-col items-center gap-6 text-center">
          <Reveal className="flex flex-col items-center gap-5">
            <SectionHeading
              eyebrow="Visit Us"
              title="Come for the coffee. Stay for the quiet."
            />
            <p className="font-editorial text-xl text-mocha text-pretty max-w-xl">
              {CAFE.address} · {CAFE.hours}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LuxeButton variant="primary" size="md" onClick={() => navigate("/reservations")}>
                Reserve a Table <ArrowRight className="size-4" />
              </LuxeButton>
              <LuxeButton variant="outline" size="md" onClick={() => navigate("/menu")}>
                Explore the Menu
              </LuxeButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
