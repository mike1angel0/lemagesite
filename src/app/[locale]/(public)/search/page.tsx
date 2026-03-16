import Link from "next/link";
import { Search, Feather, Music, ShoppingBag, BookOpen, FileText, FlaskConical, Camera } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { searchContent } from "@/lib/data";
import { SearchSuggestions } from "@/components/ui/search-suggestions";
import { SearchTracker } from "@/components/ui/search-tracker";

const categoryIcons: Record<string, React.ElementType> = {
  feather: Feather,
  music: Music,
  shop: ShoppingBag,
  book: BookOpen,
  essay: FileText,
  research: FlaskConical,
  camera: Camera,
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const t = await getTranslations("search");
  const { q: query = "", page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1"));
  const pageSize = 20;
  const { results, total } = query ? await searchContent(query, page, pageSize) : { results: [], total: 0 };
  const totalPages = Math.ceil(total / pageSize);

  return (
    <section className="px-5 md:px-10 xl:px-20 py-16">
      {/* -- Search Header -- */}
      <div className="flex flex-col items-center gap-5 max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl md:text-[32px] font-semibold text-text-primary">
          {t("title")}
        </h1>

        {/* Search bar */}
        <form className="flex items-center gap-3 w-full bg-bg-elevated border border-border-strong rounded-lg px-5 py-3.5">
          <Search className="size-[18px] text-accent shrink-0" />
          <input
            type="text"
            name="q"
            placeholder={t("placeholder")}
            defaultValue={query}
            className="flex-1 bg-transparent text-text-primary font-sans text-[15px] placeholder:text-text-muted focus:outline-none"
          />
        </form>

        {query && <SearchTracker query={query} />}
        {!query && <SearchSuggestions />}

        {query && (
          <p className="font-mono text-xs text-text-muted">
            {t("resultCount", { count: total, query })}
          </p>
        )}
      </div>

      {/* -- Results -- */}
      <div className="max-w-2xl mx-auto mt-8">
        {results.map((result) => {
          const Icon = categoryIcons[result.icon] ?? Feather;
          return (
            <Link key={result.href} href={result.href}>
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

                <p className="font-sans text-sm text-text-secondary leading-relaxed line-clamp-2">
                  {result.description}
                </p>
              </div>
            </Link>
          );
        })}

        {query && results.length === 0 && (
          <p className="font-sans text-sm text-text-muted text-center py-12">
            {t("noResults", { query })}
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            {page > 1 && (
              <Link
                href={`?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className="font-sans text-sm text-accent hover:text-text-primary transition-colors"
              >
                {t("prevPage")}
              </Link>
            )}
            <span className="font-mono text-xs text-text-muted">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className="font-sans text-sm text-accent hover:text-text-primary transition-colors"
              >
                {t("nextPage")}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
