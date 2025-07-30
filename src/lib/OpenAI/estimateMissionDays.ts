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
  apiKey: string,
): Promise<MissionDayEstimation> {
  const openai = createClient(apiKey);
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
        content: `Missions:\n${missionsList}\n\nIntervenants:\n${companiesList}\n\nRéponds uniquement en JSON au format {"missionDays": {"mission": {"companyId": {"personId": nombre}}}, "missionJustifications": {"mission": {"companyId": {"personId": "justification"}}}}`,
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
