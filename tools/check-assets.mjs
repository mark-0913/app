import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const worksPath = resolve(root, "data/works.json");
const works = JSON.parse(readFileSync(worksPath, "utf8"));

const missing = [];

for (const work of works) {
  const assetPaths = [
    work.image,
    work.video,
    ...(work.images || []),
    ...(work.videos || []),
  ].filter(Boolean);

  for (const assetPath of assetPaths) {
    const fullPath = resolve(root, assetPath);
    if (!existsSync(fullPath)) {
      missing.push(`${work.title || work.id}: ${assetPath}`);
    }
  }
}

if (missing.length > 0) {
  console.error("Missing assets:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exitCode = 1;
} else {
  console.log(`OK: ${works.length} works checked.`);
}
