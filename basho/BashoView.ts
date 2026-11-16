import Konva from "konva";
import { BashoScreen } from "./poems";
import { BashoRoundInfo } from "./BashoModel";

export class BashoView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private playGroup: Konva.Group;
    private messageGroup: Konva.Group;
    private roundText: Konva.Text;
    private livesText: Konva.Text;
    private timerText: Konva.Text;
    private timerFill: Konva.Rect;
    private timerBarWidth: number;
    private promptText: Konva.Text;
    private poemTitleText: Konva.Text;
    private verseTexts: Konva.Text[] = [];
    private feedbackText: Konva.Text;
    private optionGroups: Konva.Group[] = [];
    private optionBoxes: Konva.Rect[] = [];
    private optionLabels: Konva.Text[] = [];
    private currentOptions: string[] = [];

    constructor(onSelect: (option: string, index: number) => void, containerId: string = "container") {
        this.stage = new Konva.Stage( {
            container: containerId,
            width: window.innerWidth,
            height: window.innerHeight,
        });
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Background color
        const bg = new Konva.Rect( {
            x: 0,
            y: 0,
            width: this.stage.width(),
            height: this.stage.height(),
            fill: "#18181b",
        });
        this.layer.add(bg);
        this.playGroup = new Konva.Group({ visible: false });
        this.messageGroup = new Konva.Group({ visible: false });
        this.layer.add(this.playGroup, this.messageGroup);

        // Ex: Round x / 9 in top left corner
        this.roundText = new Konva.Text( {
            text: "Round 1 / 9",
            x: 60,
            y: 40,
            fontSize: 15,
            fill: "#a1a1aa",
        });
        this.playGroup.add(this.roundText);

        // Hearts for the lives left, in the top middle
        this.livesText = new Konva.Text( {
            text: "",
            x: this.stage.width() / 2 - 80,
            y: 40,
            fontSize: 15,
            fill: "#f87171",
        });
        this.playGroup.add(this.livesText);

        // Displays the seconds left in top right corner
        this.timerText = new Konva.Text( {
            text: "",
            x: this.stage.width() - 180,
            y: 40,
            width: 120,
            align: "right",
            fontSize: 15,
            fill: "#a1a1aa",
        });
        this.playGroup.add(this.timerText);

        // What the player needs to do this round
        this.promptText = new Konva.Text( {
            text: "",
            x: 60,
            y: 90,
            width: this.stage.width() - 120,
            fontSize: 28,
            fill: "#ffffff",
        });
        this.playGroup.add(this.promptText);

        // The haiku being built: a title, then the three lines
        this.poemTitleText = new Konva.Text( {
            text: "",
            x: 60,
            y: 140,
            fontSize: 16,
            fill: "#a1a1aa",
        });
        this.playGroup.add(this.poemTitleText);

        for (let idx = 0; idx < 3; idx++) {
            const verse = new Konva.Text( {
                text: "",
                x: 60,
                y: 170 + idx * 30,
                width: this.stage.width() - 120,
                fontSize: 20,
                fill: "#a1a1aa",
            });
            this.verseTexts.push(verse);
            this.playGroup.add(verse);
        }

        // Bar that shrinks as time runs out
        this.timerBarWidth = this.stage.width() - 120;
        const timerTrack = new Konva.Rect( {
            x: 60,
            y: 275,
            width: this.timerBarWidth,
            height: 10,
            fill: "#27272a",
            cornerRadius: 5,
        });
        this.timerFill = new Konva.Rect( {
            x: 60,
            y: 275,
            width: this.timerBarWidth,
            height: 10,
            fill: "#3b82f6",
            cornerRadius: 5,
        });
        this.playGroup.add(timerTrack, this.timerFill);

        for (let idx = 0; idx < 3; idx++) {
            const group = new Konva.Group({x:60, y:310 + idx * 75});

            const box = new Konva.Rect( {
                width: this.stage.width() - 120,
                height: 56,
                fill: "#27272a",
                cornerRadius: 10,
            });

            const label = new Konva.Text( {
                text: "",
                x: 20,
                width: this.stage.width() - 160,
                height: 56,
                verticalAlign: "middle",
                fontSize: 20,
                fill: "#f4f4f5",
            });

            group.add(box, label);

            group.on("mouseover", () => {
                document.body.style.cursor = "pointer";
            });
            group.on("mouseout", () => {
                document.body.style.cursor = "default";
            });
            group.on("click tap", () => {
                const selectedOption = this.currentOptions[idx] ?? "";
                onSelect(selectedOption, idx);
            });

            this.optionGroups.push(group);
            this.optionBoxes.push(box);
            this.optionLabels.push(label);
            this.playGroup.add(group);
        }

        // Tells the player if the line they picked kept the rhythm
        this.feedbackText = new Konva.Text( {
            text: "",
            x: 60,
            y: 545,
            width: this.stage.width() - 120,
            fontSize: 18,
            fill: "#e2e8f0",
        });
        this.playGroup.add(this.feedbackText);

        this.layer.draw();
    }

    // Change to the next round: poem, lines locked in so far, choices, lives, and clock
    updateRound(info: BashoRoundInfo): void {
        this.messageGroup.visible(false);
        this.playGroup.visible(true);
        this.currentOptions = info.options;
        this.roundText.text(`Round ${info.round} / ${info.totalRounds}`);
        this.livesText.text(`Honor: ${"♥".repeat(Math.max(0, info.lives))}${"♡".repeat(Math.max(0, info.maxLives - info.lives))}`);
        this.promptText.text(`Choose a line with ${info.line.syllables} syllables`);
        this.poemTitleText.text(`${info.poem.title} · ${info.poem.season} verse`);
        this.feedbackText.text("");

        // Locked lines show the player's pick, the current line is waiting, and later lines are blank
        for (let idx = 0; idx < this.verseTexts.length; idx++) {
            let lineText = "—";
            if (info.lockedLines[idx] !== undefined) {
                lineText = info.lockedLines[idx];
            }
            else if (idx === info.lineIdx) {
                lineText = "Your next line…";
            }
            const syllables = info.poem.lines[idx]?.syllables ?? 0;
            this.verseTexts[idx].text(`${idx + 1}.  ${lineText}   (${syllables})`);
            this.verseTexts[idx].fill(idx === info.lineIdx ? "#ffffff" : "#a1a1aa");
        }

        for (let idx = 0; idx < this.optionGroups.length; idx++) {
            const optionText = info.options[idx];
            if (optionText !== undefined) {
                this.optionGroups[idx].visible(true);
                this.optionLabels[idx].text(`${String.fromCharCode(65 + idx)}   ${optionText}`);
                this.optionBoxes[idx].fill("#27272a");
            }
            else {
                this.optionGroups[idx].visible(false);
            }
        }
        this.setTimer(info.timeLeft, info.timeLimit);
        this.layer.draw();
    }

    // Update display of the clock
    updateTimer(timeLeft: number, timeLimit: number): void {
        this.setTimer(timeLeft, timeLimit);
        this.layer.draw();
    }

    // Selected option highlights green/red for correct/incorrect
    highlight(idx: number, correct: boolean): void {
        if (this.optionBoxes[idx]) {
            this.optionBoxes[idx].fill(correct ? "#16a34a" : "#dc2626");
            this.layer.draw();
        }
    }

    // Message under the choices after a pick or when time runs out
    showFeedback(correct: boolean): void {
        this.feedbackText.text(correct
            ? "The rhythm holds. The verse flows onward."
            : "The rhythm breaks. Honor is lost, and a new poem awaits.");
        this.feedbackText.fill(correct ? "#4ade80" : "#f87171");
        this.layer.draw();
    }

    // Fixes cursor per round
    destroy(): void {
        document.body.style.cursor = "default";
        this.stage.destroy();
    }

    // Story card with a title, text, and one button (briefing, win, lose, and farewell)
    showMessage(screen: BashoScreen, onAction: () => void): void {
        this.playGroup.visible(false);
        this.messageGroup.destroyChildren();
        this.messageGroup.visible(true);
        const width = this.stage.width();
        const height = this.stage.height();

        const kickerText = new Konva.Text( {
            x: 0,
            y: height * 0.12,
            width,
            text: screen.kicker,
            fontSize: 16,
            fill: "#a1a1aa",
            align: "center",
        });

        const titleText = new Konva.Text( {
            x: width * 0.12,
            y: height * 0.18,
            width: width * 0.76,
            text: screen.title,
            fontSize: 32,
            fill: "#ffffff",
            align: "center",
        });

        const bodyText = new Konva.Text( {
            x: width * 0.12,
            y: height * 0.3,
            width: width * 0.76,
            text: screen.body,
            fontSize: 20,
            lineHeight: 1.5,
            fill: "#e2e8f0",
            align: "center",
        });

        // Sits just under the body, however many lines the body wraps to
        const extraText = new Konva.Text( {
            x: width * 0.12,
            y: bodyText.y() + bodyText.height() + 30,
            width: width * 0.76,
            text: screen.extra ?? "",
            fontSize: 18,
            lineHeight: 1.5,
            fontStyle: "italic",
            fill: "#fbbf24",
            align: "center",
        });

        const buttonWidth = 260;
        const buttonHeight = 52;
        const buttonGroup = new Konva.Group( {
            x: (width - buttonWidth) / 2,
            y: height * 0.7,
        });

        const buttonBackground = new Konva.Rect( {
            width: buttonWidth,
            height: buttonHeight,
            fill: "#3b82f6",
        });

        const buttonText = new Konva.Text( {
            width: buttonWidth,
            height: buttonHeight,
            text: screen.buttonLabel,
            fontSize: 18,
            fill: "#ffffff",
            align: "center",
            verticalAlign: "middle",
        });

        buttonGroup.add(buttonBackground, buttonText);

        buttonGroup.on("mouseenter", () => {
            this.stage.container().style.cursor = "pointer";
            buttonBackground.fill("#2563eb");
        });
        buttonGroup.on("mouseleave", () => {
            this.stage.container().style.cursor = "default";
            buttonBackground.fill("#3b82f6");
        });
        buttonGroup.on("click tap", () => {
            this.stage.container().style.cursor = "default";
            onAction();
        });

        const hintText = new Konva.Text( {
            x: 0,
            y: height * 0.7 + buttonHeight + 20,
            width,
            text: screen.hint,
            fontSize: 14,
            fill: "#a1a1aa",
            align: "center",
        });

        this.messageGroup.add(kickerText, titleText, bodyText, extraText, buttonGroup, hintText);
        this.layer.draw();
    }

    // Short screen between Bashō's farewell and the trivia (the time-travel moment)
    showTransition(): void {
        this.playGroup.visible(false);
        this.messageGroup.destroyChildren();
        this.messageGroup.visible(true);

        const transitionText = new Konva.Text( {
            x: 0,
            y: this.stage.height() * 0.45,
            width: this.stage.width(),
            text: "Time folds around you…",
            fontSize: 28,
            fill: "#e2e8f0",
            align: "center",
        });

        this.messageGroup.add(transitionText);
        this.layer.draw();
    }

    // Sets the bar width and the seconds shown. The caller redraws the layer
    private setTimer(timeLeft: number, timeLimit: number): void {
        const ratio = Math.max(0, Math.min(1, timeLeft / timeLimit));
        this.timerFill.width(this.timerBarWidth * ratio);
        this.timerText.text(`${Math.ceil(timeLeft)}s`);
    }
}
