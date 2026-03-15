"use client";

import { useState, useActionState } from "react";
import { Plus, Trash2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { createEventAction, deleteEventAction } from "@/lib/actions/events";
import type { AuthState } from "@/lib/actions/auth";

const filterTabs = ["All", "Upcoming", "Past"];
const eventTypes = ["Workshop", "Reading", "Launch", "Exhibition", "Lecture", "Salon"];
const columns = ["TITLE", "TYPE", "STATUS", "DATE", "ACTIONS"];

const typeBadgeColors: Record<string, string> = {
  Workshop: "bg-accent/10 text-accent",
  Reading: "bg-gold/10 text-gold",
  Launch: "bg-starlight/10 text-starlight",
  Exhibition: "bg-accent-dim/10 text-accent-dim",
  Lecture: "bg-warm-ivory/10 text-warm-ivory",
  Salon: "bg-honey/10 text-honey",
};

interface EventRow {
  id: string;
  title: string;
  type: string;
  isUpcoming: boolean;
  date: string;
  location: string;
}

export function AdminEventsClient({ events: initialEvents }: { events: EventRow[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [createState, createAction, createPending] = useActionState(createEventAction, {} as AuthState);
  const [, deleteAction] = useActionState(deleteEventAction, {} as AuthState);

  const filtered = events.filter((e) => {
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Upcoming" && e.isUpcoming) ||
      (activeTab === "Past" && !e.isUpcoming);
    const matchesSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  function handleDelete(event: EventRow) {
    if (!confirm(`Delete "${event.title}"?`)) return;
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    const fd = new FormData();
    fd.set("id", event.id);
    deleteAction(fd);
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">Events</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2">
            <Search className="h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent font-sans text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none w-40"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 font-sans text-[12px] font-medium text-bg"
          >
            <Plus className="h-3.5 w-3.5" />
            New Event
          </button>
        </div>
      </div>

      {/* New Event Form */}
      {showForm && (
        <div className="mx-8 mt-6 bg-bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-text-primary">New Event</h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={18} />
            </button>
          </div>

          {createState.error && (
            <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">{createState.error}</p>
          )}
          {createState.success && (
            <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">Event created. Refresh to see it.</p>
          )}

          <form action={createAction}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">Event Title</label>
                <input name="title" type="text" placeholder="e.g. Poetry Reading: Fog Studies" className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">Type</label>
                <select name="type" className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim">
                  {eventTypes.map((t) => (<option key={t}>{t}</option>))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">Date</label>
                <input name="date" type="date" className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">Location</label>
                <input name="location" type="text" placeholder="e.g. Cărturești Carusel" className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">RSVP URL</label>
                <input name="rsvpUrl" type="url" placeholder="https://..." className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted" />
              </div>
              <div className="md:col-span-2">
                <label className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-1.5 block">Description</label>
                <textarea name="description" placeholder="Event description..." rows={3} className="w-full border border-border bg-transparent rounded py-2.5 px-3 text-text-primary font-sans text-sm focus:outline-none focus:border-accent-dim placeholder:text-text-muted resize-y" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button type="button" onClick={() => setShowForm(false)} className="border border-border rounded-md px-4 py-2 font-sans text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
              <button type="submit" disabled={createPending} className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {createPending ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-8 mt-6">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-md px-3.5 py-1.5 font-sans text-[12px] transition-colors",
              activeTab === tab ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Events Table */}
      <div className="px-8 mt-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                {columns.map((col) => (
                  <th key={col} className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">{row.title}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full", typeBadgeColors[row.type] || "bg-bg-elevated text-text-muted")}>
                      {row.type || "Other"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full",
                      row.isUpcoming ? "bg-[#6BBF7B]/10 text-[#6BBF7B]" : "bg-text-muted/10 text-text-muted"
                    )}>
                      {row.isUpcoming ? "Upcoming" : "Past"}
                    </span>
                  </td>
                  <td className="font-sans text-[13px] text-text-muted px-4 py-3.5">
                    {new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => handleDelete(row)} className="inline-flex items-center gap-1 font-sans text-xs text-accent-dim hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center font-sans text-sm text-text-muted py-8">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4 pb-8">
          <span className="font-sans text-[12px] text-text-muted">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </>
  );
}
