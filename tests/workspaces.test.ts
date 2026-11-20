import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { targets } from "../e2e/targets";

// Repo-structure sanity checks. These exist because past PRs broke CI with a missing
// index.html ("Cannot resolve entry module index.html"), deleted config files, and
// workspaces that were never wired into the build/typecheck.
// Vitest runs from the repo root (see vitest.config.ts), so the working directory is the root.
const root = process.cwd();
const readJson = (path: string) => JSON.parse(readFileSync(resolve(root, path), "utf8"));

const rootPkg = readJson("package.json");
const workspaces: string[] = rootPkg.workspaces;

// Folders that have a package.json but are intentionally NOT workspaces. Remove an entry
// when the folder is deleted or promoted to a real workspace.
const KNOWN_ORPHANS = ["matsuo-basho"];

describe("npm workspaces", () => {
  it("lists at least the games and the menu", () => {
    expect(workspaces).toEqual(expect.arrayContaining(["menu", "basho", "poe", "trivia", "shakespeare", "iambic-pentameter"]));
  });

  it("has no package.json folder missing from the workspaces list", () => {
    const orphans = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "node_modules")
      .map((entry) => entry.name)
      .filter((name) => existsSync(resolve(root, name, "package.json")))
      .filter((name) => !workspaces.includes(name) && !KNOWN_ORPHANS.includes(name));
    expect(orphans, `Add these to "workspaces" in package.json (or to KNOWN_ORPHANS here): ${orphans.join(", ")}`).toEqual([]);
  });

  describe.each(workspaces)("%s", (ws) => {
    it("has a package.json with a name and build + preview scripts", () => {
      expect(existsSync(resolve(root, ws, "package.json"))).toBe(true);
      const pkg = readJson(`${ws}/package.json`);
      expect(pkg.name, "package.json needs a name").toBeTruthy();
      expect(pkg.scripts?.build, "needs a build script").toBeTruthy();
      expect(pkg.scripts?.preview, "needs a preview script (used by the e2e smoke tests)").toBeTruthy();
    });

    it("has an index.html whose script entry exists", () => {
      const htmlPath = resolve(root, ws, "index.html");
      expect(existsSync(htmlPath), `${ws}/index.html is missing`).toBe(true);
      const html = readFileSync(htmlPath, "utf8");
      const entries = [...html.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/g)].map((match) => match[1]);
      expect(entries.length, "index.html has no <script src>").toBeGreaterThan(0);
      for (const entry of entries.filter((src) => !/^https?:/.test(src))) {
        const file = resolve(root, ws, entry.replace(/^\//, ""));
        expect(existsSync(file), `${ws}/index.html loads ${entry}, which does not exist`).toBe(true);
      }
    });

    it("has a tsconfig.json and is covered by the root typecheck script", () => {
      expect(existsSync(resolve(root, ws, "tsconfig.json")), `${ws}/tsconfig.json is missing`).toBe(true);
      expect(rootPkg.scripts.typecheck, `add "tsc --noEmit -p ${ws}" to the root typecheck script`).toContain(`-p ${ws}`);
    });

    it("has an e2e smoke target", () => {
      expect(
        targets.map((target) => target.workspace),
        `add ${ws} to e2e/targets.ts so its build is smoke-tested`,
      ).toContain(ws);
    });
  });

  it("gives every e2e target a unique port and a real workspace", () => {
    const ports = targets.map((target) => target.port);
    expect(new Set(ports).size).toBe(ports.length);
    for (const target of targets) expect(workspaces).toContain(target.workspace);
  });
});
