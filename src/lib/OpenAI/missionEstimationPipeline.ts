import type {
  ProjectEstimation,
  Project,
  MissionCategories,
} from "../../types/project";

// Types étendus pour la spécification détaillée
interface PersonAllocation {
  days: number;
  amount: number;
  justification: string;
  locked: boolean;
}

interface CompanyAllocation {
  totalAmount: number;
  locked: boolean;
  personAllocations: Record<string, PersonAllocation>;
}

interface EnhancedMissionEstimation {
  companyAllocations: Record<string, CompanyAllocation>;
  totalAmount: number;
  percentageOfCategory: number;
  percentageOfProject: number;
  differenceFromExpected: number;
}

interface EnhancedCategoryEstimation {
  [missionId: string]: EnhancedMissionEstimation;
}

interface EnhancedEstimationResult {
  base: EnhancedCategoryEstimation;
  pse: EnhancedCategoryEstimation;
  tranchesConditionnelles: EnhancedCategoryEstimation;
  variantes: EnhancedCategoryEstimation;
  totalProjectAmount: number;
  categoryTotals: {
    base: number;
    pse: number;
    tranchesConditionnelles: number;
    variantes: number;
  };
}

export async function estimateMissionDaysWithCategoriesPipeline(
  project: Project,
): Promise<ProjectEstimation> {
  // Étape 1: Initialisation de la structure
  const enhancedEstimation = initializeEstimationStructure(project);

  // Étape 2: Intégration des contraintes
  applyPriceConstraints(enhancedEstimation, project);

  // Étape 3: Allocation brute
  await performBruteAllocation(enhancedEstimation, project);

  // Étape 4: Vérification et ajustement
  await verifyAndAdjustAllocations(enhancedEstimation, project);

  // Étape 5: Justifications
  await generateJustifications(enhancedEstimation, project);

  // Étape 6: Synthèse finale
  generateFinalSynthesis(enhancedEstimation, project);

  // Conversion vers le format MissionEstimation existant pour compatibilité
  return convertToLegacyFormat(enhancedEstimation);
}

// Étape 1: Initialisation de la structure
function initializeEstimationStructure(
  project: Project,
): EnhancedEstimationResult {
  const missions = project.missions || {
    base: [],
    pse: [],
    tranchesConditionnelles: [],
    variantes: [],
  };
  const companies = project.participatingCompanies || [];

  const result: EnhancedEstimationResult = {
    base: {},
    pse: {},
    tranchesConditionnelles: {},
    variantes: {},
    totalProjectAmount: 0,
    categoryTotals: {
      base: 0,
      pse: 0,
      tranchesConditionnelles: 0,
      variantes: 0,
    },
  };

  // Initialiser chaque mission avec des allocations vides
  Object.entries(missions).forEach(([categoryKey, categoryMissions]) => {
    const category = categoryKey as keyof MissionCategories;
    categoryMissions.forEach(
      (mission: { id: string; sigle: string; name: string }) => {
        const companyAllocations: Record<string, CompanyAllocation> = {};

        companies.forEach((company) => {
          const personAllocations: Record<string, PersonAllocation> = {};

          (company.mobilizedPeople || []).forEach((person) => {
            personAllocations[person.id] = {
              days: 0,
              amount: 0,
              justification: "",
              locked: false,
            };
          });

          companyAllocations[company.id] = {
            totalAmount: 0,
            locked: false,
            personAllocations,
          };
        });

        result[category][mission.id] = {
          companyAllocations,
          totalAmount: 0,
          percentageOfCategory: 0,
          percentageOfProject: 0,
          differenceFromExpected: 0,
        };
      },
    );
  });

  return result;
}

