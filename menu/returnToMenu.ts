import { menuUrl } from "./destinations";

// No game state or timer mutations: Cancel leaves the running game alone.
export function returnToMenu(): void {
  if (window.confirm(
    "Return to the main menu? Your current game progress, including answers and scores, will be lost. Selecting an author starts a new game.",
  )) {
    window.location.assign(menuUrl);
  }
}
