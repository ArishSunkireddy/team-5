import Konva from "konva";
import type { PhraseTile } from "./data/poemChallenges";
import type { GameAction } from "./game/state";
import { shuffleTiles } from "./game/tiles";
import type { PoetryRoundInfo } from "./PoetryModel";

type Input = GameAction | { type: "finish" };
const ink = "#382b1e",
  forest = "#294b3b",
  gold = "#bf9954",
  paper = "#f3e5c7";
const margin = 30;

export class PoetryView {
  private stage: Konva.Stage;
  private layer = new Konva.Layer();
  // Native equivalents expose canvas text and controls to keyboards and assistive technology.
  private access = document.createElement("section");
  private controls = new Map<string, HTMLButtonElement>();
  private width = 0;
  private y = 0;
  private bankOrder: PhraseTile[] = [];
  private info?: PoetryRoundInfo;
  private finishLabel = "";
  private resize: ResizeObserver;

  constructor(
    private input: (action: Input) => void,
    containerID: string,
  ) {
    const container = document.getElementById(containerID)!;
    this.stage = new Konva.Stage({ container: containerID, width: 1, height: 1 });
    this.stage.add(this.layer);
    this.access.className = "poetry-access";
    this.access.setAttribute("aria-label", "Poetry Builder");
    container.prepend(this.access);
    this.resize = new ResizeObserver(() => {
      if (this.info && container.clientWidth !== this.stage.width())
        this.render(this.info, this.finishLabel);
    });
    this.resize.observe(container);
  }

  private box(x: number, y: number, width: number, height: number, fill: string, stroke?: string) {
    const rect = new Konva.Rect({
      x,
      y,
      width,
      height,
      fill,
      stroke,
      cornerRadius: 6,
      listening: false,
    });
    this.layer.add(rect);
    return rect;
  }

  private text(value: string, size = 20, color = ink, bold = false) {
    const node = new Konva.Text({
      x: margin * 2,
      y: this.y,
      width: this.width - margin * 4,
      text: value,
      align: "center",
      lineHeight: 1.18,
      fontSize: size,
      fill: color,
      fontFamily: "Georgia, serif",
      fontStyle: bold ? "bold" : "normal",
      listening: false,
    });
    this.layer.add(node);
    const caption = document.createElement("p");
    caption.textContent = value;
    this.access.append(caption);
    this.y += node.height() + 8;
  }

  private button(
    label: string,
    x: number,
    y: number,
    w: number,
    h: number,
    act: () => void,
    options: { disabled?: boolean; pale?: boolean; accessible?: string } = {},
  ) {
    const group = new Konva.Group({ x, y, opacity: options.disabled ? 0.5 : 1 });
    const frame = new Konva.Rect({
      width: w,
      height: h,
      cornerRadius: 6,
      fill: options.pale ? "#ead8af" : forest,
      stroke: gold,
      strokeWidth: 1.5,
    });
    group.add(
      frame,
      new Konva.Text({
        width: w,
        height: h,
        padding: 3,
        text: label,
        fontSize: 17,
        fontFamily: "Georgia, serif",
        fill: options.pale ? ink : paper,
        align: "center",
        verticalAlign: "middle",
      }),
    );
    this.layer.add(group);
    const native = document.createElement("button");
    const name = options.accessible ?? label;
    native.textContent = name;
    native.disabled = !!options.disabled;
    native.onclick = act;
    native.onfocus = () => {
      frame.strokeWidth(4);
      const top = this.stage.container().getBoundingClientRect().top + y * this.stage.scaleY();
      if (top < 0 || top + h * this.stage.scaleY() > window.innerHeight)
        window.scrollBy(0, top - window.innerHeight / 2);
    };
    native.onblur = () => frame.strokeWidth(1.5);
    this.access.append(native);
    this.controls.set(name, native);
    if (!native.disabled) {
      group.on("click tap", act);
      group.on("mouseenter", () => {
        this.stage.container().style.cursor = "pointer";
      });
      group.on("mouseleave", () => {
        this.stage.container().style.cursor = "";
      });
    }
    return group;
  }

  private action(label: string, act: () => void, disabled = false) {
    const w = Math.min(280, this.width - 4 * margin);
    this.button(label, (this.width - w) / 2, this.y, w, 40, act, { disabled });
    this.y += 48;
  }

