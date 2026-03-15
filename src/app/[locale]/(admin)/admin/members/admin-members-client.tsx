"use client";

import { useState, useActionState } from "react";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addMemberAction } from "@/lib/actions/members";
import type { AuthState } from "@/lib/actions/auth";

interface Member {
  id: string;
  name: string;
  email: string;
  tier: string;
  status: string;
  joined: string;
}

interface Summary {
  total: number;
  active: number;
  supporters: number;
  patrons: number;
  innerCircle: number;
}

const tierBadgeColors: Record<string, string> = {
  FREE: "bg-text-muted/10 text-text-muted",
  SUPPORTER: "bg-starlight/10 text-starlight",
  PATRON: "bg-gold/10 text-gold",
  INNER_CIRCLE: "bg-accent/10 text-accent",
};

const tierLabels: Record<string, string> = {
  FREE: "Free",
  SUPPORTER: "Supporter",
  PATRON: "Patron",
  INNER_CIRCLE: "Inner Circle",
};

const statusColors: Record<string, string> = {
  ACTIVE: "text-[#6BBF7B]",
  CANCELLED: "text-text-muted",
  PAST_DUE: "text-red-400",
  EXPIRED: "text-text-muted",
};

const columns = ["NAME", "EMAIL", "TIER", "STATUS", "JOINED"];

export function AdminMembersClient({ members, summary }: { members: Member[]; summary: Summary }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addState, addAction, addPending] = useActionState(addMemberAction, {} as AuthState);
  const [selectedTier, setSelectedTier] = useState("FREE");

  const filteredMembers = searchQuery
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members;

  const summaryCards = [
    { label: "TOTAL", value: summary.total },
    { label: "ACTIVE", value: summary.active },
    { label: "SUPPORTERS", value: summary.supporters },
    { label: "PATRONS", value: summary.patrons },
    { label: "INNER CIRCLE", value: summary.innerCircle },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border py-5 px-8">
        <h1 className="font-sans text-[20px] font-medium text-text-primary">Members</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2">
            <Search className="h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent font-sans text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none w-40"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 font-sans text-[12px] font-medium text-bg"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Member
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 px-8 mt-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-5">
            <p className="font-mono text-[10px] tracking-[2px] text-text-muted uppercase">{card.label}</p>
            <p className="font-serif text-[32px] font-light leading-none text-text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="px-8 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-[14px] font-medium text-text-primary">All Members</h2>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                {columns.map((col) => (
                  <th key={col} className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">{row.name}</td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">{row.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full", tierBadgeColors[row.tier])}>
                      {tierLabels[row.tier] || row.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("font-sans text-[13px]", statusColors[row.status])}>
                      {row.status}
                    </span>
                  </td>
                  <td className="font-sans text-[13px] text-text-muted px-4 py-3.5">
                    {new Date(row.joined).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center font-sans text-sm text-text-muted py-8">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md border border-border bg-bg-surface rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg text-text-primary">Add Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {addState.success && (
              <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
                Member added successfully.
              </p>
            )}
            {addState.error && (
              <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                {addState.error}
              </p>
            )}

            <form action={addAction}>
              <div className="space-y-4">
                <Input id="member-name" name="name" label="Name" required />
                <Input id="member-email" name="email" type="email" label="Email" required />
                <Input id="member-password" name="password" type="password" label="Password (optional)" />

                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2">
                    Tier
                  </label>
                  <input type="hidden" name="tier" value={selectedTier} />
                  <div className="grid grid-cols-2 gap-2">
                    {(["FREE", "SUPPORTER", "PATRON", "INNER_CIRCLE"] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={cn(
                          "px-3 py-2 text-[12px] font-mono tracking-[1px] border rounded transition-colors",
                          selectedTier === tier
                            ? "bg-accent text-bg-primary border-accent"
                            : "border-border text-text-secondary hover:border-accent-dim"
                        )}
                      >
                        {tierLabels[tier]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="filled" disabled={addPending}>
                  {addPending ? "Adding..." : "Add Member"}
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
