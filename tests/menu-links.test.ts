import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// The main menu hard-codes where each game lives: a localhost port in dev, and a
// "/<workspace>/" path in production. If someone renames a workspace or changes a dev port
// without updating menu/destinations.ts, the menu silently links to a dead page. Check it.
// Vitest runs from the repo root (see vitest.config.ts), so the working directory is the root.
const root = process.cwd();
const source = readFileSync(resolve(root, "menu/destinations.ts"), "utf8");
const rootPkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const entries = [...source.matchAll(/(\w+):\s*dev \? "http:\/\/localhost:(\d+)\/" : "\/([^"/]+)\/"/g)].map((match) => ({
  key: match[1],
  devPort: Number(match[2]),
  workspace: match[3],
}));

const devPortOf = (workspace: string) => {
  const pkg = JSON.parse(readFileSync(resolve(root, workspace, "package.json"), "utf8"));
  const match = /--port\s+(\d+)/.exec(pkg.scripts?.dev ?? "");
  return { port: match ? Number(match[1]) : undefined, strict: /--strictPort/.test(pkg.scripts?.dev ?? "") };
};

describe("menu/destinations.ts", () => {
  it("lists the playable games", () => {
    expect(entries.map((entry) => entry.key).sort()).toEqual(["basho", "iambic", "poe", "shakespeare"]);
  });

  describe.each(entries)("$key", ({ devPort, workspace }) => {
    it(`production path /${workspace}/ is a real workspace`, () => {
      expect(rootPkg.workspaces, `no workspace named ${workspace}`).toContain(workspace);
      expect(existsSync(resolve(root, workspace, "index.html"))).toBe(true);
    });

    it(`dev port ${devPort} matches the workspace's dev script`, () => {
      const { port, strict } = devPortOf(workspace);
      expect(port, `${workspace}'s dev script must pin --port ${devPort}`).toBe(devPort);
      expect(strict, `${workspace}'s dev script needs --strictPort so the menu link can't drift`).toBe(true);
    });
  });

  it("uses a different dev port for every destination and the menu itself", () => {
    const menuPort = Number(/menuUrl = dev \? "http:\/\/localhost:(\d+)\/"/.exec(source)?.[1]);
    expect(menuPort).toBe(devPortOf("menu").port);
    const ports = [menuPort, ...entries.map((entry) => entry.devPort)];
    expect(new Set(ports).size).toBe(ports.length);
  });
});
