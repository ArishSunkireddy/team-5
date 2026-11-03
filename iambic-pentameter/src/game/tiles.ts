import type { PoemChallenge } from '../data/poemChallenges';

export type Slots = ReadonlyArray<string | null>;
export const emptySlots = (challenge: PoemChallenge): Array<string | null> =>
  Array(challenge.tiles.length).fill(null);

function validBoard(slots: Slots, challenge: PoemChallenge): boolean {
  const placed = slots.filter((id) => id !== null);
  return slots.length === challenge.tiles.length
    && new Set(placed).size === placed.length
    && placed.every((id) => challenge.tiles.some((tile) => tile.id === id));
}

const validIndex = (index: number, slots: Slots) =>
  Number.isInteger(index) && index >= 0 && index < slots.length;

export function placeTile(slots: Slots, id: string, target: number, challenge: PoemChallenge): Slots {
  if (!validBoard(slots, challenge) || !validIndex(target, slots)
    || !challenge.tiles.some((tile) => tile.id === id)) return slots;
  const source = slots.indexOf(id);
  if (source === target) return slots;
  const next = [...slots];
  // A placed tile swaps with its destination. A bank tile displaces it to the bank.
  if (source >= 0) next[source] = next[target];
  next[target] = id;
  return next;
}

export function removeTile(slots: Slots, index: number, challenge: PoemChallenge): Slots {
  if (!validBoard(slots, challenge) || !validIndex(index, slots) || slots[index] === null) return slots;
  return slots.map((id, position) => position === index ? null : id);
}
