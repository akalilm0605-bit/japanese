export function normalizeAnswer(value) {
  return value.normalize("NFKC").trim().replace(/\s+/g, "");
}

export function isCorrectAnswer(value, item) {
  const answer = normalizeAnswer(value);
  return answer === item.word || answer === item.reading;
}

export function calculateAccuracy(correct, wrong) {
  const total = correct + wrong;
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function pickNextIndex(length, previousIndex, random = Math.random) {
  if (length <= 1) return 0;
  let index = Math.floor(random() * length);
  if (index === previousIndex) index = (index + 1) % length;
  return index;
}
