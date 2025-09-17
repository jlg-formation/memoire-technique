import createClient from "./client";
import type {
  ParticipatingCompany,
  MobilizedPerson,
} from "../../types/project";
import { useIAHistoryStore } from "../../store/useIAHistoryStore";

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

export default async function estimateMissionDays(
  missions: string[],
  companies: ParticipatingCompany[],
  targetAmount?: number,
): Promise<MissionDayEstimation> {
  const openai = createClient();

  // Prompt utilisateur markdown multiligne
  let userPrompt = `# Missions
${missions.map((m) => `- ${m}`).join("\n")}

# Intervenants
${companies
  .map((c) => {
    const people = (c.mobilizedPeople ?? [])
      .map((p: MobilizedPerson) => {
        let cvInfo = "";
        if (p.cvSummary) {
          cvInfo += `\n    **CV résumé**: ${p.cvSummary}`;
        }
        if (p.cvText) {
          cvInfo += `\n    **CV complet**: ${p.cvText}`;
        }
        return `  - ${p.name} (id:${p.id}, taux ${p.dailyRate ?? 0} €/j)${cvInfo}`;
      })
      .join("\n");
    return `- ${c.name} (id:${c.id})\n${people}`;
  })
  .join("\n")}
`;

  if (targetAmount && targetAmount > 0) {
    userPrompt += `
## Montant cible de l'offre
${targetAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} euros

Répartis les jours de missions pour que le coût total corresponde à ce montant, en tenant compte des taux journaliers.
`;
  }

  userPrompt += `
Pour chaque mission et chaque personne mobilisée, propose un nombre de jours et une justification brève.

IMPORTANT: Réponds au format JSON suivant :
{
  mission1: {
    companyId1: {
      personId1: {
        nombreDeJours: "nombreDeJours",
        justification: "justification",
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
