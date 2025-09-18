import summarize from "./OpenAI/summarize";

/**
 * Identifie le prénom et le nom de famille dans un nom complet
 * @param fullName Le nom complet de la personne
 * @returns Un objet avec firstName et lastName identifiés
 */
function parseFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    // Si un seul mot, on considère que c'est le prénom
    return {
      firstName: parts[0],
      lastName: "",
    };
  }

  if (parts.length === 2) {
    // Cas classique : prénom nom
    return {
      firstName: parts[0],
      lastName: parts[1],
    };
  }

  // Si plus de 2 mots, on considère le premier comme prénom et le reste comme nom de famille
  const [firstName, ...lastNameParts] = parts;
  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
}

/**
 * Formate un nom avec le prénom en forme correcte (Première lettre majuscule)
 * et le nom de famille en MAJUSCULES
 * @param firstName Le prénom à formater
 * @param lastName Le nom de famille à formater
 * @returns Le nom formaté selon les règles demandées
 */
function formatName(firstName: string, lastName: string): string {
  const formattedFirstName = firstName
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());

  const formattedLastName = lastName.toUpperCase();

  return `${formattedFirstName} ${formattedLastName}`.trim();
}

/**
 * Extrait et formate un nom depuis un texte en respectant les conventions :
 * - Prénom : première lettre majuscule, le reste en minuscules
 * - Nom de famille : entièrement en MAJUSCULES
 * @param text Le texte contenant potentiellement un nom
 * @returns Le nom formaté ou undefined si aucun nom trouvé
 */
function extractAndFormatName(text: string): string | undefined {
  // Pattern pour capturer des noms français avec accents
  const nameMatch = text.match(
    /([A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ][a-zàâäéèêëïîôöùûüç]+(?:\s+[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ][a-zàâäéèêëïîôöùûüç]+)*)/,
  );

  if (!nameMatch) {
    return undefined;
  }

  const fullName = nameMatch[1];
  const { firstName, lastName } = parseFullName(fullName);

  if (!firstName) {
    return undefined;
  }

  return formatName(firstName, lastName);
}

/**
 * Résume un CV en français courant, bien structuré, d'environ 100 mots, avec des phrases claires et compréhensibles.
 * Extrait également le nom depuis la première ligne du résumé si possible.
 */
export async function parseMobilizedPersonCV(cvText: string): Promise<{
  summary: string;
  name?: string;
}> {
  const prompt = `Résumé en français courant, bien structuré, d'environ 100 mots, avec des phrases compréhensibles et reformattées. Utilise des phrases claires et une structure logique. Voici le CV :\n${cvText}`;
  const summary = await summarize(prompt, 100);

  // Extraire et formater le nom depuis le résumé (première ligne souvent)
  const firstLine = summary.split("\n")[0];
  const name = extractAndFormatName(firstLine);

  return { summary, name };
}
