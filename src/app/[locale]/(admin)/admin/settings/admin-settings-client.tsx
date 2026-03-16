"use client";

import { useState, useActionState } from "react";
import { Check } from "lucide-react";
import { saveSettingsAction } from "@/lib/actions/admin-settings";
import type { AuthState } from "@/lib/actions/auth";
import { ImageUpload } from "@/components/ui/image-upload";

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/page" },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/username" },
  { key: "bluesky", label: "Bluesky", placeholder: "https://bsky.app/profile/handle" },
  { key: "threads", label: "Threads", placeholder: "https://threads.net/@username" },
  { key: "mastodon", label: "Mastodon", placeholder: "https://mastodon.social/@username" },
  { key: "medium", label: "Medium", placeholder: "https://medium.com/@username" },
  { key: "substack", label: "Substack", placeholder: "https://username.substack.com" },
  { key: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/artist/..." },
  { key: "soundcloud", label: "SoundCloud", placeholder: "https://soundcloud.com/username" },
  { key: "bandcamp", label: "Bandcamp", placeholder: "https://username.bandcamp.com" },
  { key: "appleMusic", label: "Apple Music", placeholder: "https://music.apple.com/artist/..." },
  { key: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/username" },
  { key: "tumblr", label: "Tumblr", placeholder: "https://username.tumblr.com" },
  { key: "patreon", label: "Patreon", placeholder: "https://patreon.com/username" },
  { key: "kofi", label: "Ko-fi", placeholder: "https://ko-fi.com/username" },
  { key: "discord", label: "Discord", placeholder: "https://discord.gg/invite" },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/username" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/number" },
  { key: "vimeo", label: "Vimeo", placeholder: "https://vimeo.com/username" },
  { key: "twitch", label: "Twitch", placeholder: "https://twitch.tv/username" },
  { key: "behance", label: "Behance", placeholder: "https://behance.net/username" },
  { key: "dribbble", label: "Dribbble", placeholder: "https://dribbble.com/username" },
  { key: "flickr", label: "Flickr", placeholder: "https://flickr.com/photos/username" },
  { key: "goodreads", label: "Goodreads", placeholder: "https://goodreads.com/author/..." },
  { key: "website", label: "Personal Website", placeholder: "https://example.com" },
] as const;

export const SOCIAL_KEYS = SOCIAL_PLATFORMS.map((p) => p.key);

interface Props {
  initialSettings: Record<string, string>;
  stripeConnected: boolean;
}

export function AdminSettingsClient({ initialSettings, stripeConnected }: Props) {
  const [siteName, setSiteName] = useState(initialSettings.siteName || "Selenarium");
  const [siteDescription, setSiteDescription] = useState(initialSettings.siteDescription || "");
  const [authorName, setAuthorName] = useState(initialSettings.authorName || "Mihai Gavrilescu");
  const [authorHandle, setAuthorHandle] = useState(initialSettings.authorHandle || "@lemagepoet");
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || "");
  const [senderEmail, setSenderEmail] = useState(initialSettings.senderEmail || "");
  const [twitterHandle, setTwitterHandle] = useState(initialSettings.twitterHandle || "@lemagepoet");
  const [language, setLanguage] = useState(initialSettings.language || "en-ro");
  const [timezone, setTimezone] = useState(initialSettings.timezone || "Europe/Bucharest");
  const [socials, setSocials] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of SOCIAL_PLATFORMS) {
      init[p.key] = initialSettings[p.key] || "";
    }
    return init;
  });
  const [heroImage, setHeroImage] = useState(initialSettings.heroImage || "");
  const [portraitImage, setPortraitImage] = useState(initialSettings.portraitImage || "");
  const [ogDefaultImage, setOgDefaultImage] = useState(initialSettings.ogDefaultImage || "");
  const [saveState, saveAction, savePending] = useActionState(saveSettingsAction, {} as AuthState);

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Settings</h1>
        <form action={saveAction}>
          <input type="hidden" name="siteName" value={siteName} />
          <input type="hidden" name="siteDescription" value={siteDescription} />
          <input type="hidden" name="authorName" value={authorName} />
          <input type="hidden" name="authorHandle" value={authorHandle} />
          <input type="hidden" name="contactEmail" value={contactEmail} />
          <input type="hidden" name="senderEmail" value={senderEmail} />
          <input type="hidden" name="twitterHandle" value={twitterHandle} />
          <input type="hidden" name="language" value={language} />
          <input type="hidden" name="timezone" value={timezone} />
          <input type="hidden" name="heroImage" value={heroImage} />
          <input type="hidden" name="portraitImage" value={portraitImage} />
          <input type="hidden" name="ogDefaultImage" value={ogDefaultImage} />
          {SOCIAL_PLATFORMS.map((p) => (
            <input key={p.key} type="hidden" name={p.key} value={socials[p.key]} />
          ))}
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
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Site Description</label>
                <textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={2} placeholder="Short description of your site" className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Author Name</label>
                  <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Author Handle</label>
                  <input type="text" value={authorHandle} onChange={(e) => setAuthorHandle(e.target.value)} placeholder="@username" className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Contact Email</label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hello@example.com" className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Sender Email</label>
                  <input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="noreply@example.com" className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">Twitter / X Handle</label>
                <input type="text" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@username" className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim" />
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

          {/* Site Images */}
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <h2 className="font-serif text-lg text-text-primary mb-5">Site Images</h2>
            <p className="font-sans text-xs text-text-muted mb-4">
              Upload image URLs to replace default placeholders on the site.
            </p>
            <div className="space-y-4">
              <ImageUpload label="Hero Background Image" value={heroImage} onChange={setHeroImage} />
              <ImageUpload label="Portrait Image" value={portraitImage} onChange={setPortraitImage} />
              <ImageUpload label="Default OG Image" value={ogDefaultImage} onChange={setOgDefaultImage} />
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
            <p className="font-sans text-xs text-text-muted mb-4">
              Add URLs for your social profiles. Only filled-in links will appear in the footer.
            </p>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {SOCIAL_PLATFORMS.map((p) => (
                <div key={p.key}>
                  <label className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5">{p.label}</label>
                  <input
                    type="text"
                    value={socials[p.key]}
                    onChange={(e) => setSocials((prev) => ({ ...prev, [p.key]: e.target.value }))}
                    placeholder={p.placeholder}
                    className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent-dim"
                  />
                </div>
              ))}
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
