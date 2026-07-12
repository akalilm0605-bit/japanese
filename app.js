import { words } from "./data.js";
import { calculateAccuracy, isCorrectAnswer, pickNextIndex } from "./logic.js";

const elements = {
  form: document.querySelector("#answer-form"),
  input: document.querySelector("#answer-input"),
  meaning: document.querySelector("#meaning"),
  result: document.querySelector("#result"),
  submit: document.querySelector("#submit-button"),
  next: document.querySelector("#next-button"),
  correct: document.querySelector("#correct-count"),
  wrong: document.querySelector("#wrong-count"),
  accuracy: document.querySelector("#accuracy")
};

const state = { currentIndex: -1, correct: 0, wrong: 0, answered: false };

function updateScore() {
  elements.correct.textContent = state.correct;
  elements.wrong.textContent = state.wrong;
  elements.accuracy.textContent = `${calculateAccuracy(state.correct, state.wrong)}%`;
}

function showNextQuestion() {
  state.currentIndex = pickNextIndex(words.length, state.currentIndex);
  state.answered = false;
  elements.meaning.textContent = words[state.currentIndex].meaning;
  elements.input.value = "";
  elements.input.disabled = false;
  elements.submit.disabled = false;
  elements.result.hidden = true;
  elements.result.className = "result";
  elements.next.hidden = true;
  elements.input.focus();
}

function showResult(correct, item) {
  elements.result.classList.add(correct ? "correct" : "wrong");
  elements.result.innerHTML = `
    <p class="result-title">${correct ? "回答正确！" : "这次没有答对"}</p>
    <p><span class="answer-word" lang="ja">${item.word}</span><span class="answer-reading" lang="ja">${item.reading}</span></p>
    ${correct ? "" : `<p>中文释义：${item.meaning}</p>`}
  `;
  elements.result.hidden = false;
  elements.next.hidden = false;
}

function submitAnswer(event) {
  event.preventDefault();
  if (state.answered) return;
  const answer = elements.input.value.trim();
  if (!answer) {
    elements.input.focus();
    elements.input.setCustomValidity("请先输入答案");
    elements.input.reportValidity();
    elements.input.setCustomValidity("");
    return;
  }

  state.answered = true;
  const item = words[state.currentIndex];
  const correct = isCorrectAnswer(answer, item);
  if (correct) state.correct += 1;
  else state.wrong += 1;
  elements.input.disabled = true;
  elements.submit.disabled = true;
  updateScore();
  showResult(correct, item);
  elements.next.focus();
}

elements.form.addEventListener("submit", submitAnswer);
elements.next.addEventListener("click", showNextQuestion);
updateScore();
showNextQuestion();
