import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const target = process.argv[2];
if (!target) process.exit(2);

const source = (await stat(target)).isDirectory()
  ? await readFile(join(target, "packages/behaviors/src/date-picker.ts"), "utf8")
  : await readFile(target, "utf8");

const requiredContract = [
  "DatePickerController",
  "calendar.setConstraints",
  "compareIsoDates",
  "shlz:date-picker-change",
];

if (requiredContract.some((marker) => !source.includes(marker))) process.exit(1);
