"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/content/product-card";
import { PLACEHOLDER } from "@/lib/placeholders";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";

type ProductData = {
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number;
  category: string;
  stock: number;
};

type RelatedProduct = {
  title: string;
  image: string | null;
  price: number;
  slug: string;
};

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: ProductData;
  relatedProducts: RelatedProduct[];
}) {
  const t = useTranslations("shop");
  const tc = useTranslations("common");
  const [quantity, setQuantity] = useState(1);

  return (
    <section>
      {/* -- Product Hero -- */}
      <div className="flex gap-12 px-5 md:px-20 py-16">
        {/* Product Image */}
        <div className="w-[500px] h-[500px] rounded-lg shrink-0 relative overflow-hidden">
          <Image src={product.image ?? PLACEHOLDER.product} alt={product.title} fill className="object-cover" />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-center gap-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-sans text-xs text-text-muted">
            <Link
              href="/shop"
              className="hover:text-text-secondary transition-colors"
            >
              {t("title")}
            </Link>
            <span>/</span>
            <span className="text-text-secondary">{product.category}</span>
          </div>

          <h1 className="font-serif text-[38px] font-semibold text-text-primary leading-tight">
            {product.title}
          </h1>

          <p className="font-serif text-[32px] font-bold text-gold">
            &euro;{product.price.toFixed(2)}
          </p>

          {product.description && (
            <p className="font-sans text-[15px] text-text-secondary leading-[1.7]">
              {product.description}
            </p>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              {tc("quantity")}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-8 h-8 border border-border text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors text-sm"
              >
                &minus;
              </button>
              <span className="font-sans text-sm text-text-primary w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
                className="w-8 h-8 border border-border text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors text-sm"
              >
                +
              </button>
            </div>
            <span className="font-sans text-xs text-text-muted">
              {t("inStock", { count: product.stock })}
            </span>
          </div>

          {/* Add to Cart */}
          <AddToCartButton
            productId={product.slug}
            title={product.title}
            price={product.price}
            image={product.image ?? PLACEHOLDER.product}
            label={tc("addToCart")}
            className="w-[280px] h-11 inline-flex items-center justify-center gap-2 bg-gold text-bg font-sans text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
          />
        </div>
      </div>

      {/* -- Related Products -- */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border px-5 md:px-20 py-10">
          <SectionLabel label={t("youMightAlsoLike").toUpperCase()} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.slug}
                title={p.title}
                image={p.image ?? PLACEHOLDER.product}
                price={p.price}
                slug={p.slug}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
