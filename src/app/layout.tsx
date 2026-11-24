import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brew & Bloom — Crafted with Passion. Served with Love.",
  description:
    "Brew & Bloom is a luxury specialty café. Discover exceptional coffee, handcrafted delicacies and moments worth slowing down for.",
  keywords: [
    "specialty coffee",
    "luxury café",
    "artisan bakery",
    "handcrafted coffee",
    "Brew and Bloom",
    "cafe reservations",
  ],
  authors: [{ name: "Brew & Bloom" }],
  openGraph: {
    title: "Brew & Bloom — Crafted with Passion. Served with Love.",
    description:
      "Discover exceptional coffee, handcrafted delicacies and moments worth slowing down for.",
    siteName: "Brew & Bloom",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brew & Bloom",
    description: "Crafted with Passion. Served with Love.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${cormorant.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
