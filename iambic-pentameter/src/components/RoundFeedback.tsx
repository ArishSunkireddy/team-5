// Presentation adapted from the Figma Make export; see docs/iambic-pentameter-skills-check.md.
import type { PoemChallenge } from '../data/poemChallenges';
import type { RoundResult } from '../game/state';
import { Progress, CornerFlourish } from './Presentation';
type RoundFeedbackProps = {
  challenge: PoemChallenge;
  result: RoundResult;
  roundIndex: number;
  totalRounds: number;
  score: number;
  onTryAgain: () => void;
  onNext: () => void;
};

export default function RoundFeedback({
  challenge,
  result,
  roundIndex,
  totalRounds,
  score,
  onTryAgain,
  onNext,
}: RoundFeedbackProps) {
  const success = result === 'success';
  return (
    <main className="screen results-screen">
      <Progress active={3} />
      <section className={`parchment results-card ${success ? 'success' : 'retry'}`}>
        <CornerFlourish />
        <div className="feedback-meta">ROUND {roundIndex + 1}/{totalRounds} · SCORE {score}</div>
        <div className="result-seal" aria-hidden="true">{success ? '✓' : '?'}</div>
        <div className="eyebrow">{success ? 'THE PATH IS CLEAR' : 'A TWIST IN THE ROAD'}</div>
        <h1>{success ? 'A line well measured!' : 'Nearly there, poet.'}</h1>
        <p className="result-lead">
          {success
            ? 'You built the line in the correct order and kept all five iambs marching together.'
            : 'The phrases do not yet form the intended line. Study the scansion below, then try again or continue.'}
        </p>

        <div className="completed-line" aria-label="Correct line with stressed syllables emphasized">
          “{challenge.feet.map((foot, index) => (
            <span className="scanned-foot" key={`${foot.unstressed}-${foot.stressed}`}>
              <span>{foot.unstressed}</span> <b>{foot.stressed}</b>{index < challenge.feet.length - 1 && <i> · </i>}
            </span>
          ))}”
        </div>
        <div className="explanation">
          <h2>{success ? 'Why it works' : 'Follow the rhythm'}</h2>
          <p>
            Lowercase syllables are <strong>unstressed</strong>; bold capitals are <strong>stressed</strong>.
            Read each foot as da-<b>DUM</b>: {challenge.feet.map((foot) => `${foot.unstressed}-${foot.stressed}`).join(' · ')}.
          </p>
          {!success && <p className="round-hint"><strong>Hint:</strong> {challenge.hint}</p>}
        </div>

        <div className="result-actions">
          {!success && <button className="secondary-button" onClick={onTryAgain}>Try Again</button>}
          <button className="primary-button" onClick={onNext}>
            {roundIndex === totalRounds - 1 ? 'View Final Results' : 'Next Round'} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </main>
  );
}
