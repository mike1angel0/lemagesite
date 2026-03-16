"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/ui/cart-provider";
import { Input } from "@/components/ui/input";

type Labels = Record<string, string>;

export function CheckoutClient({ labels }: { labels: Labels }) {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping: number = 0;
  const total: number = totalPrice + shipping;

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-5 py-20 gap-6">
        <h1 className="font-serif text-3xl text-text-primary">
          {labels.emptyCart || "Your cart is empty"}
        </h1>
        <Link
          href="/shop"
          className="font-mono text-xs text-accent hover:text-gold transition-colors tracking-[1px]"
        >
          {labels.continueShopping || "Continue shopping"} &rarr;
        </Link>
      </section>
    );
  }

  return (
    <section className="px-5 md:px-10 xl:px-20 py-12">
      <h1 className="font-serif text-3xl md:text-[42px] font-light text-warm-ivory leading-tight">
        {labels.heroTitle}
      </h1>

      <div className="flex flex-col md:flex-row gap-12 mt-10">
        {/* Cart Items */}
        <div className="flex-1">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
            {labels.yourCart}
          </span>

          <div className="mt-4 space-y-0">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 py-6 border-t border-border"
              >
                {item.image && (
                  <div className="w-16 h-16 rounded shrink-0 relative overflow-hidden">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-sans text-sm text-text-primary">{item.title}</h3>
                  {item.variant && (
                    <p className="font-mono text-[10px] text-text-muted mt-1">{item.variant}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center border border-border rounded text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-mono text-xs text-text-primary w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center border border-border rounded text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <span className="font-serif text-lg font-bold text-gold w-20 text-right">
                  &euro;{(item.price * item.quantity).toFixed(2)}
                </span>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-text-muted hover:text-red-400 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4 mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="font-sans text-sm text-text-secondary">{labels.subtotal}</span>
              <span className="font-sans text-sm text-text-primary">
                &euro;{totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-text-secondary">{labels.shipping}</span>
              <span className="font-sans text-sm text-text-primary">
                {shipping === 0 ? labels.shippingFree : `€${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-sans text-sm font-medium text-text-primary">{labels.total}</span>
              <span className="font-serif text-xl font-bold text-gold">
                &euro;{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="w-full md:w-[400px] bg-bg-surface p-8 rounded">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
            {labels.shippingDetails}
          </span>

          <div className="flex flex-col gap-5 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <Input id="firstName" label={labels.firstNameLabel} type="text" placeholder={labels.firstNamePlaceholder} />
              <Input id="lastName" label={labels.lastNameLabel} type="text" placeholder={labels.lastNamePlaceholder} />
            </div>
            <Input id="email" label={labels.emailLabel} type="email" placeholder={labels.emailPlaceholder} />
            <Input id="address" label={labels.addressLabel} type="text" placeholder={labels.addressPlaceholder} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="city" label={labels.cityLabel} type="text" placeholder={labels.cityPlaceholder} />
              <Input id="postalCode" label={labels.postalCodeLabel} type="text" placeholder={labels.postalCodePlaceholder} />
            </div>

            {error && (
              <p className="font-sans text-xs text-red-400">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-11 bg-accent text-bg font-sans text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? labels.processing : `${labels.total} — €${total.toFixed(2)}`}
            </button>
          </div>

          <p className="font-mono text-[10px] text-text-muted text-center mt-4">
            {labels.securedNote}
          </p>
        </div>
      </div>
    </section>
  );
}
