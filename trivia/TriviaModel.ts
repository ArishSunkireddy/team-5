import { individualTrivia, AuthorID, TriviaQuestion } from "./questions";

export class TriviaModel {
    private questions: TriviaQuestion[];
    private currentIdx = 0;
    private score = 0;

    // Initializes trivia questions depending on author
    constructor(author: AuthorID) {
        this.questions = individualTrivia[author];
    }

    getCurrentQuestion(): TriviaQuestion {
        return this.questions[this.currentIdx];
    }

    getTotalQuestions(): number {
        return this.questions.length;
    }

    getQuestionNumber(): number {
        return this.currentIdx + 1;
    }

    getScore(): number {
        return this.score;
    }

    submitAnswer(option: string): boolean {
        const isCorrect = option === this.getCurrentQuestion().answer;
        if (isCorrect) {
            this.score += 10;
        }
        return isCorrect;
    }

    nextQuestion(): boolean {
        this.currentIdx++;
        return this.currentIdx < this.getTotalQuestions();
    }
}