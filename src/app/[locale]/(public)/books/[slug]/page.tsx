import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookCard } from "@/components/content/book-card";
import { getBookBySlug, getPublishedBooks } from "@/lib/data";
import { getSiteConfig } from "@/lib/site-config";
import { PLACEHOLDER } from "@/lib/placeholders";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("books");
  const tc = await getTranslations("common");

  const [book, config] = await Promise.all([getBookBySlug(slug), getSiteConfig()]);
  if (!book) notFound();

  const allBooks = await getPublishedBooks();
  const relatedBooks = allBooks
    .filter((b) => b.slug !== slug)
    .slice(0, 3);

  const quotes = (book.quotes as string[] | null) ?? [];

  return (
    <section className="px-5 md:px-10 xl:px-20 py-12">
      {/* -- Back Link -- */}
      <Link
        href="/books"
        className="inline-flex items-center gap-2 font-sans text-xs text-text-muted hover:text-text-primary transition-colors"
      >
        <span className="text-sm">←</span>
        {t("backToBooks")}
      </Link>

      {/* -- Hero -- */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-16 mt-8">
        {/* Cover Image */}
        <div className="w-full md:w-[420px] h-[600px] rounded shrink-0 relative overflow-hidden">
          <Image src={book.coverImage ?? PLACEHOLDER.book} alt={t("bookCoverAlt")} fill className="object-cover" />
        </div>

        {/* Info Column */}
        <div className="flex-1">
          <span className="font-mono text-[10px] uppercase tracking-[3px] text-accent-dim">
            {book.type ?? "BOOK"} &middot; {book.year ?? ""} &middot; {t("firstEdition")}
          </span>

          <h1 className="font-serif text-4xl md:text-[52px] font-light text-text-primary mt-3 leading-tight">
            {book.title}
          </h1>

          <p className="font-sans text-sm text-text-secondary mt-2">
            {t("byAuthor", { handle: config.authorHandle })}
          </p>

          {book.description && (
            <p className="font-sans text-sm text-text-secondary mt-6 max-w-lg leading-[1.7]">
              {book.description}
            </p>
          )}

          {quotes.length > 0 && (
            <blockquote className="font-serif text-base italic text-accent-glow mt-4 leading-[1.6]">
              &ldquo;{quotes[0]}&rdquo;
            </blockquote>
          )}

          {/* Price */}
          {book.price && (
            <p className="font-serif text-[32px] font-bold text-gold mt-6">
              &euro;{Number(book.price)}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <Button variant="filled" size="lg" asChild>
              {book.buyUrl ? (
                <a href={book.buyUrl} target="_blank" rel="noopener noreferrer">
                  {tc("buyBook")}
                </a>
              ) : (
                <Link href={`/shop/${book.slug}`}>
                  {tc("buyBook")}
                </Link>
              )}
            </Button>
            {book.excerpt && (
              <Button variant="ghost" size="lg" asChild>
                <Link href="#excerpt">{tc("readExcerpt")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* -- Excerpt -- */}
      {book.excerpt && (
        <div id="excerpt" className="mt-16 pt-12 border-t border-border max-w-2xl">
          <SectionLabel label={tc("readExcerpt").toUpperCase()} />
          <div className="font-serif text-base text-text-secondary leading-[1.9] mt-6 whitespace-pre-line">
            {book.excerpt}
          </div>
        </div>
      )}

      {/* -- Specs -- */}
      <div className="flex flex-col md:flex-row gap-16 mt-16">
        <div className="flex-1" />

        <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-6">
          <Card>
            <h3 className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim mb-4">
              {tc("specifications").toUpperCase()}
            </h3>
            <div className="space-y-3">
              {[
                { label: tc("type"), value: book.type ?? "Book" },
                { label: tc("year"), value: book.year ? String(book.year) : "—" },
              ].map((spec) => (
                <div key={spec.label} className="flex justify-between">
                  <span className="font-mono text-[9px] text-text-muted uppercase tracking-[1px]">
                    {spec.label}
                  </span>
                  <span className="font-sans text-xs text-text-secondary">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* -- Related Books -- */}
      {relatedBooks.length > 0 && (
        <div className="mt-20 pt-12 border-t border-border">
          <SectionLabel label={t("moreBooks").toUpperCase()} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {relatedBooks.map((b) => (
              <BookCard
                key={b.slug}
                title={b.title}
                coverImage={b.coverImage ?? "/images/books/placeholder.jpg"}
                type={b.type ?? "Book"}
                year={b.year ? String(b.year) : ""}
                description={b.description ?? ""}
                slug={`/books/${b.slug}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
