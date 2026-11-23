import Konva from "konva";
import { StoryCard, StoryResult, StoryRound } from "./story";

// The only file that touches Konva. It draws whatever screen the controller asks for
export class ShakespeareView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private screenGroup: Konva.Group;

    constructor(containerId: string = "container") {
        this.stage = new Konva.Stage({
            container: containerId,
            width: window.innerWidth,
            height: window.innerHeight,
        });
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: this.stage.width(),
            height: this.stage.height(),
            fill: "#18181b",
        });
        this.screenGroup = new Konva.Group();
        this.layer.add(bg, this.screenGroup);
        this.layer.draw();
    }

    // A full-screen story card with a title, text, and one button
    showCard(card: StoryCard, onAction: () => void): void {
        this.clear();
        const width = this.textWidth(card.figure === true);
        let y = this.stage.height() * 0.12;

        y = this.addText(card.label, y, width, 16, "#a1a1aa");
        if (card.speaker !== undefined) {
            y = this.addText(card.speaker, y, width, 16, "#fbbf24");
        }
        y = this.addText(card.title, y, width, 32, "#ffffff");
        y = this.addText(card.text, y, width, 20, "#e2e8f0");
        if (card.dialogue !== undefined) {
            y = this.addText(card.dialogue, y, width, 20, "#e2e8f0", "italic");
        }
        if (card.extra !== undefined) {
            y = this.addText(card.extra, y, width, 18, "#fbbf24");
        }
        this.addButton(card.buttonLabel, y + 10, width, onAction);
        if (card.figure === true) {
            this.addShakespeare(false);
        }
        this.layer.draw();
    }

    // The question for a round, with one button per story Shakespeare could tell
    showChoice(round: StoryRound, onChoose: (choiceIdx: number) => void): void {
        this.clear();
        const width = this.textWidth(true);
        let y = this.stage.height() * 0.12;

        y = this.addText(round.speaker, y, width, 16, "#fbbf24");
        y = this.addText(round.question, y, width, 32, "#ffffff");
        y = this.addText(round.dialogue, y, width, 20, "#e2e8f0");
        round.choices.forEach((choice, idx) => {
            y = this.addButton(choice.title, y + 10, width, () => onChoose(idx));
        });
        this.addShakespeare(false);
        this.layer.draw();
    }

    // What happened on opening night. Shakespeare cheers when the choice was the successful one
    showResult(result: StoryResult, success: boolean, onAction: () => void): void {
        this.clear();
        const width = this.textWidth(true);
        let y = this.stage.height() * 0.12;

        y = this.addText(result.label, y, width, 16, "#fbbf24");
        y = this.addText(result.title, y, width, 32, "#ffffff");
        y = this.addText(result.text, y, width, 20, "#e2e8f0");
        y = this.addText(result.crowd, y, width, 20, "#fbbf24");
        this.addButton("Continue", y + 10, width, onAction);
        this.addShakespeare(success);
        this.layer.draw();
    }

    destroy(): void {
        document.body.style.cursor = "default";
        this.stage.destroy();
    }

    private clear(): void {
        this.screenGroup.destroyChildren();
    }

    // Text fills the screen, leaving room on the right when Shakespeare is drawn
    private textWidth(withFigure: boolean): number {
        const width = this.stage.width();
        return withFigure ? Math.max(200, width * 0.7 - 120) : width * 0.76;
    }

    // Adds centered text at y and returns the y just below it
    private addText(text: string, y: number, width: number, fontSize: number, fill: string, fontStyle: string = "normal"): number {
        if (text === "") {
            return y;
        }
        const node = new Konva.Text({
            x: 60,
            y,
            width,
            text,
            fontSize,
            fontStyle,
            lineHeight: 1.4,
            fill,
            align: "left",
        });
        this.screenGroup.add(node);
        return y + node.height() + 18;
    }

    // Adds a clickable button at y and returns the y just below it
    private addButton(label: string, y: number, width: number, onClick: () => void): number {
        const height = 52;
        const group = new Konva.Group({ x: 60, y });
        const box = new Konva.Rect({ width, height, fill: "#3b82f6", cornerRadius: 10 });
        const text = new Konva.Text({
            width,
            height,
            text: label,
            fontSize: 18,
            fill: "#ffffff",
            align: "center",
            verticalAlign: "middle",
        });
        group.add(box, text);
        group.on("mouseenter", () => {
            document.body.style.cursor = "pointer";
            box.fill("#2563eb");
            this.layer.draw();
        });
        group.on("mouseleave", () => {
            document.body.style.cursor = "default";
            box.fill("#3b82f6");
            this.layer.draw();
        });
        group.on("click tap", () => {
            document.body.style.cursor = "default";
            onClick();
        });
        this.screenGroup.add(group);
        return y + height + 14;
    }

    // A simple Shakespeare on the right of the screen, with raised arms when he is cheering
    private addShakespeare(cheering: boolean): void {
        const x = this.stage.width() - 200;
        const y = Math.max(60, this.stage.height() * 0.2);
        const figure = new Konva.Group({ x, y });

        if (cheering) {
            figure.add(
                new Konva.Line({ points: [40, 170, 5, 110, 0, 60], stroke: "#d4a574", strokeWidth: 14, lineCap: "round", lineJoin: "round" }),
                new Konva.Line({ points: [120, 170, 155, 110, 160, 60], stroke: "#d4a574", strokeWidth: 14, lineCap: "round", lineJoin: "round" }),
            );
        }
        figure.add(
            new Konva.Line({ points: [30, 160, 130, 160, 150, 300, 10, 300], closed: true, fill: "#3f3f46" }),
            new Konva.Ellipse({ x: 80, y: 155, radiusX: 50, radiusY: 14, fill: "#f4f4f5" }),
            new Konva.Ellipse({ x: 80, y: 90, radiusX: 38, radiusY: 48, fill: "#d4a574" }),
            new Konva.Ellipse({ x: 80, y: 120, radiusX: 28, radiusY: 24, fill: "#52341e" }),
            new Konva.Arc({ x: 80, y: 80, innerRadius: 0, outerRadius: 42, angle: 180, rotation: 180, fill: "#52341e" }),
            new Konva.Circle({ x: 66, y: 88, radius: 3, fill: "#18181b" }),
            new Konva.Circle({ x: 94, y: 88, radius: 3, fill: "#18181b" }),
        );
        this.screenGroup.add(figure);
    }
}
