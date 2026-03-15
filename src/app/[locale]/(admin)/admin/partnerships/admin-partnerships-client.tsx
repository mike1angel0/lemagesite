"use client";

import { useState, useRef, useActionState } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addPartnerAction } from "@/lib/actions/partners";
import type { AuthState } from "@/lib/actions/auth";

interface Partner {
  id: string;
  name: string;
  type: string | null;
  url: string | null;
  logo: string | null;
}

export function AdminPartnershipsClient({ partners }: { partners: Partner[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addState, addAction, addPending] = useActionState(addPartnerAction, {} as AuthState);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      setLogoUrl(data.secure_url);
    } catch {
      setUploadError("Failed to upload logo.");
    } finally {
      setUploading(false);
    }
  }

  function handleOpenModal() {
    setLogoUrl("");
    setUploadError("");
    setShowAddModal(true);
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl text-text-primary">Partnerships</h1>
          <p className="font-sans text-sm text-text-secondary mt-0.5">
            Manage curated partnerships, collaborations &amp; affiliate links
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-gold text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Add Partner
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 mt-6">
        <div className="bg-bg-card border border-border rounded-lg p-5">
          <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Total Partners</p>
          <p className="font-serif text-[32px] font-light text-text-primary mt-1">{partners.length}</p>
        </div>
      </div>

      {/* Partners Table */}
      <div className="px-8 mt-8">
        <h2 className="font-serif text-lg text-text-primary mb-4">All Partners</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Partner</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">Type</th>
                <th className="text-left font-mono text-[10px] text-text-muted tracking-[1.5px] uppercase px-4 py-3">URL</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  <td className="font-sans text-[13px] text-text-primary px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {row.logo && (
                        <Image src={row.logo} alt={row.name} width={24} height={24} className="size-6 rounded object-contain" />
                      )}
                      {row.name}
                    </div>
                  </td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">{row.type || "—"}</td>
                  <td className="font-sans text-[13px] text-text-secondary px-4 py-3.5">
                    {row.url ? (
                      <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-accent-dim hover:text-accent transition-colors truncate block max-w-[200px]">
                        {row.url}
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center font-sans text-sm text-text-muted py-8">
                    No partners yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md border border-border bg-bg-surface rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-lg text-text-primary">Add Partner</h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {addState.success && (
              <p className="mb-4 font-sans text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded px-4 py-2">
                Partner added successfully.
              </p>
            )}
            {addState.error && (
              <p className="mb-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">
                {addState.error}
              </p>
            )}

            <form action={addAction}>
              <div className="space-y-4">
                <Input id="partner-name" name="name" label="Name" required />
                <Input id="partner-type" name="type" label="Type" placeholder="e.g. Affiliate, Sponsorship, Collaboration" />
                <Input id="partner-url" name="url" label="URL" placeholder="https://..." />

                {/* Logo Upload */}
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2">Logo</label>
                  <input type="hidden" name="logo" value={logoUrl} />
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />

                  {logoUrl ? (
                    <div className="relative w-20 h-20 border border-border rounded overflow-hidden group">
                      <Image src={logoUrl} alt="Logo preview" fill className="object-contain" />
                      <button
                        type="button"
                        onClick={() => { setLogoUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-[80px] border border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:border-accent-dim transition-colors"
                    >
                      {uploading ? (
                        <span className="font-sans text-xs text-text-muted">Uploading...</span>
                      ) : (
                        <>
                          <Upload className="size-4 text-text-muted mb-1" />
                          <span className="font-sans text-xs text-text-muted">Upload logo</span>
                        </>
                      )}
                    </button>
                  )}
                  {uploadError && <p className="mt-2 font-sans text-xs text-red-400">{uploadError}</p>}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="filled" disabled={addPending || uploading}>
                  {addPending ? "Adding..." : "Add Partner"}
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
