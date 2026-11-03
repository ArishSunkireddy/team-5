import type { PoemChallenge } from '../data/poemChallenges';

/** Validates the intended phrase order, not arbitrary poetic meter. */
export function isChallengeCorrect(slots: readonly (string | null)[], challenge: PoemChallenge): boolean {
  return slots.length === challenge.correctAnswer.length
    && challenge.correctAnswer.every((id, index) => slots[index] === id);
}
