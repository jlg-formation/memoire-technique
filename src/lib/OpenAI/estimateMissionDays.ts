import createClient from "./client";
import type {
  ParticipatingCompany,
  MobilizedPerson,
} from "../../types/project";

export interface MissionEstimation {
  name: string;
  justification: string;
  people: { name: string; days: number }[];
}

export default async function estimateMissionDays(
  missions: string[],
  companies: ParticipatingCompany[],
  worksAmount: number | undefined,
  apiKey: string,
): Promise<MissionEstimation[]> {
  const openai = createClient(apiKey);
  const missionList = missions.map((m) => `- ${m}`).join("\n");
  const peopleList = companies
    .map((c) => {
      const ppl = c.mobilizedPeople ?? [];
      if (!ppl.length) return "";
      const rows = ppl
        .map((p: MobilizedPerson) => `- ${p.name} (${c.name})`)
        .join("\n");
      return rows;
    })
    .filter(Boolean)
    .join("\n");
  const userContent = `Missions:\n${missionList}\n\nPersonnes mobilisées:\n${peopleList}\n\nMontant global des travaux HT: ${
    worksAmount ?? "non précisé"
  }\n\nRéponds uniquement en JSON au format {"missions":[{"name":"DIA","justification":"texte court","people":[{"name":"Nom","days":10}]}]}`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Tu es un assistant expert en planification de missions de maîtrise d'oeuvre. Propose une répartition du nombre de jours par mission et par personne mobilisée avec une justification courte.",
      },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
  });

  const content = chat.choices[0].message.content ?? "{}";
  try {
    return JSON.parse(content).missions as MissionEstimation[];
  } catch {
    console.error("Erreur de parsing JSON", content);
    return [];
  }
}
