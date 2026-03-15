"use client";

import { useState, useActionState } from "react";
import { Check } from "lucide-react";
import { saveSettingsAction } from "@/lib/actions/admin-settings";
import type { AuthState } from "@/lib/actions/auth";

interface Props {
  initialSettings: Record<string, string>;
  stripeConnected: boolean;
}

export function AdminSettingsClient({ initialSettings, stripeConnected }: Props) {
  const [siteName, setSiteName] = useState(initialSettings.siteName || "Selenarium");
  const [language, setLanguage] = useState(initialSettings.language || "en-ro");
  const [timezone, setTimezone] = useState(initialSettings.timezone || "Europe/Bucharest");
  const [instagram, setInstagram] = useState(initialSettings.instagram || "");
  const [medium, setMedium] = useState(initialSettings.medium || "");
  const [youtube, setYoutube] = useState(initialSettings.youtube || "");
  const [saveState, saveAction, savePending] = useActionState(saveSettingsAction, {} as AuthState);

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Settings</h1>
        <form action={saveAction}>
          <input type="hidden" name="siteName" value={siteName} />
          <input type="hidden" name="language" value={language} />
          <input type="hidden" name="timezone" value={timezone} />
          <input type="hidden" name="instagram" value={instagram} />
          <input type="hidden" name="medium" value={medium} />
          <input type="hidden" name="youtube" value={youtube} />
          <button
            type="submit"
            disabled={savePending}
            className="inline-flex items-center gap-1.5 bg-accent text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {savePending ? "Saving..." : saveState.success ? <><Check size={14} /> Saved</> : "Save Changes"}
          </button>
        </form>
      </div>

      {saveState.error && (
        <div className="mx-8 mt-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">{saveState.error}</div>
      )}

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 mt-6 pb-8">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* General */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">General</h2>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Site Name</label>
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {["Poetry", "Photography", "Music", "Research", "Essays", "Books"].map((cat) => (
                    <span key={cat} className="font-sans text-xs text-text-secondary bg-bg-elevated border border-border rounded-full px-3 py-1">{cat}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim">
                    <option value="en-ro">English / Romanian</option>
                    <option value="en">English only</option>
                    <option value="ro">Romanian only</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim">
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

          {/* Integrations */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">Integrations</h2>
            <div className="space-y-4">
              {[
                { name: "Substack", connected: true },
                { name: "Spotify", connected: true },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between py-2">
                  <span className="font-sans text-sm text-text-primary">{integration.name}</span>
                  <span className="font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full bg-[#6BBF7B]/10 text-[#6BBF7B]">Connected</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Social Media */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">Social Media</h2>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Instagram</label>
                <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Medium</label>
                <input type="text" value={medium} onChange={(e) => setMedium(e.target.value)} className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">YouTube</label>
                <input type="text" value={youtube} onChange={(e) => setYoutube(e.target.value)} className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">Payments</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-text-primary">Stripe</p>
                </div>
                <span className={`font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full ${stripeConnected ? "bg-[#6BBF7B]/10 text-[#6BBF7B]" : "bg-red-400/10 text-red-400"}`}>
                  {stripeConnected ? "Connected" : "Not Connected"}
                </span>
              </div>
              <div className="bg-bg-elevated border border-border rounded-md px-3 py-2">
                <span className="font-sans text-sm text-text-secondary">Tiers: Free, &euro;4/mo, &euro;10/mo, &euro;200/mo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
