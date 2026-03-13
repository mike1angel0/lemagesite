"use client";

import {
  Plus,
  Filter,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const filterTabs = ["All", "Upcoming", "Past", "Recurring", "Draft"];

const columns = ["TITLE", "TYPE", "STATUS", "CAPACITY", "DATE", "ACTIONS"];

const typeBadgeColors: Record<string, string> = {
  Workshop: "bg-accent/10 text-accent",
  Reading: "bg-gold/10 text-gold",
  Launch: "bg-starlight/10 text-starlight",
  Exhibition: "bg-accent-dim/10 text-accent-dim",
  Lecture: "bg-warm-ivory/10 text-warm-ivory",
  Salon: "bg-honey/10 text-honey",
};

const statusBadgeColors: Record<string, string> = {
  Published: "bg-[#6BBF7B]/10 text-[#6BBF7B]",
  Draft: "bg-text-muted/10 text-text-muted",
  "Sold Out": "bg-gold/10 text-gold",
  Cancelled: "bg-[#BF6B6B]/10 text-[#BF6B6B]",
};

const eventRows = [
  {
    title: "Poetry Reading: Fog Studies",
    type: "Workshop",
    status: "Published",
    capacity: "24 / 30",
    date: "Mar 22, 2026",
  },
  {
    title: "Music & Words \u2014 Live at Context",
    type: "Reading",
    status: "Published",
    capacity: "78 / 120",
    date: "Mar 28, 2026",
  },
  {
    title: "Book Launch: Cartography of Silence",
    type: "Launch",
    status: "Draft",
    capacity: "\u2014",
    date: "Apr 5, 2026",
  },
  {
    title: "Winter Light Exhibition",
    type: "Exhibition",
    status: "Published",
    capacity: "142 / 200",
    date: "Apr 12, 2026",
  },
  {
    title: "On Memory & Architecture \u2014 Lecture",
    type: "Lecture",
    status: "Sold Out",
    capacity: "50 / 50",
    date: "Apr 18, 2026",
  },
  {
    title: "Nocturne Salon: An Evening of Sound",
    type: "Salon",
    status: "Published",
    capacity: "12 / 20",
    date: "May 3, 2026",
  },
];

/* ------------------------------------------------------------------ */
/*  Page (Client Component)                                            */
/* ------------------------------------------------------------------ */

export default function AdminEventsPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">
          Events
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("New event coming soon")}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 font-sans text-[12px] font-medium text-bg"
          >
            <Plus className="h-3.5 w-3.5" />
            New Event
          </button>
          <button
            onClick={() => alert("Filter coming soon")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-sans text-[12px] text-text-secondary hover:bg-bg-elevated transition-colors"
          >
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
            onClick={() => alert("Filter coming soon")}
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

      {/* ── Events Table ── */}
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
              {eventRows.map((row) => (
                <tr
                  key={row.title}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    {row.title}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full",
                        typeBadgeColors[row.type],
                      )}
                    >
                      {row.type}
                    </span>
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
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.capacity}
                  </td>
                  <td className="font-sans text-[13px] text-text-muted px-4 py-3.5">
                    {row.date}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert("Edit coming soon")}
                        className="rounded p-1 hover:bg-bg-elevated transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5 text-text-muted" />
                      </button>
                      <button
                        onClick={() => alert("Delete coming soon")}
                        className="rounded p-1 hover:bg-bg-elevated transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-text-muted" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between mt-4 pb-8">
          <span className="font-sans text-[12px] text-text-muted">
            Showing 1-6 of 24 events
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => alert("Pagination coming soon")}
              className="inline-flex items-center justify-center rounded-md border border-border h-8 w-8 hover:bg-bg-elevated transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-text-muted" />
            </button>
            <button
              onClick={() => alert("Pagination coming soon")}
              className="inline-flex items-center justify-center rounded-md bg-bg-elevated h-8 w-8 font-sans text-[12px] text-text-primary"
            >
              1
            </button>
            <button
              onClick={() => alert("Pagination coming soon")}
              className="inline-flex items-center justify-center rounded-md h-8 w-8 font-sans text-[12px] text-text-muted hover:bg-bg-elevated transition-colors"
            >
              2
            </button>
            <button
              onClick={() => alert("Pagination coming soon")}
              className="inline-flex items-center justify-center rounded-md h-8 w-8 font-sans text-[12px] text-text-muted hover:bg-bg-elevated transition-colors"
            >
              3
            </button>
            <button
              onClick={() => alert("Pagination coming soon")}
              className="inline-flex items-center justify-center rounded-md h-8 w-8 font-sans text-[12px] text-text-muted hover:bg-bg-elevated transition-colors"
            >
              4
            </button>
            <button
              onClick={() => alert("Pagination coming soon")}
              className="inline-flex items-center justify-center rounded-md border border-border h-8 w-8 hover:bg-bg-elevated transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
