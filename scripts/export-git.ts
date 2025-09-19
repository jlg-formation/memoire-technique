#!/usr/bin/env bun
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const parentDir = path.resolve(projectRoot, "..");
  const projectName = path.basename(projectRoot);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
  const outputFile = `${projectName}-${timestamp}.zip`;
  const outputPath = path.join(parentDir, outputFile);

  try {
    console.log(`📦 Export du projet Git en cours...`);
    console.log(`📁 Répertoire: ${projectRoot}`);
    console.log(`📄 Fichier de sortie: ${outputFile}`);
    console.log(`📍 Dossier de destination: ${parentDir}`);

    // Vérifier que nous sommes dans un dépôt Git
    try {
      execSync("git rev-parse --git-dir", {
        cwd: projectRoot,
        stdio: "pipe",
      });
    } catch {
      console.error("❌ Erreur: Ce répertoire n'est pas un dépôt Git.");
      process.exit(1);
    }

    // Exporter le projet avec git archive
    const command = `git archive --format=zip HEAD > "${path.join("..", outputFile)}"`;
    console.log(`🔧 Exécution: ${command}`);

    execSync(command, {
      cwd: projectRoot,
      stdio: "inherit",
    });

    // Vérifier que le fichier a été créé
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ Export terminé avec succès !`);
      console.log(`📦 Fichier: ${outputFile} (${sizeInMB} MB)`);
      console.log(`📍 Emplacement: ${outputPath}`);
    } else {
      console.error("❌ Erreur: Le fichier ZIP n'a pas été créé.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'export:", error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
main();
