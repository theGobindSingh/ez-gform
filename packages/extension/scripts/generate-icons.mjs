#!/usr/bin/env node
/**
 * Generates the extension's 16/32/48/128px PNG icons with no native/image
 * dependencies: a hand-rolled minimal PNG encoder (zlib for the DEFLATE
 * stream, a plain-JS CRC32) drawing a solid rounded square. Run with
 * `node scripts/generate-icons.mjs` whenever the icon design changes; the
 * output is committed to `static/icons/` like any other static asset.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "static", "icons");

// Brand color: a green that reads clearly at 16px.
const FG = [22, 163, 74, 255]; // #16A34A
const BG = [255, 255, 255, 0]; // transparent

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

const crc32 = (buf) => {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([lenBuf, body, crcBuf]);
};

/** Draws a rounded square with a 1px-scaled corner radius into an RGBA buffer. */
const drawRoundedSquare = (size) => {
  const radius = Math.max(2, Math.round(size * 0.22));
  const pixels = Buffer.alloc(size * size * 4);

  const inside = (x, y) => {
    // Distance from the nearest edge, clamped into the corner circles.
    const cx = x < radius ? radius : x >= size - radius ? size - radius - 1 : x;
    const cy = y < radius ? radius : y >= size - radius ? size - radius - 1 : y;
    if (x >= radius && x < size - radius) return true;
    if (y >= radius && y < size - radius) return true;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = inside(x, y) ? FG : BG;
      const offset = (y * size + x) * 4;
      pixels[offset] = r;
      pixels[offset + 1] = g;
      pixels[offset + 2] = b;
      pixels[offset + 3] = a;
    }
  }
  return pixels;
};

const encodePng = (size) => {
  const pixels = drawRoundedSquare(size);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type: RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdr = chunk("IHDR", ihdrData);

  // One "no filter" (filter type 0) byte prefix per scanline.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = chunk("IDAT", deflateSync(raw));

  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
};

const SIZES = [16, 32, 48, 128];
for (const size of SIZES) {
  const png = encodePng(size);
  const path = join(OUT_DIR, `icon${size}.png`);
  writeFileSync(path, png);
  console.log(`Wrote ${path} (${png.length} bytes)`);
}
