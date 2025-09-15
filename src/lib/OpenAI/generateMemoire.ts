import createClient from "./client";
import { stripPdfFields } from "../sanitize";
import type { Project } from "../../types/project";

export default async function generateMemoire(
  project: Project,
): Promise<string> {
  const openai = createClient();
  const cleaned = stripPdfFields(project);
  const { memoHtml, ...projectData } = cleaned;
  void memoHtml;
  const json = JSON.stringify(projectData);

  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Tu es un architecte et économiste de la construction. Rédige un mémoire technique sérieux au format HTML pour répondre à l'appel d'offres.",
      },
      {
        role: "user",
        content: `Voici le projet au format JSON sans le champ memoHtml :\n${json}\nUtilise ces informations pour rédiger le mémoire. Réponds uniquement avec le HTML complet.`,
      },
    ],
  });

  return chat.choices[0].message.content?.trim() ?? "";
}