// Étape 2: Intégration des contraintes
function applyPriceConstraints(
  estimation: EnhancedEstimationResult,
  project: Project,
): void {
  const constraints = project.missionPriceConstraints || [];

  constraints.forEach((constraint) => {
    const { missionId, companyId, imposedAmount } = constraint;

    // Trouver la mission dans la bonne catégorie
    const categories = [
      "base",
      "pse",
      "tranchesConditionnelles",
      "variantes",
    ] as const;

    for (const category of categories) {
      if (estimation[category][missionId]) {
        const missionEstimation = estimation[category][missionId];

        if (missionEstimation.companyAllocations[companyId]) {
          // Appliquer la contrainte
          missionEstimation.companyAllocations[companyId].totalAmount =
            imposedAmount;
          missionEstimation.companyAllocations[companyId].locked = true;

          // Les personAllocations restent libres mais doivent totaliser ce montant
          // (sera calculé dans l'étape 3)
        }
        break;
      }
    }
  });
}

// Étape 3: Allocation brute
async function performBruteAllocation(
  estimation: EnhancedEstimationResult,
  project: Project,
): Promise<void> {
  const worksAmount = project.worksAmount || 1000000; // Montant par défaut si non défini
  const categoryPercentages = project.categoryPercentages || {};

  // Calculer les montants cibles par catégorie
  const targetAmounts = {
    base: ((categoryPercentages.base || 8) / 100) * worksAmount,
    pse: ((categoryPercentages.pse || 2) / 100) * worksAmount,
    tranchesConditionnelles:
      ((categoryPercentages.tranchesConditionnelles || 1) / 100) * worksAmount,
    variantes: ((categoryPercentages.variantes || 1) / 100) * worksAmount,
  };

  // Pour chaque catégorie
  Object.entries(estimation).forEach(([categoryKey, categoryEstimation]) => {
    if (
      categoryKey === "totalProjectAmount" ||
      categoryKey === "categoryTotals"
    )
      return;

    const category = categoryKey as keyof MissionCategories;
    const targetAmount = targetAmounts[category];
    const missions = Object.keys(categoryEstimation);

    if (missions.length === 0) return;

    // Répartition équitable initiale entre missions
    const amountPerMission = targetAmount / missions.length;

    missions.forEach((missionId) => {
      const missionEstimation = categoryEstimation[missionId];
      const companies = Object.keys(missionEstimation.companyAllocations);

      if (companies.length === 0) return;

      companies.forEach((companyId) => {
        const companyAllocation =
          missionEstimation.companyAllocations[companyId];

        // Si l'entreprise n'est pas verrouillée, calculer une allocation
        if (!companyAllocation.locked) {
          const company = project.participatingCompanies?.find(
            (c) => c.id === companyId,
          );
          const mobilizedPeople = company?.mobilizedPeople || [];

          if (mobilizedPeople.length === 0) return;

          // Répartition équitable entre entreprises puis personnes
          const amountPerCompany = amountPerMission / companies.length;
          const amountPerPerson = amountPerCompany / mobilizedPeople.length;

          companyAllocation.totalAmount = amountPerCompany;

          mobilizedPeople.forEach((person) => {
            const dailyRate = person.dailyRate || 600; // Taux par défaut
            const days = Math.round((amountPerPerson / dailyRate) * 10) / 10; // Arrondi à 0.1 jour

            companyAllocation.personAllocations[person.id] = {
              days,
              amount: days * dailyRate,
              justification: `Allocation initiale pour ${person.name}`,
              locked: false,
            };
          });

          // Recalculer le total exact après arrondis
          companyAllocation.totalAmount = (
            Object.values(
              companyAllocation.personAllocations,
            ) as PersonAllocation[]
          ).reduce(
            (sum: number, person: PersonAllocation) => sum + person.amount,
            0,
          );
        } else {
          // Pour les entreprises verrouillées, répartir le montant imposé entre les personnes
          const company = project.participatingCompanies?.find(
            (c) => c.id === companyId,
          );
          const mobilizedPeople = company?.mobilizedPeople || [];

          if (mobilizedPeople.length === 0) return;

          const totalAmount = companyAllocation.totalAmount;
          const amountPerPerson = totalAmount / mobilizedPeople.length;

          mobilizedPeople.forEach((person) => {
            const dailyRate = person.dailyRate || 600;
            const days = Math.round((amountPerPerson / dailyRate) * 10) / 10;

            companyAllocation.personAllocations[person.id] = {
              days,
              amount: days * dailyRate,
              justification: `Répartition du montant contraint (${totalAmount}€) pour ${person.name}`,
              locked: false,
            };
          });
        }
      });

      // Calculer le total de la mission
      missionEstimation.totalAmount = (
        Object.values(
          missionEstimation.companyAllocations,
        ) as CompanyAllocation[]
      ).reduce(
        (sum: number, company: CompanyAllocation) => sum + company.totalAmount,
        0,
      );
    });
  });
}

