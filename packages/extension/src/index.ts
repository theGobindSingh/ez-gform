/**
 * ez-gform extension assembler.
 *
 * Discovers the built outputs of the three sibling packages
 * (@ez-gform/background, @ez-gform/content-script, @ez-gform/popup),
 * copies them into packages/extension/dist, writes manifest.json, and
 * copies static assets (icons). Does NOT build those packages itself -
 * Turbo's `^build` dependency ensures they're already built.
 */
import chalk from "chalk";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildManifest } from "./manifest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXTENSION_DIR = resolve(__dirname, "..");
const ROOT_DIR = resolve(EXTENSION_DIR, "../..");
const DIST_DIR = join(EXTENSION_DIR, "dist");
const NODE_MODULES_DIR = join(EXTENSION_DIR, "node_modules");

interface PackageJson {
  name?: string;
  version?: string;
  displayName?: string;
  description?: string;
}

const log = (
  message: string,
  type: "info" | "success" | "warn" = "info",
): void => {
  const prefix = chalk.blue("[Extension Builder]");
  const colored =
    type === "success"
      ? chalk.green(message)
      : type === "warn"
        ? chalk.yellow(message)
        : chalk.white(message);
  console.log(`${prefix} ${colored}`);
};

const ensureDir = (dirPath: string): void => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
};

const readPackageJson = (packagePath: string): PackageJson => {
  const pkgPath = join(packagePath, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error(`package.json not found at ${pkgPath}`);
  }
  return JSON.parse(readFileSync(pkgPath, "utf-8")) as PackageJson;
};

const resolvePackageDir = (packageName: string): string | undefined => {
  const packagePath = join(NODE_MODULES_DIR, packageName);
  return existsSync(packagePath) ? packagePath : undefined;
};

/** Copies a rollup-built package's single JS output to `dist/<name>.js`. */
const copyBuiltScript = (
  packageName: string,
  sourceFile: string,
  targetName: string,
): string[] => {
  const missing: string[] = [];
  const packagePath = resolvePackageDir(packageName);
  if (!packagePath) {
    missing.push(`${packageName} not resolved in node_modules`);
    return missing;
  }

  const sourcePath = join(packagePath, "dist", sourceFile);
  if (!existsSync(sourcePath)) {
    missing.push(`${packageName}: built file not found at ${sourcePath}`);
    return missing;
  }

  ensureDir(DIST_DIR);
  const targetPath = join(DIST_DIR, targetName);
  copyFileSync(sourcePath, targetPath);
  log(`  ✓ Copied ${sourcePath} -> ${targetPath}`, "success");
  return missing;
};

/** Copies the Vite-built popup: dist/index.html -> dist/popup.html, dist/assets/* -> dist/assets/*. */
const copyPopup = (): string[] => {
  const missing: string[] = [];
  const packagePath = resolvePackageDir("@ez-gform/popup");
  if (!packagePath) {
    missing.push("@ez-gform/popup not resolved in node_modules");
    return missing;
  }

  const htmlSource = join(packagePath, "dist", "index.html");
  if (!existsSync(htmlSource)) {
    missing.push(`popup.html source not found (${htmlSource})`);
  } else {
    ensureDir(DIST_DIR);
    copyFileSync(htmlSource, join(DIST_DIR, "popup.html"));
    log("  ✓ Copied popup.html", "success");
  }

  const assetsSource = join(packagePath, "dist", "assets");
  if (existsSync(assetsSource)) {
    const assetsTarget = join(DIST_DIR, "assets");
    ensureDir(assetsTarget);
    for (const file of readdirSync(assetsSource)) {
      copyFileSync(join(assetsSource, file), join(assetsTarget, file));
      log(`  ✓ Copied asset: ${file}`, "success");
    }
  }

  const popupJsSource = join(packagePath, "dist", "popup.js");
  if (existsSync(popupJsSource)) {
    copyFileSync(popupJsSource, join(DIST_DIR, "popup.js"));
    log("  ✓ Copied popup.js", "success");
  }

  return missing;
};

const copyIcons = (): string[] => {
  const missing: string[] = [];
  const iconsSource = join(EXTENSION_DIR, "static", "icons");
  if (!existsSync(iconsSource)) {
    missing.push(`static/icons not found at ${iconsSource}`);
    return missing;
  }
  const iconsTarget = join(DIST_DIR, "icons");
  ensureDir(iconsTarget);
  for (const file of readdirSync(iconsSource)) {
    if (file.startsWith(".")) continue;
    copyFileSync(join(iconsSource, file), join(iconsTarget, file));
    log(`  ✓ Copied icon: ${file}`, "success");
  }
  return missing;
};

const writeManifest = (): void => {
  const rootPackageJson = readPackageJson(ROOT_DIR);
  const extensionPackageJson = readPackageJson(EXTENSION_DIR);

  const manifest = buildManifest({
    name:
      extensionPackageJson.displayName ??
      extensionPackageJson.name ??
      "ez-gform",
    version: extensionPackageJson.version ?? rootPackageJson.version ?? "0.0.0",
    description:
      extensionPackageJson.description ??
      "Generate ez-gform config and code from any Google Form",
  });

  ensureDir(DIST_DIR);
  writeFileSync(
    join(DIST_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  log(`✓ Created manifest at: ${join(DIST_DIR, "manifest.json")}`, "success");
};

const assemble = (): void => {
  log("");
  log(chalk.bold("Assembling ez-gform extension..."));
  log("");

  const missing = [
    ...copyBuiltScript(
      "@ez-gform/background",
      "background.js",
      "background.js",
    ),
    ...copyBuiltScript(
      "@ez-gform/content-script",
      "content-script.js",
      "content-script.js",
    ),
    ...copyPopup(),
    ...copyIcons(),
  ];

  writeManifest();

  if (missing.length > 0) {
    log("");
    log(chalk.red.bold("Assembly failed: required output is missing"), "warn");
    for (const item of missing) {
      log(`  - ${item}`, "warn");
    }
    log(
      chalk.red(
        "Make sure background, content-script, and popup have all been built (`pnpm build`) before assembling.",
      ),
    );
    process.exitCode = 1;
    return;
  }

  log("");
  log(chalk.green.bold("Assembly complete!"), "success");
  log(chalk.cyan(`Extension ready at: ${DIST_DIR}`));
  log(
    chalk.yellowBright(
      'Load it in Chrome: chrome://extensions/ -> "Load unpacked" -> select the dist folder',
    ),
  );
};

assemble();
