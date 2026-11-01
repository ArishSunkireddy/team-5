import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type Round = {
  scramble: string;
  answer: string;
  displayAnswer: string;
  eyebrow: string;
  explanation: string;
};

type TriviaQuestion = {
  question: ReactNode;
  options: string[];
  answer: string;
  explanation: string;
};

const rounds: Round[] = [
  {
    scramble: "HTE AVERN",
    answer: "the raven",
    displayAnswer: "The Raven",
    eyebrow: "A mournful visitor",
    explanation:
      "First published in 1845, this dark poem follows a grieving man visited by a mysterious raven. Its repeated cry of “Nevermore” draws him deeper into sorrow, memory, and madness.",
  },
  {
    scramble: "ETH LELT–LAET HTERA",
    answer: "the tell tale heart",
    displayAnswer: "The Tell-Tale Heart",
    eyebrow: "A sound beneath the floor",
    explanation:
      "Poe’s 1843 story is told by an unreliable narrator who insists on his sanity after committing murder. Haunted by what sounds like a beating heart, his guilt becomes impossible to silence.",
  },
  {
    scramble: "ETH KCALB TAC",
    answer: "the black cat",
    displayAnswer: "The Black Cat",
    eyebrow: "A shadow with nine lives",
    explanation:
      "In this unsettling tale, cruelty, superstition, and guilt overtake the narrator. A black cat becomes both a witness to his crimes and a symbol of the conscience he cannot escape.",
  },
  {
    scramble: "BANNAEL EEL",
    answer: "annabel lee",
    displayAnswer: "Annabel Lee",
    eyebrow: "A kingdom by the sea",
    explanation:
      "This lyrical poem remembers a love so powerful that even death cannot end it. Poe blends beauty and grief as the speaker mourns Annabel Lee beside the sounding sea.",
  },
  {
    scramble: "ETH QUMASE FO ETH DER HATDE",
    answer: "the masque of the red death",
    displayAnswer: "The Masque of the Red Death",
    eyebrow: "No wall can keep it out",
    explanation:
      "Prince Prospero hides from a plague inside a lavish abbey, but death arrives at his masquerade anyway. The story warns that wealth and privilege cannot provide refuge from mortality.",
  },
];

