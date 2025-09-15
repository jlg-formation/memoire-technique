import createClient from "./client";

/**
 * Génère un titre court et descriptif pour un document basé sur son contenu
 */
export default async function generateDocumentTitle(
  documentText: string,
): Promise<string> {
  const openai = createClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Tu es un assistant spécialisé dans l'analyse de documents de marchés publics.
        
À partir du contenu d'un document, tu dois générer un titre court et descriptif (maximum 50 caractères).

Le titre doit :
- Être en français
- Faire maximum 50 caractères
- Être descriptif du contenu principal
- Éviter les articles inutiles ("le", "la", "les", "un", "une", "des")
- Être professionnel et précis
- Utiliser des termes techniques appropriés au contexte BTP/marchés publics

Exemples de bons titres :
- "Notice technique équipements"
- "Analyse géotechnique terrain"
- "Cahier sécurité chantier"
- "Spécifications matériaux"
- "Planning détaillé travaux"

Réponds UNIQUEMENT avec le titre généré, sans guillemets ni explications.`,
      },
      {
        role: "user",
        content: `Génère un titre pour ce document :\n\n${documentText.slice(0, 2000)}${documentText.length > 2000 ? "..." : ""}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 50,
  });

  const title = response.choices[0]?.message?.content?.trim();

  if (!title) {
    throw new Error("Impossible de générer un titre pour ce document");
  }

  // S'assurer que le titre ne dépasse pas 50 caractères
  return title.length > 50 ? title.slice(0, 47) + "..." : title;
}
