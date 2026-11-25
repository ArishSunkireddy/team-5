import Konva from "konva";
import { theme } from "./theme";

// Shared building blocks for every Konva screen, so the menu and all the games look like
// one book. Each helper draws into a Konva.Group or Konva.Layer and returns what it made.

const { colors, fonts } = theme;

type Parent = Konva.Group | Konva.Layer;

// ---------------------------------------------------------------------------------------
// Page layout
// ---------------------------------------------------------------------------------------

export interface PageBox {
  x0: number;      // Left edge of the content
  x1: number;      // Right edge of the content
  width: number;   // x1 - x0
}

// Content is centered and capped so very wide windows don't stretch everything thin
export function pageBox(stageWidth: number, maxWidth: number = 1320): PageBox {
  const margin = Math.max(24, Math.min(72, stageWidth * 0.04));
  const width = Math.min(maxWidth, stageWidth - margin * 2);
  const x0 = (stageWidth - width) / 2;
  return { x0, x1: x0 + width, width };
}

// The size game screens are laid out for. Smaller windows get the same layout shrunk to fit
// (rather than squeezed until text overlaps); bigger ones get it enlarged, up to MAX_SCALE.
export const DESIGN_SIZE = { width: 1200, height: 880 };
const MAX_SCALE = 1.3;

// Scales the layer to the window and returns the size to lay the screen out at
export function fitToWindow(stage: Konva.Stage, layer: Konva.Layer): { width: number; height: number } {
  const scale = Math.min(MAX_SCALE, stage.width() / DESIGN_SIZE.width, stage.height() / DESIGN_SIZE.height);
  layer.scale({ x: scale, y: scale });
  return { width: stage.width() / scale, height: stage.height() / scale };
}

export function addBackground(parent: Parent, width: number, height: number): Konva.Rect {
  const bg = new Konva.Rect({ x: 0, y: 0, width, height, fill: colors.background, listening: false });
  parent.add(bg);
  return bg;
}

// ---------------------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------------------

export interface TextOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  size?: number;             // Unscaled px. theme.size() is applied, so textScale affects it
  font?: "heading" | "body";
  color?: string;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  italic?: boolean;
  bold?: boolean;
  lineHeight?: number;
  letterSpacing?: number;
  caps?: boolean;
}

export function addText(parent: Parent, text: string, options: TextOptions = {}): Konva.Text {
  // Helvetica Punk's "…" and long dashes are blank, so headings spell them out
  if (options.font === "heading") {
    text = text.replace(/…/g, "...").replace(/[–—]/g, "-");
  }
  const fontStyle = [options.italic ? "italic" : "", options.bold ? "bold" : ""].join(" ").trim() || "normal";
  const node = new Konva.Text({
    x: options.x ?? 0,
    y: options.y ?? 0,
    text: options.caps ? text.toUpperCase() : text,
    fontFamily: options.font === "heading" ? fonts.heading : fonts.body,
    fontSize: theme.size(options.size ?? 18),
    fontStyle,
    fill: options.color ?? colors.body,
    align: options.align ?? "left",
    verticalAlign: options.verticalAlign ?? "top",
    lineHeight: options.lineHeight ?? 1.35,
    letterSpacing: options.letterSpacing ?? 0,
    listening: false,
    ...(options.width !== undefined ? { width: options.width } : {}),
    ...(options.height !== undefined ? { height: options.height } : {}),
  });
  parent.add(node);
  return node;
}

// Small gold capitals above a title, like "A LITERARY TRIAL"
export function addKicker(parent: Parent, text: string, options: TextOptions = {}): Konva.Text {
  return addText(parent, text, { size: 12, color: colors.highlight, letterSpacing: 2.5, caps: true, ...options });
}

// ---------------------------------------------------------------------------------------
// Panels and decoration
// ---------------------------------------------------------------------------------------

export interface PanelOptions {
  fill?: string;
  stroke?: string;
  shadow?: boolean;
  inset?: boolean;           // A second thin border just inside the edge, like a printed page
}

export function addPanel(parent: Parent, x: number, y: number, width: number, height: number, options: PanelOptions = {}): Konva.Rect {
  const panel = new Konva.Rect({
    x, y, width, height,
    fill: options.fill ?? colors.panel,
    stroke: options.stroke ?? colors.border,
    strokeWidth: 1,
    cornerRadius: theme.radius.panel,
    listening: false,
    ...(options.shadow === false ? {} : {
      shadowColor: "#000000", shadowBlur: 28, shadowOffsetY: 12, shadowOpacity: 0.45,
    }),
  });
  parent.add(panel);
  if (options.inset !== false) {
    parent.add(new Konva.Rect({
      x: x + 8, y: y + 8, width: width - 16, height: height - 16,
      stroke: colors.border, strokeWidth: 1, opacity: 0.6,
      cornerRadius: Math.max(0, theme.radius.panel - 2), listening: false,
    }));
  }
  return panel;
}

