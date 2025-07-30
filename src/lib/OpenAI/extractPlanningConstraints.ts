import createClient from "./client";

export default async function extractPlanningConstraints(
  text: string,
  apiKey: string,
): Promise<string> {
  const openai = createClient(apiKey);
  const truncated = text.slice(0, 100000);
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Tu es un expert des marches publics. Resume en moins de 500 mots les contraintes de planning et le calendrier prevu que tu trouves dans l'acte d'engagement. Retourne uniquement le texte du resume.",
      },
      { role: "user", content: truncated },
    ],
  });
  return chat.choices[0].message.content?.trim() ?? "";
}
