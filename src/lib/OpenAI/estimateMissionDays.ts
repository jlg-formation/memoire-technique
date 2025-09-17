import { useIAHistoryStore } from "../../store/useIAHistoryStore";
import type {
  MobilizedPerson,
  ParticipatingCompany,
} from "../../types/project";
import { sleep } from "../sleep";
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

export async function estimateMissionDaysTest(
  missions: string[],
  companies: ParticipatingCompany[],
  targetAmount?: number,
): Promise<MissionDayEstimation> {
  console.log("missions: ", missions);
  console.log("companies: ", companies);
  console.log("targetAmount: ", targetAmount);

  await sleep(300);
  return {
    "Analyse critique de l'avant-projet sommaire (APS)": {
      "81c354b8-19be-431c-a932-65fd5d8b7bdf": {
        "0d683d8d-f909-45b6-a505-48c2b885a8c0": {
          nombreDeJours: 5,
          justification:
            "Suzana possède une expertise en gestion de projets et en restauration, idéal pour l'analyse critique des APS.",
        },
        "6433f215-9fc9-49cd-9991-111e3223af91": {
          nombreDeJours: 5,
          justification:
            "Claire peut apporter une perspective actuelle sur les projets de restauration patrimoniale, nécessaire pour les APS.",
        },
      },
    },
    "Etudes d'avant-projet définitif (APD)": {
      "81c354b8-19be-431c-a932-65fd5d8b7bdf": {
        "0d683d8d-f909-45b6-a505-48c2b885a8c0": {
          nombreDeJours: 5,
          justification:
            "Suzana supervise la structure définitive du projet, essentielle à la phase APD.",
        },
      },
      "f93d8bb4-c5ce-4f18-9e2e-0115eb494400": {
        "1ed0210a-ce58-464d-b2c3-bd09aab56c6e": {
          nombreDeJours: 5,
          justification:
            "Julien Bourgeois maîtrise la stabilité structurelle des monuments, ce qui est essentiel dans la phase APD.",
        },
      },
    },
    "Etudes de projet (PRO)": {
      "81c354b8-19be-431c-a932-65fd5d8b7bdf": {
        "6433f215-9fc9-49cd-9991-111e3223af91": {
          nombreDeJours: 5,
          justification:
            "Claire, avec sa compétence en études complètes, apportera une vision moderne aux projets proposés.",
        },
      },
    },
    "Assistance apportée au maître d’ouvrage pour la passation des marchés publics de travaux (AMT)":
      {
        "d99d1e01-50f6-4924-b34d-8deda0ea5466": {
          "95b13f84-3fca-4ffe-ae8b-94f5e50c851e": {
            nombreDeJours: 5,
            justification:
              "Cédric Pignot est expérimenté dans l'ingénierie de projet et peut faciliter la collaboration entre les parties pour la passation des marchés.",
          },
        },
      },
    "Etudes d’exécution et de synthèse (EXE)": {
      "f93d8bb4-c5ce-4f18-9e2e-0115eb494400": {
        "1ed0210a-ce58-464d-b2c3-bd09aab56c6e": {
          nombreDeJours: 10,
          justification:
            "Julien, en tant que spécialiste en restauration, avancera des solutions structurelles adéquates pour les études d'exécution.",
        },
      },
    },
    "Direction d'exécution des marchés publics de travaux (DET)": {
      "d99d1e01-50f6-4924-b34d-8deda0ea5466": {
        "95b13f84-3fca-4ffe-ae8b-94f5e50c851e": {
          nombreDeJours: 10,
          justification:
            "Cédric, avec son expertise en exécution énergétique, assurera une exécution fluide des marchés publics.",
        },
      },
    },
    "Assistance apportée au maître d’ouvrage lors des opérations de réception (AOR)":
      {
        "81c354b8-19be-431c-a932-65fd5d8b7bdf": {
          "0d683d8d-f909-45b6-a505-48c2b885a8c0": {
            nombreDeJours: 5,
            justification:
              "Suzana guidera les opérations finales de réception grâce à sa connaissance approfondie des opérations de restauration.",
          },
        },
      },
    "Etudes de diagnostic (DIA)": {
      "f93d8bb4-c5ce-4f18-9e2e-0115eb494400": {
        "1ed0210a-ce58-464d-b2c3-bd09aab56c6e": {
          nombreDeJours: 10,
          justification:
            "Julien est responsable des diagnostics structurels, un élément clé pour déterminer l'état du patrimoine.",
        },
      },
    },
    "Coordination SSI": {
      "81c354b8-19be-431c-a932-65fd5d8b7bdf": {
        "6433f215-9fc9-49cd-9991-111e3223af91": {
          nombreDeJours: 5,
          justification:
            "Claire, avec sa spécialisation en architecture patrimoniale, est compétente pour superviser la coordination SSI.",
        },
      },
    },
  };
}

export async function estimateMissionDays(
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
