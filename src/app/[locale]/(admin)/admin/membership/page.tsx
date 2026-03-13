import { Users } from "lucide-react";

export default function AdminMembershipPage() {
  return (
    <>
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Membership</h1>
      </div>

      <div className="px-8 mt-6">
        <div className="bg-bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center">
          <Users className="w-10 h-10 text-text-muted mb-4" />
          <p className="font-sans text-sm text-text-secondary">
            Member management table will appear here
          </p>
          <p className="font-mono text-[10px] text-text-muted mt-2">
            Manage memberships, roles, and permissions
          </p>
        </div>
      </div>
    </>
  );
}
