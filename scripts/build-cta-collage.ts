/**
 * Rebuilds the About CTA collage as a true-alpha PNG by compositing the
 * original tile images at positions recovered from the flattened JPEG export.
 *
 * Usage: npm run build:cta-collage
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const ABOUT_DIR = path.join(ROOT, "public/assets/about");
const REFERENCE_JPG = path.join(ABOUT_DIR, "cta-collage.jpg");
const OUT_PNG = path.join(ABOUT_DIR, "cta-collage.png");
const DEBUG_DIR = path.join(ROOT, "scripts/.cta-collage-debug");
const DEBUG_BEIGE = path.join(DEBUG_DIR, "cta-collage-on-beige.png");

const PAPER = { r: 0xfa, g: 0xf9, b: 0xf6, alpha: 1 };
const CORNER_RADIUS = 8;
const BG_MAX_CHANNEL = 2;
const MIN_COMPONENT_PX = 2000;
const MAE_INSET = 3;

/** Proven bijection from plan research (box index → original tile filename). */
const BOX_TO_TILE = [4, 5, 6, 7, 8, 9, 10, 12, 11, 13] as const;

type Rect = { x: number; y: number; w: number; h: number };

function maxChannel(r: number, g: number, b: number): number {
  return Math.max(r, g, b);
}

function extractBackgroundMask(
  data: Buffer,
  width: number,
  height: number,
  channels: number,
): Uint8Array {
  const bg = new Uint8Array(width * height);
  const stack: number[] = [];

  const tryPush = (i: number) => {
    if (bg[i]) return;
    const p = i * channels;
    if (maxChannel(data[p], data[p + 1], data[p + 2]) <= BG_MAX_CHANNEL) {
      bg[i] = 1;
      stack.push(i);
    }
  };

  for (let x = 0; x < width; x++) {
    tryPush(x);
    tryPush((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    tryPush(y * width);
    tryPush(y * width + width - 1);
  }

  while (stack.length) {
    const i = stack.pop()!;
    const x = i % width;
    const y = (i - x) / width;
    if (x > 0) tryPush(i - 1);
    if (x < width - 1) tryPush(i + 1);
    if (y > 0) tryPush(i - width);
    if (y < height - 1) tryPush(i + width);
  }

  return bg;
}

function extractComponentBoxes(
  bg: Uint8Array,
  width: number,
  height: number,
): Rect[] {
  const seen = new Uint8Array(width * height);
  const boxes: Rect[] = [];

  for (let start = 0; start < width * height; start++) {
    if (bg[start] || seen[start]) continue;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let count = 0;
    const queue = [start];
    seen[start] = 1;

    while (queue.length) {
      const i = queue.pop()!;
      const x = i % width;
      const y = (i - x) / width;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ] as const) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const j = ny * width + nx;
        if (!bg[j] && !seen[j]) {
          seen[j] = 1;
          queue.push(j);
        }
      }
    }

    if (count >= MIN_COMPONENT_PX) {
      boxes.push({
        x: minX,
        y: minY,
        w: maxX - minX + 1,
        h: maxY - minY + 1,
      });
    }
  }

  boxes.sort((a, b) => a.y - b.y || a.x - b.x);
  return boxes;
}

