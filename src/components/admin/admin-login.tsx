"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { useAdminLogin } from "@/lib/queries";
import { useRouter } from "@/lib/router";
import { useToast } from "@/hooks/use-toast";
import { LuxeButton } from "@/components/site/luxe-button";
import { SmartImage } from "@/components/site/smart-image";
import { GALLERY_IMAGES } from "@/data/images";
import { CAFE } from "@/lib/constants";

export function AdminLogin() {
  const { navigate } = useRouter();
  const mutation = useAdminLogin();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({ email, password });
      toast({ title: "Welcome back", description: "Signed in to the dashboard." });
    } catch (err) {
      toast({ title: "Sign in failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-espresso">
      <div className="absolute inset-0">
        <SmartImage src={GALLERY_IMAGES[1] ?? GALLERY_IMAGES[0]} alt="" aspect="landscape" className="h-full" imgClassName="h-full w-full" />
        <div className="absolute inset-0 bg-espresso/85 backdrop-blur-sm" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="border border-ivory/15 bg-espresso/60 p-8 shadow-luxe-lg backdrop-blur-md sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-champagne/40 text-champagne">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="mt-5 font-display text-3xl text-ivory">Admin Access</h1>
            <p className="mt-2 font-editorial text-base text-ivory/70">
              Sign in to the {CAFE.name} dashboard
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-wide-2 text-champagne">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-champagne/70" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-sm border border-ivory/20 bg-ivory/5 pl-10 pr-3 font-sans text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-champagne"
                  placeholder="admin@brewbloom.cafe"
                />
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-wide-2 text-champagne">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-champagne/70" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-sm border border-ivory/20 bg-ivory/5 pl-10 pr-3 font-sans text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-champagne"
                  placeholder="••••••••"
                />
              </div>
            </label>

            <LuxeButton type="submit" variant="champagne" size="lg" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in…" : "Sign In"}
              {!mutation.isPending && <ArrowRight className="size-4" />}
            </LuxeButton>
          </form>

          <div className="mt-6 rounded-sm border border-ivory/10 bg-ivory/5 p-3 text-center">
            <p className="font-sans text-xs text-ivory/50">
              Demo credentials · <span className="text-champagne">admin@brewbloom.cafe</span> · <span className="text-champagne">BrewBloom@2025</span>
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-6 block w-full text-center font-sans text-xs uppercase tracking-wide-2 text-ivory/50 hover:text-champagne"
          >
            ← Back to site
          </button>
        </div>
      </motion.div>
    </div>
  );
}
