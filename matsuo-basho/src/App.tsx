import { useEffect, useMemo, useState } from "react";

type GameState = "briefing" | "playing" | "won" | "lost" | "farewell" | "wormhole" | "quiz" | "results";

type Poem = {
  title: string;
  season: string;
  lines: {
    syllables: number;
    correct: string;
    options: string[];
  }[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export const poems: Poem[] = [
  {
    title: "Moonlit River",
    season: "Autumn",
    lines: [
      {
        syllables: 5,
        correct: "Autumn moon rises",
        options: ["Autumn moon rises", "The moon rises slowly", "Crickets call at dusk"],
      },
      {
        syllables: 7,
        correct: "Over the sleeping river",
        options: ["Across the quiet stream", "Over the sleeping river", "Above the dark mountain"],
      },
      {
        syllables: 5,
        correct: "Gold trembles below",
        options: ["Golden light is trembling", "Gold trembles below", "A bright reflection"],
      },
    ],
  },
  {
    title: "Merchant's Garden",
    season: "Spring",
    lines: [
      {
        syllables: 5,
        correct: "Plum petals drift down",
        options: ["Plum petals drift down", "Flowers fall from the tree", "A warm breeze wanders"],
      },
      {
        syllables: 7,
        correct: "Through the merchant's garden gate",
        options: ["Past the old garden wall", "Through the merchant's garden gate", "Into a courtyard"],
      },
      {
        syllables: 5,
        correct: "Spring enters softly",
        options: ["Spring enters softly", "The new spring has arrived", "Softly comes the spring"],
      },
    ],
  },
  {
    title: "Road to Edo",
    season: "Dawn",
    lines: [
      {
        syllables: 5,
        correct: "Distant temple bell",
        options: ["A distant temple bell", "Distant temple bell", "Bronze bell in the mist"],
      },
      {
        syllables: 7,
        correct: "Echoes over cedar hills",
        options: ["Echoes over cedar hills", "Echoing through the forest", "It rings across the hills"],
      },
      {
        syllables: 5,
        correct: "Dawn warms the old road",
        options: ["Dawn warms the old road", "Morning warms the pathway", "The road welcomes dawn"],
      },
    ],
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    question: "During which period of Japanese history did Matsuo Bashō live?",
    options: ["Edo period", "Heian period", "Meiji period", "Kamakura period"],
    answer: "Edo period",
  },
  {
    question: "What poetic form is Bashō most closely associated with?",
    options: ["Haiku", "Sonnet", "Epic", "Ode"],
    answer: "Haiku",
  },
  {
    question: "What was Bashō's birth name?",
    options: ["Matsuo Kinsaku", "Tokugawa Ieyasu", "Yosa Buson", "Kobayashi Issa"],
    answer: "Matsuo Kinsaku",
  },
  {
    question: "In which year was Bashō born?",
    options: ["1644", "1544", "1744", "1844"],
    answer: "1644",
  },
  {
    question: "The name “Bashō” refers to which plant?",
    options: ["Banana plant", "Cherry tree", "Bamboo", "Plum tree"],
    answer: "Banana plant",
  },
  {
    question: "Which famous travel diary was written by Bashō?",
    options: ["The Narrow Road to the Deep North", "The Tale of Genji", "The Pillow Book", "Essays in Idleness"],
    answer: "The Narrow Road to the Deep North",
  },
  {
    question: "What creature jumps into the old pond in Bashō's best-known poem?",
    options: ["A frog", "A crane", "A carp", "A cicada"],
    answer: "A frog",
  },
  {
    question: "What sound follows the frog's jump in the old pond poem?",
    options: ["The sound of water", "A temple bell", "Rustling reeds", "Thunder"],
    answer: "The sound of water",
  },
  {
    question: "How many syllables are traditionally taught in an English-language haiku?",
    options: ["17", "14", "21", "12"],
    answer: "17",
  },
  {
    question: "What is the traditional English-language haiku syllable pattern?",
    options: ["5–7–5", "7–5–7", "4–4–4", "8–6–8"],
    answer: "5–7–5",
  },
  {
    question: "Bashō's poetry often draws its imagery from what source?",
    options: ["Nature and the seasons", "Courtroom debates", "Military strategy", "Trade accounts"],
    answer: "Nature and the seasons",
  },
  {
    question: "Before becoming a renowned poet, Bashō served in what role?",
    options: ["A samurai household servant", "A Buddhist abbot", "An imperial painter", "A shipbuilder"],
    answer: "A samurai household servant",
  },
  {
    question: "What Japanese term describes a seasonal word in haiku?",
    options: ["Kigo", "Kabuki", "Kana", "Koto"],
    answer: "Kigo",
  },
  {
    question: "What idea did Bashō seek by combining everyday scenes with spiritual depth?",
    options: ["Simplicity and insight", "Luxury and spectacle", "Political authority", "Strict realism alone"],
    answer: "Simplicity and insight",
  },
  {
    question: "Bashō traveled mainly to do what?",
    options: ["Observe, reflect, and write", "Command an army", "Collect taxes", "Study foreign law"],
    answer: "Observe, reflect, and write",
  },
  {
    question: "Which direction did Bashō's most famous journey take him from Edo?",
    options: ["North into rural Japan", "West across the sea", "South to Okinawa", "East to America"],
    answer: "North into rural Japan",
  },
  {
    question: "What was Edo later renamed?",
    options: ["Tokyo", "Kyoto", "Osaka", "Nara"],
    answer: "Tokyo",
  },
  {
    question: "In which year did Bashō die?",
    options: ["1694", "1594", "1794", "1894"],
    answer: "1694",
  },
  {
    question: "Which quality is central to Bashō's mature poetry?",
    options: ["Attention to fleeting moments", "Elaborate rhyme schemes", "Long heroic narratives", "Comic stage dialogue"],
    answer: "Attention to fleeting moments",
  },
  {
    question: "Which statement best describes Bashō's legacy?",
    options: ["He elevated haiku into a profound literary art", "He invented Japanese writing", "He founded the shogunate", "He translated the first Japanese novel"],
    answer: "He elevated haiku into a profound literary art",
  },
];

const initialTime = 16;

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={filled ? "heart heart-filled" : "heart"}
      viewBox="0 0 24 24"
    >
      <path d="M12 20.4 3.5 12A5.4 5.4 0 0 1 11 4.2L12 5.3l1-1.1A5.4 5.4 0 0 1 20.5 12Z" />
    </svg>
  );
}

