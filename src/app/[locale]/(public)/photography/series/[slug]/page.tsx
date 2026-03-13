import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";

interface SeriesDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function SeriesDetailPage({
  params,
}: SeriesDetailPageProps) {
  const { slug } = await params;
  const t = await getTranslations("photography");
  const tc = await getTranslations("common");

  return (
    <article>
      {/* -- Hero image with overlay -- */}
      <section className="w-full h-[500px] relative overflow-hidden">
        <div className="absolute inset-0 bg-bg-surface" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-[#101828]/60 to-transparent" />

        {/* Content over hero */}
        <div className="absolute inset-0 flex flex-col justify-end px-20 pb-12 gap-4">
          <SectionLabel label="PHOTOGRAPHY SERIES" />

          <h1 className="font-serif text-4xl md:text-[52px] font-light text-warm-ivory leading-tight">
            Fog Studies
          </h1>

          <p className="font-sans text-[15px] text-text-secondary leading-[1.6] max-w-[600px]">
            An ongoing exploration of fog as metaphor — silence made visible,
            the city dissolving into its own breath.
          </p>

          <div className="flex items-center gap-8 font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
            <span>12 photographs</span>
            <span>2023 – 2026</span>
            <span>Carpathian Mountains</span>
          </div>
        </div>
      </section>

      {/* -- Photo grid -- */}
      <section className="px-20 py-12">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Link
              key={i}
              href={`/photography/fog-study-${i + 1}`}
              className="group"
            >
              <div className="h-[300px] bg-bg-surface rounded-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-bg-surface" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* -- Artist's note -- */}
      <section className="flex flex-col items-center gap-6 border-t border-border px-[200px] py-12">
        <h2 className="font-serif text-[28px] font-light text-warm-ivory">
          Artist&rsquo;s Note
        </h2>
        <p className="font-sans text-sm text-text-secondary leading-[1.7] text-center max-w-[520px]">
          Fog is the closest thing to silence you can photograph. It erases
          context, strips the familiar down to shapes and light. In these images
          I&rsquo;m searching for what remains when everything else disappears.
        </p>
      </section>
    </article>
  );
}
