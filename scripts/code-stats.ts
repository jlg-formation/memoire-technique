import fs from "fs";
import path from "path";

// Recursively get all files in a directory
function getAllFiles(
  directory: string,
  extensionFilter: string[] = [".ts", ".tsx"],
): string[] {
  try {
    const fileList = fs.readdirSync(directory);

    return fileList.flatMap((fileName) => {
      const filePath = path.join(directory, fileName);
      const fileStats = fs.statSync(filePath);

      if (fileStats.isDirectory()) {
        return getAllFiles(filePath, extensionFilter);
      }

      const fileExtension = path.extname(fileName);
      if (extensionFilter.includes(fileExtension)) {
        return [filePath];
      }

      return [];
    });
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}

// Count lines in a file
function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split(/\r?\n/).length;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return 0;
  }
}

interface FileStatistics {
  file: string;
  lines: number;
}

function main(): void {
  try {
    const sourceDirectory = path.resolve(__dirname, "../src");
    const files = getAllFiles(sourceDirectory);
    const fileStatistics: FileStatistics[] = files.map((file) => ({
      file: path.relative(process.cwd(), file),
      lines: countLines(file),
    }));

    // Find max lengths for columns
    const fileColumnWidth =
      Math.max(...fileStatistics.map((stats) => stats.file.length), 4) + 2;
    const linesColumnWidth =
      Math.max(
        ...fileStatistics.map((stats) => String(stats.lines).length),
        5,
      ) + 2;

    // Print header
    const header = `${"File".padEnd(fileColumnWidth)}${"Lines".padStart(linesColumnWidth)}`;
    console.log(header);
    console.log("-".repeat(fileColumnWidth + linesColumnWidth));

    // Print each row
    fileStatistics.forEach(({ file, lines }) => {
      console.log(
        `${file.padEnd(fileColumnWidth)}${String(lines).padStart(linesColumnWidth)}`,
      );
    });

    // Print total
    const totalLines = fileStatistics.reduce(
      (sum, { lines }) => sum + lines,
      0,
    );
    console.log("-".repeat(fileColumnWidth + linesColumnWidth));
    console.log(
      `${"Total".padEnd(fileColumnWidth)}${String(totalLines).padStart(linesColumnWidth)}`,
    );
  } catch (error) {
    console.error("Error generating code statistics:", error);
    process.exit(1);
  }
}

main();
