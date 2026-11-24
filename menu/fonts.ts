import "../fonts/fonts.css";
import { customFonts } from "./theme";

// Konva draws text straight away and never redraws when a font arrives later,
// so call this (and wait for it) before creating any view.
export async function loadFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) {
    return;
  }
  // If a font fails to load, the fallback font is used instead of never starting the game
  await Promise.allSettled(customFonts.map((font) => document.fonts.load(font)));
}
