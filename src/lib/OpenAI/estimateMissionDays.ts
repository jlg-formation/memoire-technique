import createClient from "./client";
import type {
  ParticipatingCompany,
  MobilizedPerson,
} from "../../types/project";

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
  const missionsList = missions.map((m) => `- ${m}`).join("\n");
  const companiesList = companies
    .map((c) => {
      const people = (c.mobilizedPeople ?? [])
        .map(
          (p: MobilizedPerson) =>
            `  - ${p.name} (id:${p.id}, taux ${p.dailyRate ?? 0} €/j)`,
        )
        .join("\n");
      return `- ${c.name} (id:${c.id})\n${people}`;
    })
    .join("\n");

  let userPrompt = `Missions:\n${missionsList}\n\nIntervenants:\n${companiesList}`;
  if (targetAmount && targetAmount > 0) {
    userPrompt += `\n\nLe montant total de la réponse à l'appel d'offre doit être de ${targetAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} euros. Répartis les jours de missions pour que le coût total corresponde à ce montant, en tenant compte des taux journaliers.`;
  }
  userPrompt += `\n\nRéponds uniquement en JSON au format {"missionDays": {"mission": {"companyId": {"personId": nombre}}}, "missionJustifications": {"mission": {"companyId": {"personId": "justification"}}}}`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Tu es un économiste de la construction. Pour chaque mission et chaque personne mobilisée, propose un nombre de jours et une justification brève.",
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
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
