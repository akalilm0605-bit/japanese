import test from "node:test";
import assert from "node:assert/strict";
import { words } from "../data.js";
import { calculateAccuracy, createUnits, isCorrectAnswer, isCorrectParts, normalizeAnswer, pickNextIndex } from "../logic.js";

test("内置数据有 674 个完整词条", () => {
  assert.equal(words.length, 674);
  assert.ok(words.every((item) => item.reading && item.meaning));
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

test("没有常用汉字的词只检查假名", () => {
  const item = { word: "", reading: "これ" };
  assert.equal(isCorrectParts("", "これ", item), true);
  assert.equal(isCorrectAnswer("これ", item), true);
  assert.equal(isCorrectParts("此", "これ", item), false);
});

test("接续符号不需要输入", () => {
  const item = { word: "〜回", reading: "〜かい" };
  assert.equal(isCorrectParts("回", "かい", item), true);
});

test("674个词按每50词分成14个单元", () => {
  const units = createUnits(words, 50);
  assert.equal(units.length, 14);
  assert.equal(units[0].length, 50);
  assert.equal(units[13].length, 24);
});

test("正确率计算正确", () => {
  assert.equal(calculateAccuracy(0, 0), 0);
  assert.equal(calculateAccuracy(3, 1), 75);
  assert.equal(calculateAccuracy(2, 1), 67);
});

test("连续两题不会重复", () => {
  assert.equal(pickNextIndex(20, 4, () => 0.21), 5);
});
