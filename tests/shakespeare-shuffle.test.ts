import { afterEach, describe, expect, it, vi } from 'vitest';
import { questions } from '../shakespeare/src/questions';
import type { QuizQuestion } from '../shakespeare/src/questions';
import { shuffle, shuffleAnswers, shuffleQuiz } from '../shakespeare/src/shuffle';
import type { RandomSource } from '../shakespeare/src/shuffle';

// --- Deterministic random sources -------------------------------------------

/** Always returns the same value. 0 always picks the first slot; 0.999 always picks the last. */
const always = (value: number): RandomSource => () => value;

/** Small seeded generator (mulberry32): same seed, same sequence, every run. */
function seeded(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Example data -------------------------------------------------------------

const birthplace: QuizQuestion = {
  question: 'Where was Shakespeare born?',
  answers: ['London', 'Stratford-upon-Avon', 'Oxford'],
  correct: 1,
};

const rightAnswer = (question: QuizQuestion) => question.answers[question.correct];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('shuffle', () => {
  it('reorders items according to the random source', () => {
    expect(shuffle(['a', 'b', 'c', 'd'], always(0))).toEqual(['b', 'c', 'd', 'a']);
  });

  it('keeps the original order when every pick is the last slot', () => {
    expect(shuffle(['a', 'b', 'c', 'd'], always(0.999))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps every item exactly once', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    const random = seeded(1);
    for (let run = 0; run < 100; run++) {
      expect([...shuffle(items, random)].sort()).toEqual(items);
    }
  });

  it('can produce every possible order', () => {
    const random = seeded(2);
    const ordersSeen = new Set<string>();
    for (let run = 0; run < 600; run++) {
      ordersSeen.add(shuffle(['a', 'b', 'c'], random).join(''));
    }
    expect([...ordersSeen].sort()).toEqual(['abc', 'acb', 'bac', 'bca', 'cab', 'cba']);
  });

  it('does not change the array it was given', () => {
    const items = Object.freeze(['a', 'b', 'c']);
    shuffle(items, always(0));
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('returns an empty array for an empty list without asking for randomness', () => {
    const random = vi.fn(always(0));
    expect(shuffle([], random)).toEqual([]);
    expect(random).not.toHaveBeenCalled();
  });

  it('returns a single item unchanged without asking for randomness', () => {
    const random = vi.fn(always(0));
    expect(shuffle(['only'], random)).toEqual(['only']);
    expect(random).not.toHaveBeenCalled();
  });

  it.each([1, -0.1, Number.NaN])('rejects a random source that returns %s', (badValue) => {
    expect(() => shuffle(['a', 'b'], always(badValue))).toThrow(RangeError);
  });

  it('uses Math.random when no random source is given', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(shuffle(['a', 'b', 'c'])).toEqual(['b', 'c', 'a']);
    expect(Math.random).toHaveBeenCalledTimes(2);
  });
});

describe('shuffleAnswers', () => {
  it('moves the correct index along with the right answer', () => {
    const shuffled = shuffleAnswers(birthplace, always(0));
    expect(shuffled.answers).toEqual(['Stratford-upon-Avon', 'Oxford', 'London']);
    expect(shuffled.correct).toBe(0);
  });

  it('marks the same answer correct no matter how the answers land', () => {
    const random = seeded(3);
    for (let run = 0; run < 50; run++) {
      const shuffled = shuffleAnswers(birthplace, random);
      expect(rightAnswer(shuffled)).toBe('Stratford-upon-Avon');
      expect(shuffled.question).toBe(birthplace.question);
      expect([...shuffled.answers].sort()).toEqual([...birthplace.answers].sort());
    }
  });

  it('does not change the original question', () => {
    const original = Object.freeze({ ...birthplace, answers: Object.freeze([...birthplace.answers]) });
    shuffleAnswers(original as QuizQuestion, always(0));
    expect(original).toEqual(birthplace);
  });

  it.each([
    ['past the last answer', 3],
    ['negative', -1],
    ['not a whole number', 1.5],
  ])('rejects a correct index that is %s', (_, badIndex) => {
    const broken = { ...birthplace, correct: badIndex };
    expect(() => shuffleAnswers(broken, always(0))).toThrow(RangeError);
    expect(() => shuffleAnswers(broken, always(0))).toThrow(birthplace.question);
  });

  it('rejects a question with no answers', () => {
    const empty = { question: 'Empty?', answers: [], correct: 0 };
    expect(() => shuffleAnswers(empty, always(0))).toThrow(RangeError);
  });
});

describe('shuffleQuiz', () => {
  it('keeps all 20 real questions, each with its right answer still marked correct', () => {
    const shuffled = shuffleQuiz(questions, seeded(4));
    expect(shuffled).toHaveLength(questions.length);

    for (const original of questions) {
      const match = shuffled.find((question) => question.question === original.question);
      expect(match).toBeDefined();
      expect(rightAnswer(match!)).toBe(rightAnswer(original));
      expect([...match!.answers].sort()).toEqual([...original.answers].sort());
    }
  });

  it('gives a different question order on the next playthrough', () => {
    const random = seeded(5);
    const firstPlay = shuffleQuiz(questions, random).map((question) => question.question);
    const replay = shuffleQuiz(questions, random).map((question) => question.question);
    expect(replay).not.toEqual(firstPlay);
  });

  it('does not change the stage question data', () => {
    const before = structuredClone(questions);
    shuffleQuiz(questions, seeded(6));
    expect(questions).toEqual(before);
  });

  it('returns an empty quiz when there are no questions', () => {
    expect(shuffleQuiz([], seeded(7))).toEqual([]);
  });

  it('refuses to build a quiz that contains a broken question', () => {
    const broken = { ...birthplace, correct: 5 };
    expect(() => shuffleQuiz([birthplace, broken], seeded(8))).toThrow(RangeError);
  });
});
