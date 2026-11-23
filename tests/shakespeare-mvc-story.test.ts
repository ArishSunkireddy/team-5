import { describe, it, expect } from "vitest";
import { prologueCards, storyRounds, farewellCard } from "../shakespeare-mvc/story";
import { ShakespeareModel } from "../shakespeare-mvc/ShakespeareModel";

describe("Shakespeare story data", () => {
    it("has the three rounds in order", () => {
        expect(storyRounds.map((round) => round.year)).toEqual([1588, 1599, 1603]);
    });

    it("gives each round exactly two choices, one of them successful", () => {
        for (const round of storyRounds) {
            expect(round.choices).toHaveLength(2);
            expect(round.choices.filter((choice) => choice.successful)).toHaveLength(1);
        }
    });

    it("marks the historically successful choices", () => {
        const successful = storyRounds.map((round) => round.choices.find((choice) => choice.successful)!.title);
        expect(successful).toEqual(["English Nationalism", "A Tragedy in Ancient Rome", "A Scottish Tragedy"]);
    });

    it("gives every result card a title and text", () => {
        for (const round of storyRounds) {
            for (const choice of round.choices) {
                expect(choice.title).not.toBe("");
                expect(choice.result.title).not.toBe("");
                expect(choice.result.text).not.toBe("");
            }
        }
    });

    it("gives every round context and a question", () => {
        for (const round of storyRounds) {
            expect(round.contextTitle).not.toBe("");
            expect(round.contextText).not.toBe("");
            expect(round.question).not.toBe("");
        }
    });

    it("gives the prologue and farewell cards text and a button", () => {
        expect(prologueCards).toHaveLength(4);
        for (const card of [...prologueCards, farewellCard]) {
            expect(card.title).not.toBe("");
            expect(card.text).not.toBe("");
            expect(card.buttonLabel).not.toBe("");
        }
    });
});

describe("ShakespeareModel", () => {
    // Plays through the prologue so the model is on the first context screen
    const finishPrologue = (model: ShakespeareModel) => {
        for (let idx = 0; idx < prologueCards.length; idx++) {
            model.advance();
        }
    };

    it("starts on the first prologue screen", () => {
        expect(new ShakespeareModel().getScreen()).toEqual({ type: "prologue", index: 0 });
    });

    it("walks through the prologue and into round 1", () => {
        const model = new ShakespeareModel();
        model.advance();
        expect(model.getScreen()).toEqual({ type: "prologue", index: 1 });
        for (let idx = 1; idx < prologueCards.length; idx++) {
            model.advance();
        }
        expect(model.getScreen()).toEqual({ type: "context", round: 0 });
        model.advance();
        expect(model.getScreen()).toEqual({ type: "choice", round: 0 });
    });

    it("does not leave a choice screen until a choice is made", () => {
        const model = new ShakespeareModel();
        finishPrologue(model);
        model.advance();
        model.advance();
        expect(model.getScreen()).toEqual({ type: "choice", round: 0 });
    });

    it("ignores choices when there is nothing to choose", () => {
        const model = new ShakespeareModel();
        expect(model.choose(0)).toBe(false);
        finishPrologue(model);
        model.advance();
        expect(model.choose(5)).toBe(false);
        expect(model.getScreen()).toEqual({ type: "choice", round: 0 });
    });

    it("records whether each choice was successful", () => {
        const model = new ShakespeareModel();
        finishPrologue(model);
        for (const pick of [0, 0, 1]) {
            model.advance();                        // context -> choice
            expect(model.choose(pick)).toBe(true);
            model.advance();                        // result -> next context (or farewell)
        }
        // Round 1: Murder Mystery (no), round 2: Ancient Rome (yes), round 3: Sea voyage (no)
        expect(model.getSuccesses()).toEqual([false, true, false]);
        expect(model.getPicks()).toEqual([0, 0, 1]);
    });

    it("goes to the farewell after round 3, then finishes", () => {
        const model = new ShakespeareModel();
        finishPrologue(model);
        for (let round = 0; round < storyRounds.length; round++) {
            model.advance();
            model.choose(1);
            expect(model.getScreen()).toEqual({ type: "result", round });
            model.advance();
        }
        expect(model.getScreen()).toEqual({ type: "farewell" });
        model.advance();
        expect(model.getScreen()).toEqual({ type: "done" });
    });

    it("clears choices and goes back to the start on restart", () => {
        const model = new ShakespeareModel();
        finishPrologue(model);
        model.advance();
        model.choose(1);
        model.restart();
        expect(model.getScreen()).toEqual({ type: "prologue", index: 0 });
        expect(model.getSuccesses()).toEqual([undefined, undefined, undefined]);
    });
});
