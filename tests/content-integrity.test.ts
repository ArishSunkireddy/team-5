import { describe, expect, it } from "vitest";
import { poeRounds } from "../poe/rounds";
import * as bashoData from "../basho/poems";
import * as triviaData from "../trivia/questions";

// Content checks for the game data players actually see. Other test files cover each game's
// own rules (5-7-5 haiku, 20 trivia questions, anagram validity); these fill the gaps:
// Poe's text fields and text hygiene across every game.
const letters = (text: string) => text.toLowerCase().replace(/[^a-z]/g, "");

describe("Poe rounds", () => {
  it("has non-empty text in every field", () => {
    for (const round of poeRounds) {
      for (const [field, value] of Object.entries(round)) {
        expect(String(value).trim(), `${round.answer}: ${field} is empty`).not.toBe("");
      }
    }
  });

  it("shows an answer title that matches the accepted answer", () => {
    for (const round of poeRounds) {
      expect(letters(round.displayAnswer), `${round.displayAnswer} vs ${round.answer}`).toBe(letters(round.answer));
    }
  });

  it("never starts a round already solved", () => {
    for (const round of poeRounds) {
      expect(letters(round.scramble), `${round.answer} is not scrambled`).not.toBe(letters(round.answer));
    }
  });
});

describe("text hygiene across all game data", () => {
  const modules = {
    "poe/rounds": { poeRounds },
    "basho/poems": bashoData,
    "trivia/questions": triviaData,
  };

  // Walk every exported structure and flag strings players would see as broken.
  const problems: string[] = [];
  const walk = (value: unknown, path: string) => {
    if (typeof value === "string") {
      // Empty strings are allowed here: some optional fields (e.g. a card with no hint) are blank on purpose.
      if (value !== value.trim()) problems.push(`${path}: leading/trailing whitespace "${value}"`);
      else if (/ {2,}/.test(value)) problems.push(`${path}: double space "${value}"`);
      else if (/\b(undefined|null|NaN)\b|\[object|TODO|FIXME|lorem ipsum/i.test(value)) problems.push(`${path}: placeholder text "${value}"`);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
    } else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`);
    }
  };
  for (const [name, exports] of Object.entries(modules)) walk(exports, name);

  it("has no padded, double-spaced or placeholder strings", () => {
    expect(problems, problems.join("\n")).toEqual([]);
  });
});
