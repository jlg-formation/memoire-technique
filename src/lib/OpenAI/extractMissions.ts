import createClient from "./client";
import type { MissionCategories } from "../../types/project";

export default async function extractMissions(
  text: string,
): Promise<MissionCategories> {
  const openai = createClient();
  const truncated = text.slice(0, 100000);
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Tu es un expert en analyse d'actes d'engagement. Analyse le texte pour identifier et classer les missions selon ces catégories :
- Base : missions principales obligatoires
- PSE : Prestations Supplémentaires Éventuelles (optionnelles)
- Tranches Conditionnelles : missions qui dépendent de conditions spécifiques
- Variantes : alternatives aux missions de base

Réponds uniquement en JSON au format :
{
  "base": ["mission base 1", "mission base 2"],
  "pse": ["PSE 1", "PSE 2"],
  "tranchesConditionnelles": ["tranche 1", "tranche 2"],
  "variantes": ["variante 1", "variante 2"]
}

Si une catégorie n'a pas de missions, utilise un tableau vide []`,
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
    const parsed = JSON.parse(content);

    // Fonction helper pour convertir les noms en objets Mission
    const createMissions = (names: string[], categoryPrefix: string) =>
      names.map((name, index) => ({
        id: `${categoryPrefix}-${index + 1}`,
        name: name,
      }));

    return {
      base: createMissions(parsed.base || [], "base"),
      pse: createMissions(parsed.pse || [], "pse"),
      tranchesConditionnelles: createMissions(
        parsed.tranchesConditionnelles || [],
        "tranche",
      ),
      variantes: createMissions(parsed.variantes || [], "variante"),
    };
  } catch {
    console.error("Erreur de parsing JSON", content);
    return {
      base: [],
      pse: [],
      tranchesConditionnelles: [],
      variantes: [],
    };
  }
}
