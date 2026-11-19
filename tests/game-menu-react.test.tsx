import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Storyline from "../shakespeare/src/App";
import Poetry from "../iambic-pentameter/src/App";
import { questions } from "../shakespeare/src/questions";
import { poemChallenges } from "../iambic-pentameter/src/data/poemChallenges";
import { menuUrl } from "../menu/destinations";

// Existing poe-menu-navigation tests cover real Poe. Here only Poe is shortened
// so we can test the real timed React Bashō game through the storyline wrapper.
vi.mock("../edgar-allan-poe/src/App", () => ({
  default: ({ onComplete }: { onComplete: () => void }) => <button onClick={onComplete}>Finish Poe</button>,
}));
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function click(name: RegExp) { fireEvent.click(screen.getByRole("button", { name })); }
function browser() {
  const confirm = vi.fn<Window["confirm"]>().mockReturnValue(false);
  vi.stubGlobal("confirm", confirm);
  const navigate = vi.spyOn(window.location, "assign").mockImplementation(() => {});
  return { confirm, navigate };
}
function startQuiz() {
  [ /Start time travel/i, /Hold on/i, /No\. I’m a student/i, /Begin the story/i,
    /^Continue$/i, /Murder Mystery/i, /^Continue$/i, /^Continue$/i,
    /A Tragedy in Ancient Rome/i, /^Continue$/i, /^Continue$/i,
    /A Scottish Tragedy/i, /^Continue$/i, /Enter the wormhole/i,
  ].forEach(click);
}
function answerQuizQuestion(last = false) {
  const quiz = screen.getByRole("dialog");
  const q = questions.find(q => within(quiz).queryByRole("heading", { name: q.question }))!;
  fireEvent.click(within(quiz).getByRole("button", { name: q.answers[q.correct] }));
  click(last ? /See my result/i : /Next question/i);
}

describe("shared React menu exit", () => {
  it("is available in Shakespeare's prologue and preserves an answered quiz on Cancel", () => {
    render(<Storyline />);
    const { confirm, navigate } = browser();
    click(/^Return to Main Menu$/);
    expect(screen.getByRole("heading", { name: /One worksheet/i })).toBeInTheDocument();
    startQuiz();
    const quiz = screen.getByRole("dialog");
    const q = questions.find(q => within(quiz).queryByRole("heading", { name: q.question }))!;
    const answer = within(quiz).getByRole("button", { name: q.answers[q.correct] });
    fireEvent.click(answer);
    click(/^Return to Main Menu$/);
    expect(answer).toBeDisabled();
    expect(screen.getByText("QUESTION 1 OF 20")).toBeInTheDocument();
    expect(screen.getByText("10 POINTS")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    click(/^Return to Main Menu$/);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(menuUrl);
    expect(screen.getByText("10 POINTS")).toBeInTheDocument();
  });

  it("leaves React Bashō's countdown and interval phase intact on Cancel", () => {
    vi.useFakeTimers();
    render(<Storyline />);
    const { confirm, navigate } = browser();
    startQuiz();
    for (let i = 0; i < questions.length; i++) answerQuizQuestion(i === questions.length - 1);
    click(/Finish Poe/);
    expect(screen.getAllByRole("button", { name: "Return to Main Menu" })).toHaveLength(1);
    const intervals = vi.spyOn(window, "setInterval");
    click(/Begin the journey/i);
    act(() => vi.advanceTimersByTime(1150));
    const track = document.querySelector<HTMLElement>(".timer-track i")!;
    const width = track.style.width;
    const html = document.querySelector(".basho-shell")!.innerHTML;
    const timers = vi.getTimerCount();
    const intervalCalls = intervals.mock.calls.length;
    click(/^Return to Main Menu$/);
    expect(document.querySelector(".basho-shell")!.innerHTML).toBe(html);
    expect(vi.getTimerCount()).toBe(timers);
    expect(intervals).toHaveBeenCalledTimes(intervalCalls);
    expect(navigate).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(50)); // Next original tick, not a restarted interval.
    expect(parseFloat(track.style.width)).toBeLessThan(parseFloat(width));
    expect(screen.getByLabelText("3 lives remaining")).toBeInTheDocument();
    confirm.mockReturnValue(true);
    click(/^Return to Main Menu$/);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(menuUrl);
  });

  it("preserves poetry tiles, score and round while keeping Return to Introduction separate", () => {
    render(<Poetry />);
    const { confirm, navigate } = browser();
    click(/Start Side Quest/i);
    const challenge = poemChallenges[0];
    for (const id of challenge.correctAnswer) {
      const text = challenge.tiles.find(tile => tile.id === id)!.text;
      fireEvent.click(screen.getByRole("button", { name: new RegExp(text) }));
    }
    click(/Check Answer/i);
    const feedback = document.querySelector(".app-shell")!.innerHTML;
    click(/^Return to Main Menu$/);
    expect(document.querySelector(".app-shell")!.innerHTML).toBe(feedback);
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Return to Introduction/i })).toBeInTheDocument();
    confirm.mockReturnValue(true);
    click(/^Return to Main Menu$/);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(menuUrl);
    click(/Return to Introduction/i);
    expect(screen.getByRole("button", { name: /Start Side Quest/i })).toBeInTheDocument();
    expect(navigate).toHaveBeenCalledTimes(1); // Lesson reset is not a menu exit.
  });
});