// Étape 4: Vérification et ajustement
async function verifyAndAdjustAllocations(
  estimation: EnhancedEstimationResult,
  project: Project,
): Promise<void> {
  const worksAmount = project.worksAmount || 1000000;
  const categoryPercentages = project.categoryPercentages || {};
  const tolerance = 0.05; // ±5%

  // Calculer les totaux par catégorie
  const categories = [
    "base",
    "pse",
    "tranchesConditionnelles",
    "variantes",
  ] as const;

  categories.forEach((category) => {
    const categoryEstimation = estimation[category];
    const missions = Object.values(categoryEstimation);

    const categoryTotal = missions.reduce(
      (sum, mission) => sum + mission.totalAmount,
      0,
    );
    estimation.categoryTotals[category] = categoryTotal;

    const expectedPercentage = categoryPercentages[category] || 0;
    const expectedAmount = (expectedPercentage / 100) * worksAmount;
    const actualPercentage = (categoryTotal / worksAmount) * 100;
    const difference = actualPercentage - expectedPercentage;

    // Si l'écart dépasse la tolérance, ajuster les missions non verrouillées
    if (Math.abs(difference) > tolerance) {
      const adjustmentFactor = expectedAmount / categoryTotal;

      Object.values(categoryEstimation).forEach((mission) => {
        Object.values(mission.companyAllocations).forEach((company) => {
          if (!company.locked) {
            // Ajuster proportionnellement
            company.totalAmount *= adjustmentFactor;

            Object.values(company.personAllocations).forEach((person) => {
              person.amount *= adjustmentFactor;
              const dailyRate = person.amount / person.days || 600;
              person.days = Math.round((person.amount / dailyRate) * 10) / 10;
            });
          }
        });

        // Recalculer le total de la mission
        mission.totalAmount = Object.values(mission.companyAllocations).reduce(
          (sum, company) => sum + company.totalAmount,
          0,
        );
      });

      // Recalculer le total de la catégorie
      estimation.categoryTotals[category] = Object.values(
        categoryEstimation,
      ).reduce((sum, mission) => sum + mission.totalAmount, 0);
    }

    // Mettre à jour les pourcentages pour chaque mission
    missions.forEach((mission) => {
      mission.percentageOfProject = (mission.totalAmount / worksAmount) * 100;
      mission.percentageOfCategory =
        categoryTotal > 0 ? (mission.totalAmount / categoryTotal) * 100 : 0;
      mission.differenceFromExpected =
        mission.percentageOfProject - expectedPercentage / missions.length;
    });
  });

  // Calculer le total du projet
  estimation.totalProjectAmount = Object.values(
    estimation.categoryTotals,
  ).reduce((sum, total) => sum + total, 0);
}

