import Konva from "konva";
import { PoeRound } from "./rounds";
import { theme } from "../menu/theme";
import {
    addBackground, fitToWindow, addButton, addDivider, addHeader, addImagePlaceholder, addKicker,
    addPanel, addShade, addText, pageBox,
} from "../menu/konvaUi";

const { colors } = theme;

// A bordered label whose box grows with its text, e.g. "ROUND 1 / 5"
interface Badge {
    set: (text: string) => void;
}

export class PoeView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private size: { width: number; height: number };   // Layout size (see fitToWindow)
    private gameGroup: Konva.Group;
    private revealGroup: Konva.Group;
    private pictureGroup: Konva.Group;
    private roundBadge: Badge;
    private scoreBadge: Badge;
    private eyebrowText: Konva.Text;
    private scrambleText: Konva.Text;
    private inputText: Konva.Text;
    private placeholderText: Konva.Text;
    private inputBox: Konva.Rect;
    private inputGlow: Konva.Rect;
    private answerLabel: Konva.Text;
    private submitButton: Konva.Group;
    private historyTexts: Konva.Text[] = [];
    private historyMarks: Konva.Group[] = [];
    private blurbText: Konva.Text;
    private pictureBox = { x: 0, y: 0, width: 0, height: 0 };
    private currentGuess: string = "";
    private inputEnabled: boolean = false;
    private focused: boolean = false;          // Typing only goes into the box while it is focused
    private caretOn: boolean = true;
    private caretTimer: ReturnType<typeof setInterval> | null = null;
    private clickedInput: boolean = false;     // Set by clicks on the box or Submit, so the stage doesn't blur it
    private onSubmit: (guess: string) => void;
    private keyHandler: (event: KeyboardEvent) => void;

    constructor(onSubmit: (guess: string) => void, containerId: string = "container") {
        this.onSubmit = onSubmit;
        this.stage = new Konva.Stage({
            container: containerId,
            width: window.innerWidth,
            height: window.innerHeight,
        });
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        this.size = fitToWindow(this.stage, this.layer);

        const width = this.size.width;
        const height = this.size.height;
        addBackground(this.layer, width, height);
        this.gameGroup = new Konva.Group();
        this.revealGroup = new Konva.Group({ visible: false });
        this.layer.add(this.gameGroup, this.revealGroup);

        const ruleY = addHeader(this.gameGroup, width, {
            kicker: "A literary mystery",
            title: "Edgar Allan Poe",
            seal: "P",
            rightTag: "1809–1849",
            rightText: "19th Century · Baltimore",
        });

        // Two columns: the puzzle on the left, the picture and story teaser on the right
        const { x0, x1, width: contentWidth } = pageBox(width);
        const top = ruleY + 26;
        const leftWidth = Math.round(contentWidth * 0.6);
        const dividerX = x0 + leftWidth + 32;
        const rightX = dividerX + 32;
        const rightWidth = x1 - rightX;
        this.gameGroup.add(new Konva.Line({
            points: [dividerX, top, dividerX, height - 36], stroke: colors.border, strokeWidth: 1,
        }));

        // Round and score badges
        this.roundBadge = this.makeBadge(x0, top, "left");
        this.scoreBadge = this.makeBadge(x0 + leftWidth, top, "right");
        let y = top + 54;

        const prompt = addText(this.gameGroup, "Name the Poe title hidden below", {
            x: x0, y, width: leftWidth, size: 26, color: colors.text,
        });
        y += prompt.height() + 4;
        const instructions = addText(this.gameGroup, "Rearrange the letters. Punctuation and spaces do not matter.", {
            x: x0, y, width: leftWidth, size: 15, color: colors.muted, italic: true,
        });
        y += instructions.height() + 18;

        // Card holding the hint and the scrambled title
        const cardHeight = 124;
        addPanel(this.gameGroup, x0, y, leftWidth, cardHeight, { shadow: false });
        this.eyebrowText = addKicker(this.gameGroup, "", { x: x0, y: y + 24, width: leftWidth, align: "center" });
        this.scrambleText = addText(this.gameGroup, "", {
            x: x0 + 20, y: y + 44, width: leftWidth - 40, height: cardHeight - 56,
            size: 30, font: "heading", color: colors.text, align: "center", verticalAlign: "middle", letterSpacing: 6,
        });
        y += cardHeight + 22;

        // The answer box shows what the player has typed so far. While it is focused it glows gold
        // and shows a blinking cursor; click it to type, click anywhere else to stop
        this.answerLabel = addKicker(this.gameGroup, "Your answer", { x: x0, y, color: colors.muted });
        y += 24;
        const inputHeight = 54;
        const submitWidth = 170;
        const inputWidth = leftWidth - submitWidth - 14;
        this.inputGlow = new Konva.Rect({
            x: x0 - 4, y: y - 4, width: inputWidth + 8, height: inputHeight + 8,
            stroke: colors.highlight, strokeWidth: 4, opacity: 0.25, cornerRadius: theme.radius.button + 3, listening: false,
        });
        this.inputBox = new Konva.Rect({
            x: x0, y, width: inputWidth, height: inputHeight,
            fill: colors.background, stroke: colors.border, strokeWidth: 1, cornerRadius: theme.radius.button,
        });
        this.gameGroup.add(this.inputGlow, this.inputBox);
        this.placeholderText = addText(this.gameGroup, "", {
            x: x0 + 18, y, width: inputWidth - 36, height: inputHeight, size: 19, verticalAlign: "middle", italic: true, color: colors.faint,
        });
        this.inputText = addText(this.gameGroup, "", {
            x: x0 + 18, y, width: inputWidth - 36, height: inputHeight, size: 20, verticalAlign: "middle", color: colors.text,
        });
        this.inputBox.on("mousedown touchstart", () => {
            this.clickedInput = true;
            this.setFocus(true);
        });
        this.inputBox.on("mouseenter", () => this.setCursor("text"));
        this.inputBox.on("mouseleave", () => this.setCursor("default"));

        this.submitButton = addButton(this.gameGroup, "Submit", x0 + inputWidth + 14, y, submitWidth, () => this.submit(), {
            height: inputHeight, arrow: true,
        });
        this.submitButton.on("mousedown touchstart", () => {
            this.clickedInput = true;
        });

        // A click anywhere else stops typing. Shapes hear the click before the stage does
        this.stage.on("mousedown touchstart", () => {
            if (!this.clickedInput) {
                this.setFocus(false);
            }
            this.clickedInput = false;
        });
        y += inputHeight + 22;

        // Past guesses, one row per attempt, with a tick or cross at the right end
        const rowGap = 38;
        for (let idx = 0; idx < 3; idx++) {
            this.historyTexts.push(addText(this.gameGroup, "", {
                x: x0, y: y + idx * rowGap, width: leftWidth - 40, size: 17, color: colors.dim,
            }));
            const mark = new Konva.Group({ x: x0 + leftWidth - 18, y: y + idx * rowGap + 4 });
            this.historyMarks.push(mark);
            this.gameGroup.add(mark);
        }
        addText(this.gameGroup, "Press Enter or Submit to check your answer", {
            x: x0, y: y + rowGap * 3 + 6, size: 13, color: colors.faint, italic: true,
        });

        // Right column: the picture for this round, then a teaser about the story
        const pictureWidth = Math.min(rightWidth * 0.82, 340);
        const textRoom = 210;
        const pictureHeight = Math.max(160, Math.min(pictureWidth * 1.18, height - top - textRoom - 40));
        this.pictureBox = { x: rightX + (rightWidth - pictureWidth) / 2, y: top, width: pictureWidth, height: pictureHeight };
        this.pictureGroup = new Konva.Group();
        this.gameGroup.add(this.pictureGroup);
        const blurbTop = top + pictureHeight + 26;
        addKicker(this.gameGroup, "From the archives", { x: rightX, y: blurbTop, width: rightWidth, align: "center" });
        addDivider(this.gameGroup, rightX + rightWidth / 2, blurbTop + 28, 50);
        this.blurbText = addText(this.gameGroup, "", {
            x: rightX, y: blurbTop + 44, width: rightWidth, size: 20, lineHeight: 1.5, align: "center", italic: true,
        });

        // Konva has no text box, so the view listens for key presses itself
        this.keyHandler = (event: KeyboardEvent) => {
            if (!this.inputEnabled || !this.focused || event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
            if (event.key === "Enter") {
                event.preventDefault();
                this.submit();
            }
            else if (event.key === "Backspace") {
                event.preventDefault();
                this.currentGuess = this.currentGuess.slice(0, -1);
                this.showCaret();
            }
            else if (event.key.length === 1 && this.currentGuess.length < 40) {
                event.preventDefault();
                this.currentGuess += event.key;
                this.showCaret();
            }
        };
        window.addEventListener("keydown", this.keyHandler);
        this.layer.draw();
    }

    // Change to next round: hint, scrambled title, progress, score, picture, and teaser. Clears the typed answer
    updateRound(round: PoeRound, num: number, total: number, score: number): void {
        this.revealGroup.visible(false);
        this.gameGroup.visible(true);
        this.roundBadge.set(`Round ${num} / ${total}`);
        this.scoreBadge.set(`Score ${score} / ${total}`);
        this.eyebrowText.text(round.eyebrow.toUpperCase());
        this.scrambleText.text(round.scramble);
        this.blurbText.text(round.blurb ?? round.eyebrow);

        this.pictureGroup.destroyChildren();
        const { x, y, width, height } = this.pictureBox;
        addImagePlaceholder(this.pictureGroup, x, y, width, height, {
            shape: "oval", caption: `Round ${num} illustration`, src: round.image,
        });

        this.currentGuess = "";
        this.inputEnabled = true;
        this.setFocus(true);   // Ready to type as soon as the round starts
    }

    // Update display of score
    updateScore(score: number, total: number): void {
        this.scoreBadge.set(`Score ${score} / ${total}`);
        this.layer.draw();
    }

    // Shows the guesses so far, with a check on the last one if it was right.
    // The three rows show how many tries are left, so the attempts count itself isn't drawn
    updateGuesses(guesses: string[], _attemptsLeft: number, solved: boolean = false): void {
        for (let idx = 0; idx < this.historyTexts.length; idx++) {
            const num = String(idx + 1).padStart(2, "0");
            const guess = guesses[idx];
            const mark = this.historyMarks[idx];
            mark.destroyChildren();
            if (guess === undefined) {
                this.historyTexts[idx].text(`${num}     Awaiting your guess`);
                this.historyTexts[idx].fill(colors.faint);
            }
            else {
                const isRight = solved && idx === guesses.length - 1;
                this.historyTexts[idx].text(`${num}     ${guess}`);
                this.historyTexts[idx].fill(isRight ? colors.correctText : colors.wrongText);
                this.drawMark(mark, isRight);
            }
        }

        this.layer.draw();
    }

    // Fixes cursor and key listener per round
    destroy(): void {
        this.stopCaret();
        window.removeEventListener("keydown", this.keyHandler);
        document.body.style.cursor = "default";
        this.stage.destroy();
    }

    // Card over the game telling the player the answer and the story behind it
    showReveal(correct: boolean, round: PoeRound, buttonLabel: string, onAction: () => void): void {
        this.setFocus(false);
        this.inputEnabled = false;
        this.revealGroup.destroyChildren();
        this.revealGroup.visible(true);
        const width = this.size.width;
        const height = this.size.height;
        const cardWidth = Math.min(700, width - 80);
        const cardX = (width - cardWidth) / 2;
        const inner = cardWidth - 120;
        const cx = width / 2;

        addShade(this.revealGroup, width, height);
        const card = new Konva.Group({ x: 0, y: 0 });
        let y = 36;

        // Seal with a check or a cross
        const seal = new Konva.Group({ x: cx, y: y + 30 });
        seal.add(new Konva.Circle({ radius: 30, stroke: correct ? colors.correctText : colors.wrongText, strokeWidth: 2 }));
        seal.add(new Konva.Circle({ radius: 24, stroke: correct ? colors.correctText : colors.wrongText, strokeWidth: 1, opacity: 0.5 }));
        seal.add(correct
            ? new Konva.Line({ points: [-11, 0, -3, 9, 12, -9], stroke: colors.correctText, strokeWidth: 3, lineCap: "round", lineJoin: "round" })
            : new Konva.Line({ points: [-9, -9, 9, 9, 0, 0, 9, -9, -9, 9], stroke: colors.wrongText, strokeWidth: 3, lineCap: "round" }));
        card.add(seal);
        y += 78;

        const kicker = addKicker(card, correct ? "A mystery solved" : "The answer revealed", { x: cardX, y, width: cardWidth, align: "center" });
        y += kicker.height() + 12;
        const title = addText(card, correct ? "Well read." : "Not this time.", {
            x: cardX, y, width: cardWidth, size: 34, font: "heading", color: colors.text, align: "center",
        });
        y += title.height() + 14;
        addDivider(card, cx, y + 4);
        y += 24;
        const answer = addText(card, `The answer is “${round.displayAnswer}.”`, {
            x: cardX, y, width: cardWidth, size: 21, color: colors.highlight, align: "center",
        });
        y += answer.height() + 14;
        const explanation = addText(card, round.explanation, {
            x: cardX + 60, y, width: inner, size: 17, lineHeight: 1.55, align: "center",
        });
        y += explanation.height() + 30;
        const buttonWidth = 300;
        addButton(card, buttonLabel, cx - buttonWidth / 2, y, buttonWidth, onAction, { arrow: true });
        y += theme.button.size.height + 36;

        // Center the finished card vertically, with the panel behind everything
        const cardHeight = y;
        const cardY = Math.max(20, (height - cardHeight) / 2);
        card.y(cardY);
        const panelLayer = new Konva.Group();
        addPanel(panelLayer, cardX, cardY, cardWidth, cardHeight);
        this.revealGroup.add(panelLayer, card);
        this.layer.draw();
    }

    private makeBadge(anchorX: number, y: number, align: "left" | "right"): Badge {
        const box = new Konva.Rect({ y, height: 34, stroke: colors.border, strokeWidth: 1, cornerRadius: theme.radius.button });
        const label = addText(this.gameGroup, "", { y: y + 9, size: 13, color: colors.body, letterSpacing: 2, caps: true });
        this.gameGroup.add(box);
        return {
            set: (text: string) => {
                label.text(text.toUpperCase());
                const boxWidth = label.width() + 32;
                const boxX = align === "left" ? anchorX : anchorX - boxWidth;
                box.x(boxX);
                box.width(boxWidth);
                label.x(boxX + 16);
                label.y(y + (34 - label.height()) / 2);
            },
        };
    }

    // Small tick or cross at the end of a guess row
    private drawMark(mark: Konva.Group, right: boolean): void {
        mark.add(right
            ? new Konva.Line({ points: [0, 8, 6, 14, 16, 2], stroke: colors.correctText, strokeWidth: 2.5, lineCap: "round", lineJoin: "round" })
            : new Konva.Line({ points: [2, 2, 14, 14, 8, 8, 14, 2, 2, 14], stroke: colors.wrongText, strokeWidth: 2.5, lineCap: "round" }));
    }

    // Sends the typed answer (Enter or the Submit button). Blank answers do nothing
    private submit(): void {
        if (!this.inputEnabled || this.currentGuess.trim() === "") {
            return;
        }
        const guess = this.currentGuess;
        this.currentGuess = "";
        this.showCaret();
        this.onSubmit(guess);
    }

    // Focused: gold border and glow, gold label, blinking cursor. Unfocused: plain box, "Click here" prompt
    private setFocus(focused: boolean): void {
        this.focused = focused && this.inputEnabled;
        this.inputBox.stroke(this.focused ? colors.highlight : colors.border);
        this.inputBox.strokeWidth(this.focused ? 2 : 1);
        this.inputGlow.visible(this.focused);
        this.answerLabel.fill(this.focused ? colors.highlight : colors.muted);
        this.stopCaret();
        if (this.focused) {
            this.caretTimer = setInterval(() => {
                this.caretOn = !this.caretOn;
                this.refreshInput();
            }, 530);
        }
        this.showCaret();
    }

    // Keeps the cursor visible right after typing, so it doesn't blink out mid-word
    private showCaret(): void {
        this.caretOn = true;
        this.refreshInput();
    }

    private stopCaret(): void {
        if (this.caretTimer !== null) {
            clearInterval(this.caretTimer);
            this.caretTimer = null;
        }
    }

    private setCursor(cursor: string): void {
        this.stage.container().style.cursor = cursor;
    }

    // Redraws the typed answer with the cursor, the prompt in an empty box, and whether Submit is ready
    private refreshInput(): void {
        const caret = this.focused && this.caretOn ? "|" : "";
        const empty = this.currentGuess === "";
        this.inputText.text(`${this.currentGuess}${caret}`);
        this.placeholderText.text(empty ? (this.focused ? "Start typing the title…" : "Click here to type your answer") : "");
        // In a focused, empty box the prompt sits just after the cursor
        this.placeholderText.x(this.inputText.x() + (empty && this.focused ? 12 : 0));
        this.submitButton.opacity(empty ? 0.45 : 1);
        this.layer.draw();
    }
}
