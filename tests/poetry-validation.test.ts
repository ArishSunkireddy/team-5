import { describe, expect, it } from 'vitest';
import { poemChallenges } from '../iambic-pentameter/src/data/poemChallenges';
import { isChallengeCorrect } from '../iambic-pentameter/src/game/validation';

describe('exact-order validation', () => {
  it.each(poemChallenges)('accepts only the complete intended order for round $id', c => {
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
