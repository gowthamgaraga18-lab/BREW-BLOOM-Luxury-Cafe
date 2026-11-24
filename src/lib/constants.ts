export const CAFE = {
  name: "Brew & Bloom",
  tagline: "Crafted with Passion. Served with Love.",
  phone: process.env.NEXT_PUBLIC_CAFE_PHONE ?? "+91 98765 43210",
  email: process.env.NEXT_PUBLIC_CAFE_EMAIL ?? "hello@brewbloom.cafe",
  address:
    process.env.NEXT_PUBLIC_CAFE_ADDRESS ??
    "14 Lavelle Lane, Bengaluru, Karnataka 560001",
  hours: process.env.NEXT_PUBLIC_CAFE_HOURS ?? "Mon–Sun · 7:30 AM – 11:00 PM",
  deliveryCharge: 40,
  freeDeliveryThreshold: 800,
};

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Our Story", to: "/story" },
  { label: "Menu", to: "/menu" },
  { label: "Gallery", to: "/gallery" },
  { label: "Reservations", to: "/reservations" },
  { label: "Contact", to: "/contact" },
] as const;

export const RESERVATION_SLOTS = [
  "08:00",
  "09:30",
  "11:00",
  "12:30",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
  "19:30",
  "20:30",
  "21:30",
];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;

export const FEATURED_PROMOTIONS = [
  {
    code: "BLOOM10",
    title: "10% off your first brew",
    desc: "New here? Enjoy 10% off with code BLOOM10.",
  },
  {
    code: "WEEKEND15",
    title: "Weekend indulgence",
    desc: "15% off desserts every Saturday & Sunday.",
  },
  {
    code: "FREESHIP",
    title: "Complimentary delivery",
    desc: "Free delivery on orders above ₹800.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Anaïs Verma",
    role: "Food Writer",
    quote:
      "The signature latte is the most considered cup of coffee I've had in the city. Brew & Bloom treats coffee like a craft, not a commodity.",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    role: "Architect",
    quote:
      "An interior that feels like a quiet library for the senses. The croissants alone are worth the journey across town.",
    rating: 5,
  },
  {
    name: "Lena Kapoor",
    role: "Photographer",
    quote:
      "Every plate is art-directed. The blueberry cheesecake arrived like a still life — and tasted even better than it looked.",
    rating: 5,
  },
];
