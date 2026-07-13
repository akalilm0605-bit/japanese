import { words } from "./data.js";
import { calculateAccuracy, isCorrectParts, pickNextIndex } from "./logic.js";

const elements = {
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
  correct: document.querySelector("#correct-count"),
  wrong: document.querySelector("#wrong-count"),
  accuracy: document.querySelector("#accuracy")
};

const state = { currentIndex: -1, correct: 0, wrong: 0, answered: false };

function speakJapanese(item = words[state.currentIndex]) {
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
  elements.correct.textContent = state.correct;
  elements.wrong.textContent = state.wrong;
  elements.accuracy.textContent = `${calculateAccuracy(state.correct, state.wrong)}%`;
}

function showNextQuestion() {
  state.currentIndex = pickNextIndex(words.length, state.currentIndex);
  state.answered = false;
  const item = words[state.currentIndex];
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
  if (correct) state.correct += 1;
  else state.wrong += 1;
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
  const item = words[state.currentIndex];
  const needsWord = Boolean(item.word);
  if ((needsWord && !wordAnswer) || !readingAnswer) {
    const emptyInput = !readingAnswer ? elements.readingInput : elements.wordInput;
    emptyInput.focus();
    emptyInput.setCustomValidity(!readingAnswer ? "请填写假名" : "请填写日语汉字");
    emptyInput.reportValidity();
    emptyInput.setCustomValidity("");
    return;
  }

  const correct = isCorrectParts(wordAnswer, readingAnswer, item);
  finishQuestion(correct, item);
}

function forgetAnswer() {
  if (state.answered) return;
  finishQuestion(false, words[state.currentIndex]);
}

elements.form.addEventListener("submit", submitAnswer);
elements.forget.addEventListener("click", forgetAnswer);
elements.speak.addEventListener("click", () => speakJapanese());
elements.next.addEventListener("click", showNextQuestion);
if (!("speechSynthesis" in window)) {
  elements.speak.disabled = true;
  elements.speak.textContent = "当前浏览器不支持语音";
}
updateScore();
showNextQuestion();
