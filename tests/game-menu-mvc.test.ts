import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { menuUrl } from "../menu/destinations";
import { poeRounds } from "../poe/rounds";
import { bashoPoems } from "../basho/poems";
import { individualTrivia } from "../trivia/questions";

// Keep real entry points, controllers, models, and timers. Replace only canvas
// drawing with spies; callbacks simulate the existing views' user interactions.
const views = vi.hoisted(() => ({
  submitPoe: undefined as ((answer: string) => void) | undefined,
  chooseBasho: undefined as ((answer: string, index: number) => void) | undefined,
  chooseTrivia: undefined as ((answer: string, index: number) => void) | undefined,
  poe: { updateRound: vi.fn(), updateScore: vi.fn(), updateGuesses: vi.fn(), showReveal: vi.fn(), destroy: vi.fn() },
  basho: { updateRound: vi.fn(), updateTimer: vi.fn(), highlight: vi.fn(), showFeedback: vi.fn(), showMessage: vi.fn(), showTransition: vi.fn(), destroy: vi.fn() },
  trivia: { updateQuestion: vi.fn(), updateScore: vi.fn(), highlight: vi.fn(), showEnd: vi.fn(), destroy: vi.fn() },
}));
vi.mock("../poe/PoeView", () => ({ PoeView: vi.fn().mockImplementation(function (submit: (answer: string) => void) {
  views.submitPoe = submit; return views.poe;
}) }));
vi.mock("../basho/BashoView", () => ({ BashoView: vi.fn().mockImplementation(function (choose: (answer: string, index: number) => void) {
  views.chooseBasho = choose; return views.basho;
}) }));
vi.mock("../trivia/TriviaView", () => ({ TriviaView: vi.fn().mockImplementation(function (choose: (answer: string, index: number) => void) {
  views.chooseTrivia = choose; return views.trivia;
}) }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
  vi.clearAllMocks();
  document.body.innerHTML = '<div id="container"></div>';
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});
function browser() {
  const confirm = vi.fn<Window["confirm"]>().mockReturnValue(false);
  vi.stubGlobal("confirm", confirm);
  const navigate = vi.spyOn(window.location, "assign").mockImplementation(() => {});
  return { confirm, navigate };
}
function exit() { fireEvent.click(screen.getByRole("button", { name: "Return to Main Menu" })); }

describe("native menu control in canvas applications", () => {
  it("preserves Poe attempts/score on Cancel and remains wired through real trivia progression", async () => {
    const { confirm, navigate } = browser();
    await import("../poe/main");
    const button = screen.getByRole("button", { name: "Return to Main Menu" });
    expect(document.getElementById("container")!.contains(button)).toBe(false);
    views.submitPoe!("wrong answer");
    const guesses = views.poe.updateGuesses.mock.lastCall;
    const rounds = views.poe.updateRound.mock.calls.length;
    exit();
    expect(views.poe.updateGuesses.mock.lastCall).toBe(guesses);
    expect(views.poe.updateRound).toHaveBeenCalledTimes(rounds);
    expect(navigate).not.toHaveBeenCalled();
    views.submitPoe!("another wrong answer");
    expect(views.poe.updateGuesses.mock.lastCall?.[1]).toBe(1);
    for (const round of poeRounds) {
      views.submitPoe!(round.answer);
      views.poe.showReveal.mock.lastCall![3]();
    }
    expect(views.poe.updateScore.mock.lastCall).toEqual([5, 5]);
    expect(views.trivia.updateQuestion).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Return to Main Menu" })).toBe(button);
    views.chooseTrivia!(individualTrivia.poe[0].answer, 0);
    const timers = vi.getTimerCount();
    exit();
    expect(views.trivia.updateScore.mock.lastCall).toEqual([10]);
    expect(vi.getTimerCount()).toBe(timers);
    vi.advanceTimersByTime(1000);
    expect(views.trivia.updateQuestion.mock.lastCall?.slice(1)).toEqual([2, 20, 10]);
    confirm.mockReturnValue(true);
    exit();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(menuUrl);
  });

  it("does not reset Bashō's countdown or interval phase and survives the transition to trivia", async () => {
    const { confirm, navigate } = browser();
    await import("../basho/main");
    const button = screen.getByRole("button", { name: "Return to Main Menu" });
    views.basho.showMessage.mock.lastCall![1](); // Begin rounds.
    vi.advanceTimersByTime(1150);
    const lastTime = views.basho.updateTimer.mock.lastCall![0] as number;
    const interval = vi.spyOn(globalThis, "setInterval");
    const state = views.basho.updateRound.mock.lastCall![0];
    const timerCount = vi.getTimerCount();
    exit();
    expect(views.basho.updateRound.mock.lastCall![0]).toBe(state);
    expect(views.basho.updateTimer.mock.lastCall![0]).toBe(lastTime);
    expect(vi.getTimerCount()).toBe(timerCount);
    expect(interval).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(views.basho.updateTimer.mock.lastCall![0]).toBeCloseTo(lastTime - 0.1);
    for (const poem of bashoPoems) {
      for (const line of poem.lines) {
        views.chooseBasho!(line.correct, line.options.indexOf(line.correct));
        vi.advanceTimersByTime(650);
      }
    }
    views.basho.showMessage.mock.lastCall![1](); // Win → farewell.
    views.basho.showMessage.mock.lastCall![1](); // Farewell → transition.
    vi.advanceTimersByTime(2600);
    expect(views.trivia.updateQuestion).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Return to Main Menu" })).toBe(button);
    exit();
    expect(navigate).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    exit();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(menuUrl);
  });
});
