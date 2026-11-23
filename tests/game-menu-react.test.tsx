import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Storyline from "../shakespeare/src/App";
import Poetry from "../iambic-pentameter/src/App";
import { questions } from "../shakespeare/src/questions";
import { poemChallenges } from "../iambic-pentameter/src/data/poemChallenges";
import { menuUrl } from "../menu/destinations";
import ReturnToMainMenu from "../menu/ReturnToMainMenu";

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

describe("shared React menu exit", () => {
  it("preserves an answered Shakespeare quiz on Cancel", () => {
    render(<><ReturnToMainMenu /><Storyline onComplete={() => {}} /></>);
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
