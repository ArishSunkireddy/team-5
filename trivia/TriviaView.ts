import Konva from "konva";
import { TriviaQuestion } from "./questions";
import { theme } from "../menu/theme";
import {
    addBackground, fitToWindow, addButton, addDivider, addHeader, addImagePlaceholder, addKicker, addOption,
    addPanel, addSeal, addText, pageBox, type OptionRow,
} from "../menu/konvaUi";

const { colors } = theme;

// A feather for the corner decoration (drawn in a 60 x 110 box)
const QUILL = "M58 2C40 8 22 26 14 52C10 66 9 80 10 92L16 86C18 74 22 62 30 50C26 62 24 72 24 80C36 66 46 50 52 34C46 38 40 42 36 44C44 34 52 20 58 2Z";

export class TriviaView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private size: { width: number; height: number };   // Layout size (see fitToWindow)
    private headerBottom: number;
    private quizGroup: Konva.Group;
    private endGroup: Konva.Group;
    private onSelect: (option: string, index: number) => void;
    private currentOptions: string[] = [];
    private optionRows: OptionRow[] = [];
    private scoreText: Konva.Text | null = null;

    constructor(onSelect: (option: string, index: number) => void, containerId: string = "container") {
        this.onSelect = onSelect;
        this.stage = new Konva.Stage({
            container: containerId,
            width: window.innerWidth,
            height: window.innerHeight,
        });
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        this.size = fitToWindow(this.stage, this.layer);

        addBackground(this.layer, this.size.width, this.size.height);
        const header = new Konva.Group();
        this.layer.add(header);
        this.headerBottom = addHeader(header, this.size.width, {
            kicker: "A journey through literature",
            title: "Out of Print",
            seal: "O",
            rightTag: "Final trial",
            rightText: "Time Trivia",
        });
        this.addCornerDecoration(header);

        this.quizGroup = new Konva.Group();
        this.endGroup = new Konva.Group({ visible: false });
        this.layer.add(this.quizGroup, this.endGroup);
        this.layer.draw();
    }

    // Change to next question, progress, and score
    updateQuestion(question: TriviaQuestion, num: number, total: number, score: number): void {
        this.endGroup.visible(false);
        this.quizGroup.visible(true);
        this.quizGroup.destroyChildren();
        this.currentOptions = question.options;

        const width = this.size.width;
        const height = this.size.height;
        const cardWidth = Math.min(960, width - 80);
        const cardX = (width - cardWidth) / 2;
        const pad = 44;
        const left = cardX + pad;
        const inner = cardWidth - pad * 2;
        const content = new Konva.Group();
        let y = 0;

        // Progress and score
        addKicker(content, `Question ${num} of ${total}`, { x: left, y, color: colors.muted });
        this.scoreText = addKicker(content, "", { y });
        this.setScore(score, left + inner);
        y += 26;
        content.add(new Konva.Rect({ x: left, y, width: inner, height: 3, fill: colors.border, cornerRadius: 1.5 }));
        content.add(new Konva.Rect({ x: left, y, width: inner * (num / total), height: 3, fill: colors.highlight, cornerRadius: 1.5 }));
        y += 26;

        // The question, in its own box
        const questionText = addText(content, question.question, {
            x: left + 32, y: y + 30, width: inner - 64, size: 25, color: colors.text, align: "center", lineHeight: 1.3,
        });
        const boxHeight = Math.max(130, questionText.height() + 60);
        questionText.y(y + (boxHeight - questionText.height()) / 2);
        const box = new Konva.Rect({
            x: left, y, width: inner, height: boxHeight, fill: colors.background, stroke: colors.border, strokeWidth: 1,
            cornerRadius: theme.radius.button,
        });
        content.add(box);
        box.moveToBottom();
        y += boxHeight + 28;

        // Four answers in a two-by-two grid
        const gap = 20;
        const optionWidth = (inner - gap) / 2;
        const optionHeight = 80;
        this.optionRows = question.options.map((option, idx) => addOption(
            content, String.fromCharCode(65 + idx), option,
            left + (idx % 2) * (optionWidth + gap), y + Math.floor(idx / 2) * (optionHeight + gap),
            optionWidth, optionHeight,
            () => this.onSelect(this.currentOptions[idx] ?? "", idx),
        ));
        y += Math.ceil(question.options.length / 2) * (optionHeight + gap) - gap;

        // Card sized to its content and centered below the header
        const cardHeight = y + pad * 2;
        const areaTop = this.headerBottom + 32;
        const cardY = Math.max(areaTop, areaTop + (height - 40 - areaTop - cardHeight) / 2);
        content.y(cardY + pad);
        const backing = new Konva.Group();
        addPanel(backing, cardX, cardY, cardWidth, cardHeight);
        this.quizGroup.add(backing, content);
        this.layer.draw();
    }

    // Update display of score
    updateScore(score: number): void {
        if (this.scoreText) {
            this.setScore(score, this.scoreText.x() + this.scoreText.width());
        }
        this.layer.draw();
    }

    // Selected option turns green/red; the others fade
    highlight(idx: number, correct: boolean): void {
        if (this.optionRows[idx]) {
            this.optionRows.forEach((row, rowIdx) => row.setState(rowIdx === idx ? (correct ? "correct" : "wrong") : "faded"));
            this.layer.draw();
        }
    }

    // Fixes cursor per round
    destroy(): void {
        document.body.style.cursor = "default";
        this.stage.destroy();
    }

    public showEnd(score: number, message: string, buttonLabel: string, onAction: () => void): void {
        this.quizGroup.visible(false);
        this.endGroup.destroyChildren();
        this.endGroup.visible(true);
        const width = this.size.width;
        const height = this.size.height;
        const cardWidth = Math.min(720, width - 80);
        const cardX = (width - cardWidth) / 2;
        const cx = width / 2;

        const content = new Konva.Group();
        let y = 62;
        addKicker(content, "Trivia complete", { x: cardX, y, width: cardWidth, align: "center" });
        y += 28;
        addText(content, "Final score", { x: cardX, y, width: cardWidth, size: 16, color: colors.muted, align: "center", letterSpacing: 2, caps: true });
        y += 28;
        const scoreNode = addText(content, String(score), { x: cardX, y, width: cardWidth, size: 64, color: colors.highlight, align: "center" });
        y += scoreNode.height() + 14;
        addDivider(content, cx, y);
        y += 26;
        const body = addText(content, message, { x: cardX + 60, y, width: cardWidth - 120, size: 19, lineHeight: 1.55, align: "center" });
        y += body.height() + 30;
        const buttonWidth = 320;
        addButton(content, buttonLabel, cx - buttonWidth / 2, y, buttonWidth, onAction, { arrow: true });
        y += theme.button.size.height + 48;

        const areaTop = this.headerBottom + 52;
        const cardY = Math.max(areaTop, areaTop + (height - 40 - areaTop - y) / 2);
        content.y(cardY);
        const backing = new Konva.Group();
        addPanel(backing, cardX, cardY, cardWidth, y);
        addSeal(backing, cx - 30, cardY - 30, 60, "O");
        this.endGroup.add(backing, content);
        this.layer.draw();
    }

    // Score in the top-right of the card, right-aligned to `right`
    private setScore(score: number, right: number): void {
        if (!this.scoreText) {
            return;
        }
        this.scoreText.text(`SCORE  ${score}`);
        this.scoreText.x(right - this.scoreText.width());
    }

    // Quill and a round picture frame in the bottom-right corner, above the Return to Main Menu button.
    // Only drawn when the window is wide enough to keep it clear of the question card
    private addCornerDecoration(group: Konva.Group): void {
        const width = this.size.width;
        const height = this.size.height;
        const cardRight = (width + Math.min(960, width - 80)) / 2;
        const { x1 } = pageBox(width);
        const size = 112;
        if (x1 - cardRight < size + 24) {
            return;
        }
        const circleX = x1 - size;
        const circleY = height - 80 - size;
        addImagePlaceholder(group, circleX, circleY, size, size, { shape: "oval", label: "Image" });
        group.add(new Konva.Path({
            x: circleX - 40, y: circleY - 92, data: QUILL, fill: colors.highlight, opacity: 0.85, scaleX: 1.1, scaleY: 1.1, listening: false,
        }));
        group.add(new Konva.Line({
            points: [circleX - 28, circleY + 10, circleX - 10, circleY - 16], stroke: colors.highlight, strokeWidth: 2, lineCap: "round", opacity: 0.85,
        }));
    }
}