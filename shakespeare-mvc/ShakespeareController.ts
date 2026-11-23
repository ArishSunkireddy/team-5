import { ShakespeareView } from "./ShakespeareView";
import { ShakespeareModel } from "./ShakespeareModel";
import { StoryCard, StoryRound } from "./story";

export interface ShakespeareControl {
    // Called once, after Shakespeare's farewell, so the game can move on to the trivia
    onComplete: () => void;
}

export class ShakespeareController {
    private view: ShakespeareView;
    private model: ShakespeareModel;
    private rounds: StoryRound[];
    private prologue: StoryCard[];
    private farewell: StoryCard;
    private control: ShakespeareControl;
    private finished = false;

    constructor(
        rounds: StoryRound[],
        prologue: StoryCard[],
        farewell: StoryCard,
        control: ShakespeareControl,
        containerID: string = "container"
    ) {
        this.rounds = rounds;
        this.prologue = prologue;
        this.farewell = farewell;
        this.control = control;
        this.model = new ShakespeareModel(rounds, prologue.length);
        this.view = new ShakespeareView(containerID);
    }

    // Starts again from the first prologue card
    public start(): void {
        this.model.restart();
        this.render();
    }

    // Draws whichever screen the model is on. Each button moves the model on and draws the next one
    private render(): void {
        const screen = this.model.getScreen();
        switch (screen.type) {
            case "prologue":
                this.view.showCard(this.prologue[screen.index], () => this.next());
                break;
            case "context": {
                const round = this.rounds[screen.round];
                this.view.showCard({
                    label: "",
                    title: round.contextTitle,
                    text: round.contextText,
                    buttonLabel: "Continue",
                }, () => this.next());
                break;
            }
            case "choice":
                this.view.showChoice(this.rounds[screen.round], (choiceIdx) => {
                    if (this.model.choose(choiceIdx)) {
                        this.render();
                    }
                });
                break;
            case "result": {
                const choice = this.rounds[screen.round].choices[this.model.getPicks()[screen.round]!];
                this.view.showResult(choice.result, choice.successful, () => this.next());
                break;
            }
            case "farewell":
                this.view.showCard(this.farewell, () => this.next());
                break;
            case "done":
                this.finish();
                break;
        }
    }

    private next(): void {
        this.model.advance();
        this.render();
    }

    private finish(): void {
        if (this.finished) {
            return;
        }
        this.finished = true;
        this.destroy();
        this.control.onComplete();
    }

    public destroy(): void {
        this.view.destroy();
    }
}
