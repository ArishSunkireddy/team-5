import { TriviaView } from "./TriviaView";
import { TriviaQuestion, TriviaEnding } from "./questions";
import { shuffle } from "./shuffle";

export interface TriviaControl {
    onReturn: (finalScore: number) => void;
}

export class TriviaController {
    private view: TriviaView;
    private source: TriviaQuestion[];
    private questions: TriviaQuestion[];
    private shuffleQuiz: boolean;
    private ending: TriviaEnding;
    private control: TriviaControl;
    private pointsPerQuestion: number;
    private currIdx: number = 0;
    private score: number = 0;
    private answered: boolean = false;
    private timer: ReturnType<typeof setTimeout> | null =null;
    
    constructor (
        questions: TriviaQuestion[],
        ending: TriviaEnding,
        control: TriviaControl,
        containerID: string = "container",
        pointsPerQuestion: number = 10,
        shuffleQuiz: boolean = false
    ) {
        this.source = questions;
        this.questions = questions;
        this.shuffleQuiz = shuffleQuiz;
        this.ending = ending;
        this.control = control;
        this.pointsPerQuestion = pointsPerQuestion;
        this.view = new TriviaView (
            (selectedOption, idx) => this.handleAnswer(selectedOption, idx), containerID
        );
    }

    public start(): void {
        if (this.source.length === 0) {
            return;
        }
        this.clearTimer();
        // A fresh order on every playthrough (and every retry), so it can't be won by memorizing positions
        this.questions = this.shuffleQuiz
            ? shuffle(this.source).map((question) => ({ ...question, options: shuffle(question.options) }))
            : this.source;
        this.currIdx = 0;
        this.score = 0;
        this.answered = false;
        this.renderQuestion();
    }

    private handleAnswer(selectedOption: string, selectedIdx: number): void {
        if (this.answered) {
            return;
        }
        this.answered = true;
        const currQuestion = this.questions[this.currIdx];
        const correct = selectedOption === currQuestion.answer;

        if (correct) {
            this.score += this.pointsPerQuestion;
            this.view.updateScore(this.score);
        }
        this.view.highlight(selectedIdx, correct);
        this.timer = setTimeout(() => {
            this.advance();
        }, 1000);
    }

    private clearTimer(): void {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
    private advance(): void {
        this.currIdx++;
        if (this.currIdx < this.questions.length) {
            this.answered = false;
            this.renderQuestion();
        }
        else {
            this.finish();
        }
    }

    private renderQuestion(): void {
        this.view.updateQuestion(this.questions[this.currIdx], this.currIdx + 1, this.questions.length, this.score);
    }

    public destroy(): void {
        this.clearTimer();
        this.view.destroy();
    }

    private finish(): void {
        const passed = this.score >= this.ending.passingScore;
        let message: string;
        let buttonLabel: string;
        let action: () => void;

        // Return to storyline
        if (passed) {
            message = this.ending.passMessage;
            buttonLabel = this.ending.passButtonLabel;
            action = () =>  {
                this.destroy();
                this.control.onReturn(this.score);
            }
        }
        // If user fails, they must play trivia again
        else {
            message = this.ending.failMessage;
            buttonLabel = this.ending.failButtonLabel;
            action = () => this.start();
        }
        this.view.showEnd(this.score, message, buttonLabel, action);
    }
}