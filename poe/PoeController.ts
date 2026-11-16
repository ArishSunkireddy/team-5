import { PoeView } from "./PoeView";
import { PoeModel } from "./PoeModel";
import { PoeRound } from "./rounds";

export interface PoeControl {
    // Called after the last round with how many mysteries were solved, so the game can move on to the trivia
    onComplete: (solved: number) => void;
}

export class PoeController {
    private view: PoeView;
    private model: PoeModel;
    private rounds: PoeRound[];
    private control: PoeControl;

    constructor (
        rounds: PoeRound[],
        control: PoeControl,
        containerID: string = "container",
        maxGuesses: number = 3
    ) {
        this.rounds = rounds;
        this.control = control;
        this.model = new PoeModel(rounds, maxGuesses);
        this.view = new PoeView (
            (guess) => this.handleGuess(guess), containerID
        );
    }

    public start(): void {
        if (this.rounds.length === 0) {
            return;
        }
        this.model.reset();
        this.renderRound();
    }

    private renderRound(): void {
        this.view.updateRound(
            this.model.getCurrentRound(),
            this.model.getRoundNumber(),
            this.model.getTotalRounds(),
            this.model.getScore()
        );
        this.view.updateGuesses(this.model.getGuesses(), this.model.getAttemptsLeft());
    }

    private handleGuess(guess: string): void {
        const result = this.model.submitGuess(guess);
        if (result === "ignored") {
            return;
        }
        const solved = result === "correct";
        this.view.updateGuesses(this.model.getGuesses(), this.model.getAttemptsLeft(), solved);

        // A wrong guess with attempts left just lets the player try again
        if (result === "wrong") {
            return;
        }
        if (solved) {
            this.view.updateScore(this.model.getScore(), this.model.getTotalRounds());
        }
        // Round is over (solved or out of guesses). Reveal the answer, then move on
        const buttonLabel = this.model.isLastRound() ? "Enter bonus trivia" : "Turn the page";
        this.view.showReveal(solved, this.model.getCurrentRound(), buttonLabel, () => this.handleContinue());
    }

    private handleContinue(): void {
        if (this.model.nextRound()) {
            this.renderRound();
        }
        else {
            // Last round done, so back to the game to start the trivia
            const solved = this.model.getScore();
            this.destroy();
            this.control.onComplete(solved);
        }
    }

    public destroy(): void {
        this.view.destroy();
    }
}
