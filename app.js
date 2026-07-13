import { words } from "./data.js";
import { calculateAccuracy, createUnits, isCorrectParts, pickNextIndex } from "./logic.js";

const UNIT_SIZE = 50;
const STORAGE_KEY = "japanese-n5-unit-progress-v1";
const units = createUnits(words, UNIT_SIZE);

const elements = {
  unitSelection: document.querySelector("#unit-selection"),
  unitList: document.querySelector("#unit-list"),
  practiceScreen: document.querySelector("#practice-screen"),
  unitTitle: document.querySelector("#current-unit-title"),
  unitRange: document.querySelector("#unit-range"),
  changeUnit: document.querySelector("#change-unit-button"),
  form: document.querySelector("#answer-form"),
  wordInput: document.querySelector("#word-input"),
  readingInput: document.querySelector("#reading-input"),
  fields: document.querySelector("#answer-fields"),
  divider: document.querySelector("#answer-divider"),
  label: document.querySelector("#answer-label"),
  hint: document.querySelector("#input-hint"),
  meaning: document.querySelector("#meaning"),
  speak: document.querySelector("#speak-button"),
  result: document.querySelector("#result"),
  forget: document.querySelector("#forget-button"),
  submit: document.querySelector("#submit-button"),
  next: document.querySelector("#next-button"),
  practiced: document.querySelector("#practiced-count"),
  correct: document.querySelector("#correct-count"),
  wrong: document.querySelector("#wrong-count"),
  accuracy: document.querySelector("#accuracy")
};

const state = {
  unitIndex: -1,
  currentIndex: -1,
  activeWords: [],
  answered: false,
  progress: loadProgress()
};

function emptyProgress() {
  return { correct: 0, wrong: 0, seen: [] };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return units.map(emptyProgress);
    return units.map((_, index) => ({
      correct: Number(saved[index]?.correct) || 0,
      wrong: Number(saved[index]?.wrong) || 0,
      seen: Array.isArray(saved[index]?.seen) ? saved[index].seen.filter(Number.isInteger) : []
    }));
  } catch {
    return units.map(emptyProgress);
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  } catch {
    // 浏览器禁止本地保存时，答题功能仍然可以正常使用。
  }
}

function getCurrentProgress() {
  return state.progress[state.unitIndex] || emptyProgress();
}

function renderUnitList() {
  elements.unitList.innerHTML = units.map((unit, index) => {
    const progress = state.progress[index] || emptyProgress();
    const completed = Math.min(new Set(progress.seen).size, unit.length);
    const percent = Math.round((completed / unit.length) * 100);
    const accuracy = calculateAccuracy(progress.correct, progress.wrong);
    const start = index * UNIT_SIZE + 1;
    const end = start + unit.length - 1;
    return `
      <button class="unit-card" type="button" data-unit-index="${index}">
        <span class="unit-card-top">
          <strong>第${index + 1}单元</strong>
          <small>${start}–${end}词</small>
        </span>
        <span class="unit-progress" aria-hidden="true"><span style="width: ${percent}%"></span></span>
        <span class="unit-card-meta">已练 ${completed}/${unit.length} · 正确率 ${accuracy}%</span>
      </button>
    `;
  }).join("");
}

function speakJapanese(item = state.activeWords[state.currentIndex]) {
  if (!("speechSynthesis" in window) || !item) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(item.reading.replace(/[〜～~]/g, ""));
  utterance.lang = "ja-JP";
  utterance.rate = 0.85;
  utterance.pitch = 1;
  const japaneseVoice = window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith("ja"));
  if (japaneseVoice) utterance.voice = japaneseVoice;
  window.speechSynthesis.speak(utterance);
}

function updateScore() {
  const progress = getCurrentProgress();
  const total = state.activeWords.length || UNIT_SIZE;
  const completed = Math.min(new Set(progress.seen).size, total);
  elements.practiced.textContent = `${completed}/${total}`;
  elements.correct.textContent = progress.correct;
  elements.wrong.textContent = progress.wrong;
  elements.accuracy.textContent = `${calculateAccuracy(progress.correct, progress.wrong)}%`;
}

