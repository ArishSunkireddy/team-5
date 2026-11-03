import { describe, it, expect } from 'vitest';
import App, { poems, quizQuestions } from './App';

// Game rules (from the design: 20 questions, 10 points each, pass at 150)
const POINTS_PER_ANSWER = 10;
const PASS_SCORE = 150;

describe('Haiku game data is accurate to the design', () => {
  it('has 3 poems', () => {
    expect(poems.length).toBe(3);
  });

  it('gives every poem a title and a season', () => {
    poems.forEach((poem) => {
      expect(poem.title.length).toBeGreaterThan(0);
      expect(poem.season.length).toBeGreaterThan(0);
    });
  });

  it('uses unique poem titles', () => {
    const titles = poems.map((poem) => poem.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('has 3 lines per poem', () => {
    poems.forEach((poem) => {
      expect(poem.lines.length).toBe(3);
    });
  });

  it('follows the 5-7-5 syllable pattern in every poem', () => {
    poems.forEach((poem) => {
      expect(poem.lines.map((line) => line.syllables)).toEqual([5, 7, 5]);
    });
  });

  it('offers 3 choices per line', () => {
    poems.forEach((poem) => {
      poem.lines.forEach((line) => {
        expect(line.options.length).toBe(3);
      });
    });
  });

  it('includes the correct line among the choices exactly once', () => {
    poems.forEach((poem) => {
      poem.lines.forEach((line) => {
        const matches = line.options.filter((option) => option === line.correct);
        expect(matches.length).toBe(1);
      });
    });
  });

  it('has no duplicate choices within a line', () => {
    poems.forEach((poem) => {
      poem.lines.forEach((line) => {
        expect(new Set(line.options).size).toBe(line.options.length);
      });
    });
  });
});

describe('Bashō quiz data is accurate to the design', () => {
  it('has 20 questions', () => {
    expect(quizQuestions.length).toBe(20);
  });

  it('checks if the answer exists among the options', () => {
    quizQuestions.forEach((item) => {
      expect(item.options.includes(item.answer)).toBe(true);
    });
  });

  it('has four options per question', () => {
    quizQuestions.forEach((item) => {
      expect(item.options.length).toBe(4);
    });
  });

  it('has no duplicate options within a question', () => {
    quizQuestions.forEach((item) => {
      expect(new Set(item.options).size).toBe(item.options.length);
    });
  });

  it('gives every question non-empty text', () => {
    quizQuestions.forEach((item) => {
      expect(item.question.trim().length).toBeGreaterThan(0);
    });
  });

  it('has no repeated questions', () => {
    const questions = quizQuestions.map((item) => item.question);
    expect(new Set(questions).size).toBe(questions.length);
  });
});

describe('Quiz scoring rules', () => {
  it('has a maximum score of 200 points', () => {
    expect(quizQuestions.length * POINTS_PER_ANSWER).toBe(200);
  });

  it('can reach the passing score of 150 (15 correct answers)', () => {
    expect(PASS_SCORE / POINTS_PER_ANSWER).toBe(15);
    expect(quizQuestions.length * POINTS_PER_ANSWER).toBeGreaterThanOrEqual(PASS_SCORE);
  });
});

describe('Frontend/React module', () => {
  it('exports the App component as a function', () => {
    expect(App).toBeInstanceOf(Function);
  });
});
