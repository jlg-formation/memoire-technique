import { estimateMissionDaysWithCategoriesPipeline } from "./missionEstimationPipeline";
import type { Project } from "../../types/project";

// Données de test simplifiées
const testProject: Project = {
  id: "test-project",
  consultationTitle: "Test Consultation",
  submissionDeadline: "2024-12-31",
  creationDate: new Date().toISOString(),
  lastUpdateDate: new Date().toISOString(),
  slug: "test-project",
  worksAmount: 1000000, // 1M€ de travaux
  categoryPercentages: {
    base: 8, // 8%
    pse: 2, // 2%
    tranchesConditionnelles: 1, // 1%
    variantes: 1, // 1%
  },
  missions: {
    base: [
      { id: "aps", name: "Avant-Projet Sommaire", sigle: "APS" },
      { id: "apd", name: "Avant-Projet Définitif", sigle: "APD" },
    ],
    pse: [{ id: "dqe", name: "Devis Quantitatif Estimatif", sigle: "DQE" }],
    tranchesConditionnelles: [],
    variantes: [],
  },
  participatingCompanies: [
    {
      id: "archi1",
      name: "Cabinet Architecte",
      mobilizedPeople: [
        { id: "p1", name: "Architecte Senior", dailyRate: 800 },
      ],
    },
  ],
};

async function testPipeline() {
  console.log("🔬 Test de la pipeline d'estimation...");

  try {
    const result = await estimateMissionDaysWithCategoriesPipeline(testProject);

    console.log("✅ Pipeline exécutée avec succès");
    console.log("📊 Résultats:", JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution:", error);
    throw error;
  }
}

// Auto-exécution pour test
testPipeline()
  .then(() => {
    console.log("Test terminé avec succès");
  })
  .catch((error) => {
    console.error("Test échoué:", error);
  });

export { testPipeline, testProject };
