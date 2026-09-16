/**
 * Packages `dist/` into `ez-gform-extension-<version>.zip`, suitable for
 * upload to the Chrome Web Store or manual distribution. Prefers the system
 * `zip` CLI; falls back to a minimal hand-rolled STORE-only (uncompressed)
 * zip writer with no extra dependency when `zip` isn't on PATH.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EXTENSION_DIR = resolve(__dirname, "..");
const DIST_DIR = join(EXTENSION_DIR, "dist");

const readVersion = (): string => {
  const pkg = JSON.parse(
    readFileSync(join(EXTENSION_DIR, "package.json"), "utf-8"),
  ) as { version?: string };
  return pkg.version ?? "0.0.0";
};

const hasZipCli = (): boolean => {
  try {
    execFileSync("zip", ["-v"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const walk = (dir: string): string[] => {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (buf: Buffer): number => {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const dosDateTime = (): { time: number; date: number } => {
  const now = new Date();
  const time =
    (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date =
    ((now.getFullYear() - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();
  return { time, date };
};

/** Writes a minimal STORE-method (uncompressed) zip archive. */
const writeStoreZip = (outputPath: string, files: string[]): void => {
  const { time, date } = dosDateTime();
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const filePath of files) {
    const name = relative(DIST_DIR, filePath).split("\\").join("/");
    const data = readFileSync(filePath);
    const crc = crc32(data);
    const nameBuf = Buffer.from(name, "utf-8");

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(0, 8); // method: store
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuf, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0, 8); // flags
    centralHeader.writeUInt16LE(0, 10); // method: store
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra length
    centralHeader.writeUInt16LE(0, 32); // comment length
    centralHeader.writeUInt16LE(0, 34); // disk number start
    centralHeader.writeUInt16LE(0, 36); // internal attrs
    centralHeader.writeUInt32LE(0, 38); // external attrs
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + data.length;
  }

  const centralDirStart = offset;
  const centralDirBuf = Buffer.concat(centralParts);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirBuf.length, 12);
  eocd.writeUInt32LE(centralDirStart, 16);
  eocd.writeUInt16LE(0, 20);

  writeFileSync(
    outputPath,
    Buffer.concat([...localParts, centralDirBuf, eocd]),
  );
};

const main = (): void => {
  if (!existsSync(DIST_DIR)) {
    console.error(`dist/ not found at ${DIST_DIR}. Run \`pnpm build\` first.`);
    process.exit(1);
  }

  const version = readVersion();
  const outputPath = join(EXTENSION_DIR, `ez-gform-extension-${version}.zip`);

  if (hasZipCli()) {
    execFileSync("zip", ["-r", outputPath, "."], {
      cwd: DIST_DIR,
      stdio: "inherit",
    });
  } else {
    console.log(
      "`zip` CLI not found, falling back to the built-in JS zip writer.",
    );
    writeStoreZip(outputPath, walk(DIST_DIR));
  }

  console.log(`Wrote ${outputPath}`);
};

main();
