import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminScriptoriumClient } from "./admin-scriptorium-client";

export default async function AdminScriptoriumPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  const serializedProducts = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: Number(p.price),
    category: p.category,
    stock: p.stock,
    featured: p.featured,
    image: p.image,
  }));

  const serializedOrders = recentOrders.map((o) => ({
    id: o.id,
    customer: o.user.name || "Unknown",
    total: Number(o.total),
    status: o.status,
  }));

  return (
    <AdminScriptoriumClient
      products={serializedProducts}
      recentOrders={serializedOrders}
    />
  );
}
