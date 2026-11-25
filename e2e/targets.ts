// Every buildable workspace, served by `vite preview` on its own port during e2e runs.
// (These ports are separate from the dev ports so e2e never collides with `npm run dev:*`.)
export interface SmokeTarget {
  /** Workspace folder name (also the npm workspace name). */
  workspace: string;
  port: number;
  /** Element the app mounts into. */
  mount: "#container" | "#root";
  /** Konva apps draw into a <canvas>; React apps render DOM. */
  canvas: boolean;
  /** Expected <title>, when the app sets a real one. */
  title?: RegExp;
}

export const targets: SmokeTarget[] = [
  { workspace: "menu", port: 4170, mount: "#container", canvas: true, title: /Main Menu/ },
  { workspace: "basho", port: 4171, mount: "#container", canvas: true, title: /Bash/ },
  { workspace: "poe", port: 4172, mount: "#container", canvas: true, title: /Edgar Allan Poe/ },
  { workspace: "trivia", port: 4173, mount: "#container", canvas: true, title: /Trivia/ },
  { workspace: "iambic-pentameter", port: 4175, mount: "#container", canvas: true, title: /Iambic Pentameter/ },
  { workspace: "shakespeare-mvc", port: 4177, mount: "#container", canvas: true, title: /Shakespeare/ },
];
