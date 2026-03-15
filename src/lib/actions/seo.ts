"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, readFile, access } from "fs/promises";
import path from "path";
import { PAGE_METADATA } from "@/lib/seo/metadata";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  return user?.role === "ADMIN" ? user : null;
}

// ─── Types ────────────────────────────────────────────────

export type CheckStatus = "pass" | "warning" | "fail";

export type SeoFix = {
  id: string;
  label: string;
  description: string;
  impact: "critical" | "high" | "medium" | "low";
};

export type PageCheck = {
  name: string;
  status: CheckStatus;
  detail: string;
  fix?: SeoFix;
};

export type SerpPreview = {
  title: string;
  url: string;
  description: string;
};

export type PageAudit = {
  path: string;
  label: string;
  checks: PageCheck[];
  score: number;
  serp: SerpPreview;
  wordCount: number;
  headingStructure: string[];
  internalLinks: number;
  externalLinks: number;
  hasJsonLd: boolean;
  responseTimeMs: number;
};

export type ContentGap = {
  type: string;
  id: string;
  title: string;
  issue: string;
  fix: SeoFix;
};

export type InfraStatus = {
  name: string;
  status: CheckStatus;
  detail: string;
  fix?: SeoFix;
};

export type AuditResult = {
  score: number;
  pages: PageAudit[];
  infrastructure: InfraStatus[];
  contentGaps: ContentGap[];
  timestamp: string;
  summary: {
    totalChecks: number;
    passed: number;
    warnings: number;
    failures: number;
    fixableCount: number;
  };
};

// ─── Route config ─────────────────────────────────────────

// Map from audit path to source file for metadata injection
const ROUTE_TO_FILE: Record<string, string> = {
  "/en": "src/app/[locale]/(public)/page.tsx",
  "/en/poetry": "src/app/[locale]/(public)/poetry/page.tsx",
  "/en/photography": "src/app/[locale]/(public)/photography/page.tsx",
  "/en/music": "src/app/[locale]/(public)/music/page.tsx",
  "/en/essays": "src/app/[locale]/(public)/essays/page.tsx",
  "/en/about": "src/app/[locale]/(public)/about/page.tsx",
  "/en/shop": "src/app/[locale]/(public)/shop/page.tsx",
  "/en/books": "src/app/[locale]/(public)/books/page.tsx",
  "/en/research": "src/app/[locale]/(public)/research/page.tsx",
  "/en/membership/payment": "src/app/[locale]/(public)/membership/payment/page.tsx",
  "/en/contact": "src/app/[locale]/(public)/contact/page.tsx",
};

// Path to key used in PAGE_METADATA
function routeToMetaKey(routePath: string): string {
  return routePath.replace(/^\/en/, "") || "/";
}

const PUBLIC_ROUTES = Object.keys(ROUTE_TO_FILE).map((p) => {
  const key = routeToMetaKey(p);
  const meta = PAGE_METADATA[key];
  return {
    path: p,
    label: meta?.title?.split("—")[0]?.trim() ?? key,
  };
});

// ─── HTML Analysis ────────────────────────────────────────