function startUnit(index) {
  if (!units[index]) return;
  state.unitIndex = index;
  state.activeWords = units[index];
  state.currentIndex = -1;
  state.answered = false;
  const start = index * UNIT_SIZE + 1;
  const end = start + state.activeWords.length - 1;
  elements.unitTitle.textContent = `第${index + 1}单元`;
  elements.unitRange.textContent = `第 ${start}–${end} 词 · 共${state.activeWords.length}词`;
  elements.unitSelection.hidden = true;
  elements.practiceScreen.hidden = false;
  updateScore();
  showNextQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changeUnit() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  elements.practiceScreen.hidden = true;
  elements.unitSelection.hidden = false;
  renderUnitList();
  document.querySelector(".unit-card")?.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showNextQuestion() {
  const seen = new Set(getCurrentProgress().seen);
  const unseenIndexes = state.activeWords
    .map((_, index) => index)
    .filter((index) => !seen.has(index) && index !== state.currentIndex);
  state.currentIndex = unseenIndexes.length
    ? unseenIndexes[Math.floor(Math.random() * unseenIndexes.length)]
    : pickNextIndex(state.activeWords.length, state.currentIndex);
  state.answered = false;
  const item = state.activeWords[state.currentIndex];
  const hasKanji = Boolean(item.word);
  elements.meaning.textContent = item.meaning;
  elements.wordInput.value = "";
  elements.readingInput.value = "";
  elements.wordInput.hidden = !hasKanji;
  elements.divider.hidden = !hasKanji;
  elements.fields.classList.toggle("kana-only", !hasKanji);
  elements.label.htmlFor = hasKanji ? "word-input" : "reading-input";
  elements.label.textContent = hasKanji ? "请分别填写日语汉字和假名" : "这个词没有常用汉字，请填写假名";
  elements.hint.textContent = hasKanji ? "中间的“/”已经固定，只需填写两边" : "这一题只需填写假名";
  elements.readingInput.placeholder = hasKanji ? "假名：がっこう" : "请输入假名";
  elements.wordInput.disabled = false;
  elements.readingInput.disabled = false;
  elements.submit.disabled = false;
  elements.forget.disabled = false;
  elements.result.hidden = true;
  elements.result.className = "result";
  elements.next.hidden = true;
  (hasKanji ? elements.wordInput : elements.readingInput).focus();
  speakJapanese(item);
}

function showResult(correct, item) {
  elements.result.classList.add(correct ? "correct" : "wrong");
  elements.result.innerHTML = `
    <p class="result-title">${correct ? "回答正确！" : "这次没有答对"}</p>
    <p>${item.word ? `<span class="answer-word" lang="ja">${item.word}</span>` : ""}<span class="answer-reading" lang="ja">${item.reading}</span></p>
    ${correct ? "" : `<p>中文释义：${item.meaning}</p>`}
  `;
  elements.result.hidden = false;
  elements.next.hidden = false;
}

function finishQuestion(correct, item) {
  state.answered = true;
  const progress = getCurrentProgress();
  if (correct) progress.correct += 1;
  else progress.wrong += 1;
  if (!progress.seen.includes(state.currentIndex)) progress.seen.push(state.currentIndex);
  saveProgress();
  elements.wordInput.disabled = true;
  elements.readingInput.disabled = true;
  elements.submit.disabled = true;
  elements.forget.disabled = true;
  updateScore();
  showResult(correct, item);
  speakJapanese(item);
  elements.next.focus();
}

function submitAnswer(event) {
  event.preventDefault();
  if (state.answered) return;
  const wordAnswer = elements.wordInput.value.trim();
  const readingAnswer = elements.readingInput.value.trim();
  const item = state.activeWords[state.currentIndex];
  const needsWord = Boolean(item.word);
  if ((needsWord && !wordAnswer) || !readingAnswer) {
    const emptyInput = !readingAnswer ? elements.readingInput : elements.wordInput;
    emptyInput.focus();
    emptyInput.setCustomValidity(!readingAnswer ? "请填写假名" : "请填写日语汉字");
    emptyInput.reportValidity();
    emptyInput.setCustomValidity("");
    return;
  }
  finishQuestion(isCorrectParts(wordAnswer, readingAnswer, item), item);
}

function forgetAnswer() {
  if (state.answered) return;
  finishQuestion(false, state.activeWords[state.currentIndex]);
}

elements.unitList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-unit-index]");
  if (card) startUnit(Number(card.dataset.unitIndex));
});
elements.changeUnit.addEventListener("click", changeUnit);
elements.form.addEventListener("submit", submitAnswer);
elements.forget.addEventListener("click", forgetAnswer);
elements.speak.addEventListener("click", () => speakJapanese());
elements.next.addEventListener("click", showNextQuestion);

if (!("speechSynthesis" in window)) {
  elements.speak.disabled = true;
  elements.speak.textContent = "当前浏览器不支持语音";
}

renderUnitList();
