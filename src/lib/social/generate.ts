import OpenAI from "openai";
import {
  PLATFORM_SPECS,
  CONTENT_TYPE_PLATFORMS,
  DEFAULT_PLATFORMS,
  CONTENT_TYPE_CONTEXT,
  type PlatformKey,
} from "./constants";

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

interface GenerateInput {
  url: string;
  content?: string | null;
  contentType?: string | null;
  platform?: string | null;
}

export async function generateRepostTexts(
  sources: GenerateInput[]
): Promise<Map<string, Record<PlatformKey, string>>> {
  const client = getClient();

  const results = new Map<string, Record<PlatformKey, string>>();

  // Process in chunks to keep prompt sizes manageable
  const chunkSize = 5;
  for (let i = 0; i < sources.length; i += chunkSize) {
    const chunk = sources.slice(i, i + chunkSize);

    const sourcesPrompt = chunk
      .map((s, idx) => {
        // If source is from a social platform, only target that platform
        const platforms = s.platform
          ? [s.platform as PlatformKey]
          : s.contentType
            ? CONTENT_TYPE_PLATFORMS[s.contentType] || DEFAULT_PLATFORMS
            : DEFAULT_PLATFORMS;
        const context = s.contentType
          ? CONTENT_TYPE_CONTEXT[s.contentType] || ""
          : "";

        const platformSpecs = platforms
          .map((p) => {
            const spec = PLATFORM_SPECS[p];
            const action = "action" in spec && spec.action === "comment" ? "COMMENT on the post" : "REPOST/SHARE";
            return `  - ${p}: max ${spec.charLimit} chars, tone: ${spec.tone}, hashtags: ${spec.hashtagRules}, action: ${action}`;
          })
          .join("\n");

        const isRepost = !!s.platform;
        return `Source ${idx + 1}:
URL: ${s.url}
Content: ${s.content || "(no content provided — generate based on URL context)"}
${context ? `Context: ${context}` : ""}
${isRepost ? `Type: REPOST — this is a post from ${s.platform}. Generate SHORT commentary text to accompany the original URL (like a quote-tweet). Do NOT include the URL in the text — it will be appended automatically. Keep it brief and personal.` : ""}
Target platforms:
${platformSpecs}`;
      })
      .join("\n\n---\n\n");

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are Mihai Gavrilescu — a poet, photographer, and researcher. You write your own social media posts in first person.

Your goal: generate text that gets likes, comments, and engagement. Every word must earn its place.

Rules:
- RESPECT the character limit for each platform — never exceed it
- Match the tone and length specified for each platform
- Check the "action" for each platform:
  - REPOST/SHARE: write commentary to accompany a share/quote of the original content. Be personal — share why this matters to you, what it made you think/feel, or add your unique perspective.
  - COMMENT: write a comment to post ON the original post. Be genuine, conversational, add value. React to the specific content, not generic praise.
- For REPOST sources: generate ONLY the commentary text. Do NOT include the URL — it will be appended automatically.
- For COMMENT action: write as if replying to the post — specific, authentic, no hashtags
- For Facebook and LinkedIn: be MORE detailed and expressive. Tell a mini-story, share context, make people want to read more. These platforms reward longer, richer posts.
- For Twitter: be concise and punchy. Every character counts.
- NO generic filler ("Check this out!", "Amazing post!", "So inspiring!")
- NO salesy language — you're an artist, not a marketer
- Write like a real person, not a social media manager
- Hashtags: follow each platform's rules, never force them
- LANGUAGE: If the source content is in Romanian, write the text in Romanian. Default language is English.

Return JSON in this exact format:
{
  "sources": [
    {
      "url": "the source url",
      "platforms": {
        "PLATFORM_NAME": "the generated text"
      }
    }
  ]
}`,
        },
        {
          role: "user",
          content: sourcesPrompt,
        },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) continue;

    try {
      const parsed = JSON.parse(text);
      for (const source of parsed.sources) {
        const platforms: Record<string, string> = {};
        for (const [platform, t] of Object.entries(source.platforms)) {
          platforms[platform as PlatformKey] = t as string;
        }
        results.set(source.url, platforms as Record<PlatformKey, string>);
      }
    } catch {
      console.error("Failed to parse OpenAI response:", text);
    }
  }

  return results;
}

export async function regenerateSingleRepost(
  platform: PlatformKey,
  sourceUrl: string,
  sourceContent: string | null,
  sourcePlatform: string | null,
  currentText: string
): Promise<string> {
  const client = getClient();
  const spec = PLATFORM_SPECS[platform];
  const action = "action" in spec && spec.action === "comment" ? "COMMENT on the post" : "REPOST/SHARE";
  const isRepost = !!sourcePlatform;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are Mihai Gavrilescu — a poet, photographer, and researcher. Generate a DIFFERENT version of social media text for ${spec.name}.

Platform: ${platform}, max ${spec.charLimit} chars, tone: ${spec.tone}, hashtags: ${spec.hashtagRules}, action: ${action}

Rules:
- Must be COMPLETELY different from the previous version — different angle, different words, different structure
- ${action === "COMMENT on the post" ? "Write a genuine comment to post ON the original post. Be specific to the content, conversational, no hashtags." : "Write commentary to accompany a share/repost. Be personal — share why this matters to you."}
- ${isRepost ? "Do NOT include the URL — it will be appended automatically." : "Include the source URL in the text."}
- ${platform === "FACEBOOK" || platform === "LINKEDIN" ? "Be detailed and expressive. Tell a mini-story, share context." : "Be concise and punchy."}
- NO generic filler, NO salesy language
- Write like a real person, not a social media manager
- MUST respect the ${spec.charLimit} character limit
- LANGUAGE: If the source content is in Romanian, write in Romanian. Default is English.

Return ONLY the text, nothing else.`,
      },
      {
        role: "user",
        content: `Source URL: ${sourceUrl}
Content: ${sourceContent || "(generate based on URL context)"}
Previous version (generate something DIFFERENT): ${currentText}`,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || currentText;
}
