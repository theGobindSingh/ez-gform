import chokidar from "chokidar";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const watchPaths = [
  path.resolve(__dirname, "../src"),
  path.resolve(__dirname, "../node_modules/@ez-gform/background"),
  path.resolve(__dirname, "../node_modules/@ez-gform/content-script"),
  path.resolve(__dirname, "../node_modules/@ez-gform/popup"),
];

let child: ChildProcess | undefined;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
const DEBOUNCE_MS = 200;

const runBuild = (): void => {
  if (child) {
    child.kill();
  }
  child = spawn("tsx", ["./src/index.ts"], { stdio: "inherit" });
};

// A single sibling-package rebuild can touch several files in quick
// succession; debounce so those collapse into one assembler run instead of
// respawning it once per file.
const scheduleBuild = (): void => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(runBuild, DEBOUNCE_MS);
};

const watcher = chokidar.watch(watchPaths, { ignoreInitial: true });

watcher.on("all", (event: string, filePath: string) => {
  console.log(`[watcher] ${event} detected in ${filePath}. Rebuilding...`);
  scheduleBuild();
});

console.log("[watcher] Watching for changes...");
runBuild();
