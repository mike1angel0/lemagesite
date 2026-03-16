import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentActionBar } from "@/components/ui/content-action-bar";
import { getEventBySlug } from "@/lib/data";
import { PLACEHOLDER } from "@/lib/placeholders";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("events");
  const tc = await getTranslations("common");
  const locale = await getLocale();

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const isUpcoming = new Date(event.date) > new Date();
  const formattedDate = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(event.date));

  return (
    <>
      {/* -- Hero Image -- */}
      <div className="h-[360px] relative overflow-hidden">
        <Image src={event.image ?? PLACEHOLDER.event} alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-[#101828CC]/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-5 md:px-20 pb-10 gap-3">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[3px] text-gold">
            {isUpcoming ? t("upcomingEvent") : t("pastEvent")}
          </span>
          <h1 className="font-serif text-[40px] font-semibold text-text-primary leading-tight max-w-2xl">
            {event.title}
          </h1>
          {event.type && (
            <p className="font-sans text-base text-text-secondary">
              {event.type}
            </p>
          )}
        </div>
      </div>

      {/* -- Content -- */}
      <div className="flex gap-12 px-5 md:px-20 py-10">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {event.description && (
            <p className="font-sans text-[15px] text-text-secondary leading-[1.7]">
              {event.description}
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-[300px] shrink-0 flex flex-col gap-5">
          <Card padding="p-5">
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                  {tc("dateAndTime")}
                </span>
                <p className="font-sans text-sm text-text-primary mt-1">
                  {formattedDate}
                </p>
              </div>
              {event.location && (
                <div>
                  <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
                    {tc("location")}
                  </span>
                  <p className="font-sans text-sm text-text-primary mt-1">
                    {event.location}
                  </p>
                </div>
              )}
            </div>

            {isUpcoming && event.rsvpUrl && (
              <Button variant="gold" size="lg" className="w-full mt-6" asChild>
                <a href={event.rsvpUrl} target="_blank" rel="noopener noreferrer">
                  {t("reserveSpot")}
                </a>
              </Button>
            )}
          </Card>

        </aside>
      </div>

      {/* -- Action bar -- */}
      <div className="border-t border-border">
        <ContentActionBar
          contentId={event.id}
          contentType="EVENT"
          title={event.title}
          showImageGen={false}
        />
      </div>
    </>
  );
}
