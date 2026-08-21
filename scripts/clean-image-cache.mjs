#!/usr/bin/env node
/**
 * Delete 0-byte files under .next image caches that poison the LRU singleton.
 * Runs automatically before `npm run dev`.
 */
import { readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";

const CACHE_DIRS = [".next/dev/cache/images", ".next/cache/images"];

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else {
      try {
        const s = await stat(full);
        if (s.size === 0) {
          await unlink(full);
          console.log(`[clean-image-cache] removed 0-byte: ${full}`);
        }
      } catch {
        // file may have been removed concurrently
      }
    }
  }
}

for (const dir of CACHE_DIRS) {
  await walk(dir);
}
