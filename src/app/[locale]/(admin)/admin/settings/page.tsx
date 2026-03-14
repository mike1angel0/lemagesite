"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("The Observatory");
  const [language, setLanguage] = useState("en-ro");
  const [timezone, setTimezone] = useState("Europe/Bucharest");
  const [instagram, setInstagram] = useState("@observatory");
  const [medium, setMedium] = useState("@MihaiGavrilescu");
  const [youtube, setYoutube] = useState("@observatory");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  async function handleSave() {
    setSaveStatus("saving");
    await new Promise((r) => setTimeout(r, 800));
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="inline-flex items-center gap-1.5 bg-accent text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saveStatus === "saving" ? (
            "Saving..."
          ) : saveStatus === "saved" ? (
            <>
              <Check size={14} />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* ── Two-Column Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 mt-6">
        {/* ── Left Column ── */}
        <div className="flex flex-col gap-6">
          {/* General Card */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">
              General
            </h2>
            <div className="space-y-4">
              {/* Site Name */}
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Poetry", "Photography", "Music", "Research", "Essays", "Books"].map((cat) => (
                    <span
                      key={cat}
                      className="font-sans text-xs text-text-secondary bg-bg-elevated border border-border rounded-full px-3 py-1"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Language & Timezone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim"
                  >
                    <option value="en-ro">English / Romanian</option>
                    <option value="en">English only</option>
                    <option value="ro">Romanian only</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim"
                  >
                    <option value="Europe/Bucharest">Europe/Bucharest (UTC+2)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/Berlin">Europe/Berlin (UTC+1)</option>
                    <option value="America/New_York">America/New York (UTC-5)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Integrations Card */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">
              Integrations
            </h2>
            <div className="space-y-4">
              {[
                { name: "Substack", connected: true },
                { name: "Spotify", connected: true },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between py-2"
                >
                  <span className="font-sans text-sm text-text-primary">
                    {integration.name}
                  </span>
                  <span className="font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full bg-[#6BBF7B]/10 text-[#6BBF7B]">
                    Connected
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-6">
          {/* Social Media Card */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">
              Social Media
            </h2>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                  Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                  Medium
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                  YouTube
                </label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim"
                />
              </div>
            </div>
          </div>

          {/* Payments Card */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">
              Payments
            </h2>
            <div className="space-y-4">
              {/* Stripe */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-text-primary">Stripe</p>
                  <p className="font-mono text-[10px] text-text-muted mt-0.5">
                    Last sync: Mar 12, 2026
                  </p>
                </div>
                <span className="font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full bg-[#6BBF7B]/10 text-[#6BBF7B]">
                  Connected
                </span>
              </div>
              <div className="bg-bg-elevated border border-border rounded-md px-3 py-2">
                <span className="font-sans text-sm text-text-secondary">
                  Tiers: Free, &euro;4/mo, &euro;10/mo, &euro;200/mo
                </span>
              </div>

              {/* PayPal */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-text-primary">PayPal</p>
                  <p className="font-mono text-[10px] text-text-muted mt-0.5">
                    payments@observatory.ro
                  </p>
                </div>
                <span className="font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full bg-[#6BBF7B]/10 text-[#6BBF7B]">
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-6">
            <h2 className="font-serif text-lg text-red-400 mb-3">
              Danger Zone
            </h2>
            <p className="font-sans text-sm text-text-secondary mb-4">
              Permanently delete this site and all its content. This action
              cannot be undone.
            </p>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this site? This action cannot be undone.")) {
                  alert("Site deletion is not yet implemented.");
                }
              }}
              className="bg-red-900/60 text-red-200 font-sans text-sm rounded-md px-4 py-2 hover:bg-red-900/80 transition-colors"
            >
              Delete Site
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
