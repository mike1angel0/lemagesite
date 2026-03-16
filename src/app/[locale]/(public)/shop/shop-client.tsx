"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PLACEHOLDER } from "@/lib/placeholders";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number;
  category: string;
  stock: number;
  featured: boolean;
};

const categoryKeys = [
  { labelKey: "filterAll", value: "" },
  { labelKey: "filterBooks", value: "BOOKS" },
  { labelKey: "filterPrints", value: "PRINTS" },
  { labelKey: "filterApparel", value: "APPAREL" },
  { labelKey: "filterObjects", value: "OBJECTS" },
  { labelKey: "filterDigital", value: "DIGITAL" },
];

const categoryColors: Record<string, string> = {
  BOOKS: "text-accent-dim",
  PRINTS: "text-[#818CF8]",
  APPAREL: "text-gold",
  OBJECTS: "text-[#34D399]",
  DIGITAL: "text-[#22D3EE]",
};

export function ShopClient({ products, heroContent }: { products: Product[]; heroContent: Record<string, string> }) {
  const t = useTranslations("shop");
  const [activeCategory, setActiveCategory] = useState("");

  const featuredProduct = products.find((p) => p.featured);
  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-5 md:px-10 xl:px-20 pt-20 pb-[60px] gap-6">
        <SectionLabel label={heroContent.sectionLabel} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary text-center leading-[1.1] max-w-[600px] whitespace-pre-line">
          {heroContent.heroTitle}
        </h1>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[520px]">
          {heroContent.heroDescription}
        </p>

        <div className="w-10 h-px bg-accent-dim" />
      </section>

      {/* ── Category Filter ── */}
      <section className="flex justify-center items-center gap-6 px-5 md:px-10 xl:px-20">
        {categoryKeys.map((cat) => (
          <button
            key={cat.labelKey}
            onClick={() => setActiveCategory(cat.value)}
            className={`font-sans text-xs transition-colors ${
              activeCategory === cat.value
                ? "bg-accent text-text-on-accent font-medium rounded-full px-5 py-2"
                : "text-text-secondary tracking-[1px] hover:text-text-primary"
            }`}
          >
            {t(cat.labelKey)}
          </button>
        ))}
      </section>

      {/* ── Featured Product ── */}
      {featuredProduct && (
        <section className="px-5 md:px-10 xl:px-20 pt-10">
          <span className="font-mono text-[10px] tracking-[3px] text-text-muted">
            {t("featuredLabel")}
          </span>

          <div className="flex flex-col md:flex-row gap-8 mt-8 h-[420px]">
            {/* Featured image */}
            <div className="flex-1 h-full border border-border rounded relative overflow-hidden">
              <Image src={featuredProduct.image ?? PLACEHOLDER.product} alt={featuredProduct.title} fill className="object-cover" />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center gap-5 w-full md:w-[480px]">
              <span className="font-mono text-[10px] tracking-[3px] text-gold">
                {featuredProduct.category} &middot; {t("newLabel")}
              </span>
              <h2 className="font-serif text-[40px] font-light text-text-primary">
                {featuredProduct.title}
              </h2>
              <p className="font-sans text-sm text-text-secondary leading-[1.7]">
                {featuredProduct.description}
              </p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-semibold text-text-primary">
                  &euro;{featuredProduct.price.toFixed(0)}
                </span>
              </div>
              <div className="flex gap-3">
                <AddToCartButton
                  productId={featuredProduct.id}
                  title={featuredProduct.title}
                  price={featuredProduct.price}
                  image={featuredProduct.image ?? PLACEHOLDER.product}
                  label={t("addToCart")}
                />
                <Button variant="ghost" size="md" asChild>
                  <Link href={`/shop/${featuredProduct.slug}`}>{t("viewDetails")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Product Grid ── */}
      <section className="px-5 md:px-10 xl:px-20 pt-10 pb-20">
        <span className="font-mono text-[10px] tracking-[3px] text-text-muted">
          {t("allItems")}
        </span>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-8">
          {filteredProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/shop/${product.slug}`}
              className="flex flex-col gap-4"
            >
              {/* Product image */}
              <div className="w-full h-[340px] border border-border rounded relative overflow-hidden">
                <Image src={product.image ?? PLACEHOLDER.product} alt={product.title} fill className="object-cover" />
              </div>

              <div className="flex flex-col gap-2">
                <span className={`font-mono text-[9px] tracking-[2px] ${categoryColors[product.category] ?? "text-accent-dim"}`}>
                  {product.category}
                </span>
                <h3 className="font-serif text-xl text-text-primary">
                  {product.title}
                </h3>
                <span className="font-mono text-sm font-medium text-text-primary">
                  &euro;{product.price.toFixed(0)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
