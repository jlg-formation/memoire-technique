import fs from "fs";
import path from "path";

// Recursively get all files in a directory
function getAllFiles(
  dir: string,
  extFilter: string[] = [".ts", ".tsx"],
): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extFilter));
    } else if (extFilter.includes(path.extname(file))) {
      results.push(filePath);
    }
  });
  return results;
}

// Count lines in a file
function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, "utf-8");
  return content.split(/\r?\n/).length;
}

function main() {
  const srcDir = path.resolve(__dirname, "../src");
  const files = getAllFiles(srcDir);
  const stats = files.map((file) => ({
    file: path.relative(process.cwd(), file),
    lines: countLines(file),
  }));

  // Find max lengths for columns
  const fileColWidth = Math.max(...stats.map((s) => s.file.length), 4) + 2;
  const linesColWidth =
    Math.max(...stats.map((s) => String(s.lines).length), 5) + 2;

  // Print header
  const header = `${"File".padEnd(fileColWidth)}${"Lines".padStart(linesColWidth)}`;
  console.log(header);
  console.log("-".repeat(fileColWidth + linesColWidth));

  // Print each row
  stats.forEach(({ file, lines }) => {
    console.log(
      `${file.padEnd(fileColWidth)}${String(lines).padStart(linesColWidth)}`,
    );
  });

  // Print total
  const total = stats.reduce((sum, { lines }) => sum + lines, 0);
  console.log("-".repeat(fileColWidth + linesColWidth));
  console.log(
    `${"Total".padEnd(fileColWidth)}${String(total).padStart(linesColWidth)}`,
  );
}

main();
