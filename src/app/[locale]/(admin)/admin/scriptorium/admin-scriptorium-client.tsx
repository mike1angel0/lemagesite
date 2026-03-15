"use client";

import { useState, useRef, useActionState } from "react";
import Image from "next/image";
import { X, Upload, AlertTriangle, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addProductAction } from "@/lib/actions/products";
import type { AuthState } from "@/lib/actions/auth";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  category: string;
  stock: number;
  featured: boolean;
  image: string | null;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
}

const categoryLabels: Record<string, string> = {
  BOOKS: "Books",
  PRINTS: "Prints",
  APPAREL: "Apparel",
  OBJECTS: "Objects",
  DIGITAL: "Digital",
};

const categoryTabs = ["All", "BOOKS", "PRINTS", "APPAREL", "OBJECTS", "DIGITAL"];

export function AdminScriptoriumClient({
  products,
  recentOrders,
}: {
  products: Product[];
  recentOrders: RecentOrder[];
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addState, addAction, addPending] = useActionState(addProductAction, {} as AuthState);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("BOOKS");

  // Image upload state
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts =
    activeTab === "All"
      ? products
      : products.filter((p) => p.category === activeTab);

  // Stock analytics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const inStock = products.filter((p) => p.stock > 0).length;

  const lowStockProducts = products
    .filter((p) => p.stock > 0 && p.stock <= 5)
    .sort((a, b) => a.stock - b.stock);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const stats = [
    { label: "PRODUCTS", value: String(totalProducts) },
    { label: "TOTAL STOCK", value: String(totalStock) },
    { label: "IN STOCK", value: String(inStock), color: "text-[#6BBF7B]" },
    { label: "LOW STOCK", value: String(lowStock), color: "text-gold" },
    { label: "OUT OF STOCK", value: String(outOfStock), color: "text-red-400" },
  ];

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setImageUrl(data.secure_url);
    } catch {
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleOpenModal() {
    setImageUrl("");
    setUploadError("");
    setSelectedCategory("BOOKS");
    setShowAddModal(true);
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl text-text-primary">The Scriptorium</h1>
          <p className="font-sans text-sm text-text-secondary mt-0.5">
            Manage products, ebooks &amp; print shop
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Add Product
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-8 mt-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-border rounded-lg p-5">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">{stat.label}</p>
            <p className={cn("font-serif text-[32px] font-light mt-1", stat.color || "text-text-primary")}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="px-8 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockProducts.length > 0 && (
            <div className="border border-red-400/20 bg-red-400/5 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="size-4 text-red-400" />
                <h3 className="font-mono text-[10px] tracking-[2px] uppercase text-red-400">
                  Out of Stock ({outOfStockProducts.length})
                </h3>
              </div>
              <div className="space-y-2">
                {outOfStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="font-sans text-[13px] text-text-primary">{p.title}</span>
                    <span className="font-mono text-[10px] text-red-400 tracking-[1px]">0 units</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="border border-gold/20 bg-gold/5 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Package className="size-4 text-gold" />
                <h3 className="font-mono text-[10px] tracking-[2px] uppercase text-gold">
                  Low Stock ({lowStockProducts.length})
                </h3>
              </div>
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="font-sans text-[13px] text-text-primary">{p.title}</span>
                    <span className="font-mono text-[10px] text-gold tracking-[1px]">{p.stock} units</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products + Recent Orders */}
      <div className="flex gap-6 px-8 mt-8">
        {/* Products Table */}
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-lg text-text-primary mb-4">Products</h2>

          {/* Tabs */}
          <div className="border-b border-border pb-4 mb-0">
            <div className="flex items-center gap-6">
              {categoryTabs.map((tab) => (
                <span
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "font-sans text-xs cursor-pointer pb-4 transition-colors",
                    tab === activeTab
                      ? "border-b-2 border-accent text-accent font-medium"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  {tab === "All" ? "All" : categoryLabels[tab] || tab}
                </span>
              ))}
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Product</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Price</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Category</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((row) => (
                <tr key={row.id} className="border-b border-border">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {row.image && (
                        <Image
                          src={row.image}
                          alt={row.title}
                          width={32}
                          height={32}
                          className="size-8 rounded object-cover"
                        />
                      )}
                      {row.title}
                    </div>
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">&euro;{row.price.toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full bg-text-muted/10 text-text-muted">
                      {categoryLabels[row.category] || row.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "font-sans text-[13px]",
                      row.stock === 0 ? "text-red-400" : row.stock <= 5 ? "text-gold" : "text-text-secondary"
                    )}>
                      {row.stock}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center font-sans text-sm text-text-muted py-8">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Orders Sidebar */}
        <div className="w-[300px] shrink-0">
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <h3 className="font-serif text-lg text-text-primary mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <p className="font-sans text-sm text-text-muted">No orders yet.</p>
            ) : (
              <div className="space-y-0">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div>
                      <p className="font-sans text-[13px] text-text-primary">{order.id.slice(0, 8)}</p>
                      <p className="font-sans text-[11px] text-text-muted mt-0.5">{order.customer}</p>
                    </div>
                    <span className="font-serif text-base text-text-primary">&euro;{order.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto border border-border bg-bg-surface rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg text-text-primary">Add Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {addState.success && (
              <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
                Product added successfully.
              </p>
            )}
            {addState.error && (
              <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                {addState.error}
              </p>
            )}

            <form action={addAction}>
              <div className="space-y-4">
                <Input id="product-title" name="title" label="Title" required />
                <div className="flex flex-col">
                  <label htmlFor="product-desc" className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2">
                    Description
                  </label>
                  <textarea
                    id="product-desc"
                    name="description"
                    rows={3}
                    className="w-full bg-transparent border border-border text-text-primary font-sans text-sm px-4 py-3.5 placeholder:text-text-muted focus:outline-none focus:border-accent-dim"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input id="product-price" name="price" label="Price (€)" type="number" step="0.01" min="0" required />
                  <Input id="product-stock" name="stock" label="Stock" type="number" min="0" defaultValue="0" />
                </div>

                {/* Image Upload */}
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2">
                    Product Image
                  </label>
                  <input type="hidden" name="image" value={imageUrl} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {imageUrl ? (
                    <div className="relative w-full h-[140px] border border-border rounded overflow-hidden group">
                      <Image
                        src={imageUrl}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => { setImageUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute top-2 right-2 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-[100px] border border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:border-accent-dim transition-colors"
                    >
                      {uploading ? (
                        <span className="font-sans text-xs text-text-muted">Uploading...</span>
                      ) : (
                        <>
                          <Upload className="size-5 text-text-muted mb-1.5" />
                          <span className="font-sans text-xs text-text-muted">Click to upload image</span>
                        </>
                      )}
                    </button>
                  )}

                  {uploadError && (
                    <p className="mt-2 font-sans text-xs text-red-400">{uploadError}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2">
                    Category
                  </label>
                  <input type="hidden" name="category" value={selectedCategory} />
                  <div className="grid grid-cols-3 gap-2">
                    {(["BOOKS", "PRINTS", "APPAREL", "OBJECTS", "DIGITAL"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-3 py-2 text-[11px] font-mono tracking-[1px] border rounded transition-colors",
                          selectedCategory === cat
                            ? "bg-accent text-bg-primary border-accent"
                            : "border-border text-text-secondary hover:border-accent-dim"
                        )}
                      >
                        {categoryLabels[cat]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="filled" disabled={addPending || uploading}>
                  {addPending ? "Adding..." : "Add Product"}
                </Button>
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>
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