/** Compare a pre-resized RGB buffer against the collage at (x,y). */
function maeAt(
  resized: Buffer,
  rw: number,
  rh: number,
  collage: Buffer,
  canvasW: number,
  canvasH: number,
  channels: number,
  x: number,
  y: number,
  inset: number,
): number {
  const srcX0 = inset;
  const srcY0 = inset;
  const srcX1 = rw - inset;
  const srcY1 = rh - inset;
  if (srcX1 - srcX0 < 8 || srcY1 - srcY0 < 8) return Number.POSITIVE_INFINITY;

  const dstX0 = x + inset;
  const dstY0 = y + inset;
  const dstX1 = x + rw - inset;
  const dstY1 = y + rh - inset;

  const left = Math.max(0, dstX0);
  const top = Math.max(0, dstY0);
  const right = Math.min(canvasW, dstX1);
  const bottom = Math.min(canvasH, dstY1);
  const visW = right - left;
  const visH = bottom - top;
  if (visW < 8 || visH < 8) return Number.POSITIVE_INFINITY;

  const extractX = left - x;
  const extractY = top - y;

  let sum = 0;
  let count = 0;
  for (let py = 0; py < visH; py++) {
    for (let px = 0; px < visW; px++) {
      const cp = ((top + py) * canvasW + (left + px)) * channels;
      const tp = ((extractY + py) * rw + (extractX + px)) * 3;
      sum +=
        Math.abs(collage[cp] - resized[tp]) +
        Math.abs(collage[cp + 1] - resized[tp + 1]) +
        Math.abs(collage[cp + 2] - resized[tp + 2]);
      count += 3;
    }
  }
  return sum / count;
}

async function resizeRaw(
  tileBuf: Buffer,
  w: number,
  h: number,
  cache: Map<string, Buffer>,
): Promise<Buffer> {
  const key = `${w}x${h}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const buf = await sharp(tileBuf)
    .resize(w, h, { fit: "fill", kernel: "lanczos3" })
    .raw()
    .toBuffer();
  cache.set(key, buf);
  return buf;
}

async function refineRect(
  tileBuf: Buffer,
  collage: Buffer,
  canvasW: number,
  canvasH: number,
  channels: number,
  seed: Rect,
): Promise<{ rect: Rect; mae: number }> {
  const cache = new Map<string, Buffer>();
  let best = { ...seed };
  let bestMae = Number.POSITIVE_INFINITY;

  // Phase 1: jointly search size (shrink ringing inflation) + position, step 2
  for (let dw = -6; dw <= 2; dw += 2) {
    for (let dh = -6; dh <= 2; dh += 2) {
      const w = seed.w + dw;
      const h = seed.h + dh;
      if (w < 20 || h < 20) continue;
      const resized = await resizeRaw(tileBuf, w, h, cache);
      for (let dx = -6; dx <= 6; dx += 2) {
        for (let dy = -6; dy <= 6; dy += 2) {
          const mae = maeAt(
            resized,
            w,
            h,
            collage,
            canvasW,
            canvasH,
            channels,
            seed.x + dx,
            seed.y + dy,
            MAE_INSET,
          );
          if (mae < bestMae) {
            bestMae = mae;
            best = { x: seed.x + dx, y: seed.y + dy, w, h };
          }
        }
      }
    }
  }

  // Phase 2: fine ±2 around winner
  for (let dw = -2; dw <= 2; dw++) {
    for (let dh = -2; dh <= 2; dh++) {
      const w = best.w + dw;
      const h = best.h + dh;
      if (w < 20 || h < 20) continue;
      const resized = await resizeRaw(tileBuf, w, h, cache);
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const mae = maeAt(
            resized,
            w,
            h,
            collage,
            canvasW,
            canvasH,
            channels,
            best.x + dx,
            best.y + dy,
            MAE_INSET,
          );
          if (mae < bestMae) {
            bestMae = mae;
            best = { x: best.x + dx, y: best.y + dy, w, h };
          }
        }
      }
    }
  }

  return { rect: best, mae: bestMae };
}

function roundedRectSvg(w: number, h: number, r: number): Buffer {
  const radius = Math.min(r, Math.floor(Math.min(w, h) / 2));
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="#fff"/>` +
      `</svg>`,
  );
}

