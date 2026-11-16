import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BashoController } from "../basho/BashoController";
import { BashoModel } from "../basho/BashoModel";
import { BashoView } from "../basho/BashoView";
import { bashoPoems, BashoScreens, BashoPoem, BashoScreen, BashoScreenID } from "../basho/poems";

vi.mock("../basho/BashoView", () => {
    return {
        BashoView: vi.fn().mockImplementation(function () {
            return {
                updateRound: vi.fn(),
                updateTimer: vi.fn(),
                highlight: vi.fn(),
                showFeedback: vi.fn(),
                showMessage: vi.fn(),
                showTransition: vi.fn(),
                destroy: vi.fn(),
            };
        }),
    }
});

// Two short poems (two lines each) so a full playthrough stays small
const samplePoems: BashoPoem[] = [
    {
        title: "Poem One",
        season: "Spring",
        lines: [
            { syllables: 5, correct: "Line 1A", options: ["Line 1A", "Wrong 1A", "Other 1A"] },
            { syllables: 7, correct: "Line 1B", options: ["Wrong 1B", "Line 1B", "Other 1B"] },
        ],
    },
    {
        title: "Poem Two",
        season: "Autumn",
        lines: [
            { syllables: 5, correct: "Line 2A", options: ["Other 2A", "Wrong 2A", "Line 2A"] },
            { syllables: 7, correct: "Line 2B", options: ["Line 2B", "Other 2B", "Wrong 2B"] },
        ],
    },
];

const sampleScreen = (name: string): BashoScreen => ({
    kicker: `${name} kicker`,
    title: `${name} title`,
    body: `${name} body`,
    buttonLabel: `${name} button`,
    hint: `${name} hint`,
});

const sampleScreens: Record<BashoScreenID, BashoScreen> = {
    briefing: sampleScreen("briefing"),
    won: sampleScreen("won"),
    lost: sampleScreen("lost"),
    farewell: sampleScreen("farewell"),
};

describe("poems.ts check", () => {
    it("check if every poem is a 5-7-5 haiku with three choices per line", () => {
        expect(bashoPoems.length).toBe(3);

        for (const poem of bashoPoems) {
            expect(poem.title.length).toBeGreaterThan(0);
            expect(poem.season.length).toBeGreaterThan(0);
            expect(poem.lines.map((line) => line.syllables)).toEqual([5, 7, 5]);

            for (const line of poem.lines) {
                expect(line.options).toHaveLength(3);
                expect(new Set(line.options).size).toBe(3);
                expect(line.options.filter((option) => option === line.correct)).toHaveLength(1);
            }
        }
    });

    it("check if every story card has text and a button", () => {
        for (const id of ["briefing", "won", "lost", "farewell"] as BashoScreenID[]) {
            expect(BashoScreens[id], `Missing BashoScreens entry for ${id}`).toBeDefined();
            expect(BashoScreens[id].title.length).toBeGreaterThan(0);
            expect(BashoScreens[id].body.length).toBeGreaterThan(0);
            expect(BashoScreens[id].buttonLabel.length).toBeGreaterThan(0);
        }
    });
});