function analyzeHtml(html: string, routePath: string): {
  checks: PageCheck[];
  serp: SerpPreview;
  wordCount: number;
  headingStructure: string[];
  internalLinks: number;
  externalLinks: number;
  hasJsonLd: boolean;
} {
  const checks: PageCheck[] = [];
  const filePath = ROUTE_TO_FILE[routePath];
  const metaKey = routeToMetaKey(routePath);
  const defaultMeta = PAGE_METADATA[metaKey];

  const makeFix = (label: string, description: string, impact: SeoFix["impact"] = "high"): SeoFix => ({
    id: `add-page-metadata:${routePath}`,
    label,
    description,
    impact,
  });

  // ── Title tag ──
  const ROOT_DEFAULT_TITLE = "Selenarium — Poetry, Photography & Sound | Mihai Gavrilescu";
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const titleText = (titleMatch?.[1]?.trim() ?? "").replace(/&amp;/g, "&");
  if (!titleText) {
    checks.push({
      name: "Title tag",
      status: "fail",
      detail: "Missing <title> tag",
      fix: filePath ? makeFix("Add page metadata", `Add title: "${defaultMeta?.title ?? "..."}"`, "critical") : undefined,
    });
  } else if (routePath !== "/en" && titleText === ROOT_DEFAULT_TITLE) {
    // Non-home page using the root layout default — needs its own title
    checks.push({
      name: "Title tag",
      status: "fail",
      detail: "Using root layout default — needs unique page title",
      fix: filePath ? makeFix("Add page metadata", `Set unique title: "${defaultMeta?.title ?? "..."}"`, "critical") : undefined,
    });
  } else {
    const len = titleText.length;
    if (len < 30) checks.push({ name: "Title tag", status: "warning", detail: `Too short (${len} chars, ideal: 30-60)` });
    else if (len > 60) checks.push({ name: "Title tag", status: "warning", detail: `Too long (${len} chars, ideal: 30-60)` });
    else checks.push({ name: "Title tag", status: "pass", detail: `"${titleText}" (${len} chars)` });
  }

  // ── Meta description ──
  const descMatch =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  const ROOT_DEFAULT_DESC = "A digital selenarium for contemporary poetry, photography, music and cinema by lemagepoet";
  const descText = descMatch?.[1]?.trim() ?? "";
  if (!descText) {
    checks.push({
      name: "Meta description",
      status: "fail",
      detail: "Missing — this is what appears in Google results",
      fix: filePath ? makeFix("Add meta description", `Set description for this page`, "critical") : undefined,
    });
  } else if (routePath !== "/en" && descText.startsWith(ROOT_DEFAULT_DESC)) {
    checks.push({
      name: "Meta description",
      status: "fail",
      detail: "Using root layout default — needs unique description for this page",
      fix: filePath ? makeFix("Add meta description", `Set unique description`, "critical") : undefined,
    });
  } else {
    const len = descText.length;
    if (len < 120) checks.push({ name: "Meta description", status: "warning", detail: `Too short (${len} chars, ideal: 120-160)` });
    else if (len > 160) checks.push({ name: "Meta description", status: "warning", detail: `Too long (${len} chars, ideal: 120-160)` });
    else checks.push({ name: "Meta description", status: "pass", detail: `${len} chars` });
  }

  // ── Open Graph ──
  const ogT = html.match(/<meta\s+(?:property=["']og:title["']\s+content=["']([^"']*)["']|content=["']([^"']*)["']\s+property=["']og:title["'])/i);
  const ogTText = ogT?.[1] ?? ogT?.[2] ?? "";
  if (!ogTText) {
    checks.push({ name: "og:title", status: "fail", detail: "Missing — affects social sharing appearance", fix: filePath ? makeFix("Add OG tags", "Add Open Graph metadata", "high") : undefined });
  } else {
    checks.push({ name: "og:title", status: "pass", detail: `"${ogTText}"` });
  }

  const ogD = html.match(/<meta\s+(?:property=["']og:description["']\s+content=["']([^"']*)["']|content=["']([^"']*)["']\s+property=["']og:description["'])/i);
  checks.push((ogD?.[1] || ogD?.[2]) ? { name: "og:description", status: "pass", detail: `${(ogD?.[1] || ogD?.[2] || "").length} chars` } : { name: "og:description", status: "fail", detail: "Missing" });

  const ogI = html.match(/<meta\s+(?:property=["']og:image["']\s+content=["']([^"']*)["']|content=["']([^"']*)["']\s+property=["']og:image["'])/i);
  checks.push((ogI?.[1] || ogI?.[2]) ? { name: "og:image", status: "pass", detail: "Present" } : { name: "og:image", status: "warning", detail: "Missing — pages without images get less engagement when shared" });

  // ── Canonical URL ──
  const canonical = html.match(/<link\s+(?:rel=["']canonical["']\s+href=["']([^"']*)["']|href=["']([^"']*)["']\s+rel=["']canonical["'])/i);
  const canonicalUrl = canonical?.[1] ?? canonical?.[2] ?? "";
  if (canonicalUrl) {
    checks.push({ name: "Canonical URL", status: "pass", detail: canonicalUrl });
  } else {
    checks.push({ name: "Canonical URL", status: "warning", detail: "Missing — risks duplicate content issues across locales" });
  }

  // ── hreflang ──
  const hreflangEn = html.match(/<link[^>]*hreflang=["']en["'][^>]*>/i);
  const hreflangRo = html.match(/<link[^>]*hreflang=["']ro["'][^>]*>/i);
  if (hreflangEn && hreflangRo) {
    checks.push({ name: "hreflang tags", status: "pass", detail: "en + ro present" });
  } else {
    checks.push({ name: "hreflang tags", status: "warning", detail: "Missing — Google may show wrong language version to users" });
  }

  // ── H1 ──
  const h1Matches = html.match(/<h1[\s>]/gi);
  const h1Count = h1Matches?.length ?? 0;
  if (h1Count === 0) checks.push({ name: "H1 tag", status: "fail", detail: "No <h1> found — every page needs exactly one" });
  else if (h1Count === 1) checks.push({ name: "H1 tag", status: "pass", detail: "Exactly 1 <h1>" });
  else checks.push({ name: "H1 tag", status: "warning", detail: `${h1Count} <h1> tags — should be exactly 1` });

  // ── Heading hierarchy ──
  const headingStructure: string[] = [];
  const headingRegex = /<(h[1-6])[^>]*>([^<]*)</gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const tag = match[1].toUpperCase();
    const text = match[2].trim().substring(0, 60);
    if (text) headingStructure.push(`${tag}: ${text}`);
  }

  // ── Images ──
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const missingAlt = imgTags.filter((img) => !img.match(/alt=["'][^"']+["']/i)).length;
  if (imgTags.length === 0) {
    checks.push({ name: "Image alt text", status: "pass", detail: "No images" });
  } else if (missingAlt === 0) {
    checks.push({ name: "Image alt text", status: "pass", detail: `All ${imgTags.length} images have alt text` });
  } else {
    checks.push({ name: "Image alt text", status: "warning", detail: `${missingAlt}/${imgTags.length} images missing alt text` });
  }

  // ── Structured data (JSON-LD) ──
  const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
  if (hasJsonLd) {
    checks.push({ name: "Structured data", status: "pass", detail: "JSON-LD present" });
  } else {
    checks.push({ name: "Structured data", status: "warning", detail: "No JSON-LD — adding schema markup enables rich snippets in search results", fix: filePath ? { id: `add-jsonld:${routePath}`, label: "Add JSON-LD", description: "Add structured data for rich search snippets", impact: "high" } : undefined });
  }

  // ── Twitter card ──
  const twitterCard = html.match(/<meta\s+(?:name=["']twitter:card["']|content=["'][^"']*["']\s+name=["']twitter:card["'])/i);
  checks.push(twitterCard ? { name: "Twitter card", status: "pass", detail: "Present" } : { name: "Twitter card", status: "warning", detail: "Missing — large image cards get more engagement" });

  // ── Viewport meta ──
  const viewport = html.match(/<meta\s+name=["']viewport["']/i);
  checks.push(viewport ? { name: "Viewport meta", status: "pass", detail: "Mobile-friendly" } : { name: "Viewport meta", status: "fail", detail: "Missing viewport — page won't render correctly on mobile" });

  // ── Language attribute ──
  const htmlLang = html.match(/<html[^>]*\slang=["']([^"']*)["']/i);
  if (htmlLang?.[1]) {
    checks.push({ name: "Lang attribute", status: "pass", detail: `lang="${htmlLang[1]}"` });
  } else {
    checks.push({ name: "Lang attribute", status: "warning", detail: "Missing html lang attribute — helps search engines determine content language" });
  }

  // ── Word count & links ──
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyText = bodyMatch
    ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  if (wordCount < 100) {
    checks.push({ name: "Content depth", status: "warning", detail: `Only ${wordCount} words — thin content ranks poorly` });
  } else if (wordCount < 300) {
    checks.push({ name: "Content depth", status: "warning", detail: `${wordCount} words — consider expanding content` });
  } else {
    checks.push({ name: "Content depth", status: "pass", detail: `${wordCount} words` });
  }

  const internalLinks = (html.match(/href=["']\/[^"']*/gi) || []).length;
  const externalLinks = (html.match(/href=["']https?:\/\/(?!theselenarium\.art)[^"']*/gi) || []).length;

  // SERP preview
  const serp: SerpPreview = {
    title: titleText || defaultMeta?.title || "Untitled Page",
    url: `theselenarium.art${routePath}`,
    description: descText || defaultMeta?.description || "No description available.",
  };

  return { checks, serp, wordCount, headingStructure, internalLinks, externalLinks, hasJsonLd };
}

// ─── Infrastructure checks ────────────────────────────────

async function checkInfrastructure(baseUrl: string): Promise<InfraStatus[]> {
  const infra: InfraStatus[] = [];
  const projectRoot = process.cwd();

  // Sitemap
  try {
    const res = await fetch(`${baseUrl}/sitemap.xml`, { cache: "no-store" });
    if (res.ok) {
      const text = await res.text();
      const urlCount = (text.match(/<url>/gi) || []).length;
      infra.push({ name: "Sitemap", status: "pass", detail: `${urlCount} URLs indexed` });
    } else {
      infra.push({ name: "Sitemap", status: "fail", detail: "Not accessible", fix: { id: "create-sitemap", label: "Create sitemap.ts", description: "Generate dynamic sitemap from all content in Prisma", impact: "critical" } });
    }
  } catch {
    infra.push({ name: "Sitemap", status: "fail", detail: "Not found", fix: { id: "create-sitemap", label: "Create sitemap.ts", description: "Generate dynamic sitemap from all content in Prisma", impact: "critical" } });
  }

  // Robots.txt
  try {
    const res = await fetch(`${baseUrl}/robots.txt`, { cache: "no-store" });
    if (res.ok) {
      infra.push({ name: "Robots.txt", status: "pass", detail: "Accessible" });
    } else {
      infra.push({ name: "Robots.txt", status: "fail", detail: "Not accessible", fix: { id: "create-robots", label: "Create robots.ts", description: "Allow crawlers, block admin/auth pages, link sitemap", impact: "critical" } });
    }
  } catch {
    infra.push({ name: "Robots.txt", status: "fail", detail: "Not found", fix: { id: "create-robots", label: "Create robots.ts", description: "Allow crawlers, block admin/auth pages, link sitemap", impact: "critical" } });
  }

  // Root metadata
  try {
    const rootLayout = await readFile(path.join(projectRoot, "src/app/layout.tsx"), "utf-8");
    if (rootLayout.includes("template:") && rootLayout.includes("openGraph")) {
      infra.push({ name: "Root metadata", status: "pass", detail: "Title template + OG defaults configured" });
    } else if (rootLayout.includes("metadata")) {
      infra.push({ name: "Root metadata", status: "warning", detail: "Basic metadata only — missing OG, title template" });
    } else {
      infra.push({ name: "Root metadata", status: "fail", detail: "No root metadata", fix: { id: "enhance-root-metadata", label: "Enhance root metadata", description: "Add comprehensive defaults in root layout", impact: "high" } });
    }
  } catch {
    infra.push({ name: "Root metadata", status: "fail", detail: "Could not read root layout" });
  }

  // JSON-LD component
  try {
    await access(path.join(projectRoot, "src/lib/seo/jsonld.ts"));
    infra.push({ name: "JSON-LD library", status: "pass", detail: "Structured data generators available" });
  } catch {
    infra.push({ name: "JSON-LD library", status: "fail", detail: "No structured data generators", fix: { id: "create-jsonld", label: "Create JSON-LD utility", description: "Create structured data generators for all content types", impact: "high" } });
  }

  // Metadata utility
  try {
    await access(path.join(projectRoot, "src/lib/seo/metadata.ts"));
    infra.push({ name: "Metadata utility", status: "pass", detail: "Shared makeMetadata() available" });
  } catch {
    infra.push({ name: "Metadata utility", status: "fail", detail: "No shared metadata utility", fix: { id: "create-metadata-util", label: "Create metadata utility", description: "Create shared makeMetadata() for all pages", impact: "high" } });
  }

  // Check how many pages have generateMetadata / metadata export
  let pagesWithMeta = 0;
  let totalPages = 0;
  for (const [, fileSrc] of Object.entries(ROUTE_TO_FILE)) {
    totalPages++;
    try {
      const content = await readFile(path.join(projectRoot, fileSrc), "utf-8");
      const hasMeta = content.includes("generateMetadata") || content.includes("export const metadata") || content.includes("export { metadata");
      if (hasMeta) {
        pagesWithMeta++;
      } else {
        // Also check for layout.tsx in the same directory (client component metadata pattern)
        const dir = path.dirname(path.join(projectRoot, fileSrc));
        try {
          const layoutContent = await readFile(path.join(dir, "layout.tsx"), "utf-8");
          if (layoutContent.includes("metadata") || layoutContent.includes("generateMetadata")) {
            pagesWithMeta++;
          }
        } catch { /* no layout.tsx */ }
      }
    } catch { /* skip */ }
  }
  if (pagesWithMeta === totalPages) {
    infra.push({ name: "Page metadata coverage", status: "pass", detail: `${pagesWithMeta}/${totalPages} pages have metadata` });
  } else if (pagesWithMeta > 0) {
    infra.push({ name: "Page metadata coverage", status: "warning", detail: `${pagesWithMeta}/${totalPages} pages — ${totalPages - pagesWithMeta} pages missing metadata`, fix: { id: "add-all-metadata", label: "Add metadata to all pages", description: "Inject metadata export into every page missing it", impact: "critical" } });
  } else {
    infra.push({ name: "Page metadata coverage", status: "fail", detail: `0/${totalPages} pages have metadata`, fix: { id: "add-all-metadata", label: "Add metadata to all pages", description: "Inject metadata export into every page missing it", impact: "critical" } });
  }

  return infra;
}

// ─── Main Audit Action ────────────────────────────────────

export async function runSeoAuditAction(): Promise<
  { error: string } | AuditResult
> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // 1. Audit each page
  const pages: PageAudit[] = [];
  for (const route of PUBLIC_ROUTES) {
    const startTime = Date.now();
    try {
      const res = await fetch(`${baseUrl}${route.path}`, {
        headers: { "User-Agent": "SelenARium-SEO-Audit/1.0" },
        cache: "no-store",
      });
      const responseTimeMs = Date.now() - startTime;
      if (!res.ok) {
        pages.push({
          path: route.path,
          label: route.label,
          checks: [{ name: "HTTP Status", status: "fail", detail: `${res.status} response` }],
          score: 0,
          serp: { title: route.label, url: `theselenarium.art${route.path}`, description: "" },
          wordCount: 0,
          headingStructure: [],
          internalLinks: 0,
          externalLinks: 0,
          hasJsonLd: false,
          responseTimeMs,
        });
        continue;
      }
      const html = await res.text();
      const analysis = analyzeHtml(html, route.path);
      // Response time check
      if (responseTimeMs > 3000) {
        analysis.checks.push({ name: "Response time", status: "fail", detail: `${responseTimeMs}ms — very slow (target: <1000ms)` });
      } else if (responseTimeMs > 1000) {
        analysis.checks.push({ name: "Response time", status: "warning", detail: `${responseTimeMs}ms — slow (target: <1000ms)` });
      } else {
        analysis.checks.push({ name: "Response time", status: "pass", detail: `${responseTimeMs}ms` });
      }
      const passed = analysis.checks.filter((c) => c.status === "pass").length;
      const score = Math.round((passed / analysis.checks.length) * 100);
      pages.push({ path: route.path, label: route.label, score, responseTimeMs, ...analysis });
    } catch (e) {
      pages.push({
        path: route.path,
        label: route.label,
        checks: [{ name: "Fetch", status: "fail", detail: `Could not reach: ${e instanceof Error ? e.message : "unknown"}` }],
        score: 0,
        serp: { title: route.label, url: `theselenarium.art${route.path}`, description: "" },
        wordCount: 0,
        headingStructure: [],
        internalLinks: 0,
        externalLinks: 0,
        hasJsonLd: false,
        responseTimeMs: Date.now() - startTime,
      });
    }
  }

  // 2. Infrastructure
  const infrastructure = await checkInfrastructure(baseUrl);

  // 3. Content gaps
  const contentGaps: ContentGap[] = [];

  const poemsNoCollection = await prisma.poem.findMany({
    where: { collection: null },
    select: { id: true, title: true },
    take: 30,
  });
  for (const p of poemsNoCollection) {
    contentGaps.push({
      type: "Poem", id: p.id, title: p.title, issue: "No collection — harder to organize in search results",
      fix: { id: `content-gap:poem:collection:${p.id}`, label: "Set collection", description: `Set collection to "Uncategorized"`, impact: "low" },
    });
  }

  const photosNoDesc = await prisma.photo.findMany({
    where: { description: null },
    select: { id: true, title: true },
    take: 30,
  });
  for (const p of photosNoDesc) {
    contentGaps.push({
      type: "Photo", id: p.id, title: p.title, issue: "Missing description — lost SEO opportunity for image search",
      fix: { id: `content-gap:photo:description:${p.id}`, label: "Auto-fill description", description: "Set description from photo title", impact: "medium" },
    });
  }

  const essaysNoExcerpt = await prisma.essay.findMany({
    where: { excerpt: null },
    select: { id: true, title: true },
    take: 30,
  });
  for (const e of essaysNoExcerpt) {
    contentGaps.push({
      type: "Essay", id: e.id, title: e.title, issue: "Missing excerpt — no meta description for search results",
      fix: { id: `content-gap:essay:excerpt:${e.id}`, label: "Generate excerpt", description: "Auto-generate from first 160 chars of body", impact: "high" },
    });
  }

  const researchNoAbstract = await prisma.researchPaper.findMany({
    where: { abstract: null },
    select: { id: true, title: true },
    take: 30,
  });
  for (const r of researchNoAbstract) {
    contentGaps.push({
      type: "Research", id: r.id, title: r.title, issue: "Missing abstract — critical for academic search visibility",
      fix: { id: `content-gap:research:abstract:${r.id}`, label: "Generate abstract", description: "Auto-generate from first 200 chars of body", impact: "high" },
    });
  }

  // 4. Score
  const allChecks = [
    ...pages.flatMap((p) => p.checks),
    ...infrastructure.map((i) => ({ status: i.status })),
  ];
  const totalChecks = allChecks.length;
  const passed = allChecks.filter((c) => c.status === "pass").length;
  const warnings = allChecks.filter((c) => c.status === "warning").length;
  const failures = allChecks.filter((c) => c.status === "fail").length;

  // Weighted score: passes count full, warnings half, failures zero
  const maxPoints = totalChecks;
  const earnedPoints = passed + warnings * 0.5;
  const baseScore = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
  const contentPenalty = Math.min(contentGaps.length, 15);
  const score = Math.max(0, baseScore - contentPenalty);

  // Count fixable
  const fixableIds = new Set<string>();
  pages.forEach((p) => p.checks.forEach((c) => { if (c.fix) fixableIds.add(c.fix.id); }));
  infrastructure.forEach((i) => { if (i.fix) fixableIds.add(i.fix.id); });
  contentGaps.forEach((g) => fixableIds.add(g.fix.id));

  return {
    score,
    pages,
    infrastructure,
    contentGaps,
    timestamp: new Date().toISOString(),
    summary: {
      totalChecks,
      passed,
      warnings,
      failures,
      fixableCount: fixableIds.size,
    },
  };
}

// ─── Apply Fix Action ─────────────────────────────────────

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function applySeoFixAction(
  fixId: string,
): Promise<{ error?: string; success?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized" };

  const projectRoot = process.cwd();

  // ── Create sitemap.ts ──
  if (fixId === "create-sitemap") {
    const fp = path.join(projectRoot, "src/app/sitemap.ts");
    if (await fileExists(fp)) return { success: "sitemap.ts already exists" };
    const content = `import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL || "https://theselenarium.art";
const LOCALES = ["en", "ro"] as const;

function localized(p: string, priority: number, freq: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly", lastMod?: Date): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({ url: \`\${BASE_URL}/\${locale}\${p}\`, lastModified: lastMod ?? new Date(), changeFrequency: freq, priority }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    ...localized("", 1.0, "daily"),
    ...localized("/poetry", 0.9, "daily"),
    ...localized("/photography", 0.9, "daily"),
    ...localized("/music", 0.8, "weekly"),
    ...localized("/essays", 0.9, "daily"),
    ...localized("/research", 0.7, "weekly"),
    ...localized("/about", 0.6, "monthly"),
    ...localized("/shop", 0.8, "weekly"),
    ...localized("/books", 0.7, "weekly"),
    ...localized("/membership/payment", 0.5, "monthly"),
  ];

  const [poems, photos, essays, research, albums, books, products] = await Promise.all([
    prisma.poem.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true } }),
    prisma.photo.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true } }),
    prisma.essay.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true } }),
    prisma.researchPaper.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true } }),
    prisma.album.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.book.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    ...staticRoutes,
    ...poems.flatMap((p) => localized(\`/poetry/\${p.slug}\`, 0.7, "monthly", p.updatedAt)),
    ...photos.flatMap((p) => localized(\`/photography/\${p.slug}\`, 0.6, "monthly", p.updatedAt)),
    ...essays.flatMap((e) => localized(\`/essays/\${e.slug}\`, 0.8, "monthly", e.updatedAt)),
    ...research.flatMap((r) => localized(\`/research/\${r.slug}\`, 0.7, "monthly", r.updatedAt)),
    ...albums.flatMap((a) => localized(\`/music/\${a.slug}\`, 0.7, "monthly", a.updatedAt)),
    ...books.flatMap((b) => localized(\`/books/\${b.slug}\`, 0.6, "monthly", b.updatedAt)),
    ...products.flatMap((p) => localized(\`/shop/\${p.slug}\`, 0.6, "weekly", p.updatedAt)),
  ];
}
`;
    await writeFile(fp, content, "utf-8");
    return { success: "Created src/app/sitemap.ts" };
  }

  // ── Create robots.ts ──
  if (fixId === "create-robots") {
    const fp = path.join(projectRoot, "src/app/robots.ts");
    if (await fileExists(fp)) return { success: "robots.ts already exists" };
    const content = `import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://theselenarium.art";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/login", "/signup", "/reset-password", "/verify-email", "/account", "/patron", "/checkout"] }],
    sitemap: \`\${BASE_URL}/sitemap.xml\`,
  };
}
`;
    await writeFile(fp, content, "utf-8");
    return { success: "Created src/app/robots.ts" };
  }

  // ── Add metadata to a single page ──
  if (fixId.startsWith("add-page-metadata:")) {
    const routePath = fixId.replace("add-page-metadata:", "");
    const relativeFile = ROUTE_TO_FILE[routePath];
    const metaKey = routeToMetaKey(routePath);
    const meta = PAGE_METADATA[metaKey];
    if (!relativeFile || !meta) return { error: "Unknown route" };

    const fp = path.join(projectRoot, relativeFile);
    if (!(await fileExists(fp))) return { error: `File not found: ${relativeFile}` };

    const existing = await readFile(fp, "utf-8");
    if (existing.includes("generateMetadata") || existing.includes("export const metadata")) {
      return { success: "Metadata already exists" };
    }

    const isClientComponent = existing.trimStart().startsWith('"use client"') || existing.trimStart().startsWith("'use client'");
    if (isClientComponent) {
      // For client components, create a layout.tsx in the same directory with metadata
      const dir = path.dirname(fp);
      const layoutPath = path.join(dir, "layout.tsx");
      if (await fileExists(layoutPath)) {
        const layoutContent = await readFile(layoutPath, "utf-8");
        if (layoutContent.includes("metadata")) {
          return { success: "Metadata already exists in layout.tsx" };
        }
      }
      const routePathClean = routePath.replace(/^\/en/, "") || "/";
      const layoutContent = `import { makeMetadata } from "@/lib/seo/metadata";

export const metadata = makeMetadata({
  title: "${meta.title.replace(/"/g, '\\"')}",
  description: "${meta.description.replace(/"/g, '\\"')}",
  path: "${routePathClean}",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`;
      await writeFile(layoutPath, layoutContent, "utf-8");
      return { success: `Created layout.tsx with metadata for ${relativeFile}` };
    }

    // Server component — inject metadata import + export
    const routePathClean = routePath.replace(/^\/en/, "") || "/";
    const metadataBlock = `\nimport { makeMetadata } from "@/lib/seo/metadata";\n\nexport const metadata = makeMetadata({\n  title: "${meta.title.replace(/"/g, '\\"')}",\n  description: "${meta.description.replace(/"/g, '\\"')}",\n  path: "${routePathClean}",\n});\n`;

    const lines = existing.split("\n");
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("import ") || (line.startsWith("}") && i > 0 && lines[i - 1]?.includes("from"))) {
        lastImportIdx = i;
      }
    }
    lines.splice(lastImportIdx + 1, 0, metadataBlock);
    await writeFile(fp, lines.join("\n"), "utf-8");
    return { success: `Added metadata to ${relativeFile}` };
  }

  // ── Add metadata to ALL pages ──
  if (fixId === "add-all-metadata") {
    let added = 0;
    let skipped = 0;
    for (const [routePath] of Object.entries(ROUTE_TO_FILE)) {
      const result = await applySeoFixAction(`add-page-metadata:${routePath}`);
      if (result.success?.includes("Created") || result.success?.includes("Added")) added++;
      else skipped++;
    }
    return { success: `Added metadata to ${added} pages (${skipped} already had it)` };
  }

  // ── Content gaps ──
  if (fixId.startsWith("content-gap:")) {
    const parts = fixId.split(":");
    if (parts.length !== 4) return { error: "Invalid fix ID" };
    const [, model, field, id] = parts;

    if (model === "poem" && field === "collection") {
      await prisma.poem.update({ where: { id }, data: { collection: "Uncategorized" } });
      return { success: `Set collection to "Uncategorized"` };
    }
    if (model === "photo" && field === "description") {
      const photo = await prisma.photo.findUnique({ where: { id }, select: { title: true } });
      if (!photo) return { error: "Photo not found" };
      await prisma.photo.update({ where: { id }, data: { description: photo.title } });
      return { success: `Set description to "${photo.title}"` };
    }
    if (model === "essay" && field === "excerpt") {
      const essay = await prisma.essay.findUnique({ where: { id }, select: { body: true } });
      if (!essay) return { error: "Essay not found" };
      const excerpt = essay.body.replace(/[#*_\[\]]/g, "").substring(0, 160).trim();
      await prisma.essay.update({ where: { id }, data: { excerpt } });
      return { success: "Generated excerpt from body text" };
    }
    if (model === "research" && field === "abstract") {
      const paper = await prisma.researchPaper.findUnique({ where: { id }, select: { body: true } });
      if (!paper?.body) return { error: "Paper not found or has no body" };
      const abstract = paper.body.replace(/[#*_\[\]]/g, "").substring(0, 200).trim();
      await prisma.researchPaper.update({ where: { id }, data: { abstract } });
      return { success: "Generated abstract from body text" };
    }
    return { error: `Unknown content gap: ${model}:${field}` };
  }

  return { error: `Unknown fix: ${fixId}` };
}

// ─── Batch Apply Fixes ────────────────────────────────────

export async function applyAllFixesAction(
  fixIds: string[],
): Promise<{ results: { id: string; success?: string; error?: string }[] }> {
  const admin = await requireAdmin();
  if (!admin) return { results: [{ id: "*", error: "Not authorized" }] };

  const results: { id: string; success?: string; error?: string }[] = [];
  for (const fixId of fixIds) {
    const result = await applySeoFixAction(fixId);
    results.push({ id: fixId, ...result });
  }
  return { results };
}
