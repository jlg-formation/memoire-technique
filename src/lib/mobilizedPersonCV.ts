import summarize from "./OpenAI/summarize";

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
  // Extraire le nom depuis le résumé (première ligne souvent)
  const firstLine = summary.split("\n")[0];
  const nameMatch = firstLine.match(
    /^([A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ][a-zàâäéèêëïîôöùûüç]+ [A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ][a-zàâäéèêëïîôöùûüç]+)/,
  );
  const name = nameMatch ? nameMatch[1] : undefined;
  return { summary, name };
}
