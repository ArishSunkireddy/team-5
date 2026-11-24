import Konva from "konva";
import type { JournalPage, MenuItem, WorksheetRow } from "./MenuModel";
import { theme } from "./theme";
import type { StoryCard } from "../shakespeare-mvc/story";
import { addButton as addThemedButton, addDivider, addKicker, addPanel, addSeal, addText } from "./konvaUi";

const { colors, fonts } = theme;

export interface JournalHandlers {
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
}

// Styled to match BashoView / PoeView: full-window stage, dark background, blue buttons
export class MenuView {
  private stage: Konva.Stage;
  private layer = new Konva.Layer();
  private keyHandler: ((event: KeyboardEvent) => void) | null = null;

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
    worksheet?: WorksheetRow[]
  ): void {
    this.clear();
    const width = this.stage.width();
    const height = this.stage.height();

    const buttonWidth = theme.button.size.width;
    const buttonsHeight = (items.length - 1) * theme.button.spacing + theme.button.size.height;

    if (!worksheet) {
      this.addTitle(title, height * 0.15);
      this.addButtons(items, onSelect, (width - buttonWidth) / 2, height * 0.32);
    }
    else if (width >= 1000) {
      // Wide window: buttons on the left, worksheet beside them
      this.addTitle(title, height * 0.08);
      const gap = 40;
      const panelWidth = Math.min(680, width - buttonWidth - gap - 120);
      const left = (width - buttonWidth - gap - panelWidth) / 2;
      const top = height * 0.2;
      this.addButtons(items, onSelect, left, top);
      this.addWorksheet(worksheet, left + buttonWidth + gap, top, panelWidth, height - top - 16);
    }
    else {
      // Narrow window: worksheet under the buttons
      this.addTitle(title, height * 0.05);
      const top = height * 0.05 + theme.size(56);
      this.addButtons(items, onSelect, (width - buttonWidth) / 2, top);
      const panelTop = top + buttonsHeight + 24;
      const panelWidth = Math.min(760, width - 40);
      this.addWorksheet(worksheet, (width - panelWidth) / 2, panelTop, panelWidth, height - panelTop - 16);
    }

    this.layer.draw();
  }

  // One page of the notesheet, with arrows to the neighboring authors
  renderJournal(title: string, page: JournalPage, handlers: JournalHandlers): void {
    this.clear();
    const width = this.stage.width();
    const height = this.stage.height();

    this.addTitle(title, height * 0.04);

    this.layer.add(new Konva.Text({
      fontFamily: fonts.body,
      x: 0, y: height * 0.04 + theme.size(44), width,
      text: page.unlocked ? page.era.toUpperCase() : "LOCKED",
      fontSize: theme.size(13), letterSpacing: 2, fill: page.unlocked ? colors.highlight : colors.dim, align: "center",
    }));
    this.layer.add(new Konva.Text({
      fontFamily: fonts.heading,
      x: 0, y: height * 0.04 + theme.size(64), width,
      text: page.name, fontSize: theme.size(26), fill: page.unlocked ? colors.text : colors.muted, align: "center",
    }));
    this.layer.add(new Konva.Text({
      fontFamily: fonts.body,
      x: 0, y: height * 0.04 + theme.size(98), width,
      text: `Page ${page.pageNumber} / ${page.totalPages}`, fontSize: theme.size(13), fill: colors.muted, align: "center",
    }));

    // Notesheet panel between the arrows and above the Back button
    const sideRoom = 90;
    const panelX = sideRoom;
    const panelY = height * 0.04 + theme.size(126);
    const panelWidth = width - sideRoom * 2;
    const backY = height - theme.button.size.height - 20;
    const panelHeight = Math.max(80, backY - 16 - panelY);

    this.layer.add(new Konva.Rect({
      x: panelX, y: panelY, width: panelWidth, height: panelHeight, fill: colors.panel, cornerRadius: theme.radius.panel,
    }));

    if (page.unlocked) {
      this.addFacts(page.facts, panelX + 24, panelY + 20, panelWidth - 48, panelHeight - 40);
    }
    else {
      this.layer.add(new Konva.Text({
        fontFamily: fonts.body,
        x: panelX + 24, y: panelY + panelHeight / 2 - 30, width: panelWidth - 48,
        text: `These pages are still blank.\nFinish ${page.name}'s story to unlock your notes.`,
        fontSize: theme.size(18), lineHeight: 1.6, fill: colors.muted, align: "center",
      }));
    }

    const arrowY = panelY + panelHeight / 2 - 24;
    if (page.hasPrev) {
      this.addArrow("‹", (sideRoom - theme.radius.round * 2) / 2, arrowY, handlers.onPrev);
    }
    if (page.hasNext) {
      this.addArrow("›", width - sideRoom + (sideRoom - theme.radius.round * 2) / 2, arrowY, handlers.onNext);
    }

    this.addButton("Back", (width - theme.button.size.width) / 2, backY, theme.button.size.width, handlers.onBack);

    // Left/right arrow keys turn pages too
    this.keyHandler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && page.hasPrev) {
        handlers.onPrev();
      }
      else if (event.key === "ArrowRight" && page.hasNext) {
        handlers.onNext();
      }
    };
    window.addEventListener("keydown", this.keyHandler);

    this.layer.draw();
  }

  // Story cards shown one after another (the time-travel intro). onDone runs after the last button
  renderCards(cards: StoryCard[], onDone: () => void): void {
    let index = 0;
    const show = () => {
      const card = cards[index];
      this.clear();
      const width = this.stage.width();
      const height = this.stage.height();
      const cardWidth = Math.min(760, width - 80);
      const cardX = (width - cardWidth) / 2;
      const cx = width / 2;

      // Content first, so the card can be sized and centered around it
      const content = new Konva.Group();
      let y = 60;
      const label = addKicker(content, card.label, { x: cardX, y, width: cardWidth, align: "center" });
      y += label.height() + 14;
      const title = addText(content, card.title, {
        x: cardX + 50, y, width: cardWidth - 100, size: 38, font: "heading", color: theme.colors.text, align: "center", lineHeight: 1.15,
      });
      y += title.height() + 20;
      addDivider(content, cx, y);
      y += 26;
      const body = addText(content, card.text, {
        x: cardX + 70, y, width: cardWidth - 140, size: 18, lineHeight: 1.6, align: "center",
      });
      y += body.height() + 30;
      addThemedButton(content, card.buttonLabel, cx - 160, y, 320, () => {
        index++;
        if (index < cards.length) {
          show();
        }
        else {
          onDone();
        }
      }, { arrow: true });
      y += theme.button.size.height + 22;
      // "1 of 2" so players know how many cards are left
      const step = addText(content, `${index + 1} of ${cards.length}`, {
        x: cardX, y, width: cardWidth, size: 12, color: theme.colors.dim, align: "center", letterSpacing: 2, caps: true,
      });
      y += step.height() + 40;

      const cardY = Math.max(50, (height - y) / 2);
      content.y(cardY);
      const backing = new Konva.Group();
      addPanel(backing, cardX, cardY, cardWidth, y);
      addSeal(backing, cx - 30, cardY - 30, 60, "O");
      this.layer.add(backing, content);
      this.layer.draw();
    };
    show();
  }

  renderEnd(onPlayAgain: () => void): void {
  this.clear();
  const width = this.stage.width();
  const height = this.stage.height();

  this.layer.add(new Konva.Text({
    fontFamily: fonts.body,
    x: 0, y: height * 0.1, width,
    text: "BACK IN THE PRESENT", fontSize: theme.size(16), fill: colors.muted, align: "center",
  }));
  this.layer.add(new Konva.Text({
    fontFamily: fonts.body,
    x: width * 0.12, y: height * 0.15, width: width * 0.76,
    text: "Worksheet complete!", fontSize: theme.size(32), fill: colors.text, align: "center",
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
    const y = height * 0.28 + i * theme.size(36);
    this.layer.add(new Konva.Text({
      fontFamily: fonts.body,
      x: tableX, y, width: colWidth, text: era,
      fontSize: theme.size(18), fontStyle: header ? "bold" : "normal",
      fill: header ? colors.muted : colors.body,
    }));
    this.layer.add(new Konva.Text({
      fontFamily: fonts.body,
      x: tableX + colWidth, y, width: colWidth, text: author,
      fontSize: theme.size(18), fontStyle: header ? "bold" : "normal",
      fill: header ? colors.muted : colors.body,
    }));
  });

  this.layer.add(new Konva.Text({
    fontFamily: fonts.body,
    x: width * 0.12, y: height * 0.28 + rows.length * theme.size(36) + 24, width: width * 0.76,
    text: "You traveled through time and learned so much about these authors, their eras, and the stories they shared with the world.",
    fontSize: theme.size(18), lineHeight: 1.5, fill: colors.body, align: "center",
  }));

  // Play again button (same look as the menu buttons)
  this.addButton("Play again", (width - theme.button.size.width) / 2, height * 0.8, theme.button.size.width, onPlayAgain);

  this.layer.draw();
}

  // Wipes the screen, drops any old key listener, and paints the background
  private clear(): void {
    if (this.keyHandler) {
      window.removeEventListener("keydown", this.keyHandler);
      this.keyHandler = null;
    }
    this.layer.destroyChildren();
    this.stage.container().style.cursor = "default";
    this.layer.add(new Konva.Rect({
      x: 0, y: 0, width: this.stage.width(), height: this.stage.height(), fill: colors.background,
    }));
  }

  private addTitle(title: string, y: number): void {
    const width = this.stage.width();
    this.layer.add(new Konva.Text({
      x: width * 0.12, y, width: width * 0.76, text: title, ...theme.text.title, align: "center",
    }));
  }

  // Same button as the games use. "Back" buttons are outlined so the way forward stands out
  private addButton(label: string, x: number, y: number, buttonWidth: number, onClick: () => void): void {
    addThemedButton(this.layer, label, x, y, buttonWidth, onClick, { variant: label === "Back" ? "ghost" : "primary" });
  }

  private addArrow(symbol: string, x: number, y: number, onClick: () => void): void {
    const size = theme.radius.round * 2;
    const group = new Konva.Group({ x, y });
    const background = new Konva.Rect({ width: size, height: size, fill: colors.accent, cornerRadius: theme.radius.round });
    const text = new Konva.Text({
      fontFamily: fonts.body,
      width: size, height: size, text: symbol, fontSize: theme.size(30), fill: colors.text, align: "center", verticalAlign: "middle",
    });
    group.add(background, text);
    this.addHover(group, background);
    group.on("click tap", onClick);
    this.layer.add(group);
  }

  private addHover(group: Konva.Group, background: Konva.Rect): void {
    group.on("mouseenter", () => {
      this.stage.container().style.cursor = "pointer";
      background.fill(colors.accentHover);
      this.layer.draw();
    });
    group.on("mouseleave", () => {
      this.stage.container().style.cursor = "default";
      background.fill(colors.accent);
      this.layer.draw();
    });
  }

  // A column of menu buttons starting at (x, y)
  private addButtons(items: MenuItem[], onSelect: (item: MenuItem) => void, x: number, y: number): void {
    items.forEach((item, i) => {
      this.addButton(item.label, x, y + i * theme.button.spacing, theme.button.size.width, () => onSelect(item));
    });
  }

  // The worksheet on the story picker: one row per author, blank until finished.
  // Shrinks the text until it fits the space left on screen.
  private addWorksheet(rows: WorksheetRow[], panelX: number, top: number, panelWidth: number, available: number): void {
    const pad = 18;
    const nameWidth = Math.min(theme.size(190), panelWidth * 0.32);
    const textWidth = panelWidth - pad * 2 - nameWidth - 12;

    let nodes: Konva.Shape[] = [];
    let panelHeight = 0;
    for (let fontSize = theme.size(15); fontSize >= 10; fontSize--) {
      nodes = [];
      let y = top + pad;
      nodes.push(new Konva.Text({
        fontFamily: fonts.body,
        x: panelX + pad, y, width: panelWidth - pad * 2,
        text: "WORKSHEET · MATCH EACH AUTHOR TO THEIR ERA", fontSize: theme.size(12), letterSpacing: 1.5, fill: colors.muted,
      }));
      y += theme.size(26);

      rows.forEach((row, i) => {
        if (i > 0) {
          nodes.push(new Konva.Line({
            points: [panelX + pad, y - 7, panelX + panelWidth - pad, y - 7], stroke: colors.border, strokeWidth: 1,
          }));
        }
        const done = row.text !== undefined;
        const name = new Konva.Text({
          fontFamily: fonts.body,
          x: panelX + pad, y, width: nameWidth,
          text: done ? `${row.name}\n${row.era}` : row.name,
          fontSize: fontSize + 1, lineHeight: 1.35, fontStyle: "bold",
          fill: done ? colors.text : colors.dim,
        });
        // An unfinished author gets blank lines, like an empty worksheet
        const body = new Konva.Text({
          fontFamily: fonts.body,
          x: panelX + pad + nameWidth + 12, y, width: textWidth,
          text: done ? row.text! : "_______________________________\nFinish this author's story to fill in this line.",
          fontSize, lineHeight: 1.35, fontStyle: done ? "normal" : "italic",
          fill: done ? colors.body : colors.faint,
        });
        nodes.push(name, body);
        y += Math.max(name.height(), body.height()) + 14;
      });

      panelHeight = y - top - 14 + pad;
      if (panelHeight <= available) {
        break;
      }
    }

    this.layer.add(new Konva.Rect({
      x: panelX, y: top, width: panelWidth, height: panelHeight, fill: colors.panel, cornerRadius: theme.radius.panel,
    }));
    nodes.forEach((node) => this.layer.add(node));
  }

  // Bullet list of facts, in two columns on wide screens. Shrinks the text until it fits
  private addFacts(facts: string[], x: number, y: number, areaWidth: number, areaHeight: number): void {
    const columns = areaWidth >= 700 ? 2 : 1;
    const gap = 32;
    const columnWidth = (areaWidth - gap * (columns - 1)) / columns;
    const perColumn = Math.ceil(facts.length / columns);

    let nodes: Konva.Text[] = [];
    for (let fontSize = theme.size(17); fontSize >= 10; fontSize--) {
      nodes = [];
      let tallest = 0;
      for (let column = 0; column < columns; column++) {
        let cursor = y;
        for (const fact of facts.slice(column * perColumn, (column + 1) * perColumn)) {
          const node = new Konva.Text({
            fontFamily: fonts.body,
            x: x + column * (columnWidth + gap), y: cursor, width: columnWidth,
            text: `•  ${fact}`, fontSize, lineHeight: 1.35, fill: colors.body,
          });
          nodes.push(node);
          cursor += node.height() + fontSize * 0.55;
        }
        tallest = Math.max(tallest, cursor - y);
      }
      if (tallest <= areaHeight) {
        break;
      }
    }
    nodes.forEach((node) => this.layer.add(node));
  }
}
