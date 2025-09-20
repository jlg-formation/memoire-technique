#!/usr/bin/env bun
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface ExportGitArchiveParams {
  projectRoot: string;
  outputFile: string;
}

const isGitRepo = (dir: string): boolean => {
  try {
    execSync("git rev-parse --git-dir", { cwd: dir, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
};

const exportGitArchive = ({
  projectRoot,
  outputFile,
}: ExportGitArchiveParams): void => {
  const command = `git archive --format=zip HEAD > "${path.join("..", outputFile)}"`;
  if (process.env.NODE_ENV !== "production") {
    // WHY: Console log autorisé uniquement en dev pour debug
    console.log(`🔧 Exécution: ${command}`);
  }
  execSync(command, { cwd: projectRoot, stdio: "inherit" });
};

const printExportResult = (outputPath: string, outputFile: string): void => {
  if (!fs.existsSync(outputPath)) {
    throw new Error("Le fichier ZIP n'a pas été créé.");
  }
  const stats = fs.statSync(outputPath);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  if (process.env.NODE_ENV !== "production") {
    // WHY: Console log autorisé uniquement en dev pour debug
    console.log(`✅ Export terminé avec succès !`);
    console.log(`📦 Fichier: ${outputFile} (${sizeInMB} MB)`);
    console.log(`📍 Emplacement: ${outputPath}`);
  }
};

const main = (): void => {
  const projectRoot = path.resolve(__dirname, "..");
  const parentDir = path.resolve(projectRoot, "..");
  const projectName = path.basename(projectRoot);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
  const outputFile = `${projectName}-${timestamp}.zip`;
  const outputPath = path.join(parentDir, outputFile);

  if (process.env.NODE_ENV !== "production") {
    // WHY: Console log autorisé uniquement en dev pour debug
    console.log(`📦 Export du projet Git en cours...`);
    console.log(`📁 Répertoire: ${projectRoot}`);
    console.log(`📄 Fichier de sortie: ${outputFile}`);
    console.log(`📍 Dossier de destination: ${parentDir}`);
  }

  if (!isGitRepo(projectRoot)) {
    console.error("❌ Erreur: Ce répertoire n'est pas un dépôt Git.");
    process.exit(1);
    return;
  }

  try {
    exportGitArchive({ projectRoot, outputFile });
    printExportResult(outputPath, outputFile);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Erreur lors de l'export:", errorMessage);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}
