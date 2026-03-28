import { NextRequest } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionTool, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchContent } from "@/lib/data";

// ── Tool definitions ──────────────────────────────────────

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_content",
      description: "List content items (poems, essays, photos, research) with optional filters",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["poem", "essay", "photo", "research"] },
          status: { type: "string", enum: ["published", "draft", "all"], description: "Filter by publish status. Default: all" },
          limit: { type: "number", description: "Max items to return. Default: 20" },
        },
        required: ["type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_content",
      description: "Get a single content item by slug or ID",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["poem", "essay", "photo", "research"] },
          identifier: { type: "string", description: "The slug or ID of the content" },
        },
        required: ["type", "identifier"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_poem",
      description: "Create a new poem",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          tier: { type: "string", enum: ["FREE", "SUPPORTER", "PATRON", "INNER_CIRCLE"], description: "Default: FREE" },
          collection: { type: "string", description: "Tags/collection name" },
          publish: { type: "boolean", description: "Publish immediately. Default: false" },
        },
        required: ["title", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_essay",
      description: "Create a new essay",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          category: { type: "string" },
          readTime: { type: "number", description: "Estimated read time in minutes" },
          publish: { type: "boolean", description: "Publish immediately. Default: false" },
        },
        required: ["title", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_photo",
      description: "Create a new photo entry",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          imageUrl: { type: "string" },
          description: { type: "string" },
          publish: { type: "boolean", description: "Publish immediately. Default: false" },
        },
        required: ["title", "imageUrl"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "publish_content",
      description: "Publish a draft content item by setting publishedAt to now",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["poem", "essay", "photo", "research"] },
          id: { type: "string" },
        },
        required: ["type", "id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "unpublish_content",
      description: "Unpublish content by setting publishedAt to null",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["poem", "essay", "photo", "research"] },
          id: { type: "string" },
        },
        required: ["type", "id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_content",
      description: "Delete a content item by ID. Always confirm with the user before calling this.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["poem", "essay", "photo", "research"] },
          id: { type: "string" },
        },
        required: ["type", "id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_products",
      description: "List products with optional category filter",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["BOOKS", "PRINTS", "APPAREL", "OBJECTS", "DIGITAL"] },
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_product",
      description: "Create a new product",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          price: { type: "number" },
          category: { type: "string", enum: ["BOOKS", "PRINTS", "APPAREL", "OBJECTS", "DIGITAL"] },
          description: { type: "string" },
          stock: { type: "number", description: "Default: 0" },
        },
        required: ["title", "price", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "Delete a product by ID. Always confirm with the user before calling this.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_content",
      description: "Full-text search across all content types",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_stats",
      description: "Get dashboard statistics: counts of content by type, subscribers, members, orders",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "list_members",
      description: "List site members with optional tier filter",
      parameters: {
        type: "object",
        properties: {
          tier: { type: "string", enum: ["FREE", "SUPPORTER", "PATRON", "INNER_CIRCLE"] },
          limit: { type: "number", description: "Default: 20" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_settings",
      description: "Read site settings (all or by key prefix)",
      parameters: {
        type: "object",
        properties: {
          prefix: { type: "string", description: "Optional key prefix filter" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_settings",
      description: "Update a site setting key-value pair",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string" },
          value: { type: "string" },
        },
        required: ["key", "value"],
      },
    },
  },
];

// ── Slugify ───────────────────────────────────────────────

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Model map ─────────────────────────────────────────────

function getModel(type: string) {
  const map: Record<string, "poem" | "essay" | "photo" | "researchPaper"> = {
    poem: "poem",
    essay: "essay",
    photo: "photo",
    research: "researchPaper",
  };
  return map[type];
}

// ── Tool executor ─────────────────────────────────────────

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "list_content": {
        const model = getModel(args.type as string);
        if (!model) return JSON.stringify({ error: "Invalid type" });
        const limit = (args.limit as number) || 20;
        const status = args.status as string || "all";
        const where: Record<string, unknown> = {};
        if (status === "published") where.publishedAt = { lte: new Date() };
        else if (status === "draft") where.publishedAt = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = await (prisma[model] as any).findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          select: { id: true, title: true, slug: true, publishedAt: true, createdAt: true },
        });
        return JSON.stringify(items);
      }

      case "get_content": {
        const model = getModel(args.type as string);
        if (!model) return JSON.stringify({ error: "Invalid type" });
        const id = args.identifier as string;
        // Try by slug first, then by ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let item = await (prisma[model] as any).findUnique({ where: { slug: id } });
        if (!item) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          item = await (prisma[model] as any).findUnique({ where: { id } });
        }
        return item ? JSON.stringify(item) : JSON.stringify({ error: "Not found" });
      }

      case "create_poem": {
        const title = args.title as string;
        const slug = slugify(title);
        const existing = await prisma.poem.findUnique({ where: { slug } });
        if (existing) return JSON.stringify({ error: "A poem with a similar title already exists" });
        const poem = await prisma.poem.create({
          data: {
            title,
            slug,
            body: args.body as string,
            collection: (args.collection as string) || null,
            accessTier: (args.tier as "FREE" | "SUPPORTER" | "PATRON" | "INNER_CIRCLE") || "FREE",
            publishedAt: args.publish ? new Date() : null,
          },
        });
        return JSON.stringify({ id: poem.id, title: poem.title, slug: poem.slug, status: poem.publishedAt ? "published" : "draft" });
      }

      case "create_essay": {
        const title = args.title as string;
        const slug = slugify(title);
        const existing = await prisma.essay.findUnique({ where: { slug } });
        if (existing) return JSON.stringify({ error: "An essay with a similar title already exists" });
        const essay = await prisma.essay.create({
          data: {
            title,
            slug,
            body: args.body as string,
            category: (args.category as string) || null,
            readTime: (args.readTime as number) || null,
            publishedAt: args.publish ? new Date() : null,
          },
        });
        return JSON.stringify({ id: essay.id, title: essay.title, slug: essay.slug, status: essay.publishedAt ? "published" : "draft" });
      }

      case "create_photo": {
        const title = args.title as string;
        const slug = slugify(title);
        const existing = await prisma.photo.findUnique({ where: { slug } });
        if (existing) return JSON.stringify({ error: "A photo with a similar title already exists" });
        const photo = await prisma.photo.create({
          data: {
            title,
            slug,
            imageUrl: args.imageUrl as string,
            description: (args.description as string) || null,
            publishedAt: args.publish ? new Date() : null,
          },
        });
        return JSON.stringify({ id: photo.id, title: photo.title, slug: photo.slug, status: photo.publishedAt ? "published" : "draft" });
      }

      case "publish_content": {
        const model = getModel(args.type as string);
        if (!model) return JSON.stringify({ error: "Invalid type" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = await (prisma[model] as any).update({
          where: { id: args.id as string },
          data: { publishedAt: new Date() },
        });
        return JSON.stringify({ id: updated.id, title: updated.title, publishedAt: updated.publishedAt });
      }

      case "unpublish_content": {
        const model = getModel(args.type as string);
        if (!model) return JSON.stringify({ error: "Invalid type" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = await (prisma[model] as any).update({
          where: { id: args.id as string },
          data: { publishedAt: null },
        });
        return JSON.stringify({ id: updated.id, title: updated.title, publishedAt: null });
      }

      case "delete_content": {
        const model = getModel(args.type as string);
        if (!model) return JSON.stringify({ error: "Invalid type" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deleted = await (prisma[model] as any).delete({ where: { id: args.id as string } });
        return JSON.stringify({ deleted: true, id: deleted.id, title: deleted.title });
      }

      case "list_products": {
        const where: Record<string, unknown> = {};
        if (args.category) where.category = args.category;
        const products = await prisma.product.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: (args.limit as number) || 20,
          select: { id: true, title: true, slug: true, price: true, category: true, stock: true },
        });
        return JSON.stringify(products);
      }

      case "create_product": {
        const title = args.title as string;
        const slug = slugify(title);
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) return JSON.stringify({ error: "A product with a similar title already exists" });
        const product = await prisma.product.create({
          data: {
            title,
            slug,
            price: args.price as number,
            category: args.category as "BOOKS" | "PRINTS" | "APPAREL" | "OBJECTS" | "DIGITAL",
            description: (args.description as string) || null,
            stock: (args.stock as number) || 0,
          },
        });
        return JSON.stringify({ id: product.id, title: product.title, slug: product.slug });
      }

      case "delete_product": {
        const deleted = await prisma.product.delete({ where: { id: args.id as string } });
        return JSON.stringify({ deleted: true, id: deleted.id, title: deleted.title });
      }

      case "search_content": {
        const results = await searchContent(args.query as string);
        return JSON.stringify(results);
      }

      case "get_stats": {
        const [poems, essays, photos, research, products, subscribers, members, orders] = await Promise.all([
          prisma.poem.count(),
          prisma.essay.count(),
          prisma.photo.count(),
          prisma.researchPaper.count(),
          prisma.product.count(),
          prisma.subscriber.count(),
          prisma.user.count(),
          prisma.order.count(),
        ]);
        const [publishedPoems, publishedEssays, publishedPhotos, publishedResearch] = await Promise.all([
          prisma.poem.count({ where: { publishedAt: { lte: new Date() } } }),
          prisma.essay.count({ where: { publishedAt: { lte: new Date() } } }),
          prisma.photo.count({ where: { publishedAt: { lte: new Date() } } }),
          prisma.researchPaper.count({ where: { publishedAt: { lte: new Date() } } }),
        ]);
        return JSON.stringify({
          poems: { total: poems, published: publishedPoems, drafts: poems - publishedPoems },
          essays: { total: essays, published: publishedEssays, drafts: essays - publishedEssays },
          photos: { total: photos, published: publishedPhotos, drafts: photos - publishedPhotos },
          research: { total: research, published: publishedResearch, drafts: research - publishedResearch },
          products,
          subscribers,
          members,
          orders,
        });
      }

      case "list_members": {
        const where: Record<string, unknown> = {};
        if (args.tier) where.membership = { tier: args.tier };
        const users = await prisma.user.findMany({
          where,
          include: { membership: true },
          orderBy: { createdAt: "desc" },
          take: (args.limit as number) || 20,
        });
        return JSON.stringify(users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          tier: u.membership?.tier || "FREE",
          status: u.membership?.status || "ACTIVE",
          createdAt: u.createdAt,
        })));
      }

      case "get_settings": {
        const where: Record<string, unknown> = {};
        if (args.prefix) where.key = { startsWith: args.prefix as string };
        const settings = await prisma.siteSetting.findMany({ where });
        return JSON.stringify(settings.map(s => ({ key: s.key, value: s.value })));
      }

      case "update_settings": {
        const setting = await prisma.siteSetting.upsert({
          where: { key: args.key as string },
          update: { value: args.value as string },
          create: { key: args.key as string, value: args.value as string },
        });
        return JSON.stringify({ key: setting.key, value: setting.value });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return JSON.stringify({ error: message });
  }
}

