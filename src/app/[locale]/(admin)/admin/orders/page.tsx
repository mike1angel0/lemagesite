import {
  Plus,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const filterTabs = ["All", "Pending", "Shipped", "Delivered", "Refunded"];

const columns = [
  "ORDER ID",
  "STATUS",
  "ITEMS",
  "CUSTOMER",
  "TOTAL",
  "DATE",
  "ACTIONS",
];

const statusBadgeColors: Record<string, string> = {
  Fulfilled: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
  Processing: "bg-gold/10 text-gold",
  Shipped: "bg-accent/10 text-accent",
  Pending: "bg-text-muted/10 text-text-muted",
  Refunded: "bg-[#BF6B6B]/10 text-[#BF6B6B]",
  Delivered: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
};

const orderRows = [
  {
    id: "#ORD-1247",
    status: "Fulfilled",
    items: "Cartography of Silence (Signed)",
    customer: "Elena Vasilescu",
    total: "\u20AC28",
    date: "Mar 12, 2026",
  },
  {
    id: "#ORD-1246",
    status: "Processing",
    items: "Winter Light Print (A3)",
    customer: "Andrei Marinescu",
    total: "\u20AC45",
    date: "Mar 11, 2026",
  },
  {
    id: "#ORD-1245",
    status: "Shipped",
    items: "Fog Studies Chapbook + Print Bundle",
    customer: "Clara Dumitrescu",
    total: "\u20AC62",
    date: "Mar 10, 2026",
  },
  {
    id: "#ORD-1244",
    status: "Fulfilled",
    items: "The Weight of Light (Paperback)",
    customer: "Radu Popescu",
    total: "\u20AC18",
    date: "Mar 9, 2026",
  },
  {
    id: "#ORD-1243",
    status: "Refunded",
    items: "Nocturne in Blue Minor (Vinyl)",
    customer: "Ioana Stanescu",
    total: "\u20AC32",
    date: "Mar 8, 2026",
  },
  {
    id: "#ORD-1242",
    status: "Pending",
    items: "Memory Architecture Essay Collection",
    customer: "Sofia Albescu",
    total: "\u20AC24",
    date: "Mar 7, 2026",
  },
];

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default function AdminOrdersPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">
          Orders
        </h1>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 font-sans text-[12px] text-text-secondary hover:bg-bg-elevated transition-colors">
            <Plus className="h-3.5 w-3.5" />
            New Order
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-sans text-[12px] text-text-secondary hover:bg-bg-elevated transition-colors">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1 px-8 mt-6">
        {filterTabs.map((tab, i) => (
          <button
            key={tab}
            className={cn(
              "rounded-md px-3.5 py-1.5 font-sans text-[12px] transition-colors",
              i === 0
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Orders Table ── */}
      <div className="px-8 mt-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="font-mono text-[12px] text-text-primary px-4 py-3.5">
                    {row.id}
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
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5 max-w-[200px] truncate">
                    {row.items}
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.customer}
                  </td>
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    {row.total}
                  </td>
                  <td className="font-sans text-[13px] text-text-muted px-4 py-3.5">
                    {row.date}
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="rounded p-1 hover:bg-bg-elevated transition-colors">
                      <Eye className="h-3.5 w-3.5 text-text-muted" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between mt-4 pb-8">
          <span className="font-sans text-[12px] text-text-muted">
            Showing 1-6 of 48 orders
          </span>
          <div className="flex items-center gap-1">
            <button className="inline-flex items-center justify-center rounded-md border border-border h-8 w-8 hover:bg-bg-elevated transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 text-text-muted" />
            </button>
            <button className="inline-flex items-center justify-center rounded-md bg-bg-elevated h-8 w-8 font-sans text-[12px] text-text-primary">
              1
            </button>
            <button className="inline-flex items-center justify-center rounded-md h-8 w-8 font-sans text-[12px] text-text-muted hover:bg-bg-elevated transition-colors">
              2
            </button>
            <button className="inline-flex items-center justify-center rounded-md h-8 w-8 font-sans text-[12px] text-text-muted hover:bg-bg-elevated transition-colors">
              3
            </button>
            <button className="inline-flex items-center justify-center rounded-md h-8 w-8 font-sans text-[12px] text-text-muted hover:bg-bg-elevated transition-colors">
              ...
            </button>
            <button className="inline-flex items-center justify-center rounded-md h-8 w-8 font-sans text-[12px] text-text-muted hover:bg-bg-elevated transition-colors">
              8
            </button>
            <button className="inline-flex items-center justify-center rounded-md border border-border h-8 w-8 hover:bg-bg-elevated transition-colors">
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