// A short rule with a diamond in the middle, centered on cx
export function addDivider(parent: Parent, cx: number, y: number, halfWidth: number = 70, color: string = colors.highlight): void {
  parent.add(new Konva.Line({ points: [cx - halfWidth, y, cx - 14, y], stroke: colors.border, strokeWidth: 1, listening: false }));
  parent.add(new Konva.Line({ points: [cx + 14, y, cx + halfWidth, y], stroke: colors.border, strokeWidth: 1, listening: false }));
  parent.add(new Konva.Line({
    points: [cx, y - 6, cx + 6, y, cx, y + 6, cx - 6, y], closed: true, fill: color, listening: false,
  }));
}

// A square ink stamp with a letter in it, like a wax seal on a letter
export function addSeal(parent: Parent, x: number, y: number, size: number, letter: string, fill: string = colors.accent): Konva.Group {
  const seal = new Konva.Group({ x, y, listening: false });
  seal.add(new Konva.Rect({
    width: size, height: size, fill, cornerRadius: theme.radius.button + 2,
    stroke: colors.highlight, strokeWidth: 1, shadowColor: "#000000", shadowBlur: 10, shadowOffsetY: 4, shadowOpacity: 0.4,
  }));
  seal.add(new Konva.Text({
    width: size, height: size, text: letter, align: "center", verticalAlign: "middle",
    fontFamily: fonts.body, fontSize: Math.round(size * 0.56), fill: colors.text,
  }));
  parent.add(seal);
  return seal;
}

export interface HeaderOptions {
  kicker: string;
  title: string;
  seal: string;               // Letter in the stamp on the left
  rightText: string;          // e.g. "19th Century · Baltimore"
  rightTag?: string;          // Small boxed label before rightText, e.g. "1845"
}

// The strip across the top of every game screen. Returns the y just below its rule
export function addHeader(parent: Parent, stageWidth: number, options: HeaderOptions): number {
  const { x0, x1 } = pageBox(stageWidth);
  const top = 22;
  addSeal(parent, x0, top, 56, options.seal);
  addKicker(parent, options.kicker, { x: x0 + 74, y: top + 4 });
  addText(parent, options.title, { x: x0 + 74, y: top + 24, size: 24, font: "heading", color: colors.text });

  const right = addText(parent, options.rightText, {
    y: top + 18, size: 15, color: colors.muted, letterSpacing: 1,
  });
  right.x(x1 - right.width());
  if (options.rightTag) {
    const tag = addText(parent, options.rightTag, { y: top + 18, size: 13, color: colors.highlight, letterSpacing: 1 });
    const tagWidth = tag.width() + 18;
    const tagX = right.x() - tagWidth - 14;
    tag.x(tagX + 9);
    parent.add(new Konva.Rect({
      x: tagX, y: top + 18 - 7, width: tagWidth, height: tag.height() + 14,
      stroke: colors.accent, strokeWidth: 1, listening: false,
    }));
  }

  const ruleY = top + 56 + 22;
  parent.add(new Konva.Line({ points: [x0, ruleY, x1, ruleY], stroke: colors.border, strokeWidth: 1, listening: false }));
  return ruleY;
}

// ---------------------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------------------

function setCursor(node: Konva.Node, cursor: string): void {
  const stage = node.getStage();
  if (stage) {
    stage.container().style.cursor = cursor;
  }
}

function redraw(node: Konva.Node): void {
  node.getLayer()?.batchDraw();
}

export interface ButtonOptions {
  variant?: "primary" | "ghost";
  height?: number;
  arrow?: boolean;            // Small → after the label
  size?: number;              // Label size (unscaled px)
}

