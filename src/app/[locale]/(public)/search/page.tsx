import Link from "next/link";
import { Search, Feather, Music, ShoppingBag, BookOpen, FileText, FlaskConical } from "lucide-react";
import { getTranslations } from "next-intl/server";

const mockResults = [
  {
    category: "POETRY",
    icon: "feather",
    title: "Nocturnal Echoes (Poetry Collection)",
    description:
      "The debut collection exploring the intersection of astronomy, memory, and language. 32 poems charting the space between observation and imagination.",
    href: "/poetry/nocturnal-echoes",
  },
  {
    category: "MUSIC",
    icon: "music",
    title: "Nocturnal Echoes (Album)",
    description:
      "A collection of ambient compositions inspired by the sounds of the observatory at night. 8 tracks, 42 minutes.",
    href: "/music/nocturnal-echoes",
  },
  {
    category: "SHOP",
    icon: "shop",
    title: "Nocturnal Echoes \u2014 First Edition Hardcover",
    description:
      "Signed first edition hardcover. 96 pages with original astronomical photography. \u20AC28.00",
    href: "/shop/nocturnal-echoes-hardcover",
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  feather: Feather,
  music: Music,
  shop: ShoppingBag,
  book: BookOpen,
  essay: FileText,
  research: FlaskConical,
};

export default async function SearchPage() {
  const t = await getTranslations("search");

  return (
    <section className="px-5 md:px-10 xl:px-20 py-16">
      {/* -- Search Header -- */}
      <div className="flex flex-col items-center gap-5 max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl md:text-[32px] font-semibold text-text-primary">
          {t("title")}
        </h1>

        {/* Search bar */}
        <div className="flex items-center gap-3 w-full bg-bg-elevated border border-border-strong rounded-lg px-5 py-3.5">
          <Search className="size-[18px] text-accent shrink-0" />
          <input
            type="text"
            placeholder={t("placeholder")}
            defaultValue="nocturnal echoes"
            className="flex-1 bg-transparent text-text-primary font-sans text-[15px] placeholder:text-text-muted focus:outline-none"
          />
        </div>

        <p className="font-mono text-xs text-text-muted">
          {t("resultCount", { count: mockResults.length, query: "nocturnal echoes" })}
        </p>
      </div>

      {/* -- Results -- */}
      <div className="max-w-2xl mx-auto mt-8">
        {mockResults.map((result) => {
          const Icon = categoryIcons[result.icon] ?? Feather;
          return (
            <Link key={result.title} href={result.href}>
              <div className="flex flex-col gap-2 py-5 border-b border-border hover:bg-bg-surface/50 transition-colors">
                {/* Category tag */}
                <div className="flex items-center gap-2">
                  <Icon className="size-3 text-gold" />
                  <span className="font-mono text-[10px] text-gold tracking-[2px]">
                    {result.category}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-text-primary">
                  {result.title}
                </h3>

                <p className="font-sans text-sm text-text-secondary leading-relaxed">
                  {result.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
