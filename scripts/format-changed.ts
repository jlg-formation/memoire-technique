import { execSync } from "child_process";

function getChangedFiles(exts: string[]): string[] {
  try {
    // Fichiers modifiés (exclut les fichiers supprimés)
    const changedOutput = execSync("git diff --name-status HEAD 2>&1", {
      encoding: "utf-8",
    });
    // Fichiers untracked
    const untrackedOutput = execSync(
      "git ls-files --others --exclude-standard 2>&1",
      { encoding: "utf-8" },
    );

    // Parser les fichiers modifiés en excluant les supprimés (status 'D')
    const modifiedFiles = changedOutput
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) => line.length > 0 && !line.toLowerCase().includes("warning"),
      )
      .map((line) => {
        const parts = line.split(/\s+/);
        const status = parts[0];
        const filename = parts.slice(1).join(" ");
        return { status, filename };
      })
      .filter((file) => file.status !== "D") // Exclut les fichiers supprimés
      .map((file) => file.filename);

    const untrackedFiles = untrackedOutput
      .split("\n")
      .map((f) => f.trim())
      .filter(
        (f) =>
          f.length > 0 &&
          !f.toLowerCase().includes("warning:") &&
          !f.toLowerCase().includes("git warning"),
      );

    const allFiles = [...modifiedFiles, ...untrackedFiles];
    return allFiles.filter(
      (f) => f.length > 0 && exts.some((ext) => f.endsWith(ext)),
    );
  } catch {
    return [];
  }
}

const files = getChangedFiles([".js", ".ts", ".tsx", ".css", ".json", ".md"]);
if (files.length === 0) {
  console.log("Aucun fichier modifié à formater.");
  process.exit(0);
}

try {
  execSync(`bunx prettier --write ${files.join(" ")}`, { stdio: "inherit" });
} catch {
  process.exit(1);
}
