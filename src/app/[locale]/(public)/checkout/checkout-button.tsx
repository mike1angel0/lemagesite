"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export function CheckoutButton({ items, email }: { items: CartItem[]; email?: string }) {
  const t = useTranslations("checkout");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        variant="filled"
        size="lg"
        className="w-full mt-4"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? t("processing") ?? "Processing..." : t("placeOrder")}
      </Button>
      {error && (
        <p className="font-sans text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
