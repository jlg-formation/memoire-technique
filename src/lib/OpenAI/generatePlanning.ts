import createClient from "./client";

export default async function generatePlanning(
  missions: string[],
  constraints: string,
  apiKey: string,
): Promise<string> {
  const openai = createClient(apiKey);
  const list = missions.map((m, i) => `${i + 1}. ${m}`).join("\n");
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
