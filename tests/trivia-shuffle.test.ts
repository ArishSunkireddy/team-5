import { afterEach, describe, expect, it, vi } from 'vitest';
import { shuffle } from '../trivia/shuffle';
import type { RandomSource } from '../trivia/shuffle';

// --- Deterministic random sources -------------------------------------------

/** Always returns the same value. 0 always picks the first slot; 0.999 always picks the last. */
const always = (value: number): RandomSource => () => value;

/** Small seeded generator (mulberry32): same seed, same sequence, every run. */
function seeded(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('shuffle', () => {
  it('reorders items according to the random source', () => {
    expect(shuffle(['a', 'b', 'c', 'd'], always(0))).toEqual(['b', 'c', 'd', 'a']);
  });

  it('keeps the original order when every pick is the last slot', () => {
    expect(shuffle(['a', 'b', 'c', 'd'], always(0.999))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps every item exactly once', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    const random = seeded(1);
    for (let run = 0; run < 100; run++) {
      expect([...shuffle(items, random)].sort()).toEqual(items);
    }
  });

  it('can produce every possible order', () => {
    const random = seeded(2);
    const ordersSeen = new Set<string>();
    for (let run = 0; run < 600; run++) {
      ordersSeen.add(shuffle(['a', 'b', 'c'], random).join(''));
    }
    expect([...ordersSeen].sort()).toEqual(['abc', 'acb', 'bac', 'bca', 'cab', 'cba']);
  });

  it('does not change the array it was given', () => {
    const items = Object.freeze(['a', 'b', 'c']);
    shuffle(items, always(0));
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('returns an empty array for an empty list without asking for randomness', () => {
    const random = vi.fn(always(0));
    expect(shuffle([], random)).toEqual([]);
    expect(random).not.toHaveBeenCalled();
  });

  it('returns a single item unchanged without asking for randomness', () => {
    const random = vi.fn(always(0));
    expect(shuffle(['only'], random)).toEqual(['only']);
    expect(random).not.toHaveBeenCalled();
  });

  it.each([1, -0.1, Number.NaN])('rejects a random source that returns %s', (badValue) => {
    expect(() => shuffle(['a', 'b'], always(badValue))).toThrow(RangeError);
  });

  it('uses Math.random when no random source is given', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(shuffle(['a', 'b', 'c'])).toEqual(['b', 'c', 'a']);
    expect(Math.random).toHaveBeenCalledTimes(2);
  });
});
