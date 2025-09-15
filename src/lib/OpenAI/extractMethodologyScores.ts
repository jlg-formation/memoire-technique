import createClient from "./client";

export interface MethodologyScore {
  label: string;
  points: number;
}

export default async function extractMethodologyScores(
  text: string,
): Promise<MethodologyScore[]> {
  console.log("start extractMethodologyScores");
  const openai = createClient();
  const truncated = text.slice(0, 100000);
  console.log("truncated: ", truncated.length);
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `
Tu es un assistant spécialisé en marchés publics.
Tu dois identifier le barème de notation de la valeur technique
dans un règlement de consultation et répondre uniquement en JSON.`,
      },
      {
        role: "user",
        content: `Texte du RC :
${truncated}

Récupère les critères de jugement de la note méthodologique
et présente les sous-notes sous la forme d'un tableau JSON
avec les champs label et points.
Ajoute une dernière ligne Total avec la somme des points.
          Exemple de Format JSON de sortie:
{
  "criteria": [
    {
      "label": "Présentation de(s) la structure(s) avec indication du rôle de chaque intervenant (cotraitant et/ou sous-traitant) – Organisation, moyens humains et moyens logistiques mis en œuvre pour l’exécution des prestations",
      "points": 18
    },
    {
      "label": "Présentation de 3 références achevées depuis moins de 5 ans, de prestations équivalentes, montrant sa capacité professionnelle à traiter les caractéristiques et la complexité du projet envisagé",
      "points": 15
    },
    {
      "label": "Durée d’exécution des prestations : planning prévisionnel",
      "points": 15
    },
    {
      "label": "Cohérence des coûts unitaires journaliers et des temps affectés par tâche et par intervenant",
      "points": 12
    },
    {
      "label": "Total",
      "points": 60
    }
  ]
}`,
      },
    ],
    response_format: { type: "json_object" },
  });
  const content = chat.choices[0].message.content ?? "[]";
  console.log("content: ", content);
  try {
    return JSON.parse(content).criteria as MethodologyScore[];
  } catch {
    console.error("Erreur de parsing JSON", content);
    return [];
  }
}
