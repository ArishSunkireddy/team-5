import { describe, it, expect, vi, beforeEach } from "vitest";
import { PoeController } from "../poe/PoeController";
import { PoeModel, normalizeGuess } from "../poe/PoeModel";
import { PoeView } from "../poe/PoeView";
import { poeRounds, PoeRound } from "../poe/rounds";

vi.mock("../poe/PoeView", () => {
    return {
        PoeView: vi.fn().mockImplementation(function () {
            return {
                updateRound: vi.fn(),
                updateScore: vi.fn(),
                updateGuesses: vi.fn(),
                showReveal: vi.fn(),
                destroy: vi.fn(),
            };
        }),
    }
});

const sampleRounds: PoeRound[] = [
    {
        scramble: "TSRIF",
        answer: "first",
        displayAnswer: "First",
        eyebrow: "The first hint",
        explanation: "Explains the first answer",
    },
    {
        scramble: "DNOCES",
        answer: "second one",
        displayAnswer: "Second-One",
        eyebrow: "The second hint",
        explanation: "Explains the second answer",
    },
];

// Letters only, in alphabetical order. Two titles are anagrams of each other if these match
const lettersOf = (value: string) => normalizeGuess(value).split("").sort().join("");

describe("rounds.ts check", () => {
    it("check if every round is a real anagram of its answer", () => {
        expect(poeRounds.length).toBe(5);

        for (const round of poeRounds) {
            expect(round.scramble.length).toBeGreaterThan(0);
            expect(round.eyebrow.length).toBeGreaterThan(0);
            expect(round.explanation.length).toBeGreaterThan(0);
            expect(lettersOf(round.scramble), `${round.displayAnswer} is not an anagram of its scramble`).toBe(lettersOf(round.answer));
            // The title shown on the reveal card matches the answer the player has to type
            expect(normalizeGuess(round.displayAnswer)).toBe(normalizeGuess(round.answer));
        }
    });

    it("check if every answer is different", () => {
        const answers = poeRounds.map((round) => round.answer);
        expect(new Set(answers).size).toBe(answers.length);
    });
});

describe("PoeModel", () => {
    let model: PoeModel;

    beforeEach(() => {
        model = new PoeModel(sampleRounds, 3);
    });

    it("ignores capitals, spaces, and punctuation when comparing guesses", () => {
        expect(normalizeGuess("The Tell-Tale Heart!")).toBe("thetelltaleheart");
        expect(normalizeGuess("  ANNABEL   lee ")).toBe("annabellee");
    });

    it("starts on round 1 of 2 with no score and 3 attempts", () => {
        expect(model.getCurrentRound()).toBe(sampleRounds[0]);
        expect(model.getRoundNumber()).toBe(1);
        expect(model.getTotalRounds()).toBe(2);
        expect(model.getScore()).toBe(0);
        expect(model.getAttemptsLeft()).toBe(3);
        expect(model.getGuesses()).toEqual([]);
    });

    it("scores a correct guess however it is typed", () => {
        expect(model.submitGuess("  FIRST  ")).toBe("correct");
        expect(model.getScore()).toBe(1);
        expect(model.getGuesses()).toEqual(["FIRST"]);
    });

    it("counts down the attempts on wrong guesses", () => {
        expect(model.submitGuess("nope")).toBe("wrong");
        expect(model.getAttemptsLeft()).toBe(2);
        expect(model.submitGuess("still nope")).toBe("wrong");
        expect(model.getAttemptsLeft()).toBe(1);
        expect(model.getScore()).toBe(0);
    });

    it("fails the round on the third wrong guess", () => {
        model.submitGuess("one");
        model.submitGuess("two");
        expect(model.submitGuess("three")).toBe("failed");
        expect(model.getAttemptsLeft()).toBe(0);
        expect(model.getScore()).toBe(0);
    });

    it("can still solve the round on the last attempt", () => {
        model.submitGuess("one");
        model.submitGuess("two");
        expect(model.submitGuess("first")).toBe("correct");
        expect(model.getScore()).toBe(1);
    });

    it("ignores blank guesses", () => {
        expect(model.submitGuess("")).toBe("ignored");
        expect(model.submitGuess("    ")).toBe("ignored");
        expect(model.getAttemptsLeft()).toBe(3);
    });

    it("ignores guesses once the round is over", () => {
        model.submitGuess("first");
        expect(model.submitGuess("first")).toBe("ignored");
        expect(model.getScore()).toBe(1);
        expect(model.getGuesses()).toEqual(["first"]);
    });

    it("nextRound() moves on with fresh attempts and keeps the score", () => {
        model.submitGuess("first");
        expect(model.isLastRound()).toBe(false);
        expect(model.nextRound()).toBe(true);

        expect(model.getCurrentRound()).toBe(sampleRounds[1]);
        expect(model.getRoundNumber()).toBe(2);
        expect(model.getGuesses()).toEqual([]);
        expect(model.getAttemptsLeft()).toBe(3);
        expect(model.getScore()).toBe(1);
        // The new round accepts guesses again
        expect(model.submitGuess("second one")).toBe("correct");
        expect(model.getScore()).toBe(2);
    });

    it("nextRound() stays on the last round and returns false", () => {
        model.nextRound();
        expect(model.isLastRound()).toBe(true);
        expect(model.nextRound()).toBe(false);
        expect(model.getRoundNumber()).toBe(2);
    });

    it("reset() starts the whole game over", () => {
        model.submitGuess("first");
        model.nextRound();
        model.reset();

        expect(model.getRoundNumber()).toBe(1);
        expect(model.getScore()).toBe(0);
        expect(model.getGuesses()).toEqual([]);
        expect(model.submitGuess("first")).toBe("correct");
    });
});

