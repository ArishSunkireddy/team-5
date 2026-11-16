import { PoeRound, poeRounds } from "./rounds";

// What happened to a guess. "failed" means it was wrong and it was the last one allowed
export type PoeGuessResult = "correct" | "wrong" | "failed" | "ignored";

// Lowercase and drop everything but letters, so capitals, spaces, and punctuation never matter
export function normalizeGuess(value: string): string {
    return value.toLowerCase().replace(/[^a-z]/g, "");
}

export class PoeModel {
    private rounds: PoeRound[];
    private maxGuesses: number;
    private roundIdx = 0;
    private guesses: string[] = [];
    private score = 0;
    // Set once a round is solved or out of guesses. While it is set, further guesses are ignored
    private result: "correct" | "incorrect" | null = null;

    // Initializes the anagram rounds and how many guesses the player gets for each
    constructor(rounds: PoeRound[] = poeRounds, maxGuesses: number = 3) {
        this.rounds = rounds;
        this.maxGuesses = maxGuesses;
    }

    // Puts the game back to the first round with no score
    reset(): void {
        this.roundIdx = 0;
        this.guesses = [];
        this.score = 0;
        this.result = null;
    }

    getCurrentRound(): PoeRound {
        return this.rounds[this.roundIdx];
    }

    getTotalRounds(): number {
        return this.rounds.length;
    }

    getRoundNumber(): number {
        return this.roundIdx + 1;
    }

    // Number of mysteries solved so far
    getScore(): number {
        return this.score;
    }

    getGuesses(): string[] {
        return [...this.guesses];
    }

    getAttemptsLeft(): number {
        return this.maxGuesses - this.guesses.length;
    }

    isLastRound(): boolean {
        return this.roundIdx === this.rounds.length - 1;
    }

    // Blank guesses and guesses after the round is over do nothing
    submitGuess(guess: string): PoeGuessResult {
        const trimmedGuess = guess.trim();
        if (!trimmedGuess || this.result !== null) {
            return "ignored";
        }
        this.guesses.push(trimmedGuess);

        if (normalizeGuess(trimmedGuess) === normalizeGuess(this.getCurrentRound().answer)) {
            this.score++;
            this.result = "correct";
            return "correct";
        }
        if (this.guesses.length >= this.maxGuesses) {
            this.result = "incorrect";
            return "failed";
        }
        return "wrong";
    }

    // Moves to the next round. Returns false (and stays put) after the last round
    nextRound(): boolean {
        if (this.isLastRound()) {
            return false;
        }
        this.roundIdx++;
        this.guesses = [];
        this.result = null;
        return true;
    }
}
