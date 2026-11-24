import Konva from "konva";
import { BashoScreen } from "./poems";
import { BashoRoundInfo } from "./BashoModel";
import { theme } from "../menu/theme";
import {
    addBackground, fitToWindow, addButton, addDivider, addHeader, addHeart, addImagePlaceholder, addKicker,
    addOption, addPanel, addSeal, addText, pageBox, type OptionRow,
} from "../menu/konvaUi";

const { colors } = theme;

const FOOTER_QUOTE = "“Every day is a journey, and the journey itself is home.”  — Matsuo Basho";
const PANEL_QUOTE = "“A good poem is one in which the form of the verse and the joining of its parts seem light as a shallow river.”";

export class BashoView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private size: { width: number; height: number };   // Layout size (see fitToWindow)
    private headerBottom: number;
    private playGroup: Konva.Group;
    private messageGroup: Konva.Group;
    private onSelect: (option: string, index: number) => void;
    private currentOptions: string[] = [];
    private optionRows: OptionRow[] = [];
    private timerFill: Konva.Rect | null = null;
    private timerText: Konva.Text | null = null;
    private timerWidth = 0;
    private feedback: { box: Konva.Rect; text: Konva.Text } | null = null;

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
        const headerGroup = new Konva.Group();
        this.layer.add(headerGroup);
        this.headerBottom = addHeader(headerGroup, this.size.width, {
            kicker: "Tales of the Genroku",
            title: "Matsuo Basho",
            seal: "B",
            rightTag: "1688",
            rightText: "17th Century · Edo Japan",
        });

        this.playGroup = new Konva.Group({ visible: false });
        this.messageGroup = new Konva.Group({ visible: false });
        this.layer.add(this.playGroup, this.messageGroup);
        this.layer.draw();
    }

    // Change to the next round: journey panel, poem so far, choices, lives, and clock
    updateRound(info: BashoRoundInfo): void {
        this.messageGroup.visible(false);
        this.playGroup.visible(true);
        this.playGroup.destroyChildren();
        this.currentOptions = info.options;

        const height = this.size.height;
        const { x0, x1, width } = pageBox(this.size.width);
        const top = this.headerBottom + 24;
        const bottom = height - 76;   // Leaves room for the Return to Main Menu button
        const leftWidth = Math.round(Math.max(300, Math.min(420, width * 0.3)));
        const rightX = x0 + leftWidth + 28;

        this.drawJourneyPanel(info, x0, top, leftWidth, bottom - top);
        this.drawRoundPanel(info, rightX, top, x1 - rightX, bottom - top);
        this.layer.draw();
    }

    // Update display of the clock
    updateTimer(timeLeft: number, timeLimit: number): void {
        this.setTimer(timeLeft, timeLimit);
        this.layer.draw();
    }

    // Selected option turns green/red; the others fade
    highlight(idx: number, correct: boolean): void {
        this.optionRows.forEach((row, rowIdx) => row.setState(rowIdx === idx ? (correct ? "correct" : "wrong") : "faded"));
        this.layer.draw();
    }

    // Banner under the clock after a pick or when time runs out
    showFeedback(correct: boolean): void {
        if (this.feedback) {
            this.feedback.box.fill(correct ? colors.correct : colors.wrong);
            this.feedback.box.visible(true);
            this.feedback.text.text(correct
                ? "The rhythm holds. The verse flows onward."
                : "The rhythm breaks. Honor is lost, and a new poem awaits.");
            this.feedback.text.visible(true);
        }
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
        const width = this.size.width;
        const height = this.size.height;
        const cardWidth = Math.min(820, width - 80);
        const cardX = (width - cardWidth) / 2;
        const cx = width / 2;
        const inner = cardWidth - 140;

        // Content first, so the card can be sized and centered around it
        const content = new Konva.Group();
        let y = 62;
        const kicker = addKicker(content, screen.kicker, { x: cardX, y, width: cardWidth, align: "center" });
        y += kicker.height() + 14;
        const title = addText(content, screen.title, {
            x: cardX + 50, y, width: cardWidth - 100, size: 38, font: "heading", color: colors.text, align: "center", lineHeight: 1.15,
        });
        y += title.height() + 20;
        addDivider(content, cx, y);
        y += 26;
        const body = addText(content, screen.body, {
            x: cardX + 70, y, width: inner, size: 18, lineHeight: 1.6, align: "center",
        });
        y += body.height() + 22;
        if (screen.extra) {
            const extra = addText(content, screen.extra, {
                x: cardX + 70, y, width: inner, size: 17, lineHeight: 1.5, align: "center", italic: true, color: colors.highlight,
            });
            y += extra.height() + 22;
        }
        if (screen.showSyllables) {
            y = this.drawSyllableStrip(content, cx, y + 4) + 26;
        }
        const buttonWidth = 320;
        addButton(content, screen.buttonLabel, cx - buttonWidth / 2, y, buttonWidth, onAction, { arrow: true });
        y += theme.button.size.height + 22;
        if (screen.hint) {
            const hint = addText(content, screen.hint, {
                x: cardX, y, width: cardWidth, size: 12, color: colors.dim, align: "center", letterSpacing: 2, caps: true,
            });
            y += hint.height();
        }
        y += 40;

        const areaTop = this.headerBottom + 46;
        const areaBottom = height - 56;
        const cardY = Math.max(areaTop, areaTop + (areaBottom - areaTop - y) / 2);
        content.y(cardY);
        const backing = new Konva.Group();
        addPanel(backing, cardX, cardY, cardWidth, y);
        addSeal(backing, cx - 32, cardY - 32, 64, "B", screen.somber ? colors.border : colors.accent);
        this.messageGroup.add(backing, content);

        addText(this.messageGroup, FOOTER_QUOTE, {
            x: 0, y: height - 38, width, size: 14, color: colors.dim, align: "center", italic: true,
        });
        this.layer.draw();
    }

    // Short screen between Basho's farewell and the trivia (the time-travel moment)
    showTransition(): void {
        this.playGroup.visible(false);
        this.messageGroup.destroyChildren();
        this.messageGroup.visible(true);
        const width = this.size.width;
        const cy = this.size.height * 0.48;
        addDivider(this.messageGroup, width / 2, cy - 40, 90);
        addText(this.messageGroup, "Time folds around you…", {
            x: 0, y: cy - 14, width, size: 30, font: "heading", color: colors.text, align: "center",
        });
        addDivider(this.messageGroup, width / 2, cy + 46, 90);
        this.layer.draw();
    }

    // Left panel: who you are helping, a picture, honor (lives), and the three poems
    private drawJourneyPanel(info: BashoRoundInfo, x: number, y: number, width: number, height: number): void {
        const group = this.playGroup;
        addPanel(group, x, y, width, height);
        const pad = 28;
        const inner = width - pad * 2;
        let cy = y + pad + 4;

        addKicker(group, "Basho's journey", { x: x + pad, y: cy });
        cy += 22;
        const title = addText(group, "Win the patron's heart", { x: x + pad, y: cy, width: inner, size: 22, color: colors.text });
        cy += title.height() + 16;

        const pictureHeight = Math.round(Math.min(inner * 0.62, height * 0.26));
        addImagePlaceholder(group, x + pad, cy, inner, pictureHeight, { caption: "Matsuo Basho" });
        cy += pictureHeight + 18;

        // Honor: one heart per life
        group.add(new Konva.Line({ points: [x + pad, cy, x + width - pad, cy], stroke: colors.border, strokeWidth: 1 }));
        cy += 16;
        addKicker(group, "Honor", { x: x + pad, y: cy + 4, color: colors.muted });
        const heartSize = 22;
        for (let idx = 0; idx < info.maxLives; idx++) {
            const hx = x + width - pad - (info.maxLives - idx) * (heartSize + 8) + 8;
            addHeart(group, hx, cy - 1, heartSize, idx < info.lives);
        }
        cy += 30;
        group.add(new Konva.Line({ points: [x + pad, cy, x + width - pad, cy], stroke: colors.border, strokeWidth: 1 }));
        cy += 12;

        // The three poems and how far along each is
        const rowHeight = 56;
        info.poems.forEach((poem, idx) => {
            const done = info.completedPoems.includes(idx);
            const current = idx === info.poemIdx;
            if (current) {
                group.add(new Konva.Rect({ x: x + pad - 10, y: cy, width: inner + 20, height: rowHeight, fill: colors.background }));
                group.add(new Konva.Rect({ x: x + pad - 10, y: cy, width: 3, height: rowHeight, fill: colors.accentHover }));
            }
            this.drawPoemStatus(group, x + pad + 16, cy + rowHeight / 2, done, current);
            addText(group, poem.title, {
                x: x + pad + 44, y: cy + 9, width: inner - 44, size: 18, color: done || current ? colors.text : colors.dim,
            });
            addText(group, done ? "Completed" : current ? "In progress" : "Awaiting verse", {
                x: x + pad + 44, y: cy + 33, size: 13, color: done ? colors.correctText : colors.muted, italic: true,
            });
            cy += rowHeight + 4;
        });

        // A quote at the foot of the panel, when there is room for it
        const quote = addText(group, PANEL_QUOTE, { x: x + pad, width: inner, size: 14, italic: true, color: colors.dim, lineHeight: 1.5 });
        const quoteY = y + height - pad - quote.height();
        if (quoteY > cy + 12) {
            quote.y(quoteY);
        }
        else {
            quote.destroy();
        }
    }

    // Right panel: progress, what to do, the poem so far, the choices, the clock, and feedback
    private drawRoundPanel(info: BashoRoundInfo, x: number, y: number, width: number, height: number): void {
        const group = this.playGroup;
        addPanel(group, x, y, width, height);
        const pad = 36;
        const left = x + pad;
        const inner = width - pad * 2;
        let cy = y + pad;

        // Round progress: one dash per line of verse
        const roundLabel = addText(group, `Round ${info.round} of ${info.totalRounds}`, {
            x: left, y: cy, size: 13, color: colors.muted, letterSpacing: 2, caps: true,
        });
        const dashX = left + roundLabel.width() + 22;
        for (let idx = 0; idx < info.totalRounds; idx++) {
            const color = idx < info.round - 1 ? colors.highlight : idx === info.round - 1 ? colors.accentHover : colors.border;
            group.add(new Konva.Rect({ x: dashX + idx * 28, y: cy + roundLabel.height() / 2 - 1.5, width: 22, height: 3, fill: color }));
        }
        const season = addKicker(group, `${info.poem.season} verse`, { y: cy });
        season.x(x + width - pad - season.width());
        cy += 40;

        // Syllable ring and the instruction
        const ringRadius = 54;
        const ringX = left + ringRadius;
        const ringY = cy + ringRadius;
        group.add(new Konva.Circle({ x: ringX, y: ringY, radius: ringRadius, stroke: colors.highlight, strokeWidth: 1.5 }));
        group.add(new Konva.Circle({ x: ringX, y: ringY, radius: ringRadius - 7, stroke: colors.border, strokeWidth: 1 }));
        addText(group, String(info.line.syllables), {
            x: ringX - ringRadius, y: ringY - 30, width: ringRadius * 2, size: 34, color: colors.highlight, align: "center",
        });
        addText(group, "syllables", {
            x: ringX - ringRadius, y: ringY + 14, width: ringRadius * 2, size: 9, color: colors.muted, align: "center", letterSpacing: 1, caps: true,
        });
        const textX = left + ringRadius * 2 + 28;
        addKicker(group, "Complete the next line", { x: textX, y: cy + 8 });
        const promptStart = addText(group, "Choose a line with ", { x: textX, y: cy + 30, size: 30, color: colors.text });
        addText(group, `${info.line.syllables} syllables`, {
            x: textX + promptStart.width(), y: cy + 30, size: 30, color: colors.highlight,
        });
        addText(group, "Listen for the rhythm. Keep the image and season in harmony.", {
            x: textX, y: cy + 30 + promptStart.height() + 6, width: x + width - pad - textX, size: 15, color: colors.muted, italic: true,
        });
        cy += ringRadius * 2 + 22;

        // Fit the poem box and the choices into whatever height is left.
        // Fixed parts: poem box title and padding, gaps, the clock row (the feedback banner covers it), bottom padding
        const fixed = 40 + 14 + 18 + 3 * 10 + 16 + 44 + pad;
        const room = y + height - cy - fixed;
        let rowHeight = 40;
        let optionHeight = 56;
        const wanted = rowHeight * 3 + optionHeight * 3;
        if (wanted > room) {
            const scale = room / wanted;
            rowHeight = Math.max(28, Math.floor(rowHeight * scale));
            optionHeight = Math.max(40, Math.floor(optionHeight * scale));
        }

        // The poem so far
        const boxHeight = 40 + rowHeight * 3 + 14;
        group.add(new Konva.Rect({
            x: left, y: cy, width: inner, height: boxHeight, fill: colors.background, stroke: colors.border, strokeWidth: 1,
            cornerRadius: theme.radius.button,
        }));
        const poemTitle = addText(group, info.poem.title, {
            x: left + 22, y: cy + 16, size: 12, color: colors.muted, letterSpacing: 2.5, caps: true,
        });
        group.add(new Konva.Line({
            points: [left + 22 + poemTitle.width() + 16, cy + 16 + poemTitle.height() / 2, left + inner - 22, cy + 16 + poemTitle.height() / 2],
            stroke: colors.border, strokeWidth: 1,
        }));
        info.poem.lines.forEach((line, idx) => {
            const rowY = cy + 40 + idx * rowHeight;
            const locked = info.lockedLines[idx];
            const isCurrent = idx === info.lineIdx && locked === undefined;
            addText(group, String(idx + 1), { x: left + 22, y: rowY, height: rowHeight, size: 12, color: colors.dim, verticalAlign: "middle" });
            addText(group, locked ?? (isCurrent ? "Your next line…" : "—"), {
                x: left + 52, y: rowY, height: rowHeight, width: inner - 120, size: 20, verticalAlign: "middle",
                color: locked !== undefined ? colors.text : isCurrent ? colors.highlight : colors.faint, italic: isCurrent,
            });
            const badgeX = left + inner - 36;
            group.add(new Konva.Circle({ x: badgeX, y: rowY + rowHeight / 2, radius: 14, stroke: colors.border, strokeWidth: 1 }));
            addText(group, String(line.syllables), {
                x: badgeX - 14, y: rowY + rowHeight / 2 - 14, width: 28, height: 28, size: 12, color: colors.muted, align: "center", verticalAlign: "middle",
            });
        });
        cy += boxHeight + 18;

        // The choices
        this.optionRows = info.options.map((option, idx) => addOption(
            group, String.fromCharCode(65 + idx), option, left, cy + idx * (optionHeight + 10), inner, optionHeight,
            () => this.onSelect(this.currentOptions[idx] ?? "", idx),
        ));
        cy += info.options.length * (optionHeight + 10) + 16;

        // The clock
        const timerLabel = addKicker(group, "Time to reflect", { x: left, y: cy, color: colors.muted });
        const barX = left + timerLabel.width() + 20;
        this.timerWidth = inner - (barX - left) - 56;
        group.add(new Konva.Rect({ x: barX, y: cy + timerLabel.height() / 2 - 2, width: this.timerWidth, height: 4, fill: colors.border, cornerRadius: 2 }));
        this.timerFill = new Konva.Rect({ x: barX, y: cy + timerLabel.height() / 2 - 2, width: this.timerWidth, height: 4, fill: colors.highlight, cornerRadius: 2 });
        group.add(this.timerFill);
        this.timerText = addText(group, "", { x: left + inner - 44, y: cy - 2, width: 44, size: 15, color: colors.highlight, align: "right" });

        // Feedback banner, shown after a pick. It covers the clock, which is paused by then
        const bannerY = cy + timerLabel.height() / 2 - 22;
        const box = new Konva.Rect({ x: left, y: bannerY, width: inner, height: 44, fill: colors.wrong, visible: false, cornerRadius: theme.radius.button });
        group.add(box);
        const text = addText(group, "", { x: left + 20, y: bannerY, width: inner - 40, height: 44, size: 17, color: colors.text, verticalAlign: "middle" });
        text.visible(false);
        this.feedback = { box, text };

        this.setTimer(info.timeLeft, info.timeLimit);
    }

    // Circle beside each poem: a check when done, a dot while in progress, a lock while waiting
    private drawPoemStatus(group: Konva.Group, cx: number, cy: number, done: boolean, current: boolean): void {
        const radius = 16;
        group.add(new Konva.Circle({
            x: cx, y: cy, radius,
            fill: done ? colors.correct : "rgba(0,0,0,0)",
            stroke: done ? colors.correctText : current ? colors.highlight : colors.border, strokeWidth: 1.5,
        }));
        if (done) {
            group.add(new Konva.Line({
                points: [cx - 6, cy, cx - 2, cy + 5, cx + 7, cy - 5], stroke: colors.text, strokeWidth: 2, lineCap: "round", lineJoin: "round",
            }));
        }
        else if (current) {
            group.add(new Konva.Circle({ x: cx, y: cy, radius: 5, fill: colors.highlight }));
        }
        else {
            group.add(new Konva.Rect({ x: cx - 5, y: cy - 1, width: 10, height: 8, fill: colors.dim, cornerRadius: 1 }));
            group.add(new Konva.Line({
                points: [cx - 3, cy - 1, cx - 3, cy - 4, cx - 1, cy - 6, cx + 1, cy - 6, cx + 3, cy - 4, cx + 3, cy - 1],
                stroke: colors.dim, strokeWidth: 1.5, lineJoin: "round",
            }));
        }
    }

    // The 5 — 7 — 5 strip on the briefing card
    private drawSyllableStrip(group: Konva.Group, cx: number, y: number): number {
        const steps: [string, string][] = [["5", "First line"], ["7", "Second line"], ["5", "Final line"]];
        const spacing = 170;
        steps.forEach(([count, label], idx) => {
            const sx = cx + (idx - 1) * spacing;
            addText(group, count, { x: sx - 60, y, width: 120, size: 40, color: colors.highlight, align: "center" });
            addText(group, label, {
                x: sx - 70, y: y + 58, width: 140, size: 11, color: colors.muted, align: "center", letterSpacing: 2, caps: true,
            });
            if (idx < steps.length - 1) {
                group.add(new Konva.Line({ points: [sx + 42, y + 28, sx + spacing - 42, y + 28], stroke: colors.border, strokeWidth: 1 }));
            }
        });
        return y + 80;
    }

    // Sets the bar width and the seconds shown. The caller redraws the layer
    private setTimer(timeLeft: number, timeLimit: number): void {
        if (!this.timerFill || !this.timerText) {
            return;
        }
        const ratio = Math.max(0, Math.min(1, timeLeft / timeLimit));
        this.timerFill.width(this.timerWidth * ratio);
        this.timerFill.fill(ratio < 0.3 ? colors.wrongText : colors.highlight);
        this.timerText.text(`${Math.ceil(timeLeft)}s`);
        this.timerText.fill(ratio < 0.3 ? colors.wrongText : colors.highlight);
    }
}
