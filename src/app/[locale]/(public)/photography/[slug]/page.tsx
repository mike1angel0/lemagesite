import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PhotoDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function PhotoDetailPage({
  params,
}: PhotoDetailPageProps) {
  const { slug } = await params;
  const t = await getTranslations("photography");
  const tc = await getTranslations("common");

  return (
    <article>
      {/* -- Top bar -- */}
      <div className="flex items-center justify-between px-20 py-4">
        <Link
          href="/photography"
          className="inline-flex items-center gap-2 font-sans text-xs text-accent-dim hover:text-accent transition-colors"
        >
          <span className="text-sm">←</span>
          {t("backToGallery")}
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-sans text-xs text-text-muted">← Previous</span>
          <span className="font-mono text-[11px] text-text-secondary tracking-[1px]">
            3 / 24
          </span>
          <span className="font-sans text-xs text-accent">Next →</span>
        </div>
      </div>

      {/* -- Image frame -- */}
      <div className="w-full h-[780px] bg-black px-20 py-6">
        <div className="w-full h-full bg-bg-surface" />
      </div>

      {/* -- Below image -- */}
      <div className="flex gap-20 px-20 py-12">
        {/* Main info */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="font-serif text-[32px] font-light text-text-primary leading-tight">
            Fog Studies No. 3
          </h1>
          <p className="font-sans text-sm text-text-secondary leading-[1.7]">
            From the series Fog Studies — an ongoing exploration of landscapes
            disappearing into themselves, where the visible dissolves
            into the atmospheric.
          </p>
          <p className="font-serif text-lg italic font-light text-accent-dim leading-[1.5]">
            &ldquo;I photograph not what I see, but what the fog allows me to
            remember.&rdquo;
          </p>
        </div>

        {/* Right sidebar */}
        <div className="w-[280px] shrink-0 flex flex-col gap-5">
          {/* EXIF block */}
          <div className="flex flex-col gap-3">
            {[
              { label: tc("camera"), value: "Fujifilm X-T5" },
              { label: tc("year"), value: "2025" },
              { label: tc("location"), value: "Carpathian Mountains" },
              {
                label: tc("series"),
                value: "Fog Studies",
              },
              { label: tc("print"), value: "Available (Limited Edition)" },
            ].map((entry) => (
              <div
                key={entry.label}
                className="flex justify-between items-baseline"
              >
                <span className="font-mono text-[10px] text-text-muted tracking-[1px] uppercase">
                  {entry.label}
                </span>
                <span className="font-sans text-xs text-text-secondary">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              {tc("download")}
            </Button>
            <Button variant="ghost" size="sm">
              {tc("share")}
            </Button>
          </div>

          {/* Member badge */}
          <div className="inline-flex items-center gap-2 bg-bg-elevated border border-border rounded px-3 py-1.5 w-fit">
            <span className="font-mono text-[9px] text-gold tracking-[1px] uppercase">
              Supporter
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
