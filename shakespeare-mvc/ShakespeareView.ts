import Konva from "konva";
import { StoryCard, StoryResult, StoryRound } from "./story";
import { theme } from "../menu/theme";
import {
    addBackground, fitToWindow, addButton, addDivider, addHeader, addKicker, addOption, addPanel, addSeal, addText, pageBox,
} from "../menu/konvaUi";

const { colors } = theme;

// The only file that touches Konva. It draws whatever screen the controller asks for.
// Scenes with Shakespeare in them get his portrait on the left and the story on the right;
// the present-day prologue cards are a single centered card.
export class ShakespeareView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private size: { width: number; height: number };   // Layout size (see fitToWindow)
    private screenGroup: Konva.Group;
    private headerBottom: number;

    constructor(containerId: string = "container") {
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
            kicker: "The Playwright's Gambit",
            title: "William Shakespeare",
            seal: "S",
            rightTag: "1564–1616",
            rightText: "16th Century · London",
        });
        this.screenGroup = new Konva.Group();
        this.layer.add(this.screenGroup);
        this.layer.draw();
    }

    // A story card with a title, text, and one button
    showCard(card: StoryCard, onAction: () => void): void {
        this.clear();
        const withFigure = card.figure === true;
        this.layout(withFigure, false, (group, x, width) => {
            let y = 0;
            y = this.addLabel(group, card.label, x, y, width, !withFigure);
            if (card.speaker !== undefined) {
                y = this.addLabel(group, card.speaker, x, y, width, !withFigure, colors.highlight);
            }
            y = this.addTitle(group, card.title, x, y, width, !withFigure);
            y = this.addBody(group, card.text, x, y, width, !withFigure);
            if (card.dialogue !== undefined) {
                y = this.addBody(group, card.dialogue, x, y, width, !withFigure, true);
            }
            if (card.extra !== undefined) {
                const extra = addText(group, card.extra, {
                    x, y, width, size: 16, color: colors.highlight, letterSpacing: 3, align: withFigure ? "left" : "center",
                });
                y += extra.height() + 22;
            }
            return this.addAction(group, card.buttonLabel, x, y + 8, width, !withFigure, onAction);
        });
    }

    // The question for a round, with one button per story Shakespeare could tell
    showChoice(round: StoryRound, onChoose: (choiceIdx: number) => void): void {
        this.clear();
        this.layout(true, false, (group, x, width) => {
            let y = 0;
            y = this.addLabel(group, `${round.year} · ${round.speaker}`, x, y, width, false, colors.highlight);
            y = this.addTitle(group, round.question, x, y, width, false);
            y = this.addBody(group, round.dialogue, x, y, width, false, true);
            y = this.addLabel(group, "Choose the story he will tell", x, y + 4, width, false, colors.muted);
            round.choices.forEach((choice, idx) => {
                addOption(group, String.fromCharCode(65 + idx), choice.title, x, y, width, 60, () => onChoose(idx), 20);
                y += 72;
            });
            return y;
        });
    }

    // What happened on opening night. Shakespeare cheers when the choice was the successful one
    showResult(result: StoryResult, success: boolean, onAction: () => void): void {
        this.clear();
        this.layout(true, success, (group, x, width) => {
            let y = 0;
            y = this.addLabel(group, result.label, x, y, width, false, success ? colors.correctText : colors.highlight);
            y = this.addTitle(group, result.title, x, y, width, false);
            y = this.addBody(group, result.text, x, y, width, false);
            y = this.addAudience(group, result.crowd, x, y, width);
            return this.addAction(group, "Continue", x, y + 6, width, false, onAction);
        });
    }

    destroy(): void {
        document.body.style.cursor = "default";
        this.stage.destroy();
    }

    private clear(): void {
        this.screenGroup.destroyChildren();
    }

    // Lays out one screen. `fill` draws the text into a group starting at y = 0 and returns its height;
    // the panels are then sized around it and the whole thing is centered below the header
    private layout(
        withFigure: boolean, cheering: boolean,
        fill: (group: Konva.Group, x: number, width: number) => number
    ): void {
        const height = this.size.height;
        const { x0, x1, width } = pageBox(this.size.width, withFigure ? 1180 : 860);
        const pad = 48;
        const portraitWidth = withFigure ? Math.round(Math.max(260, Math.min(380, width * 0.32))) : 0;
        const gap = withFigure ? 28 : 0;
        const panelX = x0 + portraitWidth + gap;
        const panelWidth = x1 - panelX;

        const content = new Konva.Group();
        const contentHeight = fill(content, panelX + pad, panelWidth - pad * 2);
        const areaTop = this.headerBottom + (withFigure ? 28 : 52);
        const areaBottom = height - 28;
        const panelHeight = Math.max(contentHeight + pad * 2, withFigure ? 440 : 0);
        const panelY = Math.max(areaTop, areaTop + (areaBottom - areaTop - panelHeight) / 2);
        content.y(panelY + pad + (panelHeight - pad * 2 - contentHeight) / 2);

        const backing = new Konva.Group();
        addPanel(backing, panelX, panelY, panelWidth, panelHeight);
        if (withFigure) {
            this.addPortrait(backing, x0, panelY, portraitWidth, panelHeight, cheering);
        }
        else {
            addSeal(backing, panelX + panelWidth / 2 - 30, panelY - 30, 60, "S");
        }
        this.screenGroup.add(backing, content);
        this.layer.draw();
    }

    private addLabel(group: Konva.Group, text: string, x: number, y: number, width: number, centered: boolean, color: string = colors.muted): number {
        if (text === "") {
            return y;
        }
        const node = addKicker(group, text, { x, y, width, align: centered ? "center" : "left", color });
        return y + node.height() + 12;
    }

    private addTitle(group: Konva.Group, text: string, x: number, y: number, width: number, centered: boolean): number {
        const node = addText(group, text, {
            x, y, width, size: 34, font: "heading", color: colors.text, align: centered ? "center" : "left", lineHeight: 1.15,
        });
        y += node.height() + 18;
        if (centered) {
            addDivider(group, x + width / 2, y);
        }
        else {
            group.add(new Konva.Line({ points: [x, y, x + 60, y], stroke: colors.highlight, strokeWidth: 2 }));
        }
        return y + 22;
    }

    private addBody(group: Konva.Group, text: string, x: number, y: number, width: number, centered: boolean, italic: boolean = false): number {
        const node = addText(group, text, {
            x, y, width, size: 18, lineHeight: 1.55, italic, align: centered ? "center" : "left",
            color: italic ? colors.text : colors.body,
        });
        return y + node.height() + 18;
    }

    private addAction(group: Konva.Group, label: string, x: number, y: number, width: number, centered: boolean, onAction: () => void): number {
        const buttonWidth = Math.min(320, width);
        addButton(group, label, centered ? x + (width - buttonWidth) / 2 : x, y, buttonWidth, onAction, { arrow: true });
        return y + theme.button.size.height + 6;
    }

    // The audience as a row of seats: ● filled, ○ empty (read from the story text)
    private addAudience(group: Konva.Group, crowd: string, x: number, y: number, width: number): number {
        const seats = [...crowd].filter((char) => char === "●" || char === "○");
        const filled = seats.filter((seat) => seat === "●").length;
        addKicker(group, `The audience · ${filled} of ${seats.length} seats filled`, { x, y, color: colors.muted });
        y += 30;
        const spacing = Math.min(34, width / Math.max(1, seats.length));
        seats.forEach((seat, idx) => {
            const full = seat === "●";
            group.add(new Konva.Circle({
                x: x + spacing / 2 + idx * spacing, y: y + 10, radius: Math.min(11, spacing * 0.34),
                fill: full ? colors.highlight : "rgba(0,0,0,0)", stroke: full ? colors.highlight : colors.faint, strokeWidth: 1.5,
            }));
        });
        return y + 44;
    }

    // Framed portrait of Shakespeare with a nameplate under it
    private addPortrait(group: Konva.Group, x: number, y: number, width: number, height: number, cheering: boolean): void {
        addPanel(group, x, y, width, height);
        const frameX = x + 28;
        const frameY = y + 28;
        const frameWidth = width - 56;
        const frameHeight = height - 56 - 70;
        group.add(new Konva.Rect({ x: frameX, y: frameY, width: frameWidth, height: frameHeight, fill: colors.background, stroke: colors.highlight, strokeWidth: 1.5 }));
        group.add(new Konva.Rect({ x: frameX + 6, y: frameY + 6, width: frameWidth - 12, height: frameHeight - 12, stroke: colors.border, strokeWidth: 1 }));

        // The figure is drawn in a 160 x 300 box; scale it to fit the frame
        const scale = Math.min((frameWidth - 40) / 160, (frameHeight - 30) / 300);
        const figure = this.drawShakespeare(cheering);
        figure.scale({ x: scale, y: scale });
        figure.x(frameX + (frameWidth - 160 * scale) / 2);
        figure.y(frameY + frameHeight - 6 - 300 * scale);
        group.add(figure);

        addKicker(group, cheering ? "A triumph!" : "The Bard", {
            x, y: y + height - 82, width, align: "center", color: cheering ? colors.correctText : colors.highlight,
        });
        addText(group, "William Shakespeare", { x, y: y + height - 60, width, size: 20, color: colors.text, align: "center" });
    }

    // A simple Shakespeare, with raised arms when he is cheering
    private drawShakespeare(cheering: boolean): Konva.Group {
        const figure = new Konva.Group({ listening: false });
        const skin = "#d4a574";
        const hair = "#52341e";
        if (cheering) {
            figure.add(
                new Konva.Line({ points: [40, 170, 5, 110, 0, 60], stroke: skin, strokeWidth: 14, lineCap: "round", lineJoin: "round" }),
                new Konva.Line({ points: [120, 170, 155, 110, 160, 60], stroke: skin, strokeWidth: 14, lineCap: "round", lineJoin: "round" }),
            );
        }
        figure.add(
            new Konva.Line({ points: [30, 160, 130, 160, 150, 300, 10, 300], closed: true, fill: colors.accent }),
            new Konva.Line({ points: [80, 168, 80, 300], stroke: colors.highlight, strokeWidth: 2, opacity: 0.6 }),
            new Konva.Ellipse({ x: 80, y: 155, radiusX: 50, radiusY: 14, fill: colors.text }),
            new Konva.Ellipse({ x: 80, y: 90, radiusX: 38, radiusY: 48, fill: skin }),
            new Konva.Ellipse({ x: 80, y: 120, radiusX: 28, radiusY: 24, fill: hair }),
            new Konva.Arc({ x: 80, y: 80, innerRadius: 0, outerRadius: 42, angle: 180, rotation: 180, fill: hair }),
            new Konva.Circle({ x: 66, y: 88, radius: 3, fill: "#18181b" }),
            new Konva.Circle({ x: 94, y: 88, radius: 3, fill: "#18181b" }),
        );
        return figure;
    }
}
