import OpenAI from "openai";

import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/memoire-technique/pdf.worker.mjs";

/**
 * Lit le texte d'un fichier PDF dans le navigateur
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    text += strings.join(" ") + "\n";
  }

  return text.trim();
}

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

  return completion.choices[0].message.content.trim();
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
export async function askQuestionAboutPdf(
  file: File,
  question: string,
  apiKey: string,
): Promise<string> {
  const openai = createClient(apiKey);

  const pdfText = await extractTextFromPdf(file);
  const truncatedText = pdfText.slice(0, 6000); // éviter de dépasser la limite de tokens

  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Tu es un assistant expert en lecture de documents PDF.",
      },
      {
        role: "user",
        content: `Voici un extrait de PDF :\n\n${truncatedText}\n\nQuestion : ${question}`,
      },
    ],
  });

  const result = chat.choices[0].message.content?.trim() ?? "(Pas de réponse)";
  console.log("result: ", result);
  return result;
}

export async function pdfToText(file: File, apiKey: string): Promise<string> {
  return askQuestionAboutPdf(file, "Transcris ce PDF en texte brut.", apiKey);
}
