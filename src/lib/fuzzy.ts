/**
 * Tiny fuzzy matcher. Subsequence match with scoring that rewards
 * consecutive characters, word-boundary hits, and early matches.
 * Returns null when there is no match.
 */
export function fuzzyScore(query: string, target: string): number | null {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  let score = 0;
  let qi = 0;
  let prevMatchIdx = -2;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      let bonus = 1;
      if (ti === prevMatchIdx + 1) bonus += 4; // consecutive
      if (ti === 0 || /[\s/\-_.]/.test(t[ti - 1])) bonus += 3; // word boundary
      if (ti < 8) bonus += 1; // early in string
      score += bonus;
      prevMatchIdx = ti;
      qi++;
    }
  }

  if (qi < q.length) return null;
  // Prefer shorter targets when scores tie.
  return score - t.length * 0.01;
}

export function fuzzyFilter<T>(
  query: string,
  items: T[],
  getText: (item: T) => string
): T[] {
  if (!query.trim()) return items;
  const scored: { item: T; score: number }[] = [];
  for (const item of items) {
    const score = fuzzyScore(query, getText(item));
    if (score !== null) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}
