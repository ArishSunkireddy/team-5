import { afterEach, expect, it, vi } from 'vitest';
import { PoetryController } from '../iambic-pentameter/src/PoetryController';
import { PoetryView } from '../iambic-pentameter/src/PoetryView';
import { poemChallenges } from '../iambic-pentameter/src/data/poemChallenges';
import { menuUrl } from '../menu/destinations';

const view = vi.hoisted(() => ({ render: vi.fn<PoetryView['render']>(), destroy: vi.fn() }));
vi.mock('../iambic-pentameter/src/PoetryView', () => ({
  PoetryView: vi.fn().mockImplementation(function () { return view; }),
}));
const send = (action: Parameters<ConstructorParameters<typeof PoetryView>[0]>[0]) =>
  vi.mocked(PoetryView).mock.lastCall![0](action);
const info = () => view.render.mock.lastCall![0];
function playRound(ids: readonly string[]) {
  ids.forEach((id, index) => send({ type: 'place', id, index }));
  send({ type: 'check' });
}
function complete() {
  send({ type: 'start' });
  for (const challenge of poemChallenges) {
    expect(info().challenge).toEqual(challenge);
    playRound(challenge.correctAnswer);
    expect(info().result).toBe('success');
    expect(info().score).toBe(challenge.id);
    send({ type: 'next' });
  }
}
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  history.replaceState(null, '', '/');
  document.body.replaceChildren();
});

it('handles placement, swap, removal, clear, ignored submissions, hint, retry and skip', () => {
  const controller = new PoetryController({ onComplete: vi.fn() });
  controller.start();
  expect(info().screen).toBe('intro');
  send({ type: 'start' });
  const ids = poemChallenges[0].correctAnswer;
  ids.forEach((id, index) => {
    expect(info().canCheck).toBe(false);
    send({ type: 'check' });
    expect(info().screen).toBe('game');
    send({ type: 'place', id, index });
  });
  expect(info().canCheck).toBe(true);
  send({ type: 'place', id: ids[0], index: 1 });
  expect(info().slots.slice(0, 2)).toEqual([ids[1], ids[0]]);
  send({ type: 'remove', index: 1 });
  expect(info().canCheck).toBe(false);
  send({ type: 'reset-line' });
  expect(info().slots).toEqual(Array(5).fill(null));
  playRound([...ids].reverse());
  expect(info()).toMatchObject({ screen: 'feedback', result: 'retry', score: 0 });
  send({ type: 'retry' });
  expect(info().slots).toEqual(Array(5).fill(null));
  playRound(poemChallenges[0].acceptedAnswers[1]);
  expect(info().slots).toEqual(poemChallenges[0].acceptedAnswers[1]);
  send({ type: 'check' });
  expect(info().score).toBe(1);
  send({ type: 'next' });
  playRound([...poemChallenges[1].correctAnswer].reverse());
  send({ type: 'next' });
  expect(info()).toMatchObject({ roundIndex: 2, score: 1 });
  send({ type: 'return' });
  expect(info()).toMatchObject({ screen: 'intro', score: 0 });
  controller.destroy();
  expect(view.destroy).toHaveBeenCalledOnce();
});

it('reports final score once per playthrough, including after replay', () => {
  const done = vi.fn();
  const controller = new PoetryController({ onComplete: done });
  controller.start();
  complete();
  send({ type: 'next' });
  controller.start();
  expect(info()).toMatchObject({ screen: 'final', strongFinish: true });
  expect(done).toHaveBeenCalledExactlyOnceWith(10);
  send({ type: 'finish' });
  expect(info()).toMatchObject({ screen: 'game', score: 0, roundIndex: 0 });
  complete();
  expect(done.mock.calls).toEqual([[10], [10]]);
});

it.each([
  ['/', 'Play Again'], ['/?from=other', 'Play Again'],
  ['/?other=1&from=worksheet', 'Return to Worksheet'],
])('wires final action at the real entry point %s', async (path, label) => {
  history.replaceState(null, '', path);
  const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
  vi.resetModules();
  await import('../iambic-pentameter/src/main');
  complete();
  expect(view.render.mock.lastCall![1]).toBe(label);
  send({ type: 'finish' });
  if (label === 'Play Again') expect(info()).toMatchObject({ screen: 'game', score: 0 });
  else expect(assign).toHaveBeenCalledExactlyOnceWith(menuUrl + '#worksheet');
});
