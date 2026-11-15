import { useState } from "react";
import { questions } from "./questions";
import { shuffleQuiz } from "./shuffle";
import PoeGame from "./EdgarAllanPoeApp.review";
import BashoGame from "./MatsuoBashoApp.review";

type Screen =
  /* ==========================================
     START NEW: Added prologue & return screens
     ========================================== */
  | "worksheet" | "timetravel" | "meeting" | "home"
  /* ==========================================
     STOP NEW: Added prologue & return screens
     ========================================== */
  | "history" | "choice" | "mystery" | "nationalism"
  | "context2" | "choice2" | "rome" | "forest"
  | "context3" | "choice3" | "scotland" | "sea"
  | "farewell" | "returnTravel" | "quiz" | "complete";
  | "farewell" | "returnTravel" | "quiz" | "poe" | "basho" | "complete";

function ShakespearePortrait({ cheering = false }: { cheering?: boolean }) {
  return (
    <svg
      className={`portrait ${cheering ? "portrait-cheering" : ""}`}
      viewBox="0 0 420 620"
      role="img"
      aria-label={cheering ? "Shakespeare cheering" : "Portrait of William Shakespeare"}
    >
      {cheering && (
        <>
          <path className="portrait-arm" d="M158 394C105 337 68 282 47 216" />
          <path className="portrait-arm" d="M263 394c52-60 91-116 107-184" />
        </>
      )}
      <path className="portrait-body" d="M126 378c34-25 133-25 168 0l41 219H84z" />
      <path className="portrait-detail" d="M210 378v219M116 456h189M99 531h224" />
      <path className="portrait-ruff" d="M128 374l22-48 27 38 32-45 31 45 29-38 23 49c-50 23-113 23-164-1z" />
      <ellipse className="portrait-face" cx="210" cy="258" rx="86" ry="105" />
      <path className="portrait-hair" d="M128 273c-28-43-14-115 34-133 31-42 105-26 121 29 39 27 27 92 3 113l-16-52c-25-9-45-27-61-52-20 27-45 42-75 46z" />
      <path className="portrait-beard" d="M143 279c19 16 41 23 67 23 27 0 52-9 70-25-8 69-37 97-70 115-34-18-60-48-67-113z" />
      <path className="portrait-lines" d="M170 252h20m39 0h20m-48 31c8 5 16 5 24 0m-35 38c15 10 32 10 48 0" />
    </svg>
  );
}

function Choice({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <button className="choice-box" onClick={onClick}>
      <strong>{title}</strong>
    </button>
  );
}

