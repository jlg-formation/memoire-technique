import createClient from "./client";

export interface ConsultationInfo {
  consultationTitle: string;
  submissionDeadline: string;
  worksAmount: number;
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
        content: `Tu es un assistant spécialisé en analyse de règlement de consultation.
Extrais le titre de la consultation et appelle le consultationTitle,
et la date limite de remise des offres au format (yyyy-MM-dd) que tu appelles submissionDeadline.
Identifie et extrais le montant global des travaux HT prevu au format number que tu appelles worksAmount.
Si tu ne trouves pas le montant global des travaux HT indique 0.
Réponds uniquement en JSON.
Le Schema doit etre comme l'exemple. Merci de le respecter et de ne surtout pas le modifier.
Exemple:
{
  "consultationTitle": "Mission de maîtrise d’œuvre",
  "submissionDeadline": "yyyy-MM-dd",
  "worksAmount": 10000000
}`,
      },
      {
        role: "user",
        content: truncated,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = chat.choices[0].message.content ?? "{}";
  console.log("content: ", content);
  try {
    return JSON.parse(content) as ConsultationInfo;
  } catch {
    console.error("Erreur de parsing JSON", content);
    return {
      consultationTitle: "",
      submissionDeadline: "",
      worksAmount: 0,
    };
  }
}
