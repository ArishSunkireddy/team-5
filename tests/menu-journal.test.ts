import { describe, expect, it } from "vitest";
import { MenuModel } from "../menu/MenuModel";
import { authorNotes, journalOrder } from "../menu/journal";
import { ALL_AUTHORS, type Author } from "../menu/progress";

describe("journal notes data", () => {
  it("has one journal page per author, with no duplicates", () => {
    expect([...journalOrder].sort()).toEqual([...ALL_AUTHORS].sort());
  });

  it("gives every author a name, era, worksheet paragraph, and facts", () => {
    for (const author of ALL_AUTHORS) {
      const notes = authorNotes[author];
      expect(notes.name.trim(), `${author} name`).not.toBe("");
      expect(notes.era.trim(), `${author} era`).not.toBe("");
      expect(notes.summary.trim(), `${author} summary`).not.toBe("");
      expect(notes.facts.length, `${author} facts`).toBeGreaterThan(0);
      for (const fact of notes.facts) {
        expect(fact, `${author}: padded fact`).toBe(fact.trim());
        expect(fact, `${author}: empty fact`).not.toBe("");
      }
    }
  });

  it("keeps the worksheet paragraph short (it shares the main menu with the buttons)", () => {
    for (const author of ALL_AUTHORS) {
      expect(authorNotes[author].summary.length, `${author} summary is too long`).toBeLessThanOrEqual(220);
    }
  });
});

describe("MenuModel worksheet", () => {
  it("lists every author, blank, before anyone is finished", () => {
    const rows = new MenuModel().worksheet([]);
    expect(rows.map((row) => row.author)).toEqual([...journalOrder]);
    for (const row of rows) {
      expect(row.era).toBeUndefined();
      expect(row.text).toBeUndefined();
    }
  });

  it("fills in only the finished authors", () => {
    const rows = new MenuModel().worksheet(["poe"]);
    const poe = rows.find((row) => row.author === "poe")!;
    expect(poe.text).toBe(authorNotes.poe.summary);
    expect(poe.era).toBe(authorNotes.poe.era);
    expect(rows.filter((row) => row.text !== undefined)).toHaveLength(1);
  });

  it("fills in every row once all authors are finished", () => {
    const rows = new MenuModel().worksheet(ALL_AUTHORS);
    expect(rows.every((row) => row.text !== undefined)).toBe(true);
  });
});

describe("MenuModel journal", () => {
  it("hides the facts on a locked page", () => {
    const page = new MenuModel().journalPage([]);
    expect(page.unlocked).toBe(false);
    expect(page.facts).toEqual([]);
  });

  it("shows every fact on an unlocked page", () => {
    const model = new MenuModel();
    model.openJournal(["shakespeare"]);
    const page = model.journalPage(["shakespeare"]);
    expect(page.author).toBe("shakespeare");
    expect(page.unlocked).toBe(true);
    expect(page.facts).toEqual(authorNotes.shakespeare.facts);
  });

  it("does not let the view change the stored facts", () => {
    const model = new MenuModel();
    model.openJournal(["basho"]);
    model.journalPage(["basho"]).facts.push("extra");
    expect(model.journalPage(["basho"]).facts).toEqual(authorNotes.basho.facts);
  });

  it("opens on the first finished author in page order, or page 1 if none", () => {
    const model = new MenuModel();
    model.openJournal(["shakespeare", "poe"]);
    expect(model.journalPage(["shakespeare", "poe"]).author).toBe(journalOrder.find((a) => a === "poe" || a === "shakespeare"));
    model.openJournal([]);
    expect(model.journalPage([]).pageNumber).toBe(1);
  });

  it("turns pages one at a time and stops at both ends", () => {
    const model = new MenuModel();
    const met: Author[] = [];
    expect(model.turnJournalPage(-1)).toBe(false);
    expect(model.journalPage(met)).toMatchObject({ pageNumber: 1, hasPrev: false, hasNext: true });

    for (let page = 2; page <= journalOrder.length; page++) {
      expect(model.turnJournalPage(1)).toBe(true);
      expect(model.journalPage(met).pageNumber).toBe(page);
    }
    expect(model.journalPage(met)).toMatchObject({ hasPrev: true, hasNext: false, totalPages: journalOrder.length });
    expect(model.turnJournalPage(1)).toBe(false);
    expect(model.journalPage(met).pageNumber).toBe(journalOrder.length);
  });

  it("ignores unknown names in the saved progress", () => {
    const met = ["dickens"] as unknown as Author[];
    const model = new MenuModel();
    model.openJournal(met);
    expect(model.journalPage(met).unlocked).toBe(false);
    expect(model.worksheet(met).every((row) => row.text === undefined)).toBe(true);
  });
});
