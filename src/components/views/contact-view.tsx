"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, Check } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { LuxeButton } from "@/components/site/luxe-button";
import { SmartImage } from "@/components/site/smart-image";
import { CAFE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { GALLERY_IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";

export function ContactView() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.subject.trim().length < 2) e.subject = "Add a subject.";
    if (form.message.trim().length < 10) e.message = "Tell us a little more (10+ characters).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        toast({ title: "Message sent", description: "We'll be in touch within one business day." });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast({ title: "Could not send", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Say hello."
        description="Questions, catering, private events or just a kind word — we read everything."
        image={GALLERY_IMAGES[7] ?? GALLERY_IMAGES[0]}
      />

      <section className="bg-background py-20">
        <div className="container-luxe grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          {/* Info */}
          <Reveal className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <p className="eyebrow">Visit</p>
              <h2 className="font-display text-3xl text-espresso sm:text-4xl text-balance">
                Find us on Lavelle Lane.
              </h2>
              <p className="font-editorial text-xl text-mocha text-pretty">
                A quiet corner of Bengaluru, two minutes from the park.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { icon: MapPin, label: "Address", value: CAFE.address },
                { icon: Clock, label: "Hours", value: CAFE.hours },
                { icon: Phone, label: "Phone", value: CAFE.phone, href: `tel:${CAFE.phone}` },
                { icon: Mail, label: "Email", value: CAFE.email, href: `mailto:${CAFE.email}` },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-2 border-t border-border pt-4">
                  <span className="eyebrow">{item.label}</span>
                  <div className="flex items-start gap-2">
                    <item.icon className="mt-1 size-4 shrink-0 text-mocha" />
                    {item.href ? (
                      <a href={item.href} className="font-editorial text-base text-espresso hover:text-mocha">{item.value}</a>
                    ) : (
                      <span className="font-editorial text-base text-espresso">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <SmartImage
              src={GALLERY_IMAGES[10] ?? GALLERY_IMAGES[0]}
              alt="Brew & Bloom on the lane"
              aspect="landscape"
              className="rounded-sm shadow-luxe"
            />
          </Reveal>

          {/* Form */}
          <Reveal delay={0.12}>
            <div className="border border-border bg-card p-8 shadow-luxe sm:p-10">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-10 text-center"
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-olive/10">
                    <Check className="size-8 text-olive" />
                  </div>
                  <h3 className="font-display text-2xl text-espresso">Message received</h3>
                  <p className="max-w-sm font-editorial text-lg text-mocha">
                    Thank you for reaching out. We'll reply within one business day.
                  </p>
                  <LuxeButton variant="outline" size="md" onClick={() => setSent(false)}>
                    Send another
                  </LuxeButton>
                </motion.div>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" error={errors.name}>
                      <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(!!errors.name)} placeholder="Your name" />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(!!errors.email)} placeholder="you@example.com" />
                    </Field>
                  </div>
                  <Field label="Subject" error={errors.subject}>
                    <input value={form.subject} onChange={(e) => set("subject", e.target.value)} className={inputCls(!!errors.subject)} placeholder="How can we help?" />
                  </Field>
                  <Field label="Message" error={errors.message}>
                    <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={5} className={inputCls(!!errors.message)} placeholder="Tell us more…" />
                  </Field>
                  <LuxeButton type="submit" variant="primary" size="lg" disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Sending…" : "Send Message"}
                    {!loading && <Send className="size-4" />}
                  </LuxeButton>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-xs uppercase tracking-wide-2 text-mocha">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

function inputCls(hasError: boolean, extra = "") {
  return cn(
    "h-11 w-full rounded-sm border bg-background px-3 font-sans text-sm text-espresso outline-none transition-colors focus:border-mocha",
    hasError ? "border-destructive" : "border-border",
    extra
  );
}
