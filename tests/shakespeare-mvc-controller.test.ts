import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShakespeareController } from "../shakespeare-mvc/ShakespeareController";
import { ShakespeareView } from "../shakespeare-mvc/ShakespeareView";
import { prologueCards, storyRounds, farewellCard } from "../shakespeare-mvc/story";

vi.mock("../shakespeare-mvc/ShakespeareView", () => {
    return {
        ShakespeareView: vi.fn().mockImplementation(function () {
            return {
                showCard: vi.fn(),
                showChoice: vi.fn(),
                showResult: vi.fn(),
                destroy: vi.fn(),
            };
        }),
    }
});

describe("ShakespeareController", () => {
    let onComplete: ReturnType<typeof vi.fn<() => void>>;
    let controller: ShakespeareController;
    let view: {
        showCard: ReturnType<typeof vi.fn>;
        showChoice: ReturnType<typeof vi.fn>;
        showResult: ReturnType<typeof vi.fn>;
        destroy: ReturnType<typeof vi.fn>;
    };

    // The button callback of the most recent screen of each kind
    const lastCardAction = () => view.showCard.mock.lastCall![1] as () => void;
    const lastChoose = () => view.showChoice.mock.lastCall![1] as (idx: number) => void;
    const lastResultAction = () => view.showResult.mock.lastCall![2] as () => void;

    // Clicks through the prologue so the first context card is showing
    const finishPrologue = () => {
        for (let idx = 0; idx < prologueCards.length; idx++) {
            lastCardAction()();
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        onComplete = vi.fn<() => void>();
        controller = new ShakespeareController(storyRounds, prologueCards, farewellCard, { onComplete }, "container");
        view = (ShakespeareView as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    });

    it("shows the first prologue card on start()", () => {
        controller.start();
        expect(view.showCard).toHaveBeenCalledTimes(1);
        expect(view.showCard.mock.lastCall![0]).toBe(prologueCards[0]);
    });

    it("moves through the prologue, then the context card of round 1", () => {
        controller.start();
        for (let idx = 1; idx < prologueCards.length; idx++) {
            lastCardAction()();
            expect(view.showCard.mock.lastCall![0]).toBe(prologueCards[idx]);
        }
        lastCardAction()();
        expect(view.showCard.mock.lastCall![0]).toMatchObject({ title: "It is the year 1588" });
    });

    it("shows the choices, then the result for the pick", () => {
        controller.start();
        finishPrologue();
        lastCardAction()();                                  // context -> choice
        expect(view.showChoice).toHaveBeenCalledWith(storyRounds[0], expect.any(Function));

        lastChoose()(1);                                     // English Nationalism
        expect(view.showResult).toHaveBeenCalledWith(storyRounds[0].choices[1].result, true, expect.any(Function));
    });

    it("tells the view when the pick was not the successful one", () => {
        controller.start();
        finishPrologue();
        lastCardAction()();
        lastChoose()(0);                                     // Murder Mystery
        expect(view.showResult).toHaveBeenCalledWith(storyRounds[0].choices[0].result, false, expect.any(Function));
    });

    it("draws the screens in the right order for a full playthrough", () => {
        const order: string[] = [];
        view.showCard.mockImplementation(() => order.push("card"));
        view.showChoice.mockImplementation(() => order.push("choice"));
        view.showResult.mockImplementation(() => order.push("result"));

        controller.start();
        finishPrologue();
        for (let round = 0; round < storyRounds.length; round++) {
            lastCardAction()();
            lastChoose()(0);
            lastResultAction()();
        }
        expect(order).toEqual([
            ...prologueCards.map(() => "card"),
            ...storyRounds.flatMap(() => ["card", "choice", "result"]),
            "card",                                          // farewell
        ]);
        expect(view.showCard.mock.lastCall![0]).toBe(farewellCard);
    });

    it("calls onComplete once, after the farewell, and cleans up the view first", () => {
        controller.start();
        finishPrologue();
        for (let round = 0; round < storyRounds.length; round++) {
            lastCardAction()();
            lastChoose()(1);
            lastResultAction()();
        }
        expect(onComplete).not.toHaveBeenCalled();

        const farewellAction = lastCardAction();
        farewellAction();
        farewellAction();                                    // a second click must not complete again
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(view.destroy).toHaveBeenCalledTimes(1);
    });

    it("destroy() cleans up the view", () => {
        controller.destroy();
        expect(view.destroy).toHaveBeenCalledTimes(1);
    });
});
