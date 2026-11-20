// Guards against the lockfile problems that have broken CI in past PRs:
//   1. `npm ci` failing because package.json and package-lock.json drifted apart
//      ("Missing: shakespeare@1.0.0 from lock file").
//   2. A lockfile generated on Windows/macOS that is missing the Linux native binaries CI needs
//      ("Cannot find module '@tailwindcss/oxide-linux-x64-gnu'" - npm bug #4828).
//   3. Extra lockfiles committed inside a game folder (the repo uses ONE root lockfile).
// Runs with no dependencies: `npm run check:lockfile`.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];

const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const lock = JSON.parse(readFileSync(resolve(root, "package-lock.json"), "utf8"));
const packages = lock.packages ?? {};

// 1a. Every workspace must be recorded in the lockfile.
for (const ws of pkg.workspaces ?? []) {
  const entry = packages[ws];
  if (!entry) {
    problems.push(`workspace "${ws}" is missing from package-lock.json (run: npm install)`);
    continue;
  }
  const wsPkg = JSON.parse(readFileSync(resolve(root, ws, "package.json"), "utf8"));
  if (!packages[`node_modules/${wsPkg.name}`]) {
    problems.push(`workspace link "${wsPkg.name}" (${ws}) is missing from package-lock.json (run: npm install)`);
  }
}

// 1b. The root dependency lists must match what the lockfile recorded for "".
const rootEntry = packages[""] ?? {};
for (const field of ["dependencies", "devDependencies"]) {
  const wanted = pkg[field] ?? {};
  const locked = rootEntry[field] ?? {};
  for (const [name, range] of Object.entries(wanted)) {
    if (locked[name] !== range) {
      problems.push(`root ${field}.${name} is "${range}" in package.json but "${locked[name] ?? "absent"}" in package-lock.json`);
    }
  }
  for (const name of Object.keys(locked)) {
    if (!(name in wanted)) problems.push(`root ${field}.${name} is in package-lock.json but not package.json`);
  }
}

// 2. Platform-specific optional packages: if the lockfile knows about any platform's binary for a
//    package, it must also include the Linux x64 one that GitHub Actions runners use.
const platformPattern = /^(.*)-(?:win32|darwin|linux|freebsd|android)-[a-z0-9]+(?:-(?:gnu|musl|msvc|eabi))?$/;
const lockedNames = new Set(Object.keys(packages).map((key) => key.slice(key.lastIndexOf("node_modules/") + "node_modules/".length)));
const checked = new Set();
for (const entry of Object.values(packages)) {
  for (const name of Object.keys(entry.optionalDependencies ?? {})) {
    const match = platformPattern.exec(name);
    if (!match) continue;
    const linux = `${match[1]}-linux-x64-gnu`;
    if (checked.has(linux)) continue;
    checked.add(linux);
    if (!lockedNames.has(linux)) {
      problems.push(
        `package-lock.json has no entry for ${linux} (CI runs on Linux). ` +
          `Don't delete or regenerate the lockfile: on Windows/macOS npm drops these entries (npm bug #4828). ` +
          `Restore it from main (git checkout origin/main -- package-lock.json) and run a plain \`npm install\`, ` +
          `which keeps the existing entries.`,
      );
    }
  }
}

// 3. One lockfile for the whole repo.
try {
  const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split("\n");
  for (const file of tracked) {
    const isLockfile = /(^|\/)(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml)$/.test(file);
    if (isLockfile && file !== "package-lock.json") {
      problems.push(`extra lockfile committed: ${file} (only the root package-lock.json is allowed)`);
    }
  }
} catch {
  console.warn("check-lockfile: not a git checkout, skipping the extra-lockfile check");
}

if (problems.length > 0) {
  console.error("Lockfile check failed:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log(`Lockfile check passed (${pkg.workspaces.length} workspaces, ${checked.size} Linux native packages verified).`);
