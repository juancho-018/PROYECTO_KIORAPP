/**
 * Simple Levenshtein distance based string similarity
 */
export function getLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function getSimilarity(s1: string, s2: string): number {
  let longer = s1.toLowerCase();
  let shorter = s2.toLowerCase();
  if (s1.length < s2.length) {
    longer = s2.toLowerCase();
    shorter = s1.toLowerCase();
  }
  const statusLength = longer.length;
  if (statusLength === 0) {
    return 1.0;
  }
  return (statusLength - getLevenshteinDistance(longer, shorter)) / statusLength;
}

export function findSuggestions(query: string, items: string[], threshold = 0.6): string[] {
  if (!query) return [];
  return items
    .map(item => ({ item, score: getSimilarity(query, item) }))
    .filter(res => res.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item)
    .slice(0, 3);
}
