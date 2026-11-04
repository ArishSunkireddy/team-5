import type { PoemChallenge } from '../data/poemChallenges';

export function isComplete(slots: readonly (string | null)[], challenge: PoemChallenge): boolean {
  return slots.length === challenge.tiles.length && new Set(slots).size === slots.length
    && slots.every(id => challenge.tiles.some(tile => tile.id === id));
}

/** Checks curated meaningful arrangements, not arbitrary poetic meter. */
export function isChallengeCorrect(slots: readonly (string | null)[], challenge: PoemChallenge): boolean {
  return isComplete(slots, challenge)
    && challenge.acceptedAnswers.some(answer => answer.every((id, index) => slots[index] === id));
}