  render(info: PoetryRoundInfo, finishLabel: string): void {
    const previous = this.info;
    const focused = this.access.contains(document.activeElement)
      ? document.activeElement?.textContent
      : null;
    if (
      info.screen === "game" &&
      (previous?.screen !== "game" || previous.roundIndex !== info.roundIndex)
    )
      this.bankOrder = shuffleTiles(info.challenge.tiles);
    this.info = info;
    this.finishLabel = finishLabel;
    this.layer.destroyChildren();
    this.access.replaceChildren();
    this.controls.clear();
    this.stage.container().style.cursor = "";
    const pixels = this.stage.container().clientWidth;
    this.width = Math.max(520, pixels);
    const scale = pixels / this.width;
    this.stage.scale({ x: scale, y: scale });
    this.layer.add(
      new Konva.Circle({
        x: this.width * 0.92,
        y: 150,
        radius: 110,
        stroke: gold,
        opacity: 0.2,
        listening: false,
      }),
    );
    this.layer.add(
      new Konva.Path({
        x: this.width / 2 - 155,
        y: 9,
        scaleX: 0.85,
        scaleY: 0.85,
        data: "M34.5 4.8c-9 2-17.2 8.9-20.1 18.4l-2.8 9.1 7.4-5.8c7.7-6 13.5-13.1 15.5-21.7ZM7.5 37c5.8-9.1 12.6-17.1 21-24",
        stroke: gold,
        listening: false,
      }),
    );
    this.y = 12;
    this.text("THE POET’S TRAIL", 23, paper, true);
    this.text("Literary Expedition · Side Quest     ◆     CHAPTER IV · THE VERSE ROAD", 15, paper);
    if (info.screen !== "intro")
      this.action("‹ Return to Introduction", () => this.returnToIntro());
    const step = info.screen === "intro" ? 1 : info.screen === "game" ? 2 : 3;
    this.text(
      ["LEARN", "BUILD", "REFLECT"]
        .map((name, i) => (i + 1 === step ? "◆ " : "") + name)
        .join("     ·     "),
      15,
      gold,
    );
    const top = this.y;
    const card = this.box(margin, top, this.width - margin * 2, 1, paper, gold);
    this.y += 22;
    switch (info.screen) {
      case "intro":
        this.intro(info.totalRounds);
        break;
      case "game":
        this.board(info);
        break;
      case "feedback":
        this.feedback(info);
        break;
      case "final":
        this.final(info);
        break;
    }
    card.height(this.y - top + 10);
    card.shadowColor("#0b1711").shadowBlur(12).shadowOffsetY(3).shadowOpacity(0.45);
    this.layer.add(
      new Konva.Path({
        x: margin + 6,
        y: top + 6,
        data: "M7 77C17 54 33 33 77 7M9 57c15-1 25 5 30 17M28 36c13 0 21 5 27 15M50 20c8 2 13 7 15 15",
        scaleX: 0.65,
        scaleY: 0.65,
        stroke: gold,
        listening: false,
      }),
    );
    this.y += 24;
    this.text("THE POET’S TRAIL · FIELD EDITION 1847", 14, gold);
    const mountains = new Konva.Line({
      points: [
        0,
        this.y - 105,
        this.width * 0.17,
        this.y - 265,
        this.width * 0.5,
        this.y - 45,
        this.width * 0.86,
        this.y - 290,
        this.width,
        this.y - 165,
        this.width,
        this.y,
        0,
        this.y,
      ],
      closed: true,
      fill: "#11251c",
      listening: false,
    });
    this.layer.add(mountains);
    mountains.moveToBottom();
    this.stage.size({ width: pixels, height: Math.ceil(this.y * scale) });
    this.layer.draw();
    if (focused)
      (this.controls.get(focused) ?? [...this.controls.values()].find((b) => !b.disabled))?.focus();
    if (previous && previous.screen !== info.screen) window.scrollTo(0, 0);
  }

  private returnToIntro() {
    if (window.confirm("Return to the introduction? Your current progress will be reset."))
      this.input({ type: "return" });
  }

