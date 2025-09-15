// Extraction du nom pur de l'entreprise
export function extractCompanyName(text: string): string {
  // Prend la première ligne et coupe avant les mots-clés
  const firstLine = text.split("\n")[0];
  // Regex pour couper avant "fondé", "créé", "situé", etc.
  const match = firstLine.match(
    /^(.*?)(\s*(fond[ée]|cré[ée]|situ[ée]|install[ée]|depuis|depuis le|depuis l'année|création|établi|établie|établie à|établi à|basé|basée|basée à|basé à|localisé|localisée|localisé à|localisée à|en activité|depuis\s+\d{4}|\d{4}))/i,
  );
  if (match && match[1]) {
    return match[1].replace(/[.,;:!?"'()[\]{}<>]/g, "").trim();
  }
  // Sinon, retourne la première phrase jusqu'au premier point
  const dotIdx = firstLine.indexOf(".");
  if (dotIdx > 0)
    return firstLine
      .slice(0, dotIdx)
      .replace(/[.,;:!?"'()[\]{}<>]/g, "")
      .trim();
  return firstLine.replace(/[.,;:!?"'()[\]{}<>]/g, "").trim();
}
