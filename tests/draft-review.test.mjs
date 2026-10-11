import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewDraft } from '../services/draftReview.ts';
test('word counting works across English, Russian, Arabic and unspaced Chinese', () => {
  for (const [text, locale, expected] of [['Hello, world!', 'en', 2], ['Мой опыт работы.', 'ru', 3], ['مرحبا بالعالم', 'ar', 2]]) assert.equal(reviewDraft(text, locale).words, expected);
  assert.ok(reviewDraft('我喜欢学习语言', 'zh').words > 1);
  assert.equal(reviewDraft('   ').words, 0);
});
test('flags unfinished templates without flagging bracketed citations or duplicating warnings', () => {
  assert.deepEqual(reviewDraft('[Your name] [Your name] [1] {{company}} [Название университета]').placeholders, ['[Your name]', '{{company}}', '[Название университета]']);
  assert.deepEqual(reviewDraft('Completed text [2026]').placeholders, []);
});
test('length target has a strict boundary and an optional unset state', () => {
  assert.equal(reviewDraft('One two three', 'en', 3).overLimit, false);
  assert.equal(reviewDraft('One two three', 'en', 2).overLimit, true);
  assert.equal(reviewDraft('One two three', 'en').overLimit, false);
});
