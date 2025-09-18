import type { ChatCompletionMessageParam } from "openai/resources";
import { useIAHistoryStore } from "../../store/useIAHistoryStore";
import type {
  Mission,
  MobilizedPerson,
  ParticipatingCompany,
  MissionCategories,
  MissionEstimation,
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
): Promise<MissionEstimation> {
  const openai = createClient();

  const totalTargetAmount = Object.values(categoryTargetAmounts).reduce(
    (sum, amount) => sum + (amount || 0),
    0,
  );

  // Prompt utilisateur markdown multiligne avec informations par catégorie
  let userPrompt = `# Répartition par catégories de missions

`;

  if (missionCategories.base.length > 0 && categoryTargetAmounts.base) {
    userPrompt += `## Missions de Base (Budget: ${categoryTargetAmounts.base.toLocaleString()} €)
${missionCategories.base.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")}

`;
  }

  if (missionCategories.pse.length > 0 && categoryTargetAmounts.pse) {
    userPrompt += `## Prestations Supplémentaires Éventuelles (Budget: ${categoryTargetAmounts.pse.toLocaleString()} €)
${missionCategories.pse.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")}

`;
  }

  if (
    missionCategories.tranchesConditionnelles.length > 0 &&
    categoryTargetAmounts.tranchesConditionnelles
  ) {
    userPrompt += `## Tranches Conditionnelles (Budget: ${categoryTargetAmounts.tranchesConditionnelles.toLocaleString()} €)
${missionCategories.tranchesConditionnelles.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")}

`;
  }

  if (
    missionCategories.variantes.length > 0 &&
    categoryTargetAmounts.variantes
  ) {
    userPrompt += `## Variantes (Budget: ${categoryTargetAmounts.variantes.toLocaleString()} €)
${missionCategories.variantes.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")}

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

  userPrompt += `
**CONTRAINTE PRINCIPALE** : Respecte les budgets par catégorie de missions. 
- Le coût total des missions de chaque catégorie doit correspondre exactement au budget alloué à cette catégorie.
- Répartis les jours de missions en tenant compte des taux journaliers pour atteindre ces budgets.
- Budget total à atteindre : ${totalTargetAmount.toLocaleString()} €
`;

  userPrompt += `
IMPORTANT : Respecte strictement les contraintes suivantes :
- Chaque mission peut être réalisée par plusieurs personnes. Répartis les jours de manière optimale entre les intervenants disponibles.
- Évite d'attribuer zéro jour à une personne mobilisée, sauf si cela est clairement justifié par un manque de pertinence ou de compétence pour la mission.
- Fournis des justifications détaillées pour chaque attribution, en mentionnant les compétences, l'expérience ou la pertinence de chaque personne pour la mission.
- Dans les justifications, mentionne toujours le prénom et le nom complet de chaque salarié mobilisé. Évite les familiarités ou les formulations informelles.
- Les représentants des entreprises doivent être préférés aux autres personnes mobilisées pour les missions, car ils sont les interlocuteurs principaux.
- Pour l'entreprise mandataire d'un groupement, l'architecte doit être priorisé pour les missions de coordination et de communication avec le maître d'ouvrage (MOA).`;

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
Pour chaque mission, chaque entreprise, chaque personne mobilisée de l'entreprise, propose un nombre de jours et une justification détaillée en respectant les budgets par catégorie.`,
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

export async function estimateMissionDays(
  missions: Mission[],
  companies: ParticipatingCompany[],
  targetAmount: number,
): Promise<MissionDayEstimation> {
  const openai = createClient();

  // Prompt utilisateur markdown multiligne
  let userPrompt = `# Missions
${missions.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")}

# Intervenants
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

  userPrompt += `
Répartis les jours de missions pour que le coût total corresponde au montant cible de l'offre, en tenant compte des taux journaliers.
`;

  userPrompt += `
IMPORTANT : Respecte strictement les contraintes suivantes :
- Le coût total (nombre de jours x taux journaliers) doit être égal à ${targetAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} euros.
- Chaque mission peut être réalisée par plusieurs personnes. Répartis les jours de manière optimale entre les intervenants disponibles.
- Évite d'attribuer zéro jour à une personne mobilisée, sauf si cela est clairement justifié par un manque de pertinence ou de compétence pour la mission.
- Fournis des justifications détaillées pour chaque attribution, en mentionnant les compétences, l'expérience ou la pertinence de chaque personne pour la mission.
- Dans les justifications, mentionne toujours le prénom et le nom complet de chaque salarié mobilisé. Évite les familiarités ou les formulations informelles.
- Les représentants des entreprises doivent être préférés aux autres personnes mobilisées pour les missions, car ils sont les interlocuteurs principaux.
- Pour l'entreprise mandataire d'un groupement, l'architecte doit être priorisé pour les missions de coordination et de communication avec le maître d'ouvrage (MOA).`;

  userPrompt += `
Pour t'aider dans le chiffrage, voici une répartition moyenne des rémunérations dans une mission complète de maîtrise d’œuvre loi MOP :

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

Exemple de calcul :
Si le montant cible est 10 000 euros et qu'une personne a un taux journalier de 500 €/j, elle peut travailler 20 jours (10 000 / 500). Si deux personnes sont mobilisées, répartis les jours en fonction de leurs taux journaliers et de leurs compétences.
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
      content: `Tu es un économiste de la construction.
Pour chaque mission, chaque entreprise, chaque personne mobilisée de l'entreprise, propose un nombre de jours et une justification détaillée.`,
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

  // Ajout d'une contrainte pour garantir qu'au moins deux personnes sont affectées par mission
  userPrompt += `
IMPORTANT : Respecte strictement les contraintes suivantes :
- Chaque mission doit avoir au moins deux personnes affectées, sauf si aucune autre personne n'est disponible ou pertinente pour la mission.
`;

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
              nombreDeJours: 1, // Affectation minimale
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
  if (totalAmount !== targetAmount) {
    responseObj = adjustDaysToTarget(responseObj, targetAmount);
  }

  responseObj = ensureMinimumTwoPeoplePerMission(responseObj, companies);

  useIAHistoryStore.getState().addEntry({
    timestamp: Date.now(),
    messages: messages,
    response: responseObj,
    context: "estimateMissionDays",
  });

  return responseObj;
}
