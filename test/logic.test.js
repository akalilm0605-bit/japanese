import test from "node:test";
import assert from "node:assert/strict";
import { words } from "../data.js";
import { calculateAccuracy, isCorrectAnswer, normalizeAnswer, pickNextIndex } from "../logic.js";

test("内置数据正好有 20 个单词", () => {
  assert.equal(words.length, 20);
  assert.ok(words.every((item) => item.word && item.reading && item.meaning));
});

test("答案会去掉前后空格和中间空格", () => {
  assert.equal(normalizeAnswer("  学 校 "), "学校");
});

test("必须同时正确填写汉字和假名", () => {
  const item = { word: "学校", reading: "がっこう" };
  assert.equal(isCorrectAnswer("学校/がっこう", item), true);
  assert.equal(isCorrectAnswer("学校 ／ がっこう", item), true);
  assert.equal(isCorrectAnswer("学校", item), false);
  assert.equal(isCorrectAnswer("がっこう", item), false);
  assert.equal(isCorrectAnswer("学校/せんせい", item), false);
});

test("正确率计算正确", () => {
  assert.equal(calculateAccuracy(0, 0), 0);
  assert.equal(calculateAccuracy(3, 1), 75);
  assert.equal(calculateAccuracy(2, 1), 67);
});

test("连续两题不会重复", () => {
  assert.equal(pickNextIndex(20, 4, () => 0.21), 5);
});
