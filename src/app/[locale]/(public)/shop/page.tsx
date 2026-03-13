"use client";

import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const categories = [
  { label: "All", active: true },
  { label: "Books", active: false },
  { label: "Prints", active: false },
  { label: "Apparel", active: false },
  { label: "Objects", active: false },
  { label: "Digital", active: false },
];

const products = [
  {
    tag: "BOOK",
    tagColor: "text-accent-dim",
    title: "Cartography of Silence",
    price: "\u20AC24",
    slug: "/shop/cartography-of-silence",
  },
  {
    tag: "PRINT",
    tagColor: "text-[#818CF8]",
    title: "Fog Studies No. 7 \u2014 Signed",
    price: "\u20AC45",
    slug: "/shop/fog-studies-no-7",
  },
  {
    tag: "APPAREL",
    tagColor: "text-gold",
    title: "Observatory Tee \u2014 Midnight",
    price: "\u20AC32",
    slug: "/shop/observatory-tee",
  },
  {
    tag: "OBJECT",
    tagColor: "text-[#34D399]",
    title: "Ceramic Observatory Mug",
    price: "\u20AC18",
    slug: "/shop/ceramic-mug",
  },
  {
    tag: "DIGITAL",
    tagColor: "text-[#22D3EE]",
    title: "Complete Poetry PDF Bundle",
    price: "\u20AC12",
    slug: "/shop/poetry-pdf-bundle",
  },
  {
    tag: "PRINT",
    tagColor: "text-[#818CF8]",
    title: "Winter Light Triptych",
    price: "\u20AC65",
    slug: "/shop/winter-light-triptych",
  },
];

export default function ShopPage() {
  const t = useTranslations("shop");

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-5 md:px-10 xl:px-20 pt-20 pb-[60px] gap-6">
        <SectionLabel label="THE SCRIPTORIUM" className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary text-center leading-[1.1] max-w-[600px] whitespace-pre-line">
          Objects of{"\n"}Contemplation
        </h1>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[520px]">
          Books, prints, and artifacts from the Observatory.
          {"\n"}Each object handmade or carefully selected to accompany your inner life.
          {"\n\n"}The sort of things a fox might treasure.
        </p>

        <div className="w-10 h-px bg-accent-dim" />
      </section>

      {/* ── Category Filter ── */}
      <section className="flex justify-center items-center gap-6 px-5 md:px-10 xl:px-20">
        {categories.map((cat) => (
          <span
            key={cat.label}
            onClick={() => alert(`${cat.label} filter coming soon`)}
            className={`font-sans text-xs cursor-pointer transition-colors ${
              cat.active
                ? "bg-accent text-text-on-accent font-medium rounded-full px-5 py-2"
                : "text-text-secondary tracking-[1px]"
            }`}
          >
            {cat.label}
          </span>
        ))}
      </section>

      {/* ── Featured Product ── */}
      <section className="px-5 md:px-10 xl:px-20 pt-10">
        <span className="font-mono text-[10px] tracking-[3px] text-text-muted">
          FEATURED
        </span>

        <div className="flex flex-col md:flex-row gap-8 mt-8 h-[420px]">
          {/* Image placeholder */}
          <div className="flex-1 h-full bg-bg-surface border border-border rounded" />

          {/* Info */}
          <div className="flex flex-col justify-center gap-5 w-full md:w-[480px]">
            <span className="font-mono text-[10px] tracking-[3px] text-gold">
              POETRY COLLECTION &middot; NEW
            </span>
            <h2 className="font-serif text-[40px] font-light text-text-primary">
              Nocturnal Echoes
            </h2>
            <p className="font-sans text-sm text-text-secondary leading-[1.7]">
              47 poems on silence, machines, and the weight of unsaid words. First edition, hand-numbered. Includes original sketches and marginalia not found in the digital edition.
            </p>
            <p className="font-serif text-[15px] italic text-accent-dim">
              &ldquo;A stunning meditation on intelligence.&rdquo; — Literary Review
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-semibold text-text-primary">
                &euro;28
              </span>
              <span className="font-mono text-[11px] text-accent-dim">
                Hardcover &middot; First Edition
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="gold" size="md" asChild>
                <Link href="/checkout">{t("addToCart")}</Link>
              </Button>
              <Button variant="ghost" size="md" asChild>
                <Link href="/shop/nocturnal-echoes">View Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="px-5 md:px-10 xl:px-20 pt-10 pb-20">
        <span className="font-mono text-[10px] tracking-[3px] text-text-muted">
          ALL ITEMS
        </span>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-8">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={product.slug}
              className="flex flex-col gap-4"
            >
              {/* Image placeholder */}
              <div className="w-full h-[340px] bg-bg-surface border border-border rounded" />

              <div className="flex flex-col gap-2">
                <span className={`font-mono text-[9px] tracking-[2px] ${product.tagColor}`}>
                  {product.tag}
                </span>
                <h3 className="font-serif text-xl text-text-primary">
                  {product.title}
                </h3>
                <span className="font-mono text-sm font-medium text-text-primary">
                  {product.price}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
