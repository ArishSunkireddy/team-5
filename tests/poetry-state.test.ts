import { describe, expect, it } from 'vitest';
import { poemChallenges } from '../iambic-pentameter/src/data/poemChallenges';
import { gameReducer, initialState, isStrongFinish, type GameState, type GameAction } from '../iambic-pentameter/src/game/state';
const act = (state: GameState, type: 'check' | 'next' | 'retry') => gameReducer(state, { type });
function solve(state: GameState) {
  return poemChallenges[state.roundIndex].correctAnswer.reduce((current, id, index) =>
    gameReducer(current, { type: 'place', id, index }), state);
}
function wrong(state: GameState) {
  return { ...state, slots: [...poemChallenges[state.roundIndex].correctAnswer].reverse() };
}
function play(correct: boolean) {
  let state = initialState('game');
  for (let i = 0; i < poemChallenges.length; i++) {
    expect(state.roundIndex).toBe(i);
    expect(state.screen).toBe('game');
    expect(state.slots).toEqual([null, null, null, null, null]);
    state = act(correct ? solve(state) : wrong(state), 'check');
    expect(state.awardedRounds.length).toBe(correct ? i + 1 : 0);
    state = act(state, 'next');
  }
  return state;
}

describe('poetry state', () => {
  it('ignores incomplete submissions without feedback or points', () => {
    const empty = initialState('game');
    expect(act(empty, 'check')).toBe(empty);
    const partial = gameReducer(empty, { type: 'place', id: poemChallenges[0].correctAnswer[0], index: 0 });
    expect(act(partial, 'check')).toBe(partial);
  });
  it('starts at the intro and initializes a fresh game', () => {
    expect(initialState().screen).toBe('intro');
    expect(gameReducer(initialState(), { type: 'start' })).toEqual(initialState('game'));
  });
  it('awards exactly one point and blocks repeated checking and successful retry', () => {
    const solved = solve(initialState('game'));
    const feedback = act(solved, 'check');
    expect(feedback.awardedRounds.length).toBe(1);
    expect(feedback.result).toBe('success');
    expect(act(feedback, 'check')).toBe(feedback);
    expect(act(feedback, 'retry')).toBe(feedback);
    // Defense in depth if an already-awarded round is re-entered.
    expect(act({ ...feedback, screen: 'game' }, 'check').awardedRounds.length).toBe(1);
    expect(solved.awardedRounds.length).toBe(0);
  });
  it('returns all tiles to the bank on retry and awards eventual success', () => {
    let state = wrong(initialState('game'));
    state = act(state, 'check');
    expect(state.result).toBe('retry');
    expect(state.awardedRounds.length).toBe(0);
    state = act(state, 'retry');
    expect(state.screen).toBe('game');
    expect(state.slots).toEqual([null, null, null, null, null]);
    expect(state.awardedRounds).toEqual([]);
    expect(act(state, 'check')).toBe(state);
    expect(state.roundIndex).toBe(0);
    expect(act(solve(state), 'check').awardedRounds.length).toBe(1);
  });
  it('skips an incorrect round without awarding points', () => {
    const state = act(act(wrong(initialState('game')), 'check'), 'next');
    expect(state.roundIndex).toBe(1);
    expect(state.awardedRounds.length).toBe(0);
    expect(state.result).toBe('retry');
  });
  it('resets only the line and supports removing tiles', () => {
    let state = act(act(solve(initialState('game')), 'check'), 'next');
    state = solve(state);
    state = gameReducer(state, { type: 'remove', index: 0 });
    expect(state.slots[0]).toBeNull();
    const reset = gameReducer(state, { type: 'reset-line' });
    expect(reset.slots).toEqual([null, null, null, null, null]);
    expect(reset.awardedRounds.length).toBe(1);
    expect(reset.roundIndex).toBe(1);
  });
  it.each([true, false])('completes all ten rounds (correct=%s) without overflow', correct => {
    const final = play(correct);
    expect(final.screen).toBe('final');
    expect(final.roundIndex).toBe(9);
    expect(final.awardedRounds.length).toBe(correct ? 10 : 0);
    expect(act(final, 'next')).toBe(final);
    expect(act(final, 'check')).toBe(final);
    expect(gameReducer(final, { type: 'restart' })).toEqual(initialState('game'));
    expect(gameReducer(final, { type: 'return' })).toEqual(initialState());
  });
  it('ignores actions inappropriate for the current screen', () => {
    const intro = initialState();
    const actions: GameAction[] = [{ type: 'next' }, { type: 'check' }, { type: 'retry' },
      { type: 'reset-line' }, { type: 'restart' }, { type: 'remove', index: 0 },
      { type: 'place', id: poemChallenges[0].correctAnswer[0], index: 0 }];
    actions.forEach(action => expect(gameReducer(intro, action)).toBe(intro));
    const game = initialState('game');
    expect(act(game, 'next')).toBe(game);
    expect(gameReducer(game, { type: 'start' })).toBe(game);
  });
  it('rejects invalid placement through the reducer', () => {
    const state = initialState('game');
    expect(gameReducer(state, { type: 'place', id: 'unknown', index: 0 })).toEqual(state);
  });
  it('returns to the intro and clears progress mid-quest', () => {
    expect(gameReducer(act(solve(initialState('game')), 'check'), { type: 'return' })).toEqual(initialState());
  });
  it('uses eight points as the strong-finish boundary', () => {
    expect(isStrongFinish(7)).toBe(false);
    expect(isStrongFinish(8)).toBe(true);
    expect(isStrongFinish(10)).toBe(true);
  });
});
