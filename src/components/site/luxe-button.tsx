"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const luxeButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-wide-2 uppercase text-[0.72rem] rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5 group-hover:[&_svg]:translate-x-0.5",
  {
    variants: {
      variant: {
        primary:
          "btn-grad btn-shine text-white",
        matcha:
          "btn-grad-matcha btn-shine text-white",
        outline:
          "border-2 border-amber bg-white/60 text-amber-dark hover:border-transparent hover:text-white hover:bg-amber shadow-glow-amber",
        ghost: "text-coffee hover:bg-amber/15 hover:text-amber-dark",
        light: "bg-white text-amber-dark shadow-luxe hover:bg-peach",
        dark: "bg-coffee text-white hover:bg-espresso shadow-luxe",
        champagne: "bg-peach text-coffee hover:bg-amber/20 shadow-luxe",
        berry: "bg-berry text-white hover:bg-berry/90 shadow-luxe",
        link: "text-amber-dark hover:text-coral underline-offset-4 hover:underline normal-case tracking-normal",
      },
      size: {
        sm: "h-9 px-5",
        md: "h-11 px-7",
        lg: "h-13 px-9 text-[0.78rem]",
        xl: "h-14 px-11 text-[0.8rem]",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type LuxeButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof luxeButtonVariants> & {
    asChild?: boolean;
  };

export function LuxeButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: LuxeButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="luxe-button"
      className={cn(luxeButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
