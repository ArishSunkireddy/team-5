import { describe, expect, it } from 'vitest';
import { poemChallenges } from '../iambic-pentameter/src/data/poemChallenges';
import { emptySlots, placeTile, removeTile } from '../iambic-pentameter/src/game/tiles';
const challenge = poemChallenges[0];
const [a, b] = challenge.correctAnswer;

describe('tile operations', () => {
  it('places a bank tile into an empty slot without mutating input', () => {
    const slots = Object.freeze(emptySlots(challenge));
    expect(placeTile(slots, a, 2, challenge)).toEqual([null, null, a, null, null]);
    expect(slots).toEqual([null, null, null, null, null]);
  });
  it('replaces an occupied slot with a bank tile, returning the displaced tile', () => {
    expect(placeTile([a, null, null, null, null], b, 0, challenge)).toEqual([b, null, null, null, null]);
  });
  it('moves a placed tile to an empty slot', () => {
    expect(placeTile([a, null, null, null, null], a, 4, challenge)).toEqual([null, null, null, null, a]);
  });
  it('swaps two occupied slots without mutation or duplication', () => {
    const slots = Object.freeze([a, b, null, null, null]);
    expect(placeTile(slots, a, 1, challenge)).toEqual([b, a, null, null, null]);
    expect(slots).toEqual([a, b, null, null, null]);
    expect(placeTile(slots, a, 0, challenge)).toBe(slots);
  });
  it('removes a placed tile and ignores an empty slot', () => {
    const slots = Object.freeze([a, b, null, null, null]);
    expect(removeTile(slots, 0, challenge)).toEqual([null, b, null, null, null]);
    expect(removeTile(slots, 2, challenge)).toBe(slots);
    expect(slots[0]).toBe(a);
  });
  it.each([-1, 5, 1.5, NaN, Infinity])('ignores invalid index %s', index => {
    const slots = [a, null, null, null, null];
    expect(placeTile(slots, b, index, challenge)).toBe(slots);
    expect(removeTile(slots, index, challenge)).toBe(slots);
  });
  it.each(['unknown', '', poemChallenges[1].correctAnswer[0]])('ignores invalid tile %s', id => {
    const slots = emptySlots(challenge);
    expect(placeTile(slots, id, 0, challenge)).toBe(slots);
  });
  it('rejects malformed boards', () => {
    for (const slots of [[a], [a, a, null, null, null], ['unknown', null, null, null, null]]) {
      expect(placeTile(slots, b, 0, challenge)).toBe(slots);
      expect(removeTile(slots, 0, challenge)).toBe(slots);
    }
  });
  it('creates independent empty boards', () => {
    const first = emptySlots(challenge);
    first[0] = a;
    expect(emptySlots(challenge)).toEqual([null, null, null, null, null]);
  });
});
