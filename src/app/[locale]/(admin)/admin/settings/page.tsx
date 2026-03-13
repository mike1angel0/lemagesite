export default function AdminSettingsPage() {
  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Settings</h1>
        <button className="bg-accent text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity">
          Save Changes
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
                <div className="bg-bg-elevated border border-border rounded-md px-3 py-2">
                  <span className="font-sans text-sm text-text-primary">
                    The Observatory
                  </span>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Poetry", "Photography", "Music", "Research"].map((cat) => (
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
                  <div className="bg-bg-elevated border border-border rounded-md px-3 py-2">
                    <span className="font-sans text-sm text-text-primary">
                      English / Romanian
                    </span>
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                    Timezone
                  </label>
                  <div className="bg-bg-elevated border border-border rounded-md px-3 py-2">
                    <span className="font-sans text-sm text-text-primary">
                      Europe/Bucharest (UTC+2)
                    </span>
                  </div>
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
              {[
                { platform: "Instagram", handle: "@observatory" },
                { platform: "Medium", handle: "@MihaiGavrilescu" },
                { platform: "YouTube", handle: "@observatory" },
              ].map((social) => (
                <div key={social.platform}>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">
                    {social.platform}
                  </label>
                  <div className="bg-bg-elevated border border-border rounded-md px-3 py-2">
                    <span className="font-sans text-sm text-text-primary">
                      {social.handle}
                    </span>
                  </div>
                </div>
              ))}
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
                  Tiers: Free, &euro;9/mo
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
            <button className="bg-red-900/60 text-red-200 font-sans text-sm rounded-md px-4 py-2 hover:bg-red-900/80 transition-colors">
              Delete Site
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
