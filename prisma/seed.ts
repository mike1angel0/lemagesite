import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ──────────────────────────────────────────────
  // Poems
  // ──────────────────────────────────────────────
  const poems = await Promise.all([
    prisma.poem.upsert({
      where: { slug: "the-cartographers-of-silence" },
      update: {},
      create: {
        title: "The Cartographers of Silence",
        titleRo: "Cartografii Tacerii",
        slug: "the-cartographers-of-silence",
        body: "We drew maps of what could not be spoken,\ntraced borders around the breath we held\nlike contraband. Every atlas begins\nwith a lie: that the world can be flattened\ninto something you can fold and carry\nin your coat pocket, next to the warmth\nof your body.",
        bodyRo: "Am desenat harti ale lucrurilor nespuse,\nam trasat granite in jurul respiratiei retinute\nca pe o marfa de contrabanda.",
        collection: "Cartographies of Breath",
        language: "en",
        accessTier: "FREE",
        featured: true,
        excerpt: "We drew maps of what could not be spoken...",
        publishedAt: new Date("2024-03-15"),
      },
    }),
    prisma.poem.upsert({
      where: { slug: "neural-lullaby" },
      update: {},
      create: {
        title: "Neural Lullaby",
        titleRo: "Cantec de Leagan Neural",
        slug: "neural-lullaby",
        body: "The machine hums a frequency\nmy grandmother once knew,\na song about forgetting\nthat remembers everything.\nEach weight adjusted, each gradient\ndescending toward a dream\nwe never programmed.",
        bodyRo: "Masina fredoneaza o frecventa\npe care bunica mea o stia candva.",
        collection: "Machines & Mirrors",
        language: "en",
        accessTier: "FREE",
        featured: true,
        excerpt: "The machine hums a frequency my grandmother once knew...",
        publishedAt: new Date("2024-06-01"),
      },
    }),
    prisma.poem.upsert({
      where: { slug: "scrisoare-catre-nimeni" },
      update: {},
      create: {
        title: "Scrisoare catre nimeni",
        titleRo: "Scrisoare catre nimeni",
        slug: "scrisoare-catre-nimeni",
        body: "Iti scriu din locul unde cuvintele\nse opresc la marginea lucrurilor.\nAici, tacerea are greutate,\nse aseaza pe umeri ca zapada\npe crengile unui copac batran.",
        collection: "Nocturnal Echoes",
        language: "ro",
        accessTier: "SUPPORTER",
        featured: false,
        excerpt: "Iti scriu din locul unde cuvintele se opresc...",
        publishedAt: new Date("2024-01-20"),
      },
    }),
    prisma.poem.upsert({
      where: { slug: "attention-is-all-you-need-to-grieve" },
      update: {},
      create: {
        title: "Attention Is All You Need (To Grieve)",
        slug: "attention-is-all-you-need-to-grieve",
        body: "The transformer attends to every token\nof your absence. Multi-headed, it looks\nin all directions at once, weighing\nwhat matters against what merely\noccurred. Query: where did you go?\nKey: nowhere. Value: everywhere.",
        collection: "Machines & Mirrors",
        language: "en",
        accessTier: "PATRON",
        featured: true,
        excerpt: "The transformer attends to every token of your absence...",
        publishedAt: new Date("2024-09-10"),
      },
    }),
    prisma.poem.upsert({
      where: { slug: "selenarium-notes-december" },
      update: {},
      create: {
        title: "Selenarium Notes, December",
        titleRo: "Insemnari din Observator, Decembrie",
        slug: "selenarium-notes-december",
        body: "Tonight the telescope finds nothing\nbut the space between stars,\nwhich is to say: everything.\nI write this down in a notebook\nno one will read, and that\nis the purest form of publishing.",
        bodyRo: "In noaptea aceasta telescopul nu gaseste nimic\nin afara spatiului dintre stele.",
        collection: "Cartographies of Breath",
        language: "en",
        accessTier: "FREE",
        featured: false,
        excerpt: "Tonight the telescope finds nothing but the space between stars...",
        publishedAt: new Date("2024-12-01"),
      },
    }),
  ]);
  console.log(`Seeded ${poems.length} poems`);

  // ──────────────────────────────────────────────
  // Essays
  // ──────────────────────────────────────────────
  const essays = await Promise.all([
    prisma.essay.upsert({
      where: { slug: "on-the-architecture-of-longing" },
      update: {},
      create: {
        title: "On the Architecture of Longing",
        titleRo: "Despre Arhitectura Dorului",
        slug: "on-the-architecture-of-longing",
        body: "Longing is not a feeling but a structure. It has load-bearing walls and rooms you cannot enter. It has windows that face in only one direction: backward. In Romanian, the word 'dor' carries a weight that 'longing' cannot. It is homesickness for a place that may not exist, a person who may not remember you, a time that never quite was.\n\nI have spent years trying to build a language that can hold this architecture without collapsing under its own weight...",
        bodyRo: "Dorul nu este un sentiment, ci o structura. Are pereti portanti si camere in care nu poti intra...",
        category: "Language & Identity",
        readTime: 12,
        excerpt: "Longing is not a feeling but a structure. It has load-bearing walls and rooms you cannot enter.",
        accessTier: "FREE",
        substackUrl: "https://substack.com",
        publishedAt: new Date("2024-04-20"),
      },
    }),
    prisma.essay.upsert({
      where: { slug: "the-silence-between-languages" },
      update: {},
      create: {
        title: "The Silence Between Languages",
        titleRo: "Tacerea Dintre Limbi",
        slug: "the-silence-between-languages",
        body: "Between my Romanian and my English there is a silence that belongs to neither language. It is the pause where translation fails, where meaning slips through the gap like water between cupped hands. This silence is not empty. It is full of everything I cannot say in either tongue.\n\nWhen I write poetry, I write into this silence...",
        bodyRo: "Intre romana mea si engleza mea exista o tacere care nu apartine niciunei limbi...",
        category: "Language & Identity",
        readTime: 8,
        excerpt: "Between my Romanian and my English there is a silence that belongs to neither language.",
        accessTier: "FREE",
        publishedAt: new Date("2024-07-15"),
      },
    }),
    prisma.essay.upsert({
      where: { slug: "seeing-without-looking" },
      update: {},
      create: {
        title: "Seeing Without Looking",
        titleRo: "A Vedea Fara a Privi",
        slug: "seeing-without-looking",
        body: "Photography taught me that the most important thing in a frame is what you leave out. The edge of the photograph is a decision, a small act of violence against the continuity of the world. You choose this, not that. Here, not there.\n\nThe same is true of poetry...",
        bodyRo: "Fotografia m-a invatat ca lucrul cel mai important dintr-un cadru este ceea ce lasi afara...",
        category: "Photography & Poetics",
        readTime: 10,
        excerpt: "Photography taught me that the most important thing in a frame is what you leave out.",
        accessTier: "SUPPORTER",
        publishedAt: new Date("2024-10-05"),
      },
    }),
  ]);
  console.log(`Seeded ${essays.length} essays`);

  // ──────────────────────────────────────────────
  // Books
  // ──────────────────────────────────────────────
  const books = await Promise.all([
    prisma.book.upsert({
      where: { slug: "nocturnal-echoes" },
      update: {},
      create: {
        title: "Nocturnal Echoes",
        slug: "nocturnal-echoes",
        description: "A bilingual collection of poems exploring the liminal spaces between wakefulness and dream, memory and forgetting. Written across Bucharest, Berlin, and San Francisco, these poems inhabit the hours when the world grows quiet enough to hear what the day drowns out.",
        year: 2022,
        type: "Poetry Collection",
        price: 18.0,
        buyUrl: "https://nemira.ro",
        publishedAt: new Date("2022-09-01"),
      },
    }),
    prisma.book.upsert({
      where: { slug: "cartographies-of-breath" },
      update: {},
      create: {
        title: "Cartographies of Breath",
        slug: "cartographies-of-breath",
        description: "Mapping the territories where language meets the body, where breath becomes word, and where silence speaks louder than any poem. This collection traces journeys across borders both physical and linguistic.",
        year: 2024,
        type: "Poetry Collection",
        price: 22.0,
        buyUrl: "https://nemira.ro",
        publishedAt: new Date("2024-03-01"),
      },
    }),
    prisma.book.upsert({
      where: { slug: "machines-and-mirrors" },
      update: {},
      create: {
        title: "Machines & Mirrors",
        slug: "machines-and-mirrors",
        description: "At the intersection of artificial intelligence and human consciousness, these poems explore what it means to create, to remember, and to grieve in an age of neural networks. Part love letter to technology, part elegy for what we lose in translation between human and machine.",
        year: 2025,
        type: "Poetry Collection",
        price: 24.0,
        buyUrl: "https://nemira.ro",
        publishedAt: new Date("2025-01-15"),
      },
    }),
  ]);
  console.log(`Seeded ${books.length} books`);

  // ──────────────────────────────────────────────
  // Album & Tracks
  // ──────────────────────────────────────────────
  const album = await prisma.album.upsert({
    where: { slug: "nocturnal-echoes-album" },
    update: {},
    create: {
      title: "Nocturnal Echoes",
      slug: "nocturnal-echoes-album",
      description: "A spoken word album weaving poetry with ambient electronic soundscapes. Each track is a poem from the collection, reimagined as an auditory experience.",
      year: 2023,
      trackCount: 7,
      duration: "42:15",
      spotifyUrl: "https://spotify.com",
      bandcampUrl: "https://bandcamp.com",
    },
  });

  const trackData = [
    { title: "Overture: The Weight of Echoes", duration: "5:32", order: 1, accessTier: "FREE" as const },
    { title: "Cartographers of Silence", duration: "6:18", order: 2, accessTier: "FREE" as const },
    { title: "Scrisoare catre nimeni", duration: "5:45", order: 3, accessTier: "SUPPORTER" as const },
    { title: "Neural Lullaby", duration: "7:01", order: 4, accessTier: "SUPPORTER" as const },
    { title: "The Space Between Stars", duration: "6:22", order: 5, accessTier: "PATRON" as const },
    { title: "Dor (Interlude)", duration: "3:48", order: 6, accessTier: "FREE" as const },
    { title: "Selenarium Notes, December", duration: "7:29", order: 7, accessTier: "INNER_CIRCLE" as const },
  ];

  // Delete existing tracks for this album before re-creating
  await prisma.track.deleteMany({ where: { albumId: album.id } });
  for (const track of trackData) {
    await prisma.track.create({
      data: {
        title: track.title,
        duration: track.duration,
        order: track.order,
        accessTier: track.accessTier,
        albumId: album.id,
      },
    });
  }
  console.log(`Seeded album with ${trackData.length} tracks`);

  // ──────────────────────────────────────────────
  // Research Papers
  // ──────────────────────────────────────────────
  const papers = await Promise.all([
    prisma.researchPaper.upsert({
      where: { slug: "neural-architectures-poetics-attention" },
      update: {},
      create: {
        title: "Neural Architectures and the Poetics of Attention",
        slug: "neural-architectures-poetics-attention",
        abstract: "This paper examines the structural parallels between transformer-based attention mechanisms and the cognitive processes underlying poetic attention. We argue that the multi-headed attention paradigm offers a computational metaphor for how poets simultaneously attend to sound, meaning, and form. Through analysis of both neural network architectures and close readings of contemporary poetry, we propose a framework for understanding creative attention as a form of weighted relevance.",
        tags: ["AI", "Poetry", "Attention Mechanisms", "Cognitive Poetics"],
        doi: "10.xxxx/example.2024.001",
        year: 2024,
        accessTier: "FREE",
        publishedAt: new Date("2024-05-01"),
      },
    }),
    prisma.researchPaper.upsert({
      where: { slug: "on-machine-grief" },
      update: {},
      create: {
        title: "On Machine Grief: Loss Functions as Elegiac Form",
        slug: "on-machine-grief",
        abstract: "We explore the conceptual territory between machine learning loss functions and the poetic tradition of elegy. Both seek to minimize a distance: the loss function between prediction and ground truth, the elegy between presence and absence. This interdisciplinary study draws on computational theory, philosophy of mind, and literary criticism to investigate whether artificial systems can model, if not experience, the structure of grief.",
        tags: ["AI", "Elegy", "Loss Functions", "Philosophy of Mind"],
        doi: "10.xxxx/example.2024.002",
        year: 2024,
        accessTier: "SUPPORTER",
        publishedAt: new Date("2024-08-15"),
      },
    }),
    prisma.researchPaper.upsert({
      where: { slug: "generative-verse" },
      update: {},
      create: {
        title: "Generative Verse: Large Language Models and the Future of Poetic Composition",
        slug: "generative-verse",
        abstract: "This paper surveys the current landscape of poetry generation using large language models, examining both the technical capabilities and the aesthetic limitations of these systems. Through a series of experiments comparing LLM-generated verse with human-authored poetry across multiple dimensions (metaphor density, sonic patterning, emotional resonance), we investigate the boundaries of machine creativity and propose new evaluation frameworks for computational poetry.",
        tags: ["LLM", "Poetry Generation", "Computational Creativity", "NLP"],
        doi: "10.xxxx/example.2025.001",
        year: 2025,
        accessTier: "FREE",
        publishedAt: new Date("2025-01-10"),
      },
    }),
  ]);
  console.log(`Seeded ${papers.length} research papers`);

  // ──────────────────────────────────────────────
  // Events
  // ──────────────────────────────────────────────
  const events = await Promise.all([
    prisma.event.upsert({
      where: { slug: "poetry-ai-live-reading" },
      update: {},
      create: {
        title: "Poetry & AI: A Live Reading",
        slug: "poetry-ai-live-reading",
        description: "An evening of poetry at the intersection of language and artificial intelligence. Featuring live readings from Machines & Mirrors, followed by a conversation about creativity in the age of neural networks.",
        location: "MNAC Bucharest",
        date: new Date("2026-05-15T19:00:00Z"),
        type: "Reading",
        isUpcoming: true,
        rsvpUrl: "https://mnac.ro/events",
      },
    }),
    prisma.event.upsert({
      where: { slug: "acl-workshop-2026" },
      update: {},
      create: {
        title: "ACL 2026 Workshop: Computational Poetics",
        slug: "acl-workshop-2026",
        description: "Presenting 'Neural Architectures and the Poetics of Attention' at the ACL 2026 Workshop on Computational Approaches to Linguistic Creativity. The workshop brings together researchers from NLP, cognitive science, and literary studies.",
        location: "Vienna, Austria",
        date: new Date("2026-08-10T09:00:00Z"),
        type: "Conference",
        isUpcoming: true,
      },
    }),
    prisma.event.upsert({
      where: { slug: "nocturnal-echoes-launch" },
      update: {},
      create: {
        title: "Nocturnal Echoes: Book & Album Launch",
        slug: "nocturnal-echoes-launch",
        description: "The launch event for the spoken word album and poetry collection. A night of poetry, music, and conversation at Carturesti Carusel.",
        location: "Carturesti Carusel, Bucharest",
        date: new Date("2023-11-20T18:30:00Z"),
        type: "Launch",
        isUpcoming: false,
      },
    }),
  ]);
  console.log(`Seeded ${events.length} events`);

  // ──────────────────────────────────────────────
  // Partners
  // ──────────────────────────────────────────────
  const partners = await Promise.all([
    prisma.partner.upsert({
      where: { id: "partner-nemira" },
      update: {},
      create: {
        id: "partner-nemira",
        name: "NEMIRA",
        type: "Publisher",
        url: "https://nemira.ro",
      },
    }),
    prisma.partner.upsert({
      where: { id: "partner-carturesti" },
      update: {},
      create: {
        id: "partner-carturesti",
        name: "CARTURESTI",
        type: "Bookstore",
        url: "https://carturesti.ro",
      },
    }),
    prisma.partner.upsert({
      where: { id: "partner-mnac" },
      update: {},
      create: {
        id: "partner-mnac",
        name: "MNAC",
        type: "Cultural Institution",
        url: "https://mnac.ro",
      },
    }),
    prisma.partner.upsert({
      where: { id: "partner-dilema" },
      update: {},
      create: {
        id: "partner-dilema",
        name: "DILEMA VECHE",
        type: "Publication",
        url: "https://dilemaveche.ro",
      },
    }),
    prisma.partner.upsert({
      where: { id: "partner-substack" },
      update: {},
      create: {
        id: "partner-substack",
        name: "SUBSTACK",
        type: "Platform",
        url: "https://substack.com",
      },
    }),
  ]);
  console.log(`Seeded ${partners.length} partners`);

  // ──────────────────────────────────────────────
  // Photo Series & Photos
  // ──────────────────────────────────────────────
  const fogStudies = await prisma.photoSeries.upsert({
    where: { slug: "fog-studies" },
    update: {},
    create: {
      name: "Fog Studies",
      slug: "fog-studies",
      description: "An ongoing exploration of landscapes disappearing into themselves, where the visible dissolves into the atmospheric.",
      coverImage: "/design-exports/9VXDc.png",
      photoCount: 4,
    },
  });

  const urbanSilence = await prisma.photoSeries.upsert({
    where: { slug: "urban-silence" },
    update: {},
    create: {
      name: "Urban Silence",
      slug: "urban-silence",
      description: "Quiet moments in loud cities. The spaces between footsteps, the pauses between trains.",
      coverImage: "/design-exports/Id78B.png",
      photoCount: 3,
    },
  });

  const photoData = [
    { title: "Morning Ritual, Carpathians", slug: "morning-ritual-carpathians", imageUrl: "/design-exports/9VXDc.png", seriesId: fogStudies.id, description: "Dawn light filtering through mountain fog.", width: 1200, height: 800 },
    { title: "Empty Platform, Gara de Nord", slug: "empty-platform-gara-de-nord", imageUrl: "/design-exports/Id78B.png", seriesId: urbanSilence.id, description: "The silence of an empty train platform at 4 AM.", width: 1200, height: 800 },
    { title: "Self-Portrait with Algorithms", slug: "self-portrait-with-algorithms", imageUrl: "/design-exports/qks6p.png", seriesId: null, description: "A reflection on identity in the age of machine learning.", width: 800, height: 1200 },
    { title: "The Weight of Snow", slug: "the-weight-of-snow", imageUrl: "/design-exports/5gKT7.png", seriesId: fogStudies.id, description: "Snow accumulating on branches in the Carpathian Mountains.", width: 1200, height: 800 },
    { title: "Vienna, 4 AM", slug: "vienna-4-am", imageUrl: "/design-exports/pX7Gr.png", seriesId: urbanSilence.id, description: "A deserted Vienna street in the small hours.", width: 1200, height: 800 },
    { title: "Breath Study No. 7", slug: "breath-study-no-7", imageUrl: "/design-exports/6MHe3.png", seriesId: fogStudies.id, description: "Fog rising from a lake at first light.", width: 800, height: 1200 },
    { title: "The Last Light, Maramures", slug: "the-last-light-maramures", imageUrl: "/design-exports/fCze7.png", seriesId: urbanSilence.id, description: "Golden hour in the villages of Maramures.", width: 1200, height: 800 },
  ];

  const photos = await Promise.all(
    photoData.map((p, i) =>
      prisma.photo.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          title: p.title,
          slug: p.slug,
          imageUrl: p.imageUrl,
          seriesId: p.seriesId,
          description: p.description,
          width: p.width,
          height: p.height,
          accessTier: "FREE",
          publishedAt: new Date(`2024-${String(i + 1).padStart(2, "0")}-15`),
        },
      })
    )
  );
  console.log(`Seeded ${photos.length} photos in 2 series`);

  // ──────────────────────────────────────────────
  // Quotes (for interludes)
  // ──────────────────────────────────────────────
  // Clear and re-create quotes (no unique field to upsert on)
  await prisma.quote.deleteMany({});
  const quotes = await Promise.all([
    prisma.quote.create({
      data: {
        text: "The poem is a machine made of words, but it is a machine that runs on silence.",
        attribution: "LMG, Cartographies of Breath",
        location: "Bucharest",
      },
    }),
    prisma.quote.create({
      data: {
        text: "Between every two languages there is a country that belongs to neither.",
        attribution: "LMG, The Silence Between Languages",
        location: "Berlin",
      },
    }),
    prisma.quote.create({
      data: {
        text: "To attend is to hold the world in weighted relevance. Every poem is an attention mechanism.",
        attribution: "LMG, Neural Architectures and the Poetics of Attention",
        location: "San Francisco",
      },
    }),
  ]);
  console.log(`Seeded ${quotes.length} quotes`);

  // ──────────────────────────────────────────────
  // Products (Shop)
  // ──────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: "nocturnal-echoes-book" },
      update: {},
      create: {
        title: "Nocturnal Echoes - Signed Edition",
        slug: "nocturnal-echoes-book",
        description: "A signed first edition of the bilingual poetry collection. Hardcover, 120 pages.",
        price: 28.0,
        category: "BOOKS",
        stock: 50,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "cartographies-of-breath-book" },
      update: {},
      create: {
        title: "Cartographies of Breath - Signed Edition",
        slug: "cartographies-of-breath-book",
        description: "A signed copy of the latest poetry collection. Hardcover, 96 pages.",
        price: 32.0,
        category: "BOOKS",
        stock: 75,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "selenarium-print-01" },
      update: {},
      create: {
        title: "Selenarium Print No. 1",
        slug: "selenarium-print-01",
        description: "Fine art giclée print on Hahnemühle paper. 30x40cm. Edition of 25.",
        price: 45.0,
        category: "PRINTS",
        stock: 25,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "silence-between-languages-tee" },
      update: {},
      create: {
        title: "The Silence Between Languages Tee",
        slug: "silence-between-languages-tee",
        description: "Organic cotton t-shirt with typographic design. Available in black and white.",
        price: 35.0,
        category: "APPAREL",
        stock: 100,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: "nocturnal-echoes-vinyl" },
      update: {},
      create: {
        title: "Nocturnal Echoes - Vinyl LP",
        slug: "nocturnal-echoes-vinyl",
        description: "Limited edition vinyl pressing of the spoken word album. 180g vinyl with printed inner sleeve.",
        price: 38.0,
        category: "OBJECTS",
        stock: 200,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "machines-mirrors-ebook" },
      update: {},
      create: {
        title: "Machines & Mirrors - Digital Edition",
        slug: "machines-mirrors-ebook",
        description: "DRM-free digital edition in EPUB and PDF formats. Includes bonus poems and author notes.",
        price: 12.0,
        category: "DIGITAL",
        stock: 9999,
        featured: false,
      },
    }),
  ]);
  console.log(`Seeded ${products.length} products`);

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
