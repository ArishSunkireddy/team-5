import Konva from "konva";
import { PoeRound } from "./rounds";

export class PoeView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private gameGroup: Konva.Group;
    private revealGroup: Konva.Group;
    private roundText: Konva.Text;
    private scoreText: Konva.Text;
    private eyebrowText: Konva.Text;
    private scrambleText: Konva.Text;
    private attemptsText: Konva.Text;
    private inputText: Konva.Text;
    private historyTexts: Konva.Text[] = [];
    private currentGuess: string = "";
    private inputEnabled: boolean = false;
    private keyHandler: (event: KeyboardEvent) => void;

    constructor(onSubmit: (guess: string) => void, containerId: string = "container") {
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
        this.gameGroup = new Konva.Group({ visible: true });
        this.revealGroup = new Konva.Group({ visible: false });
        this.layer.add(this.gameGroup, this.revealGroup);

        // Ex: Round 1 / 5 in top left corner
        this.roundText = new Konva.Text( {
            text: "Round 1 / 5",
            x: 60,
            y: 40,
            fontSize: 15,
            fill: "#a1a1aa",
        });
        this.gameGroup.add(this.roundText);

        // Displays mysteries solved in top right corner
        this.scoreText = new Konva.Text( {
            text: "Score: 0 / 5",
            x: this.stage.width() - 180,
            y: 40,
            fontSize: 15,
            fill: "#a1a1aa",
        });
        this.gameGroup.add(this.scoreText);

        // Heading and instructions
        const headingText = new Konva.Text( {
            text: "Rearrange the letters.",
            x: 60,
            y: 90,
            width: this.stage.width() - 120,
            fontSize: 28,
            fill: "#ffffff",
        });
        const promptText = new Konva.Text( {
            text: "Name the Poe title hidden below. Punctuation and spaces do not matter.",
            x: 60,
            y: 135,
            width: this.stage.width() - 120,
            fontSize: 16,
            fill: "#a1a1aa",
        });
        this.gameGroup.add(headingText, promptText);

        // Card holding the hint and the scrambled title
        const cardBox = new Konva.Rect( {
            x: 60,
            y: 180,
            width: this.stage.width() - 120,
            height: 120,
            fill: "#27272a",
            cornerRadius: 10,
        });
        this.eyebrowText = new Konva.Text( {
            text: "",
            x: 60,
            y: 198,
            width: this.stage.width() - 120,
            fontSize: 14,
            fill: "#a1a1aa",
            align: "center",
        });
        this.scrambleText = new Konva.Text( {
            text: "",
            x: 60,
            y: 235,
            width: this.stage.width() - 120,
            fontSize: 36,
            fill: "#f4f4f5",
            align: "center",
        });
        this.gameGroup.add(cardBox, this.eyebrowText, this.scrambleText);

        // Label above the answer box and how many guesses are left
        const answerLabel = new Konva.Text( {
            text: "Your answer",
            x: 60,
            y: 325,
            fontSize: 15,
            fill: "#a1a1aa",
        });
        this.attemptsText = new Konva.Text( {
            text: "",
            x: this.stage.width() - 260,
            y: 325,
            width: 200,
            align: "right",
            fontSize: 15,
            fill: "#a1a1aa",
        });
        this.gameGroup.add(answerLabel, this.attemptsText);

        // Box showing what the player has typed so far
        const inputBox = new Konva.Rect( {
            x: 60,
            y: 355,
            width: this.stage.width() - 120,
            height: 56,
            fill: "#27272a",
            stroke: "#3f3f46",
            cornerRadius: 10,
        });
        this.inputText = new Konva.Text( {
            text: "",
            x: 80,
            y: 355,
            width: this.stage.width() - 160,
            height: 56,
            verticalAlign: "middle",
            fontSize: 20,
            fill: "#f4f4f5",
        });
        this.gameGroup.add(inputBox, this.inputText);

        // Past guesses, one row per attempt
        for (let idx = 0; idx < 3; idx++) {
            const row = new Konva.Text( {
                text: "",
                x: 60,
                y: 435 + idx * 36,
                width: this.stage.width() - 120,
                fontSize: 18,
                fill: "#71717a",
            });
            this.historyTexts.push(row);
            this.gameGroup.add(row);
        }

        const hintText = new Konva.Text( {
            text: "Type your answer and press Enter to submit",
            x: 60,
            y: 555,
            fontSize: 14,
            fill: "#71717a",
        });
        this.gameGroup.add(hintText);

        // Konva has no text box, so the view listens for key presses itself
        this.keyHandler = (event: KeyboardEvent) => {
            if (!this.inputEnabled || event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
            if (event.key === "Enter") {
                event.preventDefault();
                if (this.currentGuess.trim() !== "") {
                    const guess = this.currentGuess;
                    this.currentGuess = "";
                    this.refreshInput();
                    onSubmit(guess);
                }
            }
            else if (event.key === "Backspace") {
                event.preventDefault();
                this.currentGuess = this.currentGuess.slice(0, -1);
                this.refreshInput();
            }
            else if (event.key.length === 1 && this.currentGuess.length < 40) {
                event.preventDefault();
                this.currentGuess += event.key;
                this.refreshInput();
            }
        };
        window.addEventListener("keydown", this.keyHandler);
        this.layer.draw();
    }

    // Change to next round: hint, scrambled title, progress, and score. Clears the typed answer
    updateRound(round: PoeRound, num: number, total: number, score: number): void {
        this.revealGroup.visible(false);
        this.gameGroup.visible(true);
        this.roundText.text(`Round ${num} / ${total}`);
        this.scoreText.text(`Score: ${score} / ${total}`);
        this.eyebrowText.text(round.eyebrow);
        this.scrambleText.text(round.scramble);
        this.currentGuess = "";
        this.inputEnabled = true;
        this.refreshInput();
    }

    // Update display of score
    updateScore(score: number, total: number): void {
        this.scoreText.text(`Score: ${score} / ${total}`);
        this.layer.draw();
    }

    // Shows the guesses so far and how many are left. The last guess gets a check if it was right
    updateGuesses(guesses: string[], attemptsLeft: number, solved: boolean = false): void {
        this.attemptsText.text(`${attemptsLeft} ${attemptsLeft === 1 ? "attempt" : "attempts"} remaining`);
        for (let idx = 0; idx < this.historyTexts.length; idx++) {
            const num = String(idx + 1).padStart(2, "0");
            const guess = guesses[idx];
            if (guess === undefined) {
                this.historyTexts[idx].text(`${num}   Awaiting your guess`);
                this.historyTexts[idx].fill("#71717a");
            }
            else {
                const isRight = solved && idx === guesses.length - 1;
                this.historyTexts[idx].text(`${num}   ${guess}   ${isRight ? "✓" : "×"}`);
                this.historyTexts[idx].fill(isRight ? "#4ade80" : "#f87171");
            }
        }
        this.layer.draw();
    }

    // Fixes cursor and key listener per round
    destroy(): void {
        window.removeEventListener("keydown", this.keyHandler);
        document.body.style.cursor = "default";
        this.stage.destroy();
    }

    // Card over the game telling the player the answer and the story behind it
    showReveal(correct: boolean, round: PoeRound, buttonLabel: string, onAction: () => void): void {
        this.inputEnabled = false;
        this.revealGroup.destroyChildren();
        this.revealGroup.visible(true);
        const width = this.stage.width();
        const height = this.stage.height();
        const cardWidth = Math.min(720, width - 120);
        const cardX = (width - cardWidth) / 2;
        const cardY = height * 0.1;

        // Dim the game behind the card
        const shade = new Konva.Rect( {
            x: 0,
            y: 0,
            width,
            height,
            fill: "rgba(0, 0, 0, 0.75)",
        });

        const card = new Konva.Rect( {
            x: cardX,
            y: cardY,
            width: cardWidth,
            height: 480,
            fill: "#27272a",
            cornerRadius: 12,
        });

        const iconText = new Konva.Text( {
            x: cardX,
            y: cardY + 24,
            width: cardWidth,
            text: correct ? "✓" : "×",
            fontSize: 44,
            fill: correct ? "#4ade80" : "#f87171",
            align: "center",
        });

        const kickerText = new Konva.Text( {
            x: cardX,
            y: cardY + 90,
            width: cardWidth,
            text: correct ? "A mystery solved" : "The answer revealed",
            fontSize: 14,
            fill: "#a1a1aa",
            align: "center",
        });

        const titleText = new Konva.Text( {
            x: cardX,
            y: cardY + 115,
            width: cardWidth,
            text: correct ? "Well read." : "Not this time.",
            fontSize: 30,
            fill: "#ffffff",
            align: "center",
        });

        const answerText = new Konva.Text( {
            x: cardX,
            y: cardY + 165,
            width: cardWidth,
            text: `The answer is “${round.displayAnswer}.”`,
            fontSize: 20,
            fill: "#e2e8f0",
            align: "center",
        });

        const explanationText = new Konva.Text( {
            x: cardX + 40,
            y: cardY + 215,
            width: cardWidth - 80,
            text: round.explanation,
            fontSize: 18,
            lineHeight: 1.5,
            fill: "#d4d4d8",
            align: "center",
        });

        const buttonWidth = 260;
        const buttonHeight = 52;
        const buttonGroup = new Konva.Group( {
            x: (width - buttonWidth) / 2,
            y: cardY + 400,
        });

        const buttonBackground = new Konva.Rect( {
            width: buttonWidth,
            height: buttonHeight,
            fill: "#3b82f6",
        });

        const buttonText = new Konva.Text( {
            width: buttonWidth,
            height: buttonHeight,
            text: buttonLabel,
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

        this.revealGroup.add(shade, card, iconText, kickerText, titleText, answerText, explanationText, buttonGroup);
        this.layer.draw();
    }

    // Redraws the typed answer, or the placeholder if nothing is typed yet
    private refreshInput(): void {
        if (this.currentGuess === "") {
            this.inputText.text("Type the title here...");
            this.inputText.fill("#71717a");
        }
        else {
            this.inputText.text(`${this.currentGuess}|`);
            this.inputText.fill("#f4f4f5");
        }
        this.layer.draw();
    }
}
