import { estimateMissionDaysWithCategoriesPipeline } from "./missionEstimationPipeline";
import type { Project } from "../../types/project";

// Données de test simplifiées
const testProject: Project = {
  id: "test-project",
  consultationTitle: "Test Consultation",
  nomCourt: "Test Project",
  submissionDeadline: "2024-12-31",
  submissionTime: "16:00",
  worksAmount: 1000000, // 1M€ de travaux
  creationDate: new Date().toISOString(),
  lastUpdateDate: new Date().toISOString(),
  slug: "test-project",
  groupType: "conjoint",
  participatingCompanies: [
    {
      id: "archi1",
      name: "Cabinet Architecte",
      mobilizedPeople: [
        { id: "p1", name: "Architecte Senior", dailyRate: 800 },
      ],
    },
  ],
  mandataireContactId: undefined,
  marketDocuments: [],
  memoHtml: "",
  notation: [],
  missions: {
    base: [
      { id: "aps", name: "Avant-Projet Sommaire", sigle: "APS" },
      { id: "apd", name: "Avant-Projet Définitif", sigle: "APD" },
    ],
    pse: [{ id: "dqe", name: "Devis Quantitatif Estimatif", sigle: "DQE" }],
    tranchesConditionnelles: [],
    variantes: [],
  },
  projectEstimation: {
    base: { montantCible: 0, missions: {} },
    pse: { montantCible: 0, missions: {} },
    tranchesConditionnelles: { montantCible: 0, missions: {} },
    variantes: { montantCible: 0, missions: {} },
  },
  categoryPercentages: {
    base: 8, // 8%
    pse: 2, // 2%
    tranchesConditionnelles: 1, // 1%
    variantes: 1, // 1%
  },
  recommendedPercentages: {},
  missionPriceConstraints: [],
  planningSummary: "",
  planningText: "",
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
