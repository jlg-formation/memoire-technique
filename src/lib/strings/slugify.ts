// Génère un slug lisible à partir d'un nom
// Ex: "Jean Dupont & Fils" => "jean-dupont-fils"
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // remplace tout sauf lettres/chiffres par tiret
    .replace(/^-+|-+$/g, "") // retire les tirets en début/fin
    .replace(/--+/g, "-"); // retire les doubles tirets
}

// Génère un slug unique dans une liste existante
export function uniqueSlug(base: string, existing: string[]): string {
  const slug = slugify(base);
  let suffix = 1;
  let candidate = slug;
  while (existing.includes(candidate)) {
    candidate = `${slug}-${suffix++}`;
  }
  return candidate;
}
