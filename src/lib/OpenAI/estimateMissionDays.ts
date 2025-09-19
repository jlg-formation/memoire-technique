import type { ChatCompletionMessageParam } from "openai/resources";
import { useIAHistoryStore } from "../../store/useIAHistoryStore";
import type {
  MissionCategories,
  MissionEstimation,
  MissionPriceConstraint,
  MobilizedPerson,
  ParticipatingCompany,
  AIRecommendedPercentages,
} from "../../types/project";
import createClient from "./client";

export type MissionDayEstimation = {
  [mission: string]: {
    [companyId: string]: {
      [personId1: string]: {
        nombreDeJours: number;
        justification: string;
      };
    };
  };
};

export interface CategoryTargetAmounts {
  base?: number;
  pse?: number;
  tranchesConditionnelles?: number;
  variantes?: number;
}

const responseFormat = {
  type: "json_schema" as const,
  json_schema: {
    name: "MissionDayEstimation",
    schema: {
      type: "object",
      properties: {},
      additionalProperties: {
        type: "object",
        properties: {},
        additionalProperties: {
          type: "object",
          properties: {},
          additionalProperties: {
            type: "object",
            properties: {},
            additionalProperties: {
              type: "object",
              properties: {
                nombreDeJours: { type: "number" },
                justification: { type: "string" },
              },
              required: ["nombreDeJours", "justification"],
            },
          },
        },
      },
    },
  },
};