// Primary: oxblood with a hard offset shadow, like a pressed bookplate. Ghost: outlined.
export function addButton(
  parent: Parent, label: string, x: number, y: number, width: number,
  onClick: () => void, options: ButtonOptions = {}
): Konva.Group {
  const variant = options.variant ?? "primary";
  const height = options.height ?? theme.button.size.height;
  const primary = variant === "primary";

  const text = new Konva.Text({
    text: label.toUpperCase(), fontFamily: fonts.body, fontSize: theme.size(options.size ?? 15),
    letterSpacing: 2, fill: primary ? colors.text : colors.body, listening: false,
  });
  const arrowWidth = options.arrow ? 30 : 0;
  // A label too long for the button widens it, keeping the same center
  const needed = text.width() + arrowWidth + 56;
  if (needed > width) {
    x -= (needed - width) / 2;
    width = needed;
  }
  const group = new Konva.Group({ x, y });

  if (primary) {
    group.add(new Konva.Rect({
      x: 5, y: 5, width, height, fill: "#000000", opacity: 0.35, cornerRadius: theme.radius.button,
    }));
  }
  const box = new Konva.Rect({
    width, height, cornerRadius: theme.radius.button,
    fill: primary ? colors.accent : "rgba(0,0,0,0)",
    stroke: primary ? colors.accentHover : colors.border,
    strokeWidth: 1,
  });
  group.add(box);

  text.x((width - text.width() - arrowWidth) / 2);
  text.y((height - text.height()) / 2 + 1);
  group.add(text);
  if (options.arrow) {
    const ax = text.x() + text.width() + 16;
    const ay = height / 2;
    group.add(new Konva.Line({
      points: [ax, ay, ax + 14, ay], stroke: text.fill() as string, strokeWidth: 1.5, listening: false,
    }));
    group.add(new Konva.Line({
      points: [ax + 9, ay - 4, ax + 14, ay, ax + 9, ay + 4], stroke: text.fill() as string, strokeWidth: 1.5,
      lineCap: "round", lineJoin: "round", listening: false,
    }));
  }

  group.on("mouseenter", () => {
    setCursor(group, "pointer");
    if (primary) {
      box.fill(colors.accentHover);
    }
    else {
      box.stroke(colors.highlight);
    }
    redraw(group);
  });
  group.on("mouseleave", () => {
    setCursor(group, "default");
    if (primary) {
      box.fill(colors.accent);
    }
    else {
      box.stroke(colors.border);
    }
    redraw(group);
  });
  group.on("click tap", () => {
    setCursor(group, "default");
    onClick();
  });

  parent.add(group);
  return group;
}

export type OptionState = "idle" | "correct" | "wrong" | "faded";

export interface OptionRow {
  group: Konva.Group;
  setState: (state: OptionState) => void;
}

// An answer choice: a lettered circle and the answer text in a bordered row
export function addOption(
  parent: Parent, letter: string, label: string,
  x: number, y: number, width: number, height: number,
  onClick: () => void, size: number = 19
): OptionRow {
  const group = new Konva.Group({ x, y });
  const box = new Konva.Rect({
    width, height, fill: colors.background, stroke: colors.border, strokeWidth: 1, cornerRadius: theme.radius.button,
  });
  const badgeRadius = 15;
  const badge = new Konva.Circle({
    x: 22 + badgeRadius, y: height / 2, radius: badgeRadius, stroke: colors.border, strokeWidth: 1, listening: false,
  });
  const badgeText = new Konva.Text({
    x: 22, y: height / 2 - badgeRadius, width: badgeRadius * 2, height: badgeRadius * 2,
    text: letter, align: "center", verticalAlign: "middle",
    fontFamily: fonts.body, fontSize: theme.size(13), fill: colors.muted, listening: false,
  });
  const text = new Konva.Text({
    x: 22 + badgeRadius * 2 + 18, width: width - (22 + badgeRadius * 2 + 18) - 18, height,
    text: label, verticalAlign: "middle", lineHeight: 1.2,
    fontFamily: fonts.body, fontSize: theme.size(size), fill: colors.body, listening: false,
  });
  group.add(box, badge, badgeText, text);

  let state: OptionState = "idle";
  const paint = (hover: boolean) => {
    const settled = state === "correct" || state === "wrong";
    box.fill(state === "correct" ? colors.correct : state === "wrong" ? colors.wrong : colors.background);
    box.stroke(settled ? (state === "correct" ? colors.correctText : colors.wrongText) : hover ? colors.highlight : colors.border);
    badge.stroke(settled ? colors.text : hover ? colors.highlight : colors.border);
    badgeText.fill(settled ? colors.text : hover ? colors.highlight : colors.muted);
    text.fill(settled ? colors.text : state === "faded" ? colors.dim : colors.body);
    redraw(group);
  };

  group.on("mouseenter", () => {
    setCursor(group, "pointer");
    if (state === "idle") {
      paint(true);
    }
  });
  group.on("mouseleave", () => {
    setCursor(group, "default");
    paint(false);
  });
  group.on("click tap", onClick);

  parent.add(group);
  return {
    group,
    setState: (next) => {
      state = next;
      paint(false);
    },
  };
}

// ---------------------------------------------------------------------------------------
// Image placeholders
// ---------------------------------------------------------------------------------------

export interface ImageOptions {
  shape?: "rect" | "oval";
  label?: string;            // Small capitals under the icon
  caption?: string;          // Line under the label, e.g. the round or the person shown
  src?: string;              // When set, the image is loaded and replaces the placeholder
}

