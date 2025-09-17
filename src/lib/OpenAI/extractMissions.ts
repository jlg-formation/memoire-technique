import createClient from "./client";
import type { Mission } from "../../types/project";

export default async function extractMissions(
  text: string,
): Promise<Mission[]> {
  const openai = createClient();
  const truncated = text.slice(0, 100000);
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Tu es un expert en analyse d'actes d'engagement. D\u00e9duis la liste des missions demand\u00e9es et r\u00e9ponds uniquement en JSON au format {"missions": ["mission 1", "mission 2"]}`,
      },
      {
        role: "user",
        content: truncated,
      },
    ],
    response_format: { type: "json_object" },
  });
  const content = chat.choices[0].message.content ?? "{}";
  try {
    const parsed = JSON.parse(content);
    const missionNames = parsed.missions as string[];

    // Convertir les noms de missions en objets Mission avec id et nom
    return missionNames.map((name, index) => ({
      id: `mission-${index + 1}`,
      name: name,
    }));
  } catch {
    console.error("Erreur de parsing JSON", content);
    return [];
  }
}
