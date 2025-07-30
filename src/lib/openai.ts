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

export interface MethodologyScore {
  label: string;
  points: number;
}

/**
 * Extrait depuis le texte du RC le barème de notation de la valeur
 * méthodologique du mémoire technique.
 * Retourne un tableau d'objets { label, points } avec en dernière
 * ligne le total.
 */
export async function extractMethodologyScores(
  text: string,
  apiKey: string,
): Promise<MethodologyScore[]> {
  const openai = createClient(apiKey);
  const truncated = text.slice(0, 8000);
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Tu es un assistant spécialisé en marchés publics. Tu dois identifier le barème de notation de la valeur technique dans un règlement de consultation et répondre uniquement en JSON.",
      },
      {
        role: "user",
        content: `Texte du RC :\n${truncated}\n\nRécupère les critères de jugement de la note méthodologique et présente les sous-notes sous la forme d'un tableau JSON avec les champs label et points. Ajoute une dernière ligne Total avec la somme des points.`,
      },
    ],
    response_format: { type: "json_object" },
  });
  const content = chat.choices[0].message.content ?? "[]";
  try {
    return JSON.parse(content) as MethodologyScore[];
  } catch {
    console.error("Erreur de parsing JSON", content);
    return [];
  }
}