// Path of an ellipse that fills (0, 0, width, height), built from four curves
function ellipsePath(ctx: Konva.Context, width: number, height: number): void {
  const k = 0.5522848;
  const rx = width / 2;
  const ry = height / 2;
  ctx.beginPath();
  ctx.moveTo(width, ry);
  ctx.bezierCurveTo(width, ry + ry * k, rx + rx * k, height, rx, height);
  ctx.bezierCurveTo(rx - rx * k, height, 0, ry + ry * k, 0, ry);
  ctx.bezierCurveTo(0, ry - ry * k, rx - rx * k, 0, rx, 0);
  ctx.bezierCurveTo(rx + rx * k, 0, width, ry - ry * k, width, ry);
  ctx.closePath();
}

// A dashed frame with a picture icon. Pass `src` later and the real image is drawn instead
export function addImagePlaceholder(
  parent: Parent, x: number, y: number, width: number, height: number, options: ImageOptions = {}
): Konva.Group {
  const oval = options.shape === "oval";
  const group = new Konva.Group({ x, y, listening: false });

  const frame = oval
    ? new Konva.Ellipse({ x: width / 2, y: height / 2, radiusX: width / 2, radiusY: height / 2 })
    : new Konva.Rect({ width, height, cornerRadius: theme.radius.panel });
  frame.setAttrs({ fill: colors.background, stroke: colors.border, strokeWidth: 2, dash: [8, 6] });
  group.add(frame);

  // Picture icon: a frame with a sun and two hills
  const content = new Konva.Group({ x: width / 2, y: height / 2 - 18 });
  content.add(new Konva.Rect({ x: -26, y: -20, width: 52, height: 40, stroke: colors.faint, strokeWidth: 2, cornerRadius: 3 }));
  content.add(new Konva.Circle({ x: 10, y: -8, radius: 5, stroke: colors.faint, strokeWidth: 2 }));
  content.add(new Konva.Line({ points: [-26, 18, -10, 2, 0, 12, 8, 6, 26, 18], stroke: colors.faint, strokeWidth: 2, lineJoin: "round" }));
  const labelWidth = Math.max(60, width * (oval ? 0.62 : 0.85));
  content.add(new Konva.Text({
    x: -labelWidth / 2, y: 32, width: labelWidth, align: "center",
    text: (options.label ?? "Image placeholder").toUpperCase(), letterSpacing: 2,
    fontFamily: fonts.body, fontSize: theme.size(11), fill: colors.dim,
  }));
  if (options.caption) {
    content.add(new Konva.Text({
      x: -labelWidth / 2, y: 54, width: labelWidth, align: "center", text: options.caption,
      fontFamily: fonts.body, fontStyle: "italic", fontSize: theme.size(14), fill: colors.faint,
    }));
  }
  group.add(content);
  parent.add(group);

  if (options.src) {
    const image = new window.Image();
    image.onload = () => {
      // Cover the frame, cropping whichever side is too long
      const scale = Math.max(width / image.width, height / image.height);
      const clip = new Konva.Group({
        clipFunc: (ctx: Konva.Context) => {
          if (oval) {
            ellipsePath(ctx, width, height);
          }
          else {
            ctx.rect(0, 0, width, height);
          }
        },
      });
      clip.add(new Konva.Image({
        image,
        x: (width - image.width * scale) / 2,
        y: (height - image.height * scale) / 2,
        width: image.width * scale,
        height: image.height * scale,
      }));
      content.visible(false);
      frame.setAttrs({ dash: [], stroke: colors.highlight });
      group.add(clip);
      frame.moveToTop();
      frame.fill("rgba(0,0,0,0)");
      redraw(group);
    };
    image.src = options.src;
  }
  return group;
}

// ---------------------------------------------------------------------------------------
// Small icons
// ---------------------------------------------------------------------------------------

const HEART = "M12 21C12 21 3 15.5 3 9.5C3 6.4 5.4 4 8.3 4C10 4 11.3 4.9 12 6.1C12.7 4.9 14 4 15.7 4C18.6 4 21 6.4 21 9.5C21 15.5 12 21 12 21Z";

export function addHeart(parent: Parent, x: number, y: number, size: number, filled: boolean): Konva.Path {
  const heart = new Konva.Path({
    x, y, data: HEART, scaleX: size / 24, scaleY: size / 24,
    stroke: filled ? colors.wrongText : colors.dim, strokeWidth: 1.6 * (24 / size),
    fill: filled ? colors.wrongText : undefined, listening: false,
  });
  parent.add(heart);
  return heart;
}

// A full-screen dark veil, used behind pop-up cards
export function addShade(parent: Parent, width: number, height: number): Konva.Rect {
  const shade = new Konva.Rect({ x: 0, y: 0, width, height, fill: "#000000", opacity: 0.7 });
  parent.add(shade);
  return shade;
}
