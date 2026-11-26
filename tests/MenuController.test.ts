import { afterEach, describe, expect, it, vi } from "vitest";
import { MenuController } from "../menu/MenuController";
import { MenuModel, type JournalPage, type MenuItem, type WorksheetRow } from "../menu/MenuModel";
import type { JournalHandlers, MenuView } from "../menu/MenuView";
import { destinations } from "../menu/destinations";
import { timeTravelIntroCards } from "../intro/introCards";

// The real view needs Konva and a canvas, so the controller is tested with a fake one
vi.mock("../../menu/MenuView", () => ({ MenuView: class {} }));

type OnSelect = (item: MenuItem) => void;
type RenderArgs = [string, MenuItem[], OnSelect, WorksheetRow[] | undefined];
type JournalArgs = [string, JournalPage, JournalHandlers];

let renderEnd: ReturnType<typeof vi.fn>;
let fakeLocation: { search: string; hash: string; pathname: string; href: string };
let replaceState: ReturnType<typeof vi.fn>;
let render: ReturnType<typeof vi.fn>;
let renderJournal: ReturnType<typeof vi.fn>;
let renderCards: ReturnType<typeof vi.fn>;

// Builds a controller with a fake view and fake browser globals, then starts it.
// `met` is the list of finished authors already saved in localStorage.
// With introFinishesAtOnce, the fake intro "plays" instantly so author clicks navigate straight away.
function setup(
  hash: string = "",
  met: string[] = [],
  introFinishesAtOnce: boolean = true,
  search = "",
): void {
  renderEnd = vi.fn();
  fakeLocation = { search, hash, pathname: "/", href: "" };
  replaceState = vi.fn();
  render = vi.fn();
  renderJournal = vi.fn();
  renderCards = vi.fn((_cards: unknown, onDone: () => void) => {
    if (introFinishesAtOnce) {
      onDone();
    }
  });

  const store = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  });
  localStorage.setItem("authorsMet", JSON.stringify(met));
  vi.stubGlobal("location", fakeLocation);
  vi.stubGlobal("window", { location: fakeLocation });
  vi.stubGlobal("history", { replaceState });

  const controller = new MenuController(new MenuModel(), {
    render,
    renderJournal,
    renderCards,
    renderEnd,
  } as unknown as MenuView);
  controller.start();
}

// Arguments of the most recent view.renderJournal(...) call
function lastJournal(): JournalArgs {
  return renderJournal.mock.calls[renderJournal.mock.calls.length - 1] as JournalArgs;
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
  localStorage.clear();
});

