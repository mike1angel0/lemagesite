const TIER_RANK: Record<string, number> = {
  FREE: 0,
  SUPPORTER: 1,
  PATRON: 2,
  INNER_CIRCLE: 3,
};

export function hasAccess(userTier: string | undefined, contentTier: string): boolean {
  return (TIER_RANK[userTier ?? "FREE"] ?? 0) >= (TIER_RANK[contentTier] ?? 0);
}
