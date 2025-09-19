import createClient from "./client";
import type { Mission, MissionCategories } from "../../types/project";

/**
 * Extrait les descriptions des missions depuis le texte du CCTP
 * et les associe aux missions existantes
 */
export default async function extractMissionDescriptions(
  cctpText: string,
  missionCategories: MissionCategories,
): Promise<{ [missionId: string]: string }> {
  const openai = createClient();

  // Collecte toutes les missions de toutes les catégories
  const allMissions: Mission[] = [
    ...missionCategories.base,
    ...missionCategories.pse,
    ...missionCategories.tranchesConditionnelles,
    ...missionCategories.variantes,
  ];

  if (allMissions.length === 0) {
    return {};
  }

  // Formatage des missions pour le prompt
  const missionsText = allMissions
    .map((mission) => `${mission.id}: ${mission.sigle} - ${mission.name}`)
    .join("\n");

  const userPrompt = `
Analyse le CCTP suivant et extrais pour chaque mission listée ci-dessous sa description détaillée.

MISSIONS À ANALYSER :
${missionsText}

CCTP :
${cctpText}

Pour chaque mission, trouve dans le CCTP la description qui correspond au sigle et au nom de la mission.
Si aucune description spécifique n'est trouvée pour une mission, réponds par une chaîne vide pour cette mission.

Réponds uniquement au format JSON suivant :
{
  "missionId1": "description détaillée extraite du CCTP",
  "missionId2": "description détaillée extraite du CCTP",
  ...
}
`;

  const messages = [
    {
      role: "system" as const,
      content: `Tu es un expert en analyse de documents techniques de marché public. 
Tu dois extraire avec précision les descriptions de missions depuis un CCTP (Cahier des Clauses Techniques Particulières).
Tu dois associer chaque mission à sa description en te basant sur le sigle (APS, APD, VISA, etc.) et le nom de la mission.
Soit précis et ne duplique pas les descriptions entre missions.`,
    },
    {
      role: "user" as const,
      content: userPrompt,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: messages,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (content === null) {
    throw new Error("Réponse vide de l'API OpenAI");
  }

  try {
    const descriptions = JSON.parse(content) as { [missionId: string]: string };

    // Filtre les descriptions vides
    const filteredDescriptions: { [missionId: string]: string } = {};
    Object.entries(descriptions).forEach(([missionId, description]) => {
      if (description && description.trim().length > 0) {
        filteredDescriptions[missionId] = description.trim();
      }
    });

    return filteredDescriptions;
  } catch (error) {
    console.error("Erreur lors du parsing JSON:", error);
    throw new Error("Format de réponse invalide de l'API OpenAI");
  }
}
