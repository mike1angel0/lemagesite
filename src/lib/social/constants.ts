export const PLATFORM_SPECS = {
  TWITTER: {
    charLimit: 280,
    tone: "concise, punchy, thought-provoking — make people stop scrolling",
    hashtagRules: "1-2 hashtags max, only if they add value",
    name: "Twitter/X",
  },
  FACEBOOK: {
    charLimit: 1000,
    tone: "warm, storytelling, relatable — write like talking to a friend, be detailed and expressive",
    hashtagRules: "2-3 hashtags at end, keep it natural",
    name: "Facebook",
  },
  LINKEDIN: {
    charLimit: 1300,
    tone: "insightful, professional but human — share a perspective or lesson, be detailed and thought-provoking",
    hashtagRules: "3-5 industry hashtags at end",
    name: "LinkedIn",
  },
  INSTAGRAM: {
    charLimit: 500,
    tone: "genuine, enthusiastic, conversational — comment like a real person, not a brand",
    hashtagRules: "no hashtags in comments",
    name: "Instagram",
    action: "comment",
  },
  TIKTOK: {
    charLimit: 150,
    tone: "casual, witty, short — comment like a real person",
    hashtagRules: "no hashtags in comments",
    name: "TikTok",
    action: "comment",
  },
} as const;

export type PlatformKey = keyof typeof PLATFORM_SPECS;

// Content type → target platforms mapping
export const CONTENT_TYPE_PLATFORMS: Record<string, PlatformKey[]> = {
  POEM: ["TWITTER", "INSTAGRAM", "TIKTOK", "FACEBOOK"],
  PHOTO: ["INSTAGRAM", "TWITTER", "FACEBOOK"],
  ESSAY: ["TWITTER", "LINKEDIN", "FACEBOOK"],
  RESEARCH: ["TWITTER", "LINKEDIN", "FACEBOOK"],
  BOOK: ["TWITTER", "INSTAGRAM", "LINKEDIN", "FACEBOOK"],
  EVENT: ["TWITTER", "FACEBOOK", "INSTAGRAM"],
};

// Default platforms when content type is unknown
export const DEFAULT_PLATFORMS: PlatformKey[] = ["TWITTER", "FACEBOOK"];

export const CONTENT_TYPE_CONTEXT: Record<string, string> = {
  POEM: "This is a poem. The tone should be artistic, emotional, and evocative. Use metaphorical language.",
  PHOTO: "This is a photograph. Focus on visual storytelling and the emotion/mood of the image.",
  ESSAY: "This is an essay or article. The tone should be intellectual yet accessible, inviting discussion.",
  RESEARCH: "This is a research paper. Make it accessible to a general audience while respecting the academic nature.",
  BOOK: "This is a book. Highlight key themes, quotes, and what makes it compelling.",
  EVENT: "This is an event. Create excitement and urgency. Include key details like date/location if available.",
};

export const DEFAULT_BATCH_SIZE = 50;
