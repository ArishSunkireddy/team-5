import { useReducer } from 'react';
import { poemChallenges } from './data/poemChallenges';
import { gameReducer, initialState } from './game/state';
import Intro from './components/Intro';
import PoetryBoard from './components/PoetryBoard';
import RoundFeedback from './components/RoundFeedback';
import FinalResults from './components/FinalResults';
import { TrailHeader } from './components/Presentation';

// Landscape and screen composition adapted from the Figma Make prototype.
export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState());
  const challenge = poemChallenges[state.roundIndex];
  const onReturn = () => {
    if (window.confirm('Return to the introduction? Your current progress will be reset.')) dispatch({ type: 'return' });
  };
  return (
    <div className="app-shell">
      <div className="landscape" aria-hidden="true">
        <div className="sun" />
        <div className="mountain mountain-one" />
        <div className="mountain mountain-two" />
        <div className="ground-line" />
      </div>
      <TrailHeader onReturn={state.screen === 'intro' ? undefined : onReturn} />
      {state.screen === 'intro' && <Intro totalRounds={poemChallenges.length} onStart={() => dispatch({ type: 'start' })} />}
      {state.screen === 'game' && <PoetryBoard
        key={challenge.id} challenge={challenge} roundIndex={state.roundIndex}
        totalRounds={poemChallenges.length} score={state.awardedRounds.length} slots={state.slots}
        onDrop={(id, index) => dispatch({ type: 'place', id, index })}
        onRemove={(index) => dispatch({ type: 'remove', index })}
        onCheck={() => dispatch({ type: 'check' })}
        onReset={() => dispatch({ type: 'reset-line' })}
      />}
      {state.screen === 'feedback' && <RoundFeedback
        challenge={challenge} slots={state.slots} result={state.result} roundIndex={state.roundIndex}
        totalRounds={poemChallenges.length} score={state.awardedRounds.length}
        onTryAgain={() => dispatch({ type: 'retry' })} onNext={() => dispatch({ type: 'next' })}
      />}
      {state.screen === 'final' && <FinalResults
        score={state.awardedRounds.length} totalRounds={poemChallenges.length}
        onPlayAgain={() => dispatch({ type: 'restart' })} onReturn={onReturn}
      />}
      <footer>THE POET&apos;S TRAIL · FIELD EDITION 1847</footer>
    </div>
  );
}
