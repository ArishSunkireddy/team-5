import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import App from '../shakespeare/src/App';
import { within } from '@testing-library/react'; // Add 'within' to your existing testing-library import

const click = (name: RegExp) =>
  fireEvent.click(screen.getByRole('button', { name }));

// Automatically clicks through the prologue narrative up to the quiz
function goToQuiz() {
  [
    /Start time travel/i,
    /Hold on/i,
    /No\. I’m a student\./i,
    /Begin the story/i,
    /^Continue$/i,
    /Murder Mystery/i,
    /^Continue$/i,
    /^Continue$/i,
    /A Tragedy in Ancient Rome/i,
    /^Continue$/i,
    /^Continue$/i,
    /A Scottish Tragedy/i,
    /^Continue$/i,
    /Enter the wormhole/i,
  ].forEach(click);
}

// Answers a question inside the modal quiz dialog
function answerQuestion(last = false) {
  const quiz = screen.getByRole('dialog');
  fireEvent.click(within(quiz).getAllByRole('button')[0]);
  fireEvent.click(
    within(quiz).getByRole('button', {
      name: last ? /See my result/i : /Next question/i,
    }),
  );
}

describe('The Playwright’s Gambit - Prologue & Navigation Flow', () => {
  
  // 1. Initial State / Worksheet Prologue Test
  it('renders the modern classroom worksheet prologue on initial load', () => {
    render(createElement(App, { onComplete: () => {} }));

    // Verify classroom header and copy
    expect(screen.getByText(/PRESENT DAY/i)).toBeInTheDocument();
    expect(screen.getByText(/One worksheet./i)).toBeInTheDocument();
    expect(screen.getByText(/You are matching literary eras to their authors/i)).toBeInTheDocument();

    // Verify the start time travel button exists
    const timeTravelButton = screen.getByRole('button', { name: /Start time travel/i });
    expect(timeTravelButton).toBeInTheDocument();
  });

  // 2. Time Travel & Portal Transition Tests
  it('transitions from worksheet prologue through time travel and home scene', () => {
    render(createElement(App, { onComplete: () => {} }));

    // Click start time travel
    const startButton = screen.getByRole('button', { name: /Start time travel/i });
    fireEvent.click(startButton);

    // Verify time travel / portal screen
    expect(screen.getByText(/The clock explodes./i)).toBeInTheDocument();
    
    // Advance to meeting scene
    const holdOnButton = screen.getByRole('button', { name: /Hold on/i });
    fireEvent.click(holdOnButton);

    // Verify Shakespeare meeting scene
    expect(screen.getByText(/WILLIAM SHAKESPEARE/i)).toBeInTheDocument();
    expect(screen.getByText(/Art thou… God\?/i)).toBeInTheDocument();

    // Advance to home / main menu summary scene
    const studentButton = screen.getByRole('button', { name: /No. I’m a student./i });
    fireEvent.click(studentButton);

    // Verify home scene title and begin story button
    expect(screen.getByText(/The Playwright’s/i)).toBeInTheDocument();
    const beginButton = screen.getByRole('button', { name: /Begin the story/i });
    expect(beginButton).toBeInTheDocument();
  });

  // 3. Edge Case: Core Gameplay Transition
  it('switches from prologue into the core historical gameplay loop when starting the story', () => {
    render(createElement(App, { onComplete: () => {} }));

    // Navigate through prologue quickly
    fireEvent.click(screen.getByRole('button', { name: /Start time travel/i }));
    fireEvent.click(screen.getByRole('button', { name: /Hold on/i }));
    fireEvent.click(screen.getByRole('button', { name: /No. I’m a student./i }));

    // Click "Begin the story"
    fireEvent.click(screen.getByRole('button', { name: /Begin the story/i }));

    // Verify that historical gameplay screen ("history") is active
    expect(screen.getByText(/London, 1588/i)).toBeInTheDocument();
  });
  
    // 4. Finishing the quiz hands control back to the menu
  it('calls onComplete after the last quiz question', () => {
    const onComplete = vi.fn();
    render(createElement(App, { onComplete }));
    goToQuiz();

    for (let question = 1; question < 20; question += 1) {
      answerQuestion();
    }

    expect(screen.getByText(/QUESTION 20 OF 20/i)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    answerQuestion(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
  }); 
});
