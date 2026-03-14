import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { BookCard } from "@/components/content/book-card";

const books = [
  {
    title: "Nocturnal Echoes",
    coverImage: "/images/books/nocturnal-echoes.jpg",
    type: "Poetry Collection",
    year: "2025",
    description:
      "47 poems on silence, machines, and the weight of unsaid words. First edition.",
    quote: "\u201CA stunning meditation on intelligence.\u201D \u2014 Literary Review",
    slug: "/books/nocturnal-echoes",
    buttons: ["Buy Print", "Read Excerpt"],
  },
  {
    title: "Cartographies of Breath",
    coverImage: "/images/books/cartographies-of-breath.jpg",
    type: "Chapbook",
    year: "2023",
    description:
      "A limited-edition chapbook of 12 poems written during a residency in the Carpathian mountains.",
    quote: "\u201CIntimate and precise.\u201D \u2014 Poezia Magazine",
    slug: "/books/cartographies-of-breath",
    buttons: ["Buy Print", "Member Excerpt"],
  },
  {
    title: "Machines & Mirrors",
    coverImage: "/images/books/machines-and-mirrors.jpg",
    type: "Anthology",
    year: "2024",
    description:
      "Collaborative anthology with 8 poets exploring artificial intelligence through verse. Contributor & editor.",
    slug: "/books/machines-and-mirrors",
    buttons: ["Buy Print"],
  },
];

const partnerKeys = [
  { name: "CARTURESTI", noteKey: "signedEditions" },
  { name: "NEMIRA", noteKey: "publisherDirect" },
  { name: "LIBRARIE.NET", noteKey: "freeShipping" },
] as const;

export default async function BooksPage() {
  const t = await getTranslations("books");

  return (
    <section className="px-5 md:px-10 xl:px-20 py-20">
      {/* ── Hero ── */}
      <div className="flex flex-col items-center">
        <SectionLabel label={t("sectionLabel")} className="justify-center" />

        <h1 className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-text-primary mt-6 text-center leading-tight">
          {t("heroTitle")}
        </h1>

        <p className="font-sans text-sm text-text-secondary mt-4 max-w-[500px] leading-relaxed text-center">
          {t("heroDescription")}
        </p>
      </div>

      {/* ── Books Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
        {books.map((book) => (
          <BookCard
            key={book.slug}
            title={book.title}
            coverImage={book.coverImage}
            type={book.type}
            year={book.year}
            description={book.description}
            quote={book.quote}
            buttons={book.buttons}
            slug={book.slug}
          />
        ))}
      </div>

      {/* ── Partners Section ── */}
      <div className="mt-12 pt-12 border-t border-border">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Left: text content */}
          <div className="flex flex-col gap-3 flex-1">
            <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
              WHERE TO FIND THESE BOOKS
            </span>
            <h3 className="font-serif text-2xl font-light text-text-primary">
              {t("availableAt")}
            </h3>
            <p className="font-sans text-[13px] text-text-secondary leading-relaxed max-w-[420px]">
              Order from these trusted bookstores for signed editions,
              free shipping, and exclusive selenarium bookmarks.
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
