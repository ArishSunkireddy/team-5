import { menuUrl } from "./destinations";

export const ALL_AUTHORS = ["shakespeare", "poe", "basho"] as const;
export type Author = (typeof ALL_AUTHORS)[number];
const KEY = "authorsMet";

export function getMet(): Author[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

export function allMet(): boolean {
  return getMet().length === ALL_AUTHORS.length;
}

export function resetProgress(): void {
  localStorage.removeItem(KEY);
}

// MENU SIDE: call once on load. Records the author who just finished.
export function absorbFinished(): Author | null {
  const author = new URLSearchParams(location.search).get("finished") as Author | null;
  if (!author || !ALL_AUTHORS.includes(author)) return null;

  const met = getMet();
  if (!met.includes(author)) met.push(author);
  localStorage.setItem(KEY, JSON.stringify(met));

  // Strip ?finished so a refresh doesn't re-trigger the end screen (keeps #play)
  history.replaceState(null, "", location.pathname + location.hash);
  return author;
}

// AUTHOR SIDE: call when that author's whole experience is done
export function finishAuthor(author: Author): void {
  window.location.href = `${menuUrl}?finished=${author}#play`;
}
