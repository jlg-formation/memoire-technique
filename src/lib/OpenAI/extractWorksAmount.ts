import createClient from "./client";

export default async function extractWorksAmount(
  text: string,
  apiKey: string,
): Promise<number | undefined> {
  const openai = createClient(apiKey);
  const truncated = text.slice(0, 100000);
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Tu es un expert en analyse d'actes d'engagement. " +
          "Identifie le montant global des travaux HT et réponds uniquement en JSON " +
          'au format {"amount": 123456.78}',
      },
      { role: "user", content: truncated },
    ],
    response_format: { type: "json_object" },
  });
  const content = chat.choices[0].message.content ?? "{}";
  try {
    const amount = JSON.parse(content).amount as number;
    return Number(amount);
  } catch {
    console.error("Erreur de parsing JSON", content);
    return undefined;
  }
}
