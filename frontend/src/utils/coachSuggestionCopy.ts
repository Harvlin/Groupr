/**
 * Generates structurally varied suggestion copy for Coach Mode cards.
 *
 * Template selection is deterministic (not random) — urgency scales with the gap:
 *   Score < 15%  → Template A: urgent, direct, open task is named explicitly
 *   15–25%       → Template B: soft framing, gap category as unclaimed territory
 *   ≥ 25%        → Template C: light-touch nudge, optional tone
 */

export interface SuggestionCopyParams {
  name: string;
  score: number;
  dominantCategory: string;
  gapCategory: string;
  specificTask: string;
  days: number;
}

export function getSuggestionCopy({
  name,
  score,
  dominantCategory,
  gapCategory,
  specificTask,
  days,
}: SuggestionCopyParams): string {
  const daysLabel = days === 1 ? '1 day' : `${days} days`;

  if (score < 15) {
    // Template A — urgent, bigger gap, name the open task clearly
    return (
      `${name} has contributed ${score}% so far, concentrated in ${dominantCategory}. ` +
      `${specificTask} is still open — with ${daysLabel} left, that's a natural next step.`
    );
  }

  if (score < 25) {
    // Template B — moderate gap, soft framing, gap category as unclaimed territory
    return (
      `${name}'s work has focused on ${dominantCategory} (${score}%). ` +
      `The ${gapCategory} side of the project doesn't have an owner yet — ${name} could pick up ${specificTask}.`
    );
  }

  // Template C — member is contributing steadily, lighter-touch check-in
  return (
    `${name} is contributing steadily in ${dominantCategory}. ` +
    `Worth checking whether they'd like to take on ${specificTask} before the deadline.`
  );
}
