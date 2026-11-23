/** Returns a number in [0, 1), like Math.random. Passed in so tests can fix the order. */
export type RandomSource = () => number;

/**
 * Returns a shuffled copy of `items` using the Fisher–Yates algorithm, which
 * makes every order equally likely. `items` itself is never changed.
 */
export function shuffle<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const shuffled = [...items];
  for (let last = shuffled.length - 1; last > 0; last--) {
    const pick = randomIndex(last + 1, random);
    [shuffled[last], shuffled[pick]] = [shuffled[pick], shuffled[last]];
  }
  return shuffled;
}

function randomIndex(length: number, random: RandomSource): number {
  const value = random();
  if (!(value >= 0 && value < 1)) {
    throw new RangeError(`random() must return a number in [0, 1), got ${value}`);
  }
  return Math.floor(value * length);
}
