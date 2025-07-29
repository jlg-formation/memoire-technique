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

export async function askPdfQuestion(
  file: File,
  question: string,
  apiKey: string,
): Promise<string> {
  const openai = createClient(apiKey);
  const upload = await openai.files.create({ file, purpose: "assistants" });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "input_file", file_id: upload.id },
          { type: "input_text", text: question },
        ],
      },
    ],
  });

  return completion.choices[0].message.content.trim();
}

export async function pdfToText(file: File, apiKey: string): Promise<string> {
  return askPdfQuestion(file, "Transcris ce PDF en texte brut.", apiKey);
}
