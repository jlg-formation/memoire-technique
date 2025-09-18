import type { ChatCompletionMessageParam } from "openai/resources";
import { useIAHistoryStore } from "../../store/useIAHistoryStore";
import type { MissionCategories } from "../../types/project";
import type {
  AIRecommendedPercentages,
  CategoryMissionPercentages,
} from "../../types/project";
import createClient from "./client";

const responseFormat = {
  type: "json_schema" as const,
  json_schema: {
    name: "AIRecommendedPercentages",
    schema: {
      type: "object",
      properties: {
        base: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              categoryPercentage: { type: "number" },
              projectPercentage: { type: "number" },
              justification: { type: "string" },
            },
            required: [
              "categoryPercentage",
              "projectPercentage",
              "justification",
            ],
          },
        },
        pse: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              categoryPercentage: { type: "number" },
              projectPercentage: { type: "number" },
              justification: { type: "string" },
            },
            required: [
              "categoryPercentage",
              "projectPercentage",
              "justification",
            ],
          },
        },
        tranchesConditionnelles: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              categoryPercentage: { type: "number" },
              projectPercentage: { type: "number" },
              justification: { type: "string" },
            },
            required: [
              "categoryPercentage",
              "projectPercentage",
              "justification",
            ],
          },
        },
        variantes: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              categoryPercentage: { type: "number" },
              projectPercentage: { type: "number" },
              justification: { type: "string" },
            },
            required: [
              "categoryPercentage",
              "projectPercentage",
              "justification",
            ],
          },
        },
      },
      additionalProperties: false,
    },
  },
};

/**
 * Estime les pourcentages recommandés par l'IA selon l'état de l'art du métier
 * pour chaque mission dans chaque catégorie
 */
export default async function estimateRecommendedPercentages(
  missionCategories: MissionCategories,
): Promise<AIRecommendedPercentages> {
  const openai = createClient();

  // Construction du prompt utilisateur
  let userPrompt = `# Estimation des pourcentages selon l'état de l'art du métier

Tu es un expert en répartition budgétaire pour les missions de maîtrise d'œuvre en bâtiment et travaux publics.

## Mission
Estime les pourcentages de coût recommandés selon l'état de l'art du métier pour chaque mission listée ci-dessous.

Pour chaque mission, fournis :
1. **categoryPercentage** : pourcentage par rapport au total de sa catégorie (base, PSE, etc.)
2. **projectPercentage** : pourcentage par rapport au total du projet
3. **justification** : explication basée sur l'état de l'art du métier

## Contexte des catégories de missions

`;

  if (missionCategories.base.length > 0) {
    userPrompt += `### Missions de Base
Les missions de base représentent généralement 70-80% du total du projet selon la loi MOP.
Liste des missions :
${missionCategories.base.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")}

`;
  }

  if (missionCategories.pse.length > 0) {
    userPrompt += `### Prestations Supplémentaires Éventuelles (PSE)
Les PSE représentent généralement 10-20% du total du projet selon les standards du métier.
Liste des missions :
${missionCategories.pse.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")}

`;
  }

  if (missionCategories.tranchesConditionnelles.length > 0) {
    userPrompt += `### Tranches Conditionnelles
Les tranches conditionnelles varient selon le projet mais représentent généralement 5-15% du total.
Liste des missions :
${missionCategories.tranchesConditionnelles.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")}

`;
  }

  if (missionCategories.variantes.length > 0) {
    userPrompt += `### Variantes
Les variantes représentent généralement 2-10% du total du projet selon la complexité.
Liste des missions :
${missionCategories.variantes.map((m) => `- ${m.name} (id: ${m.id})`).join("\n")}

`;
  }

  userPrompt += `## Références de l'état de l'art

**Répartition type loi MOP pour missions complètes :**
- ESQ (Esquisse) : 5% si incluse
- APS (Avant-Projet Sommaire) : 10%
- APD (Avant-Projet Définitif) : 15%
- PRO (Projet) : 25%
- ACT (Assistance aux Contrats de Travaux) : 5%
- VISA : 5%
- DET (Direction de l'Exécution des Travaux) : 25%
- AOR (Assistance aux Opérations de Réception) : 5%
- OPC (Ordonnancement, Pilotage, Coordination) : 5-10% si inclus

**Répartition par phases :**
- Études (ESQ à PRO) : 55-60%
- ACT : 5%
- Suivi de chantier (DET + VISA + AOR + OPC) : 40-45%

## Contraintes

1. **Cohérence** : Les pourcentages doivent être cohérents avec l'état de l'art du métier
2. **Total par catégorie** : La somme des categoryPercentage d'une catégorie doit être proche de 100%
3. **Justification précise** : Chaque pourcentage doit être justifié par une référence aux standards du métier
4. **Réalisme** : Les pourcentages doivent refléter la charge de travail réelle de chaque mission

## Format de réponse attendu

Réponds au format JSON suivant :

\`\`\`json
{
  "base": {
    "missionId1": {
      "categoryPercentage": 25.0,
      "projectPercentage": 18.0,
      "justification": "Selon la loi MOP, cette mission représente typiquement..."
    }
  },
  "pse": {
    "missionId2": {
      "categoryPercentage": 60.0,
      "projectPercentage": 12.0,
      "justification": "Cette prestation supplémentaire représente..."
    }
  }
}
\`\`\`

**IMPORTANT** : Base tes estimations sur l'état de l'art reconnu du métier et les standards professionnels.`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Tu es un expert économiste de la construction avec 20 ans d'expérience dans la répartition budgétaire selon la loi MOP et les standards du métier.
Tu connais parfaitement les pourcentages types pour chaque phase de mission et peux les adapter selon le contexte du projet.`,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: messages,
    response_format: responseFormat,
  });

  const content = response.choices[0].message.content;
  if (content === null) {
    throw new Error("content is null");
  }

  const result: AIRecommendedPercentages = JSON.parse(content);

  // Validation des totaux par catégorie
  const validateCategoryTotals = (
    categoryData: CategoryMissionPercentages | undefined,
    categoryName: string,
  ) => {
    if (!categoryData) return;

    const total = Object.values(categoryData).reduce(
      (sum, mission) => sum + mission.categoryPercentage,
      0,
    );
    if (Math.abs(total - 100) > 5) {
      // Tolérance de 5%
      console.warn(
        `La somme des pourcentages pour la catégorie "${categoryName}" est de ${total.toFixed(1)}% (attendu: 100%)`,
      );
    }
  };

  validateCategoryTotals(result.base, "base");
  validateCategoryTotals(result.pse, "pse");
  validateCategoryTotals(
    result.tranchesConditionnelles,
    "tranchesConditionnelles",
  );
  validateCategoryTotals(result.variantes, "variantes");

  // Enregistrer dans l'historique IA
  useIAHistoryStore.getState().addEntry({
    timestamp: Date.now(),
    messages: messages,
    response: result,
    context: "estimateRecommendedPercentages",
  });

  return result;
}
