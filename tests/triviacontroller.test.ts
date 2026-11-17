import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TriviaController } from "../trivia/TriviaController";
import { TriviaView } from "../trivia/TriviaView";
import { individualTrivia, TriviaEndings, TriviaQuestion, TriviaEnding } from "../trivia/questions";

vi.mock("../trivia/TriviaView", () => {
    return {
        TriviaView: vi.fn().mockImplementation(function () {
            return {
                updateQuestion: vi.fn(),
                updateScore: vi.fn(),
                highlight: vi.fn(),
                showEnd: vi.fn(),
                destroy: vi.fn(),
            };
        }),
    }
});

const sampleQuestion: TriviaQuestion[] = [
    {
        question: "Question 1",
        options: ["Correct 1", "Wrong A", "Wrong B", "Wrong C"],
        answer: "Correct 1",
    },
    {
        question: "Question 2",
        options: ["Wrong X", "Correct 2", "Wrong Y", "Wrong Z"],
        answer: "Correct 2",
    },
];

const sampleEnding: TriviaEnding = {
    passingScore: 20,
    passMessage: "You passed",
    passButtonLabel: "Continue",
    failMessage: "Try again",
    failButtonLabel: "Retry",
};

describe("questions.ts check", () => {
    it("check if every author has 4 options and a matching ending", () => {
        const authors = Object.keys(individualTrivia);
        expect(authors.length).toBeGreaterThan(0);

        for (const author of authors) {
            const questions = individualTrivia[author];
            const ending = TriviaEndings[author];

            expect(ending, `Missing TriviaEndings entry for ${author}`).toBeDefined();
            expect(questions.length).toBeGreaterThan(0);

            for (const q of questions) {
                expect(q.options).toHaveLength(4);
                expect(q.options).toContain(q.answer);
            }
        }
    });
});

describe ("TriviaController", () => {
    let onReturn: ReturnType<typeof vi.fn<(finalScore: number) => void>>;
    let controller: TriviaController;
    let mockView: {
        updateQuestion: ReturnType<typeof vi.fn>;
        updateScore: ReturnType<typeof vi.fn>;
        highlight: ReturnType<typeof vi.fn>;
        showEnd: ReturnType<typeof vi.fn>;
        destroy: ReturnType<typeof vi.fn>;
    };
    let triggerSelect: (option: string, idx: number) => void;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();

        onReturn = vi.fn<(finalScore: number) => void>();
        controller = new TriviaController(sampleQuestion, sampleEnding, { onReturn }, "container", 10);
        mockView = (TriviaView as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
        triggerSelect = (TriviaView as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("Starts q1 with options and score 0 on start()", () => {
        controller.start();
        expect(mockView.updateQuestion).toHaveBeenCalledTimes(1);
        expect(mockView.updateQuestion).toHaveBeenCalledWith(sampleQuestion[0], 1, 2, 0);
    });

    it("awards points, highlights green, and advances 1000ms after correct answer", () => {
        controller.start();
        triggerSelect("Correct 1", 0);

        expect(mockView.updateScore).toHaveBeenCalledWith(10);
        expect(mockView.highlight).toHaveBeenCalledWith(0, true);
        expect(mockView.updateQuestion).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1000);
        expect(mockView.updateQuestion).toHaveBeenCalledTimes(2);
        expect(mockView.updateQuestion).toHaveBeenLastCalledWith(sampleQuestion[1], 2, 2, 10);
    });

    it("does not give points and highlights red on incorrect", () => {
        controller.start();
        triggerSelect("Wrong A", 1);
        expect(mockView.updateScore).not.toHaveBeenCalled();
        expect(mockView.highlight).toHaveBeenCalledWith(1, false);
    });

    it("shows pass ending, calls destroy(), and onReturn(score) when passing", () => {
        controller.start();
        triggerSelect("Correct 1", 0);
        vi.advanceTimersByTime(1000);
        triggerSelect("Correct 2", 1);
        vi.advanceTimersByTime(1000);
        expect(mockView.showEnd).toHaveBeenCalledTimes(1);
        const [finalScore, message, buttonLabel, action] = mockView.showEnd.mock.calls[0];

        expect(finalScore).toBe(20);
        expect(message).toBe("You passed");
        expect(buttonLabel).toBe("Continue");

        action();
        expect(mockView.destroy).toHaveBeenCalledTimes(1);
        expect(onReturn).toHaveBeenCalledWith(20);
    });

    it("shows fail ending and restarts if score not met", () => {
        controller.start();
        triggerSelect("Wrong A", 1);
        vi.advanceTimersByTime(1000);
        triggerSelect("Correct 2", 1);
        vi.advanceTimersByTime(1000);
        expect(mockView.showEnd).toHaveBeenCalledTimes(1);
        const [finalScore, message, buttonLabel, action] = mockView.showEnd.mock.calls[0];

        expect(finalScore).toBe(10);
        expect(message).toBe("Try again");
        expect(buttonLabel).toBe("Retry");

        action();
        expect(mockView.destroy).not.toHaveBeenCalled();
        expect(mockView.updateQuestion).toHaveBeenCalledTimes(3);
        expect(mockView.updateQuestion).toHaveBeenLastCalledWith(sampleQuestion[0], 1, 2, 0);
    });
});