export default function App() {
  /* ==========================================
     START NEW LINE: Default screen set to "worksheet"
     ========================================== */
  const [screen, setScreen] = useState<Screen>("worksheet");
  /* ==========================================
     STOP NEW LINE: Default screen set to "worksheet"
     ========================================== */
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  // A fresh order on every playthrough, so replays can't be won by memorizing positions.
  const [quizQuestions, setQuizQuestions] = useState(() => shuffleQuiz(questions));
  const resultScreens: Screen[] = ["mystery", "nationalism", "rome", "forest", "scotland", "sea"];
  const result = resultScreens.includes(screen);
  const success = ["nationalism", "rome", "scotland"].includes(screen);
  const choiceRound =
    screen === "context2" || screen === "choice2" ? 2
    : screen === "context3" || screen === "choice3" ? 3
    : 1;
  const opening = ["history", "choice", "context2", "choice2", "context3", "choice3"].includes(screen);
  /* ==========================================
     START NEW: Prologue state variable
     ========================================== */
  const prologue = ["worksheet", "timetravel", "meeting", "home", "returnTravel"].includes(screen);
  /* ==========================================
     STOP NEW: Prologue state variable
     ========================================== */
  const currentQuestion = questions[questionIndex];
  const resultContent: Partial<Record<Screen, { label: string; title: string; text: string; crowd: string }>> = {
    mystery: {
      label: "OPENING NIGHT",
      title: "An empty house.",
      text: "Only a few seats are filled. After the Spanish Armada was defeated, English nationalism surged—and audiences chose a rival's patriotic play instead.",
      crowd: "○ ○ ● ○ ○ ○ ○ ○ ○ ● ○ ○",
    },
    nationalism: {
      label: "OPENING NIGHT",
      title: "A roaring success.",
      text: "The theatre is full. Shakespeare cheers as the crowd applauds his celebration of England.",
      crowd: "● ● ● ● ● ● ● ● ● ● ● ●",
    },
    rome: {
      label: "THE GLOBE, 1599",
      title: "Rome fills the Globe.",
      text: "Citizens, senators, and betrayal grip the new theatre. The audience recognizes its own uneasy politics in ancient Rome.",
      crowd: "● ● ● ● ● ● ● ● ● ● ● ●",
    },
    forest: {
      label: "THE GLOBE, 1599",
      title: "The forest enchants.",
      text: "Fairies and mistaken lovers delight the crowd. The playful story gives Londoners an escape from the crowded city.",
      crowd: "● ● ● ● ● ● ● ● ● ● ○ ●",
    },
    scotland: {
      label: "THE KING'S MEN, 1603",
      title: "A royal choice.",
      text: "A dark Scottish tragedy captures the new king's attention with prophecy, kingship, and dangerous ambition.",
      crowd: "● ● ● ● ● ● ● ● ● ● ● ●",
    },
    sea: {
      label: "THE KING'S MEN, 1603",
      title: "A tale for another tide.",
      text: "The sea adventure entertains, but the court is more eager for stories that reflect its new Scottish monarch.",
      crowd: "● ○ ● ● ○ ● ● ○ ● ○ ● ○",
    },
  };
  const currentResult = result ? resultContent[screen] : undefined;

  function answerQuestion(answerIndex: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === currentQuestion.correct) setScore((currentScore) => currentScore + 10);
  }

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      /* ==========================================
         START NEW LINE: Route to returnTravel instead of complete
         ========================================== */
      setScreen("poe");
      /* ==========================================
         STOP NEW LINE: Route to returnTravel instead of complete
         ========================================== */
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
  }

  function restartGame() {
    setQuizQuestions(shuffleQuiz(questions));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    /* ==========================================
     START NEW LINE: Reset game back to worksheet
     ========================================== */
    setScreen("worksheet");
    /* ==========================================
     STOP NEW LINE: Reset game back to worksheet
     ========================================== */
  }

  if (screen === "poe") {
    return <PoeGame onComplete={() => setScreen("basho")} />;
  }

  if (screen === "basho") {
    return <BashoGame onComplete={() => setScreen("returnTravel")} />;
  } 

  return (
    <main className={`game ${result ? "show-result" : ""} ${screen === "farewell" || screen === "quiz" || screen === "complete" ? "wormhole-scene" : ""} ${prologue ? "prologue-scene" : ""}`}>
      {/* ==========================================
         START NEW: Conditional header wrapper
         ========================================== */}
      {!prologue && (
        <>
          <div className="game-title">
            <span>THE PLAYWRIGHT&rsquo;S GAMBIT</span>
            <small>{screen === "quiz" || screen === "complete" ? "Present day" : "London, 1588"}</small>
          </div>
          <ShakespearePortrait cheering={success} />
        </>
      )}
      {/* ==========================================
         STOP NEW: Conditional header wrapper
         ========================================== */}

      {/* ==========================================
         START NEW BLOCK: Prologue screens (worksheet, timetravel, meeting, home, returnTravel)
         ========================================== */}
      {screen === "worksheet" && (
        <section className="prologue worksheet-scene" aria-labelledby="worksheet-heading">
          <div className="classroom-copy">
            <p className="scene-label">PRESENT DAY &middot; AFTERNOON</p>
            <h1 id="worksheet-heading">One worksheet.<br />A world of authors.</h1>
            <p>You are matching literary eras to their authors when the old classroom clock begins to tick strangely.</p>
            <button className="scene-button" onClick={() => setScreen("timetravel")}>Start time travel</button>
          </div>
          <div className="desk" aria-label="A literature worksheet on a classroom desk">
            <div className="clock" aria-hidden="true">
              <span className="clock-hand clock-hour" />
              <span className="clock-hand clock-minute" />
              <i />
            </div>
            <div className="worksheet-paper">
              <div className="paper-heading">
                <span>LITERATURE</span>
                <strong>Authors &amp; Eras</strong>
              </div>
              <div className="worksheet-row worksheet-labels"><b>ERA</b><b>AUTHOR</b></div>
              <div className="worksheet-row active-row"><span>16th Century</span><span>Shakespeare</span></div>
              <div className="worksheet-row"><span>19th Century</span><span>Edgar Allan Poe</span></div>
              <div className="worksheet-row"><span>17th Century</span><span>Matsuo Basho</span></div>
              <div className="pencil-line" />
            </div>
          </div>
        </section>
      )}

      {screen === "timetravel" && (
        <section className="prologue travel-scene" aria-labelledby="travel-heading">
          <div className="time-rings" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="travel-copy">
            <p className="scene-label">12:47 PM &middot; OR PERHAPS 1588</p>
            <h1 id="travel-heading">The clock explodes.</h1>
            <p>The classroom folds into a whirl of ink, paper, and golden light. The unfinished worksheet vanishes from beneath your hand.</p>
            <button className="scene-button light-button" onClick={() => setScreen("meeting")}>Hold on</button>
          </div>
        </section>
      )}

      {screen === "meeting" && (
        <section className="prologue meeting-scene" aria-labelledby="meeting-heading">
          <div className="arrival-copy">
            <p className="scene-label">LONDON &middot; THE 16TH CENTURY</p>
            <p className="arrival-narration">You land in a cramped room smelling of candle wax and ink. A man at a writing desk scratches his head over two unfinished play ideas. When he sees you, his eyes brighten.</p>
            <p className="speaker">WILLIAM SHAKESPEARE</p>
            <h1 id="meeting-heading">&ldquo;Art thou&hellip; God?&rdquo;</h1>
            <p className="dialogue meeting-dialogue">&ldquo;You appeared in a flash of light just as I begged the heavens for help.&rdquo;</p>
            <button className="scene-button" onClick={() => setScreen("home")}>&ldquo;No. I&rsquo;m a student.&rdquo;</button>
          </div>
          <ShakespearePortrait />
        </section>
      )}

      {screen === "home" && (
        <section className="prologue home-scene" aria-labelledby="home-heading">
          <p className="home-kicker">A JOURNEY THROUGH SHAKESPEARE&rsquo;S WORLD</p>
          <h1 id="home-heading">The Playwright&rsquo;s<br /><em>Gambit</em></h1>
          <div className="home-rule"><span>1588</span><i /><span>1603</span></div>
          <p>Guide William Shakespeare through three turning points in history. Choose the stories he will tell, then bring what you learn back home.</p>
          <button className="scene-button home-button" onClick={() => setScreen("history")}>Begin the story</button>
        </section>
      )}

      {screen === "returnTravel" && (
        <section className="prologue travel-scene" aria-labelledby="return-heading">
          <div className="time-rings" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="travel-copy">
            <p className="scene-label">Question 20 complete &middot; The clock begins to shake</p>
            <h1 id="return-heading">The clock explodes again.</h1>
            <p>A glowing wormhole opens as the room dissolves into golden light. You hold tight to everything you learned and travel back to the present.</p>
            <button className="scene-button light-button" onClick={() => setScreen("complete")}>Travel home</button>
          </div>
        </section>
      )}
      {/* ==========================================
         STOP NEW BLOCK: Prologue screens
         ========================================== */}

      {!prologue && (opening ? (
        <section className="story">
          <p className="speaker">WILLIAM SHAKESPEARE</p>
          <h1>
            {choiceRound === 1 && <>&ldquo;What story shall I tell?&rdquo;</>}
            {choiceRound === 2 && <>&ldquo;Where shall my players take us?&rdquo;</>}
            {choiceRound === 3 && <>&ldquo;What tale will please the new king?&rdquo;</>}
          </h1>
          <p className="dialogue">
            {choiceRound === 1 && "Good patron, I need your counsel. Help me choose the theme for my next play."}
            {choiceRound === 2 && "The new Globe awaits a story. Shall we look to the politics of the past or escape into a world of magic?"}
            {choiceRound === 3 && "Our company now serves King James. Which story should we perform for this changed court?"}
          </p>
        </section>
      ) : result ? (
        <section className="story result-copy">
          <p className="speaker">{currentResult?.label}</p>
          <h1>{currentResult?.title}</h1>
          <p className="dialogue">{currentResult?.text}</p>
          <p className="crowd-line" aria-label="The playhouse audience">{currentResult?.crowd}</p>
          <button
            className="restart"
            onClick={() => {
              if (screen === "mystery" || screen === "nationalism") setScreen("context2");
              else if (screen === "rome" || screen === "forest") setScreen("context3");
              else setScreen("farewell");
            }}
          >
            Continue
          </button>
        </section>
      ) : (
        <section className="story farewell-copy">
          <p className="speaker">WILLIAM SHAKESPEARE</p>
          <h1>&ldquo;Farewell, good patron!&rdquo;</h1>
          <p className="dialogue">You have shaped my story. Now the currents of time call you home.</p>
          <div className="wormhole" aria-hidden="true"><span /><span /><span /></div>
          {screen === "farewell" && (
            <button className="restart wormhole-button" onClick={() => setScreen("quiz")}>Enter the wormhole</button>
          )}
        </section>
       )
      )}

      {opening && (
        <div className="choices">
          {choiceRound === 1 && (
            <>
              <Choice title="Murder Mystery" onClick={() => setScreen("mystery")} />
              <Choice title="English Nationalism" onClick={() => setScreen("nationalism")} />
            </>
          )}
          {choiceRound === 2 && (
            <>
              <Choice title="A Tragedy in Ancient Rome" onClick={() => setScreen("rome")} />
              <Choice title="A Comedy in an Enchanted Forest" onClick={() => setScreen("forest")} />
            </>
          )}
          {choiceRound === 3 && (
            <>
              <Choice title="A Scottish Tragedy" onClick={() => setScreen("scotland")} />
              <Choice title="A Great Voyage at Sea" onClick={() => setScreen("sea")} />
            </>
          )}
        </div>
      )}

      {screen === "history" && (
        <div className="history-layer" role="dialog" aria-modal="true" aria-labelledby="history-heading">
          <div className="history-box">
            <h2 id="history-heading">It is the year 1588</h2>
            <p>England is at war with Spain. The Spanish Armada is approaching, and the country waits anxiously.</p>
            <button onClick={() => setScreen("choice")}>Continue</button>
          </div>
        </div>
      )}

      {screen === "context2" && (
        <div className="history-layer" role="dialog" aria-modal="true" aria-labelledby="context2-heading">
          <div className="history-box">
            <h2 id="context2-heading">It is the year 1599</h2>
            <p>Shakespeare&rsquo;s company has opened the Globe. Londoners crowd its yard, hungry for politics, comedy, danger, and escape.</p>
            <button onClick={() => setScreen("choice2")}>Continue</button>
          </div>
        </div>
      )}

      {screen === "context3" && (
        <div className="history-layer" role="dialog" aria-modal="true" aria-labelledby="context3-heading">
          <div className="history-box">
            <h2 id="context3-heading">It is the year 1603</h2>
            <p>James VI of Scotland has become James I of England. Shakespeare&rsquo;s company is now called the King&rsquo;s Men and performs for the royal court.</p>
            <button onClick={() => setScreen("choice3")}>Continue</button>
          </div>
        </div>
      )}

      {screen === "quiz" && (
        <div className="quiz-layer" role="dialog" aria-modal="true" aria-labelledby="quiz-heading">
          <section className="quiz-box">
            <div className="quiz-status">
              <span>QUESTION {questionIndex + 1} OF {quizQuestions.length}</span>
              <strong>{score} POINTS</strong>
            </div>
            <div className="quiz-progress"><span style={{ width: `${((questionIndex + 1) / quizQuestions.length) * 100}%` }} /></div>
            <h2 id="quiz-heading">{currentQuestion.question}</h2>
            <div className="quiz-options">
              {currentQuestion.answers.map((answer, index) => {
                const isCorrect = selectedAnswer !== null && index === currentQuestion.correct;
                const isWrong = selectedAnswer === index && index !== currentQuestion.correct;
                return (
                  <button
                    className={`${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                    key={answer}
                    onClick={() => answerQuestion(index)}
                    disabled={selectedAnswer !== null}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
            {selectedAnswer !== null && (
              <div className="quiz-feedback">
                <p>{selectedAnswer === currentQuestion.correct ? "Correct! +10 points" : `The correct answer is ${currentQuestion.answers[currentQuestion.correct]}.`}</p>
                <button onClick={nextQuestion}>{questionIndex === quizQuestions.length - 1 ? "See my result" : "Next question"}</button>
              </div>
            )}
          </section>
        </div>
      )}

      {screen === "complete" && (
        <div className="quiz-layer" role="dialog" aria-modal="true" aria-labelledby="result-heading">
          <section className="quiz-box final-box">
            <p className="speaker">BACK IN THE PRESENT</p>
            <h2 id="result-heading">Worksheet complete!</h2>
            {/* ==========================================
               START NEW: Completed worksheet paper card
               ========================================== */}
            <div className="worksheet-paper completed-paper">
              <div className="paper-heading"><span>LITERATURE</span><strong>Authors &amp; Eras</strong></div>
              <div className="worksheet-row worksheet-labels"><b>ERA</b><b>AUTHOR</b></div>
              <div className="worksheet-row"><span>16th Century</span><span>Shakespeare</span></div>
              <div className="worksheet-row"><span>19th Century</span><span>Edgar Allan Poe</span></div>
              <div className="worksheet-row"><span>17th Century</span><span>Matsuo Basho</span></div>
            </div>
            {/* ==========================================
               STOP NEW: Completed worksheet paper card
               ========================================== */}
            <p>You traveled through time and learned so much about these authors, their eras, and the stories they shared with the world.</p> 
	    <button className="final-button" onClick={restartGame}>Play again</button>
          </section>
        </div>
      )}
    </main>
  );
}
