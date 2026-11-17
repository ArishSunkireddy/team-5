import { describe, expect, it } from "vitest";
import { MenuModel, type MenuItem, type Screen } from "../menu/MenuModel";
import { destinations } from "../menu/destinations";

const screens: Screen[] = ["main", "play", "journal"];
const labels = (items: MenuItem[]) => items.map((item) => item.label);

describe("MenuModel", () => {
    it("starts on the main screen", () => {
        expect(new MenuModel().screen).toBe("main");
    });

    describe("main screen", () => {
        const model = new MenuModel();

        it("offers Play, Minigames, and Journal in that order", () => {
            expect(labels(model.items.main)).toEqual(["Play", "Minigames", "Journal"]);
        });

        it("sends Play to the play screen", () => {
            expect(model.items.main[0].screen).toBe("play");
        });

        it("sends Minigames to the iambic pentameter game", () => {
            expect(model.items.main[1].href).toBe(destinations.iambic);
        });

        it("sends Journal to the journal screen", () => {
            expect(model.items.main[2].screen).toBe("journal");
        });
    });

    describe("play screen", () => {
        const model = new MenuModel();

        it("offers Bashō, Poe, Shakespeare, then Back", () => {
            expect(labels(model.items.play)).toEqual([
                "Matsuo Bashō",
                "Edgar Allan Poe",
                "Shakespeare",
                "Back",
            ]);
        });

        it("links each story to its own game", () => {
            const [basho, poe, shakespeare] = model.items.play;
            expect(basho.href).toBe(destinations.basho);
            expect(poe.href).toBe(destinations.poe);
            expect(shakespeare.href).toBe(destinations.shakespeare);
        });
    });

    describe("journal screen", () => {
        it("only has a Back button for now", () => {
            const model = new MenuModel();
            expect(labels(model.items.journal)).toEqual(["Back"]);
        });
    });

    describe("structure of every screen", () => {
        const model = new MenuModel();

        it("has a non-empty title for each screen", () => {
            for (const screen of screens) {
                expect(model.titles[screen].trim()).not.toBe("");
            }
        });

        it("gives every item either a screen or a link, never both and never neither", () => {
            for (const screen of screens) {
                for (const item of model.items[screen]) {
                    const targets = [item.screen, item.href].filter((t) => t !== undefined);
                    expect(targets, `${screen} / ${item.label}`).toHaveLength(1);
                }
            }
        });

        it("makes every Back button return to the main screen", () => {
            for (const screen of screens) {
                for (const item of model.items[screen].filter((i) => i.label === "Back")) {
                    expect(item.screen, `${screen} / Back`).toBe("main");
                }
            }
        });

        it("only points screen items at screens that exist", () => {
            for (const screen of screens) {
                for (const item of model.items[screen]) {
                    if (item.screen) {
                        expect(screens).toContain(item.screen);
                    }
                }
            }
        });
    });

    describe("destinations", () => {
        it("gives every game a different, non-empty URL", () => {
            const urls = Object.values(destinations);
            expect(urls.every((url) => url.length > 0)).toBe(true);
            expect(new Set(urls).size).toBe(urls.length);
        });
    });
});
