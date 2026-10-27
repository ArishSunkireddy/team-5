import { useState } from "react";

type Screen =
  | "history" | "choice" | "mystery" | "nationalism"
  | "context2" | "choice2" | "rome" | "forest"
  | "context3" | "choice3" | "scotland" | "sea"
  | "farewell" | "quiz" | "complete";

const questions = [
  { question: "Where was Shakespeare born?", answers: ["London", "Stratford-upon-Avon", "Oxford"], correct: 1 },
  { question: "In what year was Shakespeare born?", answers: ["1564", "1588", "1616"], correct: 0 },
  { question: "What was Shakespeare's main profession?", answers: ["Explorer", "Playwright and actor", "Royal painter"], correct: 1 },
  { question: "Who did Shakespeare marry?", answers: ["Anne Hathaway", "Elizabeth Tudor", "Mary Sidney"], correct: 0 },
  { question: "Which theatre is closely associated with Shakespeare?", answers: ["The Globe", "The Apollo", "The Royal Albert Hall"], correct: 0 },
  { question: "Hamlet is the prince of which country?", answers: ["England", "Denmark", "Scotland"], correct: 1 },
  { question: "Which families feud in Romeo and Juliet?", answers: ["York and Lancaster", "Montague and Capulet", "Tudor and Stuart"], correct: 1 },
  { question: "Where is Macbeth mainly set?", answers: ["Scotland", "Italy", "France"], correct: 0 },
  { question: "Who is the villain in Othello?", answers: ["Prospero", "Iago", "Mercutio"], correct: 1 },
  { question: "How many daughters does King Lear have?", answers: ["Two", "Three", "Five"], correct: 1 },
  { question: "What date is Caesar warned about?", answers: ["The Ides of March", "May Day", "Twelfth Night"], correct: 0 },
  { question: "Who is the fairy king in A Midsummer Night's Dream?", answers: ["Oberon", "Puck", "Theseus"], correct: 0 },
  { question: "Who is the magician in The Tempest?", answers: ["Caliban", "Prospero", "Antonio"], correct: 1 },
  { question: "Who disguises herself as Cesario in Twelfth Night?", answers: ["Olivia", "Viola", "Portia"], correct: 1 },
  { question: "Who is the moneylender in The Merchant of Venice?", answers: ["Shylock", "Bassanio", "Lorenzo"], correct: 0 },
  { question: "How many sonnets are traditionally attributed to Shakespeare?", answers: ["54", "100", "154"], correct: 2 },
  { question: "What verse form did Shakespeare often use?", answers: ["Blank verse", "Haiku", "Limerick"], correct: 0 },
  { question: "Which play contains “To be, or not to be”?", answers: ["Hamlet", "Macbeth", "The Tempest"], correct: 0 },
  { question: "Who are the witty couple in Much Ado About Nothing?", answers: ["Beatrice and Benedick", "Romeo and Juliet", "Viola and Orsino"], correct: 0 },
  { question: "In what year did Shakespeare die?", answers: ["1599", "1616", "1642"], correct: 1 },
];

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
  const [screen, setScreen] = useState<Screen>("history");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const resultScreens: Screen[] = ["mystery", "nationalism", "rome", "forest", "scotland", "sea"];
  const result = resultScreens.includes(screen);
  const success = ["nationalism", "rome", "scotland"].includes(screen);
  const choiceRound =
    screen === "context2" || screen === "choice2" ? 2
    : screen === "context3" || screen === "choice3" ? 3
    : 1;
  const opening = ["history", "choice", "context2", "choice2", "context3", "choice3"].includes(screen);
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
      setScreen("complete");
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
  }

  function restartGame() {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setScreen("history");
  }

  return (
    <main className={`game ${result ? "show-result" : ""} ${screen === "farewell" || screen === "quiz" || screen === "complete" ? "wormhole-scene" : ""}`}>
      <div className="game-title">
        <span>THE PLAYWRIGHT&rsquo;S GAMBIT</span>
        <small>London, 1588</small>
      </div>

      <ShakespearePortrait cheering={success} />

      {opening ? (
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
              <span>QUESTION {questionIndex + 1} OF {questions.length}</span>
              <strong>{score} POINTS</strong>
            </div>
            <div className="quiz-progress"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
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
                <button onClick={nextQuestion}>{questionIndex === questions.length - 1 ? "See my result" : "Next question"}</button>
              </div>
            )}
          </section>
        </div>
      )}

      {screen === "complete" && (
        <div className="quiz-layer" role="dialog" aria-modal="true" aria-labelledby="result-heading">
          <section className="quiz-box final-box">
            <p className="speaker">YOUR FINAL SCORE</p>
            <div className="final-score">{score}<small>/ 200 points</small></div>
            <h2 id="result-heading">{score >= 150 ? "Congrats!" : "Come back another time to study him again…"}</h2>
            <p>{score >= 150 ? "Your knowledge of the Bard has carried you safely home." : "Shakespeare's stories will be waiting for your return."}</p>
            <button className="final-button" onClick={restartGame}>Play again</button>
          </section>
        </div>
      )}
    </main>
  );
}
