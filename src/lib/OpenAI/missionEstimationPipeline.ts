import type { ChatCompletionMessageParam } from "openai/resources";
import type {
  Project,
  ProjectAnalysis,
  BaseBudgetAllocation,
  OptimizedBudgetAllocation,
  MissionEstimation,
  MissionAllocation,
  CompanyMissionAllocation,
  PersonAllocation,
  MissionPriceConstraint,
} from "../../types/project";
import createClient from "./client";
import { useIAHistoryStore } from "../../store/useIAHistoryStore";

/**
 * Étape 1: Analyse des spécificités du projet
 * pour identifier les complexités techniques, les enjeux réglementaires
 * et les enjeux métier qui influenceront la répartition des missions
 */
export async function analyzeProjectSpecifics(
  project: Project,
): Promise<ProjectAnalysis> {
  const openai = createClient();

  // Construction du contexte pour l'analyse
  let contextPrompt = `# Analyse du projet pour mémoire technique

## Informations du projet
- **Titre**: ${project.consultationTitle}
- **Montant des travaux**: ${project.worksAmount?.toLocaleString()} € HT

`;

  // Ajouter les documents de marché si disponibles
  if (project.marketDocuments?.length) {
    contextPrompt += `## Documents de marché disponibles\n`;
    project.marketDocuments.forEach((doc) => {
      contextPrompt += `### ${doc.name} (${doc.type})\n`;
      // Limiter le texte pour éviter de dépasser les limites
      const excerpt =
        doc.text.length > 1000 ? doc.text.substring(0, 1000) + "..." : doc.text;
      contextPrompt += `${excerpt}\n\n`;
    });
  }

  // Ajouter les missions par catégorie
  if (project.missions) {
    contextPrompt += `## Missions à réaliser\n`;
    Object.entries(project.missions).forEach(([category, missions]) => {
      if (missions.length > 0) {
        contextPrompt += `### ${category.toUpperCase()}\n`;
        missions.forEach(
          (mission: {
            id: string;
            name: string;
            sigle: string;
            description?: string;
          }) => {
            contextPrompt += `- **${mission.sigle}** : ${mission.name}`;
            if (mission.description) {
              contextPrompt += ` - ${mission.description}`;
            }
            contextPrompt += `\n`;
          },
        );
        contextPrompt += `\n`;
      }
    });
  }

  // Ajouter les équipes mobilisées
  if (project.participatingCompanies?.length) {
    contextPrompt += `## Équipes mobilisées\n`;
    project.participatingCompanies.forEach((company) => {
      contextPrompt += `### ${company.name}\n`;
      if (company.presentationSummary) {
        contextPrompt += `${company.presentationSummary}\n`;
      }
      if (company.mobilizedPeople?.length) {
        contextPrompt += `**Personnes mobilisées:**\n`;
        company.mobilizedPeople.forEach((person) => {
          contextPrompt += `- **${person.name}**`;
          if (person.cvSummary) {
            contextPrompt += ` - ${person.cvSummary}`;
          }
          contextPrompt += `\n`;
        });
      }
      contextPrompt += `\n`;
    });
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Tu es un expert en gestion de projet dans le domaine de l'architecture et du BTP.
Ton rôle est d'analyser les projets pour identifier les spécificités techniques,
les complexités et les enjeux qui influenceront la répartition des missions.

Réponds UNIQUEMENT au format JSON demandé, sans texte avant ou après.`,
    },
    {
      role: "user",
      content: `${contextPrompt}

Analyse ce projet et identifie:

1. **Type d'ouvrage** (rénovation, construction neuve, patrimoine, etc.)
2. **Complexités techniques principales** (structure, énergétique, accessibilité, etc.)
3. **Enjeux spécifiques** du projet
4. **Phases critiques** qui nécessiteront plus d'attention
5. **Contraintes réglementaires** importantes
6. **Technologies imposées** ou recommandées
7. **Compétences requises par mission** (pour chaque mission identifiée)

Format de réponse JSON:
{
  "buildingType": "type d'ouvrage",
  "technicalComplexities": ["complexité1", "complexité2"],
  "specificChallenges": ["enjeu1", "enjeu2"],
  "criticalPhases": ["phase1", "phase2"],
  "regulatoryConstraints": ["contrainte1", "contrainte2"],
  "mandatedTechnologies": ["techno1", "techno2"],
  "requiredSkillsByMission": {
    "mission-id": ["compétence1", "compétence2"]
  }
}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.3,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (content === null) {
    throw new Error("Contenu de l'analyse est null");
  }

  // Nettoyer le contenu pour s'assurer qu'il n'y a que du JSON
  const cleanedContent = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let result: ProjectAnalysis;
  try {
    result = JSON.parse(cleanedContent) as ProjectAnalysis;
  } catch (parseError) {
    console.error("Erreur de parsing JSON (étape 1):", parseError);
    console.error("Contenu reçu:", content);
    throw new Error(
      `Impossible de parser la réponse JSON de l'analyse: ${parseError}`,
    );
  }

  return result;
}

/**
 * Étape 2: Génération de la répartition budgétaire de base
 * sans prendre en compte les contraintes de prix imposées
 */
export async function generateBaseBudgetAllocation(
  project: Project,
  projectAnalysis: ProjectAnalysis,
): Promise<BaseBudgetAllocation> {
  const openai = createClient();

  const companies = project.participatingCompanies ?? [];
  const missionCategories = project.missions ?? {
    base: [],
    pse: [],
    tranchesConditionnelles: [],
    variantes: [],
  };

  const categoryPercentages = project.categoryPercentages ?? {};
  const worksAmount = project.worksAmount ?? 0;

  // Construction du contexte détaillé
  let contextPrompt = `# Répartition budgétaire pour mémoire technique

## Projet
- **Titre**: ${project.consultationTitle}
- **Montant des travaux**: ${worksAmount.toLocaleString()} € HT

## Analyse du projet
- **Type d'ouvrage**: ${projectAnalysis.buildingType}
- **Complexités techniques**: ${projectAnalysis.technicalComplexities.join(", ")}
- **Enjeux spécifiques**: ${projectAnalysis.specificChallenges.join(", ")}

## Pourcentages par catégorie
`;

  // Calculer les montants par catégorie
  Object.entries(categoryPercentages).forEach(([category, percentage]) => {
    const categoryAmount = (worksAmount * (percentage ?? 0)) / 100;
    contextPrompt += `- **${category}**: ${percentage}% = ${categoryAmount.toLocaleString()} € HT\n`;
  });

  contextPrompt += `
## Missions par catégorie
`;

  Object.entries(missionCategories).forEach(([categoryKey, missions]) => {
    if (missions.length > 0) {
      contextPrompt += `### ${categoryKey.toUpperCase()}\n`;
      missions.forEach(
        (mission: {
          id: string;
          name: string;
          sigle: string;
          description?: string;
        }) => {
          contextPrompt += `- **${mission.id}**: ${mission.sigle} - ${mission.name}\n`;
          if (mission.description) {
            contextPrompt += `  Description: ${mission.description}\n`;
          }
        },
      );
      contextPrompt += `\n`;
    }
  });

  contextPrompt += `
## Équipes mobilisées
`;

  companies.forEach((company) => {
    contextPrompt += `### ${company.name} (ID: ${company.id})\n`;
    (company.mobilizedPeople ?? []).forEach((person) => {
      contextPrompt += `- **${person.name}** (ID: ${person.id}) - ${person.dailyRate ?? 0} €/jour`;
      if (person.cvSummary) {
        contextPrompt += ` - ${person.cvSummary}`;
      }
      contextPrompt += `\n`;
    });
    contextPrompt += `\n`;
  });

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Tu es un expert en gestion budgétaire pour les marchés publics.
Ton rôle est de répartir les montants entre les missions et les intervenants
en tenant compte des compétences, des taux journaliers et des enjeux du projet.

Réponds UNIQUEMENT au format JSON demandé.`,
    },
    {
      role: "user",
      content: `${contextPrompt}

À partir de l'analyse du projet et des montants par catégorie, répartis le budget entre:
1. Les différentes missions de chaque catégorie
2. Les entreprises participantes pour chaque mission
3. Les personnes mobilisées avec un nombre de jours cohérent

RÈGLES DE RÉPARTITION:
- Respecter les pourcentages par catégorie
- Adapter les jours selon les taux journaliers
- Tenir compte des compétences requises par mission
- Privilégier les personnes les plus adaptées aux enjeux identifiés

Format JSON de réponse:
{
  "base": {
    "missions": [
      {
        "missionId": "mission-id",
        "totalAmount": montant,
        "companies": [
          {
            "companyId": "company-id", 
            "totalAmount": montant,
            "people": [
              {
                "personId": "person-id",
                "days": nombre_jours,
                "amount": montant
              }
            ]
          }
        ]
      }
    ]
  },
  "pse": { ... même structure ... },
  "tranchesConditionnelles": { ... même structure ... },
  "variantes": { ... même structure ... }
}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.2,
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content;
  if (content === null) {
    throw new Error("Contenu de la répartition budgétaire est null");
  }

  // Nettoyer le contenu pour s'assurer qu'il n'y a que du JSON
  const cleanedContent = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let result: BaseBudgetAllocation;
  try {
    result = JSON.parse(cleanedContent) as BaseBudgetAllocation;
  } catch (parseError) {
    console.error("Erreur de parsing JSON (étape 2):", parseError);
    console.error("Contenu reçu:", content);
    throw new Error(
      `Impossible de parser la réponse JSON de la répartition budgétaire: ${parseError}`,
    );
  }

  return result;
}

/**
 * Étape 3: Application des contraintes de prix imposées
 * et optimisation de la répartition en conséquence
 */
export function applyConstraintsAndOptimize(
  baseBudget: BaseBudgetAllocation,
  constraints: MissionPriceConstraint[],
): OptimizedBudgetAllocation {
  // Copie profonde pour éviter de modifier l'original
  const optimized: OptimizedBudgetAllocation = {
    ...JSON.parse(JSON.stringify(baseBudget)),
    appliedAdjustments: [],
  };

  // Appliquer chaque contrainte
  constraints.forEach((constraint) => {
    // Rechercher la mission dans toutes les catégories
    Object.values(optimized).forEach((category) => {
      if (!category || !category.missions) return;

      const mission = category.missions.find(
        (m: MissionAllocation) => m.missionId === constraint.missionId,
      );
      if (!mission) return;

      const company = mission.companies.find(
        (c: CompanyMissionAllocation) => c.companyId === constraint.companyId,
      );
      if (!company) return;

      // Calculer l'ajustement nécessaire
      const originalAmount = company.totalAmount;
      const adjustment = constraint.imposedAmount - originalAmount;

      // Appliquer l'ajustement
      company.totalAmount = constraint.imposedAmount;

      // Répartir proportionnellement l'ajustement sur les personnes
      if (company.people.length > 0) {
        const totalOriginalPeople = company.people.reduce(
          (sum: number, p: PersonAllocation) => sum + p.amount,
          0,
        );

        company.people.forEach((person: PersonAllocation) => {
          const ratio = person.amount / totalOriginalPeople;
          const personAdjustment = adjustment * ratio;
          person.amount += personAdjustment;

          // Recalculer les jours si on a le taux journalier
          // (cette partie pourrait être améliorée avec accès aux taux)
        });
      }

      // Mettre à jour le total de la mission
      mission.totalAmount = mission.companies.reduce(
        (sum: number, c: CompanyMissionAllocation) => sum + c.totalAmount,
        0,
      );

      // Enregistrer l'ajustement appliqué
      optimized.appliedAdjustments.push({
        missionId: constraint.missionId,
        companyId: constraint.companyId,
        originalAmount,
        constrainedAmount: constraint.imposedAmount,
        adjustment,
      });
    });
  });

  return optimized;
}

/**
 * Étape 4: Génération des justifications détaillées
 * pour chaque attribution de personne sur chaque mission
 */
export async function generateDetailedJustifications(
  allocation: OptimizedBudgetAllocation,
  projectAnalysis: ProjectAnalysis,
  project: Project,
): Promise<MissionEstimation> {
  const openai = createClient();

  const companies = project.participatingCompanies ?? [];
  const categoryPercentages = project.categoryPercentages ?? {};
  const worksAmount = project.worksAmount ?? 0;

  // Construction du contexte détaillé
  let contextPrompt = `# Génération de justifications pour mémoire technique

## Analyse du projet
- **Type d'ouvrage** : ${projectAnalysis.buildingType}
- **Complexités techniques** : ${projectAnalysis.technicalComplexities.join(", ")}
- **Enjeux spécifiques** : ${projectAnalysis.specificChallenges.join(", ")}
- **Phases critiques** : ${projectAnalysis.criticalPhases.join(", ")}
- **Contraintes réglementaires** : ${projectAnalysis.regulatoryConstraints.join(", ")}
- **Technologies imposées** : ${projectAnalysis.mandatedTechnologies.join(", ")}

## Pourcentages à respecter IMPÉRATIVEMENT
**CONTRAINTE ABSOLUE** : Les totaux par catégorie doivent respecter ces pourcentages du montant des travaux (${worksAmount.toLocaleString()} € HT) :
`;

  // Ajouter les pourcentages définis avec les montants correspondants
  Object.entries(categoryPercentages).forEach(([category, percentage]) => {
    if (percentage && percentage > 0) {
      const categoryAmount = (worksAmount * percentage) / 100;
      contextPrompt += `- **${category}** : ${percentage}% = ${categoryAmount.toLocaleString()} € HT (OBLIGATOIRE)\n`;
    }
  });

  contextPrompt += `
**IMPORTANT** : Le total des jours × taux journaliers par catégorie DOIT correspondre exactement à ces montants.

## Compétences requises par mission
`;

  Object.entries(projectAnalysis.requiredSkillsByMission).forEach(
    ([missionId, skills]) => {
      contextPrompt += `- **${missionId}** : ${skills.join(", ")}\n`;
    },
  );

  contextPrompt += `
## Équipes mobilisées
`;

  companies.forEach((company) => {
    contextPrompt += `### ${company.name}\n`;
    (company.mobilizedPeople ?? []).forEach((person) => {
      contextPrompt += `- **${person.name}** (${person.dailyRate ?? 0} €/j)`;
      if (person.cvSummary) {
        contextPrompt += ` - ${person.cvSummary}`;
      }
      contextPrompt += `\n`;
    });
    contextPrompt += `\n`;
  });

  contextPrompt += `
## Répartition établie
`;

  // Ajouter la répartition pour chaque catégorie
  Object.entries(allocation).forEach(([categoryName, category]) => {
    if (!category || categoryName === "appliedAdjustments") return;

    contextPrompt += `### ${categoryName.toUpperCase()}\n`;
    category.missions?.forEach((mission: MissionAllocation) => {
      contextPrompt += `#### Mission ${mission.missionId} (${mission.totalAmount.toLocaleString()} €)\n`;
      mission.companies.forEach((company: CompanyMissionAllocation) => {
        const companyData = companies.find((c) => c.id === company.companyId);
        contextPrompt += `- **${companyData?.name}** (${company.totalAmount.toLocaleString()} €)\n`;
        company.people.forEach((person: PersonAllocation) => {
          const personData = companyData?.mobilizedPeople?.find(
            (p) => p.id === person.personId,
          );
          contextPrompt += `  - ${personData?.name}: ${person.days} jours (${person.amount.toLocaleString()} €)\n`;
        });
      });
      contextPrompt += `\n`;
    });
  });

  // Ajouter les ajustements appliqués s'il y en a
  if (allocation.appliedAdjustments.length > 0) {
    contextPrompt += `
## Contraintes de prix appliquées
`;
    allocation.appliedAdjustments.forEach((adjustment) => {
      const companyData = companies.find((c) => c.id === adjustment.companyId);
      contextPrompt += `- Mission ${adjustment.missionId} par ${companyData?.name}: ajusté de ${adjustment.originalAmount.toLocaleString()} € à ${adjustment.constrainedAmount.toLocaleString()} € (${adjustment.adjustment > 0 ? "+" : ""}${adjustment.adjustment.toLocaleString()} €)\n`;
    });
  }

  const systemPrompt = `Tu es un expert en rédaction de mémoires techniques pour les marchés publics.
Ta mission est de générer des justifications détaillées et professionnelles pour chaque attribution de jours,
en t'appuyant sur l'analyse du projet et les spécificités techniques identifiées.

CONTRAINTE BUDGÉTAIRE ABSOLUE :
- Tu DOIS respecter exactement les pourcentages par catégorie définis dans le projet
- Si les montants calculés (jours × taux journaliers) ne correspondent pas aux pourcentages, tu DOIS ajuster le nombre de jours
- Cette contrainte est PRIORITAIRE sur toute autre considération

CRITÈRES POUR UNE BONNE JUSTIFICATION :
- Mentionner les aspects spécifiques du projet (type d'ouvrage, contraintes, complexités)
- Expliquer pourquoi cette personne est pertinente pour cette mission précise
- Faire référence aux compétences techniques requises
- Justifier le nombre de jours par rapport aux enjeux identifiés ET aux contraintes budgétaires
- Utiliser un vocabulaire professionnel adapté à un jury d'appel d'offres
- Éviter les généralités et les formulations creuses

Réponds UNIQUEMENT au format JSON demandé.`;

  const userPrompt = `${contextPrompt}

À partir de cette répartition et de l'analyse du projet, génère des justifications détaillées et spécifiques pour chaque attribution.

**CONTRAINTE PRIORITAIRE** : Les totaux par catégorie doivent IMPÉRATIVEMENT respecter les pourcentages définis ci-dessus. Ajuste le nombre de jours si nécessaire pour que les montants correspondent exactement.

Chaque justification doit :
1. Faire référence aux spécificités du projet identifiées dans l'analyse
2. Expliquer concrètement pourquoi cette personne est adaptée à cette mission
3. Mentionner les aspects techniques ou méthodologiques particuliers
4. Justifier le volume de jours par rapport à la complexité identifiée ET aux contraintes budgétaires
5. Utiliser le nom complet de la personne dans la justification (pas de familiarités)

RÈGLE CRUCIALE POUR LES CLÉS JSON :
- Utilise UNIQUEMENT les IDs fournis dans les correspondances ci-dessous
- Ne jamais utiliser les noms comme clés JSON
- Exemple : utilise l'ID de l'entreprise au lieu de "Cabinet d'architecture DEMETRESCU"
- Exemple : utilise l'ID de la personne au lieu de "Suzana DEMETRESCU"

RÈGLE BUDGÉTAIRE ABSOLUE :
- Vérifie que la somme des montants (jours × taux journaliers) par catégorie respecte exactement les pourcentages définis
- Si nécessaire, ajuste le nombre de jours pour respecter cette contrainte

CORRESPONDANCES DES IDS :
## Missions par catégorie
${Object.entries(project.missions || {})
  .map(
    ([categoryKey, missions]) =>
      `### ${categoryKey.toUpperCase()}\n` +
      missions
        .map((m: { id: string; name: string }) => `- ${m.id}: "${m.name}"`)
        .join("\n"),
  )
  .join("\n")}

