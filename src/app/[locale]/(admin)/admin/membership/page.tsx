import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const tierConfig = [
  { tier: "FREE", label: "Free", price: "€0", color: "bg-text-muted", benefits: ["Read free content", "Community access"] },
  { tier: "SUPPORTER", label: "Supporter", price: "€4/mo", color: "bg-starlight", benefits: ["Supporter-tier content", "Newsletter extras", "Early access"] },
  { tier: "PATRON", label: "Patron", price: "€10/mo", color: "bg-gold", benefits: ["All Supporter benefits", "Patron-exclusive content", "Behind-the-scenes", "Direct messages"] },
  { tier: "INNER_CIRCLE", label: "Inner Circle", price: "€200/mo", color: "bg-accent", benefits: ["All Patron benefits", "Private events", "Signed editions", "1-on-1 conversations"] },
];

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  CANCELLED: "Cancelled",
  PAST_DUE: "Past Due",
  EXPIRED: "Expired",
};

export default async function AdminMembershipPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") redirect("/account");

  const memberships = await prisma.membership.findMany({
    select: { tier: true, status: true },
  });

  const totalMembers = await prisma.user.count();

  const tierCounts: Record<string, number> = { FREE: 0, SUPPORTER: 0, PATRON: 0, INNER_CIRCLE: 0 };
  const statusCounts: Record<string, number> = { ACTIVE: 0, CANCELLED: 0, PAST_DUE: 0, EXPIRED: 0 };

  for (const m of memberships) {
    tierCounts[m.tier] = (tierCounts[m.tier] || 0) + 1;
    statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
  }

  // Users without membership are implicitly FREE
  const membersWithMembership = memberships.length;
  tierCounts.FREE = totalMembers - membersWithMembership + tierCounts.FREE;

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl text-text-primary">Membership</h1>
          <p className="font-sans text-sm text-text-secondary mt-0.5">Tier distribution and membership overview</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 px-8 mt-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-bg-card border border-border rounded-lg p-5">
            <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">{statusLabels[status]}</p>
            <p className="font-serif text-[32px] font-light text-text-primary mt-1">{count}</p>
          </div>
        ))}
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-8 mt-6 pb-8">
        {tierConfig.map((tc) => {
          const count = tierCounts[tc.tier] || 0;
          const pct = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;

          return (
            <div key={tc.tier} className="bg-bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans text-[14px] font-medium text-text-primary">{tc.label}</h3>
                <span className="font-mono text-[12px] text-text-muted">{tc.price}</span>
              </div>

              <p className="font-serif text-[36px] font-light text-text-primary">{count}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-border">
                  <div className={`h-1.5 rounded-full ${tc.color}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="font-mono text-[10px] text-text-muted">{pct}%</span>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase mb-2">Benefits</p>
                <ul className="space-y-1">
                  {tc.benefits.map((b) => (
                    <li key={b} className="font-sans text-[12px] text-text-secondary flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${tc.color}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
