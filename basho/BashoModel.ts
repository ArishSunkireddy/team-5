import { BashoPoem, BashoLine, bashoPoems } from "./poems";

// What happened when the player picked a line (or the clock ran out)
export type BashoChoiceResult = "correct" | "wrong" | "ignored";

// Where the game goes once the feedback has been shown
export type BashoAdvanceResult = "continue" | "won" | "lost";

// Everything the view needs to draw one round
export interface BashoRoundInfo {
    poem: BashoPoem;
    line: BashoLine;
    lineIdx: number;
    lockedLines: string[];
    options: string[];
    round: number;
    totalRounds: number;
    lives: number;
    maxLives: number;
    timeLeft: number;
    timeLimit: number;
}

export class BashoModel {
    private poems: BashoPoem[];
    private startingLives: number;
    private initialTime: number;
    private minTime: number;
    private lives = 0;
    private poemIdx = 0;
    private lineIdx = 0;
    private completed: number[] = [];
    private lockedLines: string[] = [];
    private attempts = 0;
    private timeLeft = 0;
    // Set after a choice, cleared by advance(). While it is set, further choices are ignored
    private lastResult: "correct" | "wrong" | null = null;

    // Initializes the haiku rounds, starting lives, and the time (in seconds) allowed per line
    constructor(poems: BashoPoem[] = bashoPoems, startingLives: number = 3, initialTime: number = 22, minTime: number = 8) {
        this.poems = poems;
        this.startingLives = startingLives;
        this.initialTime = initialTime;
        this.minTime = minTime;
        this.reset();
    }

    // Puts the game back to the first poem with full lives and a fresh clock
    reset(): void {
        this.lives = this.startingLives;
        this.poemIdx = 0;
        this.lineIdx = 0;
        this.completed = [];
        this.lockedLines = [];
        this.attempts = 0;
        this.lastResult = null;
        this.timeLeft = this.getTimeLimit();
    }

    getCurrentPoem(): BashoPoem {
        return this.poems[this.poemIdx];
    }

    getCurrentLine(): BashoLine {
        return this.getCurrentPoem().lines[this.lineIdx];
    }

    getLives(): number {
        return this.lives;
    }

    getTimeLeft(): number {
        return this.timeLeft;
    }

    getCompletedPoems(): number[] {
        return [...this.completed];
    }

    getLockedLines(): string[] {
        return [...this.lockedLines];
    }

    // Total number of lines across every poem (9 for the three haiku)
    getTotalRounds(): number {
        return this.poems.reduce((total, poem) => total + poem.lines.length, 0);
    }

    // Ex: Round 4 of 9 is the first line of the second poem
    getRound(): number {
        let finishedLines = 0;
        for (const idx of this.completed) {
            finishedLines += this.poems[idx].lines.length;
        }
        return finishedLines + this.lineIdx + 1;
    }

    // Seconds allowed for the current line. Every attempt and every lost life makes it shorter, down to a floor
    getTimeLimit(): number {
        const limit = this.initialTime - this.attempts * 0.5 - (this.startingLives - this.lives) * 1.25;
        return Math.max(this.minTime, limit);
    }

    // Choices for the current line, ordered by their first letter (the same fixed order the original game used)
    getOptions(): string[] {
        return [...this.getCurrentLine().options].sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
    }

    getRoundInfo(): BashoRoundInfo {
        return {
            poem: this.getCurrentPoem(),
            line: this.getCurrentLine(),
            lineIdx: this.lineIdx,
            lockedLines: this.getLockedLines(),
            options: this.getOptions(),
            round: this.getRound(),
            totalRounds: this.getTotalRounds(),
            lives: this.lives,
            maxLives: this.startingLives,
            timeLeft: this.timeLeft,
            timeLimit: this.getTimeLimit(),
        };
    }

    // Counts the clock down by one tick. Returns true once the time has run out
    tick(step: number = 0.1): boolean {
        // The clock is paused while feedback is showing
        if (this.lastResult !== null) {
            return false;
        }
        if (this.timeLeft <= step) {
            this.timeLeft = 0;
            return true;
        }
        this.timeLeft -= step;
        return false;
    }

    // A wrong choice or a clock that hit zero costs one life
    loseLife(): void {
        if (this.lastResult !== null) {
            return;
        }
        this.lives--;
        this.attempts++;
        this.lastResult = "wrong";
    }

    // A right choice locks the line into the poem. A wrong choice costs a life
    submitChoice(choice: string): BashoChoiceResult {
        if (this.lastResult !== null) {
            return "ignored";
        }
        if (choice !== this.getCurrentLine().correct) {
            this.loseLife();
            return "wrong";
        }
        this.attempts++;
        this.lockedLines.push(choice);
        this.lastResult = "correct";
        return "correct";
    }

    // Moves on after the feedback: next line, next poem, or the end of the game
    advance(): BashoAdvanceResult {
        const result = this.lastResult;
        this.lastResult = null;

        if (result === null) {
            return "continue";
        }

        if (result === "wrong") {
            if (this.lives <= 0) {
                return "lost";
            }
            // A mistake sends the player to a different unfinished poem, starting from its first line
            const next = this.findNextPoem(this.poemIdx, this.completed);
            this.poemIdx = next === -1 ? this.poemIdx : next;
            this.lineIdx = 0;
            this.lockedLines = [];
        }
        else if (this.lineIdx === this.getCurrentPoem().lines.length - 1) {
            // Last line of the poem is locked in, so the poem is finished
            this.completed.push(this.poemIdx);
            if (this.completed.length === this.poems.length) {
                return "won";
            }
            this.poemIdx = this.findNextPoem(this.poemIdx, this.completed);
            this.lineIdx = 0;
            this.lockedLines = [];
        }
        else {
            this.lineIdx++;
        }

        this.timeLeft = this.getTimeLimit();
        return "continue";
    }

    // First unfinished poem that is not the one just left. Falls back to the first unfinished poem, or -1 if all are done
    private findNextPoem(currentIdx: number, finished: number[]): number {
        const next = this.poems.findIndex((_, idx) => idx !== currentIdx && !finished.includes(idx));
        return next === -1 ? this.poems.findIndex((_, idx) => !finished.includes(idx)) : next;
    }
}
