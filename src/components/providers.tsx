"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ServiceWorkerRegister } from "@/components/ui/service-worker-register";
import { CartProvider } from "@/components/ui/cart-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <CartProvider>
          {children}
        </CartProvider>
        <ServiceWorkerRegister />
      </ThemeProvider>
    </SessionProvider>
  );
}
