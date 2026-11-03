import { poemChallenges } from '../data/poemChallenges';
import { emptySlots, placeTile, removeTile, type Slots } from './tiles';
import { isChallengeCorrect } from './validation';

export type RoundResult = 'success' | 'retry';
export type GameState = {
  screen: 'intro' | 'game' | 'feedback' | 'final';
  roundIndex: number;
  slots: Slots;
  result: RoundResult;
  score: number;
  awardedRounds: readonly number[];
};
export type GameAction =
  | { type: 'start' | 'restart' | 'return' | 'reset-line' | 'check' | 'retry' | 'next' }
  | { type: 'place'; id: string; index: number }
  | { type: 'remove'; index: number };

export function initialState(screen: 'intro' | 'game' = 'intro'): GameState {
  return { screen, roundIndex: 0, slots: emptySlots(poemChallenges[0]), result: 'retry', score: 0, awardedRounds: [] };
}

export const isStrongFinish = (score: number): boolean => score >= 8;

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'return') return initialState();
  if (action.type === 'start') return state.screen === 'intro' ? initialState('game') : state;
  if (action.type === 'restart') return state.screen === 'final' ? initialState('game') : state;

  const challenge = poemChallenges[state.roundIndex];
  if (state.screen === 'game') {
    switch (action.type) {
      case 'place': return { ...state, slots: placeTile(state.slots, action.id, action.index, challenge) };
      case 'remove': return { ...state, slots: removeTile(state.slots, action.index, challenge) };
      case 'reset-line': return { ...state, slots: emptySlots(challenge) };
      case 'check': {
        const correct = isChallengeCorrect(state.slots, challenge);
        const award = correct && !state.awardedRounds.includes(state.roundIndex);
        return {
          ...state, screen: 'feedback', result: correct ? 'success' : 'retry',
          score: state.score + (award ? 1 : 0),
          awardedRounds: award ? [...state.awardedRounds, state.roundIndex] : state.awardedRounds,
        };
      }
    }
  }
  if (state.screen === 'feedback') {
    if (action.type === 'retry' && state.result === 'retry') return { ...state, screen: 'game' };
    if (action.type === 'next') {
      if (state.roundIndex === poemChallenges.length - 1) return { ...state, screen: 'final' };
      const roundIndex = state.roundIndex + 1;
      return { ...state, roundIndex, screen: 'game', result: 'retry', slots: emptySlots(poemChallenges[roundIndex]) };
    }
  }
  return state;
}
