// One anagram round: the scrambled title, the answer, and the text shown once the round is over
export interface PoeRound {
    scramble: string;
    answer: string;
    displayAnswer: string;
    eyebrow: string;
    explanation: string;
    blurb?: string;          // Vague teaser shown beside the puzzle. Must not give the title away
    image?: string;          // Optional picture for the frame beside the puzzle (a URL or imported file)
}

export const poeRounds: PoeRound[] = [
    {
        scramble: "HTE AVERN",
        answer: "the raven",
        displayAnswer: "The Raven",
        eyebrow: "A mournful visitor",
        explanation:
            "First published in 1845, this dark poem follows a grieving man visited by a mysterious raven. Its repeated cry of “Nevermore” draws him deeper into sorrow, memory, and madness.",
        blurb:
            "A grieving scholar sits alone past midnight, half asleep over forgotten books. A tapping at the chamber door brings a dark-winged visitor, and every question he asks it gets the same reply.",
    },
    {
        scramble: "ETH LELT–LAET HTERA",
        answer: "the tell tale heart",
        displayAnswer: "The Tell-Tale Heart",
        eyebrow: "A sound beneath the floor",
        explanation:
            "Poe’s 1843 story is told by an unreliable narrator who insists on his sanity after committing murder. Haunted by what sounds like a beating heart, his guilt becomes impossible to silence.",
        blurb:
            "A narrator swears he is perfectly sane, then calmly explains exactly how he did it. But something beneath the floorboards refuses to stay quiet.",
    },
    {
        scramble: "ETH KCALB TAC",
        answer: "the black cat",
        displayAnswer: "The Black Cat",
        eyebrow: "A shadow with nine lives",
        explanation:
            "In this unsettling tale, cruelty, superstition, and guilt overtake the narrator. A black cat becomes both a witness to his crimes and a symbol of the conscience he cannot escape.",
        blurb:
            "A man's temper darkens with drink, and a household pet becomes the one witness he cannot escape, no matter how many walls he builds.",
    },
    {
        scramble: "BANNAEL EEL",
        answer: "annabel lee",
        displayAnswer: "Annabel Lee",
        eyebrow: "A kingdom by the sea",
        explanation:
            "This lyrical poem remembers a love so powerful that even death cannot end it. Poe blends beauty and grief as the speaker mourns Annabel Lee beside the sounding sea.",
        blurb:
            "A young love in a seaside kingdom, ended too soon by a chill wind. The speaker insists that not even angels can divide them.",
    },
    {
        scramble: "ETH QUMASE FO ETH DER HATDE",
        answer: "the masque of the red death",
        displayAnswer: "The Masque of the Red Death",
        eyebrow: "No wall can keep it out",
        explanation:
            "Prince Prospero hides from a plague inside a lavish abbey, but death arrives at his masquerade anyway. The story warns that wealth and privilege cannot provide refuge from mortality.",
        blurb:
            "While a plague sweeps the land, a prince seals his court inside a walled abbey for an endless party. At midnight, an uninvited guest arrives in costume.",
    },
];
