"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans font-medium tracking-[2px] uppercase transition-colors",
  {
    variants: {
      variant: {
        ghost:
          "border border-accent-dim text-text-secondary hover:text-text-primary hover:border-accent",
        filled:
          "bg-starlight text-text-on-accent hover:bg-accent-glow",
        gold: "bg-gold text-text-on-accent hover:bg-honey",
      },
      size: {
        sm: "text-[10px] px-5 py-2",
        md: "text-[11px] px-7 py-3",
        lg: "text-[13px] px-9 py-3.5",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
