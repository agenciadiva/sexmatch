export function calculateMatches(answers, questions, userIds) {
  const [u1, u2] = userIds;
  const map1 = {};
  const map2 = {};

  answers.forEach((a) => {
    if (a.userId === u1) map1[a.questionId] = a.value;
    if (a.userId === u2) map2[a.questionId] = a.value;
  });

  const matches = [];
  questions.forEach((q) => {
    const v1 = map1[q.id];
    const v2 = map2[q.id];
    if (v1 !== undefined && v2 !== undefined && v1 >= 7 && v2 >= 7) {
      matches.push({ question: q, score1: v1, score2: v2, total: v1 + v2 });
    }
  });

  // Ordenar por total DESC (más altas primero para resultados completos)
  return matches.sort((a, b) => b.total - a.total);
}

// Cuántas mostrar en el preview según total de matches
export function previewCount(totalMatches) {
  if (totalMatches <= 1) return 0;
  if (totalMatches <= 3) return 1;
  if (totalMatches <= 5) return 2;
  return 3;
}

// Para el preview: mostrar las MENOS potentes (menor score total)
export function getPreviewMatches(matches) {
  const count = previewCount(matches.length);
  if (count === 0) return [];
  // Las menos potentes están al final (ya ordenadas DESC)
  return [...matches].reverse().slice(0, count);
}

export function getCompatibilityLevel(matchCount, total) {
  const pct = total > 0 ? matchCount / total : 0;
  if (pct >= 0.75) return { label: 'Compatibilidad explosiva 🔥', color: '#e05c4b' };
  if (pct >= 0.55) return { label: 'Alta tensión sexual ⚡', color: '#c94f8a' };
  if (pct >= 0.35) return { label: 'Hay química para explorar 💫', color: '#7c6af7' };
  return { label: 'Distintos, pero complementarios 🌙', color: '#4a7fb5' };
}
