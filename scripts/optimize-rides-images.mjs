import { stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const images = [
  { name: "slc", width: 1200 },
  { name: "park-city", width: 1200 },
  { name: "airport", width: 1200 },
  { name: "mountains", width: 1200 },
  { name: "rav4", width: 960 },
  { name: "juan", width: 480 },
];

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const report = [];

for (const image of images) {
  const source = path.join(root, "public/images/streex", `${image.name}.jpg`);
  const output = path.join(root, "public/images/streex", `${image.name}.webp`);
  const before = (await stat(source)).size;

  await sharp(source)
    .rotate()
    .resize({ width: image.width, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90, effort: 6, smartSubsample: true })
    .toFile(output);

  const after = (await stat(output)).size;
  report.push({
    source: path.relative(root, source),
    output: path.relative(root, output),
    before,
    after,
    reduction: before > 0 ? (1 - after / before) * 100 : 0,
  });
}

const totalBefore = report.reduce((total, image) => total + image.before, 0);
const totalAfter = report.reduce((total, image) => total + image.after, 0);
const lines = [
  "# Rides Image Optimization",
  "",
  `Total before: ${formatKb(totalBefore)}`,
  `Total after: ${formatKb(totalAfter)}`,
  `Total saved: ${formatKb(totalBefore - totalAfter)} (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`,
  "",
  "| Source | Output | Before | After | Reduction |",
  "| --- | --- | ---: | ---: | ---: |",
  ...report.map(
    (image) =>
      `| ${image.source} | ${image.output} | ${formatKb(image.before)} | ${formatKb(image.after)} | ${image.reduction.toFixed(1)}% |`,
  ),
  "",
];

await writeFile(path.join(root, "docs/RIDES_IMAGE_OPTIMIZATION.md"), lines.join("\n"));

console.table(
  report.map((image) => ({
    image: image.output,
    before: formatKb(image.before),
    after: formatKb(image.after),
    reduction: `${image.reduction.toFixed(1)}%`,
  })),
);
