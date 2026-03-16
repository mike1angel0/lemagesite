import { getTranslations, getLocale } from "next-intl/server";
import { getPublishedProducts, getPageContent } from "@/lib/data";
import { ShopClient } from "./shop-client";

export default async function ShopPage() {
  const t = await getTranslations("shop");
  const locale = await getLocale();
  const content = await getPageContent("shop", ["sectionLabel", "heroTitle", "heroDescription"], locale, t);
  const products = await getPublishedProducts();

  const serialized = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    image: p.image,
    price: Number(p.price),
    category: p.category,
    stock: p.stock,
    featured: p.featured,
  }));

  return <ShopClient products={serialized} heroContent={content} />;
}
