import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import App from '../shakespeare/src/App';

describe('The Playwright’s Gambit - Prologue & Navigation Flow', () => {
  
  // 1. Initial State / Worksheet Prologue Test
  it('renders the modern classroom worksheet prologue on initial load', () => {
    render(createElement(App));

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
    render(createElement(App));

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
    render(createElement(App));

    // Navigate through prologue quickly
    fireEvent.click(screen.getByRole('button', { name: /Start time travel/i }));
    fireEvent.click(screen.getByRole('button', { name: /Hold on/i }));
    fireEvent.click(screen.getByRole('button', { name: /No. I’m a student./i }));

    // Click "Begin the story"
    fireEvent.click(screen.getByRole('button', { name: /Begin the story/i }));

    // Verify that historical gameplay screen ("history") is active
    expect(screen.getByText(/London, 1588/i)).toBeInTheDocument();
  });

});
