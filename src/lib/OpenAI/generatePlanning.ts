import createClient from "./client";
import type { Mission } from "../../types/project";

export default async function generatePlanning(
  missions: Mission[],
  constraints: string,
): Promise<string> {
  const openai = createClient();
  const list = missions.map((m, i) => `${i + 1}. ${m.name}`).join("\n");
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Tu es un planificateur specialise en marche public. En te basant sur les missions et les contraintes de planning suivantes, propose un planning synthetique respectant toutes les contraintes. Repond uniquement en Markdown.",
      },
      {
        role: "user",
        content: `Contraintes :\n${constraints}\n\nMissions :\n${list}`,
      },
    ],
  });
  return chat.choices[0].message.content?.trim() ?? "";
}
