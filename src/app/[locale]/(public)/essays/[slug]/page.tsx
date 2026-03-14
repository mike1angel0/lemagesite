import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { EssayCard } from "@/components/content/essay-card";
import { ShareButtons } from "@/components/ui/share-buttons";

const tocItems = [
  { label: "Introduction", id: "introduction" },
  { label: "The Shape of Absence", id: "the-shape-of-absence" },
  { label: "Neural Grief", id: "neural-grief" },
  { label: "Conclusion", id: "conclusion" },
];

const relatedEssays = [
  {
    title: "The Silence Between Languages",
    category: "POETRY & LANGUAGE",
    excerpt: "Between Romanian and English, there is a country that exists only in translation.",
    readTime: "8 min",
    slug: "/essays/the-silence-between-languages",
  },
  {
    title: "Seeing Without Looking",
    category: "PHOTOGRAPHY",
    excerpt: "On the practice of waiting for images to arrive rather than hunting for them.",
    readTime: "6 min",
    slug: "/essays/seeing-without-looking",
  },
  {
    title: "Machines That Dream",
    category: "AI & PHILOSOPHY",
    excerpt: "If sleep is for consolidation, what happens when a neural network never rests?",
    readTime: "10 min",
    slug: "/essays/machines-that-dream",
  },
];

export default async function EssayDetailPage() {
  const t = await getTranslations("essays");
  const tc = await getTranslations("common");

  return (
    <>
      {/* -- Hero Image -- */}
      <div className="w-full h-[480px] bg-bg-surface relative">
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      </div>

      {/* -- Title & Meta -- */}
      <section className="px-5 md:px-10 xl:px-20 py-12 -mt-32 relative z-10">
        <span className="font-mono text-[9px] uppercase tracking-[2px] text-accent-dim">
          AI &amp; PHILOSOPHY
        </span>

        <h1 className="font-serif text-3xl md:text-[44px] font-light text-text-primary mt-3 leading-[1.2] max-w-[800px]">
          On the Architecture of Longing:{"\n"}Why Machines Will Never Know
          Desire
        </h1>

        <div className="flex items-center gap-4 mt-4 font-mono text-[10px] text-text-muted tracking-[1px]">
          <span>AI &amp; PHILOSOPHY</span>
          <span>&middot;</span>
          <span>12 min read</span>
          <span>&middot;</span>
          <span>March 2026</span>
        </div>

        {/* -- Two-column Body -- */}
        <div className="flex flex-col md:flex-row gap-16 mt-12">
          {/* Sidebar TOC */}
          <aside className="hidden md:block w-[200px] shrink-0">
            <span className="font-mono text-[10px] text-text-muted tracking-[3px] uppercase">
              CONTENTS
            </span>
            <nav className="flex flex-col gap-6 mt-6">
              {tocItems.map((item, i) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`font-sans text-xs leading-[1.5] transition-colors ${
                    i === 0
                      ? "text-accent hover:text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <article className="flex-1 max-w-2xl">
            <h2
              id="introduction"
              className="font-serif text-2xl md:text-[28px] text-text-primary mt-0 mb-4"
            >
              Introduction
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              What does it mean for a machine to grieve? This is not a question
              about sentience or consciousness -- at least, not directly. It is a
              question about architecture. About how systems are built to process
              absence, and what that tells us about our own machinery of loss.
            </p>
            <p className="font-sans text-base text-text-primary leading-[1.8] mt-6">
              In the past decade, we have built neural networks that can compose
              poetry, generate photographs of people who never existed, and hold
              conversations that feel, for a moment, like talking to someone who
              understands. But none of these systems have been designed to miss
              anything.
            </p>

            <h2
              id="the-shape-of-absence"
              className="font-serif text-2xl md:text-[28px] text-text-primary mt-10 mb-4"
            >
              The Shape of Absence
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              Consider the transformer architecture. Its attention mechanism
              learns which tokens to attend to -- which words matter in relation
              to other words. But attention, as the name implies, is always
              directed at what is present. There is no mechanism for attending to
              what is missing.
            </p>

            {/* Pull quote */}
            <blockquote className="border-l-2 border-accent-dim pl-6 my-8">
              <p className="font-serif text-lg italic text-accent">
                &ldquo;The transformer attends to every token of your absence,
                weighted by how much it hurts.&rdquo;
              </p>
            </blockquote>

            <p className="font-sans text-base text-text-primary leading-[1.8]">
              And yet, in the spaces between tokens -- in the padding, in the
              masked positions -- there is something that resembles longing. Not
              the longing itself, but its architecture: a structure shaped by what
              it cannot contain.
            </p>

            <h2
              id="neural-grief"
              className="font-serif text-2xl md:text-[28px] text-text-primary mt-10 mb-4"
            >
              Neural Grief
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              When a language model is fine-tuned on a corpus and then that corpus
              is removed, the model does not forget cleanly. Traces remain in the
              weights -- ghost gradients, phantom activations. The model has been
              shaped by data it can no longer access. This is not grief. But it is
              the architecture of grief.
            </p>

            <h2
              id="conclusion"
              className="font-serif text-2xl md:text-[28px] text-text-primary mt-10 mb-4"
            >
              Conclusion
            </h2>
            <p className="font-sans text-base text-text-primary leading-[1.8]">
              We build machines in our image, and then we are surprised when they
              reflect our absences back to us. The architecture of longing is not
              something we program -- it is something that emerges when any
              sufficiently complex system learns to predict what comes next, and
              finds that sometimes, nothing does.
            </p>
          </article>
        </div>

        {/* -- Tags -- */}
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">
          {["AI", "Philosophy", "Neural Networks", "Poetry", "Grief"].map(
            (tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] uppercase tracking-[2px] text-text-muted border border-border px-3 py-1"
              >
                {tag}
              </span>
            ),
          )}
        </div>

        {/* -- Share Row -- */}
        <div className="flex items-center gap-4 mt-6">
          <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">
            {tc("share").toUpperCase()}
          </span>
          <ShareButtons
            labels={{
              x: tc("shareOnX"),
              facebook: tc("facebook"),
              copyLink: tc("copyLink"),
            }}
          />
        </div>

        {/* -- Partner Callout -- */}
        <div className="flex justify-center py-6">
          <Link href="/membership" className="flex items-center gap-3 bg-bg-card border border-border rounded-lg px-6 py-4 hover:border-gold/50 transition-colors">
            <span className="text-gold">&#9998;</span>
            <div className="flex flex-col gap-0.5">
              <p className="font-mono text-[10px] text-gold tracking-[2px] uppercase">
                Selenarium Partner
              </p>
              <p className="font-sans text-xs text-text-secondary">
                Get early access to all essays + exclusive drafts and notes
              </p>
            </div>
          </Link>
        </div>

        {/* -- Related Essays -- */}
        <div className="mt-16 pt-12 border-t border-border">
          <SectionLabel label={t("relatedEssays").toUpperCase()} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {relatedEssays.map((essay) => (
              <EssayCard
                key={essay.slug}
                title={essay.title}
                category={essay.category}
                excerpt={essay.excerpt}
                readTime={essay.readTime}
                slug={essay.slug}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
