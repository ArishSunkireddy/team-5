import type { QuizQuestion } from "./questions";

/** Returns a number in [0, 1), like Math.random. Passed in so tests can fix the order. */
export type RandomSource = () => number;

/**
 * Returns a shuffled copy of `items` using the Fisher–Yates algorithm, which
 * makes every order equally likely. `items` itself is never changed.
 */
export function shuffle<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const shuffled = [...items];
  for (let last = shuffled.length - 1; last > 0; last--) {
    const pick = randomIndex(last + 1, random);
    [shuffled[last], shuffled[pick]] = [shuffled[pick], shuffled[last]];
  }
  return shuffled;
}

/**
 * Shuffles a question's answers and updates `correct` so it still points at
 * the right answer. Throws if `correct` doesn't point at one of the answers.
 */
export function shuffleAnswers(question: QuizQuestion, random: RandomSource = Math.random): QuizQuestion {
  const { answers, correct } = question;
  if (!Number.isInteger(correct) || correct < 0 || correct >= answers.length) {
    throw new RangeError(
      `"${question.question}" has correct = ${correct}, but only ${answers.length} answers`,
    );
  }

  const newOrder = shuffle(answers.map((_, index) => index), random);
  return {
    ...question,
    answers: newOrder.map((index) => answers[index]),
    correct: newOrder.indexOf(correct),
  };
}

/** Shuffles the order of the questions and the order of the answers within each one. */
export function shuffleQuiz(
  questions: readonly QuizQuestion[],
  random: RandomSource = Math.random,
): QuizQuestion[] {
  return shuffle(questions, random).map((question) => shuffleAnswers(question, random));
}

function randomIndex(length: number, random: RandomSource): number {
  const value = random();
  if (!(value >= 0 && value < 1)) {
    throw new RangeError(`random() must return a number in [0, 1), got ${value}`);
  }
  return Math.floor(value * length);
}
