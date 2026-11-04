// Presentation adapted from the Figma Make export; see docs/iambic-pentameter-skills-check.md.
import { useRef, useState, type DragEvent } from 'react';
import type { PoemChallenge } from '../data/poemChallenges';
import { isComplete } from '../game/validation';
import { shuffleTiles } from '../game/tiles';
import { Progress } from './Presentation';
export type GameProps = {
  challenge: PoemChallenge;
  roundIndex: number;
  totalRounds: number;
  score: number;
  slots: readonly (string | null)[];
  onDrop: (phraseId: string, slotIndex: number) => void;
  onRemove: (slotIndex: number) => void;
  onCheck: () => void;
  onReset: () => void;
};

export default function PoetryBoard({
  challenge,
  roundIndex,
  totalRounds,
  score,
  slots,
  onDrop,
  onRemove,
  onCheck,
  onReset,
}: GameProps) {
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [draggingPhraseId, setDraggingPhraseId] = useState<string | null>(null);
  const [bankDragOver, setBankDragOver] = useState(false);
  const slotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [bankOrder] = useState(() => shuffleTiles(challenge.tiles));
  const unused = bankOrder.filter((phrase) => !slots.includes(phrase.id));
  const draggingPlacedPhrase = draggingPhraseId !== null && slots.includes(draggingPhraseId);

  function beginDrag(event: DragEvent, phraseId: string) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', phraseId);
    setDraggingPhraseId(phraseId);
  }

  function finishDrag() {
    setDraggingPhraseId(null);
    setDragOver(null);
    setBankDragOver(false);
  }

  function handleDrop(event: DragEvent, slotIndex: number) {
    event.preventDefault();
    const phraseId = event.dataTransfer.getData('text/plain');
    if (challenge.tiles.some((phrase) => phrase.id === phraseId)) onDrop(phraseId, slotIndex);
    finishDrag();
  }

  function handleBankDrop(event: DragEvent) {
    event.preventDefault();
    const phraseId = event.dataTransfer.getData('text/plain');
    const placedIndex = slots.indexOf(phraseId);
    if (placedIndex >= 0) onRemove(placedIndex);
    finishDrag();
  }

  return (
    <main className="screen game-screen">
      <Progress active={2} />
      <section className="parchment game-card">
        <div className="game-heading">
          <div>
            <div className="eyebrow">ROUND {roundIndex + 1} · {challenge.trailName.toUpperCase()}</div>
            <h1>Build the line</h1>
            <p>Place one two-syllable phrase in each space.</p>
          </div>
          <div className="round-status">
            <div className="round-badge">
              <strong>{roundIndex + 1}/{totalRounds}</strong>
              <span>ROUND<br />PROGRESS</span>
            </div>
            <div className="score-badge">SCORE <strong>{score}</strong></div>
          </div>
        </div>

        <div className="rhythm-guide">
          <span className="guide-title">RHYTHM GUIDE</span>
          <div className="guide-beats">
            {challenge.feet.map((_, beat) => (
              <div key={beat}><span>da</span><strong>DUM</strong></div>
            ))}
          </div>
          <small>soft → strong</small>
        </div>

        <div className="line-builder">
          <div className="opening-quote" aria-hidden="true">“</div>
          <div className="slots" aria-label="Poetry line">
            {slots.map((phraseId, index) => {
              const phrase = challenge.tiles.find((item) => item.id === phraseId);
              return (
                <button
                  className={`phrase-slot ${phrase ? 'filled' : ''} ${dragOver === index ? 'drag-over' : ''}`}
                  key={index}
                  ref={element => { slotRefs.current[index] = element; }}
                  draggable={!!phrase}
                  onDragStart={event => phrase && beginDrag(event, phrase.id)}
                  onDragEnd={finishDrag}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    setDragOver(index);
                  }}
                  onDragLeave={event => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(null);
                  }}
                  onDrop={(event) => handleDrop(event, index)}
                  onClick={() => phrase && onRemove(index)}
                  aria-label={phrase ? `${phrase.text}, click to remove` : `Empty position ${index + 1}`}
                >
                  <span className="slot-number">{index + 1}</span>
                  {phrase ? (
                    <span
                      className="placed-phrase"
                    >
                      {phrase.text}
                    </span>
                  ) : (
                    <span className="empty-label">drop phrase</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="closing-quote" aria-hidden="true">”</div>
        </div>

        <div
          className={`tile-bank ${bankDragOver ? 'bank-drag-over' : ''}`}
          role="region"
          aria-label="Phrase tile bank. Placed phrases may be dropped here to remove them from the line."
          onDragOver={(event) => {
            if (!draggingPlacedPhrase) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            setBankDragOver(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setBankDragOver(false);
            }
          }}
          onDrop={handleBankDrop}
        >
          <div className="bank-heading">
            <span>PHRASE TILES</span>
            <small>Drag tiles into the line or back here; click a tile for an alternative.</small>
          </div>
          <div className="tiles">
            {unused.length ? unused.map((phrase) => (
              <button
                className="phrase-tile"
                draggable
                key={phrase.id}
                onDragStart={(event) => beginDrag(event, phrase.id)}
                onDragEnd={finishDrag}
                onClick={() => {
                  const firstEmpty = slots.indexOf(null);
                  if (firstEmpty >= 0) {
                    onDrop(phrase.id, firstEmpty);
                    slotRefs.current[firstEmpty]?.focus();
                  }
                }}
              >
                <span>{phrase.text}</span>
                <small>da-DUM</small>
              </button>
            )) : <p className="all-placed">All phrases are on the line. Check your work.</p>}
          </div>
        </div>

        <div className="game-actions">
          <button className="secondary-button" onClick={() => {
            if (slots.some(Boolean) && window.confirm('Clear the phrases from this line?')) onReset();
          }}>Reset Line</button>
          <button className="primary-button" disabled={!isComplete(slots, challenge)} onClick={onCheck}>Check Answer <span aria-hidden="true">→</span></button>
        </div>
      </section>
    </main>
  );
}
