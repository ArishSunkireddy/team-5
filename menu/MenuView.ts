import Konva from "konva";
import type { MenuItem } from "./MenuModel";

// Styled to match BashoView / PoeView: full-window stage, dark background, blue buttons
export class MenuView {
  private stage: Konva.Stage;
  private layer = new Konva.Layer();

  constructor(containerId: string = "container") {
    this.stage = new Konva.Stage({
      container: containerId,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.stage.add(this.layer);
  }

  render(
    title: string,
    items: MenuItem[],
    onSelect: (item: MenuItem) => void,
    placeholder?: string
  ): void {
    this.layer.destroyChildren();
    this.stage.container().style.cursor = "default";
    const width = this.stage.width();
    const height = this.stage.height();

    this.layer.add(
      new Konva.Rect({ x: 0, y: 0, width, height, fill: "#18181b" })
    );

    this.layer.add(
      new Konva.Text({
        x: width * 0.12,
        y: height * 0.15,
        width: width * 0.76,
        text: title,
        fontSize: 32,
        fill: "#ffffff",
        align: "center",
      })
    );

    let startY = height * 0.32;
    if (placeholder) {
      this.layer.add(
        new Konva.Text({
          x: 0,
          y: height * 0.3,
          width,
          text: placeholder,
          fontSize: 18,
          fill: "#a1a1aa",
          align: "center",
        })
      );
      startY = height * 0.45;
    }

    const buttonWidth = 260;
    const buttonHeight = 52;

    items.forEach((item, i) => {
      const group = new Konva.Group({
        x: (width - buttonWidth) / 2,
        y: startY + i * 72,
      });
      const background = new Konva.Rect({
        width: buttonWidth,
        height: buttonHeight,
        fill: "#3b82f6",
        cornerRadius: 10,
      });
      const label = new Konva.Text({
        width: buttonWidth,
        height: buttonHeight,
        text: item.label,
        fontSize: 18,
        fill: "#ffffff",
        align: "center",
        verticalAlign: "middle",
      });
      group.add(background, label);

      group.on("mouseenter", () => {
        this.stage.container().style.cursor = "pointer";
        background.fill("#2563eb");
        this.layer.draw();
      });
      group.on("mouseleave", () => {
        this.stage.container().style.cursor = "default";
        background.fill("#3b82f6");
        this.layer.draw();
      });
      group.on("click tap", () => {
        this.stage.container().style.cursor = "default";
        onSelect(item);
      });

      this.layer.add(group);
    });

    this.layer.draw();
  }
}