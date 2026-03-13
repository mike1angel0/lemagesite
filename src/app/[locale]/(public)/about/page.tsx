import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionLabel } from "@/components/ui/section-label";
import { Button } from "@/components/ui/button";

const collaborators = [
  {
    name: "NEMIRA",
    tag: "Publisher",
    desc: "Publishing partner since 2022. Nemira has brought three poetry collections to print, with distribution across Romania and select European bookstores.",
    link: "Visit Nemira \u2192",
  },
  {
    name: "MNAC",
    tag: "Museum",
    desc: "Ongoing exhibition partnership with the National Museum of Contemporary Art. Two solo photography exhibitions and a permanent collection placement.",
    link: "Visit MNAC \u2192",
  },
  {
    name: "DILEMA VECHE",
    tag: "Magazine",
    desc: "Monthly poetry column since 2023. Selected poems are first published in Dilema Veche before appearing on the Observatory.",
    link: "Read the column \u2192",
  },
  {
    name: "C\u0102RTURE\u015ETI",
    tag: "Bookstore",
    desc: "Exclusive retail partner for signed first editions. Book launches and reading events hosted at C\u0103rture\u0219ti Carusel, Bucharest.",
    link: "Visit store \u2192",
  },
];

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <>
      {/* ── Bio Hero ── */}
      <section className="flex flex-col md:flex-row gap-20 px-5 md:px-10 xl:px-20 py-20">
        {/* Portrait */}
        <div className="w-full md:w-[420px] h-[560px] bg-bg-surface border border-border shrink-0" />

        {/* Intro */}
        <div className="flex flex-1 flex-col gap-6">
          <SectionLabel label="THE POET-MAGE" />

          <h1 className="font-serif text-4xl md:text-[52px] font-light text-text-primary leading-tight">
            Mihai Gavrilescu
          </h1>

          <p className="font-sans text-[13px] text-accent-dim tracking-[2px]">
            Poet  &middot;  Photographer  &middot;  Singer-Songwriter  &middot;  AI Researcher  &middot;  Former Magician
          </p>

          <div className="font-sans text-[15px] text-text-secondary leading-[1.8] max-w-[560px] space-y-4">
            <p>
              I live between languages — Romanian and English — and between worlds: the precision of neural architectures and the silence of verse. Born in Bucharest, I studied computer science before realizing that the most interesting algorithms are the ones that fail beautifully.
            </p>
            <p>
              Before all of this, I was a magician. Not the metaphorical kind — the kind with cards and misdirection and audiences who wanted to believe. I traded that for poetry, which is really just a slower, more permanent form of the same trick: making the invisible appear.
            </p>
            <p>
              My work explores the intersection of artificial and human intelligence. Through poetry, I map the spaces where language breaks down. Through research, I study how machines approximate meaning. Through photography, I document what remains when both fail.
            </p>
            <p>
              This observatory is the convergence point — a place where art and science exist not in tension, but in dialogue. A grown-up asteroid B612, if you will.
            </p>
          </div>

          <p className="font-serif text-2xl italic text-accent leading-[1.4]">
            &ldquo;I write to understand what I think about thinking.
            {"\n"}I perform magic to understand what I think about believing.&rdquo;
          </p>
        </div>
      </section>

      {/* ── Academic CV ── */}
      <section className="border-t border-border px-5 md:px-10 xl:px-20 py-[60px] flex flex-col gap-10">
        <SectionLabel label="ACADEMIC CV" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {/* Left: Education + Publications */}
          <div className="flex flex-col gap-6">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              EDUCATION
            </span>
            <p className="font-sans text-[13px] text-text-secondary leading-[1.6]">
              Ph.D. Candidate, Computational Linguistics — University of Bucharest, 2022–present
              {"\n"}M.Sc. Computer Science, AI — Politehnica University, 2020
            </p>

            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              SELECTED PUBLICATIONS
            </span>
            <p className="font-sans text-[13px] text-text-secondary leading-[1.6]">
              Neural Architectures and the Poetics of Attention (2025)
              {"\n"}On Machine Grief: Can Artificial Systems Experience Loss? (2024)
              {"\n"}Generative Verse: Fine-Tuning LLMs on Poetic Corpora (2024)
            </p>
          </div>

          {/* Right: Achievements + Downloads */}
          <div className="flex flex-col gap-6">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              ACHIEVEMENTS
            </span>
            <p className="font-sans text-[13px] text-text-secondary leading-[1.6]">
              Romanian National Poetry Prize, 2024
              {"\n"}Best Paper, ACL Workshop on Creativity &amp; NLP, 2023
              {"\n"}Pushcart Prize Nominee, 2022
              {"\n"}Carpathian Arts Residency Fellow, 2023
            </p>

            <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
              DOWNLOADS
            </span>
            <div className="border border-accent-dim px-5 py-2.5 w-fit">
              <span className="font-sans text-xs text-accent">
                Download Full CV (PDF) &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Collaborators & Partners ── */}
      <section className="border-t border-border px-5 md:px-10 xl:px-20 py-[60px] flex flex-col gap-10">
        <SectionLabel label="COLLABORATORS & PARTNERS" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collaborators.map((collab) => (
            <div
              key={collab.name}
              className="bg-bg-card border border-border rounded-lg p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-[2px] text-accent">
                  {collab.name}
                </span>
                <span className="font-mono text-[10px] text-text-muted bg-bg-elevated rounded px-2.5 py-1">
                  {collab.tag}
                </span>
              </div>
              <p className="font-sans text-[13px] text-text-secondary leading-[1.6]">
                {collab.desc}
              </p>
              <span className="font-sans text-xs font-medium text-gold">
                {collab.link}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Support the Observatory ── */}
      <section className="border-t border-border bg-bg-card px-5 md:px-10 xl:px-20 py-[60px] flex flex-col items-center gap-5">
        <SectionLabel label="SUPPORT THE OBSERVATORY" className="justify-center" />

        <h2 className="font-serif text-[28px] font-light text-text-primary text-center">
          If this work resonates with you
        </h2>

        <p className="font-sans text-sm text-text-secondary text-center leading-[1.6] max-w-[520px]">
          Your support keeps this observatory running — funding independent research,
          {"\n"}new recordings, photography expeditions, and open-access poetry.
          {"\n\n"}Every lamp needs someone to light it.
        </p>

        <div className="flex gap-4">
          <Link href="/membership">
            <Button variant="filled" size="lg">
              Become a Patron
            </Button>
          </Link>
          <Link href="/membership/payment">
            <Button variant="ghost" size="lg">
              One-time Donation
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
