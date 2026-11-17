
import { destinations } from "./destinations";
 
export type Screen = "main" | "play" | "journal";
 
export interface MenuItem {
  label: string;
  screen?: Screen; // switch to another menu screen
  href?: string;   // or leave the menu for another page
}
 
export class MenuModel {
  screen: Screen = "main";
 
  readonly items: Record<Screen, MenuItem[]> = {
    main: [
      { label: "Play", screen: "play" },
      { label: "Minigames", href: destinations.iambic },
      { label: "Journal", screen: "journal" },
    ],
    play: [
      { label: "Matsuo Bashō", href: destinations.basho },
      { label: "Edgar Allan Poe", href: destinations.poe },
      { label: "Shakespeare", href: destinations.shakespeare },
      { label: "Back", screen: "main" },
    ],
    journal: [{ label: "Back", screen: "main" }], // blank page for now
  };
 
  readonly titles: Record<Screen, string> = {
    main: "Main Menu",
    play: "Choose Your Story",
    journal: "Journal",
  };
}