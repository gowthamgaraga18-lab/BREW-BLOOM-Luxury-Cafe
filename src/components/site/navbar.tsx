"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useRouter, useRoute } from "@/lib/router";
import { useCartCount } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { NAV_LINKS, CAFE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LuxeButton } from "./luxe-button";
import { CartDrawer } from "./cart-drawer";

export function Navbar() {
  const { route, navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartCount();
  const openCart = useUI((s) => s.openCart);

  const isHome = route.path === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled && !mobileOpen;
  const textColor = transparent ? "text-ivory" : "text-espresso";
  const subColor = transparent ? "text-champagne" : "text-mocha";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          transparent
            ? "bg-transparent"
            : "glass-light border-b border-border/60 shadow-luxe"
        )}
      >
        <nav className="container-luxe flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className={cn(
              "group flex flex-col items-start leading-none transition-colors",
              textColor
            )}
            aria-label={`${CAFE.name} home`}
          >
            <span className="font-display text-xl tracking-wide sm:text-2xl">
              {CAFE.name}
            </span>
            <span
              className={cn(
                "font-editorial text-[0.62rem] italic tracking-wide-2",
                subColor
              )}
            >
              {CAFE.tagline}
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = route.path === link.to;
              return (
                <button
                  key={link.to}
                  onClick={() => navigate(link.to)}
                  className={cn(
                    "relative font-sans text-[0.7rem] uppercase tracking-wide-2 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-current after:transition-all after:duration-300 hover:after:w-full",
                    active ? cn(textColor, "after:w-full") : cn(subColor, "after:w-0")
                  )}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openCart}
              aria-label="Open cart"
              className={cn(
                "relative flex size-10 items-center justify-center transition-colors hover:opacity-70",
                textColor
              )}
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-mocha px-1 text-[0.6rem] font-medium text-ivory">
                  {cartCount}
                </span>
              )}
            </button>

            <LuxeButton
              variant={transparent ? "light" : "primary"}
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => navigate("/reservations")}
            >
              Reserve a Table
            </LuxeButton>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className={cn(
                "flex size-10 items-center justify-center lg:hidden",
                textColor
              )}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-espresso/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-ivory shadow-luxe-lg"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div className="flex flex-col leading-none">
                  <span className="font-display text-xl text-espresso">
                    {CAFE.name}
                  </span>
                  <span className="font-editorial text-[0.6rem] italic text-mocha">
                    {CAFE.tagline}
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="text-espresso"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 px-6 py-6">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.to}
                    onClick={() => { navigate(link.to); setMobileOpen(false); }}
                    className={cn(
                      "py-3 text-left font-display text-2xl transition-colors",
                      route.path === link.to
                        ? "text-mocha"
                        : "text-espresso hover:text-mocha"
                    )}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
              <div className="mt-auto border-t border-border px-6 py-6">
                <LuxeButton
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => { navigate("/reservations"); setMobileOpen(false); }}
                >
                  Reserve a Table
                </LuxeButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}
