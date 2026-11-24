"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Check, ArrowRight, CalendarCheck } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { SmartImage } from "@/components/site/smart-image";
import { LuxeButton } from "@/components/site/luxe-button";
import { useCreateReservation } from "@/lib/queries";
import { RESERVATION_SLOTS, CAFE } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { useRouter } from "@/lib/router";
import { useToast } from "@/hooks/use-toast";
import { GALLERY_IMAGES, RESERVATION_IMAGE } from "@/data/images";
import { cn } from "@/lib/utils";

export function ReservationsView() {
  const { navigate } = useRouter();
  const mutation = useCreateReservation();
  const { toast } = useToast();

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: 2,
    specialRequests: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<null | {
    name: string;
    date: string;
    time: string;
    guests: number;
  }>(null);

  const set = (k: string, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.phone.trim().length < 7) e.phone = "Enter a valid phone number.";
    if (!form.date) e.date = "Choose a date.";
    if (!form.time) e.time = "Choose a time slot.";
    if (form.guests < 1 || form.guests > 12) e.guests = "1–12 guests.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const res = await mutation.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        date: form.date,
        time: form.time,
        guests: Number(form.guests),
        specialRequests: form.specialRequests,
      });
      setConfirmation({
        name: res.reservation.name,
        date: res.reservation.date,
        time: res.reservation.time,
        guests: res.reservation.guests,
      });
      toast({ title: "Reservation requested", description: "We'll confirm by email shortly." });
    } catch (err) {
      toast({
        title: "Could not reserve",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  if (confirmation) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container-luxe flex flex-col items-center py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex size-20 items-center justify-center rounded-full bg-olive/10"
          >
            <CalendarCheck className="size-10 text-olive" />
          </motion.div>
          <h1 className="mt-8 font-display text-4xl text-espresso sm:text-5xl">Reservation requested</h1>
          <p className="mt-3 max-w-md font-editorial text-xl text-mocha text-pretty">
            Thank you, {confirmation.name.split(" ")[0]}. We've received your
            request for {confirmation.guests} {confirmation.guests > 1 ? "guests" : "guest"} on{" "}
            <span className="text-espresso">{formatDateNice(confirmation.date)}</span> at{" "}
            <span className="text-espresso">{confirmation.time}</span>.
          </p>
          <p className="mt-2 max-w-md font-editorial text-base text-muted-foreground">
            A confirmation will arrive at your email. For changes, call us at {CAFE.phone}.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LuxeButton variant="primary" size="md" onClick={() => navigate("/menu")}>
              Explore the Menu <ArrowRight className="size-4" />
            </LuxeButton>
            <LuxeButton variant="outline" size="md" onClick={() => setConfirmation(null)}>
              Make another reservation
            </LuxeButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Reservations"
        title="Reserve your table."
        description="Choose a date, a time and a party size. We'll hold the room for you."
        image={RESERVATION_IMAGE || GALLERY_IMAGES[2]}
        tall
      />

      <section className="bg-background py-20">
        <div className="container-luxe grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          {/* Form */}
          <Reveal>
            <form onSubmit={submit} className="flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Full name" error={errors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className={inputCls(!!errors.name)}
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputCls(!!errors.phone)}
                    placeholder="+91 …"
                  />
                </Field>
              </div>
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls(!!errors.email)}
                  placeholder="you@example.com"
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Date" error={errors.date}>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mocha" />
                    <input
                      type="date"
                      min={today}
                      value={form.date}
                      onChange={(e) => set("date", e.target.value)}
                      className={inputCls(!!errors.date, "pl-9")}
                    />
                  </div>
                </Field>
                <Field label="Guests" error={errors.guests}>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mocha" />
                    <select
                      value={form.guests}
                      onChange={(e) => set("guests", Number(e.target.value))}
                      className={inputCls(false, "pl-9 appearance-none")}
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} {i === 0 ? "guest" : "guests"}</option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>

              <Field label="Time slot" error={errors.time}>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {RESERVATION_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => set("time", slot)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-sm border py-2.5 font-sans text-sm transition-all",
                        form.time === slot
                          ? "border-espresso bg-espresso text-ivory"
                          : "border-border bg-card text-mocha hover:border-mocha"
                      )}
                    >
                      <Clock className="size-3.5" />
                      {slot}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Special requests" optional>
                <textarea
                  value={form.specialRequests}
                  onChange={(e) => set("specialRequests", e.target.value)}
                  rows={3}
                  className={inputCls(false)}
                  placeholder="Anniversary, quiet corner, accessibility needs…"
                />
              </Field>

              <LuxeButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={mutation.isPending}
                className="w-full sm:w-auto"
              >
                {mutation.isPending ? "Requesting…" : "Request Reservation"}
                {!mutation.isPending && <ArrowRight className="size-4" />}
              </LuxeButton>
            </form>
          </Reveal>

          {/* Aside */}
          <Reveal delay={0.12} className="flex flex-col gap-6">
            <SmartImage
              src={GALLERY_IMAGES[4] ?? RESERVATION_IMAGE}
              alt="Café table"
              aspect="landscape"
              className="rounded-sm shadow-luxe"
            />
            <div className="flex flex-col gap-4 border border-border bg-card p-6">
              <h3 className="font-display text-xl text-espresso">Good to know</h3>
              <ul className="flex flex-col gap-3 text-sm text-mocha">
                <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-olive" /> Tables held for 15 minutes past the booked time.</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-olive" /> Parties of 7+ may be seated across adjoining tables.</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-olive" /> Reservations open up to 60 days in advance.</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-olive" /> Walk-ins always welcome, subject to room.</li>
              </ul>
              <div className="border-t border-border pt-4 text-sm text-muted-foreground">
                <p className="font-editorial text-base text-mocha">{CAFE.address}</p>
                <p className="mt-1">{CAFE.hours}</p>
                <p className="mt-1">Call {CAFE.phone} · {formatINR(0).replace("₹0", "")}no booking fee</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center gap-2 font-sans text-xs uppercase tracking-wide-2 text-mocha">
        {label}
        {optional && <span className="text-muted-foreground/60 normal-case tracking-normal">(optional)</span>}
      </span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

function inputCls(hasError: boolean, extra = "") {
  return cn(
    "h-11 w-full rounded-sm border bg-card px-3 font-sans text-sm text-espresso outline-none transition-colors focus:border-mocha",
    hasError ? "border-destructive" : "border-border",
    extra
  );
}

function formatDateNice(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}
