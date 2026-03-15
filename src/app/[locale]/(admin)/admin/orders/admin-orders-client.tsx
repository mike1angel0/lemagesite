"use client";

import { useState, useActionState } from "react";
import { Plus, X, Eye, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createOrderAction, updateOrderStatusAction } from "@/lib/actions/orders";
import type { AuthState } from "@/lib/actions/auth";

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  customer: { name: string; email: string };
  items: OrderItem[];
}

interface ProductOption {
  id: string;
  title: string;
  price: number;
}

const statusBadgeColors: Record<string, string> = {
  PENDING: "bg-text-muted/10 text-text-muted",
  PAID: "bg-accent/10 text-accent",
  SHIPPED: "bg-gold/10 text-gold",
  DELIVERED: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
  CANCELLED: "bg-[#BF6B6B]/10 text-[#BF6B6B]",
};

const filterTabs = ["All", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const filterLabels: Record<string, string> = {
  All: "All",
  PENDING: "Pending",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusOptions = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export function AdminOrdersClient({
  orders,
  products,
}: {
  orders: Order[];
  products: ProductOption[];
}) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [createState, createAction, createPending] = useActionState(createOrderAction, {} as AuthState);
  const [statusState, statusAction, statusPending] = useActionState(updateOrderStatusAction, {} as AuthState);
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || "");

  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  // Detail view
  if (selectedOrder) {
    const order = orders.find((o) => o.id === selectedOrder);
    if (!order) return null;

    return (
      <div className="p-8 max-w-3xl">
        <button
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[2px] text-text-muted hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="size-3" />
          Back to orders
        </button>

        <h2 className="font-serif text-xl text-text-primary mb-1">
          Order {order.id.slice(0, 8)}
        </h2>
        <p className="font-sans text-sm text-text-muted mb-6">
          {new Date(order.createdAt).toLocaleString()}
        </p>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted">Customer</span>
            <p className="font-sans text-sm text-text-primary mt-1">{order.customer.name || order.customer.email}</p>
            <p className="font-sans text-xs text-text-muted">{order.customer.email}</p>
          </div>
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted">Total</span>
            <p className="font-serif text-2xl text-text-primary mt-1">&euro;{order.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Items */}
        <div className="border border-border rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Item</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Qty</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">{item.title}</td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">{item.quantity}</td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">&euro;{item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Update Status */}
        <div className="border border-border rounded-lg p-5">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted">Update Status</span>

          {statusState.success && (
            <p className="mt-3 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
              Status updated.
            </p>
          )}
          {statusState.error && (
            <p className="mt-3 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
              {statusState.error}
            </p>
          )}

          <form action={statusAction} className="mt-3">
            <input type="hidden" name="orderId" value={order.id} />
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  type="submit"
                  name="status"
                  value={s}
                  disabled={statusPending || order.status === s}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-mono tracking-[1px] border rounded transition-colors",
                    order.status === s
                      ? "bg-accent text-bg-primary border-accent"
                      : "border-border text-text-secondary hover:border-accent-dim disabled:opacity-50"
                  )}
                >
                  {filterLabels[s]}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">Orders</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 font-sans text-[12px] text-text-secondary hover:bg-bg-elevated transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Order
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-8 mt-6">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              "rounded-md px-3.5 py-1.5 font-sans text-[12px] transition-colors",
              activeFilter === tab
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {filterLabels[tab]}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="px-8 mt-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Order ID</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Status</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Items</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Customer</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Total</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Date</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-b-0">
                  <td className="font-mono text-[12px] text-text-primary px-4 py-3.5">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full", statusBadgeColors[order.status])}>
                      {filterLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5 max-w-[200px] truncate">
                    {order.items.map((i) => i.title).join(", ") || "—"}
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {order.customer.name || order.customer.email}
                  </td>
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    &euro;{order.total.toFixed(2)}
                  </td>
                  <td className="font-sans text-[13px] text-text-muted px-4 py-3.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setSelectedOrder(order.id)}
                      className="rounded p-1 hover:bg-bg-elevated transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-text-muted" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center font-sans text-sm text-text-muted py-8">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pb-8">
          <span className="font-sans text-[12px] text-text-muted">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md border border-border bg-bg-surface rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg text-text-primary">New Order</h2>
              <button onClick={() => setShowNewModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {createState.success && (
              <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
                Order created.
              </p>
            )}
            {createState.error && (
              <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                {createState.error}
              </p>
            )}

            <form action={createAction}>
              <div className="space-y-4">
                <Input id="order-email" name="userEmail" type="email" label="Customer Email" required />

                <div className="flex flex-col">
                  <label htmlFor="order-product" className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2">
                    Product
                  </label>
                  <input type="hidden" name="productId" value={selectedProduct} />
                  {products.length === 0 ? (
                    <p className="font-sans text-sm text-text-muted">No products available. Add products first.</p>
                  ) : (
                    <select
                      id="order-product"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full bg-transparent border border-border text-text-primary font-sans text-sm px-4 py-3.5 focus:outline-none focus:border-accent-dim"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id} className="bg-bg-surface">
                          {p.title} — €{p.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <Input id="order-qty" name="quantity" type="number" label="Quantity" min="1" defaultValue="1" />
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="filled" disabled={createPending || products.length === 0}>
                  {createPending ? "Creating..." : "Create Order"}
                </Button>
                <Button variant="ghost" type="button" onClick={() => setShowNewModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