// Étape 5: Génération des justifications
async function generateJustifications(
  estimation: EnhancedEstimationResult,
  project: Project,
): Promise<void> {
  const missions = project.missions || {
    base: [],
    pse: [],
    tranchesConditionnelles: [],
    variantes: [],
  };

  // Mappage des profils vers des justifications types
  const getJustificationTemplate = (
    missionSigle: string,
    personName: string,
    days: number,
  ): string => {
    const templates = {
      APS: `${days} jours prévus pour ${personName} pour l'élaboration des esquisses et l'analyse du programme.`,
      APD: `${days} jours alloués à ${personName} pour le développement de l'avant-projet définitif et la consolidation des choix techniques.`,
      PRO: `${days} jours nécessaires pour ${personName} pour la finalisation du projet et la production des pièces réglementaires.`,
      DET: `${days} jours planifiés pour ${personName} pour l'établissement des détails d'exécution et la coordination technique.`,
      VISA: `${days} jours attribués à ${personName} pour l'examen et le visa des plans d'exécution des entreprises.`,
      DQE: `${days} jours prévus pour ${personName} pour l'établissement du quantitatif et l'estimation détaillée.`,
      OPC: `${days} jours alloués à ${personName} pour l'ordonnancement, le pilotage et la coordination des travaux.`,
    };

    return (
      templates[missionSigle as keyof typeof templates] ||
      `${days} jours prévus pour ${personName} dans le cadre de la mission ${missionSigle}.`
    );
  };

  // Mettre à jour les justifications pour chaque allocation
  Object.entries(estimation).forEach(([categoryKey, categoryEstimation]) => {
    if (
      categoryKey === "totalProjectAmount" ||
      categoryKey === "categoryTotals"
    )
      return;

    const category = categoryKey as keyof MissionCategories;
    const categoryMissions = missions[category];

    Object.entries(categoryEstimation).forEach(
      ([missionId, missionEstimation]) => {
        const typedMissionEstimation =
          missionEstimation as EnhancedMissionEstimation;
        const mission = categoryMissions.find((m) => m.id === missionId);
        const missionSigle = mission?.sigle || missionId;

        Object.entries(typedMissionEstimation.companyAllocations).forEach(
          ([companyId, companyAllocation]) => {
            const typedCompanyAllocation =
              companyAllocation as CompanyAllocation;
            const company = project.participatingCompanies?.find(
              (c) => c.id === companyId,
            );

            Object.entries(typedCompanyAllocation.personAllocations).forEach(
              ([personId, personAllocation]) => {
                const typedPersonAllocation =
                  personAllocation as PersonAllocation;
                const person = company?.mobilizedPeople?.find(
                  (p) => p.id === personId,
                );
                const personName = person?.name || "Intervenant";

                if (typedPersonAllocation.days > 0) {
                  typedPersonAllocation.justification =
                    getJustificationTemplate(
                      missionSigle,
                      personName,
                      typedPersonAllocation.days,
                    );
                }
              },
            );
          },
        );
      },
    );
  });
}

// Étape 6: Synthèse finale
function generateFinalSynthesis(
  estimation: EnhancedEstimationResult,
  project: Project,
): void {
  // Cette fonction pourrait générer des tableaux de synthèse
  // Pour l'instant, nous logguons les données structurées
  console.log("Synthèse finale:", {
    categoryTotals: estimation.categoryTotals,
    totalProject: estimation.totalProjectAmount,
    targetAmount: project.worksAmount,
    complianceStatus: "validated", // Logique de validation à implémenter
  });
}

// Conversion vers le format legacy pour compatibilité
function convertToLegacyFormat(
  estimation: EnhancedEstimationResult,
): ProjectEstimation {
  const result: ProjectEstimation = {
    base: {},
    pse: {},
    tranchesConditionnelles: {},
    variantes: {},
  };

  Object.entries(estimation).forEach(([categoryKey, categoryEstimation]) => {
    if (
      categoryKey === "totalProjectAmount" ||
      categoryKey === "categoryTotals"
    )
      return;

    const category = categoryKey as keyof MissionCategories;

    Object.entries(categoryEstimation).forEach(
      ([missionId, missionEstimation]) => {
        const typedMissionEstimation =
          missionEstimation as EnhancedMissionEstimation;
        result[category][missionId] = {};

        Object.entries(typedMissionEstimation.companyAllocations).forEach(
          ([companyId, companyAllocation]) => {
            const typedCompanyAllocation =
              companyAllocation as CompanyAllocation;
            result[category][missionId][companyId] = {};

            Object.entries(typedCompanyAllocation.personAllocations).forEach(
              ([personId, personAllocation]) => {
                const typedPersonAllocation =
                  personAllocation as PersonAllocation;
                result[category][missionId][companyId][personId] = {
                  nombreDeJours: typedPersonAllocation.days,
                  justification: typedPersonAllocation.justification,
                };
              },
            );
          },
        );
      },
    );
  });

  return result;
}
