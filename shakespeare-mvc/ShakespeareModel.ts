import { StoryRound, storyRounds, prologueCards } from "./story";

// Where the player is in the story. "done" means the farewell has been dismissed
export type ShakespeareScreen =
    | { type: "prologue"; index: number }
    | { type: "context" | "choice" | "result"; round: number }
    | { type: "farewell" }
    | { type: "done" };

export class ShakespeareModel {
    private rounds: StoryRound[];
    private prologueLength: number;
    private screen: ShakespeareScreen = { type: "prologue", index: 0 };
    // Index of the choice picked in each round (undefined until that round is played)
    private picks: (number | undefined)[] = [];

    constructor(rounds: StoryRound[] = storyRounds, prologueLength: number = prologueCards.length) {
        this.rounds = rounds;
        this.prologueLength = prologueLength;
        this.restart();
    }

    // Back to the first prologue card with no choices made
    restart(): void {
        this.screen = { type: "prologue", index: 0 };
        this.picks = this.rounds.map(() => undefined);
    }

    getScreen(): ShakespeareScreen {
        return this.screen;
    }

    // Moves on from a prologue, context, result, or farewell screen. Choice screens move on with choose()
    advance(): void {
        const screen = this.screen;
        if (screen.type === "prologue") {
            if (screen.index + 1 < this.prologueLength) {
                this.screen = { type: "prologue", index: screen.index + 1 };
            }
            else {
                this.screen = this.rounds.length > 0 ? { type: "context", round: 0 } : { type: "farewell" };
            }
        }
        else if (screen.type === "context") {
            this.screen = { type: "choice", round: screen.round };
        }
        else if (screen.type === "result") {
            this.screen = screen.round + 1 < this.rounds.length
                ? { type: "context", round: screen.round + 1 }
                : { type: "farewell" };
        }
        else if (screen.type === "farewell") {
            this.screen = { type: "done" };
        }
    }

    // Records the player's pick and shows its result. Returns false if there is no choice to make
    choose(choiceIdx: number): boolean {
        const screen = this.screen;
        if (screen.type !== "choice" || this.rounds[screen.round].choices[choiceIdx] === undefined) {
            return false;
        }
        this.picks[screen.round] = choiceIdx;
        this.screen = { type: "result", round: screen.round };
        return true;
    }

    // One entry per round: true or false once picked, undefined before
    getSuccesses(): (boolean | undefined)[] {
        return this.picks.map((pick, round) => pick === undefined ? undefined : this.rounds[round].choices[pick].successful);
    }

    getPicks(): (number | undefined)[] {
        return [...this.picks];
    }
}
