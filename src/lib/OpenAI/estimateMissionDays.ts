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
- Fournis des justifications détaillées pour chaque attribution, en mentionnant les compétences, l'expérience ou la pertinence de chaque personne pour la mission.

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
Pour chaque mission, chaque entreprise, chaque personne mobilisée de l'entreprise, propose un nombre de jours et une justification brève.`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response_format: {
      type: "json_schema",
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
    },
  });

  const content = response.choices[0].message.content;
  if (content === null) {
    throw new Error("content is null");
  }

  const responseObj = JSON.parse(content);

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
