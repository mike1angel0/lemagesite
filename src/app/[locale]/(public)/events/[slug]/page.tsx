import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/ui/share-buttons";

const programme = [
  { time: "19:00", label: "Doors Open — Gallery Installation" },
  { time: "20:00", label: "Opening: Cartographers of Silence (readings + projections)" },
  { time: "20:45", label: "Nocturnal Echoes — Live Ambient Performance" },
  { time: "21:30", label: "Q&A and Book Signing" },
];

export default async function EventDetailPage() {
  const t = await getTranslations("events");
  const tc = await getTranslations("common");

  return (
    <>
      {/* -- Hero Image -- */}
      <div className="h-[360px] relative overflow-hidden">
        <div className="absolute inset-0 bg-bg-surface" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-[#101828CC]/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-20 pb-10 gap-3">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[3px] text-gold">
            UPCOMING EVENT
          </span>
          <h1 className="font-serif text-[40px] font-semibold text-text-primary leading-tight max-w-2xl">
            Nocturnal Echoes — Live at MNAC
          </h1>
          <p className="font-sans text-base text-text-secondary">
            A night of poetry, ambient music, and projected photography
          </p>
        </div>
      </div>

      {/* -- Content -- */}
      <div className="flex gap-12 px-20 py-10">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          <p className="font-sans text-[15px] text-text-secondary leading-[1.7]">
            Join Mihai Gavrilescu for an immersive evening at the National Museum
            of Contemporary Art, where poetry, ambient music, and projected
            photography converge. The evening features live readings accompanied
            by original ambient compositions, while large-scale photography
            projections transform the gallery into a cosmic observatory.
          </p>

          {/* Programme */}
          <div>
            <span className="font-mono text-[11px] font-medium text-text-muted tracking-[2px]">
              Programme
            </span>
            <div className="mt-4 rounded-lg overflow-hidden border border-border bg-bg-card">
              {programme.map((item, i) => (
                <div
                  key={item.time}
                  className={`flex gap-4 px-4 py-3 ${
                    i < programme.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="font-mono text-[11px] text-accent-dim w-12 shrink-0">
                    {item.time}
                  </span>
                  <span className="font-sans text-sm text-text-primary">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-[300px] shrink-0 flex flex-col gap-5">
          <Card padding="p-5">
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                  Date &amp; Time
                </span>
                <p className="font-sans text-sm text-text-primary mt-1">
                  March 15, 2026 — 19:00
                </p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                  Location
                </span>
                <p className="font-sans text-sm text-text-primary mt-1">
                  MNAC Bucharest
                </p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                  Admission
                </span>
                <p className="font-sans text-sm text-text-secondary mt-1">
                  Free for members &middot; &euro;15 General
                </p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                  Capacity
                </span>
                <p className="font-sans text-sm text-text-secondary mt-1">
                  42 / 120 seats remaining
                </p>
              </div>
            </div>

            <Button variant="gold" size="lg" className="w-full mt-6" asChild>
              <Link href="/contact">Reserve Your Spot</Link>
            </Button>
          </Card>

          <Card padding="p-5">
            <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              Share This Event
            </span>
            <div className="flex items-center gap-4 mt-3">
              <ShareButtons />
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
