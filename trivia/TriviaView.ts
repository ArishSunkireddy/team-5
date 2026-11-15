import Konva from "konva";
import { TriviaQuestion } from "./questions";

export class TriviaView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private progressText: Konva.Text;
    private scoreText: Konva.Text;
    private promptText: Konva.Text;
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

        // Ex: Question: x / 20 in top left corner
        this.progressText = new Konva.Text( {
            text: "Question 1 / 20",
            x: 60,
            y: 40,
            fontSize: 15,
            fill: "#a1a1aa",
        });
        this.layer.add(this.progressText);

        // Displays scores in top right corner
        this.scoreText = new Konva.Text( {
            text: "Score: 0",
            x: this.stage.width() - 180,
            y: 40, 
            fontSize: 15,
            fill: "#a1a1aa",
        });
        this.layer.add(this.scoreText);

        // For question
        this.promptText = new Konva.Text( {
            text: "",
            x: 60,
            y: 100,
            width: this.stage.width() - 120,
            fill: "#ffffff",
            lineHeight: 1.5,
        });
        this.layer.add(this.promptText);

        for (let idx = 0; idx < 4; idx++) {
            const group = new Konva.Group({x:60, y:230 + idx * 75});

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
            group.on("click", () => {
                const selectedOption = this.currentOptions[idx] ?? "";
                onSelect(selectedOption, idx);
            });

            this.optionGroups.push(group);
            this.optionBoxes.push(box);
            this.optionLabels.push(label);
            this.layer.add(group);
        }
        this.layer.draw();
    }

    // Change to next question, progress, and score
    updateQuestion(question: TriviaQuestion, num: number, total: number, score: number): void {
        this.currentOptions = question.options;
        this.progressText.text(`Question ${num} / ${total}`);
        this.scoreText.text(`Score: ${score}`);
        this.promptText.text(question.question);

        for (let idx = 0; idx < this.optionGroups.length; idx++) {
            const optionText = question.options[idx];
            if (optionText !== undefined) {
                this.optionGroups[idx].visible(true);
                this.optionLabels[idx].text(optionText);
                this.optionBoxes[idx].fill("#27272a");
            }
            else {
                this.optionGroups[idx].visible(false);
            }
        }
        this.layer.draw();
    }

    // Update Display of score
    updateScore(score: number): void {
        this.scoreText.text(`Score: ${score}`);
        this.layer.draw();
    }

    // Selected option highlights green/red for correct/incorrect
    highlight(idx: number, correct: boolean): void {
        if (this.optionBoxes[idx]) {
            this.optionBoxes[idx].fill(correct ? "#16a34a" : "#dc2626");
            this.layer.draw();
        }
    }

    // Fixes cursor per round
    destroy(): void {
        document.body.style.cursor = "default";
        this.stage.destroy();
    }
}