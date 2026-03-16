import { getTranslations, getLocale } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { BookCard } from "@/components/content/book-card";
import { getPublishedBooks, getPageContent } from "@/lib/data";

const partnerKeys = [
  { name: "CARTURESTI", noteKey: "signedEditions" },
  { name: "NEMIRA", noteKey: "publisherDirect" },
  { name: "LIBRARIE.NET", noteKey: "freeShipping" },
] as const;

export default async function BooksPage() {
  const t = await getTranslations("books");
  const locale = await getLocale();
  const content = await getPageContent("books", ["sectionLabel", "heroTitle", "heroDescription"], locale, t);
  const books = await getPublishedBooks();

  return (
    <section className="px-5 md:px-10 xl:px-20 py-20">
      {/* ── Hero ── */}
      <div className="flex flex-col items-center">
        <SectionLabel label={content.sectionLabel} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary mt-6 text-center leading-tight">
          {content.heroTitle}
        </h1>

        <p className="font-sans text-sm text-text-secondary mt-4 max-w-[500px] leading-relaxed text-center">
          {content.heroDescription}
        </p>
      </div>

      {/* ── Books Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
        {books.map((book) => (
          <BookCard
            key={book.slug}
            title={book.title}
            coverImage={book.coverImage ?? "/images/books/placeholder.jpg"}
            type={book.type ?? "Book"}
            year={book.year ? String(book.year) : ""}
            description={book.description ?? ""}
            slug={`/books/${book.slug}`}
          />
        ))}
      </div>

      {/* ── Partners Section ── */}
      <div className="mt-12 pt-12 border-t border-border">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Left: text content */}
          <div className="flex flex-col gap-3 flex-1">
            <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              {t("whereToFind")}
            </span>
            <h3 className="font-serif text-2xl font-light text-text-primary">
              {t("availableAt")}
            </h3>
            <p className="font-sans text-[13px] text-text-secondary leading-relaxed max-w-[420px]">
              {t("partnersDescription")}
            </p>
          </div>

          {/* Right: partner cards */}
          <div className="flex items-center gap-4">
            {partnerKeys.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center gap-2 bg-bg-card border border-border rounded-lg px-6 py-4"
              >
                <span className="font-mono text-[10px] text-text-muted tracking-[1px]">
                  {partner.name}
                </span>
                <span className="font-mono text-[9px] text-text-muted opacity-60">
                  {t(partner.noteKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
