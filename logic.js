export function normalizeAnswer(value) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/[\s〜～~]/g, "");
}

export function isCorrectParts(wordValue, readingValue, item) {
  const expectedWord = normalizeAnswer(item.word || "");
  const expectedReading = normalizeAnswer(item.reading);
  const word = normalizeAnswer(wordValue || "");
  const reading = normalizeAnswer(readingValue || "");

  return word === expectedWord && reading === expectedReading;
}

export function isCorrectAnswer(value, item) {
  const parts = value.normalize("NFKC").trim().split(/[\/／]/);
  if (parts.length === 1 && !item.word) return isCorrectParts("", parts[0], item);
  if (parts.length !== 2) return false;
  return isCorrectParts(parts[0], parts[1], item);
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