const triviaQuestions: TriviaQuestion[] = [
  {
    question: (
      <>
        Under what name was Poe’s first published collection,{" "}
        <em>Tamerlane and Other Poems</em>, credited?
      </>
    ),
    options: [
      "By a Bostonian",
      "The Midnight Poet",
      "Edgar Perry",
      "The Raven",
    ],
    answer: "By a Bostonian",
    explanation:
      "The 1827 collection was credited simply to “A Bostonian.” Only about 50 copies were printed, making it one of the rarest books in American literature.",
  },
  {
    question: "In which American city was Edgar Allan Poe born?",
    options: ["Baltimore", "Richmond", "Boston", "Philadelphia"],
    answer: "Boston",
    explanation:
      "Poe was born in Boston, Massachusetts, on January 19, 1809. Although he had complicated feelings about the city, his birthplace now honors him with a public statue.",
  },
  {
    question: (
      <>
        Which Poe story introduced the brilliant detective C. Auguste Dupin?
      </>
    ),
    options: [
      "The Gold-Bug",
      "The Murders in the Rue Morgue",
      "The Black Cat",
      "The Purloined Letter",
    ],
    answer: "The Murders in the Rue Morgue",
    explanation:
      "Published in 1841, “The Murders in the Rue Morgue” is often called the first modern detective story. Dupin’s analytical methods inspired generations of fictional detectives.",
  },
  {
    question: "What was the name of Poe’s wife and literary muse?",
    options: ["Lenore Poe", "Virginia Clemm", "Sarah Whitman", "Annabel Allan"],
    answer: "Virginia Clemm",
    explanation:
      "Poe married Virginia Clemm in 1836. Her long illness and death in 1847 deeply affected him and are often connected to the recurring themes of beauty, love, and loss in his work.",
  },
  {
    question: "How old was Edgar Allan Poe when he died in 1849?",
    options: ["32", "40", "47", "55"],
    answer: "40",
    explanation:
      "Poe died in Baltimore on October 7, 1849, at age 40. The exact cause of his death remains unknown, adding one final mystery to his remarkable life.",
  },
  {
    question: "What single word does the raven repeat in Poe’s famous poem?",
    options: ["Forever", "Nevermore", "Lenore", "Remember"],
    answer: "Nevermore",
    explanation:
      "The raven answers every question with “Nevermore.” As the poem continues, the word becomes an increasingly painful reflection of the speaker’s grief and despair.",
  },
  {
    question: "Who served as Poe’s foster father after his mother died?",
    options: ["John Allan", "Rufus Griswold", "Thomas Clemm", "Henry Herring"],
    answer: "John Allan",
    explanation:
      "Richmond merchant John Allan and his wife Frances took Poe into their home. Poe was never formally adopted, but he added Allan to his name.",
  },
  {
    question: "Which university did Poe attend briefly in 1826?",
    options: ["Harvard University", "Yale University", "University of Virginia", "West Point"],
    answer: "University of Virginia",
    explanation:
      "Poe studied ancient and modern languages at the University of Virginia. He left after less than a year amid financial difficulties and conflict with John Allan.",
  },
  {
    question: "What name did Poe use when he enlisted in the United States Army?",
    options: ["Edgar A. Perry", "Arthur Gordon Pym", "William Wilson", "C. Auguste Dupin"],
    answer: "Edgar A. Perry",
    explanation:
      "In 1827, Poe enlisted under the name Edgar A. Perry and gave a false age of 22. He was actually only 18 years old.",
  },
  {
    question: "Which literary tradition is Poe most closely associated with?",
    options: ["Pastoral comedy", "Gothic fiction", "Epic poetry", "Realism"],
    answer: "Gothic fiction",
    explanation:
      "Poe became a defining figure in American Gothic literature through settings and themes shaped by dread, isolation, madness, death, and the supernatural.",
  },
  {
    question: "Which newspaper first published “The Raven” under Poe’s name?",
    options: ["The New York Evening Mirror", "The Baltimore Sun", "The Boston Gazette", "The Richmond Times"],
    answer: "The New York Evening Mirror",
    explanation:
      "The New York Evening Mirror published “The Raven” on January 29, 1845. The poem brought Poe immediate national recognition.",
  },
  {
    question: (
      <>
        In <em>The Fall of the House of Usher</em>, what is the name of
        Roderick’s sister?
      </>
    ),
    options: ["Lenore", "Ligeia", "Madeline", "Morella"],
    answer: "Madeline",
    explanation:
      "Madeline Usher is Roderick’s twin sister. Her mysterious illness, premature burial, and return are central to the story’s terrifying conclusion.",
  },
  {
    question: (
      <>
        What historical institution imprisons the narrator of{" "}
        <em>The Pit and the Pendulum</em>?
      </>
    ),
    options: ["The Spanish Inquisition", "The Roman Senate", "The French Court", "The British Navy"],
    answer: "The Spanish Inquisition",
    explanation:
      "The unnamed narrator is sentenced by the Spanish Inquisition and subjected to elaborate psychological and physical torments inside a dark dungeon.",
  },
  {
    question: (
      <>
        Who is sealed behind a brick wall in <em>The Cask of Amontillado</em>?
      </>
    ),
    options: ["Montresor", "Fortunato", "Dupin", "Prospero"],
    answer: "Fortunato",
    explanation:
      "Montresor lures Fortunato into the catacombs with the promise of rare Amontillado wine, then chains him in a niche and walls him in alive.",
  },
  {
    question: "What is Edgar Allan Poe’s birth surname?",
    options: ["Allan", "Poe", "Clemm", "Arnold"],
    answer: "Poe",
    explanation:
      "Poe was born Edgar Poe. “Allan” came from his foster family, John and Frances Allan, though they never formally adopted him.",
  },
  {
    question: "In which city did Poe die under mysterious circumstances?",
    options: ["Boston", "New York", "Richmond", "Baltimore"],
    answer: "Baltimore",
    explanation:
      "Poe was found delirious in Baltimore and died several days later at Washington College Hospital. The cause of his condition remains disputed.",
  },
  {
    question: (
      <>
        Which Poe poem imitates sounds ranging from cheerful chimes to funeral
        tolls?
      </>
    ),
    options: ["The Bells", "Ulalume", "To Helen", "A Dream Within a Dream"],
    answer: "The Bells",
    explanation:
      "“The Bells” uses repetition, rhythm, and sound to move through silver sleigh bells, golden wedding bells, alarm bells, and solemn iron funeral bells.",
  },
  {
    question: "Which essay explains Poe’s method for composing “The Raven”?",
    options: ["The Poetic Principle", "The Philosophy of Composition", "Eureka", "The Imp of the Perverse"],
    answer: "The Philosophy of Composition",
    explanation:
      "In “The Philosophy of Composition,” Poe claims that he built “The Raven” methodically, choosing its length, effect, refrain, and subject with deliberate care.",
  },
  {
    question: "Which Richmond magazine employed Poe as an editor and critic?",
    options: ["Graham’s Magazine", "The Broadway Journal", "Southern Literary Messenger", "Burton’s Gentleman’s Magazine"],
    answer: "Southern Literary Messenger",
    explanation:
      "Poe worked at the Southern Literary Messenger in Richmond during the 1830s. His sharp reviews helped establish his reputation as a formidable literary critic.",
  },
  {
    question: (
      <>
        What is the name of the prince in <em>The Masque of the Red Death</em>?
      </>
    ),
    options: ["Prince Prospero", "Prince Fortunato", "Prince Usher", "Prince Pluto"],
    answer: "Prince Prospero",
    explanation:
      "Prince Prospero attempts to escape a devastating plague by hiding with wealthy guests in a secluded abbey, but the Red Death enters their masquerade.",
  },
];

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z]/g, "");

function FeatherIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.6 3.4c-4.9-.7-9.3 1-12.3 4.1-2.4 2.4-3.6 5.2-3.8 8.2l-2.2 2.2a1 1 0 0 0 1.4 1.4l2.1-2.1c3.1-.1 6-1.4 8.4-3.8 3-3 4.8-7.4 4.1-12.3l2.3 2.3Z" />
      <path d="m5.8 17.2 7.7-7.7M8.1 14.9l.3-4.2M8.1 14.9l4.2-.3" />
    </svg>
  );
}

function App() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [resolved, setResolved] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [showTrivia, setShowTrivia] = useState(false);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaAnswer, setTriviaAnswer] = useState<string | null>(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const round = rounds[roundIndex];

  useEffect(() => {
    if (!resolved && !finished) inputRef.current?.focus();
  }, [roundIndex, resolved, finished]);

  function submitGuess(event: FormEvent) {
    event.preventDefault();
    const trimmedGuess = guess.trim();
    if (!trimmedGuess || resolved) return;

    if (normalize(trimmedGuess) === normalize(round.answer)) {
      setGuesses((current) => [...current, trimmedGuess]);
      setScore((current) => current + 1);
      setResolved("correct");
      setGuess("");
      return;
    }

    const nextGuesses = [...guesses, trimmedGuess];
    setGuesses(nextGuesses);
    setGuess("");
    if (nextGuesses.length === 3) setResolved("incorrect");
  }

  function nextRound() {
    if (roundIndex === rounds.length - 1) {
      setResolved(null);
      setShowTrivia(true);
      return;
    }
    setRoundIndex((current) => current + 1);
    setGuesses([]);
    setGuess("");
    setResolved(null);
  }

  function restart() {
    setRoundIndex(0);
    setGuess("");
    setGuesses([]);
    setScore(0);
    setResolved(null);
    setShowTrivia(false);
    setTriviaIndex(0);
    setTriviaAnswer(null);
    setTriviaScore(0);
    setFinished(false);
  }

  if (showTrivia) {
    const trivia = triviaQuestions[triviaIndex];
    const triviaCorrect = triviaAnswer === trivia.answer;

    function selectTriviaAnswer(option: string) {
      setTriviaAnswer(option);
      if (option === trivia.answer) {
        setTriviaScore((current) => current + 10);
      }
    }

    function nextTriviaQuestion() {
      if (triviaIndex === triviaQuestions.length - 1) {
        setShowTrivia(false);
        setFinished(true);
        return;
      }
      setTriviaIndex((current) => current + 1);
      setTriviaAnswer(null);
    }

    return (
      <main className="trivia-screen">
        <div className="trivia-image" aria-hidden="true" />
        <section className="trivia-card">
          <div className="trivia-meta">
            <span>Question {triviaIndex + 1} of {triviaQuestions.length}</span>
            <span>{triviaScore} points</span>
          </div>
          <div className="trivia-progress" aria-hidden="true">
            {triviaQuestions.map((item, index) => (
              <span
                key={item.answer}
                className={index <= triviaIndex ? "active" : ""}
              />
            ))}
          </div>
          <p className="kicker">Bonus trivia</p>
          <h1>From the archives.</h1>
          <p className="trivia-question">{trivia.question}</p>

          <div className="trivia-options">
            {trivia.options.map((option, index) => {
              const isSelected = triviaAnswer === option;
              const isAnswer = option === trivia.answer;
              const optionState = triviaAnswer
                ? isAnswer
                  ? "correct"
                  : isSelected
                    ? "incorrect"
                    : "dimmed"
                : "";

              return (
                <button
                  key={option}
                  className={`trivia-option ${optionState}`}
                  onClick={() => selectTriviaAnswer(option)}
                  disabled={Boolean(triviaAnswer)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                  {triviaAnswer && isAnswer && <b aria-label="Correct">✓</b>}
                  {triviaAnswer && isSelected && !isAnswer && (
                    <b aria-label="Incorrect">×</b>
                  )}
                </button>
              );
            })}
          </div>

          {triviaAnswer && (
            <div className="trivia-reveal" aria-live="polite">
              <strong>{triviaCorrect ? "Correct." : "A curious twist."}</strong>
              <p>{trivia.explanation}</p>
              <button className="primary-button" onClick={nextTriviaQuestion}>
                {triviaIndex === triviaQuestions.length - 1
                  ? "See your ending"
                  : "Next question"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  if (finished) {
    const won = triviaScore >= 150;
    return (
      <main className={`ending-screen ${won ? "good-ending" : "bad-ending"}`}>
        <div className="ending-image" aria-hidden="true" />
        <div className="ending-shade" aria-hidden="true" />
        <section className="ending-content">
          <div className="ending-mark">
            <FeatherIcon />
          </div>
          <p className="kicker">The final page</p>
          <h1>{won ? "Congratulations!" : "Nevermore."}</h1>
          <p className="ending-copy">
            {won
              ? `You earned ${triviaScore} of 200 trivia points and solved ${score} of 5 mysteries. Poe’s collection awaits.`
              : `You earned ${triviaScore} of 200 trivia points. Come back another time to study Edgar Allan Poe.`}
          </p>
          {won && (
            <div className="book-display" aria-label="Your Poe collection">
              <span>The Raven</span>
              <span>Tales of Mystery</span>
              <span>Annabel Lee</span>
              <span>Selected Works</span>
            </div>
          )}
          <button className="primary-button ending-button" onClick={restart}>
            Return to the first page
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="game-panel">
        <header className="topbar">
          <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
            <span className="brand-icon">
              <FeatherIcon />
            </span>
            <span>
              <strong>Poe’s Puzzle</strong>
              <small>A literary anagram</small>
            </span>
          </a>
          <div className="score">
            <span>Score</span>
            <strong>{score}</strong>
            <span>/ 5</span>
          </div>
        </header>

        <div className="round-progress" aria-label={`Round ${roundIndex + 1} of 5`}>
          <div className="progress-copy">
            <span>Round {String(roundIndex + 1).padStart(2, "0")}</span>
            <span>of 05</span>
          </div>
          <div className="progress-track">
            {rounds.map((item, index) => (
              <span
                key={item.answer}
                className={index <= roundIndex ? "active" : ""}
              />
            ))}
          </div>
        </div>

        <div className="game-content">
          <p className="kicker">Unscramble the work</p>
          <h1>Rearrange the letters.</h1>
          <p className="prompt">
            Name the Poe title hidden below. Punctuation and spaces do not
            matter.
          </p>

          <div className="scramble-card">
            <span className="card-corner top-left" />
            <span className="card-corner top-right" />
            <span className="card-corner bottom-left" />
            <span className="card-corner bottom-right" />
            <small>{round.eyebrow}</small>
            <div className="scramble">{round.scramble}</div>
          </div>

          <div className="attempt-header">
            <span>Your answer</span>
            <span>{3 - guesses.length} attempts remaining</span>
          </div>

          <form className="guess-form" onSubmit={submitGuess}>
            <input
              ref={inputRef}
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              placeholder="Type the title here..."
              aria-label="Your answer"
              disabled={Boolean(resolved)}
              autoComplete="off"
            />
            <button
              className="primary-button"
              type="submit"
              disabled={!guess.trim() || Boolean(resolved)}
            >
              Submit guess
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="guess-history" aria-live="polite">
            {[0, 1, 2].map((index) => (
              <div
                className={`history-row ${guesses[index] ? "filled" : ""}`}
                key={index}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{guesses[index] || "Awaiting your guess"}</p>
                {guesses[index] && (
                  <span className="miss" aria-label="Incorrect">
                    ×
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="atmosphere-panel">
        <div className="photo-credit">
          Photo by Peter Herrmann <span>on Unsplash</span>
        </div>
        <blockquote>
          “Words have no power to impress the mind without the exquisite horror
          of their reality.”
          <cite>— Edgar Allan Poe</cite>
        </blockquote>
        <div className="ornament" aria-hidden="true">
          <span />
          <b>EP</b>
          <span />
        </div>
      </aside>

      {resolved && (
        <div className="reveal-backdrop" role="presentation">
          <section
            className={`reveal-card ${resolved}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reveal-title"
          >
            <div className="reveal-icon" aria-hidden="true">
              {resolved === "correct" ? "✓" : "×"}
            </div>
            <p className="kicker">
              {resolved === "correct" ? "A mystery solved" : "The answer revealed"}
            </p>
            <h2 id="reveal-title">
              {resolved === "correct" ? "Well read." : "Not this time."}
            </h2>
            <p className="answer-line">
              The answer is <strong>“{round.displayAnswer}.”</strong>
            </p>
            <div className="reveal-rule" />
            <p className="explanation">{round.explanation}</p>
            <button className="primary-button" onClick={nextRound}>
              {roundIndex === rounds.length - 1
                ? "Enter bonus trivia"
                : "Turn the page"}
              <span aria-hidden="true">→</span>
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