  private intro(total: number) {
    this.text(total + "-ROUND SIDE QUEST", 15, forest);
    this.text("Poetry Builder", 46, ink, true);
    this.text("Iambic Pentameter", 25);
    this.text("◆", 17, gold);
    this.text("Listen for the heartbeat of a poem.", 24, forest, true);
    this.text(
      "An iamb is a pair of syllables: one soft, then one strong. Poets call this an unstressed–stressed pattern.",
    );
    this.text(
      "Iambic pentameter places five of these pairs in one line—ten syllables marching in a steady rhythm.",
    );
    this.text("TAP THE BEAT", 15, forest);
    this.text("da-DUM · da-DUM · da-DUM · da-DUM · da-DUM", 21, forest, true);
    this.text("YOUR QUEST", 15, forest);
    this.text(
      "Build " +
        total +
        " lines of verse by arranging each set of five phrase tiles into a meaningful sentence. Answers are checked against reviewed arrangements, not automatic meter analysis.",
    );
    this.action("Start Side Quest", () => this.input({ type: "start" }));
  }

  private board(info: PoetryRoundInfo) {
    const { challenge, roundIndex, slots, score, totalRounds } = info;
    this.text("ROUND " + (roundIndex + 1) + " · " + challenge.trailName.toUpperCase(), 15, forest);
    this.text("Build the line", 36, ink, true);
    this.text("Place one two-syllable phrase in each space.");
    this.text(
      "ROUND " + (roundIndex + 1) + "/" + totalRounds + "     ·     SCORE " + score,
      18,
      forest,
      true,
    );
    this.text("RHYTHM GUIDE     ·     soft → strong", 15, forest);
    this.text(challenge.feet.map(() => "da-DUM").join("   ·   "), 20, forest, true);
    const left = margin + 12,
      gap = 6,
      h = 56;
    const width = (this.width - 2 * left - gap * (slots.length - 1)) / slots.length;
    const xAt = (i: number) => left + i * (width + gap);
    const slotY = this.y;
    this.y += h + 16;
    const bankTop = this.y;
    const bankFrame = this.box(
      left - 4,
      bankTop - 3,
      this.width - 2 * left + 8,
      1,
      "#efdfbc",
      gold,
    );
    this.text("PHRASE TILES", 16, forest, true);
    this.text("Drag tiles into the line or back here; click a tile for an alternative.", 17);
    const bankY = this.y;
    bankFrame.height(bankY + h - bankTop + 8);
    const targets = slots.map((_, i) => this.box(xAt(i), slotY, width, h, "#e4ce9f", gold));
    const targetAt = (point: { x: number; y: number }) =>
      point.y >= slotY && point.y <= slotY + h
        ? slots.findIndex((_, i) => point.x >= xAt(i) && point.x <= xAt(i) + width)
        : -1;
    const overBank = (point: { x: number; y: number }) =>
      point.y >= bankTop && point.y <= bankY + h && point.x >= left && point.x <= this.width - left;
    const attachDrag = (group: Konva.Group, id: string, source: number) => {
      const home = group.position();
      group.draggable(true);
      group.on("dragstart", () => group.moveToTop());
      group.on("dragmove", () => {
        const point = this.layer.getRelativePointerPosition();
        if (!point) return;
        const target = targetAt(point);
        targets.forEach((rect, i) => rect.strokeWidth(i === target ? 6 : 1));
        bankFrame.strokeWidth(source >= 0 && overBank(point) ? 5 : 1);
      });
      group.on("dragend", () => {
        const pointer = this.layer.getRelativePointerPosition();
        group.position(home);
        if (!pointer) return;
        targets.forEach((rect) => rect.strokeWidth(1));
        bankFrame.strokeWidth(1);
        const index = targetAt(pointer);
        if (index >= 0) this.input({ type: "place", id, index });
        else if (source >= 0 && overBank(pointer)) {
          this.input({ type: "remove", index: source });
        }
      });
    };
    slots.forEach((id, i) => {
      const tile = challenge.tiles.find((t) => t.id === id);
      const group = this.button(
        i + 1 + "\n" + (tile?.text ?? "drop phrase"),
        xAt(i),
        slotY,
        width,
        h,
        () => {
          if (tile) this.input({ type: "remove", index: i });
        },
        {
          pale: true,
          accessible: tile ? tile.text + ", click to remove" : "Empty position " + (i + 1),
        },
      );
      if (tile) attachDrag(group, tile.id, i);
    });
    const unused = this.bankOrder.filter((tile) => !slots.includes(tile.id));
    unused.forEach((tile, i) => {
      const group = this.button(
        tile.text + "\nda-DUM",
        xAt(i),
        bankY,
        width,
        h,
        () => {
          this.input({ type: "place", id: tile.id, index: slots.indexOf(null) });
          this.controls.get(tile.text + ", click to remove")?.focus({ preventScroll: true });
        },
        { accessible: tile.text },
      );
      attachDrag(group, tile.id, -1);
    });
    if (!unused.length) this.text("All phrases are on the line. Check your work.", 18);
    this.y = bankY + h + 12;
    this.action("Reset Line", () => {
      if (slots.some(Boolean) && window.confirm("Clear the phrases from this line?"))
        this.input({ type: "reset-line" });
    });
    this.action("Check Answer", () => this.input({ type: "check" }), !info.canCheck);
  }

