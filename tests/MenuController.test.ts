import { afterEach, describe, expect, it, vi } from "vitest";
import { MenuController } from "../menu/MenuController";
import { MenuModel, type MenuItem } from "../menu/MenuModel";
import type { MenuView } from "../menu/MenuView";
import { destinations } from "../menu/destinations";
import { timeTravelIntroCards } from "../intro/introCards";

// The real view needs Konva and a canvas, so the controller is tested with a fake one
vi.mock("../../menu/MenuView", () => ({ MenuView: class {} }));

type OnSelect = (item: MenuItem) => void;
type RenderArgs = [string, MenuItem[], OnSelect, string | undefined];

let fakeLocation: { hash: string; pathname: string; href: string };
let replaceState: ReturnType<typeof vi.fn>;
let render: ReturnType<typeof vi.fn>; 
let renderCards: ReturnType<typeof vi.fn>;

// Builds a controller with a fake view and fake browser globals, then starts it
function setup(hash: string = "", introFinishesAtOnce: boolean = true): void {
    fakeLocation = { hash, pathname: "/", href: "" };
    replaceState = vi.fn();
    render = vi.fn();

    renderCards = vi.fn((_cards: unknown, onDone: () => void) => {
        if (introFinishesAtOnce) onDone();
    });

    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { store.set(key, value); },
        removeItem: (key: string) => { store.delete(key); },
        clear: () => store.clear(),
    });
    vi.stubGlobal("location", fakeLocation);
    vi.stubGlobal("window", { location: fakeLocation });
    vi.stubGlobal("history", { replaceState });

    const controller = new MenuController(new MenuModel(), { render, renderCards } as unknown as MenuView);
    controller.start();
}

// Arguments of the most recent view.render(...) call
function lastRender(): RenderArgs {
    return render.mock.calls[render.mock.calls.length - 1] as RenderArgs;
}

// Simulates the player clicking the button with this label on the current screen
function click(label: string): void {
    const [, items, onSelect] = lastRender();
    const item = items.find((candidate) => candidate.label === label);
    if (!item) {
        throw new Error(`No "${label}" button on the current screen`);
    }
    onSelect(item);
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("MenuController", () => {
    describe("start", () => {
        it("shows the main menu by default", () => {
            setup();
            const [title, items, , placeholder] = lastRender();
            expect(title).toBe("Main Menu");
            expect(items.map((item) => item.label)).toEqual(["Play", "Minigames", "Journal"]);
            expect(placeholder).toBeUndefined();
        });

        it("renders exactly once on start", () => {
            setup();
            expect(render).toHaveBeenCalledTimes(1);
        });

        it("opens the story picker when the URL hash is #play", () => {
            setup("#play");
            const [title, items] = lastRender();
            expect(title).toBe("Choose Your Story");
            expect(items.map((item) => item.label)).toContain("Edgar Allan Poe");
        });

        it("falls back to the main menu for an unknown hash", () => {
            setup("#somethingelse");
            expect(lastRender()[0]).toBe("Main Menu");
        });
    });

    describe("moving between menu screens", () => {
        it("goes to the story picker when Play is clicked", () => {
            setup();
            click("Play");
            expect(render).toHaveBeenCalledTimes(2);
            expect(lastRender()[0]).toBe("Choose Your Story");
        });

        it("writes #play to the URL when the story picker opens", () => {
            setup();
            click("Play");
            expect(replaceState).toHaveBeenCalledWith(null, "", "#play");
        });

        it("goes back to the main menu from the story picker and clears the hash", () => {
            setup();
            click("Play");
            click("Back");
            expect(lastRender()[0]).toBe("Main Menu");
            expect(replaceState).toHaveBeenLastCalledWith(null, "", "/");
        });

        it("shows the journal with a Coming soon placeholder", () => {
            setup();
            click("Journal");
            const [title, items, , placeholder] = lastRender();
            expect(title).toBe("Journal");
            expect(placeholder).toBe("Coming soon");
            expect(items.map((item) => item.label)).toEqual(["Back"]);
        });

        it("returns from the journal to the main menu without the placeholder", () => {
            setup();
            click("Journal");
            click("Back");
            const [title, , , placeholder] = lastRender();
            expect(title).toBe("Main Menu");
            expect(placeholder).toBeUndefined();
        });
    });

    describe("leaving the menu for a game", () => {
        it("sends Minigames to the iambic pentameter game", () => {
            setup();
            click("Minigames");
            expect(fakeLocation.href).toBe(destinations.iambic);
        });

        it.each([
            ["Matsuo Bashō", destinations.basho],
            ["Edgar Allan Poe", destinations.poe],
            ["Shakespeare", destinations.shakespeare],
        ])("sends %s to its game", (label, url) => {
            setup();
            click("Play");
            click(label);
            expect(fakeLocation.href).toBe(url);
        });

        it("does not re-render or touch the URL hash when leaving for a game", () => {
            setup();
            click("Play");
            const rendersBefore = render.mock.calls.length;
            const replaceCallsBefore = replaceState.mock.calls.length;
            click("Shakespeare");
            expect(render.mock.calls.length).toBe(rendersBefore);
            expect(replaceState.mock.calls.length).toBe(replaceCallsBefore);
        });

        it("does not navigate anywhere while just moving between menu screens", () => {
            setup();
            click("Play");
            click("Back");
            click("Journal");
            expect(fakeLocation.href).toBe("");
        });
        it("plays the intro before the first author and navigates only when it finishes", () => {
   	    setup("", false); // intro stays open until we finish it
   	    click("Play");
    	    click("Shakespeare");
            expect(renderCards).toHaveBeenCalledTimes(1);
            expect(renderCards.mock.calls[0][0]).toBe(timeTravelIntroCards);
            expect(fakeLocation.href).toBe("");

            const onDone = renderCards.mock.calls[0][1] as () => void;
            onDone();
            expect(fakeLocation.href).toBe(destinations.shakespeare);
        });

        it("skips the intro for later authors", () => {
            setup();
            click("Play");
            click("Matsuo Bashō");
            click("Edgar Allan Poe");
            expect(renderCards).toHaveBeenCalledTimes(1);
            expect(fakeLocation.href).toBe(destinations.poe);
        });

        it("never plays the intro for Minigames, and doesn't use it up", () => {
            setup();
            click("Minigames");
            expect(renderCards).not.toHaveBeenCalled();
            expect(fakeLocation.href).toBe(destinations.iambic);

            click("Play");
            click("Shakespeare");
            expect(renderCards).toHaveBeenCalledTimes(1);
        });
     });
});
