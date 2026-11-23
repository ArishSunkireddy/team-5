// All of Shakespeare's story text. Word for word from the original React version.

// One full-screen card: the prologue cards and the farewell
export interface StoryCard {
    label: string;
    title: string;
    text: string;
    buttonLabel: string;
    speaker?: string;      // Name shown above the title when someone is talking
    dialogue?: string;     // Line spoken under the title
    extra?: string;        // Small line under the text
    figure?: boolean;      // Draw Shakespeare next to the card
}

// The card shown after the player picks a story
export interface StoryResult {
    label: string;
    title: string;
    text: string;
    crowd: string;         // The audience, drawn as filled and empty seats
}

export interface StoryChoice {
    title: string;
    successful: boolean;   // True for the historically successful choice
    result: StoryResult;
}

export interface StoryRound {
    year: number;
    contextTitle: string;
    contextText: string;
    speaker: string;
    question: string;
    dialogue: string;
    choices: StoryChoice[];
}

// Shakespeare only: meeting him, and the title
export const prologueCards: StoryCard[] = [
    {
        label: "LONDON · THE 16TH CENTURY",
        title: "“Art thou… God?”",
        text: "You land in a cramped room smelling of candle wax and ink. A man at a writing desk scratches his head over two unfinished play ideas. When he sees you, his eyes brighten.",
        speaker: "WILLIAM SHAKESPEARE",
        dialogue: "“You appeared in a flash of light just as I begged the heavens for help.”",
        figure: true,
        buttonLabel: "“No. I’m a student.”",
    },
    {
        label: "A JOURNEY THROUGH SHAKESPEARE’S WORLD",
        title: "The Playwright’s\nGambit",
        text: "Guide William Shakespeare through three turning points in history. Choose the stories he will tell, then bring what you learn back home.",
        extra: "1588 — 1603",
        buttonLabel: "Begin the story",
    },
];

// The three rounds, each with two choices. One choice per round is the historically successful one.
export const storyRounds: StoryRound[] = [
    {
        year: 1588,
        contextTitle: "It is the year 1588",
        contextText: "England is at war with Spain. The Spanish Armada is approaching, and the country waits anxiously.",
        speaker: "WILLIAM SHAKESPEARE",
        question: "“What story shall I tell?”",
        dialogue: "Good patron, I need your counsel. Help me choose the theme for my next play.",
        choices: [
            {
                title: "Murder Mystery",
                successful: false,
                result: {
                    label: "OPENING NIGHT",
                    title: "An empty house.",
                    text: "Only a few seats are filled. After the Spanish Armada was defeated, English nationalism surged—and audiences chose a rival's patriotic play instead.",
                    crowd: "○ ○ ● ○ ○ ○ ○ ○ ○ ● ○ ○",
                },
            },
            {
                title: "English Nationalism",
                successful: true,
                result: {
                    label: "OPENING NIGHT",
                    title: "A roaring success.",
                    text: "The theatre is full. Shakespeare cheers as the crowd applauds his celebration of England.",
                    crowd: "● ● ● ● ● ● ● ● ● ● ● ●",
                },
            },
        ],
    },
    {
        year: 1599,
        contextTitle: "It is the year 1599",
        contextText: "Shakespeare’s company has opened the Globe. Londoners crowd its yard, hungry for politics, comedy, danger, and escape.",
        speaker: "WILLIAM SHAKESPEARE",
        question: "“Where shall my players take us?”",
        dialogue: "The new Globe awaits a story. Shall we look to the politics of the past or escape into a world of magic?",
        choices: [
            {
                title: "A Tragedy in Ancient Rome",
                successful: true,
                result: {
                    label: "THE GLOBE, 1599",
                    title: "Rome fills the Globe.",
                    text: "Citizens, senators, and betrayal grip the new theatre. The audience recognizes its own uneasy politics in ancient Rome.",
                    crowd: "● ● ● ● ● ● ● ● ● ● ● ●",
                },
            },
            {
                title: "A Comedy in an Enchanted Forest",
                successful: false,
                result: {
                    label: "THE GLOBE, 1599",
                    title: "The forest enchants.",
                    text: "Fairies and mistaken lovers delight the crowd. The playful story gives Londoners an escape from the crowded city.",
                    crowd: "● ● ● ● ● ● ● ● ● ● ○ ●",
                },
            },
        ],
    },
    {
        year: 1603,
        contextTitle: "It is the year 1603",
        contextText: "James VI of Scotland has become James I of England. Shakespeare’s company is now called the King’s Men and performs for the royal court.",
        speaker: "WILLIAM SHAKESPEARE",
        question: "“What tale will please the new king?”",
        dialogue: "Our company now serves King James. Which story should we perform for this changed court?",
        choices: [
            {
                title: "A Scottish Tragedy",
                successful: true,
                result: {
                    label: "THE KING'S MEN, 1603",
                    title: "A royal choice.",
                    text: "A dark Scottish tragedy captures the new king's attention with prophecy, kingship, and dangerous ambition.",
                    crowd: "● ● ● ● ● ● ● ● ● ● ● ●",
                },
            },
            {
                title: "A Great Voyage at Sea",
                successful: false,
                result: {
                    label: "THE KING'S MEN, 1603",
                    title: "A tale for another tide.",
                    text: "The sea adventure entertains, but the court is more eager for stories that reflect its new Scottish monarch.",
                    crowd: "● ○ ● ● ○ ● ● ○ ● ○ ● ○",
                },
            },
        ],
    },
];

// After the last round, before the trivia
export const farewellCard: StoryCard = {
    label: "WILLIAM SHAKESPEARE",
    title: "“Farewell, good patron!”",
    text: "You have shaped my story. Now the currents of time call you home.",
    figure: true,
    buttonLabel: "Enter the wormhole",
};