describe ("PoeController", () => {
    let onComplete: ReturnType<typeof vi.fn<(solved: number) => void>>;
    let controller: PoeController;
    let mockView: {
        updateRound: ReturnType<typeof vi.fn>;
        updateScore: ReturnType<typeof vi.fn>;
        updateGuesses: ReturnType<typeof vi.fn>;
        showReveal: ReturnType<typeof vi.fn>;
        destroy: ReturnType<typeof vi.fn>;
    };
    let triggerSubmit: (guess: string) => void;

    beforeEach(() => {
        vi.clearAllMocks();

        onComplete = vi.fn<(solved: number) => void>();
        controller = new PoeController(sampleRounds, { onComplete }, "container", 3);
        mockView = (PoeView as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
        triggerSubmit = (PoeView as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    });

    it("Starts round 1 with 3 attempts and score 0 on start()", () => {
        controller.start();
        expect(mockView.updateRound).toHaveBeenCalledTimes(1);
        expect(mockView.updateRound).toHaveBeenCalledWith(sampleRounds[0], 1, 2, 0);
        expect(mockView.updateGuesses).toHaveBeenCalledWith([], 3);
    });

    it("does nothing on start() if there are no rounds", () => {
        vi.clearAllMocks();
        const empty = new PoeController([], { onComplete });
        empty.start();
        const emptyView = (PoeView as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
        expect(emptyView.updateRound).not.toHaveBeenCalled();
    });

    it("shows the guess and one fewer attempt after a wrong guess, without revealing", () => {
        controller.start();
        triggerSubmit("nope");

        expect(mockView.updateGuesses).toHaveBeenLastCalledWith(["nope"], 2, false);
        expect(mockView.updateScore).not.toHaveBeenCalled();
        expect(mockView.showReveal).not.toHaveBeenCalled();
    });

    it("awards the point and reveals the answer after a correct guess", () => {
        controller.start();
        triggerSubmit("FIRST!");

        expect(mockView.updateGuesses).toHaveBeenLastCalledWith(["FIRST!"], 2, true);
        expect(mockView.updateScore).toHaveBeenCalledWith(1, 2);
        expect(mockView.showReveal).toHaveBeenCalledTimes(1);
        expect(mockView.showReveal).toHaveBeenCalledWith(true, sampleRounds[0], "Turn the page", expect.any(Function));
    });

    it("reveals the answer without a point after the third wrong guess", () => {
        controller.start();
        triggerSubmit("one");
        triggerSubmit("two");
        expect(mockView.showReveal).not.toHaveBeenCalled();
        triggerSubmit("three");

        expect(mockView.updateScore).not.toHaveBeenCalled();
        expect(mockView.showReveal).toHaveBeenCalledWith(false, sampleRounds[0], "Turn the page", expect.any(Function));
    });

    it("ignores blank guesses and guesses after the round is over", () => {
        controller.start();
        triggerSubmit("   ");
        expect(mockView.updateGuesses).toHaveBeenCalledTimes(1);

        triggerSubmit("first");
        triggerSubmit("first");
        expect(mockView.showReveal).toHaveBeenCalledTimes(1);
        expect(mockView.updateScore).toHaveBeenCalledTimes(1);
    });

    it("moves to round 2 when the reveal button is pressed", () => {
        controller.start();
        triggerSubmit("first");
        const action = mockView.showReveal.mock.calls[0][3];
        action();

        expect(mockView.updateRound).toHaveBeenCalledTimes(2);
        expect(mockView.updateRound).toHaveBeenLastCalledWith(sampleRounds[1], 2, 2, 1);
        expect(mockView.updateGuesses).toHaveBeenLastCalledWith([], 3);
        expect(mockView.destroy).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
    });

    it("offers the bonus trivia after the last round, then destroy() and onComplete(solved)", () => {
        controller.start();
        triggerSubmit("first");
        mockView.showReveal.mock.calls[0][3]();

        triggerSubmit("a");
        triggerSubmit("b");
        triggerSubmit("c");
        expect(mockView.showReveal).toHaveBeenCalledTimes(2);
        const [correct, round, buttonLabel, action] = mockView.showReveal.mock.calls[1];

        expect(correct).toBe(false);
        expect(round).toBe(sampleRounds[1]);
        expect(buttonLabel).toBe("Enter bonus trivia");

        action();
        expect(mockView.destroy).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith(1);
    });

    it("start() again begins from round 1 with no score", () => {
        controller.start();
        triggerSubmit("first");
        mockView.showReveal.mock.calls[0][3]();
        controller.start();

        expect(mockView.updateRound).toHaveBeenLastCalledWith(sampleRounds[0], 1, 2, 0);
    });
});
