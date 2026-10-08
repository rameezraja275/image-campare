import fs from "node:fs";
import path from "node:path";
import Comparator, { type Pair } from "./Comparator";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
// Accept both "_enhanced" and the "_ehanced" spelling
const ENHANCED_RE = /^(.*)_(enhanced|ehanced)$/i;

function findPairs(): Pair[] {
  // Folder is gitignored, so it may be missing (e.g. a fresh clone or Git deploy)
  if (!fs.existsSync(PHOTOS_DIR)) return [];
  const files = fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()));

  const originals = new Map<string, string>();
  const enhanced = new Map<string, string>();
  for (const f of files) {
    const stem = path.parse(f).name;
    const m = stem.match(ENHANCED_RE);
    if (m) enhanced.set(m[1].toLowerCase(), f);
    else originals.set(stem.toLowerCase(), f);
  }

  return [...originals.keys()]
    .sort()
    .filter((key) => enhanced.has(key))
    .map((key) => {
      const orig = originals.get(key)!;
      return {
        name: path.parse(orig).name,
        original: `/photos/${encodeURIComponent(orig)}`,
        enhanced: `/photos/${encodeURIComponent(enhanced.get(key)!)}`,
      };
    });
}

export default function Page() {
  return <Comparator pairs={findPairs()} />;
}
