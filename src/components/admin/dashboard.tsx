"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, CalendarCheck, Users, Mail, Settings,
  LogOut, Menu, X, ExternalLink,
} from "lucide-react";
import { useAdminSession, useAdminLogout } from "@/lib/queries";
import { useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";
import { CAFE } from "@/lib/constants";
import { OverviewPanel } from "./panels/overview-panel";
import { ProductsPanel } from "./panels/products-panel";
import { OrdersPanel } from "./panels/orders-panel";
import { ReservationsPanel } from "./panels/reservations-panel";
import { CustomersPanel } from "./panels/customers-panel";
import { MessagesPanel } from "./panels/messages-panel";
import { SettingsPanel } from "./panels/settings-panel";
import type { Section } from "./dashboard-types";

const NAV: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "customers", label: "Customers", icon: Users },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Dashboard({ admin }: { admin: { email: string; name: string; role: string } }) {
  const [section, setSection] = useState<Section>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const { navigate } = useRouter();
  const logout = useAdminLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate("/");
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border px-6 py-5">
        <div className="font-display text-xl text-sidebar-foreground">{CAFE.name}</div>
        <div className="font-editorial text-sm italic text-sidebar-primary/80">Admin Dashboard</div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => { setSection(item.id); setMobileNav(false); }}
            className={cn(
              "flex items-center gap-3 rounded-sm px-3 py-2.5 font-sans text-sm transition-colors",
              section === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-sm bg-sidebar-accent/40 px-3 py-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-display text-sm">
            {admin.name.charAt(0)}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate font-sans text-sm text-sidebar-foreground">{admin.name}</span>
            <span className="truncate text-xs text-sidebar-foreground/60">{admin.email}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-sm px-3 py-2 font-sans text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-sidebar text-sidebar-foreground lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileNav && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-espresso/60" onClick={() => setMobileNav(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground"
            >
              {SidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} aria-label="Open navigation" className="lg:hidden">
              <Menu className="size-5 text-espresso" />
            </button>
            <h1 className="font-display text-xl capitalize text-espresso">{section}</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-sans text-xs uppercase tracking-wide-2 text-mocha hover:text-espresso"
          >
            View site <ExternalLink className="size-3.5" />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {section === "overview" && <OverviewPanel onNavigate={setSection} />}
          {section === "products" && <ProductsPanel />}
          {section === "orders" && <OrdersPanel />}
          {section === "reservations" && <ReservationsPanel />}
          {section === "customers" && <CustomersPanel />}
          {section === "messages" && <MessagesPanel />}
          {section === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
