import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const targets = ["src/assets/streex-logo.png", "src/features/runner/assets"];

const sourceExtensions = new Set([".png", ".jpg", ".jpeg"]);
const losslessNames = new Set([
  "runner_logo_official.png",
  "runner_logo_lockup.png",
  "score_card_frame.png",
  "streex-logo.png",
]);

async function collectImages(entry) {
  const fullPath = path.join(root, entry);
  const info = await stat(fullPath);
  if (info.isFile()) {
    return sourceExtensions.has(path.extname(fullPath).toLowerCase()) ? [fullPath] : [];
  }

  const children = await readdir(fullPath, { withFileTypes: true });
  const nested = await Promise.all(
    children.map((child) => collectImages(path.join(entry, child.name))),
  );
  return nested.flat();
}

function toRelative(filePath) {
  return path.relative(root, filePath);
}

function outputPathFor(filePath) {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, `${parsed.name}.webp`);
}

function webpOptions(filePath) {
  const name = path.basename(filePath);
  if (losslessNames.has(name)) {
    return {
      lossless: true,
      effort: 6,
      nearLossless: false,
    };
  }

  return {
    quality: 86,
    alphaQuality: 92,
    effort: 6,
    smartSubsample: true,
  };
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const files = (await Promise.all(targets.map(collectImages))).flat();
const report = [];

for (const file of files) {
  const before = (await stat(file)).size;
  const output = outputPathFor(file);
  await sharp(file).rotate().webp(webpOptions(file)).toFile(output);

  const after = (await stat(output)).size;
  report.push({
    source: toRelative(file),
    output: toRelative(output),
    before,
    after,
    saved: before - after,
    reduction: before > 0 ? (1 - after / before) * 100 : 0,
  });
}

report.sort((a, b) => b.saved - a.saved);

const totalBefore = report.reduce((sum, item) => sum + item.before, 0);
const totalAfter = report.reduce((sum, item) => sum + item.after, 0);
const totalSaved = totalBefore - totalAfter;

const lines = [
  "# Image Optimization Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `Total before: ${formatKb(totalBefore)}`,
  `Total after: ${formatKb(totalAfter)}`,
  `Total saved: ${formatKb(totalSaved)} (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`,
  "",
  "| Source | Output | Before | After | Reduction |",
  "| --- | --- | ---: | ---: | ---: |",
  ...report.map(
    (item) =>
      `| ${item.source} | ${item.output} | ${formatKb(item.before)} | ${formatKb(item.after)} | ${item.reduction.toFixed(1)}% |`,
  ),
  "",
];

await writeFile(path.join(root, "docs/IMAGE_OPTIMIZATION.md"), lines.join("\n"));

console.table(
  report.slice(0, 20).map((item) => ({
    source: item.source,
    before: formatKb(item.before),
    after: formatKb(item.after),
    reduction: `${item.reduction.toFixed(1)}%`,
  })),
);
console.log(
  `Optimized ${report.length} images. Saved ${formatKb(totalSaved)} (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%).`,
);
