import { destinations } from "./destinations";
import { authorNotes, journalOrder } from "./journal";
import type { Author } from "./progress";

export type Screen = "main" | "play" | "journal";

export interface MenuItem {
  label: string;
  screen?: Screen; // switch to another menu screen
  href?: string;   // or leave the menu for another page
}

// One row of the worksheet on the story picker. Era and text stay blank until the author is finished
export interface WorksheetRow {
  author: Author;
  name: string;
  era?: string;
  text?: string;
}

// One page of the journal. Locked pages carry no facts, so nothing can leak onto the screen
export interface JournalPage {
  author: Author;
  name: string;
  era: string;
  unlocked: boolean;
  facts: string[];
  pageNumber: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export class MenuModel {
  screen: Screen = "main";
  journalIndex = 0;

  readonly items: Record<Screen, MenuItem[]> = {
    main: [
      { label: "Play", screen: "play" },
      { label: "Journal", screen: "journal" },
    ],
    play: [
      { label: "Matsuo Basho", href: destinations.basho },
      { label: "Edgar Allan Poe", href: destinations.poe },
      { label: "Shakespeare", href: destinations.shakespeare },
      { label: "Minigames", href: destinations.iambic },
      { label: "Back", screen: "main" },
    ],
    journal: [{ label: "Back", screen: "main" }], // pages are drawn by the journal view
  };

  readonly titles: Record<Screen, string> = {
    main: "Out of Print",
    play: "Choose Your Story",
    journal: "Journal",
  };

  // Worksheet on the story picker: every author listed, filled in only once they are finished
  worksheet(met: readonly Author[]): WorksheetRow[] {
    return journalOrder.map((author) => {
      const notes = authorNotes[author];
      return met.includes(author)
        ? { author, name: notes.name, era: notes.era, text: notes.summary }
        : { author, name: notes.name };
    });
  }

  // Opening the journal lands on the first unlocked page (or the first page if none are)
  openJournal(met: readonly Author[]): void {
    const first = journalOrder.findIndex((author) => met.includes(author));
    this.journalIndex = first === -1 ? 0 : first;
  }

  // Moves one page left (-1) or right (+1). Returns false at either end
  turnJournalPage(step: -1 | 1): boolean {
    const next = this.journalIndex + step;
    if (next < 0 || next >= journalOrder.length) {
      return false;
    }
    this.journalIndex = next;
    return true;
  }

  journalPage(met: readonly Author[]): JournalPage {
    const author = journalOrder[this.journalIndex];
    const notes = authorNotes[author];
    const unlocked = met.includes(author);
    return {
      author,
      name: notes.name,
      era: notes.era,
      unlocked,
      facts: unlocked ? [...notes.facts] : [],
      pageNumber: this.journalIndex + 1,
      totalPages: journalOrder.length,
      hasPrev: this.journalIndex > 0,
      hasNext: this.journalIndex < journalOrder.length - 1,
    };
  }
}