describe("BashoModel", () => {
    let model: BashoModel;

    // Picks the right line for the current round, then moves on
    const answerCorrectly = () => {
        model.submitChoice(model.getCurrentLine().correct);
        return model.advance();
    };

    // Picks a wrong line for the current round, then moves on
    const answerWrong = () => {
        model.submitChoice("not a real choice");
        return model.advance();
    };

    beforeEach(() => {
        model = new BashoModel(samplePoems, 3);
    });

    it("starts on round 1 of 4 with full lives and the full 16 seconds", () => {
        expect(model.getCurrentPoem().title).toBe("Poem One");
        expect(model.getRound()).toBe(1);
        expect(model.getTotalRounds()).toBe(4);
        expect(model.getLives()).toBe(3);
        expect(model.getTimeLimit()).toBe(16);
        expect(model.getTimeLeft()).toBe(16);
    });

    it("counts nine rounds for the real haiku", () => {
        expect(new BashoModel(bashoPoems).getTotalRounds()).toBe(9);
    });

    it("orders the choices by their first letter", () => {
        // "A distant temple bell", "Distant temple bell", "Bronze bell in the mist"
        const roadToEdo = new BashoModel([bashoPoems[2]]);
        expect(roadToEdo.getOptions()).toEqual(["A distant temple bell", "Bronze bell in the mist", "Distant temple bell"]);
    });

    it("locks a correct line, then advance() moves to the next line", () => {
        expect(model.submitChoice("Line 1A")).toBe("correct");
        expect(model.getLockedLines()).toEqual(["Line 1A"]);
        expect(model.getRound()).toBe(1);

        expect(model.advance()).toBe("continue");
        expect(model.getRound()).toBe(2);
        expect(model.getCurrentLine().correct).toBe("Line 1B");
    });

    it("shortens the time limit by 0.7s per attempt and 1.5s per lost life", () => {
        answerCorrectly();
        expect(model.getTimeLimit()).toBeCloseTo(15.3);
        expect(model.getTimeLeft()).toBeCloseTo(15.3);

        answerWrong();
        // 2 attempts and 1 lost life
        expect(model.getTimeLimit()).toBeCloseTo(16 - 1.4 - 1.5);
    });

    it("never lets the time limit drop below the 6 second floor", () => {
        const patient = new BashoModel(samplePoems, 10);
        for (let i = 0; i < 8; i++) {
            patient.loseLife();
            patient.advance();
        }
        expect(patient.getTimeLimit()).toBe(6);
        expect(patient.getTimeLeft()).toBe(6);
    });

    it("runs out of time after about 16 seconds of ticks", () => {
        let ticks = 0;
        while (!model.tick()) {
            ticks++;
        }
        expect(ticks).toBeGreaterThan(150);
        expect(ticks).toBeLessThan(170);
        expect(model.getTimeLeft()).toBe(0);
    });

    it("pauses the clock while feedback is showing", () => {
        model.submitChoice("Line 1A");
        const before = model.getTimeLeft();
        expect(model.tick()).toBe(false);
        expect(model.getTimeLeft()).toBe(before);
    });

    it("costs a life and moves to the other poem on a wrong choice", () => {
        expect(model.submitChoice("Wrong 1A")).toBe("wrong");
        expect(model.getLives()).toBe(2);

        expect(model.advance()).toBe("continue");
        expect(model.getCurrentPoem().title).toBe("Poem Two");
        expect(model.getCurrentLine().correct).toBe("Line 2A");
        expect(model.getLockedLines()).toEqual([]);
    });

    it("sends the player back to the first line of an unfinished poem after a mistake", () => {
        model.submitChoice("Line 1A");
        model.advance();
        // Mistake on line 2 of Poem One loses the lines locked in so far
        answerWrong();
        expect(model.getCurrentPoem().title).toBe("Poem Two");
        expect(model.getRound()).toBe(1);
    });

    it("stays on the same poem after a mistake when it is the only one left", () => {
        answerCorrectly();
        answerCorrectly();
        expect(model.getCompletedPoems()).toEqual([0]);
        expect(model.getCurrentPoem().title).toBe("Poem Two");

        answerWrong();
        expect(model.getCurrentPoem().title).toBe("Poem Two");
        expect(model.getCurrentLine().correct).toBe("Line 2A");
    });

    it("finishes a poem after its last line and starts the next one", () => {
        answerCorrectly();
        expect(answerCorrectly()).toBe("continue");

        expect(model.getCompletedPoems()).toEqual([0]);
        expect(model.getCurrentPoem().title).toBe("Poem Two");
        expect(model.getLockedLines()).toEqual([]);
        // Two lines finished, so the third round of four
        expect(model.getRound()).toBe(3);
    });

    it("wins once every poem is finished", () => {
        const results = [answerCorrectly(), answerCorrectly(), answerCorrectly(), answerCorrectly()];
        expect(results).toEqual(["continue", "continue", "continue", "won"]);
        expect(model.getCompletedPoems()).toEqual([0, 1]);
    });

    it("loses after the last life is gone", () => {
        expect(answerWrong()).toBe("continue");
        expect(answerWrong()).toBe("continue");
        expect(model.getLives()).toBe(1);
        expect(answerWrong()).toBe("lost");
        expect(model.getLives()).toBe(0);
    });

    it("ignores more choices until advance() is called", () => {
        model.submitChoice("Wrong 1A");
        expect(model.submitChoice("Wrong 1A")).toBe("ignored");
        expect(model.submitChoice("Line 1A")).toBe("ignored");
        expect(model.getLives()).toBe(2);
    });

    it("only costs one life when the clock runs out right after a wrong choice", () => {
        model.submitChoice("Wrong 1A");
        model.loseLife();
        expect(model.getLives()).toBe(2);
    });

    it("loseLife() (clock ran out) counts as a mistake", () => {
        model.loseLife();
        expect(model.getLives()).toBe(2);
        model.advance();
        expect(model.getCurrentPoem().title).toBe("Poem Two");
    });

    it("reset() starts the whole game over", () => {
        answerCorrectly();
        answerWrong();
        model.reset();

        expect(model.getLives()).toBe(3);
        expect(model.getRound()).toBe(1);
        expect(model.getCompletedPoems()).toEqual([]);
        expect(model.getLockedLines()).toEqual([]);
        expect(model.getTimeLimit()).toBe(16);
        expect(model.getCurrentPoem().title).toBe("Poem One");
    });

    it("getRoundInfo() gives the view everything it draws", () => {
        const info = model.getRoundInfo();
        expect(info.poem.title).toBe("Poem One");
        expect(info.line.syllables).toBe(5);
        expect(info.options).toEqual(["Line 1A", "Other 1A", "Wrong 1A"]);
        expect(info).toMatchObject({ lineIdx: 0, round: 1, totalRounds: 4, lives: 3, maxLives: 3, timeLimit: 16 });
    });
});

