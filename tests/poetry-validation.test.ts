import { describe, expect, it } from 'vitest';
import { poemChallenges } from '../iambic-pentameter/src/data/poemChallenges';
import { isChallengeCorrect } from '../iambic-pentameter/src/game/validation';

describe('reviewed-arrangement validation', () => {
  it.each(poemChallenges)('accepts the complete intended order for round $id', c => {
    const answer = c.correctAnswer;
    expect(isChallengeCorrect(answer, c)).toBe(true);
    for (const invalid of [[], answer.slice(1), [...answer, null], [...answer, 'extra'],
      [null, ...answer.slice(1)], [answer[1], answer[0], ...answer.slice(2)],
      [answer[0], ...answer.slice(0, 4)], ['unknown', ...answer.slice(1)]]) {
      expect(isChallengeCorrect(invalid, c)).toBe(false);
    }
  });
  it('rejects tiles from another round', () => {
    expect(isChallengeCorrect(poemChallenges[1].correctAnswer, poemChallenges[0])).toBe(false);
  });
});

describe('reviewed alternatives', () => {
  it.each(poemChallenges)('validates every curated answer for round $id', challenge => {
    for (const answer of challenge.acceptedAnswers) {
      expect([...answer].sort()).toEqual([...challenge.correctAnswer].sort());
      expect(isChallengeCorrect(answer, challenge)).toBe(true);
      expect(isChallengeCorrect(answer.slice(1), challenge)).toBe(false);
    }
    expect(isChallengeCorrect([...challenge.correctAnswer].reverse(), challenge)).toBe(false);
  });
  it('accepts a time phrase moved to the front, but rejects broken prepositional phrases', () => {
    const c = poemChallenges[0];
    const ids = (order: number[]) => order.map(i => c.correctAnswer[i]);
    expect(isChallengeCorrect(ids([4, 0, 1, 2, 3]), c)).toBe(true);
    expect(isChallengeCorrect(ids([4, 0, 2, 1, 3]), c)).toBe(false);
  });
});
