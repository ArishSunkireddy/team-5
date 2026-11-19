import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import App from "../shakespeare/src/App";
import { questions } from "../shakespeare/src/questions";
import { triviaQuestions } from "../edgar-allan-poe/src/App";
import { menuUrl, destinations } from "../menu/destinations";
import { MenuController } from "../menu/MenuController";
import { MenuModel, type MenuItem } from "../menu/MenuModel";
import type { MenuView } from "../menu/MenuView";

// Both Shakespeare and Poe are real components; no game-state hooks are mocked.
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Happy DOM does not implement the browser confirmation dialog.
function mockConfirm() {
  const confirm = vi.fn<Window["confirm"]>();
  vi.stubGlobal("confirm", confirm);
  return confirm;
}

function click(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}
function goToQuiz() {
  [ /Start time travel/i, /Hold on/i, /No\. I’m a student/i, /Begin the story/i,
    /^Continue$/i, /Murder Mystery/i, /^Continue$/i, /^Continue$/i,
    /A Tragedy in Ancient Rome/i, /^Continue$/i, /^Continue$/i,
    /A Scottish Tragedy/i, /^Continue$/i, /Enter the wormhole/i,
  ].forEach(click);
}
function enterPoe() {
  const rendered = render(<App />);
  expect(screen.getByRole("button", { name: "Return to Main Menu" })).toBeInTheDocument();
  goToQuiz();
  for (let index = 0; index < questions.length; index += 1) {
    const quiz = screen.getByRole("dialog");
    const question = questions.find(q => within(quiz).queryByRole("heading", { name: q.question }));
    if (!question) throw new Error("Displayed question missing from production data");
    fireEvent.click(within(quiz).getByRole("button", { name: question.answers[question.correct] }));
    click(index === questions.length - 1 ? /See my result/i : /Next question/i);
  }
  return rendered;
}
function submitGuess(value: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Your answer" }), { target: { value } });
  click(/Submit guess/i);
}
function enterPoeTrivia() {
  for (const [index, answer] of ["the raven", "the tell tale heart", "the black cat", "annabel lee", "the masque of the red death"].entries()) {
    submitGuess(answer);
    click(index === 4 ? /Enter bonus trivia/i : /Turn the page/i);
  }
}

describe("Poe return to shared main menu", () => {
  it("warns about lost progress and leaves input, attempts, round, and score unchanged on Cancel", () => {
    enterPoe();
    submitGuess("the raven");
    click(/Turn the page/i);
    submitGuess("incorrect title");
    const input = screen.getByRole("textbox", { name: "Your answer" });
    fireEvent.change(input, { target: { value: "the tell" } });
    const game = input.closest(".poe-shell")!;
    const confirm = mockConfirm().mockReturnValue(false);
    const navigate = vi.spyOn(window.location, "assign").mockImplementation(() => {});

    for (let attempt = 0; attempt < 2; attempt += 1) {
      click(/^Return to Main Menu$/);
      expect(screen.getByRole("textbox", { name: "Your answer" })).toBe(input);
      expect(input).toHaveValue("the tell");
      expect(screen.getByLabelText("Round 2 of 5")).toBeInTheDocument();
      expect(screen.getByText("incorrect title")).toBeInTheDocument();
      expect(screen.getByText("2 attempts remaining")).toBeInTheDocument();
      expect(game.querySelector(".score strong")).toHaveTextContent("1");
    }
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/progress.*answers and scores.*lost/i));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("keeps the current trivia question, answer lock, and score after cancellation", () => {
    enterPoe();
    enterPoeTrivia();
    const answer = screen.getByRole("button", { name: new RegExp(triviaQuestions[0].answer) });
    fireEvent.click(answer);
    mockConfirm().mockReturnValue(false);
    const navigate = vi.spyOn(window.location, "assign").mockImplementation(() => {});
    click(/^Return to Main Menu$/);
    expect(screen.getByText("Question 1 of 20")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(triviaQuestions[0].answer) })).toBe(answer);
    expect(answer).toBeDisabled();
    expect(screen.getByText("10 points")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
    click(/Next question/i);
    expect(screen.getByText("Question 2 of 20")).toBeInTheDocument();
  });

  it("navigates exactly once to menuUrl only after confirmation, without advancing to Bashō", () => {
    enterPoe();
    const input = screen.getByRole("textbox", { name: "Your answer" });
    const confirm = mockConfirm().mockReturnValueOnce(false).mockReturnValueOnce(true);
    const navigate = vi.spyOn(window.location, "assign").mockImplementation(() => {});
    click(/^Return to Main Menu$/);
    expect(navigate).not.toHaveBeenCalled();
    click(/^Return to Main Menu$/);
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(menuUrl);
    // The navigation is mocked: there should be no local reset or forward transition.
    expect(screen.getByRole("textbox", { name: "Your answer" })).toBe(input);
    expect(screen.queryByText("Help Bashō find his patron")).not.toBeInTheDocument();
  });

  it("uses the existing Main Menu → Play → Shakespeare route and starts fresh gameplay", () => {
    const currentPage = enterPoe();
    mockConfirm().mockReturnValue(true);
    const navigate = vi.spyOn(window.location, "assign").mockImplementation(() => {});
    click(/^Return to Main Menu$/);
    expect(navigate).toHaveBeenCalledWith(menuUrl);
    currentPage.unmount(); // Simulate the document leaving; Vitest does not load another Vite server.

    window.history.replaceState(null, "", "/");
    let items: MenuItem[] = [];
    let select: (item: MenuItem) => void = () => {};
    const renderMenu = vi.fn((_title: string, nextItems: MenuItem[], onSelect: (item: MenuItem) => void) => {
      items = nextItems;
      select = onSelect;
    });
    new MenuController(new MenuModel(), { render: renderMenu } as unknown as MenuView).start();
    expect(renderMenu.mock.calls[0][0]).toBe("Main Menu");
    select(items.find(item => item.label === "Play")!);
    expect(renderMenu.mock.lastCall?.[0]).toBe("Choose Your Story");
    const shakespeare = items.find(item => item.label === "Shakespeare")!;
    expect(shakespeare.href).toBe(destinations.shakespeare);
    select(shakespeare);
    expect(window.location.href).toBe(destinations.shakespeare);

    render(<App />); // Fresh destination mount, not the old storyline instance.
    expect(screen.getByRole("heading", { name: /One worksheet/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Return to Main Menu" })).toBeInTheDocument();
    goToQuiz();
    expect(screen.getByText("QUESTION 1 OF 20")).toBeInTheDocument();
    expect(screen.getByText("0 POINTS")).toBeInTheDocument();
    const quiz = screen.getByRole("dialog");
    const question = questions.find(q => within(quiz).queryByRole("heading", { name: q.question }))!;
    const answer = within(quiz).getByRole("button", { name: question.answers[question.correct] });
    expect(answer).toBeEnabled();
    fireEvent.click(answer);
    expect(screen.getByText("10 POINTS")).toBeInTheDocument();
  });
});
