import createClient from "./client";

export default async function summarize(
  text: string,
  words: number,
  apiKey: string,
): Promise<string> {
  const openai = createClient(apiKey);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Résume ce CV en ${words} mots :\n${text}`,
      },
    ],
  });

  return completion.choices[0].message.content?.trim() ?? "";
}
