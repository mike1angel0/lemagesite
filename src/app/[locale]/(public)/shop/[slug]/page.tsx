import { notFound } from "next/navigation";
import { getProductBySlug, getPublishedProducts } from "@/lib/data";
import { ProductDetailClient } from "./product-detail-client";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const allProducts = await getPublishedProducts();
  const relatedProducts = allProducts
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map((p) => ({
      title: p.title,
      image: p.image,
      price: Number(p.price),
      slug: `/shop/${p.slug}`,
    }));

  return (
    <ProductDetailClient
      product={{
        title: product.title,
        slug: product.slug,
        description: product.description,
        image: product.image,
        price: Number(product.price),
        category: product.category,
        stock: product.stock,
      }}
      relatedProducts={relatedProducts}
    />
  );
}
