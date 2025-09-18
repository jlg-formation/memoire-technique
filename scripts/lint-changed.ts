import { execSync } from "child_process";

function getChangedFiles(exts: string[]): string[] {
  try {
    // Fichiers modifiés
    const changedOutput = execSync("git diff --name-only HEAD 2>&1", {
      encoding: "utf-8",
    });
    // Fichiers untracked
    const untrackedOutput = execSync(
      "git ls-files --others --exclude-standard 2>&1",
      { encoding: "utf-8" },
    );
    const allFiles = changedOutput + "\n" + untrackedOutput;
    return allFiles
      .split("\n")
      .map((f) => f.trim())
      .filter(
        (f) =>
          f.length > 0 &&
          exts.some((ext) => f.endsWith(ext)) &&
          !f.toLowerCase().includes("warning:") &&
          !f.toLowerCase().includes("git warning"),
      );
  } catch {
    return [];
  }
}

const files = getChangedFiles([".js", ".ts", ".tsx"]);
if (files.length === 0) {
  console.log("Aucun fichier modifié à lint.");
  process.exit(0);
}

try {
  execSync(`bunx eslint ${files.join(" ")}`, { stdio: "inherit" });
} catch {
  process.exit(1);
}