## Entreprises et personnes
${companies
  .map(
    (company) =>
      `### ${company.id}: "${company.name}"\n` +
      (company.mobilizedPeople || [])
        .map((person) => `- ${person.id}: "${person.name}"`)
        .join("\n"),
  )
  .join("\n")}

IMPORTANT : Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après.

Format JSON attendu avec les clés EXACTES :
{
  "base": {
    "missionId": {
      "companyId": {
        "personId": {
          "nombreDeJours": nombre,
          "justification": "justification détaillée et spécifique"
        }
      }
    }
  },
  "pse": { ... même structure ... },
  "tranchesConditionnelles": { ... même structure ... },
  "variantes": { ... même structure ... }
}

ATTENTION : Utilise "base" et "pse" (en minuscules), PAS "BASE" ou "PSE".`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.4,
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (content === null) {
    throw new Error("Contenu des justifications est null");
  }

  // Nettoyer le contenu pour s'assurer qu'il n'y a que du JSON
  const cleanedContent = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let result: MissionEstimation;
  try {
    result = JSON.parse(cleanedContent) as MissionEstimation;
  } catch (parseError) {
    console.error("Erreur de parsing JSON (étape 4):", parseError);
    console.error("Contenu reçu:", content);
    throw new Error(
      `Impossible de parser la réponse JSON des justifications: ${parseError}`,
    );
  }

  // Validation basique de la structure
  if (!result || typeof result !== "object") {
    throw new Error("La réponse n'est pas un objet JSON valide");
  }

  // Normaliser les clés des catégories pour correspondre au type MissionEstimation
  const normalizedResult: MissionEstimation = {
    base: {},
    pse: {},
    tranchesConditionnelles: {},
    variantes: {},
  };

  // Mapper les clés possibles de l'IA vers les clés attendues
  const keyMapping: Record<string, keyof MissionEstimation> = {
    BASE: "base",
    base: "base",
    PSE: "pse",
    pse: "pse",
    TRANCHES_CONDITIONNELLES: "tranchesConditionnelles",
    tranchesConditionnelles: "tranchesConditionnelles",
    VARIANTES: "variantes",
    variantes: "variantes",
  };

  // Transférer les données en normalisant les clés
  for (const [aiKey, missions] of Object.entries(result)) {
    const normalizedKey = keyMapping[aiKey];
    if (normalizedKey && missions && typeof missions === "object") {
      // Nettoyer les données en supprimant les clés "undefined"
      const cleanedMissions = cleanMissionData(missions);
      normalizedResult[normalizedKey] =
        cleanedMissions as MissionEstimation[keyof MissionEstimation];
    }
  }

  // Enregistrer dans l'historique IA
  useIAHistoryStore.getState().addEntry({
    timestamp: Date.now(),
    messages: messages,
    response: normalizedResult,
    context: "generateDetailedJustifications",
  });

  return normalizedResult;
}

/**
 * Nettoie les données de mission en supprimant les clés "undefined" et en validant la structure
 */
function cleanMissionData(
  missions: Record<string, unknown>,
): Record<string, unknown> {
  const cleaned: Record<
    string,
    Record<
      string,
      Record<string, { nombreDeJours: number; justification: string }>
    >
  > = {};

  for (const [missionId, missionData] of Object.entries(missions)) {
    if (missionData && typeof missionData === "object") {
      cleaned[missionId] = {};

      for (const [companyId, companyData] of Object.entries(
        missionData as Record<string, unknown>,
      )) {
        if (companyData && typeof companyData === "object") {
          cleaned[missionId][companyId] = {};

          for (const [personId, personData] of Object.entries(
            companyData as Record<string, unknown>,
          )) {
            // Ignorer les clés "undefined" ou vides
            if (
              personId &&
              personId !== "undefined" &&
              personData &&
              typeof personData === "object"
            ) {
              const person = personData as Record<string, unknown>;
              if (person.nombreDeJours && person.justification) {
                cleaned[missionId][companyId][personId] = {
                  nombreDeJours: Number(person.nombreDeJours),
                  justification: String(person.justification),
                };
              }
            }
          }

          // Supprimer les entreprises vides
          if (Object.keys(cleaned[missionId][companyId]).length === 0) {
            delete cleaned[missionId][companyId];
          }
        }
      }

      // Supprimer les missions vides
      if (Object.keys(cleaned[missionId]).length === 0) {
        delete cleaned[missionId];
      }
    }
  }

  return cleaned;
}

/**
 * Étape 5: Validation et correction automatique des pourcentages
 * pour s'assurer que le résultat respecte exactement les contraintes
 */
export function validateAndAdjustPercentages(
  estimation: MissionEstimation,
  project: Project,
): MissionEstimation {
  const categoryPercentages = project.categoryPercentages ?? {};
  const worksAmount = project.worksAmount ?? 0;
  const companies = project.participatingCompanies ?? [];

  console.log("🔧 Validation et ajustement des pourcentages...");

  // Calculer les totaux actuels par catégorie
  const actualTotals: Record<string, number> = {};

  Object.entries(estimation).forEach(([categoryKey, categoryData]) => {
    if (!categoryData || typeof categoryData !== "object") return;

    let categoryTotal = 0;

    Object.entries(categoryData).forEach(([, missionData]) => {
      if (!missionData || typeof missionData !== "object") return;

      Object.entries(missionData).forEach(([companyId, companyData]) => {
        if (!companyData || typeof companyData !== "object") return;

        Object.entries(companyData).forEach(([personId, personData]) => {
          if (personData && typeof personData === "object") {
            const person = personData as {
              nombreDeJours: number;
              justification: string;
            };

            // Trouver le taux journalier de cette personne
            const company = companies.find((c) => c.id === companyId);
            const personDetails = company?.mobilizedPeople?.find(
              (p) => p.id === personId,
            );
            const dailyRate = personDetails?.dailyRate ?? 0;

            categoryTotal += person.nombreDeJours * dailyRate;
          }
        });
      });
    });

    actualTotals[categoryKey] = categoryTotal;
  });

  // Calculer les totaux attendus
  const expectedTotals: Record<string, number> = {};
  Object.entries(categoryPercentages).forEach(([category, percentage]) => {
    if (percentage && percentage > 0) {
      expectedTotals[category] = (worksAmount * percentage) / 100;
    }
  });

  // Afficher les écarts détectés
  console.log("📊 Analyse des écarts:");
  Object.entries(expectedTotals).forEach(([category, expectedAmount]) => {
    const actualAmount = actualTotals[category] ?? 0;
    const difference = actualAmount - expectedAmount;
    const percentageDiff =
      expectedAmount > 0 ? (difference / expectedAmount) * 100 : 0;

    console.log(
      `  - ${category}: ${actualAmount.toLocaleString()}€ (attendu: ${expectedAmount.toLocaleString()}€) - Écart: ${percentageDiff.toFixed(1)}%`,
    );
  });

  // Si les écarts sont acceptables (< 2%), on garde l'estimation actuelle
  const hasSignificantDeviation = Object.entries(expectedTotals).some(
    ([category, expectedAmount]) => {
      const actualAmount = actualTotals[category] ?? 0;
      const percentageDiff =
        expectedAmount > 0
          ? (Math.abs(actualAmount - expectedAmount) / expectedAmount) * 100
          : 0;
      return percentageDiff > 2;
    },
  );

  if (!hasSignificantDeviation) {
    console.log("✅ Écarts acceptables, pas d'ajustement nécessaire");
    return estimation;
  }

  console.log("⚠️ Écarts significatifs détectés, ajustement automatique...");

  // Créer une copie pour ajustement
  const adjustedEstimation: MissionEstimation = JSON.parse(
    JSON.stringify(estimation),
  );

  // Ajuster proportionnellement chaque catégorie
  Object.entries(expectedTotals).forEach(([categoryKey, expectedAmount]) => {
    const actualAmount = actualTotals[categoryKey] ?? 0;

    if (
      actualAmount > 0 &&
      Math.abs(actualAmount - expectedAmount) / expectedAmount > 0.02
    ) {
      const adjustmentRatio = expectedAmount / actualAmount;

      console.log(
        `  🔧 Ajustement de ${categoryKey}: ratio ${adjustmentRatio.toFixed(3)}`,
      );

      // Appliquer le ratio à toutes les personnes de cette catégorie
      const categoryData =
        adjustedEstimation[categoryKey as keyof MissionEstimation];
      if (categoryData && typeof categoryData === "object") {
        Object.entries(categoryData).forEach(([, missionData]) => {
          if (!missionData || typeof missionData !== "object") return;

          Object.entries(missionData).forEach(([, companyData]) => {
            if (!companyData || typeof companyData !== "object") return;

            Object.entries(companyData).forEach(([, personData]) => {
              if (personData && typeof personData === "object") {
                const person = personData as {
                  nombreDeJours: number;
                  justification: string;
                };
                const adjustedDays = Math.round(
                  person.nombreDeJours * adjustmentRatio,
                );

                // Mettre à jour le nombre de jours et ajouter une note dans la justification
                person.nombreDeJours = Math.max(1, adjustedDays);

                const categoryPercentage =
                  categoryPercentages[
                    categoryKey as keyof typeof categoryPercentages
                  ];
                if (
                  !person.justification.includes("[Ajusté automatiquement]") &&
                  categoryPercentage
                ) {
                  person.justification += ` [Ajusté automatiquement pour respecter le pourcentage de ${categoryPercentage}% de la catégorie ${categoryKey}]`;
                }
              }
            });
          });
        });
      }
    }
  });

  console.log("✅ Ajustement automatique terminé");
  return adjustedEstimation;
}

/**
 * Pipeline principal : nouvelle version de estimateMissionDaysWithCategories
 * utilisant l'approche en 5 étapes séquentielles
 */
export async function estimateMissionDaysWithCategoriesPipeline(
  project: Project,
): Promise<MissionEstimation> {
  try {
    // Étape 1: Analyser le projet pour identifier les spécificités
    console.log("🔍 Étape 1/5: Analyse du projet...");
    const projectAnalysis = await analyzeProjectSpecifics(project);

    // Étape 2: Générer la répartition budgétaire de base
    console.log("💰 Étape 2/5: Génération de la répartition budgétaire...");
    const baseBudget = await generateBaseBudgetAllocation(
      project,
      projectAnalysis,
    );

    // Étape 3: Appliquer les contraintes de prix imposées
    console.log("⚖️ Étape 3/5: Application des contraintes...");
    const constraints = project.missionPriceConstraints ?? [];
    const optimizedBudget = applyConstraintsAndOptimize(
      baseBudget,
      constraints,
    );

    // Étape 4: Générer les justifications détaillées
    console.log("✍️ Étape 4/5: Génération des justifications...");
    const aiEstimation = await generateDetailedJustifications(
      optimizedBudget,
      projectAnalysis,
      project,
    );

    // Étape 5: Validation et ajustement automatique des pourcentages
    console.log("🔧 Étape 5/5: Validation et ajustement des pourcentages...");
    const finalEstimation = validateAndAdjustPercentages(aiEstimation, project);

    console.log("✅ Pipeline terminé avec succès");
    return finalEstimation;
  } catch (error) {
    console.error("❌ Erreur dans le pipeline d'estimation:", error);
    throw error;
  }
}
