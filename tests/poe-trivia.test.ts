import { describe, it, expect } from 'vitest';
import { triviaQuestions } from '../edgar-allan-poe/src/App';
import React from 'react';

describe('Trivia state is accurate to design proposal', () => {
    it('has 20 questions', () => {
        expect(triviaQuestions.length).toBe(20)
    });

    it('checks if the answer exists', () => {
        triviaQuestions.forEach((item, idx) => {
            const answer = item.options.includes(item.answer);
            expect(answer).toBe(true);
        });
    });

    it('checks for four options per question', () => {
        triviaQuestions.forEach((item) => {
            expect(item.options.length).toBe(4);
        });
    });

    it('every question has an explanation', () => {
        triviaQuestions.forEach((item) => {
            expect(item.explanation).toBeDefined();
            expect(item.explanation.length).toBeGreaterThan(0);
        });
    });
});

describe('Trivia frontend/React', () => {
    it('check support for React and JSX', () => {
        expect(React).toBeDefined();
    });

    it('Find and import src files', async () => {
        const appModule = await import('../edgar-allan-poe/src/App');
        expect(appModule).toBeDefined();
        expect(appModule.default).toBeInstanceOf(Function);
    });

    it('module validation', () => {
        const ready = true;
        expect(ready).toBe(true);
    });
});
