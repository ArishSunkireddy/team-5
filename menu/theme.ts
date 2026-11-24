// Shared look for every Konva screen (menu, Basho, Poe, Shakespeare, trivia).
// Change a value here and every view that reads it updates.
//


const colors = {
  background: "#1c1611",   // Dark walnut
  panel: "#2b221b",        // Leather: worksheet, journal, cards
  border: "#4a3b2e",

  text: "#f5ecd7",         // Parchment white
  body: "#e6d9bd",         // Aged paper
  muted: "#b8a888",
  dim: "#8f806a",
  faint: "#6e604c",        // Blank worksheet lines

  accent: "#8c2f2b",       // Oxblood, like a wax seal or leather binding
  accentHover: "#a33b36",
  highlight: "#d9ae5a",    // Gilt gold for eras and speaker names

  correct: "#3f6b33",      // Library green
  correctText: "#9ccf7f",
  wrong: "#9b2c2c",
  wrongText: "#ec8f80",
} as const;

// Custom fonts live in /fonts at the repo root: fonts/fonts.css registers them and
// menu/fonts.ts waits for every style listed here to load before anything is drawn.
// Add a line here for each @font-face you add to fonts.css.
export const customFonts = [
  '16px "Helvetica Punk"',
  '16px "Roman Antique"',
  'italic 16px "Roman Antique"',
] as const;

// The names after the first are fallbacks for characters the custom font doesn't have
// (neither font has "·", so it is borrowed from the fallback).
const fonts = {
  heading: "Helvetica Punk, Arial, sans-serif", // Titles and the journal author name
  body: "Roman Antique, Georgia, serif",         // Everything else
} as const;

// Makes every piece of text (menu and games) bigger or smaller at once. 1 = original size, 1.25 = 25% bigger.
const textScale = 1.25;
const size = (px: number): number => Math.round(px * textScale);

export const theme = {
  colors,
  fonts,
  textScale,
  size, // theme.size(18) -> 18px scaled by textScale

  // Ready-made text styles. Spread one into a Konva.Text: { text, ...theme.text.body }
  text: {
    title: { fontFamily: fonts.heading, fontSize: size(32), fill: colors.text },
    heading: { fontFamily: fonts.heading, fontSize: size(26), fill: colors.text },
    body: { fontFamily: fonts.body, fontSize: size(18), lineHeight: 1.5, fill: colors.body },
    label: { fontFamily: fonts.body, fontSize: size(15), fill: colors.muted },
    caption: { fontFamily: fonts.body, fontSize: size(13), letterSpacing: 2, fill: colors.muted },
    button: { fontFamily: fonts.body, fontSize: size(18), fill: colors.text, align: "center", verticalAlign: "middle" },
  },

  button: {
    size: { width: 260, height: 52 },
    spacing: 72,             // Distance from the top of one button to the next
  },

  // Squarer corners read as paper and bookbinding rather than app buttons
  radius: {
    button: 4,
    panel: 6,
    round: 24,               // Arrow buttons in the journal
  },

  // Space from the window edge to the content
  margin: 60,
} as const;

export type Theme = typeof theme;
