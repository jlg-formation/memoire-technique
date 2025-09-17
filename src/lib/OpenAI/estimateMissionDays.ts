import { useIAHistoryStore } from "../../store/useIAHistoryStore";
import type {
  Mission,
  MobilizedPerson,
  ParticipatingCompany,
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
- L'architecte responsable du cabinet d'architecture doit facturer au moins une journée de coordination sur chaque mission, car il est le garant de la communication avec le maître d'ouvrage (MOA).

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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: `Tu es un économiste de la construction.
Pour chaque mission, chaque entreprise, chaque personne mobilisée de l'entreprise, propose un nombre de jours et une justification détaillée.`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
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

  let responseObj = JSON.parse(content);

  const totalAmount = calculateTotalAmount(responseObj);
  if (totalAmount !== targetAmount) {
    responseObj = adjustDaysToTarget(responseObj, targetAmount);
  }

  useIAHistoryStore.getState().addEntry({
    timestamp: Date.now(),
    messages: [
      {
        role: "system",
        content: `Tu es un économiste de la construction.\nPour chaque mission et chaque personne mobilisée, propose un nombre de jours et une justification brève.`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response: responseObj,
    context: "estimateMissionDays",
  });

  return responseObj;
}
