# GitHub Copilot Refactoring Guide

Ce document complète **copilot-instructions.md**.  
Il définit les règles de **refactoring automatique** que Copilot doit appliquer sur du code existant afin de le rendre conforme au style du projet.

---

## 1. Control Flow

- Supprimer le **arrow code** (pyramide d’indentation).
- Utiliser des **guard clauses (early return)** pour gérer les cas secondaires au début des fonctions.
- Réduire au minimum les niveaux d’imbrication (`if`, `else`, `try`).
- Un bloc de contrôle = une seule responsabilité.

---

## 2. Loops

- Remplacer `.forEach()` par `for...of`.
- Utiliser `.map`, `.filter`, `.reduce` uniquement pour la transformation pure.
- Jamais de promesses dans `.forEach()` → transformer en `for...of` avec `await`.

---

## 3. Error Handling

- Encadrer toutes les opérations async avec `try/catch`.
- Ajouter un logger avec contexte si une erreur est catchée.
- Supprimer les échecs silencieux → toujours un `throw` ou un log clair.

---

## 4. TypeScript

- Supprimer tous les `any` → types explicites obligatoires.
- Pas de `null`, utiliser `undefined` si absence de valeur.
- Remplacer les unions `T | undefined` par `T` + `throw` en cas d’absence.
- Utiliser `Zod` pour valider les données entrantes (API, formulaire, etc.).

---

## 5. Imports and Modules

- Supprimer toute syntaxe CommonJS (`require`, `module.exports`).
- Utiliser uniquement ESM (`import` / `export`).
- Réordonner les imports : externes → internes → relatifs.
- Remplacer les chemins relatifs longs (`../../utils/foo`) par des alias (`@/utils/foo`).

---

## 6. React

- Extraire les composants internes dans leur propre fichier.
- Pas de fonctions anonymes inline dans les props → utiliser `useCallback`.
- Props booléennes renommées avec préfixe (`is/has/can/should`).
- Un seul composant React par fichier.

---

## 7. Styling

- Supprimer les **SVG inline** (`<svg>…</svg>`) → remplacer par Lucide React.
- Remplacer les caractères emoji par des icônes Lucide React (sauf dans du texte ou tests rapides).
- Pas de styles inline → uniquement Tailwind v4.
- Extraire le style récurrent dans des composants dédiés.

---

## 8. Testing

- Supprimer les snapshot tests aveugles → préférer des assertions ciblées.
- Ajouter des tests pour erreurs et edge cases manquants.
- Vérifier l’accessibilité avec `axe` / `jest-axe`.

---

## 9. Documentation and Comments

- Supprimer les commentaires redondants qui expliquent “quoi”.
- Garder uniquement les commentaires expliquant **pourquoi** (WHY).
- Ajouter JSDoc sur la logique complexe ou les API exposées.
- Compléter les TODO/FIXME avec un ticket associé (`// TODO(#123)`).

---

## 10. Performance

- Remplacer les optimisations inutiles (`useMemo`, `useCallback`, `React.memo` non justifiés).
- Garder uniquement celles qui réduisent un re-render prouvé.
- Supprimer le code mort ou non utilisé.

---

## 11. Security

- Retirer toute utilisation de `eval` ou de code dynamique dangereux.
- Supprimer les secrets codés en dur → utiliser des varia
