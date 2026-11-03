// Presentation adapted from the Figma Make export; see docs/iambic-pentameter-skills-check.md.
import { Progress, CornerFlourish } from './Presentation';
export default function Intro({ onStart }: { onStart: () => void }) {
  return (
    <main className="screen intro-screen">
      <Progress active={1} />
      <section className="parchment intro-card">
        <CornerFlourish />
        <div className="eyebrow">TEN-ROUND SIDE QUEST</div>
        <h1>Poetry Builder</h1>
        <p className="subtitle">Iambic Pentameter</p>
        <div className="ornament"><span>◆</span></div>

        <div className="lesson-layout">
          <div className="lesson-copy">
            <h2>Listen for the heartbeat of a poem.</h2>
            <p>
              An <strong>iamb</strong> is a pair of syllables: one soft, then one strong.
              Poets call this an <em>unstressed–stressed</em> pattern.
            </p>
            <p>
              <strong>Iambic pentameter</strong> places five of these pairs in one line—
              ten syllables marching in a steady rhythm.
            </p>
          </div>
          <div className="rhythm-lesson" aria-label="da-DUM repeated five times">
            <span className="listen-label">TAP THE BEAT</span>
            <div className="beat-row">
              {[1, 2, 3, 4, 5].map((beat) => (
                <div className="beat-pair" key={beat}>
                  <span className="soft">da</span>
                  <span className="strong">DUM</span>
                  <small>{beat}</small>
                </div>
              ))}
            </div>
            <p>da-DUM · da-DUM · da-DUM · da-DUM · da-DUM</p>
          </div>
        </div>

        <div className="quest-note">
          <span>YOUR QUEST</span>
          Build ten lines of verse by arranging each set of five phrase tiles in the correct order.
        </div>

        <button className="primary-button" onClick={onStart}>
          Start Side Quest <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  );
}
