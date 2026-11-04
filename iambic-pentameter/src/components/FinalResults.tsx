// Presentation adapted from the Figma Make export; see docs/iambic-pentameter-skills-check.md.
import { isStrongFinish } from '../game/state';
import { Progress, CornerFlourish } from './Presentation';
export default function FinalResults({
  score,
  totalRounds,
  onPlayAgain,
  onReturn,
}: {
  score: number;
  totalRounds: number;
  onPlayAgain: () => void;
  onReturn: () => void;
}) {
  const strongFinish = isStrongFinish(score, totalRounds);
  return (
    <main className="screen results-screen">
      <Progress active={3} />
      <section className="parchment results-card final-card">
        <CornerFlourish />
        <div className="result-seal score-seal" aria-hidden="true">{score}</div>
        <div className="eyebrow">SIDE QUEST COMPLETE</div>
        <h1>{strongFinish ? 'Master of the measured line' : 'The poet’s trail continues'}</h1>
        <p className="result-lead">
          You completed all {totalRounds} poetry challenges and scored <strong>{score} out of {totalRounds}</strong>.
        </p>
        <div className="final-score">
          <span>{score}</span>
          <i>/ {totalRounds}</i>
          <small>LINES BUILT CORRECTLY</small>
        </div>
        <div className="explanation final-message">
          <h2>{strongFinish ? 'A steady poetic stride' : 'Keep listening for the beat'}</h2>
          <p>
            {strongFinish
              ? 'You built meaningful lines from phrases that model the unstressed–stressed pulse of iambic pentameter.'
              : 'Read verse aloud and tap out five da-DUM pairs. Each attempt makes the meter easier to hear.'}
          </p>
        </div>
        <div className="result-actions">
          <button className="secondary-button" onClick={onPlayAgain}>Play Again</button>
          <button className="primary-button" onClick={onReturn}>Return to Introduction <span aria-hidden="true">→</span></button>
        </div>
      </section>
    </main>
  );
}
