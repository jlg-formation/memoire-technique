import createClient from "./client";
import type {
  ParticipatingCompany,
  MobilizedPerson,
} from "../../types/project";
import type { ChatCompletionMessageParam } from "openai/resources";

export interface MissionDayEstimation {
  missionDays: Record<string, Record<string, Record<string, number>>>;
  missionJustifications: Record<string, Record<string, Record<string, string>>>;
}

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
Réponds uniquement en JSON au format :

{
  "missionDays": { "mission": { "companyId": { "personId": nombre } } },
  "missionJustifications": { "mission": { "companyId": { "personId": "justification" } } }
}
`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Tu es un économiste de la construction.
Pour chaque mission et chaque personne mobilisée, propose un nombre de jours et une justification brève.
Réponds en JSON comme précisé dans le prompt utilisateur.`,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  console.log("messages: ", messages);

  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" },
  });

  const content = chat.choices[0].message.content ?? "{}";
  try {
    return JSON.parse(content) as MissionDayEstimation;
  } catch {
    console.error("Erreur de parsing JSON", content);
    return { missionDays: {}, missionJustifications: {} };
  }
}
