"use client";

import { useEffect } from "react";
import { useRouter, useRoute, matchPath } from "@/lib/router";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { HomeView } from "@/components/views/home-view";
import { StoryView } from "@/components/views/story-view";
import { MenuView } from "@/components/views/menu-view";
import { ProductView } from "@/components/views/product-view";
import { GalleryView } from "@/components/views/gallery-view";
import { ReservationsView } from "@/components/views/reservations-view";
import { ContactView } from "@/components/views/contact-view";
import { CartView } from "@/components/views/cart-view";
import { CheckoutView } from "@/components/views/checkout-view";
import { ConfirmationView } from "@/components/views/confirmation-view";
import { AdminView } from "@/components/admin/admin-view";

function Router() {
  const route = useRoute();
  const path = route.path;

  // Admin runs full-screen without the customer chrome.
  if (path === "/admin" || path.startsWith("/admin/")) {
    return <AdminView />;
  }

  let view: React.ReactNode;
  if (path === "/" || path === "") view = <HomeView />;
  else if (path === "/story") view = <StoryView />;
  else if (path === "/menu") view = <MenuView />;
  else if (matchPath("/product/:slug", path)) view = <ProductView />;
  else if (path === "/gallery") view = <GalleryView />;
  else if (path === "/reservations") view = <ReservationsView />;
  else if (path === "/contact") view = <ContactView />;
  else if (path === "/cart") view = <CartView />;
  else if (path === "/checkout") view = <CheckoutView />;
  else if (matchPath("/confirmation/:id", path)) view = <ConfirmationView />;
  else view = <NotFound />;

  const hasChrome = !["/cart", "/checkout"].includes(path) && !path.startsWith("/confirmation");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{view}</main>
      {hasChrome && <Footer />}
    </div>
  );
}

function NotFound() {
  const { navigate } = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background pt-20 text-center">
      <span className="eyebrow">404</span>
      <h1 className="font-display text-4xl text-espresso">Page not found</h1>
      <p className="max-w-sm font-editorial text-xl text-mocha">
        The page you're looking for has wandered off. Let's get you back.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-2 font-sans text-xs uppercase tracking-wide-2 text-mocha underline-offset-4 hover:underline"
      >
        Return home
      </button>
    </div>
  );
}

export function SiteApp() {
  const route = useRoute();

  // Update document title based on route
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Brew & Bloom — Crafted with Passion. Served with Love.",
      "/story": "Our Story · Brew & Bloom",
      "/menu": "Menu · Brew & Bloom",
      "/gallery": "Gallery · Brew & Bloom",
      "/reservations": "Reservations · Brew & Bloom",
      "/contact": "Contact · Brew & Bloom",
      "/cart": "Cart · Brew & Bloom",
      "/checkout": "Checkout · Brew & Bloom",
      "/admin": "Admin · Brew & Bloom",
    };
    if (titles[route.path]) document.title = titles[route.path];
  }, [route.path]);

  return <Router />;
}
