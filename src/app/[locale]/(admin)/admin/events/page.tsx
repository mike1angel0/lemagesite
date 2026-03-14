"use client";

import { useState } from "react";
import {
  Plus,
  Filter,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types & static data                                                */
/* ------------------------------------------------------------------ */

type EventRow = {
  title: string;
  type: string;
  status: string;
  capacity: string;
  date: string;
};

const filterTabs = ["All", "Upcoming", "Past", "Recurring", "Draft"];

const columns = ["TITLE", "TYPE", "STATUS", "CAPACITY", "DATE", "ACTIONS"];

const eventTypes = ["Workshop", "Reading", "Launch", "Exhibition", "Lecture", "Salon"];

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

const initialEvents: EventRow[] = [
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Workshop");
  const [newDate, setNewDate] = useState("");
  const [newCapacity, setNewCapacity] = useState("");

  function handleAddEvent() {
    if (!newTitle.trim() || !newDate) return;
    const formatted = new Date(newDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setEvents([
      ...events,
      {
        title: newTitle.trim(),
        type: newType,
        status: "Draft",
        capacity: newCapacity ? `0 / ${newCapacity}` : "\u2014",
        date: formatted,
      },
    ]);
    setNewTitle("");
    setNewType("Workshop");
    setNewDate("");
    setNewCapacity("");
    setShowForm(false);
  }

  function handleDelete(index: number) {
    setEvents(events.filter((_, i) => i !== index));
  }

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">
          Events
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(true)}
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

      {/* ── New Event Form ── */}
      {showForm && (
        <div className="mx-8 mt-6 bg-bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-text-primary">New Event</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">
                Event Title
              </label>
              <input
                type="text"
                placeholder="e.g. Poetry Reading: Fog Studies"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">
                Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim"
              >
                {eventTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">
                Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">
                Capacity
              </label>
              <input
                type="number"
                placeholder="e.g. 30"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => setShowForm(false)}
              className="border border-border rounded-md px-4 py-2 font-sans text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEvent}
              disabled={!newTitle.trim() || !newDate}
              className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Create Event
            </button>
          </div>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1 px-8 mt-6">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-3.5 py-1.5 font-sans text-[12px] transition-colors",
              activeTab === tab
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
              {events.map((row, index) => (
                <tr
                  key={`${row.title}-${index}`}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    {row.title}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full",
                        typeBadgeColors[row.type] || "bg-bg-elevated text-text-muted",
                      )}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full",
                        statusBadgeColors[row.status] || "bg-bg-elevated text-text-muted",
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
                        onClick={() => handleDelete(index)}
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
            Showing 1-{events.length} of {events.length} events
          </span>
          <div className="flex items-center gap-1">
            <button className="inline-flex items-center justify-center rounded-md border border-border h-8 w-8 hover:bg-bg-elevated transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 text-text-muted" />
            </button>
            <button className="inline-flex items-center justify-center rounded-md bg-bg-elevated h-8 w-8 font-sans text-[12px] text-text-primary">
              1
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
