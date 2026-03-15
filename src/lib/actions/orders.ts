"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthState } from "@/lib/actions/auth";

export async function createOrderAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return { error: "Not authorized" };

  const userEmail = (formData.get("userEmail") as string)?.trim();
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;

  if (!userEmail) return { error: "Customer email is required" };
  if (!productId) return { error: "Product is required" };

  const customer = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!customer) return { error: "No user found with that email" };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Product not found" };

  const total = Number(product.price) * quantity;

  await prisma.order.create({
    data: {
      userId: customer.id,
      status: "PENDING",
      total,
      items: {
        create: {
          productId: product.id,
          quantity,
          price: product.price,
        },
      },
    },
  });

  return { success: true };
}

export async function updateOrderStatusAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return { error: "Not authorized" };

  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;

  if (!orderId || !status) return { error: "Order ID and status are required" };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" },
  });

  return { success: true };
}
