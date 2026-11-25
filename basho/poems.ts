// One line of a haiku: how many syllables it needs, the correct line, and every choice shown to the player
export interface BashoLine {
    syllables: number;
    correct: string;
    options: string[];
}

// One haiku the player has to complete, line by line
export interface BashoPoem {
    title: string;
    season: string;
    lines: BashoLine[];
}

// Text for the story cards shown around the haiku rounds
export interface BashoScreen {
    kicker: string;
    title: string;
    body: string;
    extra?: string; // Optional text under the body, used for Basho's finished haiku
    buttonLabel: string;
    hint: string;
    showSyllables?: boolean; // Draw the 5-7-5 strip on this card (the briefing)
    somber?: boolean;        // Dark seal instead of red (the lose card)
}

export type BashoScreenID = "briefing" | "won" | "lost" | "farewell";

export const bashoPoems: BashoPoem[] = [
    {
        title: "Moonlit River",
        season: "Autumn",
        lines: [
            {
                syllables: 5,
                correct: "Autumn moon rises",
                options: ["Autumn moon rises", "The moon rises slowly", "Crickets call at dusk"],
            },
            {
                syllables: 7,
                correct: "Over the sleeping river",
                options: ["Across the quiet stream", "Over the sleeping river", "Above the dark mountain"],
            },
            {
                syllables: 5,
                correct: "Gold trembles below",
                options: ["Golden light is trembling", "Gold trembles below", "A bright reflection"],
            },
        ],
    },
    {
        title: "Merchant's Garden",
        season: "Spring",
        lines: [
            {
                syllables: 5,
                correct: "Plum petals drift down",
                options: ["Plum petals drift down", "Flowers fall from the tree", "A warm breeze wanders"],
            },
            {
                syllables: 7,
                correct: "Through the merchant's garden gate",
                options: ["Past the old garden wall", "Through the merchant's garden gate", "Into a courtyard"],
            },
            {
                syllables: 5,
                correct: "Spring enters softly",
                options: ["Spring enters softly", "The new spring has arrived", "Softly comes the spring"],
            },
        ],
    },
    {
        title: "Road to Edo",
        season: "Dawn",
        lines: [
            {
                syllables: 5,
                correct: "Distant temple bell",
                options: ["A distant temple bell", "Distant temple bell", "Bronze bell in the mist"],
            },
            {
                syllables: 7,
                correct: "Echoes over cedar hills",
                options: ["Echoes over cedar hills", "Echoing through the forest", "It rings across the hills"],
            },
            {
                syllables: 5,
                correct: "Dawn warms the old road",
                options: ["Dawn warms the old road", "Morning warms the pathway", "The road welcomes dawn"],
            },
        ],
    },
];

// Story cards: the briefing before the rounds, the win and lose cards after them, and Basho's farewell
export const BashoScreens: Record<BashoScreenID, BashoScreen> = {
    briefing: {
        kicker: "A literary trial",
        title: "Help Basho find his patron",
        body: "Genroku Japan is alive with art and ambition. Compose three haiku in the sacred 5–7–5 form before time slips away, and help Matsuo Basho earn the support of a merchant patron.",
        buttonLabel: "Begin the journey",
        hint: "Three lives · Nine lines · Time quickens each round",
        showSyllables: true,
    },
    won: {
        kicker: "A heart moved by verse",
        title: "The road opens before you",
        body: "Your verses have touched the merchant's heart. With his patronage secured, Basho can now travel the roads of Japan and turn each passing season into poetry.",
        extra: "An old silent pond\nA frog jumps into the pond—\nSplash! Silence again.\n— Matsuo Basho",
        buttonLabel: "Continue down the road",
        hint: "A final word from Basho awaits",
    },
    lost: {
        kicker: "A grave offense",
        title: "Exiled for crimes against the arts",
        body: "Three broken verses have exhausted the merchant's patience. You are sent to a faraway island, where only the gulls remain to hear your unfinished poems.",
        buttonLabel: "Walk the path again",
        somber: true,
        hint: "Three lives · Nine lines · Time quickens each round",
    },
    farewell: {
        kicker: "At the parting road",
        title: "Until our paths cross again",
        body: "“You have learned to hear the world between words. Carry that quiet attention with you, traveler.”",
        extra: "— Matsuo Basho",
        buttonLabel: "Bid Basho farewell",
        hint: "",
    },
};