async function buildTileOverlay(
  tileBuf: Buffer,
  rect: Rect,
  canvasW: number,
  canvasH: number,
): Promise<sharp.OverlayOptions | null> {
  const left = Math.max(0, rect.x);
  const top = Math.max(0, rect.y);
  const right = Math.min(canvasW, rect.x + rect.w);
  const bottom = Math.min(canvasH, rect.y + rect.h);
  const visW = right - left;
  const visH = bottom - top;
  if (visW <= 0 || visH <= 0) return null;

  const mask = await sharp(roundedRectSvg(rect.w, rect.h, CORNER_RADIUS))
    .png()
    .toBuffer();

  let pipeline = sharp(tileBuf)
    .resize(rect.w, rect.h, { fit: "fill", kernel: "lanczos3" })
    .composite([{ input: mask, blend: "dest-in" }])
    .ensureAlpha();

  if (
    left !== rect.x ||
    top !== rect.y ||
    visW !== rect.w ||
    visH !== rect.h
  ) {
    pipeline = pipeline.extract({
      left: left - rect.x,
      top: top - rect.y,
      width: visW,
      height: visH,
    });
  }

  return {
    input: await pipeline.png().toBuffer(),
    left,
    top,
  };
}

async function main() {
  console.log("Loading reference collage…");
  const {
    data: collageData,
    info: { width, height, channels },
  } = await sharp(REFERENCE_JPG).raw().toBuffer({ resolveWithObject: true });

  if (channels < 3) {
    throw new Error(`Unexpected channel count: ${channels}`);
  }

  console.log(`Reference: ${width}x${height}, ${channels} channels`);

  const bg = extractBackgroundMask(collageData, width, height, channels);
  const boxes = extractComponentBoxes(bg, width, height);

  if (boxes.length !== 10) {
    throw new Error(`Expected 10 tile boxes, found ${boxes.length}`);
  }

  console.log("\nInitial boxes (sorted y,x):");
  boxes.forEach((b, i) => {
    console.log(
      `  box${i} → ${BOX_TO_TILE[i]}.jpg  (${b.x},${b.y}) ${b.w}x${b.h}`,
    );
  });

  const tileBuffers = new Map<number, Buffer>();
  for (const n of BOX_TO_TILE) {
    tileBuffers.set(
      n,
      await sharp(path.join(ABOUT_DIR, `${n}.jpg`)).toBuffer(),
    );
  }

  console.log("\nRefining rects…");
  const refined: Array<{ tile: number; rect: Rect; mae: number }> = [];

  for (let i = 0; i < boxes.length; i++) {
    const tile = BOX_TO_TILE[i];
    const result = await refineRect(
      tileBuffers.get(tile)!,
      collageData,
      width,
      height,
      channels,
      boxes[i],
    );
    refined.push({ tile, rect: result.rect, mae: result.mae });
    console.log(
      `  ${tile}.jpg → (${result.rect.x},${result.rect.y}) ` +
        `${result.rect.w}x${result.rect.h}  MAE=${result.mae.toFixed(2)}`,
    );
  }

  console.log("\nCompositing transparent PNG…");
  const composites: sharp.OverlayOptions[] = [];
  for (const { tile, rect } of refined) {
    const overlay = await buildTileOverlay(
      tileBuffers.get(tile)!,
      rect,
      width,
      height,
    );
    if (overlay) composites.push(overlay);
  }

  const transparent = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  await writeFile(OUT_PNG, transparent);
  const outMeta = await sharp(OUT_PNG).metadata();
  console.log(
    `Wrote ${OUT_PNG} (${Math.round(transparent.length / 1024)} KB, ` +
      `${outMeta.width}x${outMeta.height}, hasAlpha=${outMeta.hasAlpha})`,
  );

  await mkdir(DEBUG_DIR, { recursive: true });
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: PAPER,
    },
  })
    .composite([{ input: transparent, left: 0, top: 0 }])
    .png()
    .toFile(DEBUG_BEIGE);
  console.log(`Debug beige composite: ${DEBUG_BEIGE}`);

  const avgMae = refined.reduce((s, r) => s + r.mae, 0) / refined.length;
  console.log(`\nAverage MAE: ${avgMae.toFixed(2)}`);
  const high = refined.filter((r) => r.mae > 10);
  if (high.length) {
    console.warn(
      "Warning: tiles with MAE > 10:",
      high.map((r) => `${r.tile}.jpg=${r.mae.toFixed(2)}`).join(", "),
    );
  } else {
    console.log("All tiles within MAE ≤ 10 (near JPEG noise floor).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