function MarkIcon({ type }: { type: "check" | "lock" }) {
  return type === "check" ? (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10 4 4 8-8" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="5.5" y="9" width="9" height="7" rx="1.5" />
      <path d="M7.5 9V6.8a2.5 2.5 0 0 1 5 0V9" />
    </svg>
  );
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>("briefing");
  const [lives, setLives] = useState(3);
  const [poemIndex, setPoemIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [lockedLines, setLockedLines] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);

  const poem = poems[poemIndex];
  const line = poem.lines[lineIndex];
  const round = completed.length * 3 + lineIndex + 1;
  const timeLimit = Math.max(6, initialTime - attempts * 0.7 - (3 - lives) * 1.5);

  const options = useMemo(() => {
    return [...line.options].sort((a, b) => {
      const seedA = a.charCodeAt(0) + round + poemIndex;
      const seedB = b.charCodeAt(0) + round + poemIndex;
      return seedA - seedB;
    });
  }, [line, poemIndex, round]);

  const currentQuizOptions = useMemo(() => {
    const options = quizQuestions[quizIndex].options;
    const offset = quizIndex % options.length;
    return [...options.slice(offset), ...options.slice(0, offset)];
  }, [quizIndex]);

  const resetGame = () => {
    setLives(3);
    setPoemIndex(0);
    setLineIndex(0);
    setCompleted([]);
    setLockedLines([]);
    setAttempts(0);
    setFeedback(null);
    setTimeLeft(initialTime);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizChoice(null);
    setGameState("playing");
  };

  const beginFarewell = () => {
    setGameState("farewell");
  };

  const enterWormhole = () => {
    setGameState("wormhole");
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizChoice(null);
    setGameState("quiz");
  };

  const moveToNextPoem = (finishedIndex: number, finished: number[]) => {
    const next = poems.findIndex((_, index) => index !== finishedIndex && !finished.includes(index));
    return next === -1 ? poems.findIndex((_, index) => !finished.includes(index)) : next;
  };

  const loseLife = () => {
    if (feedback) return;
    setFeedback("wrong");
    const nextLives = lives - 1;
    setLives(nextLives);
    setAttempts((value) => value + 1);

    window.setTimeout(() => {
      if (nextLives <= 0) {
        setGameState("lost");
        return;
      }
      const nextPoem = moveToNextPoem(poemIndex, completed);
      setPoemIndex(nextPoem === -1 ? poemIndex : nextPoem);
      setLineIndex(0);
      setLockedLines([]);
      setFeedback(null);
      setTimeLeft(Math.max(6, initialTime - (attempts + 1) * 0.7 - (3 - nextLives) * 1.5));
    }, 850);
  };

  useEffect(() => {
    if (gameState !== "playing" || feedback) return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 0.1) {
          window.clearInterval(timer);
          window.setTimeout(loseLife, 0);
          return 0;
        }
        return value - 0.1;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [gameState, feedback, poemIndex, lineIndex, lives, attempts]);

  useEffect(() => {
    if (gameState !== "wormhole") return;
    const transition = window.setTimeout(() => setGameState("quiz"), 2600);
    return () => window.clearTimeout(transition);
  }, [gameState]);

  const chooseLine = (choice: string) => {
    if (feedback || gameState !== "playing") return;

    if (choice !== line.correct) {
      loseLife();
      return;
    }

    setAttempts((value) => value + 1);
    setFeedback("correct");
    const nextLocked = [...lockedLines, choice];
    setLockedLines(nextLocked);

    window.setTimeout(() => {
      if (lineIndex === 2) {
        const nextCompleted = [...completed, poemIndex];
        setCompleted(nextCompleted);
        if (nextCompleted.length === poems.length) {
          setGameState("won");
          return;
        }
        const nextPoem = moveToNextPoem(poemIndex, nextCompleted);
        setPoemIndex(nextPoem);
        setLineIndex(0);
        setLockedLines([]);
      } else {
        setLineIndex((value) => value + 1);
      }
      setFeedback(null);
      setTimeLeft(Math.max(6, initialTime - (attempts + 1) * 0.7 - (3 - lives) * 1.5));
    }, 650);
  };

  const answerQuestion = (choice: string) => {
    if (quizChoice || gameState !== "quiz") return;
    const isCorrect = choice === quizQuestions[quizIndex].answer;
    setQuizChoice(choice);
    if (isCorrect) setQuizScore((score) => score + 10);

    window.setTimeout(() => {
      if (quizIndex === quizQuestions.length - 1) {
        setGameState("results");
      } else {
        setQuizIndex((index) => index + 1);
        setQuizChoice(null);
      }
    }, 700);
  };

  return (
    <main className={`game-shell ${gameState === "wormhole" || gameState === "quiz" || gameState === "results" ? "beyond" : ""}`}>
      <div className="sun" />
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="mountains mountains-far" />
      <div className="mountains mountains-near" />
      <div className="mist mist-one" />
      <div className="mist mist-two" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">俳</span>
          <div>
            <span className="eyebrow">Tales of the Genroku</span>
            <strong>The Poet&apos;s Path</strong>
          </div>
        </div>
        <div className="era-label">
          <span>元禄</span>
          Genroku Era · 1688
        </div>
      </header>

      {gameState === "playing" && (
        <section className="game-layout">
          <aside className="journey-panel paper">
            <div className="panel-heading">
              <span className="vertical-jp">旅の記</span>
              <div>
                <p className="kicker">Bashō&apos;s journey</p>
                <h2>Win the patron&apos;s heart</h2>
              </div>
            </div>

            <div className="portrait">
              <div className="portrait-sun" />
              <div className="basho-silhouette">
                <div className="hat" />
                <div className="head" />
                <div className="robe" />
                <div className="staff" />
              </div>
              <p>Matsuo Bashō</p>
            </div>

            <div className="lives-block">
              <span>Honor</span>
              <div className="hearts" aria-label={`${lives} lives remaining`}>
                {[0, 1, 2].map((heart) => (
                  <Heart key={heart} filled={heart < lives} />
                ))}
              </div>
            </div>

            <div className="poem-map">
              {poems.map((item, index) => {
                const isComplete = completed.includes(index);
                const isActive = index === poemIndex;
                return (
                  <div className={`map-item ${isActive ? "active" : ""}`} key={item.title}>
                    <span className="map-icon">
                      <MarkIcon type={isComplete ? "check" : "lock"} />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{isComplete ? "Haiku completed" : isActive ? "In progress" : "Awaiting verse"}</small>
                    </div>
                  </div>
                );
              })}
            </div>

            <blockquote>
              “A good poem is one in which the form of the verse and the joining of its parts seem light as a shallow river.”
            </blockquote>
          </aside>

          <section className="play-panel paper">
            <div className="round-row">
              <span>Round {round} of 9</span>
              <div className="round-pips" aria-hidden="true">
                {Array.from({ length: 9 }).map((_, index) => (
                  <i className={index < round ? "filled" : ""} key={index} />
                ))}
              </div>
              <span>{poem.season} verse</span>
            </div>

            <div className="prompt">
              <div className="syllable-seal">
                <strong>{line.syllables}</strong>
                <span>syllables</span>
              </div>
              <div>
                <p className="kicker">Complete the next line</p>
                <h1>Choose a line with <em>{line.syllables} syllables</em></h1>
                <p>Listen for the rhythm. Keep the image and season in harmony.</p>
              </div>
            </div>

            <div className="poem-sheet">
              <div className="poem-label">
                <span>{poem.title}</span>
                <i />
              </div>
              <div className="verse-lines">
                {[0, 1, 2].map((index) => (
                  <div className={`verse-line ${index === lineIndex ? "current" : ""}`} key={index}>
                    <span>{index + 1}</span>
                    {lockedLines[index] ? (
                      <strong>{lockedLines[index]}</strong>
                    ) : index === lineIndex ? (
                      <em>Your next line…</em>
                    ) : (
                      <i>—</i>
                    )}
                    <small>{poem.lines[index].syllables}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="choices">
              {options.map((option, index) => (
                <button
                  className={feedback && option === line.correct ? "correct" : feedback === "wrong" ? "disabled" : ""}
                  disabled={Boolean(feedback)}
                  key={option}
                  onClick={() => chooseLine(option)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                  <i>選</i>
                </button>
              ))}
            </div>

            <div className="timer-row">
              <span className="timer-label">Time to reflect</span>
              <div className="timer-track">
                <i style={{ width: `${Math.max(0, (timeLeft / timeLimit) * 100)}%` }} />
              </div>
              <strong>{Math.ceil(timeLeft)}s</strong>
            </div>

            {feedback && (
              <div className={`feedback ${feedback}`}>
                {feedback === "correct"
                  ? "The rhythm holds. The verse flows onward."
                  : "The rhythm breaks. Honor is lost, and a new poem awaits."}
              </div>
            )}
          </section>
        </section>
      )}

      {["briefing", "won", "lost"].includes(gameState) && (
        <section className={`story-card paper ${gameState}`}>
          <span className="story-seal">{gameState === "won" ? "誉" : gameState === "lost" ? "罪" : "旅"}</span>
          <p className="kicker">
            {gameState === "briefing" ? "A literary trial" : gameState === "won" ? "A heart moved by verse" : "A grave offense"}
          </p>
          <h1>
            {gameState === "briefing"
              ? "Help Bashō find his patron"
              : gameState === "won"
                ? "The road opens before you"
                : "Exiled for crimes against the arts"}
          </h1>
          <div className="brush-divider"><i /></div>
          <p className="story-copy">
            {gameState === "briefing"
              ? "Genroku Japan is alive with art and ambition. Compose three haiku in the sacred 5–7–5 form before time slips away, and help Matsuo Bashō earn the support of a merchant patron."
              : gameState === "won"
                ? "Your verses have touched the merchant's heart. With his patronage secured, Bashō can now travel the roads of Japan and turn each passing season into poetry."
                : "Three broken verses have exhausted the merchant's patience. You are sent to a faraway island, where only the gulls remain to hear your unfinished poems."}
          </p>

          {gameState === "briefing" && (
            <div className="rules">
              <div><strong>5</strong><span>First line</span></div>
              <i />
              <div><strong>7</strong><span>Second line</span></div>
              <i />
              <div><strong>5</strong><span>Final line</span></div>
            </div>
          )}

          {gameState === "won" && (
            <div className="completed-haiku">
              <span>An old silent pond</span>
              <span>A frog jumps into the pond—</span>
              <span>Splash! Silence again.</span>
              <small>— Matsuo Bashō</small>
            </div>
          )}

          <button
            className="primary-button"
            onClick={gameState === "won" ? beginFarewell : resetGame}
          >
            {gameState === "briefing" ? "Begin the journey" : gameState === "won" ? "Continue down the road" : "Walk the path again"}
            <span>→</span>
          </button>
          <small className="hint">
            {gameState === "won" ? "A final word from Bashō awaits" : "Three lives · Nine lines · Time quickens each round"}
          </small>
        </section>
      )}

      {gameState === "farewell" && (
        <section className="farewell-scene" aria-labelledby="farewell-title">
          <div className="farewell-figure" aria-hidden="true">
            <div className="traveler-hat" />
            <div className="traveler-head" />
            <div className="traveler-robe" />
            <div className="traveler-staff" />
          </div>
          <div className="farewell-card paper">
            <p className="kicker">At the parting road</p>
            <h1 id="farewell-title">Until our paths cross again</h1>
            <div className="brush-divider"><i /></div>
            <blockquote>
              “You have learned to hear the world between words. Carry that quiet attention with you, traveler.”
            </blockquote>
            <p className="basho-signature">— Matsuo Bashō</p>
            <button className="primary-button" onClick={enterWormhole}>
              Bid Bashō farewell <span>→</span>
            </button>
          </div>
        </section>
      )}

      {gameState === "wormhole" && (
        <section className="wormhole-scene" aria-live="polite">
          <div className="wormhole" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <div className="falling-traveler" aria-hidden="true">旅</div>
          <p>Time folds around you…</p>
        </section>
      )}

      {(gameState === "quiz" || gameState === "results") && (
        <div className="quiz-stage">
          <div className="quiz-glow" aria-hidden="true" />
          {gameState === "quiz" ? (
            <section className="quiz-popup paper" aria-labelledby="quiz-question">
              <div className="quiz-topline">
                <div>
                  <p className="kicker">The scholar&apos;s trial</p>
                  <span>Question {quizIndex + 1} of {quizQuestions.length}</span>
                </div>
                <div className="score-seal">
                  <strong>{quizScore}</strong>
                  <small>points</small>
                </div>
              </div>
              <div className="quiz-progress" aria-label={`${quizIndex + 1} of 20 questions`}>
                <i style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} />
              </div>
              <h1 id="quiz-question">{quizQuestions[quizIndex].question}</h1>
              <div className="quiz-choices">
                {currentQuizOptions.map((option, index) => {
                  const correct = quizChoice && option === quizQuestions[quizIndex].answer;
                  const wrong = quizChoice === option && !correct;
                  return (
                    <button
                      className={correct ? "correct" : wrong ? "wrong" : ""}
                      disabled={Boolean(quizChoice)}
                      key={option}
                      onClick={() => answerQuestion(option)}
                    >
                      <span>{String.fromCharCode(65 + index)}</span>
                      {option}
                    </button>
                  );
                })}
              </div>
              <p className="quiz-note">
                {quizChoice
                  ? quizChoice === quizQuestions[quizIndex].answer
                    ? "Correct · +10 points"
                    : `The answer was: ${quizQuestions[quizIndex].answer}`
                  : "Choose carefully. Each correct answer is worth 10 points."}
              </p>
            </section>
          ) : (
            <section className={`results-popup paper ${quizScore >= 150 ? "passed" : "retry"}`}>
              <span className="story-seal">{quizScore >= 150 ? "誉" : "学"}</span>
              <p className="kicker">The journey remembered</p>
              <h1>{quizScore >= 150 ? "Congrats!" : "Come back another time to study him again…"}</h1>
              <div className="final-score">
                <strong>{quizScore}</strong>
                <span>out of 200 points</span>
              </div>
              <p>
                {quizScore >= 150
                  ? "You carried Bashō's lessons through the turning of time. Your knowledge is worthy of the poet's path."
                  : "The road to understanding is walked more than once. Return to Bashō's life and poems, then try the trial again."}
              </p>
              <button className="primary-button" onClick={quizScore >= 150 ? resetGame : restartQuiz}>
                {quizScore >= 150 ? "Begin a new journey" : "Try the questions again"}
                <span>→</span>
              </button>
            </section>
          )}
        </div>
      )}

      <footer>
        <span>松尾 芭蕉</span>
        <p>Every day is a journey, and the journey itself is home.</p>
      </footer>
    </main>
  );
}