export async function estimateMissionDaysWithCategories(
  missionCategories: MissionCategories,
  companies: ParticipatingCompany[],
  categoryTargetAmounts: CategoryTargetAmounts,
  priceConstraints: MissionPriceConstraint[] = [],
  aiRecommendedPercentages?: AIRecommendedPercentages,
): Promise<MissionEstimation> {
  const openai = createClient();

  // TODO: Utiliser aiRecommendedPercentages pour enrichir le prompt avec les recommandations IA
  console.log("AI recommendations available:", !!aiRecommendedPercentages);

  // Calculer le montant total des contraintes de prix
  const totalConstrainedAmount = priceConstraints.reduce(
    (sum, constraint) => sum + constraint.imposedAmount,
    0,
  );

  const totalTargetAmount = Object.values(categoryTargetAmounts).reduce(
    (sum, amount) => sum + (amount || 0),
    0,
  );

  // Les budgets par catégorie restent inchangés car l'IA doit respecter le budget total
  // en ajustant les jours pour les contraintes
  const adjustedCategoryTargetAmounts = { ...categoryTargetAmounts };

  // Prompt utilisateur markdown multiligne avec informations par catégorie
  let userPrompt = `# Répartition par catégories de missions

`;

  if (missionCategories.base.length > 0 && adjustedCategoryTargetAmounts.base) {
    userPrompt += `## Missions de Base (Budget: ${adjustedCategoryTargetAmounts.base.toLocaleString()} €)
${missionCategories.base
  .map((m) => {
    let missionInfo = `- ${m.name} (${m.sigle}) (id: ${m.id})`;
    if (m.description) {
      missionInfo += `\n  **Description CCTP**: ${m.description}`;
    }
    return missionInfo;
  })
  .join("\n")}

`;
  }

  if (missionCategories.pse.length > 0 && adjustedCategoryTargetAmounts.pse) {
    userPrompt += `## Prestations Supplémentaires Éventuelles (Budget: ${adjustedCategoryTargetAmounts.pse.toLocaleString()} €)
${missionCategories.pse
  .map((m) => {
    let missionInfo = `- ${m.name} (${m.sigle}) (id: ${m.id})`;
    if (m.description) {
      missionInfo += `\n  **Description CCTP**: ${m.description}`;
    }
    return missionInfo;
  })
  .join("\n")}

`;
  }

  if (
    missionCategories.tranchesConditionnelles.length > 0 &&
    adjustedCategoryTargetAmounts.tranchesConditionnelles
  ) {
    userPrompt += `## Tranches Conditionnelles (Budget: ${adjustedCategoryTargetAmounts.tranchesConditionnelles.toLocaleString()} €)
${missionCategories.tranchesConditionnelles
  .map((m) => {
    let missionInfo = `- ${m.name} (${m.sigle}) (id: ${m.id})`;
    if (m.description) {
      missionInfo += `\n  **Description CCTP**: ${m.description}`;
    }
    return missionInfo;
  })
  .join("\n")}

`;
  }

  if (
    missionCategories.variantes.length > 0 &&
    adjustedCategoryTargetAmounts.variantes
  ) {
    userPrompt += `## Variantes (Budget: ${adjustedCategoryTargetAmounts.variantes.toLocaleString()} €)
${missionCategories.variantes
  .map((m) => {
    let missionInfo = `- ${m.name} (${m.sigle}) (id: ${m.id})`;
    if (m.description) {
      missionInfo += `\n  **Description CCTP**: ${m.description}`;
    }
    return missionInfo;
  })
  .join("\n")}

`;
  }

  userPrompt += `# Intervenants
${companies
  .map((c) => {
    const people = (c.mobilizedPeople ?? [])
      .map((p: MobilizedPerson) => {
        let cvInfo = "";
        if (p.cvSummary) {
          cvInfo += `\n    **CV résumé**: ${p.cvSummary}`;
        }
        return `  - ${p.name} (id:${p.id}, taux ${p.dailyRate ?? 0} €/j)${cvInfo}`;
      })
      .join("\n");
    return `- ${c.name} (id:${c.id})\n${people}`;
  })
  .join("\n")}
`;

  // Ajouter les contraintes de prix si présentes
  if (priceConstraints.length > 0) {
    userPrompt += `
# Contraintes de prix imposées

**IMPORTANT** : Les missions suivantes ont des prix FIXES imposés par les entreprises. 
Tu DOIS QUAND MÊME estimer la décomposition par personne pour ces missions, mais en adaptant les jours pour respecter le montant imposé :

${priceConstraints
  .map((constraint) => {
    const company = companies.find((c) => c.id === constraint.companyId);
    return `- Mission ${constraint.missionId} par ${company?.name}: **EXACTEMENT ${constraint.imposedAmount.toLocaleString()} €** (${constraint.justification})`;
  })
  .join("\n")}

**Total des contraintes**: ${totalConstrainedAmount.toLocaleString()} €
**Budget restant à estimer pour les autres missions**: ${(totalTargetAmount - totalConstrainedAmount).toLocaleString()} €

`;
  }

  userPrompt += `
**CONTRAINTE PRINCIPALE** : Respecte les budgets par catégorie de missions${priceConstraints.length > 0 ? " ET les contraintes de prix imposées" : ""}. 
- Le coût total des missions de chaque catégorie doit correspondre exactement au budget alloué à cette catégorie.
- Répartis les jours de missions en tenant compte des taux journaliers pour atteindre ces budgets.
${priceConstraints.length > 0 ? "- Pour les missions avec contraintes de prix : estime QUAND MÊME la répartition des jours par personne, mais ajuste pour que le total de la mission/entreprise = montant imposé EXACTEMENT." : ""}
- Budget total à atteindre pour l'estimation : ${totalTargetAmount.toLocaleString()} €
`;

  userPrompt += `
IMPORTANT : Respecte strictement les contraintes suivantes :
- Chaque mission peut être réalisée par plusieurs personnes. Répartis les jours de manière optimale entre les intervenants disponibles.
- Évite d'attribuer zéro jour à une personne mobilisée, sauf si cela est clairement justifié par un manque de pertinence ou de compétence pour la mission.
- Fournis des justifications détaillées et spécifiques pour chaque attribution, en tenant compte de :
  * Les descriptions CCTP de chaque mission (si disponibles) pour adapter l'estimation aux spécificités du projet
  * Les compétences particulières, l'expérience ou la pertinence de chaque personne pour les exigences spécifiques de la mission
  * Les aspects techniques ou complexités particulières mentionnées dans le CCTP
- Dans les justifications, mentionne toujours le prénom et le nom complet de chaque salarié mobilisé. Évite les familiarités ou les formulations informelles.
- Les représentants des entreprises doivent être préférés aux autres personnes mobilisées pour les missions, car ils sont les interlocuteurs principaux.
- Pour l'entreprise mandataire d'un groupement, l'architecte doit être priorisé pour les missions de coordination et de communication avec le maître d'ouvrage (MOA).
- ÉVITE LES JUSTIFICATIONS GÉNÉRIQUES : au lieu de dire "expérience en maîtrise d'œuvre", mentionne les aspects spécifiques du projet ou de la mission tels qu'ils apparaissent dans le CCTP.`;

  userPrompt += `
Pour t'aider dans le chiffrage, voici une répartition moyenne des rémunérations dans une mission complète de maîtrise d'œuvre loi MOP :

- ESQ : 5 % (si incluse)
- APS : 10 %
- APD : 15 %
- PRO : 25 %
- ACT : 5 %
- VISA : 5 %
- DET : 25 %
- AOR : 5 %
- OPC : 5–10 % (si inclus).

Les études (ESQ à PRO) représentent 55–60 %, ACT ≈ 5 %, suivi de chantier (DET + VISA + AOR + OPC) ≈ 40–45 %.
`;

  userPrompt += `
Réponds au format JSON suivant :
{
  missionId1: {
    companyId1: {
      personId1: {
        nombreDeJours: ndj1_1_1,
        justification: "justification détaillée",
      },
      ...
      personIdN: {
        nombreDeJours: Ndj1_1_N,
        justification: "justification détaillée",
      },
    },
    ...
    companyIdM: {
      personId1: {
        nombreDeJours: Ndj1_M_1,
        justification: "justification détaillée",
      },
      ...
      personIdN: {
        nombreDeJours: Ndj1_M_N,
        justification: "justification détaillée",
      },
    },
  },
  ...
  missionIdK: {
    companyId1: {
      personId1: {
        nombreDeJours: ndjK_1_1,
        justification: "justification détaillée",
      },
      ...
      personIdN: {
        nombreDeJours: NdjK_1_N,
        justification: "justification détaillée",
      },
    },
    ...
    companyIdM: {
      personId1: {
        nombreDeJours: NdjK_M_1,
        justification: "justification détaillée",
      },
      ...
      personIdN: {
        nombreDeJours: NdjK_M_N,
        justification: "justification détaillée",
      },
    },
  },
};
`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Tu es un économiste de la construction spécialisé dans la répartition budgétaire par catégories de missions.
Pour chaque mission, chaque entreprise, chaque personne mobilisée de l'entreprise, propose un nombre de jours et une justification détaillée en respectant les budgets par catégorie.
IMPORTANT : Base tes justifications sur les spécificités du projet et les descriptions techniques fournies dans le CCTP. Évite les formulations génériques et adapte ton raisonnement aux particularités de chaque mission telles qu'elles sont décrites.`,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: messages,
    response_format: responseFormat,
  });

  const content = response.choices[0].message.content;
  if (content === null) {
    throw new Error("content is null");
  }

  const getDailyRate = (
    personId: string,
    companies: ParticipatingCompany[],
  ): number => {
    for (const company of companies) {
      const person = company.mobilizedPeople?.find((p) => p.id === personId);
      if (person && person.dailyRate) {
        return person.dailyRate;
      }
    }
    throw new Error(
      `Taux journalier introuvable pour la personne avec l'ID: ${personId}`,
    );
  };

  const calculateTotalAmount = (estimation: MissionDayEstimation): number => {
    return Object.values(estimation).reduce((total, mission) => {
      return (
        total +
        Object.values(mission).reduce((missionTotal, company) => {
          return (
            missionTotal +
            Object.entries(company).reduce(
              (companyTotal, [personId, person]) => {
                const dailyRate = getDailyRate(personId, companies);
                return companyTotal + person.nombreDeJours * dailyRate;
              },
              0,
            )
          );
        }, 0)
      );
    }, 0);
  };

  const adjustDaysToTarget = (
    estimation: MissionDayEstimation,
    targetAmount: number,
  ): MissionDayEstimation => {
    const totalAmount = calculateTotalAmount(estimation);
    const adjustmentFactor = targetAmount / totalAmount;

    Object.values(estimation).forEach((mission) => {
      Object.values(mission).forEach((company) => {
        Object.values(company).forEach((person) => {
          person.nombreDeJours = Math.round(
            person.nombreDeJours * adjustmentFactor,
          );
        });
      });
    });

    return estimation;
  };

  const ensureMinimumTwoPeoplePerMission = (
    estimation: MissionDayEstimation,
    companies: ParticipatingCompany[],
  ): MissionDayEstimation => {
    Object.entries(estimation).forEach(([, mission]) => {
      Object.entries(mission).forEach(([companyId, company]) => {
        const people = Object.keys(company);
        if (people.length < 2) {
          const availablePeople =
            companies.find((c) => c.id === companyId)?.mobilizedPeople ?? [];
          const additionalPeople = availablePeople.filter(
            (p) => !people.includes(p.id),
          );

          if (additionalPeople.length > 0) {
            const personToAdd = additionalPeople[0];
            company[personToAdd.id] = {
              nombreDeJours: 1,
              justification: `Ajout pour respecter la contrainte de deux personnes par mission.`,
            };
          }
        }
      });
    });
    return estimation;
  };

  let responseObj = JSON.parse(content);

  const totalAmount = calculateTotalAmount(responseObj);
  if (Math.abs(totalAmount - totalTargetAmount) > 1) {
    // Tolérance de 1€
    responseObj = adjustDaysToTarget(responseObj, totalTargetAmount);
  }

  responseObj = ensureMinimumTwoPeoplePerMission(responseObj, companies);

  // Restructurer le résultat selon le nouveau format hiérarchique par catégorie
  const restructuredResult: MissionEstimation = {
    base: {},
    pse: {},
    tranchesConditionnelles: {},
    variantes: {},
  };

  // Répartir chaque mission dans sa catégorie appropriée
  for (const [missionId, missionData] of Object.entries(responseObj)) {
    const typedMissionData = missionData as {
      [companyId: string]: {
        [personId: string]: {
          nombreDeJours: number;
          justification: string;
        };
      };
    };

    let categoryFound = false;

    // Vérifier dans chaque catégorie
    if (missionCategories.base.some((m) => m.id === missionId)) {
      restructuredResult.base[missionId] = typedMissionData;
      categoryFound = true;
    } else if (missionCategories.pse.some((m) => m.id === missionId)) {
      restructuredResult.pse[missionId] = typedMissionData;
      categoryFound = true;
    } else if (
      missionCategories.tranchesConditionnelles.some((m) => m.id === missionId)
    ) {
      restructuredResult.tranchesConditionnelles[missionId] = typedMissionData;
      categoryFound = true;
    } else if (missionCategories.variantes.some((m) => m.id === missionId)) {
      restructuredResult.variantes[missionId] = typedMissionData;
      categoryFound = true;
    }

    if (!categoryFound) {
      console.warn(
        `Mission ${missionId} n'appartient à aucune catégorie connue`,
      );
    }
  }

  useIAHistoryStore.getState().addEntry({
    timestamp: Date.now(),
    messages: messages,
    response: restructuredResult,
    context: "estimateMissionDaysWithCategories",
  });

  return restructuredResult;
}
