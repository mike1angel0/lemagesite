"use client";

import { cn } from "@/lib/utils";

const stats = [
  { label: "PRODUCTS", value: "88" },
  { label: "TOTAL REVENUE", value: "\u20AC4,280" },
  { label: "TOTAL ORDERS", value: "127" },
  { label: "ACTIVE PRODUCTS", value: "24" },
  { label: "AVG. ORDER VALUE", value: "\u20AC13.70" },
];

const productTabs = ["All", "Ebooks", "Prints", "Bundles"];
const activeTab = "All";

const statusBadgeColors: Record<string, string> = {
  Active: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
  Draft: "bg-gold/10 text-gold",
};

const products = [
  {
    name: "Nocturnal Editions",
    price: "\u20AC29",
    sold: 139,
    revenue: "\u20AC4,031",
    status: "Active",
  },
  {
    name: "Cartography of Silence",
    price: "\u20AC19",
    sold: 87,
    revenue: "\u20AC1,653",
    status: "Active",
  },
  {
    name: "Fog Studies No. 7",
    price: "\u20AC15",
    sold: 64,
    revenue: "\u20AC960",
    status: "Active",
  },
  {
    name: "Observatory Tea",
    price: "\u20AC32",
    sold: 41,
    revenue: "\u20AC1,312",
    status: "Active",
  },
  {
    name: "Ceramic Observatory Mug",
    price: "\u20AC30",
    sold: 28,
    revenue: "\u20AC840",
    status: "Draft",
  },
  {
    name: "Complete Poetry PDF",
    price: "\u20AC45",
    sold: 22,
    revenue: "\u20AC990",
    status: "Active",
  },
];

const recentOrders = [
  { id: "#1042", customer: "Elena U.", amount: "\u20AC45" },
  { id: "#1041", customer: "Sophia M.", amount: "\u20AC65" },
  { id: "#1040", customer: "Andrei P.", amount: "\u20AC29" },
  { id: "#1039", customer: "Clara D.", amount: "\u20AC19" },
  { id: "#1038", customer: "Radu V.", amount: "\u20AC32" },
];

export default function AdminScriptoriumPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl text-text-primary">
            The Scriptorium
          </h1>
          <p className="font-sans text-sm text-text-secondary mt-0.5">
            Manage products, ebooks &amp; print shop
          </p>
        </div>
        <button
          onClick={() => alert("Add product coming soon")}
          className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Add Product
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-8 mt-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-card border border-border rounded-lg p-5"
          >
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              {stat.label}
            </p>
            <p className="font-serif text-[32px] font-light text-text-primary mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Products + Recent Orders ── */}
      <div className="flex gap-6 px-8 mt-8">
        {/* Products Table */}
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-lg text-text-primary mb-4">
            Products
          </h2>

          {/* Tabs */}
          <div className="border-b border-border pb-4 mb-0">
            <div className="flex items-center gap-6">
              {productTabs.map((tab) => (
                <span
                  key={tab}
                  onClick={() => alert(`${tab} filter coming soon`)}
                  className={cn(
                    "font-sans text-xs cursor-pointer pb-4 transition-colors",
                    tab === activeTab
                      ? "border-b-2 border-accent text-accent font-medium"
                      : "text-text-muted hover:text-text-secondary",
                  )}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Product
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Price
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Sold
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Revenue
                </th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((row) => (
                <tr key={row.name} className="border-b border-border">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    {row.name}
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.price}
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.sold}
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.revenue}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full",
                        statusBadgeColors[row.status],
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Orders Sidebar */}
        <div className="w-[300px] shrink-0">
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <h3 className="font-serif text-lg text-text-primary mb-4">
              Recent Orders
            </h3>
            <div className="space-y-0">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                >
                  <div>
                    <p className="font-sans text-[13px] text-text-primary">
                      {order.id}
                    </p>
                    <p className="font-sans text-[11px] text-text-muted mt-0.5">
                      {order.customer}
                    </p>
                  </div>
                  <span className="font-serif text-base text-text-primary">
                    {order.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
