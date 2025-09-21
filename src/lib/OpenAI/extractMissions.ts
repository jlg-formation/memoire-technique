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

Pour chaque mission identifiée, extrait aussi son sigle/acronyme (ex: APS, APD, VISA, EXE, DET, ACT, etc.) si mentionné dans le texte.

Réponds uniquement en JSON au format :
{
  "base": [
    {"name": "Avant-Projet Sommaire", "sigle": "APS"},
    {"name": "Avant-Projet Détaillé", "sigle": "APD"}
  ],
  "pse": [
    {"name": "Mission diagnostic", "sigle": "DIAG"}
  ],
  "tranchesConditionnelles": [
    {"name": "Tranche conditionnelle 1", "sigle": null}
  ],
  "variantes": [
    {"name": "Variante béton", "sigle": null}
  ]
}

Si tu ne trouves pas de sigle pour une mission, utilise null pour la propriété sigle.
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

    // Fonction helper pour convertir les objets ou noms en objets Mission
    const createMissions = (
      items: Array<string | { name: string; sigle?: string | null }>,
      categoryPrefix: string,
    ) =>
      items.map((item, index) => {
        // Support des deux formats pour compatibilité descendante
        if (typeof item === "string") {
          return {
            id: `${categoryPrefix}-${index + 1}`,
            name: item,
            sigle: "XXX", // Valeur par défaut quand pas de sigle
          };
        }

        return {
          id: `${categoryPrefix}-${index + 1}`,
          name: item.name,
          sigle: item.sigle || "XXX", // Initialiser à XXX si null/undefined
        };
      });

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
