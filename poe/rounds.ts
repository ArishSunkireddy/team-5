// One anagram round: the scrambled title, the answer, and the text shown once the round is over
export interface PoeRound {
    scramble: string;
    answer: string;
    displayAnswer: string;
    eyebrow: string;
    explanation: string;
}

export const poeRounds: PoeRound[] = [
    {
        scramble: "HTE AVERN",
        answer: "the raven",
        displayAnswer: "The Raven",
        eyebrow: "A mournful visitor",
        explanation:
            "First published in 1845, this dark poem follows a grieving man visited by a mysterious raven. Its repeated cry of “Nevermore” draws him deeper into sorrow, memory, and madness.",
    },
    {
        scramble: "ETH LELT–LAET HTERA",
        answer: "the tell tale heart",
        displayAnswer: "The Tell-Tale Heart",
        eyebrow: "A sound beneath the floor",
        explanation:
            "Poe’s 1843 story is told by an unreliable narrator who insists on his sanity after committing murder. Haunted by what sounds like a beating heart, his guilt becomes impossible to silence.",
    },
    {
        scramble: "ETH KCALB TAC",
        answer: "the black cat",
        displayAnswer: "The Black Cat",
        eyebrow: "A shadow with nine lives",
        explanation:
            "In this unsettling tale, cruelty, superstition, and guilt overtake the narrator. A black cat becomes both a witness to his crimes and a symbol of the conscience he cannot escape.",
    },
    {
        scramble: "BANNAEL EEL",
        answer: "annabel lee",
        displayAnswer: "Annabel Lee",
        eyebrow: "A kingdom by the sea",
        explanation:
            "This lyrical poem remembers a love so powerful that even death cannot end it. Poe blends beauty and grief as the speaker mourns Annabel Lee beside the sounding sea.",
    },
    {
        scramble: "ETH QUMASE FO ETH DER HATDE",
        answer: "the masque of the red death",
        displayAnswer: "The Masque of the Red Death",
        eyebrow: "No wall can keep it out",
        explanation:
            "Prince Prospero hides from a plague inside a lavish abbey, but death arrives at his masquerade anyway. The story warns that wealth and privilege cannot provide refuge from mortality.",
    },
];
