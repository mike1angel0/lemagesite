import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminOrdersClient } from "./admin-orders-client";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: { product: { select: { title: true } } },
        },
      },
    }),
    prisma.product.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, price: true },
    }),
  ]);

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    customer: {
      name: o.user.name || "",
      email: o.user.email,
    },
    items: o.items.map((i) => ({
      title: i.product.title,
      quantity: i.quantity,
      price: Number(i.price),
    })),
  }));

  const serializedProducts = products.map((p) => ({
    id: p.id,
    title: p.title,
    price: Number(p.price),
  }));

  return <AdminOrdersClient orders={serializedOrders} products={serializedProducts} />;
}