describe ("BashoController", () => {
    let onComplete: ReturnType<typeof vi.fn<() => void>>;
    let controller: BashoController;
    let mockView: {
        updateRound: ReturnType<typeof vi.fn>;
        updateTimer: ReturnType<typeof vi.fn>;
        highlight: ReturnType<typeof vi.fn>;
        showFeedback: ReturnType<typeof vi.fn>;
        showMessage: ReturnType<typeof vi.fn>;
        showTransition: ReturnType<typeof vi.fn>;
        destroy: ReturnType<typeof vi.fn>;
    };
    let triggerSelect: (option: string, idx: number) => void;

    // Presses the button on the story card that is showing right now
    const pressButton = () => mockView.showMessage.mock.lastCall![1]();
    // The round the view was last asked to draw
    const lastRound = () => mockView.updateRound.mock.lastCall![0];
    // Picks the right line by position, like a click on its button
    const pickCorrect = () => {
        const info = lastRound();
        triggerSelect(info.line.correct, info.options.indexOf(info.line.correct));
    };
    const pickWrong = () => {
        const info = lastRound();
        const wrong = info.options.find((option: string) => option !== info.line.correct);
        triggerSelect(wrong, info.options.indexOf(wrong));
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();

        onComplete = vi.fn<() => void>();
        controller = new BashoController(samplePoems, sampleScreens, { onComplete }, "container", 3);
        mockView = (BashoView as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
        triggerSelect = (BashoView as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows the briefing on start()", () => {
        controller.start();
        expect(mockView.showMessage).toHaveBeenCalledTimes(1);
        expect(mockView.showMessage.mock.calls[0][0]).toBe(sampleScreens.briefing);
        expect(mockView.updateRound).not.toHaveBeenCalled();
    });

    it("does nothing on start() if there are no poems", () => {
        vi.clearAllMocks();
        const empty = new BashoController([], sampleScreens, { onComplete });
        empty.start();
        const emptyView = (BashoView as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
        expect(emptyView.showMessage).not.toHaveBeenCalled();
    });

    it("starts round 1 with full lives when the briefing button is pressed", () => {
        controller.start();
        pressButton();
        expect(mockView.updateRound).toHaveBeenCalledTimes(1);
        expect(lastRound()).toMatchObject({ round: 1, totalRounds: 4, lives: 3, lineIdx: 0, lockedLines: [] });
    });

    it("counts the clock down and updates the view every 0.1 seconds", () => {
        controller.start();
        pressButton();
        vi.advanceTimersByTime(1000);
        expect(mockView.updateTimer).toHaveBeenCalledTimes(10);
        const [timeLeft, timeLimit] = mockView.updateTimer.mock.lastCall!;
        expect(timeLeft).toBeCloseTo(15);
        expect(timeLimit).toBe(16);
    });

    it("locks the line, highlights green, and moves on 650ms after a correct choice", () => {
        controller.start();
        pressButton();
        pickCorrect();

        expect(mockView.highlight).toHaveBeenCalledWith(0, true);
        expect(mockView.showFeedback).toHaveBeenCalledWith(true);
        expect(lastRound().lockedLines).toEqual(["Line 1A"]);
        const roundsBefore = mockView.updateRound.mock.calls.length;

        vi.advanceTimersByTime(649);
        expect(mockView.updateRound).toHaveBeenCalledTimes(roundsBefore);
        vi.advanceTimersByTime(1);
        expect(mockView.updateRound).toHaveBeenCalledTimes(roundsBefore + 1);
        // Line 1 stays locked in while the player works on line 2 of the same poem
        expect(lastRound()).toMatchObject({ round: 2, lineIdx: 1, lockedLines: ["Line 1A"] });
    });

    it("stops the clock while feedback is showing", () => {
        controller.start();
        pressButton();
        pickCorrect();
        const ticksBefore = mockView.updateTimer.mock.calls.length;
        vi.advanceTimersByTime(500);
        expect(mockView.updateTimer).toHaveBeenCalledTimes(ticksBefore);
    });

    it("costs a life, highlights red, and moves to the next poem 850ms after a wrong choice", () => {
        controller.start();
        pressButton();
        pickWrong();

        expect(mockView.highlight).toHaveBeenCalledWith(expect.any(Number), false);
        expect(mockView.showFeedback).toHaveBeenCalledWith(false);
        expect(lastRound().lives).toBe(2);

        vi.advanceTimersByTime(849);
        expect(lastRound().poem.title).toBe("Poem One");
        vi.advanceTimersByTime(1);
        expect(lastRound().poem.title).toBe("Poem Two");
        expect(lastRound()).toMatchObject({ lives: 2, lineIdx: 0 });
    });

    it("ignores a second pick while feedback is showing", () => {
        controller.start();
        pressButton();
        pickWrong();
        pickWrong();
        pickCorrect();

        expect(mockView.highlight).toHaveBeenCalledTimes(1);
        expect(lastRound().lives).toBe(2);
    });

    it("costs a life when the time runs out", () => {
        controller.start();
        pressButton();
        vi.advanceTimersByTime(16200);

        expect(mockView.showFeedback).toHaveBeenCalledWith(false);
        expect(mockView.highlight).not.toHaveBeenCalled();
        expect(lastRound().lives).toBe(2);
    });

    it("shows the lose card after the last life, and the button restarts with full lives", () => {
        controller.start();
        pressButton();
        for (let i = 0; i < 3; i++) {
            pickWrong();
            vi.advanceTimersByTime(850);
        }

        expect(mockView.showMessage.mock.lastCall![0]).toBe(sampleScreens.lost);
        // Clock is stopped on the lose card
        const ticksBefore = mockView.updateTimer.mock.calls.length;
        vi.advanceTimersByTime(5000);
        expect(mockView.updateTimer).toHaveBeenCalledTimes(ticksBefore);

        pressButton();
        expect(lastRound()).toMatchObject({ round: 1, lives: 3, lockedLines: [] });
        expect(onComplete).not.toHaveBeenCalled();
    });

    it("plays through win, farewell, and the transition, then calls onComplete()", () => {
        controller.start();
        pressButton();
        for (let i = 0; i < 4; i++) {
            pickCorrect();
            vi.advanceTimersByTime(650);
        }

        // Win card, then the farewell, then the time-travel screen
        expect(mockView.showMessage.mock.lastCall![0]).toBe(sampleScreens.won);
        pressButton();
        expect(mockView.showMessage.mock.lastCall![0]).toBe(sampleScreens.farewell);
        pressButton();
        expect(mockView.showTransition).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(2599);
        expect(onComplete).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(mockView.destroy).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("destroy() stops the clock and clears the view", () => {
        controller.start();
        pressButton();
        controller.destroy();
        const ticksBefore = mockView.updateTimer.mock.calls.length;
        vi.advanceTimersByTime(20000);

        expect(mockView.destroy).toHaveBeenCalledTimes(1);
        expect(mockView.updateTimer).toHaveBeenCalledTimes(ticksBefore);
    });
});
