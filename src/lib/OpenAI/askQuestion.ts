import createClient from "./client";

export default async function askQuestion(
  text: string,
  question: string,
  apiKey: string,
): Promise<string> {
  const openai = createClient(apiKey);

  const truncatedText = text.slice(0, 6000);

  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Tu es un assistant expert en analyse de texte.",
      },
      {
        role: "user",
        content: `Texte :\n\n${truncatedText}\n\nQuestion : ${question}`,
      },
    ],
  });

  return chat.choices[0].message.content?.trim() ?? "(Pas de réponse)";
}
