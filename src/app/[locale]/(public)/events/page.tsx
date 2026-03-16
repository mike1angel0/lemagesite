import { getTranslations, getLocale } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import Link from "next/link";
import { getUpcomingEvents, getPastEvents, getPageContent } from "@/lib/data";

export default async function EventsPage() {
  const t = await getTranslations("events");
  const locale = await getLocale();
  const content = await getPageContent("events", ["sectionLabel", "heroTitle", "heroDescription"], locale, t);
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-5 md:px-10 xl:px-20 pt-20 pb-10 gap-6">
        <SectionLabel label={content.sectionLabel} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary whitespace-pre-line text-center leading-[1.15] max-w-[600px]">
          {content.heroTitle}
        </h1>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[520px]">
          {content.heroDescription}
        </p>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="px-5 md:px-10 xl:px-20">
        <span className="font-mono text-[10px] font-medium tracking-[3px] text-accent-dim">
          {t("upcoming").toUpperCase()}
        </span>

        {upcoming.map((event) => {
          const d = new Date(event.date);
          const month = d.toLocaleString(locale, { month: "short" }).toUpperCase();
          const day = String(d.getDate()).padStart(2, "0");

          return (
            <div
              key={event.slug}
              className="flex items-center gap-8 border-t border-border py-7"
            >
              {/* Date */}
              <div className="flex flex-col items-center w-[60px] shrink-0">
                <span className="font-mono text-[10px] font-medium tracking-[2px] text-accent-dim">
                  {month}
                </span>
                <span className="font-serif text-[36px] font-light text-text-primary">
                  {day}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/events/${event.slug}`}
                  className="font-serif text-[22px] text-text-primary"
                >
                  {event.title}
                </Link>
                <span className="font-sans text-xs text-text-secondary">
                  {event.location}
                  {event.type ? `  \u00B7  ${event.type}` : ""}
                </span>
              </div>

              {/* RSVP */}
              {event.rsvpUrl && (
                <a
                  href={event.rsvpUrl}
                  className="border border-accent-dim px-5 py-2 shrink-0"
                >
                  <span className="font-sans text-[11px] font-medium tracking-[2px] text-accent">
                    {t("rsvp")}
                  </span>
                </a>
              )}
            </div>
          );
        })}

        {upcoming.length === 0 && (
          <p className="font-sans text-sm text-text-muted py-8 border-t border-border">
            {t("noUpcoming")}
          </p>
        )}
      </section>

      {/* ── Past Events ── */}
      <section className="px-5 md:px-10 xl:px-20 pt-10 pb-20">
        <span className="font-mono text-[10px] font-medium tracking-[3px] text-text-muted">
          {t("past").toUpperCase()}
        </span>

        {past.map((event) => {
          const d = new Date(event.date);
          const month = d.toLocaleString(locale, { month: "short" }).toUpperCase();
          const day = String(d.getDate()).padStart(2, "0");

          return (
            <div
              key={event.slug}
              className="flex items-center gap-8 border-t border-border py-5 opacity-60"
            >
              {/* Date */}
              <div className="flex flex-col items-center w-[60px] shrink-0">
                <span className="font-mono text-[10px] font-medium tracking-[2px] text-text-muted">
                  {month}
                </span>
                <span className="font-serif text-[28px] font-light text-text-muted">
                  {day}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/events/${event.slug}`}
                  className="font-serif text-xl text-text-secondary"
                >
                  {event.title}
                </Link>
                <span className="font-sans text-xs text-text-muted">
                  {event.location}
                </span>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
