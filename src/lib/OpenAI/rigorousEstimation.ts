import type {
  Project,
  MissionCategories,
  ProjectEstimation,
  Mission,
} from "../../types/project";
import createClient from "./client";
import { useIAHistoryStore } from "../../store/useIAHistoryStore";

/**
 * Interface pour la réponse d'OpenAI de l'estimation rigoureuse
 */
interface RigorousEstimationResponse {
  estimations: {
    [category: string]: {
      [missionId: string]: {
        [companyId: string]: {
          [personId: string]: {
            nombreDeJours: number;
            montantAlloue: number;
            justificationTechnique: string;
            justificationBudgetaire: string;
          };
        };
      };
    };
  };
  resumeOptimisation: string;
  respectConstraints: boolean;
  respectBudget: boolean;
  ajustementsAppliques: string[];
}

/**
 * Estimation IA rigoureuse qui respecte strictement :
 * - Le budget global prévu pour chaque catégorie de missions
 * - Les contraintes de prix imposées par les entreprises
 * - Une répartition intelligente entre les personnes mobilisées selon leurs taux
 * - Les compétences requises pour chaque mission
 */
export async function performRigorousEstimation(
  project: Project,
  missionId?: string, // Si fourni, ne réestime que cette mission
): Promise<ProjectEstimation> {
  if (!project) {
    throw new Error("Projet requis pour l'estimation rigoureuse");
  }

  if (!project.missions) {
    throw new Error("Aucune mission définie dans le projet");
  }

  if (
    !project.participatingCompanies ||
    project.participatingCompanies.length === 0
  ) {
    throw new Error("Aucune entreprise participante définie");
  }

  if (!project.worksAmount) {
    throw new Error("Montant global des travaux requis");
  }

  if (!project.categoryPercentages) {
    throw new Error("Pourcentages par catégorie de missions requis");
  }

  const openai = createClient();
  const missions = project.missions;
  const companies = project.participatingCompanies;
  const constraints = project.missionPriceConstraints || [];
  const worksAmount = project.worksAmount;
  const categoryPercentages = project.categoryPercentages;

  // Calculer les budgets cibles par catégorie
  const budgetTargets = {
    base: ((categoryPercentages.base || 0) * worksAmount) / 100,
    pse: ((categoryPercentages.pse || 0) * worksAmount) / 100,
    tranchesConditionnelles:
      ((categoryPercentages.tranchesConditionnelles || 0) * worksAmount) / 100,
    variantes: ((categoryPercentages.variantes || 0) * worksAmount) / 100,
  };

  // Construction du contexte détaillé pour l'IA
  const contextBuilder = [];

  // Informations du projet
  contextBuilder.push(
    `# PROJET: ${project.consultationTitle || "Projet sans titre"}`,
  );
  contextBuilder.push(
    `Montant global des travaux: ${worksAmount.toLocaleString("fr-FR")} € HT`,
  );
  contextBuilder.push("");

  // Budgets cibles par catégorie
  contextBuilder.push("## BUDGETS CIBLES PAR CATÉGORIE:");
  Object.entries(budgetTargets).forEach(([cat, budget]) => {
    const percentage =
      categoryPercentages[cat as keyof typeof categoryPercentages] || 0;
    if (percentage > 0) {
      contextBuilder.push(
        `- ${cat.toUpperCase()}: ${budget.toLocaleString("fr-FR")} € HT (${percentage}%)`,
      );
    }
  });
  contextBuilder.push("");

  // Missions par catégorie (filtrer si missionId spécifié)
  Object.entries(missions).forEach(([categoryKey, categoryMissions]) => {
    const filteredMissions = missionId
      ? categoryMissions.filter((m: Mission) => m.id === missionId)
      : categoryMissions;

    if (filteredMissions.length > 0) {
      contextBuilder.push(`### MISSIONS - ${categoryKey.toUpperCase()}:`);
      filteredMissions.forEach((mission: Mission) => {
        contextBuilder.push(
          `- **${mission.sigle}** (ID: ${mission.id}): ${mission.name}`,
        );
        if (mission.description) {
          contextBuilder.push(`  Description CCTP: ${mission.description}`);
        }
      });
      contextBuilder.push("");
    }
  });

  // Entreprises et personnes mobilisées
  contextBuilder.push("## ENTREPRISES ET PERSONNES MOBILISÉES:");
  companies.forEach((company) => {
    contextBuilder.push(`### ${company.name} (ID: ${company.id})`);
    if (company.mobilizedPeople && company.mobilizedPeople.length > 0) {
      company.mobilizedPeople.forEach((person) => {
        const rate = person.dailyRate || 600;
        contextBuilder.push(`- **${person.name}** (ID: ${person.id})`);
        contextBuilder.push(`  Taux journalier: ${rate} € HT/jour`);
        if (person.cvSummary) {
          contextBuilder.push(`  Compétences: ${person.cvSummary}`);
        }
      });
    } else {
      contextBuilder.push("- Aucune personne mobilisée définie");
    }
    contextBuilder.push("");
  });

  // Contraintes de prix imposées
  if (constraints.length > 0) {
    contextBuilder.push("## CONTRAINTES DE PRIX IMPOSÉES:");
    constraints.forEach((constraint) => {
      const mission = Object.values(missions)
        .flat()
        .find((m) => m.id === constraint.missionId);
      const company = companies.find((c) => c.id === constraint.companyId);
      contextBuilder.push(
        `- Mission **${mission?.sigle || constraint.missionId}** pour **${company?.name || constraint.companyId}**: ${constraint.imposedAmount.toLocaleString("fr-FR")} € HT`,
      );
      if (constraint.justification) {
        contextBuilder.push(`  Justification: ${constraint.justification}`);
      }
    });
    contextBuilder.push("");
  }

  // Estimation actuelle (pour comparaison si c'est une réestimation)
  if (project.projectEstimation && missionId) {
    contextBuilder.push("## ESTIMATION ACTUELLE (pour comparaison):");
    Object.entries(project.projectEstimation).forEach(
      ([categoryKey, categoryEstimation]) => {
        if (categoryEstimation.missions[missionId]) {
          contextBuilder.push(
            `### ${categoryKey.toUpperCase()} - Mission ${missionId}:`,
          );
          Object.entries(
            categoryEstimation.missions[missionId].companies,
          ).forEach(([companyId, companyEstimation]) => {
            const company = companies.find((c) => c.id === companyId);
            contextBuilder.push(`**${company?.name || companyId}:**`);
            Object.entries(companyEstimation.persons).forEach(
              ([personId, personEstimation]) => {
                const person = company?.mobilizedPeople?.find(
                  (p) => p.id === personId,
                );
                contextBuilder.push(
                  `- ${person?.name || personId}: ${personEstimation.nombreDeJours} jours`,
                );
              },
            );
          });
        }
      },
    );
    contextBuilder.push("");
  }

  const contextPrompt = contextBuilder.join("\n");

  const systemPrompt = `Tu es un expert en estimation de missions de maîtrise d'œuvre.

MISSION: Effectuer une estimation rigoureuse qui respecte ABSOLUMENT:
1. Le budget global alloué à chaque catégorie de missions
2. Les contraintes de prix imposées par les entreprises
3. Une répartition optimale entre les personnes selon leurs taux journaliers et compétences

CONTRAINTES STRICTES:
- Le total par catégorie NE DOIT PAS dépasser le budget cible
- Les contraintes de prix imposées DOIVENT être respectées exactement
- La répartition entre personnes doit être cohérente avec leurs taux journaliers
- Privilégier les personnes avec les compétences les plus adaptées
- Optimiser le ratio compétence/coût

PROCESSUS:
1. Identifier les missions contraintes (prix imposé) et les verrouiller
2. Calculer le budget restant disponible par catégorie
3. Répartir le budget restant sur les missions non contraintes
4. Pour chaque mission, répartir entre entreprises puis entre personnes
5. Vérifier que tous les totaux respectent les contraintes

FORMAT DE RÉPONSE REQUIS: JSON strictement conforme au schéma suivant`;

  const jsonSchema = {
    type: "object",
    properties: {
      estimations: {
        type: "object",
        patternProperties: {
          "^(base|pse|tranchesConditionnelles|variantes)$": {
            type: "object",
            patternProperties: {
              ".*": {
                // missionId
                type: "object",
                patternProperties: {
                  ".*": {
                    // companyId
                    type: "object",
                    patternProperties: {
                      ".*": {
                        // personId
                        type: "object",
                        properties: {
                          nombreDeJours: { type: "number", minimum: 0 },
                          montantAlloue: { type: "number", minimum: 0 },
                          justificationTechnique: { type: "string" },
                          justificationBudgetaire: { type: "string" },
                        },
                        required: [
                          "nombreDeJours",
                          "montantAlloue",
                          "justificationTechnique",
                          "justificationBudgetaire",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      resumeOptimisation: { type: "string" },
      respectConstraints: { type: "boolean" },
      respectBudget: { type: "boolean" },
      ajustementsAppliques: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "estimations",
      "resumeOptimisation",
      "respectConstraints",
      "respectBudget",
      "ajustementsAppliques",
    ],
    additionalProperties: false,
  };

  const userPrompt = missionId
    ? `${contextPrompt}\n\n**RÉESTIMATION CIBLÉE**: Réestimer uniquement la mission ID "${missionId}" en tenant compte de toutes les contraintes globales.`
    : `${contextPrompt}\n\n**ESTIMATION COMPLÈTE**: Estimer toutes les missions en respectant rigoureusement tous les budgets et contraintes.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rigorous_estimation",
          schema: jsonSchema,
          strict: true,
        },
      },
      temperature: 0.1, // Faible température pour plus de cohérence
      max_tokens: 8000,
    });

    const result = JSON.parse(
      completion.choices[0].message.content || "{}",
    ) as RigorousEstimationResponse;

    // Enregistrer dans l'historique IA
    useIAHistoryStore.getState().addEntry({
      timestamp: Date.now(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response: result,
      context: `rigorousEstimation${missionId ? "_single_" + missionId : "_complete"}`,
    });

    // Validation des résultats
    if (!result.respectConstraints || !result.respectBudget) {
      console.warn(
        "⚠️ L'estimation IA indique que certaines contraintes ne sont pas respectées:",
        {
          constraintsRespected: result.respectConstraints,
          budgetRespected: result.respectBudget,
          adjustments: result.ajustementsAppliques,
        },
      );
    }

    // Conversion vers le format MissionEstimation
    const missionEstimation: ProjectEstimation = {
      base: { montantCible: 0, missions: {} },
      pse: { montantCible: 0, missions: {} },
      tranchesConditionnelles: { montantCible: 0, missions: {} },
      variantes: { montantCible: 0, missions: {} },
    };

    Object.entries(result.estimations).forEach(
      ([categoryKey, categoryEstimations]) => {
        const category = categoryKey as keyof MissionCategories;

        Object.entries(categoryEstimations).forEach(
          ([missionIdKey, missionEstimations]) => {
            if (!missionEstimation[category].missions[missionIdKey]) {
              missionEstimation[category].missions[missionIdKey] = {
                montantCible: 0,
                companies: {},
              };
            }

            Object.entries(missionEstimations).forEach(
              ([companyId, companyEstimations]) => {
                if (
                  !missionEstimation[category].missions[missionIdKey].companies[
                    companyId
                  ]
                ) {
                  missionEstimation[category].missions[missionIdKey].companies[
                    companyId
                  ] = {
                    montantCible: 0,
                    isLocked: false,
                    persons: {},
                  };
                }

                Object.entries(companyEstimations).forEach(
                  ([personId, personEstimation]) => {
                    missionEstimation[category].missions[
                      missionIdKey
                    ].companies[companyId].persons[personId] = {
                      nombreDeJours: personEstimation.nombreDeJours,
                      justification: `${personEstimation.justificationTechnique} | Budget: ${personEstimation.justificationBudgetaire}`,
                    };
                  },
                );
              },
            );
          },
        );
      },
    );

    console.log("✅ Estimation rigoureuse terminée:", {
      constraintsRespected: result.respectConstraints,
      budgetRespected: result.respectBudget,
      summary: result.resumeOptimisation,
    });

    return missionEstimation;
  } catch (error) {
    console.error("❌ Erreur lors de l'estimation rigoureuse:", error);
    throw new Error(
      `Échec de l'estimation rigoureuse: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
    );
  }
}
