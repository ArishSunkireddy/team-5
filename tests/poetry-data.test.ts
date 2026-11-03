import { describe, expect, it } from 'vitest';
import { poemChallenges } from '../iambic-pentameter/src/data/poemChallenges';

describe('poetry challenge data', () => {
  it('contains ten uniquely identified rounds', () => {
    expect(poemChallenges).toHaveLength(10);
    expect(new Set(poemChallenges.map(c => c.id)).size).toBe(10);
    expect(new Set(poemChallenges.flatMap(c => c.tiles.map(t => t.id))).size).toBe(50);
  });
  it.each(poemChallenges)('round $id has complete, consistent content', c => {
    expect(c.tiles).toHaveLength(5);
    expect(c.feet).toHaveLength(5);
    expect(c.correctAnswer).toHaveLength(5);
    expect([...c.correctAnswer].sort()).toEqual(c.tiles.map(t => t.id).sort());
    expect(new Set(c.correctAnswer).size).toBe(5);
    expect(c.hint.trim()).not.toBe('');
    expect(c.trailName.trim()).not.toBe('');
    c.correctAnswer.forEach((id, i) => {
      const text = c.tiles.find(t => t.id === id)!.text;
      expect(text.trim()).not.toBe('');
      expect((c.feet[i].unstressed + c.feet[i].stressed).toLowerCase().replaceAll(' ', ''))
        .toBe(text.replaceAll(' ', ''));
    });
  });
});