  private feedback(info: PoetryRoundInfo) {
    const { result, challenge, slots, roundIndex, totalRounds, score } = info;
    const correct = result === "success";
    this.text("ROUND " + (roundIndex + 1) + "/" + totalRounds + " · SCORE " + score, 16, forest);
    this.text(correct ? "✓" : "?", 40, forest);
    this.text(correct ? "THE PATH IS CLEAR" : "A TWIST IN THE ROAD", 16, forest);
    this.text(correct ? "A line well measured!" : "Nearly there, poet.", 34, ink, true);
    if (correct) {
      this.text(
        "Your line matches one of the reviewed meaningful arrangements of these five iambic phrases.",
      );
      const feet = slots.map((id) => challenge.feet[challenge.correctAnswer.indexOf(id!)]);
      const footWidth = (this.width - 2 * margin - 24) / feet.length;
      feet.forEach((foot, index) => {
        const style = {
          x: margin + 12 + index * footWidth,
          width: footWidth,
          align: "center",
          fontSize: 20,
          fontFamily: "Georgia, serif",
          fill: forest,
          listening: false,
        };
        this.layer.add(
          new Konva.Text({ ...style, y: this.y, text: foot.unstressed }),
          new Konva.Text({ ...style, y: this.y + 24, text: foot.stressed, fontStyle: "bold" }),
        );
      });
      const line = document.createElement("p");
      line.textContent = feet.map((f) => f.unstressed + " " + f.stressed).join(" · ");
      this.access.append(line);
      this.y += 56;
      this.text("Why it works", 22, ink, true);
      this.text(
        "Lowercase syllables are unstressed; bold capitals are stressed. Read each foot as da-DUM, five times.",
      );
    } else {
      this.text(
        "This order does not match a reviewed arrangement. Keep related phrases together, then try again or continue.",
      );
      this.text("Try this clue", 22, ink, true);
      this.text("Hint: " + challenge.hint);
      this.action("Try Again", () => this.input({ type: "retry" }));
    }
    this.action(roundIndex + 1 === totalRounds ? "View Final Results" : "Next Round", () =>
      this.input({ type: "next" }),
    );
  }

  private final({ score, totalRounds, strongFinish }: PoetryRoundInfo) {
    this.text("SIDE QUEST COMPLETE", 16, forest);
    this.text(
      strongFinish ? "Master of the measured line" : "The poet’s trail continues",
      34,
      ink,
      true,
    );
    this.text(
      "You completed all " +
        totalRounds +
        " poetry challenges and scored " +
        score +
        " out of " +
        totalRounds +
        ".",
    );
    this.text(score + " / " + totalRounds, 42, forest, true);
    this.text("LINES BUILT CORRECTLY", 16, forest);
    this.text(
      strongFinish ? "A steady poetic stride" : "Keep listening for the beat",
      24,
      ink,
      true,
    );
    this.text(
      strongFinish
        ? "You built meaningful lines from phrases that model the unstressed–stressed pulse of iambic pentameter."
        : "Read verse aloud and tap out five da-DUM pairs. Each attempt makes the meter easier to hear.",
    );
    this.action(this.finishLabel, () => this.input({ type: "finish" }));
    this.action("Return to Introduction", () => this.returnToIntro());
  }

  destroy() {
    this.resize.disconnect();
    this.access.remove();
    this.stage.destroy();
  }
}
