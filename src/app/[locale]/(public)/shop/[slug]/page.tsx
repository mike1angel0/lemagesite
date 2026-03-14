"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/content/product-card";

const relatedProducts = [
  {
    title: "Winter Light Triptych",
    image: "/images/shop/winter-light-triptych.jpg",
    price: 45.0,
    slug: "/shop/winter-light-triptych",
  },
  {
    title: "Selenarium Tee",
    image: "/images/shop/selenarium-tee.jpg",
    price: 29.0,
    slug: "/shop/selenarium-tee",
  },
  {
    title: "Cartographers of Silence",
    image: "/images/shop/cartographers-silence.jpg",
    price: 28.0,
    slug: "/shop/cartographers-of-silence",
  },
];

export default function ProductDetailPage() {
  const t = useTranslations("shop");
  const tc = useTranslations("common");
  const [quantity, setQuantity] = useState(1);

  return (
    <section>
      {/* -- Product Hero -- */}
      <div className="flex gap-12 px-20 py-16">
        {/* Product Image */}
        <div className="w-[500px] h-[500px] bg-bg-surface rounded-lg shrink-0" />

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-center gap-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-sans text-xs text-text-muted">
            <Link
              href="/shop"
              className="hover:text-text-secondary transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-text-secondary">Books</span>
          </div>

          <h1 className="font-serif text-[38px] font-semibold text-text-primary leading-tight">
            Nocturnal Echoes
          </h1>

          <p className="font-sans text-sm text-text-secondary">
            First Edition &bull; Hardcover &bull; Signed by the author
          </p>

          <p className="font-serif text-[32px] font-bold text-gold">
            &euro;28.00
          </p>

          <p className="font-sans text-[15px] text-text-secondary leading-[1.7]">
            The debut poetry collection exploring the intersection of astronomy,
            memory, and language. 96 pages of verse accompanied by original
            astronomical photography. Printed on acid-free paper with
            hand-stitched binding.
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              Quantity
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 border border-border text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors text-sm"
              >
                &minus;
              </button>
              <span className="font-sans text-sm text-text-primary w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(16, q + 1))}
                className="w-8 h-8 border border-border text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors text-sm"
              >
                +
              </button>
            </div>
            <span className="font-sans text-xs text-text-muted">
              16 in stock
            </span>
          </div>

          {/* Add to Cart */}
          <Button variant="gold" size="lg" className="w-[280px]" asChild>
            <Link href="/checkout">{tc("addToCart")}</Link>
          </Button>
        </div>
      </div>

      {/* -- Related Products -- */}
      <div className="border-t border-border px-20 py-10">
        <SectionLabel label="You May Also Like" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {relatedProducts.map((product) => (
            <ProductCard
              key={product.slug}
              title={product.title}
              image={product.image}
              price={product.price}
              slug={product.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
