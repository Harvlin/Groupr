/**
 * Central member color palette for consistent per-member coloring across the app.
 * Used in: contribution bars, avatar stacks, category matrices, activity timelines.
 */
export const MEMBER_COLOR_PALETTE = [
  '#9FE870', // lime   — member 0 / self
  '#0097C7', // blue   — member 1
  '#B8860B', // gold   — member 2
  '#E85D75', // coral  — member 3
] as const;

export type MemberColor = (typeof MEMBER_COLOR_PALETTE)[number];

/**
 * Returns a consistent color for a given member index.
 * Wraps around if there are more than 4 members.
 */
export function getMemberColor(memberIndex: number): string {
  return MEMBER_COLOR_PALETTE[memberIndex % MEMBER_COLOR_PALETTE.length];
}
