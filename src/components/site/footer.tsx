"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, Twitter, ArrowRight } from "lucide-react";
import { useRouter } from "@/lib/router";
import { CAFE, NAV_LINKS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { LuxeButton } from "./luxe-button";

export function Footer() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Welcome to the circle",
          description: "You're subscribed to Brew & Bloom dispatches.",
        });
        setEmail("");
      } else {
        toast({
          title: data.already ? "Already subscribed" : "Could not subscribe",
          description: data.message,
          variant: data.already ? "default" : "destructive",
        });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="mt-auto bg-espresso text-ivory">
      {/* Newsletter band */}
      <div className="border-b border-ivory/10">
        <div className="container-luxe grid gap-8 py-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow text-champagne">The Dispatch</p>
            <h3 className="mt-3 font-display text-2xl sm:text-3xl text-ivory">
              Slow mornings, new harvests, quiet rituals.
            </h3>
            <p className="mt-2 max-w-md font-editorial text-lg text-ivory/70">
              Join our newsletter for seasonal menus, limited roasts and members-only tastings.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex w-full max-w-md gap-2 md:justify-self-end">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-12 flex-1 rounded-sm border border-ivory/20 bg-ivory/5 px-4 font-sans text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-champagne"
            />
            <LuxeButton
              type="submit"
              variant="champagne"
              size="md"
              disabled={loading}
            >
              {loading ? "Subscribing" : "Subscribe"}
              {!loading && <ArrowRight className="size-4" />}
            </LuxeButton>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-luxe grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl text-ivory">{CAFE.name}</span>
            <span className="mt-1 font-editorial text-sm italic text-champagne">
              {CAFE.tagline}
            </span>
          </div>
          <p className="mt-4 max-w-xs font-editorial text-base leading-relaxed text-ivory/60">
            A specialty café devoted to considered coffee, handcrafted pastry and
            the art of slowing down.
          </p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label="Social link"
                className="flex size-9 items-center justify-center border border-ivory/15 text-ivory/70 transition-colors hover:border-champagne hover:text-champagne"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="eyebrow text-champagne">Explore</h4>
          <ul className="mt-4 flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <button
                  onClick={() => navigate(link.to)}
                  className="font-sans text-sm text-ivory/70 transition-colors hover:text-champagne"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => navigate("/admin")}
                className="font-sans text-sm text-ivory/40 transition-colors hover:text-champagne"
              >
                Admin
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-champagne">Visit</h4>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-ivory/70">
            <li className="flex gap-3">
              <MapPin className="size-4 shrink-0 text-champagne" />
              <span>{CAFE.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="size-4 shrink-0 text-champagne" />
              <a href={`tel:${CAFE.phone}`} className="hover:text-champagne">
                {CAFE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="size-4 shrink-0 text-champagne" />
              <a href={`mailto:${CAFE.email}`} className="hover:text-champagne">
                {CAFE.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="size-4 shrink-0 text-champagne" />
              <span>{CAFE.hours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-champagne">Reserve</h4>
          <p className="mt-4 font-editorial text-base text-ivory/70">
            Book your table for an unhurried afternoon or an intimate evening.
          </p>
          <LuxeButton
            variant="light"
            size="sm"
            className="mt-4"
            onClick={() => navigate("/reservations")}
          >
            Reserve a Table
          </LuxeButton>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-2 py-6 text-center sm:flex-row sm:text-left">
          <p className="font-sans text-xs text-ivory/50">
            © {new Date().getFullYear()} {CAFE.name}. All rights reserved.
          </p>
          <p className="font-editorial text-sm italic text-ivory/40">
            Crafted with passion. Served with love.
          </p>
        </div>
      </div>
    </footer>
  );
}
