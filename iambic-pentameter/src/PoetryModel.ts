import { poemChallenges } from './data/poemChallenges';
import { gameReducer, initialState, isStrongFinish, type GameAction } from './game/state';
import { isComplete } from './game/validation';

export class PoetryModel {
  private state = initialState();

  apply(action: GameAction): boolean {
    const next = gameReducer(this.state, action);
    if (next === this.state) return false;
    this.state = next;
    return true;
  }

  getRoundInfo() {
    const { screen, roundIndex, result, slots, awardedRounds } = this.state;
    const challenge = poemChallenges[roundIndex];
    const score = awardedRounds.length;
    return {
      screen, roundIndex, result, slots, challenge, score,
      totalRounds: poemChallenges.length,
      canCheck: isComplete(slots, challenge),
      strongFinish: isStrongFinish(score),
    };
  }
}

export type PoetryRoundInfo = ReturnType<PoetryModel['getRoundInfo']>;
