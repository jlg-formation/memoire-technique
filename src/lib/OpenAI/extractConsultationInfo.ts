import createClient from "./client";

export interface ConsultationInfo {
  consultationTitle: string;
  submissionDeadline: string;
}

export default async function extractConsultationInfo(
  text: string,
  apiKey: string,
): Promise<ConsultationInfo> {
  const openai = createClient(apiKey);
  const truncated = text.slice(0, 100000);
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Tu es un assistant spécialisé en analyse de règlement de consultation. Extrais le titre de la consultation et la date limite de remise des offres au format ISO (AAAA-MM-JJ). Réponds uniquement en JSON.`,
      },
      {
        role: "user",
        content: truncated,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = chat.choices[0].message.content ?? "{}";
  try {
    return JSON.parse(content) as ConsultationInfo;
  } catch {
    console.error("Erreur de parsing JSON", content);
    return { consultationTitle: "", submissionDeadline: "" };
  }
}