// ── System prompt ─────────────────────────────────────────

const SYSTEM_PROMPT = `You are an admin assistant for Selenarium, a creative portfolio and membership site.
You can manage content (poems, essays, photos, research papers), products, members, newsletters, and site settings.

Rules:
- For DELETE operations, always ask the user to confirm before executing. Never delete without confirmation.
- Be concise. When listing items, format them clearly with titles and relevant info.
- The site supports Romanian (default) and English.
- Content has access tiers: FREE, SUPPORTER, PATRON, INNER_CIRCLE.
- Content can be published (has publishedAt date) or draft (publishedAt is null).
- When creating content, it's saved as a draft unless the user explicitly asks to publish it.`;

// ── POST handler ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const { messages } = await req.json() as { messages: ChatCompletionMessageParam[] };

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const allMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  // Loop to handle tool calls (max 5 rounds)
  for (let round = 0; round < 5; round++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: allMessages,
      tools,
      stream: true,
    });

    // Collect the streamed response
    let toolCalls: { id: string; function: { name: string; arguments: string } }[] = [];
    let contentChunks: string[] = [];
    let finishReason = "";

    const encoder = new TextEncoder();

    // If this is the final response (no tool calls), stream it to the client
    // We need to check: collect first, then decide
    const chunks: OpenAI.Chat.Completions.ChatCompletionChunk[] = [];
    for await (const chunk of response) {
      chunks.push(chunk);
    }

    // Parse all chunks
    for (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) contentChunks.push(delta.content);
      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (tc.index !== undefined) {
            while (toolCalls.length <= tc.index) {
              toolCalls.push({ id: "", function: { name: "", arguments: "" } });
            }
            if (tc.id) toolCalls[tc.index].id = tc.id;
            if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
            if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
          }
        }
      }
      if (chunk.choices[0]?.finish_reason) finishReason = chunk.choices[0].finish_reason;
    }

    // If no tool calls, stream the content back
    if (finishReason !== "tool_calls" || toolCalls.length === 0) {
      const fullContent = contentChunks.join("");
      const stream = new ReadableStream({
        start(controller) {
          // Send as SSE
          const lines = fullContent.split("");
          // Stream word-by-word for a nice effect
          const words = fullContent.split(/(?<=\s)/);
          for (const word of words) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
      });
    }

    // Execute tool calls
    allMessages.push({
      role: "assistant",
      content: contentChunks.join("") || null,
      tool_calls: toolCalls.map(tc => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.function.name, arguments: tc.function.arguments },
      })),
    });

    for (const tc of toolCalls) {
      const args = JSON.parse(tc.function.arguments);
      const result = await executeTool(tc.function.name, args);

      // Stream tool execution info
      allMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }

    // Continue loop to get GPT's response after tool execution
  }

  // Fallback: if we hit max rounds
  return new Response(
    JSON.stringify({ error: "Too many tool call rounds" }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
