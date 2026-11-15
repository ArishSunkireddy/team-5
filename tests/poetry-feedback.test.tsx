import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RoundFeedback from '../iambic-pentameter/src/components/RoundFeedback';
import PoetryBoard from '../iambic-pentameter/src/components/PoetryBoard';
import { TrailHeader } from '../iambic-pentameter/src/components/Presentation';
import { poemChallenges } from '../iambic-pentameter/src/data/poemChallenges';

const noop = () => {};
describe('poetry presentation safeguards', () => {
  it.each(poemChallenges)('shows a hint without revealing the solution for round $id', challenge => {
    const html = renderToStaticMarkup(<RoundFeedback challenge={challenge} slots={[...challenge.correctAnswer].reverse()}
      result="retry" roundIndex={0} totalRounds={poemChallenges.length} score={0} onTryAgain={noop} onNext={noop} />);
    expect(html).toContain('Hint:');
    expect(html).toContain(challenge.hint);
    expect(html).not.toContain('completed-line');
    expect(html).not.toContain('scanned-foot');
    expect(html).toContain('Try Again');
  });
  it('renders accepted alternatives in submitted order', () => {
    const challenge = poemChallenges[0];
    const html = renderToStaticMarkup(<RoundFeedback challenge={challenge} slots={challenge.acceptedAnswers[1]}
      result="success" roundIndex={0} totalRounds={10} score={1} onTryAgain={noop} onNext={noop} />);
    expect(html.indexOf('<b>NIGHT</b>')).toBeLessThan(html.indexOf('<b>MOON</b>'));
  });
  it('disables checking until the board is complete', () => {
    const challenge = poemChallenges[0];
    for (const slots of [Array(5).fill(null), [challenge.correctAnswer[0], null, null, null, null], challenge.correctAnswer]) {
      const html = renderToStaticMarkup(<PoetryBoard challenge={challenge} slots={slots} roundIndex={0}
        totalRounds={10} score={0} onDrop={noop} onRemove={noop} onCheck={noop} onReset={noop} />);
      expect(/disabled=""[^>]*>Check Answer/.test(html)).toBe(slots.includes(null));
    }
  });
  it('hides the return action when no return handler is supplied', () => {
    expect(renderToStaticMarkup(<TrailHeader />)).not.toContain('Return to Introduction');
    expect(renderToStaticMarkup(<TrailHeader onReturn={noop} />)).toContain('Return to Introduction');
  });
});
