import Konva from "konva";
import type { MenuItem } from "./MenuModel";
import type { StoryCard } from "../shakespeare-mvc/story";

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

  renderCards(cards: StoryCard[], onDone: () => void): void {
  let i = 0;
  const show = () => {
    const card = cards[i];
    this.layer.destroyChildren();
    this.stage.container().style.cursor = "default";
    const width = this.stage.width();
    const height = this.stage.height();
    const textWidth = width * 0.76;
    let y = height * 0.12;

    this.layer.add(new Konva.Rect({ x: 0, y: 0, width, height, fill: "#18181b" }));

    const addText = (text: string, size: number, fill: string) => {
      if (text === "") return;
      const node = new Konva.Text({
        x: 60, y, width: textWidth, text,
        fontSize: size, lineHeight: 1.4, fill, align: "left",
      });
      this.layer.add(node);
      y += node.height() + 18;
    };

    addText(card.label, 16, "#a1a1aa");
    addText(card.title, 32, "#ffffff");
    addText(card.text, 20, "#e2e8f0");

    const group = new Konva.Group({ x: 60, y: y + 10 });
    const background = new Konva.Rect({ width: textWidth, height: 52, fill: "#3b82f6", cornerRadius: 10 });
    const label = new Konva.Text({
      width: textWidth, height: 52, text: card.buttonLabel,
      fontSize: 18, fill: "#ffffff", align: "center", verticalAlign: "middle",
    });
    group.add(background, label);
    group.on("mouseenter", () => { this.stage.container().style.cursor = "pointer"; background.fill("#2563eb"); this.layer.draw(); });
    group.on("mouseleave", () => { this.stage.container().style.cursor = "default"; background.fill("#3b82f6"); this.layer.draw(); });
    group.on("click tap", () => {
      this.stage.container().style.cursor = "default";
      if (++i < cards.length) show();
      else onDone();
    });
    this.layer.add(group);
    this.layer.draw();
  };
  show();
}

  renderEnd(onPlayAgain: () => void): void {
  this.layer.destroyChildren();
  this.stage.container().style.cursor = "default";
  const width = this.stage.width();
  const height = this.stage.height();

  this.layer.add(new Konva.Rect({ x: 0, y: 0, width, height, fill: "#18181b" }));

  this.layer.add(new Konva.Text({
    x: 0, y: height * 0.1, width,
    text: "BACK IN THE PRESENT", fontSize: 16, fill: "#a1a1aa", align: "center",
  }));
  this.layer.add(new Konva.Text({
    x: width * 0.12, y: height * 0.15, width: width * 0.76,
    text: "Worksheet complete!", fontSize: 32, fill: "#ffffff", align: "center",
  }));

  // Worksheet rows
  const rows: [string, string][] = [
    ["ERA", "AUTHOR"],
    ["16th Century", "Shakespeare"],
    ["19th Century", "Edgar Allan Poe"],
    ["17th Century", "Matsuo Basho"],
  ];
  const colWidth = 220;
  const tableX = (width - colWidth * 2) / 2;
  rows.forEach(([era, author], i) => {
    const header = i === 0;
    const y = height * 0.28 + i * 36;
    this.layer.add(new Konva.Text({
      x: tableX, y, width: colWidth, text: era,
      fontSize: 18, fontStyle: header ? "bold" : "normal",
      fill: header ? "#a1a1aa" : "#e2e8f0",
    }));
    this.layer.add(new Konva.Text({
      x: tableX + colWidth, y, width: colWidth, text: author,
      fontSize: 18, fontStyle: header ? "bold" : "normal",
      fill: header ? "#a1a1aa" : "#e2e8f0",
    }));
  });

  this.layer.add(new Konva.Text({
    x: width * 0.12, y: height * 0.28 + rows.length * 36 + 24, width: width * 0.76,
    text: "You traveled through time and learned so much about these authors, their eras, and the stories they shared with the world.",
    fontSize: 18, lineHeight: 1.5, fill: "#e2e8f0", align: "center",
  }));

  // Play again button (same look as the menu buttons)
  const buttonWidth = 260, buttonHeight = 52;
  const group = new Konva.Group({ x: (width - buttonWidth) / 2, y: height * 0.8 });
  const background = new Konva.Rect({ width: buttonWidth, height: buttonHeight, fill: "#3b82f6", cornerRadius: 10 });
  const label = new Konva.Text({
    width: buttonWidth, height: buttonHeight, text: "Play again",
    fontSize: 18, fill: "#ffffff", align: "center", verticalAlign: "middle",
  });
  group.add(background, label);
  group.on("mouseenter", () => { this.stage.container().style.cursor = "pointer"; background.fill("#2563eb"); this.layer.draw(); });
  group.on("mouseleave", () => { this.stage.container().style.cursor = "default"; background.fill("#3b82f6"); this.layer.draw(); });
  group.on("click tap", () => { this.stage.container().style.cursor = "default"; onPlayAgain(); });
  this.layer.add(group);

  this.layer.draw();
}
}
