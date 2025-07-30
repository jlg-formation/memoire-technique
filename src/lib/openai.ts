import OpenAI from "openai";

function createClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

export async function summarize(
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

export async function testKey(apiKey: string): Promise<boolean> {
  const openai = createClient(apiKey);
  try {
    await openai.models.list();
    return true;
  } catch {
    return false;
  }
}

/**
 * Envoie une question à GPT-4o avec le texte extrait d’un PDF
 */
export async function askQuestion(
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
