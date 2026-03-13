import { UserCircle } from "lucide-react";

export default function AdminTribeBioPage() {
  return (
    <>
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Tribe Bio</h1>
      </div>

      <div className="px-8 mt-6">
        <div className="bg-bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center">
          <UserCircle className="w-10 h-10 text-text-muted mb-4" />
          <p className="font-sans text-sm text-text-secondary">
            Tribe bio management interface coming soon
          </p>
          <p className="font-mono text-[10px] text-text-muted mt-2">
            Manage tribe member profiles and biographies
          </p>
        </div>
      </div>
    </>
  );
}
