# The Observatory (LMG Website) -- Complete Design Specification

**Design File:** `/Users/mihaigavrilescu/IdeaProjects/lmg website/lmgsite.pen`
**Canvas Width:** 1440px (desktop), 640px (email template)
**Theme:** Dark mode (primary)
**Languages:** Romanian (default) + English

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Design System](#design-system)
3. [Shared Components](#shared-components)
4. [Public Pages](#public-pages)
5. [Detail Pages](#detail-pages)
6. [Gated Content Pages](#gated-content-pages)
7. [Auth & User Pages](#auth--user-pages)
8. [Commerce Pages](#commerce-pages)
9. [Admin Pages](#admin-pages)
10. [Legal Pages](#legal-pages)
11. [Email Template](#email-template)
12. [Responsive Strategy](#responsive-strategy)
13. [i18n Strategy](#i18n-strategy)
14. [Data Model](#data-model)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | SSR/SSG, i18n routing, API routes |
| Styling | Tailwind CSS v4 | Utility-first responsive design |
| i18n | next-intl | Romanian (default) + English |
| Database | PostgreSQL (Supabase) | Content, users, orders |
| ORM | Prisma | Type-safe database access |
| Auth | Auth.js v5 (NextAuth) | Login, membership tiers |
| Payments | Stripe | Subscriptions + one-time purchases |
| Membership | Stripe + Patreon | Direct subscriptions + Patreon integration |
| Media | Cloudinary or S3 | Images, music files, book covers |
| Deployment | Vercel | Native Next.js hosting |
| Email | Resend or SendGrid | Newsletter, transactional emails |

---

## Design System

### Typography

| Role | Font Family | Size | Weight | Color Variable | Letter Spacing | Line Height |
|------|------------|------|--------|----------------|----------------|-------------|
| Page Title | Cormorant Garamond | 48-56px | 300 | `$text-primary` or `$warm-ivory` | -- | 1.15 |
| Section Title | Cormorant Garamond | 38-42px | 300 | `$warm-ivory` | -- | 1.2-1.3 |
| Card Title | Cormorant Garamond | 24-36px | 400 | `$text-primary` | -- | 1.15-1.2 |
| Poem/Literary Text | Cormorant Garamond | 18-22px | 300 | `$text-primary` | -- | 1.7-1.8 |
| Quote (Italic) | Cormorant Garamond | 20-24px | 300 italic | `$starlight` or `$accent` | -- | 1.5-1.8 |
| Price | Cormorant Garamond | 32px | 700 | `$gold` | -- | -- |
| Body Text | Inter | 14-16px | 400 | `$text-secondary` | -- | 1.6-1.8 |
| Nav Links | Inter | 12px | 400 | `$text-secondary` | 1px | -- |
| Footer Links | Inter | 13px | 400 | `$text-secondary` | -- | -- |
| CTA Button | Inter | 11-13px | 500 | `$text-on-accent` or `$starlight` | 2px | -- |
| Section Label | IBM Plex Mono | 10px | 500 | `$accent-dim` | 3px | -- |
| Tag/Badge | IBM Plex Mono | 9px | 500 | `$accent-dim` | 2-3px | -- |
| Meta/Caption | IBM Plex Mono | 10-11px | 400 | `$text-muted` | 1-2px | -- |
| Copyright | IBM Plex Mono | 10px | 400 | `$text-muted` | 1px | -- |

### Color Variables

| Variable | Dark Mode | Light Mode | Usage |
|----------|----------|------------|-------|
| `$bg` | `#0B0E13` | `#F0F1F5` | Page background |
| `$bg-surface` | `#111621` | `#FFFFFF` | Surface backgrounds |
| `$bg-card` | `#141A26` | `#F8F9FC` | Card backgrounds |
| `$bg-elevated` | `#1A2030` | `#E8EAF0` | Elevated elements, active states |
| `$text-primary` | `#E8ECF2` | `#0B0E13` | Headings, primary text |
| `$text-secondary` | `#7A8599` | `#4A5568` | Body text, descriptions |
| `$text-muted` | `#3D4556` | `#A0AEC0` | Labels, footnotes, disabled |
| `$text-on-accent` | `#0B0E13` | `#FFFFFF` | Text on filled accent buttons |
| `$accent` | `#A8B4C8` | `#4A5568` | Links, active filters |
| `$accent-dim` | `#5A6A82` | `#718096` | Section labels, borders |
| `$accent-glow` | `#C8D6E8` | `#2D3748` | Hover/glow states |
| `$border` | `#1E2738` | `#D2D6E0` | Borders, dividers |
| `$border-strong` | `#2A3548` | `#A0AAC0` | Emphasized borders |
| `$gold` | `#C9A962` | `#B08830` | Gold accents, prices |
| `$warm-ivory` | `#F5EED8` | `#2A2010` | Hero headlines |
| `$starlight` | `#E8D5A8` | `#6B5A38` | CTA buttons, accent links |
| `$honey` | `#C8944A` | `#A07030` | Warm accents |

### Common Spacing

| Context | Value |
|---------|-------|
| Page horizontal padding | 80px |
| Section vertical padding | 60-80px |
| Card padding | 20-32px |
| Card corner radius | 2-8px |
| Grid gap | 16-32px |
| Nav padding | 20px 80px |
| Footer padding | 60px 80px |

### Common Design Patterns

1. **Section Label:** 32x1px line (`$accent-dim`) + uppercase IBM Plex Mono text (10px, 500, ls: 3px)
2. **Card:** `$bg-card` fill, cornerRadius 2-8, 1px `$border` stroke
3. **Ghost Button:** 1px `$accent-dim` border, padding 8-14px 20-36px
4. **Filled Button:** `$starlight` or `$accent` fill, dark text
5. **Quote Interlude:** Full-width image, horizontal gradient overlay, centered Cormorant Garamond quote
6. **Progressive Fade (Gated):** opacity 1.0 -> 0.3 -> 0.12 on preview content
7. **Arrow Links:** "Text -->" pattern, Inter 12px, `$starlight`

---

## Shared Components

### Navigation Bar (Component/Nav, ID: `73BaZ`)

**Layout:** Horizontal, `justify-content: space-between`, `align-items: center`
**Fill:** `$bg`
**Padding:** 20px 80px
**Width:** 100%

| Section | Content | Style |
|---------|---------|-------|
| **navLeft** | Logo frame 160x76px | Image with `screen` blend mode over `$bg` |
| **navCenter** | 8 links: Poetry, Photography, Music, Research, Essays, Books, Shop, Membership | Inter 12px, `$text-secondary`, ls: 1px, gap: 32px |
| **navRight** | "EN / RO" toggle + "ENTER THE OBSERVATORY" CTA | IBM Plex Mono 10px `$text-muted` + Inter 10px 500 `$starlight`, gap: 20px |

**CTA Button:** Padding 8px 20px, border 1px `$accent-dim`

### Footer (Component/Footer, ID: `fL6Np`)

**Layout:** Vertical, gap: 48px
**Fill:** `$bg`, top border 1px `$border`
**Padding:** 60px 80px

**footerTop:** Horizontal, `justify-content: space-between`
- **Brand column** (300px): Logo + tagline (Inter 12px, `$text-muted`, lh: 1.6) + "Support This Work" button (heart icon + text, outlined, cornerRadius: 4)
- **Link columns** (gap: 64px):
  - EXPLORE: Poetry, Photography, Music, Books
  - KNOWLEDGE: Research, Essays, Events, About
  - CONNECT: Membership, Newsletter, Contact, Instagram, YouTube, TikTok
  - Column headers: Inter 10px, 500, `$text-muted`, ls: 3px
  - Links: Inter 13px, `$text-secondary`, gap: 16px

**footerBottom:** Horizontal, `justify-content: space-between`, top border 1px `$border`, padding-top: 20px
- Copyright: IBM Plex Mono 10px, `$text-muted`
- Social row: Substack, Medium, Spotify, GitHub, Instagram, Facebook, TikTok, YouTube (Inter 11px, `$text-muted`, gap: 20px)

### SectionLabel (ID: `7BQ0x`)
Horizontal, center-aligned, gap: 12px
- Line: 32x1px rectangle, `$accent-dim`
- Text: IBM Plex Mono 10px, 500, `$accent-dim`, ls: 3px, uppercase

### MemberBadge (ID: `P5ruB`)
- Text: IBM Plex Mono 9px, 500, `$accent-dim`, ls: 2px
- Padding: 4px 10px, border 1px `$accent-dim`

### LockBadge (ID: `TGLNu`)
Horizontal, center-aligned, gap: 6px
- Lock icon: lucide `lock`, 12px, `$text-muted`
- Text: "PATRON ONLY", IBM Plex Mono 9px, 500, `$text-muted`, ls: 2px
- Fill: `$bg-elevated`, padding: 4px 10px

---

## Public Pages

### 1. Home -- Observatory (ID: `2WMFV`)

**Purpose:** Landing page for the creative portfolio and membership site.
**Sections:**

#### Hero (900px height, absolute positioning)
- **Background:** Full-bleed atmospheric photo (1440x900, fill mode)
- **Gradient overlay:** Top-to-bottom: transparent -> 12.5% opacity -> 59.6% opacity -> solid `$bg`
- **Decorative stars:** 12 small ellipses (2-4px), gold/silver, scattered with varying opacity (0.3-0.7)
- **Content (flex-end, centered):**
  - SectionLabel: "WELCOME, WANDERER"
  - Headline: "Come in from the dark.\nThe observatory is open." (Cormorant Garamond 56px, 300, `$warm-ivory`, fixed-width 750px)
  - Decorative divider: line + flower-2 icon (`#C07070`, opacity 0.6) + line
  - Subtitle: "Poetry . Photography . Music . Research . Magic" (IBM Plex Mono 11px, `$accent-dim`, ls: 3px)
  - **Two CTAs:**
    - "Begin Reading" -- filled `$starlight`, padding 14px 36px
    - "About the Poet-Mage" -- outlined, border 1px `$accent-dim`

#### Featured Section (padding: 80px)
- SectionLabel: "LATEST FROM THE OBSERVATORY"
- **Two-column grid (gap: 24px):**
  - Left: Latest Poem card (340px, `$bg-card`) + Recent Research card (200px, `$bg-card` + LockBadge)
  - Right: Featured Photo card (340px, image with gradient overlay) + Recent Essay card (200px, `$bg-card`)
- Cards have 2px cornerRadius, 1px `$border`, padding: 40px

#### Quote Interlude (360px height)
- Full-width image, horizontal gradient overlay
- Cormorant Garamond 24px, 300, `$warm-ivory`, centered
- Attribution + 3 dot indicators (carousel)

#### Upcoming Event Bar
- Horizontal, `$bg-surface`, padding: 32px 80px, top/bottom border
- Date block (month + day) + event info + "RSVP -->" button

#### About Preview (padding: 100px 80px)
- Horizontal: Portrait (360x450px) + bio text (gap: 80px)
- Name: Cormorant Garamond 42px, 300, `$warm-ivory`
- Bio: Inter 15px, lh: 1.8, fixed-width 520px
- Sparkle row (3 sparkle icons in `$gold`)
- Pull quote: Cormorant Garamond 22px, italic, `$starlight`

#### Newsletter Section (`$bg-surface`, padding: 80px)
- SectionLabel: "DISPATCHES FROM THE OBSERVATORY"
- Headline: Cormorant Garamond 38px, 300, `$warm-ivory`
- Email form: input (320px) + "Subscribe" button (filled `$starlight`)
- Note: "Powered by Substack . Also available on Medium"

#### Partners Section (padding: 60px 80px)
- SectionLabel: "FELLOW TRAVELLERS"
- 5 partner cards: NEMIRA, CARTURESTI, MNAC, DILEMA, SUBSTACK
- Logo frames: 120x48px, `$bg-elevated`, cornerRadius: 8

---

### 2. Poetry -- Collection (ID: `HQ2EF`)

**Purpose:** Poetry listing page with filtering by theme/collection.

#### Hero (padding: 80px 80px 60px 80px)
- SectionLabel: "POETRY"
- Title: "Verses from the\nObservatory" (56px, fixed-width 700px)
- Description with Saint-Exupery quote
- **Filter tabs:** All (active, `$accent`, weight 500) | Silence & Space | Intelligence | Longing | Romanian (Inter 12px, `$text-muted`)

#### Poems List (padding: 0 80px)
Vertical list, each row: horizontal, `space-between`, padding: 32px 0, top border 1px `$border`

| Poem | Collection | Language | Badge | Audio |
|------|-----------|----------|-------|-------|
| The Cartographers of Silence | SILENCE & SPACE | EN | -- | headphones icon |
| Neural Lullaby | INTELLIGENCE | EN | SUPPORTER | -- |
| Scrisoare catre nimeni | LONGING | RO | -- | -- |
| Attention Is All You Need (To Grieve) | INTELLIGENCE | EN | PATRON ONLY | headphones icon |
| Observatory Notes, December | SILENCE & SPACE | EN / RO | -- | -- |

Each row: Meta tags (IBM Plex Mono 9px) + Title (Cormorant Garamond 28px) + Excerpt (15px italic) | Arrow

#### Quote Interlude (280px height)
Same pattern as Home interlude

---

### 3. Photography -- Gallery (ID: `GYLRx`)

**Purpose:** Photography gallery with masonry-style grid, filtered by series.

#### Hero
- Title: "Silence Between\nThings" (56px, fixed-width 600px)

#### Filter: All | Fog Studies | Urban Silence | Portraits | Romania

#### Gallery Grid (padding: 0 80px, gap: 16px)
```
Row 1 (420px): [  50%  ] [  50%  ]
Row 2 (350px): [ flex ] [ 420px ] [ flex ]
Row 3 (420px): [ 420px ] [     flex     ]
```
All images: mode fill, 1px `$border` stroke

#### Series Note
"Click any image to open lightbox view . Full series descriptions available for members"

---

### 4. Music -- Discography (ID: `0olVw`)

**Purpose:** Music page with album art, tracklist, streaming links.

#### Hero
- Title: "Songs from the\nQuiet Side" (56px, fixed-width 600px)

#### Album Section (gap: 60px)
- Album art: 380x380px, 1px `$border`
- Info: Label ("ALBUM . 2025") + Title ("Nocturnal Echoes", 40px) + Description + Tracklist

**Tracklist:** 7 tracks, each row: horizontal, `space-between`, padding: 12px 0, top border
- Track #: IBM Plex Mono 11px, `$text-muted`
- Title: Inter 13px, `$text-primary`
- Duration: IBM Plex Mono 11px, `$text-muted`

**Stream Links:** Spotify (with play icon) | Bandcamp | SoundCloud -- outlined buttons

#### Embedded Player (120px, `$bg-card`)
Placeholder for Spotify/Bandcamp player embed

---

### 5. Books -- Library (ID: `x2elE`)

**Purpose:** Published works with covers, descriptions, and purchase links.

#### Hero
- Title: "Published Works" (56px)

#### Books Grid (3 columns, gap: 32px)
Each book: Cover image (520px height) + Info (label, title, description, quote, buy/excerpt buttons)

| Book | Type | Year |
|------|------|------|
| Nocturnal Echoes | Poetry Collection | 2025 |
| Cartographies of Breath | Chapbook | 2023 |
| Machines & Mirrors | Anthology | 2024 |

**Buttons:** "Buy Print" (filled `$accent`) + "Read Excerpt" (outlined)

#### Partners: CARTURESTI (Signed Editions) | NEMIRA (Publisher Direct) | LIBRARIE.NET (Free Shipping)

---

### 6. Research -- Papers (ID: `Y5ZaT`)

**Purpose:** Academic papers with abstracts, DOI, and access badges.

#### Hero
- Title: "Papers & Publications" (56px)
- Filters: All | NLP | Attention | Philosophy of AI | Poetics & ML

#### Papers List
Each paper: Tags + Title (Cormorant Garamond 26px) + LockBadge (if gated) + Abstract (Inter 13px) + Meta (DOI + Cite/View PDF links)

| Paper | Tags | Year | Access |
|-------|------|------|--------|
| Neural Architectures and the Poetics of Attention | NLP, ATTENTION | 2025 | PATRON ONLY |
| On Machine Grief: Can Artificial Systems Experience Loss? | PHILOSOPHY OF AI | 2024 | Open |
| Generative Verse: Fine-Tuning Language Models on Poetic Corpora | POETICS & ML, NLP | 2024 | Open |

---

### 7. Essays -- Journal (ID: `khdi9`)

**Purpose:** Long-form essays with thumbnails, excerpts, and newsletter subscription.

#### Hero
- Title: "Notes from the\nObservation Deck" (56px, fixed-width 600px)

#### Essays List
Each essay: Image (280x200px) + Content (tag, title, excerpt, meta), horizontal, gap: 40px

| Essay | Category | Read Time |
|-------|----------|-----------|
| On the Architecture of Longing | AI & PHILOSOPHY | 12 min |
| The Silence Between Languages | POETRY & LANGUAGE | 8 min |
| Seeing Without Looking | PHOTOGRAPHY | 6 min |

#### Newsletter Section: Email input + Subscribe button + "Powered by Substack . RSS feed available"

---

### 8. Membership -- Observatory (ID: `Qz4tR`)

**Purpose:** Subscription pricing page with 4 tiers.

#### Pricing Tiers (4 columns, gap: 20px, padding: 0 60px)

| Tier | Price | CTA Style | Features |
|------|-------|-----------|----------|
| Free | Free | Outlined | Selected poems, Research abstracts, Newsletter |
| Supporter | EUR 5/month | Filled `$accent` | Full poems, Full essays, Selected photography |
| Patron (RECOMMENDED) | EUR 15/month | Filled `$accent`, `$bg-card` fill, `$accent` border | Everything in Supporter + Full research, Deep dives, Early access |
| Inner Circle | EUR 50/month | Outlined | Everything in Patron + Drafts, Quarterly session, Early book access |

Patron card is highlighted: `$bg-card` fill, `$accent` 1px border, "RECOMMENDED" badge

#### Quote Interlude + Donate Section

---

### 9. About -- Biography (ID: `7Mjs0`)

**Purpose:** Biography page with CV, collaborators, and support CTA.

#### Bio Hero (horizontal, gap: 80px)
- Portrait: 420x560px, 1px `$border`
- Intro: Name (52px), subtitle roles, bio text (Inter 15px, lh: 1.8), pull quote

#### Academic CV (2 columns)
Education and research history entries

#### Collaborators & Partners
Grid of collaborator cards (`$bg-card`, cornerRadius: 8)

#### Support Section
"Become a Patron" (filled) + "One-time Donation" (outlined)

---

### 10. Contact (ID: `jEDyZ`)

**Purpose:** Contact form with info and social links.

#### Two-column layout (gap: 120px)
- **Left:** Title ("Get in Touch", 48px), description, email, social links (8 platforms)
- **Right:** Form fields (NAME, EMAIL, MESSAGE) + "Send Message" button (filled `$accent`)

Form inputs: padding 14px 16px, border 1px `$border`
Labels: IBM Plex Mono 10px, 500, `$text-muted`, ls: 2px

---

### 11. Events -- Calendar (ID: `27mw3`)

**Purpose:** Upcoming and past events listing.

#### Hero
- Title: "Readings, Talks &\nConferences" (56px, fixed-width 600px)

#### Upcoming Events
Each: Date block (month + day) + Title (Cormorant Garamond 22px) + Location (Inter 12px) + RSVP button

| Event | Date | Location |
|-------|------|----------|
| Poetry & AI: A Live Reading + Conversation | MAR 15 | National Library, Bucharest . 19:00 EET |
| ACL Workshop: Creativity in NLP -- Keynote | APR 08 | Vienna, Austria . Conference |

#### Past Events (opacity: 0.6)
JAN 20, NOV 12, SEP 05 -- same structure but no RSVP

---

## Detail Pages

### Poem -- Detail (ID: `Flwtv`)

- Back link + Meta row (collection, language, date) + Title (52px) + Audio button (pill, cornerRadius: 24)
- Hero image (360px)
- **Poem body** (padding: 0 420px): 4 stanzas (Cormorant Garamond 22px, 300, lh: 1.8, centered)
- **Tip jar:** 3 tip amount buttons
- **Action bar:** Share (X, Facebook, Copy Link) | Previous/Next poem
- Partner callout + Related poems (3-column grid)

### Photo -- Detail (ID: `RqPDQ`)

- Top bar: Back + navigation counter ("3 / 24")
- Image frame (780px, black background)
- Meta: Title (32px) + description + EXIF data sidebar (280px) + access badge

### Essay -- Detail (ID: `GlrQ4`)

- Hero image (480px) with gradient overlay, title (44px), meta row
- **Two-column body:** Sidebar TOC (200px) + Main content (Inter 16px, lh: 1.8)
- H2 headings: Cormorant Garamond 28px
- Pull quotes: left border 2px `$accent-dim`
- Tags + share row + related essays (3 columns)

### Book -- Detail (ID: `qE5KQ`)

- Hero: Cover (420px wide) + Info column (title 52px, price, buy/preview buttons)
- TOC card + Excerpt section + Specs sidebar (340px) + Shipping info
- Related books (3 columns)

### Music -- Detail (ID: `Kb7hW`)

- Hero: Cover (340x340, cornerRadius: 8) + Album info (title 42px, weight 600)
- Tracklist table: 8 tracks, active track highlighted (`$bg-elevated`, `$gold` text)
- Credits + streaming links (Spotify, Apple Music, Bandcamp)

### Research -- Detail (ID: `UFbIG`)

- Hero: Title (36px, 600), tags (pills), Download PDF (`$gold`) + Cite buttons
- **Two-column:** Main (abstract card + content) + Sidebar (280px: TOC, citation, related)

### Event -- Detail (ID: `jpiq0`)

- Hero image (360px) with gradient, label (`$gold`), title (40px)
- **Two-column:** Main (description + programme card) + Sidebar (300px: date/time, share)

### Photography -- Series Detail (ID: `Io3k3`)

- Hero image (500px) with gradient, title (52px, `$warm-ivory`), stats
- Photo grid: 2 rows of 3 images (300px tall, gap: 16px)
- Artist's note section

### Shop Product -- Detail (ID: `Lm5NB`)

- Product image (500x500, cornerRadius: 8) + Info (title 38px, price 32px `$gold`)
- Quantity selector + "Add to Cart" button (`$gold` fill, cornerRadius: 6)
- Related products (3 columns)

---

## Gated Content Pages

All follow a consistent pattern:

1. Nav bar
2. Content preview with progressive opacity fade (1.0 -> 0.3 -> 0.12)
3. Gate overlay with gradient (transparent -> `$bg`)
4. Lock icon (lucide "lock", 32px) + message + literary quote
5. Dual CTA: "Become a Patron" (filled `$accent`) + "Already a member? Sign in" (outlined)
6. Footer

### Gated Screens

| Screen | ID | Content Type |
|--------|-----|-------------|
| Non-Member View (Poetry) | `gbcrS` | Poem with stanza preview |
| Gated Photography | `cG2se` | Photo with blurred/dimmed image + lock overlay |
| Gated Essay | `CsSUl` | Essay with paragraph preview |
| Gated Music | `Il5pT` | Album with partial tracklist |
| Gated Research | `ai5OL` | Paper with abstract preview |
| Gated Book | `MXHrs` | Book chapter preview |

---

## Auth & User Pages

### Login / Sign Up (ID: `76GVs`)

**Layout:** Split panel (1440x900)
- **Left panel** (fill_container): Logo + form
  - Title: "Welcome back, wanderer" (Cormorant Garamond 36px)
  - Form: Email + Password inputs + "Forgot password?" link
  - Divider with "or"
  - Google Sign-In button (outlined, 44px height)
  - Sign-up link: "Don't have an account? Join the Observatory"
- **Right panel** (560px): Atmospheric forest image + literary quote (Saint-Exupery)

### Member -- Account (ID: `e6CJf`)

- Avatar (80x80, initials) + Name + Email + Tier badge
- **Sidebar** (240px): Profile, Membership, Orders, Saved, Settings
- **Main content:** Profile card (form fields) + Membership card (tier, renewal, manage/cancel)

### Patron -- Dashboard (ID: `bnT8n`)

- Welcome message + "Manage Subscription" button
- **4 stat cards:** Exclusive pieces (47), Audio readings (12), Total contributed (EUR 108), Shop discount (10%)
- New for Patrons: 3 content cards
- Reading History: 4 list items

---

## Commerce Pages

### The Scriptorium -- Shop (ID: `wskOX`)

- Title: "Objects of Contemplation" (56px)
- **Category filter:** All (active, filled pill) | Books | Prints | Apparel | Objects | Digital
- Featured product: Large image + info + CTA
- Product grid: 2 rows x 3 columns (image + title + price)

### Checkout -- Cart (ID: `fI3Xe`)

- Title: "The Scriptorium" (42px, `$warm-ivory`)
- **Two-column:** Cart items (fill_container) + Checkout form (400px, `$bg-surface`)
- Cart items: Thumbnail + info + price, with totals
- Form: Shipping (First Name, Last Name, Email, Address) + Payment (card number)
- "PLACE ORDER" button (full width, `$accent`, cornerRadius: 4)
- "Secured by Stripe . Free shipping within EU"

---

## Admin Pages

All admin screens share a consistent layout:
- **Left sidebar** (240px, `$bg-surface`): Logo + 11 nav items (Dashboard, Content, Upload, Membership, Analytics, Newsletter, Scriptorium, Partnerships, Quotes, Settings, Tribe Bio)
- **Main area:** Top bar (title + actions) + content
- Active sidebar item: `$bg-elevated` fill

### Admin -- Dashboard (ID: `5CTRn`)
- 4 KPI stat cards
- Revenue breakdown + Budget charts
- Recent activity + membership/newsletter/shop summaries

### Admin -- Content Management (ID: `RIOcn`)
- Filter tabs: All | Poems | Photos | Essays | Music | Books (active: `$accent` bottom border 2px)
- Table: Title, Type badge, Status badge, Access, Date, Actions
- Pagination

### Admin -- Upload / Editor (ID: `g8azp`)
- Top: Title + type badge + Save Draft / Publish buttons
- **Two-column:** Rich text editor (fill_container) + Metadata sidebar (320px)
- Metadata: Category, Membership tier, Tags, Featured image upload, Audio/media upload, Schedule toggle

### Admin -- Members (ID: `VFplr`)
- 5 summary cards: Total (1,247), Active (847), Supporters (234), Patrons (142), Inner Circle (24)
- Members table: Name, Email, Tier, Status, Joined, Revenue

### Admin -- Analytics (ID: `M5GbG`)
- 5 KPIs: 28.4K views, 8,921 visitors, 4m 32s avg time, 32.1% retention, EUR 3,842 revenue
- Traffic chart + Top pages + Newsletter performance + Shop performance + Content type breakdown + Visitor funnel

---

## Legal Pages

All legal pages share identical structure:
- Hero: "LEGAL" section label + Title (Cormorant Garamond 48px) + date
- Body: padding 0 320px, numbered sections with heading (24px) + body (Inter 14px, lh: 1.7)

| Page | ID | Sections |
|------|-----|----------|
| Terms of Service | `bpEcu` | IP, Membership, Shop, Newsletter, Conduct, Liability, Governing Law |
| Privacy Policy | `LMOUw` | Data Collection, Usage, Cookies, Storage, GDPR Rights, Third-Party, Contact |
| Cookie Policy | `ZftJS` | What Are Cookies, Types, Third-Party, Managing, Retention, Updates, Contact |

---

## Email Template

### Newsletter -- Email Template (ID: `BGTiC`)

**Width:** 640px (email-compatible)
**Background:** `#101828`
**Uses hardcoded hex values** (no CSS variables for email compatibility)

Sections:
1. Header: Logo + issue label ("TRANSMISSION NO. 24 . MARCH 2026")
2. Hero image (240px)
3. Intro: Greeting (Cormorant Garamond 24px italic) + body
4. New Poem section: Title + excerpt + "Read Full Poem" CTA
5. Photo section: Image + caption
6. Research note: Title + description + link
7. Event section: Date + event info (`#182038` background)
8. Footer: Thank you + Website/Substack/Unsubscribe links + legal text

---

## Responsive Strategy

The design is at 1440px desktop width. Recommended breakpoints:

| Breakpoint | Width | Key Changes |
|-----------|-------|-------------|
| Desktop | >= 1280px | Full design as specified |
| Tablet | 768-1279px | 2-column grids become single, reduce padding to 40px |
| Mobile | < 768px | Single column, hamburger nav, padding 20-24px |

### Mobile Adaptations
- **Nav:** Hamburger menu (8 links + lang toggle + CTA collapse into mobile drawer)
- **Hero:** Reduce title size to 36-42px, reduce fixed-width constraints
- **Grids:** All multi-column grids stack vertically
- **Gallery:** Single column or 2-column on tablet
- **About section:** Portrait + bio stack vertically
- **Footer:** Columns stack vertically
- **Admin:** Sidebar becomes top drawer/hamburger
- **Padding:** 80px -> 20-24px horizontal, 80px -> 40px vertical

---

## i18n Strategy

### Configuration
- **Default locale:** `ro` (Romanian)
- **Supported locales:** `ro`, `en`
- **URL structure:** `/ro/poetry`, `/en/poetry` (or `/poetry` for default Romanian)

### Translation Scope
- **UI strings:** All navigation, buttons, labels, section titles, footer text
- **Content:** Poems (some have both RO + EN versions), essays, descriptions
- **Legal pages:** Full translation needed
- **Admin panel:** English only (internal tool)

### Content Translation Model
- Each content item has `locale` field (en, ro, or both)
- Poetry can exist in both languages (separate entries linked)
- "EN / RO" toggle in nav switches UI language
- Content filtering by language available on listing pages

---

## Data Model (Conceptual)

### Content Types
- **Poem:** title, body, collection, language, audio_url, access_tier, featured
- **Photo:** title, image_url, series, exif_data, description, access_tier
- **PhotoSeries:** name, description, cover_image, photo_count
- **Essay:** title, body, category, read_time, thumbnail, access_tier, medium_url, substack_url
- **Book:** title, description, cover_image, year, type (collection/chapbook/anthology), price, quotes
- **Album:** title, description, cover_image, year, track_count, duration
- **Track:** title, duration, album_id, order, audio_url, access_tier
- **ResearchPaper:** title, abstract, body, tags[], doi, year, access_tier
- **Event:** title, description, location, date, type (reading/talk/conference), is_upcoming, rsvp_url

### Users & Membership
- **User:** email, name, avatar, bio, locale_preference
- **Membership:** user_id, tier (free/supporter/patron/inner_circle), stripe_id, patreon_id, status, started_at
- **Access tiers:** free, supporter, patron, inner_circle

### Commerce
- **Product:** title, description, image, price, type (physical/digital), category, stock
- **Order:** user_id, items[], shipping_address, status, stripe_payment_id
- **OrderItem:** product_id, quantity, price

### Other
- **Newsletter:** Substack integration + internal subscriber list
- **Partner:** name, logo, type, url
- **Quote:** text, attribution, location (used in interludes)
