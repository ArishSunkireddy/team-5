import { BashoView } from "./BashoView";
import { BashoModel } from "./BashoModel";
import { BashoPoem, BashoScreen, BashoScreenID } from "./poems";

export interface BashoControl {
    // Called after Bashō's farewell so the game can move on to the trivia
    onComplete: () => void;
}

export class BashoController {
    private view: BashoView;
    private model: BashoModel;
    private poems: BashoPoem[];
    private screens: Record<BashoScreenID, BashoScreen>;
    private control: BashoControl;
    private clock: ReturnType<typeof setInterval> | null = null;
    private timer: ReturnType<typeof setTimeout> | null = null;

    constructor (
        poems: BashoPoem[],
        screens: Record<BashoScreenID, BashoScreen>,
        control: BashoControl,
        containerID: string = "container",
        startingLives: number = 3
    ) {
        this.poems = poems;
        this.screens = screens;
        this.control = control;
        this.model = new BashoModel(poems, startingLives);
        this.view = new BashoView (
            (selectedOption, idx) => this.handleChoice(selectedOption, idx), containerID
        );
    }

    // Shows the briefing. The player starts the rounds from its button
    public start(): void {
        if (this.poems.length === 0) {
            return;
        }
        this.clearTimers();
        this.view.showMessage(this.screens.briefing, () => this.beginRounds());
    }

    // Fresh game: full lives, first poem, and the clock running
    private beginRounds(): void {
        this.clearTimers();
        this.model.reset();
        this.renderRound();
        this.startClock();
    }

    private renderRound(): void {
        this.view.updateRound(this.model.getRoundInfo());
    }

    // Counts the time down every 0.1 seconds
    private startClock(): void {
        this.clock = setInterval(() => this.handleTick(), 100);
    }

    private handleTick(): void {
        const expired = this.model.tick();
        this.view.updateTimer(this.model.getTimeLeft(), this.model.getTimeLimit());
        // Running out of time costs a life, just like a wrong choice
        if (expired) {
            this.model.loseLife();
            this.showResult(false);
        }
    }

    private handleChoice(selectedOption: string, selectedIdx: number): void {
        const result = this.model.submitChoice(selectedOption);
        if (result === "ignored") {
            return;
        }
        const correct = result === "correct";
        this.showResult(correct);
        this.view.highlight(selectedIdx, correct);
    }

    // Stops the clock, shows feedback, and moves on after a short pause (longer after a mistake)
    private showResult(correct: boolean): void {
        this.clearTimers();
        this.renderRound();
        this.view.showFeedback(correct);
        this.timer = setTimeout(() => {
            this.advance();
        }, correct ? 650 : 850);
    }

    private advance(): void {
        const next = this.model.advance();
        if (next === "won") {
            this.view.showMessage(this.screens.won, () => this.showFarewell());
        }
        else if (next === "lost") {
            // If the player runs out of lives, they must play the rounds again
            this.view.showMessage(this.screens.lost, () => this.beginRounds());
        }
        else {
            this.renderRound();
            this.startClock();
        }
    }

    private showFarewell(): void {
        this.view.showMessage(this.screens.farewell, () => this.enterTransition());
    }

    // Short pause on the time-travel screen, then back to the game to start the trivia
    private enterTransition(): void {
        this.view.showTransition();
        this.timer = setTimeout(() => {
            this.destroy();
            this.control.onComplete();
        }, 2600);
    }

    private clearTimers(): void {
        if (this.clock !== null) {
            clearInterval(this.clock);
            this.clock = null;
        }
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    public destroy(): void {
        this.clearTimers();
        this.view.destroy();
    }
}
