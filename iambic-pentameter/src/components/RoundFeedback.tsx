// Presentation adapted from the Figma Make export; see docs/iambic-pentameter-skills-check.md.
import type { PoemChallenge } from '../data/poemChallenges';
import type { RoundResult } from '../game/state';
import { Progress, CornerFlourish } from './Presentation';
type RoundFeedbackProps = {
  challenge: PoemChallenge;
  result: RoundResult;
  slots: readonly (string | null)[];
  roundIndex: number;
  totalRounds: number;
  score: number;
  onTryAgain: () => void;
  onNext: () => void;
};

export default function RoundFeedback({
  challenge,
  result,
  slots,
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
            ? 'Your line matches one of the reviewed meaningful arrangements of these five iambic phrases.'
            : 'This order does not match a reviewed arrangement. Keep related phrases together, then try again or continue.'}
        </p>

        {success && <div className="completed-line" aria-label="Your accepted line with stressed syllables emphasized">
          “{slots.map((id, index) => {
            const foot = challenge.feet[challenge.correctAnswer.indexOf(id!)];
            return (
              <span className="scanned-foot" key={index}>
                <span>{foot.unstressed}</span> <b>{foot.stressed}</b>{index < challenge.feet.length - 1 && <i> · </i>}
              </span>
            );
          })}”
        </div>}
        <div className="explanation">
          <h2>{success ? 'Why it works' : 'Try this clue'}</h2>
          {success && <p>
            Lowercase syllables are <strong>unstressed</strong>; bold capitals are <strong>stressed</strong>.
            Read each foot as da-<b>DUM</b>, five times.
          </p>}
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