describe("MenuController", () => {
  describe("start", () => {
    it("shows the main menu by default", () => {
      setup();
      const [title, items] = lastRender();
      expect(title).toBe("Out of Print");
      expect(items.map((item) => item.label)).toEqual(["Play", "Journal"]);
    });

    it("does not show the worksheet on the main menu", () => {
      setup("", ["poe"]);
      expect(lastRender()[3]).toBeUndefined();
    });

    it("shows a blank worksheet on the story picker when no author is finished", () => {
      setup("#play");
      const worksheet = lastRender()[3]!;
      expect(worksheet).toHaveLength(3);
      expect(worksheet.every((row) => row.text === undefined)).toBe(true);
    });

    it("fills in the worksheet for finished authors only", () => {
      setup("#play", ["shakespeare"]);
      const worksheet = lastRender()[3]!;
      expect(worksheet.filter((row) => row.text !== undefined).map((row) => row.author)).toEqual([
        "shakespeare",
      ]);
    });

    it("shows the worksheet when the story picker is opened from the main menu", () => {
      setup("", ["basho"]);
      click("Play");
      expect(lastRender()[3]!.find((row) => row.author === "basho")!.text).toBeDefined();
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
      expect(lastRender()[0]).toBe("Out of Print");
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
      expect(lastRender()[0]).toBe("Out of Print");
      expect(replaceState).toHaveBeenLastCalledWith(null, "", "/");
    });

    it("opens the journal on a locked first page when nothing is finished", () => {
      setup();
      click("Journal");
      expect(renderJournal).toHaveBeenCalledTimes(1);
      const [title, page] = lastJournal();
      expect(title).toBe("Journal");
      expect(page).toMatchObject({
        pageNumber: 1,
        unlocked: false,
        facts: [],
        hasPrev: false,
        hasNext: true,
      });
    });

    it("opens the journal on the first finished author's notes", () => {
      setup("", ["shakespeare"]);
      click("Journal");
      const [, page] = lastJournal();
      expect(page.author).toBe("shakespeare");
      expect(page.unlocked).toBe(true);
      expect(page.facts.length).toBeGreaterThan(0);
    });

    it("turns journal pages with the arrows and stops at the ends", () => {
      setup("", ["basho"]);
      click("Journal");
      expect(lastJournal()[1].author).toBe("basho");

      lastJournal()[2].onPrev(); // already on the first page
      expect(renderJournal).toHaveBeenCalledTimes(1);

      lastJournal()[2].onNext();
      expect(lastJournal()[1]).toMatchObject({ author: "poe", unlocked: false });
      lastJournal()[2].onNext();
      expect(lastJournal()[1]).toMatchObject({ author: "shakespeare", hasNext: false });
      lastJournal()[2].onNext(); // already on the last page
      expect(renderJournal).toHaveBeenCalledTimes(3);
    });

    it("returns from the journal to the main menu", () => {
      setup();
      click("Journal");
      lastJournal()[2].onBack();
      expect(lastRender()[0]).toBe("Out of Print");
      expect(replaceState).toHaveBeenLastCalledWith(null, "", "/");
    });
  });

  describe("leaving the menu for a game", () => {
    it("sends Minigames to the iambic pentameter game", () => {
      setup();
      click("Play");
      click("Minigames");
      expect(fakeLocation.href).toBe(destinations.iambic);
    });

    it.each([
      ["Matsuo Basho", destinations.basho],
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
      lastJournal()[2].onNext();
      lastJournal()[2].onBack();
      expect(fakeLocation.href).toBe("");
    });

    it("plays the intro before the first author and navigates only when it finishes", () => {
      setup("", [], false); // intro stays open until we finish it
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
      click("Matsuo Basho");
      click("Edgar Allan Poe");
      expect(renderCards).toHaveBeenCalledTimes(1);
      expect(fakeLocation.href).toBe(destinations.poe);
    });

    it("never plays the intro for Minigames, and doesn't use it up", () => {
      setup();
      click("Play");
      click("Minigames");
      expect(renderCards).not.toHaveBeenCalled();
      expect(fakeLocation.href).toBe(destinations.iambic);

      click("Shakespeare");
      expect(renderCards).toHaveBeenCalledTimes(1);
    });
  });
});

describe("completed worksheet", () => {
  it("launches Poetry Builder with worksheet origin and preserves completion on return", () => {
    setup("#play", ["basho", "poe"], true, "?finished=shakespeare");
    const completed = localStorage.getItem("authorsMet");
    renderEnd.mock.lastCall![1]();
    expect(fakeLocation.href).toBe(destinations.iambic + "?from=worksheet");
    setup("#worksheet", JSON.parse(completed!));
    expect(renderEnd).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("authorsMet")).toBe(completed);
  });

  it("can finish the worksheet without launching poetry", () => {
    setup("#play", ["basho", "poe"], true, "?finished=shakespeare");
    renderEnd.mock.lastCall![0]();
    expect(fakeLocation.href).toBe("");
    expect(lastRender()[0]).toBe("Out of Print");
    expect(localStorage.getItem("authorsMet")).toBeNull();
  });

  it("requires completed author progress to reopen the worksheet", () => {
    setup("#worksheet");
    expect(renderEnd).not.toHaveBeenCalled();
    expect(lastRender()[0]).toBe("Out of Print");
  });
});
