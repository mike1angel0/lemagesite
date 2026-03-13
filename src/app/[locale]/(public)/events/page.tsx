import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import Link from "next/link";

const upcomingEvents = [
  {
    month: "MAR",
    day: "15",
    title: "Poetry & AI: A Live Reading + Conversation",
    location: "National Library, Bucharest  \u00B7  19:00 EET",
    slug: "/events/poetry-ai-live-reading",
    rsvpUrl: "#",
  },
  {
    month: "APR",
    day: "08",
    title: "ACL Workshop: Creativity in NLP \u2014 Keynote Speaker",
    location: "Vienna, Austria  \u00B7  Conference",
    slug: "/events/acl-workshop-creativity-nlp",
    rsvpUrl: null,
  },
];

const pastEvents = [
  {
    month: "JAN",
    day: "20",
    title: "Nocturnal Echoes \u2014 Album Launch & Reading",
    location: "Control Club, Bucharest",
    slug: "/events/nocturnal-echoes-launch",
  },
  {
    month: "NOV",
    day: "12",
    title: "NeurIPS Side Event: Poetry of Neural Networks",
    location: "Vancouver, Canada  \u00B7  Side Event",
    slug: "/events/neurips-side-event",
  },
  {
    month: "SEP",
    day: "05",
    title: "Carpathian Arts Festival \u2014 Residency Closing Reading",
    location: "Bran, Romania  \u00B7  Festival",
    slug: "/events/carpathian-arts-festival",
  },
];

export default async function EventsPage() {
  const t = await getTranslations("events");

  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center px-5 md:px-10 xl:px-20 pt-20 pb-10 gap-6">
        <SectionLabel label={t("sectionLabel")} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary whitespace-pre-line text-center leading-[1.15] max-w-[600px]">
          {t("heroTitle")}
        </h1>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[520px]">
          Live poetry readings, AI research presentations, and conversations
          {"\n"}at the intersection of art and technology.
          {"\n\n"}Sometimes, a card trick at the afterparty.
        </p>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="px-5 md:px-10 xl:px-20">
        <span className="font-mono text-[10px] font-medium tracking-[3px] text-accent-dim">
          UPCOMING
        </span>

        {upcomingEvents.map((event) => (
          <div
            key={event.slug}
            className="flex items-center gap-8 border-t border-border py-7"
          >
            {/* Date */}
            <div className="flex flex-col items-center w-[60px] shrink-0">
              <span className="font-mono text-[10px] font-medium tracking-[2px] text-accent-dim">
                {event.month}
              </span>
              <span className="font-serif text-[36px] font-light text-text-primary">
                {event.day}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-1">
              <Link
                href={event.slug}
                className="font-serif text-[22px] text-text-primary"
              >
                {event.title}
              </Link>
              <span className="font-sans text-xs text-text-secondary">
                {event.location}
              </span>
            </div>

            {/* RSVP */}
            {event.rsvpUrl && (
              <a
                href={event.rsvpUrl}
                className="border border-accent-dim px-5 py-2 shrink-0"
              >
                <span className="font-sans text-[11px] font-medium tracking-[2px] text-accent">
                  RSVP
                </span>
              </a>
            )}
          </div>
        ))}
      </section>

      {/* ── Past Events ── */}
      <section className="px-5 md:px-10 xl:px-20 pt-10 pb-20">
        <span className="font-mono text-[10px] font-medium tracking-[3px] text-text-muted">
          PAST
        </span>

        {pastEvents.map((event) => (
          <div
            key={event.slug}
            className="flex items-center gap-8 border-t border-border py-5 opacity-60"
          >
            {/* Date */}
            <div className="flex flex-col items-center w-[60px] shrink-0">
              <span className="font-mono text-[10px] font-medium tracking-[2px] text-text-muted">
                {event.month}
              </span>
              <span className="font-serif text-[28px] font-light text-text-muted">
                {event.day}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-1">
              <Link
                href={event.slug}
                className="font-serif text-xl text-text-secondary"
              >
                {event.title}
              </Link>
              <span className="font-sans text-xs text-text-muted">
                {event.location}
              </span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
