export async function summarize(
  text: string,
  words: number,
  apiKey: string,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Résume ce CV en ${words} mots :\n${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI API error");
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0].message.content.trim();
}

export async function testKey(apiKey: string): Promise<boolean> {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return response.ok;
}

export async function askPdfQuestion(
  file: File,
  question: string,
  apiKey: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", "vision");

  const upload = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!upload.ok) {
    throw new Error("OpenAI API error");
  }

  const { id } = (await upload.json()) as { id: string };

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "input_file", file_id: id },
            { type: "input_text", text: question },
          ],
        },
      ],
    }),
  });

  if (!completion.ok) {
    throw new Error("OpenAI API error");
  }

  const data = (await completion.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0].message.content.trim();
}

export async function pdfToText(file: File, apiKey: string): Promise<string> {
  return askPdfQuestion(file, "Transcris ce PDF en texte brut.", apiKey);
}
